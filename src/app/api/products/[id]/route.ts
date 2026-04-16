import { type NextRequest } from "next/server";
import {
  encodePathSegment,
  extractAuthHeader,
  getUpstreamUrl,
  proxyRequest,
} from "@/lib/proxy";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/products/[id]
 * Public — fetch a single product by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  return proxyRequest(getUpstreamUrl(`/products/${encodePathSegment(id)}`));
}

/**
 * PUT /api/products/[id]  🔒
 * Update top-level product fields (name, description, basePrice, category).
 * Requires: Authorization: Bearer <token>
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const [{ id }, body] = await Promise.all([params, request.text()]);
  return proxyRequest(getUpstreamUrl(`/products/${encodePathSegment(id)}`), {
    method: "PUT",
    authHeader: extractAuthHeader(request),
    body,
  });
}

/**
 * DELETE /api/products/[id]  🔒
 * Delete a product and all its variants.
 * Requires: Authorization: Bearer <token>
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  return proxyRequest(getUpstreamUrl(`/products/${encodePathSegment(id)}`), {
    method: "DELETE",
    authHeader: extractAuthHeader(request),
  });
}
