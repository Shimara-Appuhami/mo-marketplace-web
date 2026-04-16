import { type NextRequest } from "next/server";
import {
  encodePathSegment,
  extractAuthHeader,
  getUpstreamUrl,
  proxyRequest,
} from "@/lib/proxy";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/products/[id]/quick-buy
 * Decrement stock by 1 for the selected variant.
 * Body: { variantId: string; quantity: number }
 *
 * Authentication is optional here — the upstream backend enforces its own
 * auth policy. If the user is logged in the browser will send the
 * Authorization header and it is forwarded; if not, the upstream decides.
 */
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  const [{ id }, body] = await Promise.all([params, request.text()]);
  return proxyRequest(
    getUpstreamUrl(`/products/${encodePathSegment(id)}/quick-buy`),
    {
      method: "POST",
      authHeader: extractAuthHeader(request),
      body,
    }
  );
}
