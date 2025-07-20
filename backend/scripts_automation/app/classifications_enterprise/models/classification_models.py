from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum, JSON, func
from sqlalchemy.orm import declarative_base, relationship
import enum

Base = declarative_base()

class SensitivityLabelEnum(enum.Enum):
    PUBLIC = "Public"
    INTERNAL = "Internal"
    CONFIDENTIAL = "Confidential"
    RESTRICTED = "Restricted"
    PII = "PII"
    PHI = "PHI"
    PCI = "PCI"
    CUSTOM = "Custom"

class ClassificationRule(Base):
    __tablename__ = "classification_rules"
    id = Column(Integer, primary_key=True)
    name = Column(String(128), nullable=False, unique=True)
    description = Column(Text)
    pattern = Column(String(512), nullable=False)  # regex or dictionary key
    rule_type = Column(String(32), nullable=False)  # regex, dictionary, pattern
    sensitivity_label = Column(Enum(SensitivityLabelEnum), nullable=False)
    is_active = Column(Boolean, default=True)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    created_by = Column(String(64))
    updated_by = Column(String(64))

class ClassificationDictionary(Base):
    __tablename__ = "classification_dictionaries"
    id = Column(Integer, primary_key=True)
    name = Column(String(128), nullable=False, unique=True)
    description = Column(Text)
    entries = Column(JSON, nullable=False)  # {"term": "label", ...}
    version = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    created_by = Column(String(64))
    updated_by = Column(String(64))

class ClassificationAudit(Base):
    __tablename__ = "classification_audit"
    id = Column(Integer, primary_key=True)
    action = Column(String(64), nullable=False)
    entity_type = Column(String(64), nullable=False)  # datasource, table, column
    entity_id = Column(String(128), nullable=False)
    rule_id = Column(Integer, ForeignKey('classification_rules.id'))
    result_id = Column(Integer, ForeignKey('classification_results.id'))
    performed_by = Column(String(64))
    performed_at = Column(DateTime, server_default=func.now())
    details = Column(JSON)
    version = Column(Integer, default=1)

class ClassificationResult(Base):
    __tablename__ = "classification_results"
    id = Column(Integer, primary_key=True)
    entity_type = Column(String(64), nullable=False)  # datasource, table, column
    entity_id = Column(String(128), nullable=False)
    rule_id = Column(Integer, ForeignKey('classification_rules.id'))
    dictionary_id = Column(Integer, ForeignKey('classification_dictionaries.id'))
    sensitivity_label = Column(Enum(SensitivityLabelEnum), nullable=False)
    matched_value = Column(String(512))
    match_type = Column(String(32))  # regex, dictionary, pattern
    created_at = Column(DateTime, server_default=func.now())
    created_by = Column(String(64))
    version = Column(Integer, default=1)

    rule = relationship('ClassificationRule')
    dictionary = relationship('ClassificationDictionary')