export const RATES = [5, 12, 18];

function round(n) {
  return Math.round(n * 100);
}

export function calculateGST(amounts, rate) {
  return amounts.map((amt) => ({
    amount: amt,
    rate,
    gst: Number(((amt * rate) / 100).toFixed(2)),
  }));
}

export function findCombination(numbers, target) {
  const nums = numbers.map((n) => round(n));
  const targetValue = round(target);

  function backtrack(start, sum, result) {
    if (sum === targetValue) return result;
    if (sum > targetValue || start >= nums.length) return null;

    for (let i = start; i < nums.length; i++) {
      const found = backtrack(i + 1, sum + nums[i], [...result, numbers[i]]);
      if (found) return found;
    }
    return null;
  }

  return backtrack(0, 0, []);
}

export function solve(amounts, target) {
  const allItems = [];
  for (const rate of RATES) {
    allItems.push(...calculateGST(amounts, rate));
  }

  const matchedGstValues = findCombination(
    allItems.map((i) => i.gst),
    target,
  );

  if (!matchedGstValues) return null;

  const gstSet = new Set(matchedGstValues);
  const matched = allItems.filter((i) => gstSet.has(i.gst));

  const grouped = {};
  for (const item of matched) {
    if (!grouped[item.rate]) grouped[item.rate] = [];
    grouped[item.rate].push(item);
  }

  return {
    matched,
    grouped,
    totalMatched: matched.reduce((s, i) => s + i.gst, 0),
    target,
  };
}
