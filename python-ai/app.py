from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import hashlib

app = FastAPI(title="AUREV Guard AI Stub")


class AiRequest(BaseModel):
    address: str


class AiResponse(BaseModel):
    address: str
    riskScore: int
    riskLevel: str
    explanation: str
    modelHash: str
    timestamp: str


def deterministic_score(address: str) -> int:
    # Simple deterministic scoring: use sha256 hex and map to 0-100
    h = hashlib.sha256(address.encode('utf-8')).hexdigest()
    # take first 8 chars as integer
    val = int(h[:8], 16)
    return val % 101


def score_to_level(score: int) -> str:
    if score >= 75:
        return "HIGH"
    if score >= 50:
        return "MEDIUM"
    return "LOW"


@app.post("/ai/score", response_model=AiResponse)
def ai_score(req: AiRequest):
    if not req.address:
        raise HTTPException(status_code=400, detail="address is required")

    score = deterministic_score(req.address)
    level = score_to_level(score)
    explanation = f"Deterministic stub: score derived from address hash (len={len(req.address)})"
    model_hash = hashlib.sha1(b"aurev-ai-stub-v1").hexdigest()
    return AiResponse(
        address=req.address,
        riskScore=score,
        riskLevel=level,
        explanation=explanation,
        modelHash=model_hash,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )
