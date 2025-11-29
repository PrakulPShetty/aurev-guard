const axios = require('axios');

// In-memory history storage: { address: [ events... ] }
const historyStore = {};

function ensureHistory(address) {
  if (!historyStore[address]) historyStore[address] = [];
  return historyStore[address];
}

// Helper to log and create a basic request id
function newReqId() {
  return `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// POST /scan/address
async function scanAddress(req, res) {
  const reqId = newReqId();
  const { address } = req.body || {};
  console.log(`[${reqId}] scanAddress called for`, address);
  if (!address) return res.status(400).json({ error: 'address is required' });

  try {
    const resp = await axios.post('http://localhost:5000/ai/score', { address }, { timeout: 3000 });
    const data = resp.data;
    // save
    ensureHistory(address).push({ type: 'scan', timestamp: new Date().toISOString(), data });
    console.log(`[${reqId}] AI returned score ${data.riskScore} for ${address}`);
    return res.json(data);
  } catch (err) {
    console.error(`[${reqId}] Error contacting AI stub:`, err.message || err);
    const fallback = {
      address,
      riskScore: 50,
      riskLevel: 'MEDIUM',
      explanation: 'AI unavailable fallback',
      modelHash: 'fallback',
      timestamp: new Date().toISOString(),
    };
    ensureHistory(address).push({ type: 'scan', timestamp: new Date().toISOString(), data: fallback, note: 'fallback' });
    return res.json(fallback);
  }
}

// POST /ai/score (forwarding endpoint)
async function aiScore(req, res) {
  const reqId = newReqId();
  const { address } = req.body || {};
  console.log(`[${reqId}] /ai/score forwarding for`, address);
  if (!address) return res.status(400).json({ error: 'address is required' });

  try {
    const resp = await axios.post('http://localhost:5000/ai/score', { address }, { timeout: 3000 });
    return res.json(resp.data);
  } catch (err) {
    console.error(`[${reqId}] AI stub not reachable:`, err.message || err);
    const fallback = {
      address,
      riskScore: 50,
      riskLevel: 'MEDIUM',
      explanation: 'AI unavailable fallback',
      modelHash: 'fallback',
      timestamp: new Date().toISOString(),
    };
    return res.json(fallback);
  }
}

// POST /agent/decision
async function agentDecision(req, res) {
  const reqId = newReqId();
  const { address, riskScore } = req.body || {};
  console.log(`[${reqId}] agentDecision for`, address, 'score=', riskScore);
  if (!address || typeof riskScore === 'undefined') return res.status(400).json({ error: 'address and riskScore are required' });

  const masumiRequestId = `masumi_${Date.now()}`;
  const decision = {
    masumiRequestId,
    status: 'queued',
    decision: 'APPROVED',
    timestamp: new Date().toISOString(),
  };

  ensureHistory(address).push({ type: 'decision', timestamp: new Date().toISOString(), data: { address, riskScore, decision } });
  console.log(`[${reqId}] decision queued ${masumiRequestId} for ${address}`);
  return res.json(decision);
}

// POST /contract/log
function contractLog(req, res) {
  const reqId = newReqId();
  const { address, riskScore, masumiDecision } = req.body || {};
  console.log(`[${reqId}] contractLog for`, address);
  if (!address || typeof riskScore === 'undefined' || !masumiDecision) return res.status(400).json({ error: 'address, riskScore and masumiDecision are required' });

  const timestamp = Date.now();
  const unsignedTxHex = `FAKE_UNSIGNED_TX_${timestamp}`;
  const proofId = `proof_${timestamp}`;
  const metadata = { proofFor: address, riskScore, masumiDecision, createdAt: new Date().toISOString() };

  ensureHistory(address).push({ type: 'proof', timestamp: new Date().toISOString(), data: { proofId, unsignedTxHex, metadata } });
  console.log(`[${reqId}] created proof ${proofId} unsignedTxHex=${unsignedTxHex}`);

  return res.json({ unsignedTxHex, metadata, proofId });
}

// GET /risk/history/:address
function getHistory(req, res) {
  const reqId = newReqId();
  const { address } = req.params || {};
  console.log(`[${reqId}] getHistory for`, address);
  if (!address) return res.status(400).json({ error: 'address is required' });
  return res.json(ensureHistory(address));
}

module.exports = {
  scanAddress,
  aiScore,
  agentDecision,
  contractLog,
  getHistory,
};
