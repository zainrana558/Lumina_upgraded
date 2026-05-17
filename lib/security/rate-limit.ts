/**
 * Rate Limiting Utility with Upstash Redis
 * Graceful fallback to in-memory rate limiting if Redis unavailable
 */

import { Redis } from "@upstash/redis";

// Rate limit configuration
interface RateLimitConfig {
  /** Maximum requests allowed in the time window */
  limit: number;
  /** Time window in seconds */
  window: number;
  /** Identifier key (IP, user ID, etc.) */
  key: string;
}

// In-memory rate limiter fallback
class InMemoryRateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();

  constructor(private defaultLimit = 100, private defaultWindow = 60) {}

  async check({ key, limit = this.defaultLimit, window = this.defaultWindow }: RateLimitConfig): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // New window
      this.store.set(key, { count: 1, resetTime: now + window * 1000 });
      return { allowed: true, remaining: limit - 1, resetIn: window };
    }

    if (entry.count >= limit) {
      // Rate limited
      return { allowed: false, remaining: 0, resetIn: Math.ceil((entry.resetTime - now) / 1000) };
    }

    entry.count++;
    return { allowed: true, remaining: limit - entry.count, resetIn: Math.ceil((entry.resetTime - now) / 1000) };
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Redis-based rate limiter (production)
class RedisRateLimiter {
  private redis: Redis | null = null;

  constructor() {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    }
  }

  isConfigured(): boolean {
    return this.redis !== null;
  }

  async check({ key, limit = 100, window = 60 }: RateLimitConfig): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    if (!this.redis) {
      // Fallback to memory limiter
      return inMemoryLimiter.check({ key, limit, window });
    }

    const bucketKey = `ratelimit:${key}`;
    const current = await this.redis.get<number>(bucketKey).catch(() => null);

    if (current === null) {
      await this.redis.setex(bucketKey, window, 1);
      return { allowed: true, remaining: limit - 1, resetIn: window };
    }

    if (current >= limit) {
      const ttl = await this.redis.ttl(bucketKey).catch(() => window);
      return { allowed: false, remaining: 0, resetIn: ttl > 0 ? ttl : window };
    }

    await this.redis.incr(bucketKey);
    return { allowed: true, remaining: limit - current - 1, resetIn: window };
  }
}

// Singleton instances
const redisLimiter = new RedisRateLimiter();
const inMemoryLimiter = new InMemoryRateLimiter();

// Cleanup memory limiter every minute
if (typeof setInterval !== "undefined") {
  setInterval(() => inMemoryLimiter.cleanup(), 60000);
}

/**
 * Check if rate limit is exceeded
 * Uses Redis in production, falls back to in-memory
 */
export async function checkRateLimit(
  identifier: string,
  options: { limit?: number; window?: number } = {}
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const { limit = 100, window = 60 } = options;
  const key = `lumina:${identifier}`;

  return redisLimiter.check({ key, limit, window });
}

/**
 * Middleware-friendly rate limiter
 * Returns a function to check rate limit for a request
 */
export function createRateLimiter(config: { limit: number; window: number; identifier?: (req: Request) => string } = { limit: 100, window: 60 }) {
  return async (req: Request): Promise<{ allowed: boolean; remaining: number; resetIn: number }> => {
    // Allow localhost always in development
    const origin = req.headers.get("origin") || "";
    const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
    if (isLocalhost && process.env.NODE_ENV !== "production") {
      return { allowed: true, remaining: 999, resetIn: 60 };
    }

    const identifier = config.identifier ? config.identifier(req) : getClientIp(req);
    return checkRateLimit(identifier, { limit: config.limit, window: config.window });
  };
}

/**
 * Extract client IP from request headers
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Get rate limiter status for monitoring
 */
export function getRateLimiterStatus() {
  return {
    redisConfigured: redisLimiter.isConfigured(),
    type: redisLimiter.isConfigured() ? "redis" : "memory",
  };
}

export { InMemoryRateLimiter, RedisRateLimiter };