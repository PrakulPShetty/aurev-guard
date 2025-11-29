import React, { useState, useEffect } from 'react'

function colorClass(level){
  if (!level) return ''
  if (level === 'LOW') return 'low'
  if (level === 'MEDIUM') return 'medium'
  return 'high'
}

export default function RiskChecker(){
  const [address, setAddress] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [unsignedTx, setUnsignedTx] = useState(null)
  const [signedTx, setSignedTx] = useState(null)
  const [walletApi, setWalletApi] = useState(null)
  const [info, setInfo] = useState('')

  useEffect(()=>{
    // If a wallet was injected and enabled earlier, it may be on window.cardano.used by connect flow. We don't track global state here.
  }, [])

  async function checkRisk(){
    if (!address) return setInfo('Please provide an address')
    setLoading(true)
    setInfo('Calling backend /scan/address')
    try{
      const resp = await fetch('http://localhost:3001/scan/address', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ address }) })
      const data = await resp.json()
      setResult(data)
      setInfo('Risk fetched')
      console.log('scan response', data)
    }catch(err){
      console.error('scan failed', err)
      setInfo('Scan failed: '+err.message)
    }finally{ setLoading(false) }
  }

  async function generateProof(){
    if (!result) return setInfo('Run risk check first')
    setInfo('Requesting agent decision...')
    try{
      const dec = await (await fetch('http://localhost:3001/agent/decision', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ address, riskScore: result.riskScore }) })).json()
      console.log('agent decision', dec)
      setInfo('Logging contract proof...')
      const log = await (await fetch('http://localhost:3001/contract/log', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ address, riskScore: result.riskScore, masumiDecision: dec }) })).json()
      console.log('contract log', log)
      setUnsignedTx(log.unsignedTxHex)
      setInfo('Unsigned tx created')
    }catch(err){
      console.error('generateProof failed', err)
      setInfo('Generate proof failed: '+err.message)
    }
  }

  async function signTx(){
    setInfo('Attempting to sign with wallet...')
    try{
      if (!window.cardano) throw new Error('No wallet API available')
      // Pick first enabled wallet API
      const keys = Object.keys(window.cardano)
      if (!keys.length) throw new Error('No wallet providers found')
      const provider = window.cardano[keys[0]]
      const api = await provider.enable()
      setWalletApi(api)
      if (!api.signTx) throw new Error('signTx not available in wallet API')
      const signed = await api.signTx(unsignedTx, true)
      console.log('signedTx', signed)
      setSignedTx(signed)
      setInfo('Transaction signed (displayed below)')
    }catch(err){
      console.error('sign failed', err)
      setInfo('Sign failed: '+err.message)
    }
  }

  return (
    <div>
      <div className="card">
        <h2>Risk Checker</h2>
        <input placeholder="address" value={address} onChange={e=>setAddress(e.target.value)} style={{width:'100%',padding:8}} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={checkRisk} disabled={loading}>{loading? 'Checking...' : 'Check Risk'}</button>
        </div>
        <p>{info}</p>
      </div>

      {result && (
        <div className="card">
          <h3>Result</h3>
          <p>Score: <span className={colorClass(result.riskLevel)}>{result.riskScore} ({result.riskLevel})</span></p>
          <p>Explanation: {result.explanation}</p>
          <div style={{marginTop:8}}>
            <button className="btn" onClick={generateProof}>Generate Proof</button>
          </div>
        </div>
      )}

      {unsignedTx && (
        <div className="card">
          <h3>Unsigned Tx</h3>
          <code className="mono">{unsignedTx}</code>
          <div style={{marginTop:8}}>
            <button className="btn" onClick={signTx}>Sign</button>
            <button className="btn secondary" style={{marginLeft:8}} onClick={()=>{navigator.clipboard?.writeText(unsignedTx); setInfo('Copied unsignedTxHex to clipboard')}}>Copy Unsigned Hex</button>
          </div>
        </div>
      )}

      {signedTx && (
        <div className="card">
          <h3>Signed Tx</h3>
          <code className="mono">{signedTx}</code>
        </div>
      )}
    </div>
  )
}
