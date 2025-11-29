import { useState } from "react";
import { Link } from "react-router-dom";
import WalletConnect from "../components/WalletConnect";
import React from "react";
import RiskForm from "../components/RiskForm";
import RiskCard from "../components/RiskCard";

export default function Risk() {
  const [walletSession, setWalletSession] = useState(null);
  const [result, setResult] = useState(null);
  const [address, setAddress] = useState("");

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Risk Checker</h1>
          <nav className="space-x-4">
            <Link to="/" className="text-blue-600">Wallet</Link>
            <Link to="/proof" className="text-blue-600">Compliance Proof</Link>
          </nav>
        </header>

        <WalletConnect onConnect={(session) => setWalletSession(session)} />

        <RiskForm
          defaultAddress={walletSession?.address}
          onResult={(res, addr) => {
            setResult(res);
            setAddress(addr);
          }}
        />

        <RiskCard result={result} />
      </div>
    </div>
  );
}
