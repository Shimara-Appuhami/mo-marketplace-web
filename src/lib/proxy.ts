
export function getUpstreamUrl(path: string): string {
  const base =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "";
  return `${base}${path}`;
}

export function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function extractAuthHeader(
  request: Request
): Record<string, string> {
  const auth = request.headers.get("Authorization");
  return auth ? { Authorization: auth } : {};
}

type ProxyOptions = {
  method?: string;
  authHeader?: Record<string, string>;
  body?: BodyInit | null;
};


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
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { error: "Upstream service unavailable." },
      { status: 502 }
    );
  }

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
