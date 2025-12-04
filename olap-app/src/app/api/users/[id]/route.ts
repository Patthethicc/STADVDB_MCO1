import { NextRequest, NextResponse } from "next/server";

// GET user by ID - proxies to backend /api/users/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
  const paramsObj = (await params) as { id: string };
  const { id } = paramsObj;
  
  try {
    const res = await fetch(`${backendUrl}/api/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: error.error || "Failed to fetch user" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT update user - proxies to backend /api/users/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
  const paramsObj = (await params) as { id: string };
  const { id } = paramsObj;
  
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const isolation = searchParams.get("isolation");
    const mode = searchParams.get("mode");
    
    // Build query params for backend
    let queryString = "";
    if (isolation || mode) {
      const params = new URLSearchParams();
      if (isolation) params.append("isolation", isolation);
      if (mode) params.append("mode", mode);
      queryString = `?${params.toString()}`;
    }
    
    const res = await fetch(`${backendUrl}/api/users/${id}${queryString}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: error.error || "Failed to update user" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE user - proxies to backend /api/users/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
  const paramsObj = (await params) as { id: string };
  const { id } = paramsObj;
  
  try {
    const res = await fetch(`${backendUrl}/api/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: error.error || "Failed to delete user" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
