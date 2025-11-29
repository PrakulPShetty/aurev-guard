import React, { useState } from 'react'

function findWallets() {
  if (typeof window === 'undefined') return []
  const wallets = []
  const known = ['nami', 'eternl', 'flint', 'lace']
  known.forEach(name => {
    if (window.cardano && window.cardano[name]) wallets.push({ id: name, api: window.cardano[name] })
  })
  // include any other injected providers
  if (window.cardano) {
    Object.keys(window.cardano).forEach(k => {
      if (!known.includes(k)) wallets.push({ id: k, api: window.cardano[k] })
    })
  }
  return wallets
}

export default function Connect(){
  const [walletApi, setWalletApi] = useState(null)
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')

  const wallets = findWallets()

  async function connectWallet(provider){
    setMessage('Requesting wallet access...')
    try{
      const api = await provider.enable()
      setWalletApi(api)
      // Try to get a usable address
      let used = null
      if (api.getUsedAddresses) {
        const addrs = await api.getUsedAddresses()
        if (Array.isArray(addrs) && addrs.length) used = addrs[0]
      }
      if (!used && api.getChangeAddress) {
        used = await api.getChangeAddress()
      }
      // Some wallets return hex; just display whatever we get. The demo allows manual paste too.
      if (used) setAddress(used)
      setMessage('Connected to wallet')
      console.log('wallet api enabled', api)
    }catch(err){
      console.error('enable failed', err)
      setMessage('Wallet connect failed: ' + (err.message || err))
    }
  }

  return (
    <div>
      <div className="card">
        <h2>Connect Wallet</h2>
        {wallets.length ? (
          <div>
            <p>Detected wallets: {wallets.map(w => w.id).join(', ')}</p>
            {wallets.map(w => (
              <button key={w.id} className="btn" style={{marginRight:8}} onClick={() => connectWallet(w.api)}>{`Connect ${w.id}`}</button>
            ))}
          </div>
        ) : (
          <div>
            <p>No CIP-30 wallets detected in this browser.</p>
            <p>Please install Nami / Eternl / Flint / Lace or paste an address below.</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Connected Address or Manual</h3>
        <input value={address} onChange={e=>setAddress(e.target.value)} style={{width:'100%',padding:8}} placeholder="paste address here or connect wallet" />
        <p style={{marginTop:8}}>{message}</p>
      </div>
    </div>
  )
}
