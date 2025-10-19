import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const API_URL = process.env.NEXT_API_URL;
  const API_KEY = process.env.API_KEY;
  if (!API_URL || !API_KEY) {
    return NextResponse.json({ error: "Missing NEXT_API_URL or API_KEY" }, { status: 500 });
  }

  try {
    const url = new URL(req.url);
    // Accept either p_level or level as query param, default to 'city'
    const raw = url.searchParams.get("p_level") ?? url.searchParams.get("level") ?? "city";
    const p_level = String(raw).trim().toLowerCase();
    if (!["city", "country"].includes(p_level)) {
      return NextResponse.json(
        { error: `Invalid p_level value: ${p_level}. Allowed values: city or country` },
        { status: 400 }
      );
    }

    const endpoint = `${API_URL}/rest/v1/rpc/get_top_category_per_location`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        apikey: API_KEY,
        Accept: "application/json",
      },
      body: JSON.stringify({ p_level }),
    });

    const rawBody = await res.text();
    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      // Log upstream details for debugging in dev.
      try {
        console.error("Supabase RPC error", {
          endpoint,
          p_level,
          status: res.status,
          contentType,
          body: rawBody,
        })
      } catch {}

      // Return the upstream body as the error message (truncate to avoid huge payloads)
      const bodyPreview = typeof rawBody === "string" ? rawBody.slice(0, 2000) : String(rawBody)
      return NextResponse.json(
        { error: bodyPreview || "Upstream error", status: res.status, contentType },
        { status: res.status }
      );
    }

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Upstream returned non-json", status: res.status, contentType, body: rawBody },
        { status: 502 }
      );
    }

    try {
      const data = JSON.parse(rawBody);
      return NextResponse.json(data);
    } catch (parseErr: unknown) {
      const perr = parseErr instanceof Error ? parseErr.message : String(parseErr);
      return NextResponse.json(
        {
          error: "Failed to parse JSON from upstream",
          parseError: perr,
          contentType,
          bodyPreview: rawBody.slice(0, 2000),
        },
        { status: 502 }
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}