import { type NextRequest } from "next/server";
import {
  encodePathSegment,
  extractAuthHeader,
  getUpstreamUrl,
  proxyRequest,
} from "@/lib/proxy";

type RouteContext = { params: { id: string; variantId: string } };

/**
 * PUT /api/products/[id]/variants/[variantId]  🔒
 * Update a specific variant (partial update supported).
 * Requires: Authorization: Bearer <token>
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const body = await request.text();
  return proxyRequest(
    getUpstreamUrl(
      `/products/${encodePathSegment(params.id)}/variants/${encodePathSegment(params.variantId)}`
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
  return proxyRequest(
    getUpstreamUrl(
      `/products/${encodePathSegment(params.id)}/variants/${encodePathSegment(params.variantId)}`
    ),
    {
      method: "DELETE",
      authHeader: extractAuthHeader(request),
    }
  );
}
