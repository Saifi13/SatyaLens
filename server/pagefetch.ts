import { htmlToText } from "html-to-text";

const UA =
  "SatyaLensBot/1.0 (+research tool; respects robots.txt; contact: self-hosted)";

const robotsCache = new Map<string, Promise<boolean>>();

async function allowedByRobots(url: URL): Promise<boolean> {
  const key = url.origin;
  let p = robotsCache.get(key);
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(`${key}/robots.txt`, {
          headers: { "User-Agent": UA },
          signal: AbortSignal.timeout(2500),
        });
        if (!res.ok) return true;
        const text = (await res.text()).toLowerCase();
        let applies = false;
        let sawDisallowAll = false;
        for (const line of text.split(/\r?\n/)) {
          const l = line.trim();
          if (l.startsWith("user-agent:")) {
            const v = l.slice(11).trim();
            applies = v === "*";
          } else if (applies && l.startsWith("disallow:") && l.slice(9).trim() !== "") {
            const path = l.slice(9).trim();
            if (path === "/") sawDisallowAll = true;
            else if (url.pathname.startsWith(path)) return false;
          }
        }
        return !sawDisallowAll;
      } catch {
        return true;
      }
    })();
    robotsCache.set(key, p);
  }
  return p;
}

export interface PageContent {
  ok: boolean;
  text: string;
  reason?: string;
}

export async function readPage(url: string): Promise<PageContent> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, text: "", reason: "invalid URL" };
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return { ok: false, text: "", reason: "unsupported protocol" };
  }
  if (!(await allowedByRobots(parsed))) {
    return { ok: false, text: "", reason: "disallowed by robots.txt" };
  }
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return { ok: false, text: "", reason: `HTTP ${res.status}` };
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("html") && !type.includes("text")) {
      return { ok: false, text: "", reason: "not an HTML page" };
    }
    const body = (await res.text()).slice(0, 400_000);
    const text = htmlToText(body, {
      selectors: [
        ...["script", "style", "noscript", "nav", "footer", "header", "iframe", "svg", "form"].map(
          (selector) => ({ selector, format: "skip" })
        ),
        { selector: "a", format: "anchor", options: { ignoreHref: true } },
      ],
      wordwrap: 130,
    })
      .replace(/[ \t]+/g, " ")
      .replace(/\n{2,}/g, "\n")
      .trim();
    if (text.length < 120) {
      return { ok: false, text: "", reason: "page had little readable text" };
    }
    return { ok: true, text: text.slice(0, 3500) };
  } catch (err) {
    const name = (err as Error).name || "fetch failed";
    const reason =
      name === "TimeoutError" || name === "AbortError"
        ? "timed out"
        : name;
    return { ok: false, text: "", reason };
  }
}
