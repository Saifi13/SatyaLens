import { config } from "./config";

export class LlmError extends Error {
  constructor(message: string, readonly fatal = true) {
    super(message);
    this.name = "LlmError";
  }
}

interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

const LLM_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [2_000, 7_000];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function retryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function waitFor(status: number, res: Response, attempt: number): number {
  const retryAfter = Number(res.headers.get("retry-after"));
  if (status === 429 && Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter * 1000, 30_000);
  }
  return BACKOFF_MS[attempt] ?? 7_000;
}

function describe(status: number, raw: string): string {
  if (status === 429) {
    return "The AI provider is rate-limiting requests right now. Wait a minute, then retry the verification.";
  }
  if (status === 401 || status === 403) {
    return `The AI provider rejected the API key (HTTP ${status}). Check AI_API_KEY and AI_BASE_URL.`;
  }
  const detail = raw.replace(/\s+/g, " ").slice(0, 160);
  return `AI provider returned ${status}${detail ? `: ${detail}` : ""}`;
}

function request(messages: { role: string; content: string }[], body: Record<string, unknown>) {
  return fetch(`${config.ai.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.ai.apiKey}`,
    },
    body: JSON.stringify({ ...body, messages }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });
}

async function chatOnce(
  messages: { role: string; content: string }[],
  opts: ChatOptions
): Promise<string> {
  const base: Record<string, unknown> = {
    model: config.ai.model,
    temperature: opts.temperature ?? 0.2,
    max_tokens: opts.maxTokens ?? 1600,
  };
  const body = opts.json
    ? { ...base, response_format: { type: "json_object" } }
    : base;

  let lastError = "";
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let res: Response;
    try {
      res = await request(messages, body);
    } catch (err) {
      const name = (err as Error).name;
      lastError =
        name === "TimeoutError" || name === "AbortError"
          ? "The AI provider did not respond in time."
          : "The AI provider could not be reached.";
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(BACKOFF_MS[attempt]);
        continue;
      }
      throw new LlmError(lastError);
    }

    // Some OpenAI-compatible providers reject response_format; retry without it.
    if (res.status === 400 && opts.json && "response_format" in body) {
      const retry = await request(messages, base);
      if (retry.ok) return text(retry);
      if (retryableStatus(retry.status) && attempt < MAX_ATTEMPTS - 1) {
        await sleep(waitFor(retry.status, retry, attempt));
        continue;
      }
      throw new LlmError(describe(retry.status, await retry.text().catch(() => "")));
    }

    if (res.ok) return text(res);
    if (retryableStatus(res.status) && attempt < MAX_ATTEMPTS - 1) {
      await sleep(waitFor(res.status, res, attempt));
      continue;
    }

    throw new LlmError(describe(res.status, await res.text().catch(() => "")));
  }
  throw new LlmError(lastError || "AI provider request failed");
}

async function text(res: Response): Promise<string> {
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const out = data.choices?.[0]?.message?.content;
  if (!out) throw new LlmError("AI provider returned an empty completion");
  return out;
}

function extractJson(raw: string): unknown {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new LlmError("AI response did not contain a JSON object");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

export async function chatJSON<T>(
  system: string,
  user: string,
  opts: ChatOptions = {}
): Promise<T> {
  const raw = await chatOnce(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { ...opts, json: true }
  );
  try {
    return extractJson(raw) as T;
  } catch {
    throw new LlmError("Could not parse a JSON object from the AI response");
  }
}
