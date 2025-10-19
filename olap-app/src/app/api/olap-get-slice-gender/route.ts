import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const API_URL = process.env.NEXT_API_URL;
  const API_KEY = process.env.API_KEY;
  if (!API_URL || !API_KEY) {
    return NextResponse.json({ error: "Missing NEXT_API_URL or API_KEY" }, { status: 500 });
  }

  try {
    const url = new URL(req.url);
    const raw = url.searchParams.get("gender") ?? url.searchParams.get("p_gender");
    if (!raw) {
      return NextResponse.json({ error: "Missing gender query parameter (gender or p_gender)" }, { status: 400 });
    }

    const payloadGender = String(raw).trim().toUpperCase();
    if (!["M", "F"].includes(payloadGender)) {
      return NextResponse.json(
        { error: `Invalid gender value: ${payloadGender}. Allowed values: M or F` },
        { status: 400 }
      );
    }

    const endpoint = `${API_URL}/rest/v1/rpc/get_sales_slice_gender`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        apikey: API_KEY,
        Accept: "application/json",
      },
      body: JSON.stringify({ p_gender: payloadGender }),
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