import React, { useState } from 'react';
import { scanAddress, getAgentDecision, contractLog } from '../lib/api';
import { enableWallet } from '../lib/cardano';

function ScoreBox({ score, level, explanation }) {
  const color = level === 'HIGH' ? 'bg-red-100 text-red-800' : level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
  return (
    <div className={`p-4 rounded border ${color}`}>
      <div className="text-sm">Risk Level: <strong>{level}</strong></div>
      <div className="text-3xl font-bold">{score}</div>
      <div className="mt-2 text-sm text-gray-700">{explanation}</div>
    </div>
  );
}

export default function RiskChecker() {
  const [address, setAddress] = useState(localStorage.getItem('aurev_address') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [unsignedTx, setUnsignedTx] = useState('');
  const [signedTx, setSignedTx] = useState('');
  const [error, setError] = useState('');

  async function checkRisk(e){
    e?.preventDefault();
    setError('');
    if(!address) { setError('address required'); return; }
    setLoading(true);
    try{
      const res = await scanAddress(address);
      setResult(res);
    }catch(err){ setError(err.message || 'scan failed'); }
    setLoading(false);
  }

  async function generateProof(){
    setError('');
    if(!result) return;
    try{
      const agent = await getAgentDecision(address, result.riskScore);
      const masumiDecision = agent.data?.decision || agent.decision || 'APPROVED';
      const log = await contractLog({ address, riskScore: result.riskScore, masumiDecision });
      const unsigned = log.data?.unsignedTxHex || log.unsignedTxHex || '';
      setUnsignedTx(unsigned);
    }catch(err){ setError(err.message || 'proof generation failed'); }
  }

  async function signTx(){
    setError('');
    if(!unsignedTx) return;
    try{
      const { api } = await enableWallet();
      if(!api || !api.signTx) throw new Error('wallet signTx not available');
      // try sign
      let signed;
      try{
        signed = await api.signTx(unsignedTx, true);
      }catch(e){
        // try without witness flag
        signed = await api.signTx(unsignedTx);
      }
      setSignedTx(typeof signed === 'string' ? signed : JSON.stringify(signed));
    }catch(err){
      // fallback: simulate signed tx
      setSignedTx(`SIMULATED_SIGNED_TX_${Date.now()}`);
      setError('Could not sign with wallet; simulated signedTx provided');
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Risk Checker</h2>
      <form onSubmit={checkRisk} className="mt-3">
        <input className="p-2 border w-full" value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="addr_test..." />
        <div className="mt-2 flex gap-2">
          <button className="px-3 py-1 bg-blue-600 text-white" type="submit" disabled={loading}>{loading? 'Scanning...':'Check Risk'}</button>
          <button type="button" className="px-3 py-1 border" onClick={()=>{ setAddress(localStorage.getItem('aurev_address')||''); }}>Autofill</button>
        </div>
      </form>

      {error && <div className="text-red-600 mt-3">{error}</div>}

      {result && (
        <div className="mt-4">
          <ScoreBox score={result.riskScore} level={result.riskLevel} explanation={result.explanation} />
          <div className="mt-3">
            <button className="px-3 py-1 bg-indigo-600 text-white" onClick={generateProof}>Generate Proof</button>
          </div>
        </div>
      )}

      {unsignedTx && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h4 className="font-medium">Unsigned Transaction Hex</h4>
          <pre className="text-xs break-all mt-2">{unsignedTx}</pre>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 border" onClick={()=>navigator.clipboard.writeText(unsignedTx)}>Copy</button>
            <button className="px-3 py-1 bg-green-600 text-white" onClick={signTx}>Sign with Wallet</button>
          </div>
        </div>
      )}

      {signedTx && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h4 className="font-medium">Signed Transaction (simulated)</h4>
          <pre className="text-xs break-all mt-2">{signedTx}</pre>
        </div>
      )}
    </div>
  );
}
