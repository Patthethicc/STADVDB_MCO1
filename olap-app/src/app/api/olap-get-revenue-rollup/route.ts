import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const API_URL = process.env.NEXT_API_URL;
  const API_KEY = process.env.API_KEY;
  if (!API_URL || !API_KEY) {
    return NextResponse.json({ error: "Missing NEXT_API_URL or API_KEY" }, { status: 500 });
  }

  try {
    const url = new URL(req.url);
    const raw = url.searchParams.get("time_level") ?? url.searchParams.get("time") ?? "month";
    const timeLevel = String(raw).toLowerCase();
    const allowed = new Set(["year", "month", "day"]);
    const payloadTimeLevel = allowed.has(timeLevel) ? timeLevel : "month";

    const endpoint = `${API_URL}/rest/v1/rpc/get_revenue_rollup`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        apikey: API_KEY,
        Accept: "application/json",
      },
      body: JSON.stringify({ time_level: payloadTimeLevel }),
    });

    const rawBody = await res.text();
    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream error", status: res.status, contentType, body: rawBody },
        { status: res.status }
      );
    }

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Upstream returned non-json", status: res.status, contentType, body: rawBody },
        { status: 502 }
      );
    }

    const data = JSON.parse(rawBody);
    // Expect rows with: period, total_revenue, total_quantity
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}