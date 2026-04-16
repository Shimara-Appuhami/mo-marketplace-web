import { type NextRequest } from "next/server";
import {
  encodePathSegment,
  extractAuthHeader,
  getUpstreamUrl,
  proxyRequest,
} from "@/lib/proxy";

type RouteContext = { params: Promise<{ id: string; variantId: string }> };

/**
 * PUT /api/products/[id]/variants/[variantId]  🔒
 * Update a specific variant (partial update supported).
 * Requires: Authorization: Bearer <token>
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const [{ id, variantId }, body] = await Promise.all([params, request.text()]);
  return proxyRequest(
    getUpstreamUrl(
      `/products/${encodePathSegment(id)}/variants/${encodePathSegment(variantId)}`
    ),
    {
      method: "PUT",
      authHeader: extractAuthHeader(request),
      body,
    }
  );
}

/**
 * DELETE /api/products/[id]/variants/[variantId]  🔒
 * Remove a specific variant from a product.
 * Requires: Authorization: Bearer <token>
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id, variantId } = await params;
  return proxyRequest(
    getUpstreamUrl(
      `/products/${encodePathSegment(id)}/variants/${encodePathSegment(variantId)}`
    ),
    {
      method: "DELETE",
      authHeader: extractAuthHeader(request),
    }
  );
}
