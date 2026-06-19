import { useState } from "react";
import { solve } from "./utils/gst";
import InputPanel from "./components/InputPanel";
import ResultsPanel from "./components/ResultsPanel";

function App() {
  const [result, setResult] = useState(null);
  const [calculated, setCalculated] = useState(false);

  function handleCalculate(amounts, target) {
    setResult(solve(amounts, target));
    setCalculated(true);
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-gray-900 font-mono">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <header className="mb-10 border-b-4 border-black pb-4">
          <h1 className="text-3xl font-black uppercase tracking-tight">
            GST Reconciler
          </h1>
          <p className="text-sm mt-1 font-bold">
            Find which amounts at 5%, 12%, or 18% GST sum to your target.
          </p>
        </header>

        <InputPanel onCalculate={handleCalculate} />

        {result && <ResultsPanel result={result} />}

        {calculated && !result && (
          <div className="border-4 border-black bg-red-200 p-6 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xl font-black uppercase">
              ✗ No combination found
            </p>
            <p className="text-sm mt-1 font-bold">
              No subset of the GST values adds up to the target amount.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
