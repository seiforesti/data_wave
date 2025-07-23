"""
🔍 RULE VALIDATION ENGINE
Advanced rule validation, testing, and quality assurance engine that provides
comprehensive rule verification, automated testing, and intelligent validation frameworks.
"""

from typing import List, Dict, Any, Optional, Union, Set, Tuple, Callable
from datetime import datetime, timedelta
from enum import Enum
import asyncio
import json
import logging
import re
import ast
import numpy as np
from dataclasses import dataclass, asdict
from collections import defaultdict, Counter
import hashlib
from sqlalchemy import and_, or_, func
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ..models.scan_models import (
    Scan, ScanStatus, DataSource, ScanResult
)
from ..models.advanced_scan_rule_models import (
    IntelligentScanRule, RuleExecutionHistory, ScanRulePerformance,
    RuleValidationResult, ValidationTestCase
)
from ..core.database import get_session
from .enterprise_scan_rule_service import EnterpriseScanRuleService
from .intelligent_pattern_service import IntelligentPatternService

logger = logging.getLogger(__name__)

class ValidationSeverity(str, Enum):
    """Validation issue severity levels"""
    CRITICAL = "critical"        # Rule will not work
    HIGH = "high"               # Major functionality issues
    MEDIUM = "medium"           # Performance or minor issues
    LOW = "low"                 # Style or optimization suggestions
    INFO = "info"               # Informational notices

class ValidationType(str, Enum):
    """Types of validation checks"""
    SYNTAX = "syntax"                    # Pattern syntax validation
    SEMANTIC = "semantic"                # Logical correctness
    PERFORMANCE = "performance"          # Performance implications
    SECURITY = "security"                # Security considerations
    COMPATIBILITY = "compatibility"     # Cross-platform compatibility
    COVERAGE = "coverage"                # Pattern coverage analysis
    PRECISION = "precision"              # False positive/negative analysis
    EFFICIENCY = "efficiency"            # Resource efficiency

class TestCaseType(str, Enum):
    """Types of test cases"""
    POSITIVE = "positive"        # Should match
    NEGATIVE = "negative"        # Should not match
    EDGE_CASE = "edge_case"     # Boundary conditions
    PERFORMANCE = "performance"  # Performance benchmarks
    REGRESSION = "regression"    # Prevent regressions

@dataclass
class ValidationIssue:
    """Represents a validation issue"""
    id: str
    severity: ValidationSeverity
    validation_type: ValidationType
    title: str
    description: str
    rule_component: str  # Which part of the rule
    line_number: Optional[int]
    column_number: Optional[int]
    suggested_fix: Optional[str]
    impact_description: str
    resolution_difficulty: str  # easy, medium, hard
    
@dataclass
class TestCase:
    """Represents a test case for rule validation"""
    id: str
    test_type: TestCaseType
    input_data: str
    expected_result: bool
    description: str
    metadata: Dict[str, Any]
    execution_time_ms: Optional[float] = None
    actual_result: Optional[bool] = None
    passed: Optional[bool] = None

@dataclass
class ValidationReport:
    """Comprehensive validation report"""
    rule_id: str
    validation_timestamp: datetime
    overall_score: float  # 0-100
    issues: List[ValidationIssue]
    test_results: List[TestCase]
    performance_metrics: Dict[str, float]
    recommendations: List[str]
    validation_summary: Dict[str, Any]

class PatternSyntaxValidator:
    """Advanced pattern syntax validation"""
    
    def __init__(self):
        self.common_errors = {
            r'\((?![^)]*\))': "Unclosed parenthesis",
            r'\[(?![^\]]*\])': "Unclosed bracket",
            r'\{(?![^}]*\})': "Unclosed brace",
            r'\\$': "Trailing backslash",
            r'\*\*|\+\+|\?\?': "Invalid quantifier repetition",
            r'\[\]': "Empty character class",
            r'\(\)': "Empty group",
        }
        
    async def validate_pattern_syntax(self, pattern: str) -> List[ValidationIssue]:
        """Validate pattern syntax and return issues"""
        
        issues = []
        
        # Basic regex compilation test
        try:
            re.compile(pattern)
        except re.error as e:
            issues.append(ValidationIssue(
                id=f"syntax_error_{hashlib.md5(pattern.encode()).hexdigest()[:8]}",
                severity=ValidationSeverity.CRITICAL,
                validation_type=ValidationType.SYNTAX,
                title="Invalid Regular Expression Syntax",
                description=f"Pattern compilation failed: {str(e)}",
                rule_component="pattern",
                line_number=None,
                column_number=getattr(e, 'pos', None),
                suggested_fix="Fix the regular expression syntax error",
                impact_description="Rule will fail to execute",
                resolution_difficulty="medium"
            ))
            return issues  # Can't continue validation if pattern doesn't compile
        
        # Check for common pattern issues
        for error_pattern, description in self.common_errors.items():
            if re.search(error_pattern, pattern):
                issues.append(ValidationIssue(
                    id=f"pattern_issue_{hashlib.md5(f"{error_pattern}_{pattern}".encode()).hexdigest()[:8]}",
                    severity=ValidationSeverity.HIGH,
                    validation_type=ValidationType.SYNTAX,
                    title=f"Pattern Issue: {description}",
                    description=f"Detected potential issue: {description}",
                    rule_component="pattern",
                    line_number=None,
                    column_number=None,
                    suggested_fix=f"Review and fix the pattern syntax",
                    impact_description="May cause pattern matching failures",
                    resolution_difficulty="easy"
                ))
        
        # Check for performance-impacting patterns
        performance_issues = await self._check_performance_patterns(pattern)
        issues.extend(performance_issues)
        
        # Check for security concerns
        security_issues = await self._check_security_patterns(pattern)
        issues.extend(security_issues)
        
        return issues
    
    async def _check_performance_patterns(self, pattern: str) -> List[ValidationIssue]:
        """Check for patterns that may cause performance issues"""
        
        issues = []
        
        # Catastrophic backtracking patterns
        backtracking_patterns = [
            r'\(.*\*.*\).*\*',  # Nested quantifiers
            r'\(.*\+.*\).*\+',  # Nested plus quantifiers
            r'.*\*.*\*.*',      # Multiple wildcards
        ]
        
        for bt_pattern in backtracking_patterns:
            if re.search(bt_pattern, pattern):
                issues.append(ValidationIssue(
                    id=f"performance_backtrack_{hashlib.md5(pattern.encode()).hexdigest()[:8]}",
                    severity=ValidationSeverity.HIGH,
                    validation_type=ValidationType.PERFORMANCE,
                    title="Potential Catastrophic Backtracking",
                    description="Pattern may cause exponential time complexity",
                    rule_component="pattern",
                    line_number=None,
                    column_number=None,
                    suggested_fix="Use atomic groups or possessive quantifiers",
                    impact_description="May cause severe performance degradation",
                    resolution_difficulty="hard"
                ))
        
        # Very long patterns
        if len(pattern) > 500:
            issues.append(ValidationIssue(
                id=f"long_pattern_{hashlib.md5(pattern.encode()).hexdigest()[:8]}",
                severity=ValidationSeverity.MEDIUM,
                validation_type=ValidationType.PERFORMANCE,
                title="Very Long Pattern",
                description=f"Pattern is {len(pattern)} characters long",
                rule_component="pattern",
                line_number=None,
                column_number=None,
                suggested_fix="Consider breaking into smaller patterns",
                impact_description="May impact compilation and execution performance",
                resolution_difficulty="medium"
            ))
        
        return issues
    
    async def _check_security_patterns(self, pattern: str) -> List[ValidationIssue]:
        """Check for security-related pattern issues"""
        
        issues = []
        
        # ReDoS (Regular Expression Denial of Service) patterns
        redos_patterns = [
            r'\(.*\*.*\|\.*\*.*\)',  # Alternation with quantifiers
            r'\(.*\+.*\)\+',         # Nested plus quantifiers
        ]
        
        for redos_pattern in redos_patterns:
            if re.search(redos_pattern, pattern):
                issues.append(ValidationIssue(
                    id=f"security_redos_{hashlib.md5(pattern.encode()).hexdigest()[:8]}",
                    severity=ValidationSeverity.HIGH,
                    validation_type=ValidationType.SECURITY,
                    title="Potential ReDoS Vulnerability",
                    description="Pattern may be vulnerable to Regular Expression Denial of Service attacks",
                    rule_component="pattern",
                    line_number=None,
                    column_number=None,
                    suggested_fix="Rewrite pattern to avoid nested quantifiers",
                    impact_description="Could be exploited to cause system slowdown",
                    resolution_difficulty="hard"
                ))
        
        return issues

class SemanticValidator:
    """Semantic validation for rule logic and patterns"""
    
    def __init__(self):
        self.data_type_patterns = {
            'email': r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
            'phone': r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            'ssn': r'\d{3}-?\d{2}-?\d{4}',
            'credit_card': r'\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}',
            'ip_address': r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}',
            'url': r'https?://[^\s]+',
            'date': r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',
        }
        
    async def validate_semantic_correctness(
        self,
        rule: IntelligentScanRule
    ) -> List[ValidationIssue]:
        """Validate semantic correctness of the rule"""
        
        issues = []
        
        # Pattern-purpose alignment
        alignment_issues = await self._check_pattern_purpose_alignment(rule)
        issues.extend(alignment_issues)
        
        # Data type consistency
        consistency_issues = await self._check_data_type_consistency(rule)
        issues.extend(consistency_issues)
        
        # Logical contradictions
        contradiction_issues = await self._check_logical_contradictions(rule)
        issues.extend(contradiction_issues)
        
        # Coverage analysis
        coverage_issues = await self._analyze_pattern_coverage(rule)
        issues.extend(coverage_issues)
        
        return issues
    
    async def _check_pattern_purpose_alignment(
        self,
        rule: IntelligentScanRule
    ) -> List[ValidationIssue]:
        """Check if pattern aligns with stated purpose"""
        
        issues = []
        
        if not rule.pattern or not rule.description:
            return issues
        
        # Check if pattern matches described data type
        description_lower = rule.description.lower()
        
        for data_type, expected_pattern in self.data_type_patterns.items():
            if data_type in description_lower:
                # Compare patterns for similarity
                similarity = self._calculate_pattern_similarity(rule.pattern, expected_pattern)
                
                if similarity < 0.3:  # Low similarity threshold
                    issues.append(ValidationIssue(
                        id=f"misaligned_pattern_{rule.id}",
                        severity=ValidationSeverity.MEDIUM,
                        validation_type=ValidationType.SEMANTIC,
                        title="Pattern-Purpose Misalignment",
                        description=f"Pattern doesn't seem to match described purpose for {data_type}",
                        rule_component="pattern",
                        line_number=None,
                        column_number=None,
                        suggested_fix=f"Consider using pattern: {expected_pattern}",
                        impact_description="May not detect intended data type correctly",
                        resolution_difficulty="medium"
                    ))
        
        return issues
    
    def _calculate_pattern_similarity(self, pattern1: str, pattern2: str) -> float:
        """Calculate similarity between two patterns"""
        
        # Simple similarity based on common subsequences
        # This is a simplified approach - more sophisticated methods could be used
        
        def longest_common_subsequence(s1, s2):
            m, n = len(s1), len(s2)
            dp = [[0] * (n + 1) for _ in range(m + 1)]
            
            for i in range(1, m + 1):
                for j in range(1, n + 1):
                    if s1[i-1] == s2[j-1]:
                        dp[i][j] = dp[i-1][j-1] + 1
                    else:
                        dp[i][j] = max(dp[i-1][j], dp[i][j-1])
            
            return dp[m][n]
        
        lcs_length = longest_common_subsequence(pattern1, pattern2)
        max_length = max(len(pattern1), len(pattern2))
        
        return lcs_length / max_length if max_length > 0 else 0.0
    
    async def _check_data_type_consistency(
        self,
        rule: IntelligentScanRule
    ) -> List[ValidationIssue]:
        """Check for data type consistency in patterns"""
        
        issues = []
        
        if not rule.pattern:
            return issues
        
        # Check for mixed data type patterns that might be contradictory
        pattern = rule.pattern
        
        # Example: pattern that tries to match both numbers and letters exclusively
        if re.search(r'\\d+', pattern) and re.search(r'[a-zA-Z]+', pattern):
            # This might be intentional (alphanumeric), so check context
            if not re.search(r'[a-zA-Z0-9]', pattern):  # No explicit alphanumeric class
                issues.append(ValidationIssue(
                    id=f"mixed_types_{rule.id}",
                    severity=ValidationSeverity.LOW,
                    validation_type=ValidationType.SEMANTIC,
                    title="Mixed Data Types",
                    description="Pattern contains both numeric and alphabetic requirements",
                    rule_component="pattern",
                    line_number=None,
                    column_number=None,
                    suggested_fix="Clarify if alphanumeric data is intended",
                    impact_description="Pattern intent may be unclear",
                    resolution_difficulty="easy"
                ))
        
        return issues
    
    async def _check_logical_contradictions(
        self,
        rule: IntelligentScanRule
    ) -> List[ValidationIssue]:
        """Check for logical contradictions in rule conditions"""
        
        issues = []
        
        # This would check for contradictory conditions in complex rules
        # For now, implement basic checks
        
        if hasattr(rule, 'conditions') and rule.conditions:
            # Check for contradictory conditions
            # This is a simplified implementation
            pass
        
        return issues
    
    async def _analyze_pattern_coverage(
        self,
        rule: IntelligentScanRule
    ) -> List[ValidationIssue]:
        """Analyze pattern coverage and potential gaps"""
        
        issues = []
        
        if not rule.pattern:
            return issues
        
        # Check for overly restrictive patterns
        if len(rule.pattern) > 100 and rule.pattern.count('\\') > 20:
            issues.append(ValidationIssue(
                id=f"overly_restrictive_{rule.id}",
                severity=ValidationSeverity.MEDIUM,
                validation_type=ValidationType.COVERAGE,
                title="Potentially Overly Restrictive Pattern",
                description="Pattern may be too specific and miss valid matches",
                rule_component="pattern",
                line_number=None,
                column_number=None,
                suggested_fix="Consider simplifying the pattern",
                impact_description="May have low recall (miss valid data)",
                resolution_difficulty="medium"
            ))
        
        # Check for overly permissive patterns
        if rule.pattern in ['.*', '.+', '.*.*', '.*.+']:
            issues.append(ValidationIssue(
                id=f"overly_permissive_{rule.id}",
                severity=ValidationSeverity.HIGH,
                validation_type=ValidationType.COVERAGE,
                title="Overly Permissive Pattern",
                description="Pattern matches almost anything",
                rule_component="pattern",
                line_number=None,
                column_number=None,
                suggested_fix="Make pattern more specific",
                impact_description="Will have high false positive rate",
                resolution_difficulty="medium"
            ))
        
        return issues

class TestCaseGenerator:
    """Automatic test case generation for rule validation"""
    
    def __init__(self):
        self.test_data_generators = {
            'email': self._generate_email_test_cases,
            'phone': self._generate_phone_test_cases,
            'ssn': self._generate_ssn_test_cases,
            'credit_card': self._generate_credit_card_test_cases,
            'ip_address': self._generate_ip_test_cases,
            'url': self._generate_url_test_cases,
        }
        
    async def generate_test_cases(
        self,
        rule: IntelligentScanRule,
        test_count: int = 20
    ) -> List[TestCase]:
        """Generate comprehensive test cases for a rule"""
        
        test_cases = []
        
        # Generate positive test cases (should match)
        positive_cases = await self._generate_positive_test_cases(rule, test_count // 2)
        test_cases.extend(positive_cases)
        
        # Generate negative test cases (should not match)
        negative_cases = await self._generate_negative_test_cases(rule, test_count // 4)
        test_cases.extend(negative_cases)
        
        # Generate edge cases
        edge_cases = await self._generate_edge_test_cases(rule, test_count // 4)
        test_cases.extend(edge_cases)
        
        return test_cases
    
    async def _generate_positive_test_cases(
        self,
        rule: IntelligentScanRule,
        count: int
    ) -> List[TestCase]:
        """Generate test cases that should match the rule"""
        
        test_cases = []
        
        # Detect data type from rule description or pattern
        data_type = self._detect_data_type(rule)
        
        if data_type and data_type in self.test_data_generators:
            generator = self.test_data_generators[data_type]
            test_data = await generator(count, positive=True)
            
            for i, data in enumerate(test_data):
                test_cases.append(TestCase(
                    id=f"positive_{rule.id}_{i}",
                    test_type=TestCaseType.POSITIVE,
                    input_data=data,
                    expected_result=True,
                    description=f"Should match {data_type} pattern",
                    metadata={"data_type": data_type, "generator": "automatic"}
                ))
        else:
            # Generic positive test cases
            generic_cases = await self._generate_generic_positive_cases(rule, count)
            test_cases.extend(generic_cases)
        
        return test_cases
    
    async def _generate_negative_test_cases(
        self,
        rule: IntelligentScanRule,
        count: int
    ) -> List[TestCase]:
        """Generate test cases that should not match the rule"""
        
        test_cases = []
        
        # Common negative test cases
        negative_examples = [
            "",  # Empty string
            " ",  # Space only
            "null",  # Null-like strings
            "undefined",
            "N/A",
            "123abc!@#",  # Mixed content
            "a" * 1000,  # Very long string
            "🚀💀👍",  # Unicode/emoji
            "\n\t\r",  # Whitespace characters
            "../../etc/passwd",  # Path injection attempts
        ]
        
        for i, data in enumerate(negative_examples[:count]):
            test_cases.append(TestCase(
                id=f"negative_{rule.id}_{i}",
                test_type=TestCaseType.NEGATIVE,
                input_data=data,
                expected_result=False,
                description=f"Should not match: {data[:50]}...",
                metadata={"category": "common_negative"}
            ))
        
        return test_cases
    
    async def _generate_edge_test_cases(
        self,
        rule: IntelligentScanRule,
        count: int
    ) -> List[TestCase]:
        """Generate edge case test scenarios"""
        
        test_cases = []
        
        # Edge cases for pattern boundaries
        edge_examples = [
            "a",  # Single character
            "ab",  # Two characters
            "a" * 255,  # Long but not extreme
            "1",  # Single digit
            "12",  # Two digits
            "!",  # Single special char
            "!!",  # Multiple special chars
        ]
        
        for i, data in enumerate(edge_examples[:count]):
            test_cases.append(TestCase(
                id=f"edge_{rule.id}_{i}",
                test_type=TestCaseType.EDGE_CASE,
                input_data=data,
                expected_result=None,  # Need to determine by running the pattern
                description=f"Edge case: {data}",
                metadata={"category": "boundary_condition"}
            ))
        
        return test_cases
    
    def _detect_data_type(self, rule: IntelligentScanRule) -> Optional[str]:
        """Detect the intended data type from rule description or pattern"""
        
        if not rule.description:
            return None
        
        description_lower = rule.description.lower()
        
        for data_type in self.test_data_generators.keys():
            if data_type in description_lower:
                return data_type
        
        return None
    
    async def _generate_generic_positive_cases(
        self,
        rule: IntelligentScanRule,
        count: int
    ) -> List[TestCase]:
        """Generate generic positive test cases when specific type is unknown"""
        
        test_cases = []
        
        # Try to generate data that would likely match the pattern
        # This is a simplified approach
        
        generic_examples = [
            "test123",
            "example@test.com",
            "123-456-7890",
            "2023-01-01",
            "192.168.1.1",
            "https://example.com",
            "ABC123DEF",
            "user_name_123",
            "Test Data 2023",
            "ID:12345"
        ]
        
        for i, data in enumerate(generic_examples[:count]):
            test_cases.append(TestCase(
                id=f"generic_positive_{rule.id}_{i}",
                test_type=TestCaseType.POSITIVE,
                input_data=data,
                expected_result=None,  # Need to test
                description=f"Generic test case: {data}",
                metadata={"category": "generic"}
            ))
        
        return test_cases
    
    async def _generate_email_test_cases(self, count: int, positive: bool = True) -> List[str]:
        """Generate email test cases"""
        if positive:
            return [
                "user@example.com",
                "test.email@domain.org",
                "first.last@subdomain.example.com",
                "user+tag@example.co.uk",
                "123@example.com",
                "user_name@example-domain.com",
                "a@b.co",
                "very.long.email.address@very.long.domain.example.com"
            ][:count]
        else:
            return [
                "invalid.email",
                "@example.com",
                "user@",
                "user@@example.com",
                "user@.com",
                "user@example.",
                " user@example.com",
                "user@example.com "
            ][:count]
    
    async def _generate_phone_test_cases(self, count: int, positive: bool = True) -> List[str]:
        """Generate phone number test cases"""
        if positive:
            return [
                "123-456-7890",
                "(123) 456-7890",
                "123.456.7890",
                "1234567890",
                "+1-123-456-7890",
                "+1 (123) 456-7890",
                "123 456 7890"
            ][:count]
        else:
            return [
                "123-456-789",  # Too short
                "123-456-78901",  # Too long
                "abc-def-ghij",  # Letters
                "123-45-67890",  # Wrong format
                "12-3456-7890",  # Wrong grouping
            ][:count]
    
    async def _generate_ssn_test_cases(self, count: int, positive: bool = True) -> List[str]:
        """Generate SSN test cases"""
        if positive:
            return [
                "123-45-6789",
                "987654321",
                "555-44-3333"
            ][:count]
        else:
            return [
                "123-45-678",   # Too short
                "123-45-67890", # Too long
                "000-00-0000",  # Invalid SSN
                "abc-de-fghi"   # Letters
            ][:count]
    
    async def _generate_credit_card_test_cases(self, count: int, positive: bool = True) -> List[str]:
        """Generate credit card test cases"""
        if positive:
            return [
                "4111-1111-1111-1111",
                "4111111111111111",
                "4111 1111 1111 1111",
                "5555-5555-5555-4444"
            ][:count]
        else:
            return [
                "4111-1111-1111-111",  # Too short
                "4111-1111-1111-11111", # Too long
                "abcd-efgh-ijkl-mnop"   # Letters
            ][:count]
    
    async def _generate_ip_test_cases(self, count: int, positive: bool = True) -> List[str]:
        """Generate IP address test cases"""
        if positive:
            return [
                "192.168.1.1",
                "10.0.0.1",
                "127.0.0.1",
                "255.255.255.255",
                "8.8.8.8"
            ][:count]
        else:
            return [
                "256.1.1.1",    # Invalid octet
                "192.168.1",    # Incomplete
                "192.168.1.1.1", # Too many octets
                "192.168.-1.1", # Negative
                "a.b.c.d"       # Letters
            ][:count]
    
    async def _generate_url_test_cases(self, count: int, positive: bool = True) -> List[str]:
        """Generate URL test cases"""
        if positive:
            return [
                "https://example.com",
                "http://www.example.org",
                "https://subdomain.example.co.uk/path",
                "http://example.com:8080/path?query=value",
                "https://api.example.com/v1/resource"
            ][:count]
        else:
            return [
                "example.com",      # No protocol
                "ftp://example.com", # Wrong protocol (if HTTP only)
                "https://",         # No domain
                "https:///path",    # No domain
                "http://."          # Invalid domain
            ][:count]

class RuleValidationEngine:
    """
    🔍 RULE VALIDATION ENGINE
    
    Advanced rule validation, testing, and quality assurance engine that provides
    comprehensive rule verification, automated testing, and intelligent validation
    frameworks for enterprise-level data governance scanning rules.
    """
    
    def __init__(self):
        self.syntax_validator = PatternSyntaxValidator()
        self.semantic_validator = SemanticValidator()
        self.test_generator = TestCaseGenerator()
        self.enterprise_rule_service = EnterpriseScanRuleService()
        self.pattern_service = IntelligentPatternService()
        
        # Validation cache
        self.validation_cache = {}
        self.test_case_cache = {}
        
    async def validate_rule_comprehensive(
        self,
        rule_id: str,
        include_test_generation: bool = True,
        include_performance_testing: bool = True
    ) -> ValidationReport:
        """Perform comprehensive validation of a scan rule"""
        
        with get_session() as session:
            rule = session.query(IntelligentScanRule).filter(
                IntelligentScanRule.id == rule_id
            ).first()
            
            if not rule:
                raise HTTPException(status_code=404, detail="Rule not found")
            
            try:
                validation_start = datetime.utcnow()
                
                # Collect all validation issues
                all_issues = []
                
                # Syntax validation
                syntax_issues = await self.syntax_validator.validate_pattern_syntax(rule.pattern)
                all_issues.extend(syntax_issues)
                
                # Semantic validation
                semantic_issues = await self.semantic_validator.validate_semantic_correctness(rule)
                all_issues.extend(semantic_issues)
                
                # Generate and run test cases if requested
                test_results = []
                if include_test_generation:
                    test_cases = await self.test_generator.generate_test_cases(rule)
                    test_results = await self._execute_test_cases(rule, test_cases)
                
                # Performance testing
                performance_metrics = {}
                if include_performance_testing:
                    performance_metrics = await self._run_performance_tests(rule)
                
                # Calculate overall score
                overall_score = self._calculate_validation_score(all_issues, test_results)
                
                # Generate recommendations
                recommendations = await self._generate_validation_recommendations(
                    rule, all_issues, test_results, performance_metrics
                )
                
                # Create validation summary
                validation_summary = self._create_validation_summary(
                    all_issues, test_results, performance_metrics
                )
                
                # Create comprehensive report
                report = ValidationReport(
                    rule_id=rule_id,
                    validation_timestamp=validation_start,
                    overall_score=overall_score,
                    issues=all_issues,
                    test_results=test_results,
                    performance_metrics=performance_metrics,
                    recommendations=recommendations,
                    validation_summary=validation_summary
                )
                
                # Cache the validation result
                self.validation_cache[rule_id] = {
                    'report': report,
                    'timestamp': validation_start
                }
                
                logger.info(f"Validation completed for rule {rule_id}: score {overall_score:.1f}")
                
                return report
                
            except Exception as e:
                logger.error(f"Validation failed for rule {rule_id}: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")
    
    async def _execute_test_cases(
        self,
        rule: IntelligentScanRule,
        test_cases: List[TestCase]
    ) -> List[TestCase]:
        """Execute test cases against the rule"""
        
        if not rule.pattern:
            return test_cases
        
        try:
            compiled_pattern = re.compile(rule.pattern)
        except re.error:
            # Can't test if pattern doesn't compile
            for test_case in test_cases:
                test_case.passed = False
                test_case.actual_result = False
            return test_cases
        
        executed_cases = []
        
        for test_case in test_cases:
            start_time = datetime.utcnow()
            
            try:
                # Execute the pattern against test data
                match = compiled_pattern.search(test_case.input_data)
                actual_result = match is not None
                
                execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
                
                # Update test case with results
                test_case.actual_result = actual_result
                test_case.execution_time_ms = execution_time
                
                # Determine if test passed
                if test_case.expected_result is not None:
                    test_case.passed = (actual_result == test_case.expected_result)
                else:
                    # For edge cases, we just record the result
                    test_case.passed = True  # Neutral - just informational
                
                executed_cases.append(test_case)
                
            except Exception as e:
                logger.error(f"Test case execution failed: {str(e)}")
                test_case.passed = False
                test_case.actual_result = False
                test_case.execution_time_ms = 0.0
                executed_cases.append(test_case)
        
        return executed_cases
    
    async def _run_performance_tests(
        self,
        rule: IntelligentScanRule
    ) -> Dict[str, float]:
        """Run performance tests on the rule"""
        
        performance_metrics = {}
        
        if not rule.pattern:
            return performance_metrics
        
        try:
            compiled_pattern = re.compile(rule.pattern)
            
            # Test data of varying sizes
            test_strings = [
                "a" * 10,      # Small
                "a" * 100,     # Medium
                "a" * 1000,    # Large
                "a" * 10000,   # Very large
                "complex test data with various characters 123 !@# " * 100  # Complex
            ]
            
            execution_times = []
            
            for test_string in test_strings:
                start_time = datetime.utcnow()
                
                # Run the pattern multiple times for accurate measurement
                for _ in range(100):
                    compiled_pattern.search(test_string)
                
                total_time = (datetime.utcnow() - start_time).total_seconds() * 1000
                avg_time = total_time / 100
                execution_times.append(avg_time)
            
            # Calculate performance metrics
            performance_metrics = {
                'avg_execution_time_ms': np.mean(execution_times),
                'min_execution_time_ms': np.min(execution_times),
                'max_execution_time_ms': np.max(execution_times),
                'std_execution_time_ms': np.std(execution_times),
                'pattern_length': len(rule.pattern),
                'compilation_complexity': self._estimate_pattern_complexity(rule.pattern)
            }
            
        except Exception as e:
            logger.error(f"Performance testing failed: {str(e)}")
            performance_metrics = {
                'avg_execution_time_ms': 0,
                'error': str(e)
            }
        
        return performance_metrics
    
    def _estimate_pattern_complexity(self, pattern: str) -> int:
        """Estimate pattern complexity score"""
        
        complexity = 0
        
        # Base complexity
        complexity += len(pattern)
        
        # Special characters add complexity
        complexity += pattern.count('(') * 2  # Groups
        complexity += pattern.count('[') * 2  # Character classes
        complexity += pattern.count('{') * 3  # Quantifiers
        complexity += pattern.count('|') * 2  # Alternation
        complexity += pattern.count('\\') * 1  # Escapes
        complexity += pattern.count('*') * 3  # Kleene star
        complexity += pattern.count('+') * 2  # Plus quantifier
        complexity += pattern.count('?') * 1  # Optional
        
        return complexity
    
    def _calculate_validation_score(
        self,
        issues: List[ValidationIssue],
        test_results: List[TestCase]
    ) -> float:
        """Calculate overall validation score (0-100)"""
        
        # Start with perfect score
        score = 100.0
        
        # Deduct points for issues
        for issue in issues:
            if issue.severity == ValidationSeverity.CRITICAL:
                score -= 25
            elif issue.severity == ValidationSeverity.HIGH:
                score -= 15
            elif issue.severity == ValidationSeverity.MEDIUM:
                score -= 8
            elif issue.severity == ValidationSeverity.LOW:
                score -= 3
            elif issue.severity == ValidationSeverity.INFO:
                score -= 1
        
        # Deduct points for failed tests
        if test_results:
            passed_tests = sum(1 for test in test_results if test.passed)
            total_tests = len(test_results)
            test_pass_rate = passed_tests / total_tests
            
            # If less than 80% tests pass, deduct significant points
            if test_pass_rate < 0.8:
                score -= (1 - test_pass_rate) * 30
        
        # Ensure score is within bounds
        return max(0.0, min(100.0, score))
    
    async def _generate_validation_recommendations(
        self,
        rule: IntelligentScanRule,
        issues: List[ValidationIssue],
        test_results: List[TestCase],
        performance_metrics: Dict[str, float]
    ) -> List[str]:
        """Generate actionable recommendations for rule improvement"""
        
        recommendations = []
        
        # Issue-based recommendations
        critical_issues = [i for i in issues if i.severity == ValidationSeverity.CRITICAL]
        if critical_issues:
            recommendations.append("🚨 CRITICAL: Fix syntax errors before deploying this rule")
            for issue in critical_issues[:3]:  # Top 3 critical issues
                recommendations.append(f"   - {issue.title}: {issue.suggested_fix}")
        
        high_issues = [i for i in issues if i.severity == ValidationSeverity.HIGH]
        if high_issues:
            recommendations.append("⚠️ HIGH PRIORITY: Address these important issues:")
            for issue in high_issues[:3]:
                recommendations.append(f"   - {issue.title}: {issue.suggested_fix}")
        
        # Test-based recommendations
        if test_results:
            failed_tests = [t for t in test_results if not t.passed]
            if failed_tests:
                failure_rate = len(failed_tests) / len(test_results)
                if failure_rate > 0.2:
                    recommendations.append(f"🔍 TEST FAILURES: {failure_rate:.1%} of tests failed - review pattern accuracy")
                
                # Analyze failure patterns
                negative_failures = [t for t in failed_tests if t.test_type == TestCaseType.NEGATIVE]
                if negative_failures:
                    recommendations.append("   - Pattern may be too permissive (matching data it shouldn't)")
                
                positive_failures = [t for t in failed_tests if t.test_type == TestCaseType.POSITIVE]
                if positive_failures:
                    recommendations.append("   - Pattern may be too restrictive (missing valid data)")
        
        # Performance-based recommendations
        if performance_metrics:
            avg_time = performance_metrics.get('avg_execution_time_ms', 0)
            if avg_time > 10:  # More than 10ms average
                recommendations.append(f"⚡ PERFORMANCE: Pattern is slow (avg: {avg_time:.1f}ms) - consider optimization")
            
            complexity = performance_metrics.get('compilation_complexity', 0)
            if complexity > 100:
                recommendations.append("🔧 COMPLEXITY: Pattern is very complex - consider simplification")
        
        # General recommendations based on best practices
        if not issues and test_results and all(t.passed for t in test_results):
            recommendations.append("✅ EXCELLENT: Rule passes all validation checks")
        
        if not recommendations:
            recommendations.append("ℹ️ Rule validation completed with no major issues")
        
        return recommendations
    
    def _create_validation_summary(
        self,
        issues: List[ValidationIssue],
        test_results: List[TestCase],
        performance_metrics: Dict[str, float]
    ) -> Dict[str, Any]:
        """Create a summary of validation results"""
        
        # Issue summary
        issue_counts = Counter(issue.severity for issue in issues)
        issue_types = Counter(issue.validation_type for issue in issues)
        
        # Test summary
        test_summary = {}
        if test_results:
            test_summary = {
                'total_tests': len(test_results),
                'passed_tests': sum(1 for t in test_results if t.passed),
                'failed_tests': sum(1 for t in test_results if not t.passed),
                'pass_rate': sum(1 for t in test_results if t.passed) / len(test_results),
                'avg_execution_time_ms': np.mean([t.execution_time_ms for t in test_results if t.execution_time_ms])
            }
        
        return {
            'total_issues': len(issues),
            'issue_severity_breakdown': dict(issue_counts),
            'issue_type_breakdown': dict(issue_types),
            'test_summary': test_summary,
            'performance_summary': performance_metrics,
            'validation_categories_checked': [
                'syntax', 'semantics', 'performance', 'security', 'coverage'
            ]
        }
    
    async def validate_rule_batch(
        self,
        rule_ids: List[str],
        quick_validation: bool = False
    ) -> Dict[str, ValidationReport]:
        """Validate multiple rules in batch"""
        
        results = {}
        
        # Process rules in parallel with concurrency limit
        semaphore = asyncio.Semaphore(5)
        
        async def validate_single_rule(rule_id: str) -> Tuple[str, ValidationReport]:
            async with semaphore:
                try:
                    report = await self.validate_rule_comprehensive(
                        rule_id,
                        include_test_generation=not quick_validation,
                        include_performance_testing=not quick_validation
                    )
                    return rule_id, report
                except Exception as e:
                    logger.error(f"Batch validation failed for rule {rule_id}: {str(e)}")
                    return rule_id, None
        
        # Run validations
        tasks = [validate_single_rule(rule_id) for rule_id in rule_ids]
        validation_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Collect results
        for result in validation_results:
            if isinstance(result, tuple) and result[1] is not None:
                rule_id, report = result
                results[rule_id] = report
        
        logger.info(f"Batch validation completed: {len(results)}/{len(rule_ids)} successful")
        
        return results
    
    async def get_validation_summary_dashboard(self) -> Dict[str, Any]:
        """Get validation summary dashboard for all rules"""
        
        with get_session() as session:
            # Get all active rules
            all_rules = session.query(IntelligentScanRule).filter(
                IntelligentScanRule.is_active == True
            ).all()
            
            # Quick validation statistics from cache
            cached_validations = len(self.validation_cache)
            
            # Get recent validation results
            recent_validations = [
                v for v in self.validation_cache.values()
                if (datetime.utcnow() - v['timestamp']).days < 7
            ]
            
            # Calculate aggregate statistics
            if recent_validations:
                avg_score = np.mean([v['report'].overall_score for v in recent_validations])
                total_issues = sum(len(v['report'].issues) for v in recent_validations)
                
                # Issue breakdown
                all_issues = []
                for v in recent_validations:
                    all_issues.extend(v['report'].issues)
                
                severity_breakdown = Counter(issue.severity for issue in all_issues)
                type_breakdown = Counter(issue.validation_type for issue in all_issues)
            else:
                avg_score = 0
                total_issues = 0
                severity_breakdown = {}
                type_breakdown = {}
            
            return {
                'total_rules': len(all_rules),
                'validated_rules': cached_validations,
                'recent_validations_count': len(recent_validations),
                'average_validation_score': avg_score,
                'total_issues_found': total_issues,
                'issue_severity_breakdown': dict(severity_breakdown),
                'issue_type_breakdown': dict(type_breakdown),
                'validation_coverage': (cached_validations / max(len(all_rules), 1)) * 100,
                'recommendations': await self._get_system_wide_recommendations()
            }
    
    async def _get_system_wide_recommendations(self) -> List[str]:
        """Get system-wide validation recommendations"""
        
        recommendations = []
        
        # Analyze cached validation results
        if self.validation_cache:
            all_reports = [v['report'] for v in self.validation_cache.values()]
            
            # Find common issues
            all_issues = []
            for report in all_reports:
                all_issues.extend(report.issues)
            
            if all_issues:
                common_issue_types = Counter(issue.validation_type for issue in all_issues)
                most_common = common_issue_types.most_common(3)
                
                for issue_type, count in most_common:
                    recommendations.append(
                        f"Address {issue_type.value} issues - found in {count} cases"
                    )
            
            # Performance recommendations
            avg_scores = [report.overall_score for report in all_reports]
            if avg_scores and np.mean(avg_scores) < 70:
                recommendations.append("Overall rule quality is below target - consider rule review")
        
        if not recommendations:
            recommendations.append("Rule validation system is operating normally")
        
        return recommendations


# Global service instance
rule_validation_engine = RuleValidationEngine()