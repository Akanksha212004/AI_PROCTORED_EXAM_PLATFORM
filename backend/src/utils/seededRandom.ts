// /**
//  * Deterministic (seeded) randomness for exam paper generation.
//  *
//  * Why seeded and not `Math.random()`: the same student refreshing the
//  * exam page mid-session must see the SAME paper they started with, but
//  * two DIFFERENT students starting the same exam concurrently must get
//  * DIFFERENT papers/orders. Seeding the RNG with `studentId + examId`
//  * gives both properties — same input always reproduces the same
//  * shuffle, different students naturally get different seeds.
//  */

// /** Simple 32-bit hash (djb2) — turns an arbitrary string into a numeric seed. */
// function hashStringToSeed(input: string): number {
//   let hash = 5381;
//   for (let i = 0; i < input.length; i++) {
//     hash = (hash * 33) ^ input.charCodeAt(i);
//   }
//   return hash >>> 0;
// }

// /** mulberry32 — small, fast, good-enough PRNG for non-cryptographic shuffling. */
// function mulberry32(seed: number) {
//   let a = seed;
//   return function random(): number {
//     a |= 0;
//     a = (a + 0x6d2b79f5) | 0;
//     let t = Math.imul(a ^ (a >>> 15), 1 | a);
//     t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
//     return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
//   };
// }

// /** Fisher–Yates shuffle using a seeded RNG — deterministic given the same `seedInput`. */
// export function seededShuffle<T>(items: T[], seedInput: string): T[] {
//   const random = mulberry32(hashStringToSeed(seedInput));
//   const result = [...items];
//   for (let i = result.length - 1; i > 0; i--) {
//     const j = Math.floor(random() * (i + 1));
//     [result[i], result[j]] = [result[j], result[i]];
//   }
//   return result;
// }

// /** Deterministically pick `count` items from `items`, seeded by `seedInput`. */
// export function seededPick<T>(items: T[], count: number, seedInput: string): T[] {
//   return seededShuffle(items, seedInput).slice(0, count);
// }






// src/utils/seededRandom.ts
//
// Pure, dependency-free deterministic randomization. Given the same
// seed, seededShuffle/seededPick ALWAYS return the same result — this
// is what makes "same studentId+examId -> identical paper" testable
// without touching the DB.

/** Simple deterministic string -> 32-bit int hash (FNV-ish). */
export function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** mulberry32 PRNG — small, fast, deterministic for a given seed. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic Fisher-Yates shuffle. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Deterministically picks up to `count` items (shuffle then slice). */
export function seededPick<T>(items: T[], count: number, seed: number): T[] {
  return seededShuffle(items, seed).slice(0, Math.max(0, Math.min(count, items.length)));
}
