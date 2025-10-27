/**
 * In-Memory Cache Layer for High-Performance APIs
 * Uses Node.js Map with TTL (Time To Live) support
 */

// Memory cache stores
const reportCache = new Map();
const adsCache = new Map();
const configCache = new Map();

class MemoryCache {
  constructor(store) {
    this.store = store;
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {object|null} - Cached value or null
   */
  get(key) {
    const item = this.store.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    // Update last accessed time for LRU
    item.lastAccessed = Date.now();
    return item.value;
  }

  /**
   * Set value to cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds
   */
  set(key, value, ttlSeconds = 300) {
    const item = {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };

    this.store.set(key, item);
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.store.clear();
  }

  /**
   * Get cache statistics
   * @returns {object} - Cache stats
   */
  getStats() {
    const entries = Array.from(this.store.values());
    const now = Date.now();
    const active = entries.filter(e => !e.expiresAt || e.expiresAt > now).length;
    const expired = entries.filter(e => e.expiresAt && e.expiresAt <= now).length;

    return {
      total: this.store.size,
      active,
      expired,
      hits: this.store.hits || 0,
      misses: this.store.misses || 0
    };
  }

  /**
   * Clean expired entries (run periodically)
   */
  cleanup() {
    const now = Date.now();
    const toDelete = [];

    for (const [key, item] of this.store.entries()) {
      if (item.expiresAt && item.expiresAt <= now) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.store.delete(key));
    return toDelete.length;
  }
}

// Track cache hits/misses
const trackingProxy = (store) => {
  const originalGet = store.get;
  
  store.hits = 0;
  store.misses = 0;
  
  store.get = function(key) {
    const result = originalGet.call(this, key);
    
    if (result !== null && result !== undefined) {
      store.hits++;
      return result;
    } else {
      store.misses++;
      return undefined;
    }
  };
  
  return store;
};

// Create cache instances
export const memoryCache = {
  report: new MemoryCache(trackingProxy(reportCache)),
  ads: new MemoryCache(trackingProxy(adsCache)),
  config: new MemoryCache(configCache)
};

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  const reportCleaned = memoryCache.report.cleanup();
  const adsCleaned = memoryCache.ads.cleanup();
  const configCleaned = memoryCache.config.cleanup();
  
  if (reportCleaned > 0 || adsCleaned > 0 || configCleaned > 0) {
    console.log('🧹 Cache cleanup:', {
      reports: reportCleaned,
      ads: adsCleaned,
      config: configCleaned
    });
  }
}, 5 * 60 * 1000); // 5 minutes

// Log cache stats periodically
setInterval(() => {
  const reportStats = memoryCache.report.getStats();
  const adsStats = memoryCache.ads.getStats();
  
  if (reportStats.total > 0 || adsStats.total > 0) {
    console.log('📊 Cache Stats:', {
      report: reportStats,
      ads: adsStats
    });
  }
}, 15 * 60 * 1000); // 15 minutes

export default memoryCache;

