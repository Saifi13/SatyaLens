import fs from "node:fs";
import path from "node:path";

try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) process.loadEnvFile(envPath);
} catch {
  // .env is optional; missing keys are surfaced as a configuration error
}

export const config = {
  port: Number(process.env.PORT ?? 8787),
  ai: {
    apiKey: process.env.AI_API_KEY ?? "",
    baseUrl: (process.env.AI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, ""),
    model: process.env.AI_MODEL ?? "gpt-4o-mini",
  },
  search: {
    provider: (process.env.SEARCH_PROVIDER ?? "tavily") as "tavily" | "brave",
    apiKey: process.env.SEARCH_API_KEY ?? "",
  },
};

export function missingConfig(): string[] {
  const missing: string[] = [];
  if (!config.ai.apiKey) missing.push("AI_API_KEY");
  if (!config.search.apiKey) missing.push("SEARCH_API_KEY");
  return missing;
}
