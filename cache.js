/**
 * Simple in-memory cache
 */
class Cache {
  constructor(name, expiration=24) {
    this.items = [];
    this.name = name;
    this.expiration = expiration; // expiration in hours
  }

  exists(id) {
    return this.items.find(cache => cache.id === id && !this.isExpired(cache.lastUpdate));
  }

  isExpired(timestamp) {
    return (new Date().valueOf() - timestamp) / (1000 * 60 * 60 * this.expiration) >= 1;
  }

  add(id, data) {
    if (!data || !data.length) return null;
    console.log(`[CACHE ${this.name}] Adding to the Cache (ID: ${id}): ${data.length} items.`);

    const index = this.items.find(cache => cache.id === id);
    if (index) {
      console.log(`[CACHE ${this.name}] Removing expired entry from cache`);
      this.items = this.items.filter(cache => cache.id !== id);
    }

    this.items.push({
      id: id,
      lastUpdate: new Date().valueOf(),
      data: data,
    });
  }
}

module.exports = Cache;
