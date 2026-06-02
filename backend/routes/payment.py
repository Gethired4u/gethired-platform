import hashlib
import hmac
import os
import logging

import razorpay
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
router = APIRouter(tags=["payment"])

# ── Service price whitelist (prevents price tampering from frontend) ────────
SERVICE_PRICES = {
    1: 1,          # ₹1 diagnostic
    299: 299,      # Job alerts
    499: 499,      # Interview prep
    599: 599,      # Naukri / LinkedIn
    699: 699,      # LinkedIn boost
    799: 799,      # Resume ATS repair
    999: 999,      # Mock interview / Career Starter
    1499: 1499,    # Project proof
    1999: 1999,    # 30-day sprint
}


def _razorpay_client():
    key_id = os.getenv("RAZORPAY_KEY_ID", "").strip()
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "").strip()
    if not key_id or not key_secret:
        raise HTTPException(
            status_code=503,
            detail="Payment gateway not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.",
        )
    return razorpay.Client(auth=(key_id, key_secret)), key_id


class CreateOrderRequest(BaseModel):
    amount: int = Field(..., gt=0, description="Amount in INR")
    service_name: str = Field(..., max_length=200)


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/payment/create-order")
def create_order(req: CreateOrderRequest) -> dict:
    # Validate amount against whitelist — reject unexpected values
    if req.amount not in SERVICE_PRICES:
        raise HTTPException(status_code=400, detail=f"Invalid amount: ₹{req.amount}.")

    client, key_id = _razorpay_client()

    order = client.order.create({
        "amount": req.amount * 100,   # Razorpay expects paise
        "currency": "INR",
        "receipt": f"gh4u_{req.amount}",
        "notes": {"service": req.service_name},
    })

    logger.info("Razorpay order created: %s for ₹%s (%s)", order["id"], req.amount, req.service_name)

    return {
        "order_id": order["id"],
        "amount": req.amount,
        "currency": "INR",
        "key_id": key_id,
    }


@router.post("/payment/verify")
def verify_payment(req: VerifyPaymentRequest) -> dict:
    """Verify Razorpay payment signature on the server side."""
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "").encode()
    payload = f"{req.razorpay_order_id}|{req.razorpay_payment_id}".encode()
    expected = hmac.new(key_secret, payload, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, req.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment signature verification failed.")

    return {"verified": True, "payment_id": req.razorpay_payment_id}
