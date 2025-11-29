import React, { useState } from 'react';
import { enableWallet, getUsedAddresses } from '../lib/cardano';

export default function Connect() {
  const [address, setAddress] = useState(localStorage.getItem('aurev_address') || '');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function connect() {
    setError('');
    setStatus('connecting');
    try {
      const { api } = await enableWallet();
      const addrs = await getUsedAddresses(api);
      const primary = addrs?.[0] || '';
      if (!primary) throw new Error('no address found');
      setAddress(primary);
      localStorage.setItem('aurev_address', primary);
      setStatus('connected');
    } catch (err) {
      setError(err.message || 'wallet connect failed');
      setStatus('error');
    }
  }

  function disconnect() {
    setAddress('');
    localStorage.removeItem('aurev_address');
    setStatus('idle');
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Connect Wallet</h2>
      {address ? (
        <div className="mt-3">
          <div>Connected address:</div>
          <div className="font-mono mt-1">{address}</div>
          <button className="mt-3 px-3 py-1 border" onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <div className="mt-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={connect}>Connect Wallet</button>
          <div className="mt-3">Or paste address manually:</div>
          <input className="mt-2 p-2 border w-full" value={address} onChange={(e)=>setAddress(e.target.value)} />
          <button className="mt-2 px-3 py-1 border" onClick={()=>{ localStorage.setItem('aurev_address', address); setStatus('connected'); }}>Save Address</button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>
      )}
    </div>
  );
}
