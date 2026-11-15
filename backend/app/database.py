from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from sqlalchemy import JSON, DateTime, Float, Integer, String, create_engine, select, text
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column


def _database_url() -> str:
    url = os.getenv("DATABASE_URL", "sqlite:///./resume_rankings.db")
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


DATABASE_URL = _database_url()
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)


class Base(DeclarativeBase):
    pass


class RankingRun(Base):
    __tablename__ = "ranking_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    job_title: Mapped[str] = mapped_column(String(120), nullable=False)
    total_candidates: Mapped[int] = mapped_column(Integer, nullable=False)
    processed: Mapped[int] = mapped_column(Integer, nullable=False)
    failed: Mapped[int] = mapped_column(Integer, nullable=False)
    average_score: Mapped[float] = mapped_column(Float, nullable=False)
    candidates: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False)


def init_database() -> None:
    Base.metadata.create_all(engine)


def check_database() -> None:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))


def save_ranking(payload: dict[str, Any]) -> str:
    run = RankingRun(
        job_title=payload["job_title"],
        total_candidates=payload["total_candidates"],
        processed=payload["processed"],
        failed=payload["failed"],
        average_score=payload["average_score"],
        candidates=payload["candidates"],
    )
    with Session(engine) as session:
        session.add(run)
        session.commit()
        session.refresh(run)
    return run.id


def recent_rankings(limit: int = 10) -> list[RankingRun]:
    with Session(engine) as session:
        statement = select(RankingRun).order_by(RankingRun.created_at.desc()).limit(limit)
        return list(session.scalars(statement))
