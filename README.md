# SatyaLens — AI-powered, evidence-based fact verification

Paste a claim → live web research runs in front of you → an auditable report
with verdict, confidence, quoted evidence and original source links.

- **No database. No accounts. Nothing persisted.** Every verification is independent and ephemeral.
- Verdicts come only from evidence retrieved during the run. If providers fail, the app says so — it never fabricates a report.
- API keys live only in the server layer.

## Stack

React + TypeScript + Vite + Tailwind CSS (frontend) · Express + SSE (API layer) ·
any OpenAI-compatible chat API · Tavily or Brave Search.

## Setup

```bash
npm install
cp .env.example .env   # add your keys
npm run dev            # web on :5173, API on :8787
```

Without `AI_API_KEY` / `SEARCH_API_KEY` the app runs but verification is
refused with a clear configuration notice (by design).

## Production

```bash
npm run build
npm start   # Express serves dist/ + /api
```

## Deploy

**Backend (Render)** — set these in the service's Environment tab, not in a
committed `.env`:

```
AI_API_KEY=…            AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=openai/gpt-oss-120b
SEARCH_PROVIDER=tavily  SEARCH_API_KEY=…
```

Build command `npm install --include=dev && npm run build`, start command
`npm start`. The API sends permissive CORS headers, so a separately hosted
frontend can call it.

Groq's free tier caps `openai/gpt-oss-120b` at 200k tokens per day
(and 8k per minute). Each verification spends roughly 4–6k tokens, so a heavy
testing day can exhaust the daily budget; the API then reports that plainly.
The service waits out per-minute limits (honoring the provider's retry hint)
and reports the daily limit without burning retries. For sustained use, add
billing to Groq or point `AI_MODEL` at a model with a separate quota.

**Frontend** — set `VITE_API_BASE_URL` to the API origin at build time
(e.g. `https://satyalens-r9kj.onrender.com`). Leave it empty when the frontend
is served from the same origin as the API.

## Pipeline

1. Understand the statement (LLM, no truth decisions)
2. Extract atomic verifiable claims + search queries
3. Live web search (Tavily/Brave), deduplicated, tiered
4. Fetch & read pages (robots.txt respected; snippet-only disclosed)
5. Evaluate evidence per source (verbatim quotes only)
6. Compare findings, count independent publishers
7. Verdict: SUPPORTED / CONTRADICTED / INSUFFICIENT EVIDENCE + full report

Retrieved pages are treated as untrusted data — prompt-injection text in a
source cannot influence the pipeline.
