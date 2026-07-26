# `@lucid-softworks/token-bucket`

A continuously refilling token bucket with burst capacity, injected time, wait
estimation, and resetting.

```ts
import { TokenBucket } from "@lucid-softworks/token-bucket";

const bucket = new TokenBucket({ capacity: 10, refillRate: 0.01 });
if (bucket.take()) await performRequest();
```

`refillRate` is tokens per millisecond.
