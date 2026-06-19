const RATE_STYLES = {
  5: { header: "bg-yellow-300", label: "5%" },
  12: { header: "bg-blue-300", label: "12%" },
  18: { header: "bg-purple-300", label: "18%" },
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
        className={`border-4 border-black p-5 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
          match ? "bg-emerald-200" : "bg-red-200"
        }`}
      >
        <p className="text-xl font-black uppercase">
          {match ? "✓ Match found!" : "✗ No exact match"}
        </p>
        <p className="text-sm font-bold mt-1">
          Matched: {INR.format(totalMatched)} &nbsp;|&nbsp; Target:{" "}
          {INR.format(target)}
        </p>
      </div>

      {Object.entries(grouped).map(([rateStr, items]) => {
        const rate = Number(rateStr);
        const style = RATE_STYLES[rate];
        const subtotal = items.reduce((s, i) => s + i.gst, 0);

        return (
          <div
            key={rate}
            className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div
              className={`${style.header} border-b-4 border-black px-4 py-2 font-black text-sm uppercase`}
            >
              GST @ {style.label}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black font-black">
                  <th className="text-left px-4 py-2">Amount</th>
                  <th className="text-right px-4 py-2">GST</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b-2 border-black last:border-b-0 font-bold"
                  >
                    <td className="px-4 py-2">{INR.format(item.amount)}</td>
                    <td className="px-4 py-2 text-right">{INR.format(item.gst)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-black bg-gray-100 font-black">
                  <td className="px-4 py-2">Subtotal</td>
                  <td className="px-4 py-2 text-right">{INR.format(subtotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}
    </div>
  );
}
