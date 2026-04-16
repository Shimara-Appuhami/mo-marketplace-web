import { type NextRequest } from "next/server";
import { getUpstreamUrl, proxyRequest } from "@/lib/proxy";

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyRequest(getUpstreamUrl("/auth/login"), {
    method: "POST",
    body,
  });
}
