import { NextRequest, NextResponse } from "next/server";

// GET all users - proxies to backend /api/users
export async function GET() {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(`${backendUrl}/api/users`, {
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

// POST create new user - proxies to backend /api/users
export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
  
  try {
    const body = await request.json();
    
    const res = await fetch(`${backendUrl}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: error.error || "Failed to create user" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
