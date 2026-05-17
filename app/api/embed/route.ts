import { NextResponse, type NextRequest } from "next/server";
import { getAllEmbedUrls } from "@/lib/streaming/providers";
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
  
  // Check rate limit (100 requests per minute for embed)
  const rateCheck = await checkRateLimit(`embed:${ip}`, { limit: 100, window: 60 });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdb");
  const type = searchParams.get("type") as "movie" | "tv" | null;
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");

  if (!tmdbId || !type) {
    return NextResponse.json({ error: "Missing tmdb or type" }, { status: 400 });
  }

  // Validate ID is numeric
  const parsedId = parseInt(tmdbId);
  if (isNaN(parsedId) || parsedId <= 0) {
    return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
  }

  const providers = getAllEmbedUrls(
    type,
    parsedId,
    season ? parseInt(season) : undefined,
    episode ? parseInt(episode) : undefined
  );

  return NextResponse.json({ providers, url: providers[0]?.url ?? null });
}
