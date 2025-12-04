import { NextRequest, NextResponse } from "next/server";

// GET users by year - proxies to backend /api/users/year/:year
export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
  const { year } = params;
  
  try {
    const res = await fetch(`${backendUrl}/api/users/year/${year}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: error.error || "Failed to fetch users" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
