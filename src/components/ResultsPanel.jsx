const RATE_COLORS = {
  5: { border: "border-yellow-700/50", bg: "bg-yellow-900/20", badge: "bg-yellow-600", label: "5%" },
  12: { border: "border-blue-700/50", bg: "bg-blue-900/20", badge: "bg-blue-600", label: "12%" },
  18: { border: "border-purple-700/50", bg: "bg-purple-900/20", badge: "bg-purple-600", label: "18%" },
};

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

export default function ResultsPanel({ result }) {
  if (!result) return null;

  const { grouped, totalMatched, target } = result;
  const match = Math.abs(totalMatched - target) < 0.01;

  return (
    <div className="space-y-6">
      <div
        className={`rounded-lg border p-4 text-center ${
          match
            ? "bg-emerald-900/20 border-emerald-700/50 text-emerald-400"
            : "bg-red-900/20 border-red-700/50 text-red-400"
        }`}
      >
        <span className="text-lg font-semibold">
          {match ? "✓ Match found!" : "✗ No exact match"}
        </span>
        <p className="text-sm mt-1 text-gray-400">
          Matched: {INR.format(totalMatched)} &nbsp;|&nbsp; Target: {INR.format(target)}
        </p>
      </div>

      {Object.entries(grouped).map(([rateStr, items]) => {
        const rate = Number(rateStr);
        const colors = RATE_COLORS[rate];
        const subtotal = items.reduce((s, i) => s + i.gst, 0);

        return (
          <div
            key={rate}
            className={`rounded-lg border ${colors.border} ${colors.bg} overflow-hidden`}
          >
            <div className={`${colors.badge} px-4 py-2 text-white font-semibold text-sm`}>
              GST @ {colors.label}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50 text-gray-400">
                  <th className="text-left px-4 py-2 font-medium">Amount</th>
                  <th className="text-right px-4 py-2 font-medium">GST</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-800/50 text-gray-300 last:border-0"
                  >
                    <td className="px-4 py-2 font-mono">{INR.format(item.amount)}</td>
                    <td className="px-4 py-2 text-right font-mono text-emerald-400">
                      {INR.format(item.gst)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-600/50 text-gray-200 font-semibold">
                  <td className="px-4 py-2">Subtotal</td>
                  <td className="px-4 py-2 text-right font-mono">{INR.format(subtotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}
    </div>
  );
}
