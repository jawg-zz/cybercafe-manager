from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class PaymentResult:
    success: bool
    reference: str
    message: str = ""


class PaymentProvider(ABC):
    """Pluggable payment provider interface."""

    name: str = "base"

    @abstractmethod
    def charge(self, amount: float, phone: str | None = None) -> PaymentResult:
        """Attempt to charge `amount`. Returns a PaymentResult."""
        raise NotImplementedError
