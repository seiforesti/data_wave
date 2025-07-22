from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Dict, Any

from sqlmodel import Field, Relationship, SQLModel, Column, JSON


class ScanRuleSet(SQLModel, table=True):
    """Declarative grouping of scan rules (versioned)."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, sa_column_kwargs={"unique": True})
    description: Optional[str] = None
    version: str = Field(default="1.0.0")
    engine_type: str = Field(default="spark", description="Execution engine hint (spark/trino/sql)")
    owner: Optional[str] = Field(index=True)
    state: str = Field(default="draft", description="draft | active | suspended | deprecated")
    tags: List[str] = Field(sa_column=Column(JSON), default_factory=list)

    compiled_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    rules: List["ScanRule"] = Relationship(back_populates="rule_set")


class ScanRule(SQLModel, table=True):
    """Atomic scan rule derived from or belonging to a rule-set."""

    id: Optional[int] = Field(default=None, primary_key=True)
    rule_set_id: int = Field(foreign_key="scanruleset.id")

    # Technical pattern (regex, expression, SQL snippet…)
    pattern: str = Field(description="Rule pattern definition")
    threshold: Optional[float] = Field(default=0.8, ge=0.0, le=1.0)
    entity_scope: str = Field(default="column", description="column|table|schema|file|custom")
    severity: str = Field(default="medium", description="low|medium|high|critical")

    # Contextual metadata
    compliance_mapping: Dict[str, Any] = Field(sa_column=Column(JSON), default_factory=dict)
    classification_mapping: Dict[str, Any] = Field(sa_column=Column(JSON), default_factory=dict)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    rule_set: ScanRuleSet = Relationship(back_populates="rules")