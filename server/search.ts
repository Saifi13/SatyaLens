import { config } from "./config";

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  publishedAt?: string;
}

export class SearchError extends Error {}

const SEARCH_TIMEOUT_MS = 12_000;
const MAX_RESULTS = 5;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function tavily(query: string): Promise<SearchResult[]> {
  let lastStatus = 0;
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.search.apiKey}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: MAX_RESULTS,
        include_answer: false,
        topic: "general",
      }),
      signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
    });
    lastStatus = res.status;
    if (res.ok) {
      const data = (await res.json()) as {
        results?: {
          url: string;
          title: string;
          content: string;
          published_date?: string;
        }[];
      };
      return (data.results ?? []).map((r) => ({
        url: r.url,
        title: r.title || hostname(r.url),
        snippet: r.content ?? "",
        publishedAt: r.published_date || undefined,
      }));
    }
    if ((res.status === 429 || res.status >= 500) && attempt === 0) {
      await sleep(res.status === 429 ? 1000 : 500);
      continue;
    }
    throw new SearchError(`Tavily returned ${res.status}`);
  }
  throw new SearchError(`Tavily returned ${lastStatus}`);
}

async function brave(query: string): Promise<SearchResult[]> {
  let lastStatus = 0;
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web.search?q=${encodeURIComponent(
        query
      )}&count=${MAX_RESULTS}&extra_snippets=true`,
      {
        headers: {
          "X-Subscription-Token": config.search.apiKey,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
      }
    );
    lastStatus = res.status;
    if (res.ok) {
      const data = (await res.json()) as {
        web?: {
          results?: {
            url: string;
            title: string;
            description: string;
            extra_snippets?: string[];
            page_age?: string;
          }[];
        };
      };
      return (data.web?.results ?? []).map((r) => ({
        url: r.url,
        title: r.title || hostname(r.url),
        snippet: [r.description, ...(r.extra_snippets ?? [])]
          .filter(Boolean)
          .join(" … "),
        publishedAt: r.page_age || undefined,
      }));
    }
    if ((res.status === 429 || res.status >= 500) && attempt === 0) {
      await sleep(res.status === 429 ? 1000 : 500);
      continue;
    }
    throw new SearchError(`Brave Search returned ${res.status}`);
  }
  throw new SearchError(`Brave Search returned ${lastStatus}`);
}

export async function webSearch(query: string): Promise<SearchResult[]> {
  if (config.search.provider === "brave") return brave(query);
  return tavily(query);
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
