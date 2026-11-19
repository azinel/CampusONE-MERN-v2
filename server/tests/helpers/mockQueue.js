export class MockQueue {
  constructor(name = "test-notifications") {
    this.name = name;
    this.jobs = [];
    this.isOffline = false;
    this.delayMs = 0;
  }

  simulateFailure() {
    this.isOffline = true;
  }

  restore() {
    this.isOffline = false;
    this.delayMs = 0;
  }

  setDelay(ms) {
    this.delayMs = ms;
  }

  clear() {
    this.jobs = [];
  }

  getJobs() {
    return [...this.jobs];
  }

  async add(name, data, opts = {}) {
    if (this.isOffline) {
      throw new Error("Redis connection closed / Queue offline");
    }

    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

    const job = {
      id: opts.jobId || `mock-job-${Date.now()}-${this.jobs.length + 1}`,
      name,
      data,
      opts,
      timestamp: Date.now(),
    };

    this.jobs.push(job);
    return job;
  }

  on(event, handler) {
    // Mock event listener
    return this;
  }

  async close() {
    return true;
  }
}
