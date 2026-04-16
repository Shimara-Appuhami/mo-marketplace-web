import { type NextRequest } from "next/server";
import { extractAuthHeader, getUpstreamUrl, proxyRequest } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  return proxyRequest(getUpstreamUrl("/auth/me"), {
    authHeader: extractAuthHeader(request),
  });
}
