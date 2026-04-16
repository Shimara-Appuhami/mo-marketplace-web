import { type NextRequest } from "next/server";
import {
  encodePathSegment,
  extractAuthHeader,
  getUpstreamUrl,
  proxyRequest,
} from "@/lib/proxy";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/products/[id]/variants  🔒
 * Add a new variant to an existing product.
 * Body: { attributes: { color, size, material }, price, stock, sku? }
 * Requires: Authorization: Bearer <token>
 */
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  const [{ id }, body] = await Promise.all([params, request.text()]);
  return proxyRequest(
    getUpstreamUrl(`/products/${encodePathSegment(id)}/variants`),
    {
      method: "POST",
      authHeader: extractAuthHeader(request),
      body,
    }
  );
}
