import { useState } from "react";
import { contractLog } from "../lib/api";

export default function ComplianceModal({ address, score, metadata }) {
  const [unsignedTxHex, setUnsignedTxHex] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setError("");
    setLoading(true);

    try {
      const res = await contractLog({
        address,
        score,
        metadata,
      });

      setUnsignedTxHex(res.unsignedTxHex || res.unsigned_tx_hex || "");
    } catch (err) {
      setError(err.message || "Failed to generate proof");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded-xl bg-white shadow">
      <button
        onClick={generate}
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate Compliance Proof"}
      </button>

      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}

      {unsignedTxHex && (
        <div className="mt-4">
          <h4 className="font-medium">Unsigned Transaction Hex</h4>

          <pre className="mt-2 p-3 bg-gray-50 rounded-md text-xs overflow-auto break-all">
            {unsignedTxHex}
          </pre>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigator.clipboard.writeText(unsignedTxHex)}
              className="px-3 py-1 border rounded-md"
            >
              Copy
            </button>

            <button
              onClick={() => {
                const blob = new Blob([unsignedTxHex], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "unsigned-tx.hex";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1 border rounded-md"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
