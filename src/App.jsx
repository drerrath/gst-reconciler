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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-100">GST Reconciler</h1>
          <p className="text-gray-400 text-sm mt-1">
            Find which amounts at 5%, 12%, or 18% GST sum to your target.
          </p>
        </header>

        <InputPanel onCalculate={handleCalculate} />

        {result && <ResultsPanel result={result} />}

        {calculated && !result && (
          <div className="rounded-lg border border-red-700/50 bg-red-900/20 p-6 text-center">
            <p className="text-red-400 text-lg font-semibold">
              ✗ No combination found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              No subset of the GST values adds up to the target amount.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
