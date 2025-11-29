<<<<<<< Updated upstream
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
=======
import React, { useEffect, useState } from 'react';
import { getRiskHistory } from '../lib/api';

export default function Proof() {
  const [address, setAddress] = useState(localStorage.getItem('aurev_address') || '');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    if(!address) return;
    try{
      const res = await getRiskHistory(address);
      setHistory(res.events || res.data?.events || []);
    }catch(err){ setError(err.message || 'failed'); }
  }

  useEffect(()=>{ load(); }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Proof History</h2>
      <div className="mt-3">
        <input className="p-2 border w-full" value={address} onChange={(e)=>setAddress(e.target.value)} />
        <button className="mt-2 px-3 py-1 border" onClick={load}>Load History</button>
      </div>

      {error && <div className="text-red-600 mt-2">{error}</div>}

      <div className="mt-4 space-y-3">
        {history.length === 0 && <div className="text-sm text-gray-600">No events</div>}
        {history.map((ev, i)=> (
          <div key={i} className="p-3 border rounded bg-white">
            <div className="text-xs text-gray-500">{ev.type} • {ev.timestamp}</div>
            <pre className="text-xs mt-2">{JSON.stringify(ev, null, 2)}</pre>
          </div>
        ))}
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
