/**
 * proxy.ts — shared BFF helper for Next.js Route Handlers.
 *
 * Reads the real backend base URL from the server-only `API_URL` env var
 * (falls back to `NEXT_PUBLIC_API_URL` so no `.env.local` change breaks
 * existing Server Components). Forwards the caller's Authorization header
 * and streams the upstream JSON + status back to the browser.
 */

/** Build an upstream URL from a path, e.g. "/products/123". */
export function getUpstreamUrl(path: string): string {
  const base =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "";
  return `${base}${path}`;
}

/** Encode a single path segment before interpolating it into a URL path. */
export function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

/** Extract the Authorization header from an incoming Request, if present. */
export function extractAuthHeader(
  request: Request
): Record<string, string> {
  const auth = request.headers.get("Authorization");
  return auth ? { Authorization: auth } : {};
}

type ProxyOptions = {
  method?: string;
  authHeader?: Record<string, string>;
  /** Raw request body string — pass `await request.text()` from the handler. */
  body?: BodyInit | null;
};

/**
 * Forward a request to the upstream backend and return a `Response` whose
 * status code mirrors the upstream response.
 */
export async function proxyRequest(
  upstreamUrl: string,
  options: ProxyOptions = {}
): Promise<Response> {
  const { method = "GET", authHeader = {}, body } = options;

  const headers: Record<string, string> = { ...authHeader };
  if (body != null) {
    headers["Content-Type"] = "application/json";
  }

  let upstreamRes: globalThis.Response;

  try {
    upstreamRes = await fetch(upstreamUrl, {
      method,
      headers,
      body: body ?? undefined,
      // Always fetch fresh data — never serve from the Next.js fetch cache.
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { error: "Upstream service unavailable." },
      { status: 502 }
    );
  }

  // Some DELETE endpoints return 204 No Content — handle gracefully.
  let payload: unknown = null;
  const contentType = upstreamRes.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    payload = await upstreamRes.json().catch(() => null);
  }

  if (payload === null || upstreamRes.status === 204) {
    return new Response(null, { status: upstreamRes.status });
  }

  return Response.json(payload, { status: upstreamRes.status });
}
