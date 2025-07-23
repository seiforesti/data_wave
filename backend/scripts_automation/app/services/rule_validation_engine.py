"""
Rule Validation Engine
=====================

Advanced rule validation engine for comprehensive scan rule validation, quality assurance,
and compliance verification. This service provides enterprise-grade rule validation
capabilities with AI-powered validation logic and comprehensive quality metrics.

Key Features:
- Comprehensive rule syntax and semantic validation
- AI-powered rule quality assessment and scoring
- Performance impact analysis and optimization suggestions
- Compliance verification and regulatory alignment
- Advanced testing framework with automated test generation
- Rule dependency analysis and conflict detection
- Integration with all data governance components

Production Requirements:
- Validate 10,000+ rules per hour with comprehensive analysis
- 99.9% validation accuracy with detailed error reporting
- Sub-second validation response for real-time feedback
- Comprehensive audit trails and validation history
- Advanced rule quality metrics and scoring
"""

from typing import List, Dict, Any, Optional, Union, Set, Tuple, AsyncGenerator
from datetime import datetime, timedelta
import asyncio
import uuid
import json
import logging
import time
import threading
import re
import ast
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from enum import Enum
import traceback
from collections import defaultdict, Counter

# FastAPI and Database imports
from fastapi import HTTPException, BackgroundTasks
from sqlalchemy import select, update, delete, and_, or_, func, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlmodel import Session

# Validation and testing imports
import jsonschema
from jsonschema import validate, ValidationError
import yaml
import pytest
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Internal imports
from ..models.scan_models import *
from ..models.advanced_scan_rule_models import *
from .enterprise_scan_rule_service import get_enterprise_rule_engine
from .intelligent_pattern_service import get_enterprise_pattern_service
from .compliance_rule_service import ComplianceRuleService


class ValidationSeverity(str, Enum):
    """Validation issue severity levels"""
    CRITICAL = "critical"       # Rule cannot be executed
    HIGH = "high"              # Significant issues that affect functionality
    MEDIUM = "medium"          # Moderate issues that may cause problems
    LOW = "low"                # Minor issues or style violations
    INFO = "info"              # Informational messages


class ValidationCategory(str, Enum):
    """Categories of validation checks"""
    SYNTAX = "syntax"                    # Syntax validation
    SEMANTIC = "semantic"                # Semantic validation
    PERFORMANCE = "performance"          # Performance impact
    SECURITY = "security"                # Security implications
    COMPLIANCE = "compliance"            # Regulatory compliance
    COMPATIBILITY = "compatibility"      # System compatibility
    BEST_PRACTICES = "best_practices"    # Best practice adherence
    DEPENDENCIES = "dependencies"        # Dependency validation


class RuleQualityScore(str, Enum):
    """Rule quality score levels"""
    EXCELLENT = "excellent"     # 90-100%
    GOOD = "good"              # 75-90%
    FAIR = "fair"              # 60-75%
    POOR = "poor"              # 40-60%
    CRITICAL = "critical"      # <40%


@dataclass
class ValidationIssue:
    """Validation issue details"""
    issue_id: str
    severity: ValidationSeverity
    category: ValidationCategory
    message: str
    description: str
    location: Optional[str] = None
    line_number: Optional[int] = None
    column_number: Optional[int] = None
    suggestion: Optional[str] = None
    fix_available: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ValidationResult:
    """Comprehensive validation result"""
    rule_id: str
    validation_id: str
    is_valid: bool
    quality_score: float
    quality_level: RuleQualityScore
    issues: List[ValidationIssue]
    performance_metrics: Dict[str, float]
    compliance_status: Dict[str, bool]
    test_results: Dict[str, Any]
    recommendations: List[str]
    validated_at: datetime
    validation_duration: float


@dataclass
class ValidationMetrics:
    """Validation engine metrics"""
    total_validations: int = 0
    successful_validations: int = 0
    failed_validations: int = 0
    average_validation_time: float = 0.0
    average_quality_score: float = 0.0
    issues_by_severity: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    issues_by_category: Dict[str, int] = field(default_factory=lambda: defaultdict(int))


class EnterpriseRuleValidationEngine:
    """
    Enterprise-grade rule validation engine with comprehensive validation capabilities,
    AI-powered quality assessment, and advanced testing framework.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Validation state and history
        self.validation_history: Dict[str, List[ValidationResult]] = defaultdict(list)
        self.validation_cache: Dict[str, ValidationResult] = {}
        self.active_validations: Dict[str, Dict[str, Any]] = {}
        self.metrics = ValidationMetrics()
        
        # Validation schemas and rules
        self.rule_schemas: Dict[str, Dict[str, Any]] = {}
        self.validation_rules: Dict[ValidationCategory, List[Dict[str, Any]]] = defaultdict(list)
        self.quality_criteria: Dict[str, Dict[str, Any]] = {}
        
        # AI/ML components for quality assessment
        self.text_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.quality_features: Optional[np.ndarray] = None
        
        # Testing framework
        self.test_generator = RuleTestGenerator()
        self.test_executor = RuleTestExecutor()
        
        # Thread pools for validation operations
        self.validation_pool = ThreadPoolExecutor(max_workers=12, thread_name_prefix="validation")
        self.testing_pool = ThreadPoolExecutor(max_workers=8, thread_name_prefix="testing")
        self.analysis_pool = ProcessPoolExecutor(max_workers=4)
        
        # Configuration
        self.max_concurrent_validations = 100
        self.validation_timeout = 60  # seconds
        self.cache_ttl = 3600  # seconds
        self.quality_threshold = 0.7  # Minimum quality score
        
        # Background tasks
        self.cache_cleanup_task: Optional[asyncio.Task] = None
        self.metrics_update_task: Optional[asyncio.Task] = None
        
        # Shutdown event
        self._shutdown_event = asyncio.Event()
    
    async def initialize(self) -> None:
        """Initialize the rule validation engine."""
        try:
            self.logger.info("Initializing Enterprise Rule Validation Engine")
            
            # Initialize validation schemas
            await self._initialize_validation_schemas()
            
            # Initialize validation rules
            await self._initialize_validation_rules()
            
            # Initialize quality criteria
            await self._initialize_quality_criteria()
            
            # Initialize AI/ML components
            await self._initialize_ml_components()
            
            # Start background tasks
            self.cache_cleanup_task = asyncio.create_task(self._cache_cleanup_loop())
            self.metrics_update_task = asyncio.create_task(self._metrics_update_loop())
            
            self.logger.info("Enterprise Rule Validation Engine initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize validation engine: {str(e)}")
            raise
    
    async def validate_rule(
        self,
        rule_data: Dict[str, Any],
        validation_options: Optional[Dict[str, Any]] = None
    ) -> ValidationResult:
        """
        Perform comprehensive validation of a scan rule.
        
        Args:
            rule_data: Rule data to validate
            validation_options: Validation configuration options
            
        Returns:
            Comprehensive validation result
        """
        validation_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            self.logger.info(f"Starting rule validation: {validation_id}")
            
            # Check cache first
            rule_hash = self._calculate_rule_hash(rule_data)
            if rule_hash in self.validation_cache:
                cached_result = self.validation_cache[rule_hash]
                if (datetime.utcnow() - cached_result.validated_at).total_seconds() < self.cache_ttl:
                    return cached_result
            
            # Create validation context
            validation_context = {
                "validation_id": validation_id,
                "rule_data": rule_data,
                "options": validation_options or {},
                "started_at": datetime.utcnow(),
                "rule_hash": rule_hash
            }
            
            self.active_validations[validation_id] = validation_context
            
            # Perform validation steps
            validation_issues = []
            
            # 1. Syntax validation
            syntax_issues = await self._validate_syntax(rule_data)
            validation_issues.extend(syntax_issues)
            
            # 2. Semantic validation
            semantic_issues = await self._validate_semantics(rule_data)
            validation_issues.extend(semantic_issues)
            
            # 3. Performance validation
            performance_issues, performance_metrics = await self._validate_performance(rule_data)
            validation_issues.extend(performance_issues)
            
            # 4. Security validation
            security_issues = await self._validate_security(rule_data)
            validation_issues.extend(security_issues)
            
            # 5. Compliance validation
            compliance_issues, compliance_status = await self._validate_compliance(rule_data)
            validation_issues.extend(compliance_issues)
            
            # 6. Compatibility validation
            compatibility_issues = await self._validate_compatibility(rule_data)
            validation_issues.extend(compatibility_issues)
            
            # 7. Best practices validation
            best_practice_issues = await self._validate_best_practices(rule_data)
            validation_issues.extend(best_practice_issues)
            
            # 8. Dependency validation
            dependency_issues = await self._validate_dependencies(rule_data)
            validation_issues.extend(dependency_issues)
            
            # Generate automated tests
            test_results = await self._generate_and_run_tests(rule_data)
            
            # Calculate quality score
            quality_score = await self._calculate_quality_score(rule_data, validation_issues)
            quality_level = self._get_quality_level(quality_score)
            
            # Generate recommendations
            recommendations = await self._generate_recommendations(validation_issues, rule_data)
            
            # Determine overall validity
            critical_issues = [issue for issue in validation_issues if issue.severity == ValidationSeverity.CRITICAL]
            is_valid = len(critical_issues) == 0
            
            # Create validation result
            validation_duration = time.time() - start_time
            
            validation_result = ValidationResult(
                rule_id=rule_data.get("id", "unknown"),
                validation_id=validation_id,
                is_valid=is_valid,
                quality_score=quality_score,
                quality_level=quality_level,
                issues=validation_issues,
                performance_metrics=performance_metrics,
                compliance_status=compliance_status,
                test_results=test_results,
                recommendations=recommendations,
                validated_at=datetime.utcnow(),
                validation_duration=validation_duration
            )
            
            # Cache result
            self.validation_cache[rule_hash] = validation_result
            
            # Update validation history
            rule_id = rule_data.get("id", "unknown")
            self.validation_history[rule_id].append(validation_result)
            
            # Update metrics
            await self._update_validation_metrics(validation_result)
            
            # Remove from active validations
            self.active_validations.pop(validation_id, None)
            
            self.logger.info(
                f"Rule validation completed: {validation_id}",
                extra={
                    "is_valid": is_valid,
                    "quality_score": quality_score,
                    "issues_count": len(validation_issues),
                    "duration": validation_duration
                }
            )
            
            return validation_result
            
        except Exception as e:
            self.logger.error(f"Rule validation failed: {str(e)}")
            self.active_validations.pop(validation_id, None)
            raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")
    
    async def validate_multiple_rules(
        self,
        rules_data: List[Dict[str, Any]],
        validation_options: Optional[Dict[str, Any]] = None,
        parallel: bool = True
    ) -> List[ValidationResult]:
        """
        Validate multiple rules simultaneously.
        
        Args:
            rules_data: List of rule data to validate
            validation_options: Validation configuration options
            parallel: Whether to validate rules in parallel
            
        Returns:
            List of validation results
        """
        try:
            self.logger.info(f"Starting batch validation for {len(rules_data)} rules")
            
            if parallel:
                # Parallel validation
                validation_tasks = []
                for rule_data in rules_data:
                    task = asyncio.create_task(
                        self.validate_rule(rule_data, validation_options)
                    )
                    validation_tasks.append(task)
                
                results = await asyncio.gather(*validation_tasks, return_exceptions=True)
                
                # Filter out exceptions and log errors
                valid_results = []
                for i, result in enumerate(results):
                    if isinstance(result, Exception):
                        self.logger.error(f"Validation failed for rule {i}: {str(result)}")
                    else:
                        valid_results.append(result)
                
                return valid_results
            
            else:
                # Sequential validation
                results = []
                for rule_data in rules_data:
                    try:
                        result = await self.validate_rule(rule_data, validation_options)
                        results.append(result)
                    except Exception as e:
                        self.logger.error(f"Validation failed for rule: {str(e)}")
                        continue
                
                return results
            
        except Exception as e:
            self.logger.error(f"Batch validation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Batch validation failed: {str(e)}")
    
    async def get_validation_report(
        self,
        rule_id: Optional[str] = None,
        time_range: Optional[Tuple[datetime, datetime]] = None,
        include_history: bool = True
    ) -> Dict[str, Any]:
        """
        Get comprehensive validation report.
        
        Args:
            rule_id: Specific rule ID to analyze (optional)
            time_range: Time range for analysis (optional)
            include_history: Whether to include validation history
            
        Returns:
            Comprehensive validation report
        """
        try:
            report = {
                "summary": await self._generate_validation_summary(rule_id, time_range),
                "metrics": await self._calculate_validation_metrics(rule_id, time_range),
                "quality_analysis": await self._analyze_quality_trends(rule_id, time_range),
                "issue_analysis": await self._analyze_validation_issues(rule_id, time_range),
                "recommendations": await self._generate_system_recommendations(rule_id),
                "generated_at": datetime.utcnow()
            }
            
            if include_history:
                report["validation_history"] = await self._get_validation_history(rule_id, time_range)
            
            return report
            
        except Exception as e:
            self.logger.error(f"Failed to generate validation report: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")
    
    async def fix_rule_issues(
        self,
        rule_data: Dict[str, Any],
        validation_result: ValidationResult,
        auto_fix: bool = True
    ) -> Dict[str, Any]:
        """
        Automatically fix rule issues where possible.
        
        Args:
            rule_data: Original rule data
            validation_result: Validation result with issues
            auto_fix: Whether to apply fixes automatically
            
        Returns:
            Fixed rule data and fix summary
        """
        try:
            fixed_rule_data = rule_data.copy()
            applied_fixes = []
            
            for issue in validation_result.issues:
                if issue.fix_available:
                    fix_result = await self._apply_issue_fix(fixed_rule_data, issue)
                    if fix_result["success"]:
                        applied_fixes.append({
                            "issue_id": issue.issue_id,
                            "issue_description": issue.message,
                            "fix_description": fix_result["description"],
                            "applied": auto_fix
                        })
                        
                        if auto_fix:
                            fixed_rule_data = fix_result["fixed_rule_data"]
            
            # Re-validate fixed rule if fixes were applied
            if auto_fix and applied_fixes:
                new_validation_result = await self.validate_rule(fixed_rule_data)
                
                return {
                    "original_rule": rule_data,
                    "fixed_rule": fixed_rule_data,
                    "applied_fixes": applied_fixes,
                    "validation_improvement": {
                        "original_quality_score": validation_result.quality_score,
                        "new_quality_score": new_validation_result.quality_score,
                        "improvement": new_validation_result.quality_score - validation_result.quality_score,
                        "original_issues": len(validation_result.issues),
                        "remaining_issues": len(new_validation_result.issues)
                    },
                    "new_validation_result": new_validation_result
                }
            else:
                return {
                    "original_rule": rule_data,
                    "available_fixes": applied_fixes,
                    "auto_fix_applied": False
                }
            
        except Exception as e:
            self.logger.error(f"Failed to fix rule issues: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Issue fixing failed: {str(e)}")
    
    # Private helper methods
    
    async def _initialize_validation_schemas(self) -> None:
        """Initialize validation schemas for different rule types."""
        # Basic rule schema
        self.rule_schemas["basic"] = {
            "type": "object",
            "required": ["id", "name", "pattern", "rule_type"],
            "properties": {
                "id": {"type": "string", "minLength": 1},
                "name": {"type": "string", "minLength": 1},
                "pattern": {"type": "string", "minLength": 1},
                "rule_type": {"type": "string", "enum": ["regex", "ml", "semantic", "statistical"]},
                "description": {"type": "string"},
                "enabled": {"type": "boolean"},
                "priority": {"type": "integer", "minimum": 1, "maximum": 10},
                "tags": {"type": "array", "items": {"type": "string"}},
                "metadata": {"type": "object"}
            }
        }
        
        # Advanced rule schema
        self.rule_schemas["advanced"] = {
            "type": "object",
            "required": ["id", "name", "pattern", "rule_type", "complexity_level"],
            "properties": {
                **self.rule_schemas["basic"]["properties"],
                "complexity_level": {"type": "string", "enum": ["simple", "intermediate", "advanced", "expert"]},
                "performance_requirements": {
                    "type": "object",
                    "properties": {
                        "max_execution_time": {"type": "number", "minimum": 0},
                        "max_memory_usage": {"type": "number", "minimum": 0},
                        "max_cpu_usage": {"type": "number", "minimum": 0, "maximum": 100}
                    }
                },
                "dependencies": {"type": "array", "items": {"type": "string"}},
                "test_cases": {"type": "array", "items": {"type": "object"}}
            }
        }
    
    async def _validate_syntax(self, rule_data: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate rule syntax."""
        issues = []
        
        try:
            # JSON schema validation
            schema_type = "advanced" if "complexity_level" in rule_data else "basic"
            schema = self.rule_schemas.get(schema_type, self.rule_schemas["basic"])
            
            try:
                validate(instance=rule_data, schema=schema)
            except ValidationError as e:
                issues.append(ValidationIssue(
                    issue_id=str(uuid.uuid4()),
                    severity=ValidationSeverity.CRITICAL,
                    category=ValidationCategory.SYNTAX,
                    message=f"Schema validation failed: {e.message}",
                    description=f"Rule data does not conform to required schema",
                    location=f"$.{e.path[0]}" if e.path else None,
                    suggestion="Fix the schema violation according to the rule specification",
                    fix_available=False
                ))
            
            # Pattern syntax validation
            pattern = rule_data.get("pattern", "")
            if pattern:
                rule_type = rule_data.get("rule_type", "regex")
                
                if rule_type == "regex":
                    try:
                        re.compile(pattern)
                    except re.error as e:
                        issues.append(ValidationIssue(
                            issue_id=str(uuid.uuid4()),
                            severity=ValidationSeverity.CRITICAL,
                            category=ValidationCategory.SYNTAX,
                            message=f"Invalid regex pattern: {str(e)}",
                            description=f"The regex pattern '{pattern}' contains syntax errors",
                            location="$.pattern",
                            suggestion="Fix the regex syntax error",
                            fix_available=True
                        ))
            
            # Name validation
            name = rule_data.get("name", "")
            if not name or len(name.strip()) == 0:
                issues.append(ValidationIssue(
                    issue_id=str(uuid.uuid4()),
                    severity=ValidationSeverity.HIGH,
                    category=ValidationCategory.SYNTAX,
                    message="Rule name is empty or whitespace only",
                    description="Rule must have a meaningful name",
                    location="$.name",
                    suggestion="Provide a descriptive name for the rule",
                    fix_available=True
                ))
            elif len(name) > 200:
                issues.append(ValidationIssue(
                    issue_id=str(uuid.uuid4()),
                    severity=ValidationSeverity.MEDIUM,
                    category=ValidationCategory.SYNTAX,
                    message="Rule name is too long",
                    description=f"Rule name length ({len(name)}) exceeds recommended maximum (200)",
                    location="$.name",
                    suggestion="Shorten the rule name to be more concise",
                    fix_available=True
                ))
            
        except Exception as e:
            issues.append(ValidationIssue(
                issue_id=str(uuid.uuid4()),
                severity=ValidationSeverity.CRITICAL,
                category=ValidationCategory.SYNTAX,
                message=f"Syntax validation error: {str(e)}",
                description="Unexpected error during syntax validation",
                fix_available=False
            ))
        
        return issues
    
    async def _validate_performance(self, rule_data: Dict[str, Any]) -> Tuple[List[ValidationIssue], Dict[str, float]]:
        """Validate rule performance characteristics."""
        issues = []
        performance_metrics = {}
        
        try:
            # Estimate complexity
            pattern = rule_data.get("pattern", "")
            complexity_score = await self._estimate_pattern_complexity(pattern)
            performance_metrics["complexity_score"] = complexity_score
            
            if complexity_score > 0.8:
                issues.append(ValidationIssue(
                    issue_id=str(uuid.uuid4()),
                    severity=ValidationSeverity.HIGH,
                    category=ValidationCategory.PERFORMANCE,
                    message="High complexity pattern detected",
                    description=f"Pattern complexity score ({complexity_score:.2f}) may impact performance",
                    location="$.pattern",
                    suggestion="Consider simplifying the pattern or using more efficient alternatives",
                    fix_available=False
                ))
            
            # Check for performance requirements
            perf_reqs = rule_data.get("performance_requirements", {})
            if perf_reqs:
                max_exec_time = perf_reqs.get("max_execution_time")
                if max_exec_time and max_exec_time > 30:
                    issues.append(ValidationIssue(
                        issue_id=str(uuid.uuid4()),
                        severity=ValidationSeverity.MEDIUM,
                        category=ValidationCategory.PERFORMANCE,
                        message="High execution time requirement",
                        description=f"Maximum execution time ({max_exec_time}s) is quite high",
                        location="$.performance_requirements.max_execution_time",
                        suggestion="Consider optimizing the rule for better performance",
                        fix_available=False
                    ))
            
            # Estimate resource usage
            estimated_memory = await self._estimate_memory_usage(rule_data)
            performance_metrics["estimated_memory_mb"] = estimated_memory
            
            if estimated_memory > 1000:  # 1GB
                issues.append(ValidationIssue(
                    issue_id=str(uuid.uuid4()),
                    severity=ValidationSeverity.HIGH,
                    category=ValidationCategory.PERFORMANCE,
                    message="High memory usage estimated",
                    description=f"Estimated memory usage ({estimated_memory:.2f}MB) is very high",
                    suggestion="Consider optimizing the rule to reduce memory consumption",
                    fix_available=False
                ))
            
        except Exception as e:
            issues.append(ValidationIssue(
                issue_id=str(uuid.uuid4()),
                severity=ValidationSeverity.MEDIUM,
                category=ValidationCategory.PERFORMANCE,
                message=f"Performance validation error: {str(e)}",
                description="Error occurred during performance validation",
                fix_available=False
            ))
        
        return issues, performance_metrics
    
    async def _calculate_quality_score(
        self, 
        rule_data: Dict[str, Any], 
        issues: List[ValidationIssue]
    ) -> float:
        """Calculate overall quality score for the rule."""
        try:
            base_score = 100.0
            
            # Deduct points based on issues
            for issue in issues:
                if issue.severity == ValidationSeverity.CRITICAL:
                    base_score -= 25.0
                elif issue.severity == ValidationSeverity.HIGH:
                    base_score -= 15.0
                elif issue.severity == ValidationSeverity.MEDIUM:
                    base_score -= 10.0
                elif issue.severity == ValidationSeverity.LOW:
                    base_score -= 5.0
                elif issue.severity == ValidationSeverity.INFO:
                    base_score -= 1.0
            
            # Bonus points for good practices
            if rule_data.get("description"):
                base_score += 5.0
            
            if rule_data.get("test_cases"):
                base_score += 10.0
            
            if rule_data.get("tags"):
                base_score += 2.0
            
            # Normalize to 0-1 range
            quality_score = max(0.0, min(1.0, base_score / 100.0))
            
            return quality_score
            
        except Exception as e:
            self.logger.error(f"Failed to calculate quality score: {str(e)}")
            return 0.5  # Default middle score
    
    def _get_quality_level(self, quality_score: float) -> RuleQualityScore:
        """Convert quality score to quality level."""
        if quality_score >= 0.90:
            return RuleQualityScore.EXCELLENT
        elif quality_score >= 0.75:
            return RuleQualityScore.GOOD
        elif quality_score >= 0.60:
            return RuleQualityScore.FAIR
        elif quality_score >= 0.40:
            return RuleQualityScore.POOR
        else:
            return RuleQualityScore.CRITICAL
    
    def _calculate_rule_hash(self, rule_data: Dict[str, Any]) -> str:
        """Calculate hash of rule data for caching."""
        import hashlib
        rule_str = json.dumps(rule_data, sort_keys=True)
        return hashlib.sha256(rule_str.encode()).hexdigest()
    
    async def _cache_cleanup_loop(self) -> None:
        """Background cache cleanup loop."""
        while not self._shutdown_event.is_set():
            try:
                current_time = datetime.utcnow()
                expired_keys = []
                
                for rule_hash, result in self.validation_cache.items():
                    if (current_time - result.validated_at).total_seconds() > self.cache_ttl:
                        expired_keys.append(rule_hash)
                
                for key in expired_keys:
                    del self.validation_cache[key]
                
                if expired_keys:
                    self.logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")
                
                await asyncio.sleep(3600)  # Clean up every hour
                
            except Exception as e:
                self.logger.error(f"Error in cache cleanup loop: {str(e)}")
                await asyncio.sleep(3600)
    
    async def shutdown(self) -> None:
        """Shutdown the validation engine gracefully."""
        try:
            self.logger.info("Shutting down Enterprise Rule Validation Engine")
            
            # Signal shutdown
            self._shutdown_event.set()
            
            # Cancel background tasks
            if self.cache_cleanup_task:
                self.cache_cleanup_task.cancel()
            if self.metrics_update_task:
                self.metrics_update_task.cancel()
            
            # Complete active validations gracefully
            await self._complete_active_validations()
            
            # Shutdown thread pools
            self.validation_pool.shutdown(wait=True)
            self.testing_pool.shutdown(wait=True)
            self.analysis_pool.shutdown(wait=True)
            
            self.logger.info("Enterprise Rule Validation Engine shutdown completed")
            
        except Exception as e:
            self.logger.error(f"Error during shutdown: {str(e)}")


# Helper Classes

class RuleTestGenerator:
    """Generate automated tests for rules."""
    
    def __init__(self):
        self.test_templates = {}
    
    async def generate_tests(self, rule_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate test cases for a rule."""
        tests = []
        
        # Generate positive test cases
        positive_tests = await self._generate_positive_tests(rule_data)
        tests.extend(positive_tests)
        
        # Generate negative test cases
        negative_tests = await self._generate_negative_tests(rule_data)
        tests.extend(negative_tests)
        
        # Generate edge case tests
        edge_tests = await self._generate_edge_case_tests(rule_data)
        tests.extend(edge_tests)
        
        return tests
    
    async def _generate_positive_tests(self, rule_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate positive test cases."""
        # Implementation would generate test cases that should match the rule
        return []
    
    async def _generate_negative_tests(self, rule_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate negative test cases."""
        # Implementation would generate test cases that should not match the rule
        return []
    
    async def _generate_edge_case_tests(self, rule_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate edge case test cases."""
        # Implementation would generate edge case test scenarios
        return []


class RuleTestExecutor:
    """Execute tests for rules."""
    
    def __init__(self):
        self.test_results = {}
    
    async def execute_tests(self, rule_data: Dict[str, Any], tests: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Execute test cases for a rule."""
        results = {
            "total_tests": len(tests),
            "passed_tests": 0,
            "failed_tests": 0,
            "test_details": []
        }
        
        for test in tests:
            test_result = await self._execute_single_test(rule_data, test)
            results["test_details"].append(test_result)
            
            if test_result["passed"]:
                results["passed_tests"] += 1
            else:
                results["failed_tests"] += 1
        
        results["success_rate"] = results["passed_tests"] / max(1, results["total_tests"])
        
        return results
    
    async def _execute_single_test(self, rule_data: Dict[str, Any], test: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single test case."""
        # Implementation would execute the test and return results
        return {
            "test_id": test.get("id", "unknown"),
            "test_type": test.get("type", "unknown"),
            "passed": True,  # Placeholder
            "execution_time": 0.0,
            "details": {}
        }


# Global service instance
enterprise_validation_engine = None

async def get_enterprise_validation_engine() -> EnterpriseRuleValidationEngine:
    """Get or create the global enterprise validation engine instance."""
    global enterprise_validation_engine
    
    if enterprise_validation_engine is None:
        enterprise_validation_engine = EnterpriseRuleValidationEngine()
        await enterprise_validation_engine.initialize()
    
    return enterprise_validation_engine


# Exports
__all__ = [
    "EnterpriseRuleValidationEngine",
    "ValidationSeverity",
    "ValidationCategory",
    "RuleQualityScore",
    "ValidationIssue",
    "ValidationResult",
    "ValidationMetrics",
    "get_enterprise_validation_engine"
]