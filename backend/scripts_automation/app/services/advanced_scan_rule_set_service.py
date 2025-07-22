from __future__ import annotations

from typing import List, Dict, Any, Tuple
from datetime import datetime

from sqlmodel import Session, select

from app.models.scan_rule_set_models import ScanRuleSet, ScanRule
from app.services.event_bus_service import EventBusService  # hypothetical shared service
from app.services.security_service import SecurityService


class RuleSetCompilerError(Exception):
    """Raised when rule-set compilation fails."""


class AdvancedScanRuleSetService:
    """Enterprise-grade Scan Rule-Set service.

    Responsibilities:
        • CRUD & version rule-sets
        • Validate & compile to atomic rules
        • Impact analysis vis-à-vis catalog & classification assets
        • Emit events for Scan Logic scheduler
    """

    # ---------------------------------------------------------------------
    # CRUD
    # ---------------------------------------------------------------------
    @staticmethod
    def create_rule_set(session: Session, meta: Dict[str, Any], rules: List[Dict[str, Any]], user: str) -> ScanRuleSet:
        SecurityService.assert_can("scan_rule_set_create", user)

        rule_set = ScanRuleSet(
            name=meta["name"],
            description=meta.get("description"),
            version=meta.get("version", "1.0.0"),
            engine_type=meta.get("engine_type", "spark"),
            owner=user,
            tags=meta.get("tags", []),
            state="draft",
        )
        session.add(rule_set)
        session.flush()  # to get PK

        for r in rules:
            scan_rule = ScanRule(
                rule_set_id=rule_set.id,
                pattern=r["pattern"],
                threshold=r.get("threshold", 0.8),
                entity_scope=r.get("entity_scope", "column"),
                severity=r.get("severity", "medium"),
                compliance_mapping=r.get("compliance_mapping", {}),
                classification_mapping=r.get("classification_mapping", {}),
            )
            session.add(scan_rule)

        session.commit()

        EventBusService.publish(
            topic="rule-set.created",
            payload={"ruleSetId": rule_set.id, "user": user, "timestamp": datetime.utcnow().isoformat()}
        )
        return rule_set

    @staticmethod
    def get_rule_set(session: Session, rule_set_id: int) -> ScanRuleSet:
        return session.get(ScanRuleSet, rule_set_id)

    # ------------------------------------------------------------------
    # Compilation
    # ------------------------------------------------------------------
    @staticmethod
    def compile_rule_set(session: Session, rule_set_id: int, user: str) -> Tuple[ScanRuleSet, List[ScanRule]]:
        """Validates & freezes a rule-set, marking it compiled."""
        SecurityService.assert_can("scan_rule_set_compile", user)

        rule_set = session.get(ScanRuleSet, rule_set_id)
        if not rule_set:
            raise ValueError("Rule-set not found")

        if rule_set.state not in ("draft", "suspended"):
            raise RuleSetCompilerError("Only draft/suspended rule-sets can be compiled")

        # --- Validation (simplified) ---------------------------------------------------
        for rule in rule_set.rules:
            AdvancedScanRuleSetService._validate_rule(rule)

        rule_set.state = "active"
        rule_set.compiled_at = datetime.utcnow()
        rule_set.updated_at = datetime.utcnow()
        session.add(rule_set)
        session.commit()

        EventBusService.publish(
            topic="rule-set.compiled",
            payload={"ruleSetId": rule_set.id, "version": rule_set.version}
        )
        return rule_set, rule_set.rules

    # ------------------------------------------------------------------
    # Impact analysis (stub)
    # ------------------------------------------------------------------
    @staticmethod
    def analyse_impact(session: Session, rule_set_id: int) -> Dict[str, Any]:
        """Compute how many assets / classifications would be touched by this rule-set."""
        # TODO: join with CatalogAsset & ClassificationResult once services are in place
        return {"assetsAffected": 0, "estimatedRuntime": "TBD"}

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _validate_rule(rule: ScanRule) -> None:
        if not rule.pattern:
            raise RuleSetCompilerError("Rule pattern cannot be empty")
        # Add more complex validation such as checking regex compile, etc.