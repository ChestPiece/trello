interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly limit: number;
  private readonly windowMs: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(limit: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.limit = limit;
    this.windowMs = windowMs;

    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed for given IP
   */
  check(ip: string): RateLimitResult {
    const now = Date.now();
    const entry = this.requests.get(ip);

    if (!entry || now > entry.resetTime) {
      // No entry or window expired, create new entry
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.requests.set(ip, newEntry);

      return {
        allowed: true,
        limit: this.limit,
        remaining: this.limit - 1,
        resetTime: newEntry.resetTime,
      };
    }

    if (entry.count >= this.limit) {
      // Rate limit exceeded
      return {
        allowed: false,
        limit: this.limit,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    // Increment count
    entry.count++;
    this.requests.set(ip, entry);

    return {
      allowed: true,
      limit: this.limit,
      remaining: this.limit - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(ip);
      }
    }
  }

  /**
   * Get current stats for debugging
   */
  getStats(): {
    totalIPs: number;
    entries: Array<{ ip: string; count: number; resetTime: number }>;
  } {
    const entries = Array.from(this.requests.entries()).map(([ip, entry]) => ({
      ip,
      count: entry.count,
      resetTime: entry.resetTime,
    }));

    return {
      totalIPs: this.requests.size,
      entries,
    };
  }

  /**
   * Clear all entries (useful for testing)
   */
  clear(): void {
    this.requests.clear();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();


