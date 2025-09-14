// Custom cache handler for Next.js incremental caching
class CacheHandler {
  constructor() {
    this.cache = new Map()
  }

  async get(key) {
    return this.cache.get(key)
  }

  async set(key, value, ttl) {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    })
  }

  async revalidateTag(tag) {
    // Revalidate all cache entries with this tag
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.cache.delete(key)
      }
    }
  }
}

module.exports = CacheHandler
