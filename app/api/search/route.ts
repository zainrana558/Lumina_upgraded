import { NextResponse, type NextRequest } from "next/server";
import { searchMedia } from "@/lib/tmdb/client";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { validateOrigin } from "@/lib/security/csrf";

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
  
  // Check rate limit (30 requests per minute for search)
  const rateCheck = await checkRateLimit(`search:${ip}`, { limit: 30, window: 60 });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  // Sanitize query - only allow alphanumeric, spaces, and common characters
  const sanitizedQuery = query.replace(/[^\w\s\-&']/gi, "").slice(0, 200);
  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const data = await searchMedia(sanitizedQuery, page);
  const filtered = {
    ...data,
    results: data.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    ),
  };

  return NextResponse.json(filtered);
}
