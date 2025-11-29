# AUREV Guard Backend

Run the backend (Node.js + Express) on port 3001.

Install and start:

```bash
cd backend
npm install
npm start
```

Endpoints:
- `POST /scan/address` -> forwards to AI stub at `http://localhost:5000/ai/score` and stores history
- `POST /ai/score` -> forwards to AI stub or returns fallback
- `POST /agent/decision` -> returns queued decision and stores it
- `POST /contract/log` -> creates unsignedTxHex and proofId, stores proof
- `GET /risk/history/:address` -> returns saved events

History is stored in-memory for demo purposes.
