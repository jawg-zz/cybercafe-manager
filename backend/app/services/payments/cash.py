import uuid

from .base import PaymentProvider, PaymentResult


class CashProvider(PaymentProvider):
    name = "cash"

    def charge(self, amount: float, phone: str | None = None) -> PaymentResult:
        return PaymentResult(
            success=True,
            reference=f"CASH-{uuid.uuid4().hex[:10].upper()}",
            message="Cash payment recorded",
        )
