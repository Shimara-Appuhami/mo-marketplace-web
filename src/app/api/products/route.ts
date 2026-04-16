import { type NextRequest } from "next/server";
import { extractAuthHeader, getUpstreamUrl, proxyRequest } from "@/lib/proxy";

 * GET /api/products
 * Public — list all products.
export async function GET() {
  return proxyRequest(getUpstreamUrl("/products"));
}

 * POST /api/products  🔒
 * Create a new product (with variants).
 * Requires: Authorization: Bearer <token>
export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyRequest(getUpstreamUrl("/products"), {
    method: "POST",
    authHeader: extractAuthHeader(request),
    body,
  });
}
