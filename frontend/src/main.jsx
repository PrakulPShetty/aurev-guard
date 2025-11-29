import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Connect from './pages/Connect'
import RiskChecker from './pages/RiskChecker'
import Proof from './pages/Proof'
import './index.css'

function App(){
  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <h1>AUREV Guard</h1>
          <nav>
            <Link to="/">Connect</Link>
            <Link to="/risk">Risk</Link>
            <Link to="/proof">Proof</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Connect />} />
            <Route path="/risk" element={<RiskChecker />} />
            <Route path="/proof" element={<Proof />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
