export class MockRedis {
  constructor() {
    this.store = new Map();
    this.status = "ready";
    this.operations = {
      get: 0,
      set: 0,
      del: 0,
      scan: 0,
    };
  }

  resetStats() {
    this.operations = {
      get: 0,
      set: 0,
      del: 0,
      scan: 0,
    };
  }

  async get(key) {
    this.operations.get++;
    if (this.status !== "ready") {
      throw new Error("Redis connection offline");
    }
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key, value, ...args) {
    this.operations.set++;
    if (this.status !== "ready") {
      throw new Error("Redis connection offline");
    }
    let expiresAt = null;
    for (let i = 0; i < args.length; i++) {
      if (String(args[i]).toUpperCase() === "EX" && args[i + 1] !== undefined) {
        expiresAt = Date.now() + Number(args[i + 1]) * 1000;
        break;
      }
    }
    this.store.set(key, { value: String(value), expiresAt });
    return "OK";
  }

  async del(...keys) {
    this.operations.del++;
    if (this.status !== "ready") {
      throw new Error("Redis connection offline");
    }
    let count = 0;
    const flatKeys = keys.flat();
    for (const k of flatKeys) {
      if (this.store.delete(k)) count++;
    }
    return count;
  }

  async scan(cursor, ...args) {
    this.operations.scan++;
    if (this.status !== "ready") {
      throw new Error("Redis connection offline");
    }
    let pattern = "*";
    for (let i = 0; i < args.length; i++) {
      if (String(args[i]).toUpperCase() === "MATCH" && args[i + 1]) {
        pattern = args[i + 1];
        break;
      }
    }
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    const matched = [];
    const now = Date.now();
    for (const [k, v] of this.store.entries()) {
      if (v.expiresAt && now > v.expiresAt) {
        this.store.delete(k);
        continue;
      }
      if (regex.test(k)) {
        matched.push(k);
      }
    }
    return ["0", matched];
  }

  async flushdb() {
    this.store.clear();
    return "OK";
  }

  disconnect() {
    this.status = "end";
  }

  simulateFailure() {
    this.status = "offline";
  }

  restore() {
    this.status = "ready";
  }
}
