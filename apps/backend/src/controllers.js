import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import config from './config/index.js';

// In-memory stores
const history = {}; // address -> events[]
const proofs = {}; // proofId -> proof

function ensureAddr(addr) {
  if (!history[addr]) history[addr] = [];
}

function levelFromScore(score) {
  if (score >= 75) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
}

export async function postAiScore(req, res) {
  const { address } = req.body || {};
  if (!address) return res.status(400).json({ error: 'address is required' });

  // Try to forward to python-ai
  try {
    const r = await fetch(`${config.PY_AI_URL}/ai/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });

    if (!r.ok) throw new Error('ai service error');
    const data = await r.json();
    return res.json(data);
  } catch (err) {
    console.warn('AI stub not available, returning fallback', err.message);
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

export async function postScanAddress(req, res) {
  const { address } = req.body || {};
  if (!address) return res.status(400).json({ error: 'address is required' });

  // call AI stub (internal endpoint)
  try {
    const r = await fetch(`${config.BASE_URL}/ai/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });
    const ai = await r.json();

    // persist to history
    ensureAddr(address);
    const event = { type: 'scan', address, ai, timestamp: new Date().toISOString() };
    history[address].push(event);

    return res.json({
      address,
      riskScore: ai.riskScore,
      riskLevel: ai.riskLevel,
      explanation: ai.explanation || '',
    });
  } catch (err) {
    console.error('scan error', err.message);
    return res.status(500).json({ error: 'scan failed' });
  }
}

export async function postAgentDecision(req, res) {
  const { address, riskScore } = req.body || {};
  if (!address || riskScore === undefined) return res.status(400).json({ error: 'address and riskScore are required' });

  const masumiRequestId = uuidv4();
  const decision = riskScore >= 75 ? 'REJECTED' : 'APPROVED';

  ensureAddr(address);
  const event = { type: 'agent', address, masumiRequestId, riskScore, decision, status: 'queued', timestamp: new Date().toISOString() };
  history[address].push(event);

  return res.json({ masumiRequestId, status: 'queued', decision });
}

export async function postContractLog(req, res) {
  const { address, riskScore, masumiDecision } = req.body || {};
  if (!address || riskScore === undefined || !masumiDecision) return res.status(400).json({ error: 'address, riskScore and masumiDecision are required' });

  const proofId = uuidv4();
  const unsignedTxHex = `FAKE_UNSIGNED_TX_${Date.now()}`;
  const proof = {
    proofId,
    address,
    unsignedTxHex,
    metadata: { risk: riskScore, level: levelFromScore(riskScore), masumiDecision },
    timestamp: new Date().toISOString(),
  };

  proofs[proofId] = proof;
  ensureAddr(address);
  history[address].push({ type: 'proof', address, proof, timestamp: new Date().toISOString() });

  return res.json({ unsignedTxHex, metadata: proof.metadata, proofId });
}

export async function getRiskHistory(req, res) {
  const { address } = req.params || {};
  if (!address) return res.status(400).json({ error: 'address is required' });
  ensureAddr(address);
  return res.json({ address, events: history[address] });
}
