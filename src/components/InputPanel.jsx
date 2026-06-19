import { useState } from "react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function InputPanel({ onCalculate }) {
  const [amounts, setAmounts] = useState([]);
  const [amountInput, setAmountInput] = useState("");
  const [targetText, setTargetText] = useState("");
  const [error, setError] = useState("");

  function addAmount() {
    const val = parseFloat(amountInput);
    if (isNaN(val) || val <= 0) {
      setError("Enter a valid positive amount.");
      return;
    }
    setError("");
    setAmounts((prev) => [val, ...prev]);
    setAmountInput("");
  }

  function removeAmount(index) {
    setAmounts((prev) => prev.filter((_, i) => i !== index));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addAmount();
    }
  }

  function handleCalculate() {
    if (amounts.length === 0) {
      setError("Add at least one amount.");
      return;
    }

    const target = parseFloat(targetText);
    if (isNaN(target) || target <= 0) {
      setError("Enter a valid target GST amount.");
      return;
    }

    setError("");
    onCalculate(amounts, target);
  }

  return (
    <div className="mb-8 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Add amounts
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            type="text"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 4500"
          />
          <button
            onClick={addAmount}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {amounts.length > 0 && (
        <div className="border border-gray-700/50 rounded-lg overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {amounts.map((amt, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2 border-b border-gray-800/50 last:border-0 text-sm"
              >
                <span className="font-mono text-gray-200">{INR.format(amt)}</span>
                <button
                  onClick={() => removeAmount(i)}
                  className="text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Target GST amount
        </label>
        <input
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
