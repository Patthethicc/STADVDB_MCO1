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

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text || "Supabase RPC error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}