"""
Quantum service for PQC operations and quantum circuit execution.

Integrates liboqs for post-quantum cryptography:
- ML-KEM (FIPS 203): Key Encapsulation Mechanism
- ML-DSA (FIPS 204): Digital Signature Algorithm
- SLH-DSA (FIPS 205): Stateless Hash-Based Signatures
"""

import os
import json
from typing import Tuple, Optional

try:
    import oqs
    OQS_AVAILABLE = True
except ImportError:
    OQS_AVAILABLE = False

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Quantum Service", version="0.1.0")


class SignRequest(BaseModel):
    message: str
    algorithm: str = "ML-DSA-65"


class VerifyRequest(BaseModel):
    message: str
    signature: str
    public_key: str
    algorithm: str = "ML-DSA-65"


class KEMRequest(BaseModel):
    algorithm: str = "ML-KEM-768"


class RandomRequest(BaseModel):
    length: int = 32


@app.get("/healthz")
async def health():
    return {
        "status": "healthy",
        "service": "quantum",
        "oqs_available": OQS_AVAILABLE,
        "algorithms": {
            "kem": ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"],
            "signature": ["ML-DSA-44", "ML-DSA-65", "ML-DSA-87", "SLH-DSA-128s", "SLH-DSA-192s", "SLH-DSA-256s"],
        }
    }


@app.post("/api/v1/quantum/sign")
async def quantum_sign(req: SignRequest):
    if not OQS_AVAILABLE:
        raise HTTPException(503, "oqs library not available")
    with oqs.Signature(req.algorithm) as signer:
        public_key = signer.generate_keypair()
        signature = signer.sign(req.message.encode())
        return {
            "signature": signature.hex(),
            "public_key": public_key.hex(),
            "algorithm": req.algorithm,
            "message_length": len(req.message),
        }


@app.post("/api/v1/quantum/verify")
async def quantum_verify(req: VerifyRequest):
    if not OQS_AVAILABLE:
        raise HTTPException(503, "oqs library not available")
    with oqs.Signature(req.algorithm) as verifier:
        try:
            is_valid = verifier.verify(
                req.message.encode(),
                bytes.fromhex(req.signature),
                bytes.fromhex(req.public_key),
            )
            return {"valid": is_valid, "algorithm": req.algorithm}
        except Exception as e:
            return {"valid": False, "error": str(e), "algorithm": req.algorithm}


@app.post("/api/v1/quantum/kem")
async def key_encapsulation(req: KEMRequest):
    if not OQS_AVAILABLE:
        raise HTTPException(503, "oqs library not available")
    with oqs.KeyEncapsulation(req.algorithm) as kem:
        public_key = kem.generate_keypair()
        ciphertext, shared_secret = kem.encap_secret(public_key)
        return {
            "ciphertext": ciphertext.hex(),
            "shared_secret": shared_secret.hex(),
            "public_key": public_key.hex(),
            "algorithm": req.algorithm,
        }


@app.post("/api/v1/quantum/random")
async def quantum_random(req: RandomRequest):
    random_bytes = os.urandom(req.length)
    return {
        "random": random_bytes.hex(),
        "length": req.length,
        "source": "os_urandom",
    }
