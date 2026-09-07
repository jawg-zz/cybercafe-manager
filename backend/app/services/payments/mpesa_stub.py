"""M-Pesa Daraja integration stub.

Simulates an STK push: validates the phone number, then returns a
successful result with a fake M-Pesa receipt. Swap `charge()` for a real
Daraja STK push (Lipa Na M-Pesa Online) once credentials are configured
in settings (mpesa_consumer_key, mpesa_consumer_secret, mpesa_passkey,
mpesa_shortcode).
"""
import re
import uuid

from .base import PaymentProvider, PaymentResult

PHONE_RE = re.compile(r"^(?:\+?254|0)?(7\d{8})$")


class MpesaStubProvider(PaymentProvider):
    name = "mpesa"

    def charge(self, amount: float, phone: str | None = None) -> PaymentResult:
        if not phone:
            return PaymentResult(False, "", "Phone number required for M-Pesa")
        match = PHONE_RE.match(phone.strip())
        if not match:
            return PaymentResult(
                False, "", "Invalid phone number (expected 07XXXXXXXX)"
            )
        normalized = "254" + match.group(1)
        return PaymentResult(
            success=True,
            reference=f"MPESA-{uuid.uuid4().hex[:10].upper()}",
            message=f"STK push sent to {normalized} (stub)",
        )
