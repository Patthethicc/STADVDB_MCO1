import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const API_URL = process.env.NEXT_API_URL;
  const API_KEY = process.env.API_KEY;
  if (!API_URL || !API_KEY) {
    return NextResponse.json({ error: "Missing NEXT_API_URL or API_KEY" }, { status: 500 });
  }

  // Parse and validate query params
  const url = new URL(request.url);
  const batchNoRaw = url.searchParams.get("p_batch_no") ?? url.searchParams.get("batch_no");
  const batchSizeRaw = url.searchParams.get("p_batch_size") ?? url.searchParams.get("batch_size");
  const debug = url.searchParams.get("debug") === "true";

  // If p_batch_no is omitted, treat this as an initialization call (start loop)
  const p_batch_no = batchNoRaw ? parseInt(batchNoRaw, 10) : undefined;
  const p_batch_size = batchSizeRaw ? parseInt(batchSizeRaw, 10) : 1000;

  if (p_batch_no !== undefined && Number.isNaN(p_batch_no)) {
    return NextResponse.json({ error: "Invalid p_batch_no (must be integer >=1)" }, { status: 400 });
  }
  if (p_batch_no !== undefined && p_batch_no < 1) {
    return NextResponse.json({ error: "p_batch_no must be >= 1" }, { status: 400 });
  }
  if (Number.isNaN(p_batch_size) || p_batch_size <= 0) {
    return NextResponse.json({ error: "p_batch_size must be a positive integer" }, { status: 400 });
  }

  const endpoint = `${API_URL}/rest/v1/rpc/get_factsales_batch`;

  try {
  // Ensure we always pass p_batch_no (RPC requires it). When omitted, default to 1 for initialization.
  const reqBatchNo = p_batch_no ?? 1;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        apikey: API_KEY,
      },
      body: JSON.stringify({ p_batch_no: reqBatchNo, p_batch_size }),
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json") || contentType.includes("application/json; charset=utf-8");

    if (!res.ok) {
      // try to parse body for better debug info
      const bodyText = await res.text();
      let parsed: unknown = undefined;
      try {
        parsed = JSON.parse(bodyText);
      } catch {
        parsed = undefined;
      }

      const debug = url.searchParams.get("debug") === "true";
      const bodyPreview = debug ? bodyText : (typeof bodyText === "string" && bodyText.length > 1000 ? bodyText.slice(0, 1000) + "..." : bodyText);

      return NextResponse.json(
        {
          error: "Upstream error",
          upstreamStatus: res.status,
          endpoint,
          params: { p_batch_no, p_batch_size },
          bodyPreview: parsed ?? bodyPreview,
        },
        { status: 502 }
      );
    }

    if (isJson) {
      const payload = await res.json();

      // Expect payload to be an array of rows returned by the RPC, typically [{ batch_no: <n>, data: [...] }]
      // Normalize response
      const row = Array.isArray(payload) && payload.length > 0 ? payload[0] : payload;

      // If this is an initialization call (no p_batch_no passed), set p_batch_no to 1
      const isInit = p_batch_no === undefined;
      const effectiveBatchNo = isInit ? 1 : p_batch_no;

      // attempt to extract data array
      let dataArray: unknown[] = [];
      if (row && typeof row === "object") {
        const r = row as Record<string, unknown>;
        if (Array.isArray(r.data)) {
          dataArray = r.data as unknown[];
        } else if (Array.isArray(row)) {
          dataArray = row as unknown[];
        } else if (r.data && typeof r.data === "string") {
          try {
            dataArray = JSON.parse(r.data as string) as unknown[];
          } catch {
            dataArray = [];
          }
        }
      }

      const hasMore = dataArray.length >= (p_batch_size ?? 10000);

      // Debug logging to server console for investigation
      if (debug) {
        console.log(`[table-factsales] debug: reqBatchNo=${reqBatchNo}, effectiveBatchNo=${effectiveBatchNo}, returnedRows=${dataArray.length}, hasMore=${hasMore}`);
      }

      if (isInit) {
        const resp = { initialized: true, p_batch_no: effectiveBatchNo, p_batch_size, hasMore, data: dataArray } as Record<string, unknown>;
        if (debug) resp.debugInfo = { endpoint, reqBatchNo: reqBatchNo, returnedRows: dataArray.length, hasMore };
        return NextResponse.json(resp);
      }

      // Normal call: return the original payload, but include debugInfo when requested
      if (debug) {
        return NextResponse.json({ payload, debugInfo: { endpoint, reqBatchNo: reqBatchNo, returnedRows: dataArray.length, hasMore } });
      }
      return NextResponse.json(payload);
    }

    // Fallback: return raw text
    const text = await res.text();
    return NextResponse.json({ data: text });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
