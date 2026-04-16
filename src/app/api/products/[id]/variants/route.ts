import { type NextRequest } from "next/server";
import {
  encodePathSegment,
  extractAuthHeader,
  getUpstreamUrl,
  proxyRequest,
} from "@/lib/proxy";

type RouteContext = { params: { id: string } };

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
  const body = await request.text();
  return proxyRequest(
    getUpstreamUrl(`/products/${encodePathSegment(params.id)}/variants`),
    {
      method: "POST",
      authHeader: extractAuthHeader(request),
      body,
    }
  );
}
