export interface TokenBucketOptions {
  readonly capacity: number;
  readonly refillRate: number;
  readonly initialTokens?: number;
  readonly now?: () => number;
}

/** A continuously refilling token bucket for burst-aware rate limiting. */
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly now: () => number;

  constructor(readonly options: TokenBucketOptions) {
    if (!Number.isFinite(options.capacity) || options.capacity <= 0) {
      throw new RangeError("capacity must be positive and finite");
    }
    if (!Number.isFinite(options.refillRate) || options.refillRate < 0) {
      throw new RangeError("refillRate must be finite and non-negative");
    }
    const initial = options.initialTokens ?? options.capacity;
    if (
      !Number.isFinite(initial) ||
      initial < 0 ||
      initial > options.capacity
    ) {
      throw new RangeError("initialTokens must be between zero and capacity");
    }
    this.tokens = initial;
    this.now = options.now ?? Date.now;
    this.lastRefill = this.now();
  }

  get available(): number {
    this.refill();
    return this.tokens;
  }

  take(count: number = 1): boolean {
    if (!Number.isFinite(count) || count <= 0) {
      throw new RangeError("count must be positive and finite");
    }
    this.refill();
    if (this.tokens < count) return false;
    this.tokens -= count;
    return true;
  }

  timeUntilAvailable(count: number = 1): number {
    if (
      !Number.isFinite(count) ||
      count <= 0 ||
      count > this.options.capacity
    ) {
      throw new RangeError(
        "count must be positive and no greater than capacity",
      );
    }
    this.refill();
    if (this.tokens >= count) return 0;
    return this.options.refillRate === 0
      ? Number.POSITIVE_INFINITY
      : (count - this.tokens) / this.options.refillRate;
  }

  reset(tokens: number = this.options.capacity): void {
    if (
      !Number.isFinite(tokens) ||
      tokens < 0 ||
      tokens > this.options.capacity
    ) {
      throw new RangeError("tokens must be between zero and capacity");
    }
    this.tokens = tokens;
    this.lastRefill = this.now();
  }

  private refill(): void {
    const now = this.now();
    const elapsed = Math.max(0, now - this.lastRefill);
    this.tokens = Math.min(
      this.options.capacity,
      this.tokens + elapsed * this.options.refillRate,
    );
    this.lastRefill = now;
  }
}
