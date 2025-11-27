import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: Request) {
  const API_URL = process.env.NEXT_API_URL;
  const API_KEY = process.env.API_KEY;
  if (!API_URL || !API_KEY) {
    return NextResponse.json({ error: "Missing NEXT_API_URL or API_KEY" }, { status: 500 });
  }

  // Preserve incoming query params if needed (e.g., batch_size, start_date)
  const url = new URL(req.url);
  const params = url.search;
  const endpoint = `${API_URL.replace(/\/$/, "")}/functions/v1/stream-factsales-ndjson${params}`;

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        apikey: API_KEY,
        // Accept NDJSON
        Accept: "application/x-ndjson, application/json, */*",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    // Stream the response body through to the client
    const headers = new Headers(res.headers);
    // Ensure content-type is ndjson for the client
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/x-ndjson");
    }
    // Remove hop-by-hop headers that Next might not allow
    headers.delete("transfer-encoding");

    return new NextResponse(res.body, {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}