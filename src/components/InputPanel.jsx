import { useState } from "react";

export default function InputPanel({ onCalculate }) {
  const [amountsText, setAmountsText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [error, setError] = useState("");

  function handleCalculate() {
    try {
      const amounts = JSON.parse(amountsText);
      if (!Array.isArray(amounts) || amounts.length === 0) {
        setError("Amounts must be a non-empty array.");
        return;
      }

      const target = parseFloat(targetText);
      if (isNaN(target) || target <= 0) {
        setError("Target must be a positive number.");
        return;
      }

      setError("");
      onCalculate(amounts, target);
    } catch {
      setError("Invalid array format. Use e.g. [100, 200, 300]");
    }
  }

  return (
    <div className="mb-8 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Amounts array
        </label>
        <textarea
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y"
          rows={4}
          value={amountsText}
          onChange={(e) => setAmountsText(e.target.value)}
          placeholder="[4500, 2542.37, 2571, ...]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Target GST amount
        </label>
        <input
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          type="text"
          value={targetText}
          onChange={(e) => setTargetText(e.target.value)}
          placeholder="e.g. 1176.48"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleCalculate}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
      >
        Calculate
      </button>
    </div>
  );
}
