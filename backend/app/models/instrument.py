from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.market import Market


class Instrument(Base):
    __tablename__ = "instruments"

    id: Mapped[int] = mapped_column(primary_key=True)
    symbol: Mapped[str] = mapped_column(String(32), index=True)
    name: Mapped[str] = mapped_column(String(255))
    market_id: Mapped[int] = mapped_column(ForeignKey("markets.id"), index=True)
    sector: Mapped[str] = mapped_column(String(128), default="")
    currency: Mapped[str] = mapped_column(String(8), default="USD")
    kind: Mapped[str] = mapped_column(String(16), default="equity")

    market: Mapped[Market] = relationship("Market")
