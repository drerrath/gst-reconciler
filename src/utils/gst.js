export const RATES = [5, 12, 18];

function toPaise(n) {
  return Math.round(n * 100);
}

function fromPaise(n) {
  return Number((n / 100).toFixed(2));
}

export function calculateGST(amounts, rate) {
  return amounts.map((amount, index) => ({
    id: `${index}-${rate}`,
    amount,
    rate,
    gst: Number(((amount * rate) / 100).toFixed(2)),
    gstPaise: toPaise((amount * rate) / 100),
  }));
}

/**
 * Finds ONE valid combination of items
 * whose gstPaise sum equals target.
 */
export function findCombination(items, target) {
  const targetPaise = toPaise(target);

  function dfs(start, currentSum, chosen) {
    if (currentSum === targetPaise) {
      return chosen;
    }

    if (currentSum > targetPaise) {
      return null;
    }

    for (let i = start; i < items.length; i++) {
      const item = items[i];

      const result = dfs(
        i + 1,
        currentSum + item.gstPaise,
        [...chosen, item],
      );

      if (result) {
        return result;
      }
    }

    return null;
  }

  return dfs(0, 0, []);
}

export function solve(amounts, target) {
  const allItems = RATES.flatMap((rate) =>
    calculateGST(amounts, rate),
  );

  const matched = findCombination(allItems, target);

  if (!matched) {
    return null;
  }

  const grouped = matched.reduce((acc, item) => {
    if (!acc[item.rate]) {
      acc[item.rate] = [];
    }

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
