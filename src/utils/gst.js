// GST (Goods & Services Tax) helpers.
//
// - calculateGST(amounts, rate)  -> GST due on each amount, at one rate.
// - findCombination(items, target, opts) -> ONE subset of `items` whose
//   gstPaise values add up to `target`. Generic 0/1 subset-sum.
// - solve(amounts, target) -> tries every rate in RATES against every
//   amount, then finds a combination of (amount, rate) pairs whose total
//   GST equals `target`. Useful for reconciliation: "we know the total
//   GST collected was X, which invoices/rates produced it?"
//
// Assumptions (enforced at runtime via validation):
//   - amounts and rates are finite, non-negative numbers.
//   - in `solve`, a single original amount can contribute at most ONE
//     (amount, rate) pair to a result — an invoice can't be taxed at two
//     different GST rates simultaneously.

export const RATES = [5, 12, 18];

/** Rupees -> integer paise (1 rupee = 100 paise). */
function toPaise(rupees) {
  return Math.round(rupees * 100);
}

/** Integer paise -> rupees, rounded to 2dp. */
function fromPaise(paise) {
  return Number((paise / 100).toFixed(2));
}

function assertFiniteNonNegative(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(
      `${label} must be a finite, non-negative number (got ${value})`,
    );
  }
}

/**
 * Computes the GST due on each amount at the given rate.
 *
 * @param {number[]} amounts - taxable amounts, in rupees.
 * @param {number} rate - GST rate as a percentage (e.g. 18 for 18%).
 * @returns {Array<{id:string, originalIndex:number, amount:number, rate:number, gst:number, gstPaise:number}>}
 */
export function calculateGST(amounts, rate) {
  if (!Array.isArray(amounts)) {
    throw new TypeError("amounts must be an array");
  }
  assertFiniteNonNegative(rate, "rate");

  return amounts.map((amount, index) => {
    assertFiniteNonNegative(amount, `amounts[${index}]`);

    // amount * rate / 100 (rupees) === amount * rate (paise). Round ONCE,
    // directly in paise, instead of rounding twice with two different
    // methods (toFixed for `gst`, Math.round(n*100) for `gstPaise`, after
    // an intermediate /100). Rounding twice — or routing the value through
    // an unnecessary divide-then-multiply round trip — lets the two fields
    // silently disagree near rounding boundaries (classic example:
    // (1.005).toFixed(2) === "1.00", not "1.01"). Computing `gst` FROM the
    // already-rounded `gstPaise` guarantees they always agree.
    const gstPaise = Math.round(amount * rate);

    return {
      id: `${index}-${rate}`,
      originalIndex: index,
      amount,
      rate,
      gst: fromPaise(gstPaise),
      gstPaise,
    };
  });
}

/**
 * Finds ONE combination of items whose gstPaise sum equals `target`
 * rupees.
 *
 * Implemented as a 0/1 subset-sum dynamic program over reachable sums,
 * instead of a brute-force DFS over all 2^n subsets. The DFS version
 * is fine for a handful of items but becomes unusable well before n=40
 * (2^40 paths); this runs in roughly O(n * distinct reachable sums),
 * bounded above by O(n * target_in_paise).
 *
 * Only non-negative gstPaise values are supported, since the algorithm
 * prunes any partial sum that exceeds the target — that pruning is only
 * valid if adding more items can only increase the running sum.
 *
 * @param {Array<{id?:string, gstPaise:number}>} items
 * @param {number} target - target amount, in rupees.
 * @param {{groupKey?: (item: any, index: number) => unknown}} [options]
 *   groupKey - identifies mutually-exclusive items; at most one item
 *   sharing the same groupKey will appear in the result. Defaults to
 *   each item being its own group (no exclusivity constraint).
 * @returns {Array|null} the matching items, or null if none match.
 */
export function findCombination(items, target, { groupKey } = {}) {
  if (!Array.isArray(items)) {
    throw new TypeError("items must be an array");
  }
  if (typeof target !== "number" || !Number.isFinite(target)) {
    throw new TypeError("target must be a finite number");
  }

  items.forEach((item, i) => {
    if (!Number.isInteger(item.gstPaise) || item.gstPaise < 0) {
      throw new TypeError(
        `items[${i}] (id: ${item.id ?? "unknown"}) has an invalid gstPaise value: ${item.gstPaise}. ` +
          "findCombination only supports non-negative integer paise values.",
      );
    }
  });

  const targetPaise = toPaise(target);
  if (targetPaise < 0) {
    return null; // unreachable: items only ever add non-negative amounts
  }
  if (targetPaise === 0) {
    return []; // the empty combination already sums to zero
  }

  const keyOf = groupKey ?? ((item, i) => item.id ?? i);

  // dp: reachable sum -> first { items, groups } path found that reaches it.
  let dp = new Map([[0, { items: [], groups: new Set() }]]);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.gstPaise === 0) continue; // can never help reach a nonzero target sooner

    const gKey = keyOf(item, i);
    const additions = [];

    for (const [sum, data] of dp) {
      if (data.groups.has(gKey)) continue; // would reuse this item's group
      const newSum = sum + item.gstPaise;
      if (newSum > targetPaise || dp.has(newSum)) continue;
      additions.push([
        newSum,
        {
          items: [...data.items, item],
          groups: new Set(data.groups).add(gKey),
        },
      ]);
    }

    for (const [sum, data] of additions) {
      if (!dp.has(sum)) dp.set(sum, data);
    }

    if (dp.has(targetPaise)) break; // found it, stop early
  }

  const found = dp.get(targetPaise);
  return found ? found.items : null;
}

/**
 * Tries every rate in RATES against every amount, then finds a
 * combination of (amount, rate) pairs whose total GST equals `target`.
 * Each original amount contributes at most ONE (amount, rate) pair to
 * the result.
 *
 * @param {number[]} amounts
 * @param {number} target
 * @returns {{matched: Array, grouped: Record<number, Array>, totalMatched: number, target: number} | null}
 */
export function solve(amounts, target) {
  const allItems = RATES.flatMap((rate) => calculateGST(amounts, rate));
  const matched = findCombination(allItems, target, {
    groupKey: (item) => item.originalIndex,
  });

  if (!matched) {
    return null;
  }

  const grouped = matched.reduce((acc, item) => {
    if (!acc[item.rate]) acc[item.rate] = [];
    acc[item.rate].push(item);
    return acc;
  }, {});

  return {
    matched,
    grouped,
    totalMatched: fromPaise(
      matched.reduce((sum, item) => sum + item.gstPaise, 0),
    ),
    target,
  };
}
