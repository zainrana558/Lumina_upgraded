import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { validateOrigin } from "@/lib/security/csrf";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  // Validate origin first
  const originCheck = validateOrigin(request.headers);
  if (!originCheck.valid) {
    return NextResponse.json({ error: originCheck.error }, { status: 403 });
  }

  // Get client IP for rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
            request.headers.get("x-real-ip") || 
            "anonymous";
  
  // Check rate limit (60 requests per minute for TMDB)
  const rateCheck = await checkRateLimit(`tmdb:${ip}`, { limit: 60, window: 60 });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API key not configured" }, { status: 500 });
  }

  const params = new URLSearchParams({ api_key: apiKey });
  searchParams.forEach((value, key) => {
    if (key !== "endpoint") params.set(key, value);
  });

  const res = await fetch(`${TMDB_BASE}${endpoint}?${params}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "TMDB API error" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
