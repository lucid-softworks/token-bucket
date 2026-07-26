import { describe, expect, it } from "vitest";

import { TokenBucket } from "../src/index.js";

describe("TokenBucket", () => {
  it.each([
    [{ capacity: 0, refillRate: 1 }, "capacity"],
    [{ capacity: 1, refillRate: -1 }, "refillRate"],
    [{ capacity: 1, refillRate: 1, initialTokens: 2 }, "initialTokens"],
  ] as const)("rejects invalid options", (options, message) => {
    expect(() => new TokenBucket(options)).toThrow(message);
  });

  it("takes tokens and refills continuously up to capacity", () => {
    let now = 0;
    const bucket = new TokenBucket({
      capacity: 5,
      refillRate: 0.5,
      now: () => now,
    });
    expect(bucket.take(4)).toBe(true);
    expect(bucket.take(2)).toBe(false);
    now = 4;
    expect(bucket.available).toBe(3);
    now = 100;
    expect(bucket.available).toBe(5);
    now = 50;
    expect(bucket.available).toBe(5);
  });

  it("calculates wait time including a non-refilling bucket", () => {
    const bucket = new TokenBucket({
      capacity: 2,
      refillRate: 0,
      initialTokens: 0,
    });
    expect(bucket.timeUntilAvailable()).toBe(Number.POSITIVE_INFINITY);
    bucket.reset(1);
    expect(bucket.timeUntilAvailable()).toBe(0);
  });

  it.each([0, -1, Number.POSITIVE_INFINITY])(
    "rejects take count %s",
    (count) => {
      expect(() =>
        new TokenBucket({ capacity: 2, refillRate: 1 }).take(count),
      ).toThrow(RangeError);
    },
  );

  it("validates wait and reset amounts", () => {
    const bucket = new TokenBucket({
      capacity: 2,
      refillRate: 1,
      initialTokens: 0,
    });
    expect(bucket.timeUntilAvailable(2)).toBe(2);
    expect(() => bucket.timeUntilAvailable(3)).toThrow(RangeError);
    expect(() => bucket.reset(-1)).toThrow(RangeError);
    bucket.reset();
    expect(bucket.available).toBe(2);
  });
});
