// gst.test.mjs
//
// Run with:  node --test
// (Node's built-in test runner; no extra dependencies required.)

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { RATES, calculateGST, findCombination, solve } from "./gst.js";

describe("calculateGST", () => {
  test("computes amount, rate, gst and gstPaise for each input", () => {
    const result = calculateGST([100, 200], 18);
    assert.equal(result.length, 2);

    assert.equal(result[0].amount, 100);
    assert.equal(result[0].rate, 18);
    assert.equal(result[0].gst, 18);
    assert.equal(result[0].gstPaise, 1800);
    assert.equal(result[0].id, "0-18");
    assert.equal(result[0].originalIndex, 0);

    assert.equal(result[1].amount, 200);
    assert.equal(result[1].gst, 36);
    assert.equal(result[1].gstPaise, 3600);
  });

  test("gst and gstPaise always agree, even near rounding boundaries", () => {
    // Regression test: amount=0.25 @ 18% used to report gst:0.04 while
    // gstPaise:5 (i.e. 0.05) on the SAME object — a real, frequent bug
    // (roughly 1% of amounts hit this in a sweep from ₹0.01-₹200).
    for (const amount of [0.25, 0.3, 0.9, 1.5, 2.1, 2.9, 8.375]) {
      for (const rate of RATES) {
        const [item] = calculateGST([amount], rate);
        assert.equal(
          item.gst,
          Number((item.gstPaise / 100).toFixed(2)),
          `gst/gstPaise disagree for amount=${amount}, rate=${rate}`,
        );
      }
    }
  });

  test("rejects a non-array amounts argument", () => {
    assert.throws(() => calculateGST("not an array", 18), TypeError);
  });

  test("rejects negative amounts", () => {
    assert.throws(() => calculateGST([100, -5], 18), TypeError);
  });

  test("rejects a negative or non-numeric rate", () => {
    assert.throws(() => calculateGST([100], -18), TypeError);
    assert.throws(() => calculateGST([100], "18"), TypeError);
  });
});

describe("findCombination", () => {
  test("finds a combination that sums to the target", () => {
    const items = calculateGST([100, 200, 300], 18); // gst: 18, 36, 54
    const result = findCombination(items, 54); // 18 + 36
    assert.ok(result);
    const sum = result.reduce((s, i) => s + i.gstPaise, 0);
    assert.equal(sum, 5400);
  });

  test("returns null when no combination matches", () => {
    const items = calculateGST([100, 200], 18); // gst: 18, 36
    assert.equal(findCombination(items, 999), null);
  });

  test("target of 0 matches the empty combination", () => {
    const items = calculateGST([100, 200], 18);
    assert.deepEqual(findCombination(items, 0), []);
  });

  test("groupKey prevents two items in the same group from both being chosen", () => {
    const items = [
      { id: "a", group: "x", gstPaise: 500 },
      { id: "b", group: "x", gstPaise: 700 },
      { id: "c", group: "y", gstPaise: 300 }, // doesn't combine with anything to hit 1200
    ];
    // 1200 is only reachable by combining "a" and "b", which share group
    // "x" — that combination must be rejected.
    const result = findCombination(items, 12, { groupKey: (i) => i.group });
    assert.equal(result, null);
  });

  test("rejects negative gstPaise values", () => {
    const items = [{ id: "a", gstPaise: -100 }];
    assert.throws(() => findCombination(items, 5), TypeError);
  });

  test("stays fast on inputs that would be infeasible for brute-force 2^n search", () => {
    // 60 items -> 2^60 subsets for the old DFS implementation (effectively
    // infinite). An unreachable target forces the DP to examine its full
    // search space, so this also exercises the worst case.
    const amounts = Array.from({ length: 60 }, (_, i) => i + 1);
    const items = calculateGST(amounts, 18);
    const totalPaise = items.reduce((s, i) => s + i.gstPaise, 0);
    const unreachableTarget = (totalPaise + 1) / 100; // off by 1 paise from the max possible sum

    const start = Date.now();
    const result = findCombination(items, unreachableTarget);
    const elapsedMs = Date.now() - start;

    assert.equal(result, null);
    assert.ok(elapsedMs < 2000, `expected < 2s, took ${elapsedMs}ms`);
  });
});

describe("solve", () => {
  test("matches a target using one rate per amount", () => {
    // amount 100 @ 12% = 12, amount 200 @ 5% = 10. 12 + 10 = 22, and no
    // single item or other valid (one-rate-per-amount) combo also equals 22.
    const result = solve([100, 200], 22);
    assert.ok(result);
    assert.equal(result.matched.length, 2);
    assert.equal(result.totalMatched, 22);
    assert.equal(result.target, 22);

    const byIndex = Object.fromEntries(
      result.matched.map((i) => [i.originalIndex, i]),
    );
    assert.equal(byIndex[0].rate, 12);
    assert.equal(byIndex[1].rate, 5);
  });

  test("never assigns two different rates to the same original amount", () => {
    // 23 is only reachable by taking BOTH the 5% (5) and 18% (18) GST
    // amounts from index 0 (5 + 18 = 23) — i.e. taxing the same invoice
    // at two rates at once. That must be rejected, so no match exists.
    const result = solve([100, 200], 23);
    assert.equal(result, null);

    if (result) {
      const indexes = result.matched.map((i) => i.originalIndex);
      assert.equal(
        new Set(indexes).size,
        indexes.length,
        "an amount was used twice",
      );
    }
  });

  test("returns null when no combination matches", () => {
    assert.equal(solve([10, 20], 999), null);
  });

  test("groups matched items by rate", () => {
    const result = solve([100, 200, 300], 18 + 24); // 100@18=18, 200@12=24
    assert.ok(result);
    assert.ok(result.grouped[18] || result.grouped[12]);
  });
});
