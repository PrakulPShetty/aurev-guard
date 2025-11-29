# AUREV Guard Backend

Start the backend server:

```bash
cd apps/backend
npm install
npm start
```

Backend runs on port 3001 by default. Endpoints:
- POST /scan/address
- POST /ai/score
- POST /agent/decision
- POST /contract/log
- GET  /risk/history/:address

This backend uses in-memory stores for history and proofs. All external integrations are mocked.
