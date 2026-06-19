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
    <div className="mb-8 space-y-5">
      <div>
        <label className="block text-sm font-black uppercase mb-1">
          Add amounts
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 border-4 border-black px-3 py-2.5 text-sm font-bold bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
            type="text"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 4500"
          />
          <button
            onClick={addAmount}
            className="border-4 border-black bg-yellow-300 font-black text-sm px-5 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            ADD
          </button>
        </div>
      </div>

      {amounts.length > 0 && (
        <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="max-h-48 overflow-y-auto">
            {amounts.map((amt, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2 border-b-2 border-black last:border-b-0 text-sm font-bold"
              >
                <span>{INR.format(amt)}</span>
                <button
                  onClick={() => removeAmount(i)}
                  className="border-2 border-black bg-red-300 text-xs font-black px-3 py-1 hover:bg-red-400 transition-colors cursor-pointer"
                >
                  REMOVE
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-black uppercase mb-1">
          Target GST amount
        </label>
        <input
          className="w-full border-4 border-black px-3 py-2.5 text-sm font-bold bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
          type="text"
          value={targetText}
          onChange={(e) => setTargetText(e.target.value)}
          placeholder="e.g. 1176.48"
        />
      </div>

      {error && (
        <p className="border-2 border-black bg-red-200 px-3 py-2 text-sm font-bold">
          {error}
        </p>
      )}

      <button
        onClick={handleCalculate}
        className="w-full border-4 border-black bg-emerald-300 font-black text-lg py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
      >
        CALCULATE
      </button>
    </div>
  );
}
