import React, { useState } from 'react'

export default function Proof(){
  const [address, setAddress] = useState('')
  const [history, setHistory] = useState(null)
  const [info, setInfo] = useState('')

  async function fetchHistory(){
    if (!address) return setInfo('Provide address')
    setInfo('Fetching history...')
    try{
      const res = await fetch(`http://localhost:3001/risk/history/${encodeURIComponent(address)}`)
      const data = await res.json()
      setHistory(data)
      setInfo('History loaded')
      console.log('history', data)
    }catch(err){
      console.error('fetch history failed', err)
      setInfo('Failed to load history: '+err.message)
    }
  }

  return (
    <div>
      <div className="card">
        <h2>Proof & History</h2>
        <input placeholder="address" value={address} onChange={e=>setAddress(e.target.value)} style={{width:'100%',padding:8}} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={fetchHistory}>Load History</button>
        </div>
        <p>{info}</p>
      </div>

      {history && (
        <div className="card">
          <h3>Events ({history.length})</h3>
          {history.length === 0 && <p>No events for this address</p>}
          <ul>
            {history.map((ev, i) => (
              <li key={i} style={{marginBottom:8}}>
                <strong>{ev.type}</strong> - {ev.timestamp}
                <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(ev.data, null, 2)}</pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
