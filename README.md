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
