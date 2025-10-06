interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly maxSize: number;
  private readonly defaultTtl: number;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    maxSize: 0,
  };

  constructor(maxSize: number = 100, defaultTtl: number = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
    this.stats.maxSize = maxSize;
  }

  /**
   * Generate cache key from operation and params
   */
  private generateKey(
    operation: string,
    params: Record<string, unknown> = {}
  ): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, unknown>);

    return `${operation}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Get cached data
   */
  get<T>(operation: string, params: Record<string, unknown> = {}): T | null {
    const key = this.generateKey(operation, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      // Entry expired
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Set cached data
   */
  set<T>(
    operation: string,
    params: Record<string, unknown> = {},
    data: T,
    ttl?: number
  ): void {
    const key = this.generateKey(operation, params);
    const now = Date.now();

    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.defaultTtl,
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
  }

  /**
   * Check if operation should be cached (read operations only)
   */
  shouldCache(operation: string): boolean {
    const readOperations = [
      "getBoard",
      "listBoards",
      "getList",
      "listLists",
      "getCard",
      "listCards",
      "getLabel",
      "listLabels",
      "getAttachment",
      "listAttachments",
      "getChecklist",
      "listChecklists",
      "getMember",
      "listMembers",
      "getWorkspace",
      "listWorkspaces",
    ];

    return readOperations.includes(operation);
  }

  /**
   * Invalidate cache entries for a specific operation
   */
  invalidate(operation: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(`${operation}:`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
    this.stats.size = this.cache.size;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      ...this.stats,
      hitRate,
    };
  }

  /**
   * Get all cache keys (for debugging)
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Singleton instance
export const cacheService = new CacheService();
