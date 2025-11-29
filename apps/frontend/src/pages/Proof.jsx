import { useState } from "react";
import React from "react";
import { Link } from "react-router-dom";
import RiskForm from "../components/RiskForm";
import ComplianceModal from "../components/ComplianceModal";

export default function Proof() {
  const [lastResult, setLastResult] = useState(null);
  const [lastAddress, setLastAddress] = useState("");

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Compliance Proof</h1>
          <nav className="space-x-4">
            <Link to="/" className="text-blue-600">Wallet</Link>
            <Link to="/risk" className="text-blue-600">Risk Checker</Link>
          </nav>
        </header>

        <RiskForm
          defaultAddress={lastAddress}
          onResult={(res, addr) => {
            setLastResult(res);
            setLastAddress(addr);
          }}
        />

        {lastResult && (
          <ComplianceModal
            address={lastAddress}
            score={lastResult.score}
            metadata={lastResult.details}
          />
        )}
      </div>
    </div>
  );
}
