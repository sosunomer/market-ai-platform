"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-04-24

"""
import sqlalchemy as sa

from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("plan", sa.String(32), nullable=False, server_default="free"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "markets",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("code", sa.String(32), nullable=False, unique=True, index=True),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("country", sa.String(64), nullable=False),
        sa.Column("timezone", sa.String(64), nullable=False, server_default="UTC"),
        sa.Column("kind", sa.String(16), nullable=False, server_default="equity"),
    )
    op.create_table(
        "instruments",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("symbol", sa.String(32), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("market_id", sa.Integer, sa.ForeignKey("markets.id"), nullable=False, index=True),
        sa.Column("sector", sa.String(128), nullable=False, server_default=""),
        sa.Column("currency", sa.String(8), nullable=False, server_default="USD"),
        sa.Column("kind", sa.String(16), nullable=False, server_default="equity"),
    )
    op.create_table(
        "prices",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("instrument_id", sa.Integer, sa.ForeignKey("instruments.id"), nullable=False, index=True),
        sa.Column("ts", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("open", sa.Float, nullable=False),
        sa.Column("high", sa.Float, nullable=False),
        sa.Column("low", sa.Float, nullable=False),
        sa.Column("close", sa.Float, nullable=False),
        sa.Column("volume", sa.Integer, nullable=False, server_default="0"),
    )
    op.create_index(
        "ix_prices_instrument_ts", "prices", ["instrument_id", "ts"], unique=True
    )
    op.create_table(
        "news",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("instrument_id", sa.Integer, sa.ForeignKey("instruments.id"), nullable=True, index=True),
        sa.Column("source", sa.String(128), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("url", sa.String(1024), nullable=False),
        sa.Column("summary", sa.Text, nullable=False, server_default=""),
    )
    op.create_table(
        "subscriptions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("provider", sa.String(32), nullable=False, server_default="stripe"),
        sa.Column("external_id", sa.String(128), nullable=False, server_default=""),
        sa.Column("status", sa.String(32), nullable=False, server_default="inactive"),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "ai_requests",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("instrument_id", sa.Integer, sa.ForeignKey("instruments.id"), nullable=True, index=True),
        sa.Column("timeframe", sa.String(16), nullable=False, server_default="1D"),
        sa.Column("mode", sa.String(16), nullable=False, server_default="short"),
        sa.Column("question", sa.Text, nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "ai_reports",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("ai_request_id", sa.Integer, sa.ForeignKey("ai_requests.id"), nullable=False, index=True),
        sa.Column("summary", sa.Text, nullable=False, server_default=""),
        sa.Column("signals", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("sources", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("ai_reports")
    op.drop_table("ai_requests")
    op.drop_table("subscriptions")
    op.drop_table("news")
    op.drop_index("ix_prices_instrument_ts", table_name="prices")
    op.drop_table("prices")
    op.drop_table("instruments")
    op.drop_table("markets")
    op.drop_table("users")
