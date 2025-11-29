import { useState } from "react";
import { Link } from "react-router-dom";
import React from "react";
import WalletConnect from "../components/WalletConnect";

export default function Wallet() {
  const [walletSession, setWalletSession] = useState(null);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">AUREV Guard</h1>
          <nav className="space-x-4">
            <Link to="/risk" className="text-blue-600">Risk Checker</Link>
            <Link to="/proof" className="text-blue-600">Compliance Proof</Link>
          </nav>
        </header>

        <WalletConnect onConnect={(session) => setWalletSession(session)} />

        {walletSession && (
          <div className="mt-4 text-gray-700">
            Connected Address:
            <span className="font-mono ml-2">{walletSession.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
