import { Injectable, Logger } from '@nestjs/common';
import { LRUCache } from 'lru-cache';

interface CacheEntry {
  html: string;
  url: string;
  timestamp: number;
}

@Injectable()
export class HtmlCacheService {
  private readonly logger = new Logger(HtmlCacheService.name);
  private readonly cache: LRUCache<string, CacheEntry>;

  constructor() {
    this.cache = new LRUCache<string, CacheEntry>({
      max: 50, // Maximum 50 items
      maxSize: 100 * 1024 * 1024, // Maximum 100MB total size
      sizeCalculation: (entry) => {
        // Calculate size in bytes (rough estimate)
        return entry.html.length * 2; // JS strings are UTF-16 (2 bytes per char)
      },
      ttl: 5 * 60 * 1000, // 5 minutes TTL
      updateAgeOnGet: false, // Don't reset TTL on get
      updateAgeOnHas: false,
    });

    this.logger.log(`HTML cache initialized (max: 50 items, maxSize: 100MB, TTL: 5min)`);
  }

  /**
   * Store HTML content in cache
   */
  set(key: string, html: string, url: string): void {
    try {
      this.cache.set(key, {
        html,
        url,
        timestamp: Date.now(),
      });
      this.logger.debug(`Cached HTML for ${key} (${html.length} bytes)`);
    } catch (error) {
      this.logger.error(
        `Failed to cache HTML for ${key}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Retrieve HTML content from cache
   */
  get(key: string): string | null {
    try {
      const entry = this.cache.get(key);
      if (entry) {
        const age = Date.now() - entry.timestamp;
        this.logger.debug(`Cache hit for ${key} (age: ${Math.round(age / 1000)}s)`);
        return entry.html;
      }
      this.logger.debug(`Cache miss for ${key}`);
      return null;
    } catch (error) {
      this.logger.error(
        `Failed to get cached HTML for ${key}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return null;
    }
  }

  /**
   * Delete specific entry from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.logger.debug(`Deleted cache entry for ${key}`);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.logger.log('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      calculatedSize: this.cache.calculatedSize,
      maxSize: this.cache.maxSize,
      itemCount: this.cache.size,
      maxItems: this.cache.max,
    };
  }
}
