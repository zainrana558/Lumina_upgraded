/**
 * CSRF Protection Utility
 * Simple token-based CSRF protection for server actions and forms
 */

import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

// Cookie configuration
const CSRF_COOKIE_NAME = "lumina_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure CSRF token
 */
function generateToken(): string {
  return uuidv4().replace(/-/g, "").slice(0, CSRF_TOKEN_LENGTH);
}

/**
 * Get the current CSRF token from cookies
 * Creates a new one if none exists
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (existingToken && existingToken.length >= CSRF_TOKEN_LENGTH) {
    return existingToken;
  }

  // Generate new token (caller should set it)
  return generateToken();
}

/**
 * Get cookie configuration for CSRF token
 */
export function getCsrfCookieConfig() {
  return {
    name: CSRF_COOKIE_NAME,
    value: generateToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  };
}

/**
 * Validate a CSRF token
 * Returns true if valid, false otherwise
 */
export async function validateCsrfToken(token: string | null): Promise<boolean> {
  if (!token || token.length < CSRF_TOKEN_LENGTH) {
    return false;
  }

  const storedToken = await getCsrfToken();
  return token === storedToken;
}

/**
 * Extract CSRF token from request headers
 */
export function getCsrfTokenFromHeaders(headers: Headers): string | null {
  return headers.get(CSRF_HEADER_NAME) || headers.get("x-xsrf-token");
}

/**
 * CSRF validation middleware for API routes
 * Returns error response if validation fails
 */
export async function validateCsrf(headers: Headers): Promise<{ valid: boolean; error?: string }> {
  // Skip CSRF in development
  if (process.env.NODE_ENV !== "production") {
    return { valid: true };
  }

  const token = getCsrfTokenFromHeaders(headers);
  const valid = await validateCsrfToken(token);

  if (!valid) {
    return {
      valid: false,
      error: "Invalid CSRF token. Please refresh the page and try again.",
    };
  }

  return { valid: true };
}

/**
 * Origin validation for API routes
 * Ensures requests come from allowed origins
 */
export function validateOrigin(headers: Headers): { valid: boolean; error?: string } {
  const origin = headers.get("origin");
  const referer = headers.get("referer");

  // Allow server-to-server requests with no origin
  if (!origin && !referer) {
    return { valid: true };
  }

  // In development, be more lenient
  if (process.env.NODE_ENV !== "production") {
    return { valid: true };
  }

  // Allow all Vercel deployments (*.vercel.app) in production
  if (origin) {
    const vercelDomains = [".vercel.app", "lumina-upgraded.vercel.app"];
    const isVercelDeployment = vercelDomains.some(domain => 
      origin.endsWith(domain) || origin.includes(domain)
    );
    if (isVercelDeployment) {
      return { valid: true };
    }
  }

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  // Add site URL to allowed origins if provided
  if (siteUrl && !allowedOrigins.includes(siteUrl)) {
    allowedOrigins.push(siteUrl);
  }

  // Check origin against allowed list
  if (origin && allowedOrigins.length > 0) {
    const isAllowed = allowedOrigins.some((allowed) => {
      // Exact match or subdomain wildcard
      return (
        origin === allowed ||
        origin === `${allowed}/` ||
        origin.startsWith(`${allowed.replace(/\/$/, "")}/`) ||
        allowed.startsWith(origin.replace(/\/$/, "") + "/")
      );
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: `Origin ${origin} not allowed`,
      };
    }
  }

  return { valid: true };
}

/**
 * Combined security validation for API routes
 * Checks both CSRF and Origin
 */
export async function validateRequestSecurity(headers: Headers): Promise<{ valid: boolean; error?: string }> {
  // Check origin first (faster)
  const originCheck = validateOrigin(headers);
  if (!originCheck.valid) {
    return originCheck;
  }

  // Then check CSRF (only in production)
  if (process.env.NODE_ENV === "production") {
    const csrfCheck = await validateCsrf(headers);
    if (!csrfCheck.valid) {
      return csrfCheck;
    }
  }

  return { valid: true };
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };