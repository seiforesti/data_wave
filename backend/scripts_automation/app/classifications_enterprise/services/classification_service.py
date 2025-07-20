import logging
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from ..models.classification_models import (
    ClassificationRule, ClassificationDictionary, ClassificationAudit, ClassificationResult, SensitivityLabelEnum
)
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)

class ClassificationService:
    @staticmethod
    def create_rule(session: Session, rule_data: Dict[str, Any], user: str) -> ClassificationRule:
        try:
            rule = ClassificationRule(**rule_data, created_by=user)
            session.add(rule)
            session.commit()
            session.refresh(rule)
            logger.info(f"Created classification rule: {rule.name}")
            return rule
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error creating rule: {str(e)}")
            raise

    @staticmethod
    def update_rule(session: Session, rule_id: int, updates: Dict[str, Any], user: str) -> Optional[ClassificationRule]:
        rule = session.get(ClassificationRule, rule_id)
        if not rule:
            logger.warning(f"Rule {rule_id} not found for update.")
            return None
        for k, v in updates.items():
            setattr(rule, k, v)
        rule.updated_by = user
        session.commit()
        session.refresh(rule)
        logger.info(f"Updated classification rule: {rule.name}")
        return rule

    @staticmethod
    def delete_rule(session: Session, rule_id: int, user: str) -> bool:
        rule = session.get(ClassificationRule, rule_id)
        if not rule:
            logger.warning(f"Rule {rule_id} not found for delete.")
            return False
        session.delete(rule)
        session.commit()
        logger.info(f"Deleted classification rule: {rule.name}")
        return True

    @staticmethod
    def list_rules(session: Session, active_only: bool = True) -> List[ClassificationRule]:
        query = session.query(ClassificationRule)
        if active_only:
            query = query.filter(ClassificationRule.is_active == True)
        return query.all()

    @staticmethod
    def create_dictionary(session: Session, dict_data: Dict[str, Any], user: str) -> ClassificationDictionary:
        try:
            dictionary = ClassificationDictionary(**dict_data, created_by=user)
            session.add(dictionary)
            session.commit()
            session.refresh(dictionary)
            logger.info(f"Created classification dictionary: {dictionary.name}")
            return dictionary
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error creating dictionary: {str(e)}")
            raise

    @staticmethod
    def update_dictionary(session: Session, dict_id: int, updates: Dict[str, Any], user: str) -> Optional[ClassificationDictionary]:
        dictionary = session.get(ClassificationDictionary, dict_id)
        if not dictionary:
            logger.warning(f"Dictionary {dict_id} not found for update.")
            return None
        for k, v in updates.items():
            setattr(dictionary, k, v)
        dictionary.updated_by = user
        session.commit()
        session.refresh(dictionary)
        logger.info(f"Updated classification dictionary: {dictionary.name}")
        return dictionary

    @staticmethod
    def delete_dictionary(session: Session, dict_id: int, user: str) -> bool:
        dictionary = session.get(ClassificationDictionary, dict_id)
        if not dictionary:
            logger.warning(f"Dictionary {dict_id} not found for delete.")
            return False
        session.delete(dictionary)
        session.commit()
        logger.info(f"Deleted classification dictionary: {dictionary.name}")
        return True

    @staticmethod
    def list_dictionaries(session: Session) -> List[ClassificationDictionary]:
        return session.query(ClassificationDictionary).all()

    @staticmethod
    def apply_rules_to_entity(session: Session, entity_type: str, entity_id: str, data: str, user: str) -> List[ClassificationResult]:
        results = []
        rules = session.query(ClassificationRule).filter_by(is_active=True).all()
        for rule in rules:
            matched = False
            if rule.rule_type == 'regex':
                import re
                if re.search(rule.pattern, data):
                    matched = True
            elif rule.rule_type == 'dictionary':
                dictionary = session.query(ClassificationDictionary).filter_by(name=rule.pattern).first()
                if dictionary and any(term in data for term in dictionary.entries.keys()):
                    matched = True
            # Add more rule types as needed
            if matched:
                result = ClassificationResult(
                    entity_type=entity_type,
                    entity_id=entity_id,
                    rule_id=rule.id,
                    dictionary_id=None,
                    sensitivity_label=rule.sensitivity_label,
                    matched_value=rule.pattern,
                    match_type=rule.rule_type,
                    created_by=user
                )
                session.add(result)
                session.commit()
                session.refresh(result)
                results.append(result)
                ClassificationService.log_audit(
                    session,
                    action="apply_rule",
                    entity_type=entity_type,
                    entity_id=entity_id,
                    rule_id=rule.id,
                    result_id=result.id,
                    performed_by=user,
                    details={"matched_value": rule.pattern, "rule_type": rule.rule_type}
                )
        return results

    @staticmethod
    def bulk_upload_classification_file(session: Session, file_data: List[Dict[str, Any]], user: str) -> List[ClassificationRule]:
        created_rules = []
        for entry in file_data:
            try:
                rule = ClassificationRule(**entry, created_by=user)
                session.add(rule)
                created_rules.append(rule)
            except Exception as e:
                logger.error(f"Error in bulk upload entry: {entry} - {str(e)}")
        session.commit()
        for rule in created_rules:
            session.refresh(rule)
        logger.info(f"Bulk uploaded {len(created_rules)} classification rules.")
        return created_rules

    @staticmethod
    def log_audit(session: Session, action: str, entity_type: str, entity_id: str, rule_id: int, result_id: int, performed_by: str, details: Dict[str, Any]):
        audit = ClassificationAudit(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            rule_id=rule_id,
            result_id=result_id,
            performed_by=performed_by,
            details=details
        )
        session.add(audit)
        session.commit()
        logger.info(f"Audit logged for {action} on {entity_type}:{entity_id}")

    @staticmethod
    def get_audit_trail(session: Session, entity_type: Optional[str] = None, entity_id: Optional[str] = None) -> List[ClassificationAudit]:
        query = session.query(ClassificationAudit)
        if entity_type:
            query = query.filter_by(entity_type=entity_type)
        if entity_id:
            query = query.filter_by(entity_id=entity_id)
        return query.order_by(ClassificationAudit.performed_at.desc()).all()