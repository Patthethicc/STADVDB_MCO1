import { NextResponse } from "next/server";

export async function GET() {
  const API_URL = process.env.NEXT_API_URL;
  const API_KEY = process.env.API_KEY;
  if (!API_URL || !API_KEY) {
    return NextResponse.json({ error: "Missing NEXT_API_URL or API_KEY" }, { status: 500 });
  }
  const endpoint = `${API_URL}/rest/v1/rpc/get_sales_by_gender_male`;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        apikey: API_KEY,
      },
    });

    const raw = await res.text();
    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream error", status: res.status, contentType, body: raw },
        { status: res.status }
      );
    }

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          error: "Unexpected non-JSON response from upstream",
          contentType,
          body: raw.slice(0, 2000)
        },
        { status: 502 }
      );
    }

    try {
      const data = JSON.parse(raw);
      return NextResponse.json(data);
    } catch (parseErr: unknown) {
      const perr = parseErr instanceof Error ? parseErr.message : String(parseErr)
      return NextResponse.json(
        {
          error: "Failed to parse JSON from upstream",
          parseError: perr,
          contentType,
          bodyPreview: raw.slice(0, 2000)
        },
        { status: 502 }
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}