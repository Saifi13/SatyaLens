import express from "express";
import path from "node:path";
import fs from "node:fs";
import { config, missingConfig } from "./config";
import { runVerification, PipelineError } from "./pipeline";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

// Privacy: nothing here persists beyond the request. No DB, no logs of payloads.
app.get("/api/health", (_req, res) => {
  const missing = missingConfig();
  res.json({
    configured: missing.length === 0,
    missing,
    searchProvider: config.search.provider,
    aiModel: config.ai.apiKey ? config.ai.model : null,
  });
});

app.post("/api/verify", async (req, res) => {
  const claim = typeof req.body?.claim === "string" ? req.body.claim.trim() : "";
  if (claim.length < 10) {
    return res
      .status(400)
      .json({ error: "CLAIM_TOO_SHORT", message: "Enter a claim of at least 10 characters." });
  }
  if (claim.length > 2000) {
    return res
      .status(400)
      .json({ error: "CLAIM_TOO_LONG", message: "Claims must be 2000 characters or fewer." });
  }
  const missing = missingConfig();
  if (missing.length > 0) {
    return res.status(503).json({
      error: "CONFIG_MISSING",
      message: `SatyaLens is not configured yet. Set ${missing.join(" and ")} in a .env file. No verification is performed without live providers — results are never fabricated.`,
      missing,
    });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("retry: 3000\n\n");

  let closed = false;
  res.on("close", () => {
    if (!res.writableEnded) closed = true;
  });
  const ping = setInterval(() => {
    if (!closed) res.write(": ping\n\n");
  }, 12_000);

  try {
    for await (const event of runVerification(claim)) {
      if (closed) break;
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  } catch (err) {
    const message =
      err instanceof PipelineError
        ? err.message
        : "Verification failed unexpectedly. No result is fabricated in its place.";
    const code = err instanceof PipelineError ? err.code : "INTERNAL";
    if (!closed) {
      res.write(
        `data: ${JSON.stringify({ type: "error", data: { code, message } })}\n\n`
      );
    }
  } finally {
    clearInterval(ping);
    if (!closed) res.write("data: [DONE]\n\n");
    res.end();
  }
});

const lifecycle = process.env.npm_lifecycle_event;
if (
  process.env.NODE_ENV === "production" ||
  lifecycle === "start" ||
  lifecycle === "preview"
) {
  const dist = path.resolve(process.cwd(), "dist");
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.join(dist, "index.html"));
    });
  }
}

app.listen(config.port, () => {
  const missing = missingConfig();
  console.log(
    `[satyalens-api] listening on :${config.port}` +
      (missing.length ? ` — awaiting configuration: ${missing.join(", ")}` : "")
  );
});
