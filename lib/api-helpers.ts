import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    timestamp: string;
    requestId?: string;
    duration?: number;
    rateLimit?: {
      limit: number;
      remaining: number;
      resetTime: number;
    };
  };
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message: string = "Operation completed successfully",
  metadata?: Partial<ApiResponse<T>["metadata"]>
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  message?: string,
  statusCode: number = 500,
  metadata?: Partial<ApiResponse["metadata"]>
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error,
    message: message || error,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create rate limit exceeded response
 */
export function createRateLimitResponse(
  retryAfter: number,
  requestId?: string
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: "Rate limit exceeded",
    message: `Too many requests. Please try again in ${retryAfter} seconds.`,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  return NextResponse.json(response, {
    status: 429,
    headers: {
      "Retry-After": retryAfter.toString(),
      "X-RateLimit-Limit": "100",
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": new Date(
        Date.now() + retryAfter * 1000
      ).toISOString(),
    },
  });
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(
  field: string,
  message: string,
  requestId?: string
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: "Validation error",
    message: `${field}: ${message}`,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  return NextResponse.json(response, { status: 400 });
}

/**
 * Create internal server error response
 */
export function createInternalErrorResponse(
  error: string,
  requestId?: string
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: "Internal server error",
    message: "An unexpected error occurred while processing the request",
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  console.error(`[API] Internal error: ${error}`, { requestId });
  return NextResponse.json(response, { status: 500 });
}

/**
 * Validate request body
 */
export function validateRequestBody<T>(
  body: unknown,
  requiredFields: (keyof T)[]
): { isValid: boolean; error?: string } {
  if (!body || typeof body !== "object") {
    return { isValid: false, error: "Request body must be a valid object" };
  }

  for (const field of requiredFields) {
    if (!(field in body)) {
      return {
        isValid: false,
        error: `Missing required field: ${String(field)}`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Extract client IP from request
 */
export function getClientIP(request: Request): string {
  // Try various headers that might contain the real IP
  const headers = [
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
    "cf-connecting-ip", // Cloudflare
    "x-forwarded",
    "forwarded-for",
    "forwarded",
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(",")[0].trim();
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }

  // Fallback to a default IP if none found
  return "127.0.0.1";
}

/**
 * Basic IP validation
 */
function isValidIP(ip: string): boolean {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetTime: number
): NextResponse {
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", resetTime.toString());

  return response;
}
