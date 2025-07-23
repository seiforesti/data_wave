"""
Scan Performance Service

This service provides comprehensive performance monitoring, analysis, and optimization
capabilities for enterprise scanning operations. It tracks performance metrics,
identifies bottlenecks, predicts performance issues, and provides intelligent
recommendations for performance improvements.

Enterprise Features:
- Real-time performance monitoring
- Predictive performance analysis
- Bottleneck identification and resolution
- Resource utilization optimization
- Performance trend analysis
- AI-powered performance predictions
- Cost-performance optimization
"""

from typing import List, Dict, Any, Optional, Tuple, Set, Union
from datetime import datetime, timedelta
from sqlmodel import Session, select, and_, or_, text
from sqlalchemy import func, desc, asc
from enum import Enum
import asyncio
import json
import uuid
import logging
import numpy as np
import pandas as pd
from collections import defaultdict, deque
from dataclasses import dataclass, field
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.cluster import KMeans
from sklearn.metrics import mean_squared_error, mean_absolute_error
import scipy.stats as stats
from concurrent.futures import ThreadPoolExecutor
import threading
import time

from ..models.scan_models import (
    ScanOrchestrationJob, ScanOrchestrationStatus, ScanWorkflowExecution,
    ScanWorkflowStatus, ScanResourceAllocation, ResourceType,
    EnhancedScanRuleSet, Scan, ScanStatus, ScanResult, DataSource
)
from ..models.advanced_scan_rule_models import (
    IntelligentScanRule, RulePerformanceHistory, PerformanceMetric,
    PerformanceAlert, PerformanceTrend, PerformanceBaseline
)
from ..models.classification_models import ClassificationResult
from ..db_session import get_session

logger = logging.getLogger(__name__)


class PerformanceMetricType(str, Enum):
    """Types of performance metrics"""
    EXECUTION_TIME = "execution_time"         # Total execution time
    THROUGHPUT = "throughput"                 # Operations per second
    LATENCY = "latency"                      # Response time
    SUCCESS_RATE = "success_rate"            # Success percentage
    ERROR_RATE = "error_rate"                # Error percentage
    RESOURCE_UTILIZATION = "resource_utilization"  # Resource usage
    MEMORY_USAGE = "memory_usage"            # Memory consumption
    CPU_USAGE = "cpu_usage"                  # CPU utilization
    NETWORK_IO = "network_io"                # Network I/O
    DISK_IO = "disk_io"                      # Disk I/O
    QUEUE_TIME = "queue_time"                # Time spent in queue
    PROCESSING_TIME = "processing_time"       # Actual processing time
    COST_EFFICIENCY = "cost_efficiency"       # Cost per operation
    QUALITY_SCORE = "quality_score"          # Output quality metrics


class PerformanceStatus(str, Enum):
    """Performance status levels"""
    OPTIMAL = "optimal"           # Best possible performance
    GOOD = "good"                # Acceptable performance
    DEGRADED = "degraded"        # Below optimal performance
    POOR = "poor"                # Significantly impacted performance
    CRITICAL = "critical"        # Severely impacted performance
    UNKNOWN = "unknown"          # Unable to determine status


class AlertSeverity(str, Enum):
    """Alert severity levels"""
    INFO = "info"               # Informational alerts
    WARNING = "warning"         # Warning level alerts
    CRITICAL = "critical"       # Critical alerts requiring attention
    EMERGENCY = "emergency"     # Emergency alerts requiring immediate action


class TrendDirection(str, Enum):
    """Performance trend directions"""
    IMPROVING = "improving"     # Performance is getting better
    STABLE = "stable"          # Performance is consistent
    DEGRADING = "degrading"    # Performance is getting worse
    VOLATILE = "volatile"      # Performance is inconsistent
    UNKNOWN = "unknown"        # Unable to determine trend


@dataclass
class PerformanceConfig:
    """Configuration for performance monitoring"""
    monitoring_interval: int = 30  # seconds
    retention_period: timedelta = timedelta(days=30)
    alert_thresholds: Dict[str, float] = field(default_factory=dict)
    baseline_window: timedelta = timedelta(hours=24)
    anomaly_detection_sensitivity: float = 0.1
    enable_predictive_analysis: bool = True
    enable_real_time_alerts: bool = True
    enable_cost_analysis: bool = True
    max_concurrent_monitors: int = 10
    performance_sample_rate: float = 1.0  # 100% sampling


@dataclass
class PerformanceSnapshot:
    """Snapshot of performance metrics at a point in time"""
    timestamp: datetime
    job_id: Optional[int]
    rule_set_id: Optional[int]
    metrics: Dict[PerformanceMetricType, float]
    resource_usage: Dict[ResourceType, float]
    context_info: Dict[str, Any]
    quality_indicators: Dict[str, float]


@dataclass
class PerformanceAnalysis:
    """Comprehensive performance analysis result"""
    analysis_id: str
    period_analyzed: Tuple[datetime, datetime]
    overall_status: PerformanceStatus
    performance_summary: Dict[str, Any]
    trend_analysis: Dict[PerformanceMetricType, TrendDirection]
    bottlenecks: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    predictive_insights: Dict[str, Any]
    cost_analysis: Dict[str, Any]
    quality_assessment: Dict[str, Any]


class ScanPerformanceService:
    """
    Enterprise-level scan performance service providing comprehensive performance
    monitoring, analysis, and optimization capabilities for data governance
    scanning operations.
    """

    def __init__(self, config: Optional[PerformanceConfig] = None):
        self.config = config or PerformanceConfig()
        
        # ML Models for performance analysis
        self.performance_predictor = RandomForestRegressor(n_estimators=100, random_state=42)
        self.anomaly_detector = IsolationForest(contamination=self.config.anomaly_detection_sensitivity)
        self.trend_analyzer = LinearRegression()
        self.scaler = StandardScaler()
        
        # Performance tracking
        self._performance_history = deque(maxlen=10000)
        self._real_time_metrics = {}
        self._baselines = {}
        self._alerts = deque(maxlen=1000)
        self._monitors = {}
        
        # Threading for real-time monitoring
        self._monitoring_active = False
        self._monitor_thread = None
        self._monitor_lock = threading.Lock()
        self._executor = ThreadPoolExecutor(max_workers=self.config.max_concurrent_monitors)
        
        # Performance cache
        self._analysis_cache = {}
        self._cache_ttl = 300  # 5 minutes
        
        # Initialize default thresholds
        self._initialize_default_thresholds()
        
        logger.info("ScanPerformanceService initialized with enterprise monitoring capabilities")

    def _initialize_default_thresholds(self):
        """Initialize default performance thresholds"""
        
        default_thresholds = {
            PerformanceMetricType.EXECUTION_TIME: {
                "optimal": 30.0,      # seconds
                "good": 60.0,
                "degraded": 120.0,
                "poor": 300.0,
                "critical": 600.0
            },
            PerformanceMetricType.SUCCESS_RATE: {
                "optimal": 0.98,      # 98%+
                "good": 0.95,         # 95%+
                "degraded": 0.90,     # 90%+
                "poor": 0.80,         # 80%+
                "critical": 0.70      # 70%+
            },
            PerformanceMetricType.THROUGHPUT: {
                "optimal": 100.0,     # operations/minute
                "good": 80.0,
                "degraded": 60.0,
                "poor": 40.0,
                "critical": 20.0
            },
            PerformanceMetricType.CPU_USAGE: {
                "optimal": 0.50,      # 50%
                "good": 0.70,         # 70%
                "degraded": 0.85,     # 85%
                "poor": 0.95,         # 95%
                "critical": 0.98      # 98%
            },
            PerformanceMetricType.MEMORY_USAGE: {
                "optimal": 0.60,      # 60%
                "good": 0.75,         # 75%
                "degraded": 0.85,     # 85%
                "poor": 0.95,         # 95%
                "critical": 0.98      # 98%
            }
        }
        
        # Merge with user-provided thresholds
        for metric_type, thresholds in default_thresholds.items():
            if metric_type not in self.config.alert_thresholds:
                self.config.alert_thresholds[metric_type] = thresholds

    async def start_real_time_monitoring(self, db: Optional[Session] = None) -> bool:
        """
        Start real-time performance monitoring for all active scan operations.
        
        Features:
        - Continuous performance tracking
        - Real-time anomaly detection
        - Automatic alert generation
        - Performance baseline establishment
        """
        try:
            if self._monitoring_active:
                logger.warning("Real-time monitoring is already active")
                return False
            
            if not db:
                db = next(get_session())
            
            self._monitoring_active = True
            
            # Start monitoring thread
            self._monitor_thread = threading.Thread(
                target=self._monitoring_loop,
                args=(db,),
                daemon=True
            )
            self._monitor_thread.start()
            
            logger.info("Real-time performance monitoring started")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start real-time monitoring: {str(e)}")
            return False

    def _monitoring_loop(self, db: Session):
        """Main monitoring loop running in background thread"""
        
        while self._monitoring_active:
            try:
                # Collect current performance snapshots
                snapshots = asyncio.run(self._collect_performance_snapshots(db))
                
                # Process each snapshot
                for snapshot in snapshots:
                    self._process_performance_snapshot(snapshot)
                
                # Check for anomalies and alerts
                self._check_for_anomalies()
                
                # Update baselines periodically
                if len(self._performance_history) % 100 == 0:
                    self._update_performance_baselines()
                
                # Sleep until next monitoring interval
                time.sleep(self.config.monitoring_interval)
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {str(e)}")
                time.sleep(self.config.monitoring_interval)

    async def _collect_performance_snapshots(self, db: Session) -> List[PerformanceSnapshot]:
        """Collect performance snapshots from active operations"""
        
        snapshots = []
        
        try:
            # Get active orchestration jobs
            active_jobs_query = select(ScanOrchestrationJob).where(
                ScanOrchestrationJob.status == ScanOrchestrationStatus.EXECUTING
            )
            active_jobs = db.exec(active_jobs_query).all()
            
            # Collect metrics for each active job
            for job in active_jobs:
                snapshot = await self._create_job_performance_snapshot(job, db)
                if snapshot:
                    snapshots.append(snapshot)
            
            # Get active workflow executions
            active_workflows_query = select(ScanWorkflowExecution).where(
                ScanWorkflowExecution.status == ScanWorkflowStatus.RUNNING
            )
            active_workflows = db.exec(active_workflows_query).all()
            
            # Collect metrics for active workflows
            for workflow in active_workflows:
                snapshot = await self._create_workflow_performance_snapshot(workflow, db)
                if snapshot:
                    snapshots.append(snapshot)
            
            return snapshots
            
        except Exception as e:
            logger.error(f"Failed to collect performance snapshots: {str(e)}")
            return []

    async def _create_job_performance_snapshot(
        self,
        job: ScanOrchestrationJob,
        db: Session
    ) -> Optional[PerformanceSnapshot]:
        """Create performance snapshot for orchestration job"""
        
        try:
            current_time = datetime.utcnow()
            
            # Calculate execution time
            execution_time = 0.0
            if job.actual_start:
                execution_time = (current_time - job.actual_start).total_seconds()
            
            # Calculate throughput
            throughput = 0.0
            if execution_time > 0 and job.scans_completed > 0:
                throughput = (job.scans_completed / execution_time) * 60  # per minute
            
            # Get resource allocation data
            resource_query = select(ScanResourceAllocation).where(
                ScanResourceAllocation.orchestration_job_id == job.id
            )
            resource_allocations = db.exec(resource_query).all()
            
            resource_usage = {}
            for allocation in resource_allocations:
                usage_pct = 0.0
                if allocation.allocated_amount > 0:
                    usage_pct = allocation.actual_usage / allocation.allocated_amount
                resource_usage[allocation.resource_type] = usage_pct
            
            # Performance metrics
            metrics = {
                PerformanceMetricType.EXECUTION_TIME: execution_time,
                PerformanceMetricType.THROUGHPUT: throughput,
                PerformanceMetricType.SUCCESS_RATE: job.scans_completed / max(job.scans_planned, 1),
                PerformanceMetricType.ERROR_RATE: job.scans_failed / max(job.scans_planned, 1),
                PerformanceMetricType.QUALITY_SCORE: job.accuracy_score or 0.0
            }
            
            # Context information
            context_info = {
                "job_name": job.name,
                "strategy": job.orchestration_strategy,
                "priority": job.priority,
                "data_sources_count": len(job.target_data_sources),
                "rule_set_id": job.enhanced_rule_set_id
            }
            
            # Quality indicators
            quality_indicators = {
                "accuracy_score": job.accuracy_score or 0.0,
                "business_value_score": job.business_value_score or 0.0,
                "completeness_score": job.progress_percentage / 100.0
            }
            
            return PerformanceSnapshot(
                timestamp=current_time,
                job_id=job.id,
                rule_set_id=job.enhanced_rule_set_id,
                metrics=metrics,
                resource_usage=resource_usage,
                context_info=context_info,
                quality_indicators=quality_indicators
            )
            
        except Exception as e:
            logger.error(f"Failed to create job performance snapshot: {str(e)}")
            return None

    async def _create_workflow_performance_snapshot(
        self,
        workflow: ScanWorkflowExecution,
        db: Session
    ) -> Optional[PerformanceSnapshot]:
        """Create performance snapshot for workflow execution"""
        
        try:
            current_time = datetime.utcnow()
            
            # Calculate execution time
            execution_time = 0.0
            if workflow.started_at:
                execution_time = (current_time - workflow.started_at).total_seconds()
            
            # Performance metrics specific to workflow
            metrics = {
                PerformanceMetricType.EXECUTION_TIME: execution_time,
                PerformanceMetricType.PROCESSING_TIME: workflow.duration_seconds or 0.0,
                PerformanceMetricType.QUEUE_TIME: (workflow.started_at - workflow.queued_at).total_seconds() if workflow.started_at else 0.0,
                PerformanceMetricType.SUCCESS_RATE: 1.0 if workflow.status == ScanWorkflowStatus.RUNNING else 0.0,
                PerformanceMetricType.QUALITY_SCORE: workflow.quality_score or 0.0
            }
            
            # Resource usage from workflow
            resource_usage = {
                ResourceType.CPU: workflow.cpu_usage_percent / 100.0 if workflow.cpu_usage_percent else 0.0,
                ResourceType.MEMORY: (workflow.memory_usage_mb / 1024.0) if workflow.memory_usage_mb else 0.0  # GB
            }
            
            # Context information
            context_info = {
                "step_name": workflow.step_name,
                "step_type": workflow.step_type,
                "step_order": workflow.step_order,
                "retry_attempt": workflow.retry_attempt
            }
            
            # Quality indicators
            quality_indicators = {
                "quality_score": workflow.quality_score or 0.0,
                "progress_percentage": workflow.progress_percentage,
                "sla_compliance": 1.0 if workflow.sla_compliance else 0.0
            }
            
            return PerformanceSnapshot(
                timestamp=current_time,
                job_id=workflow.orchestration_job_id,
                rule_set_id=None,
                metrics=metrics,
                resource_usage=resource_usage,
                context_info=context_info,
                quality_indicators=quality_indicators
            )
            
        except Exception as e:
            logger.error(f"Failed to create workflow performance snapshot: {str(e)}")
            return None

    def _process_performance_snapshot(self, snapshot: PerformanceSnapshot):
        """Process a performance snapshot and update internal state"""
        
        try:
            # Add to performance history
            self._performance_history.append(snapshot)
            
            # Update real-time metrics
            job_key = f"job_{snapshot.job_id}" if snapshot.job_id else "system"
            if job_key not in self._real_time_metrics:
                self._real_time_metrics[job_key] = []
            
            self._real_time_metrics[job_key].append(snapshot)
            
            # Keep only recent metrics (last 1000 snapshots per job)
            if len(self._real_time_metrics[job_key]) > 1000:
                self._real_time_metrics[job_key] = self._real_time_metrics[job_key][-1000:]
            
            # Update performance status
            self._update_performance_status(snapshot)
            
        except Exception as e:
            logger.error(f"Failed to process performance snapshot: {str(e)}")

    def _update_performance_status(self, snapshot: PerformanceSnapshot):
        """Update performance status based on snapshot metrics"""
        
        try:
            job_key = f"job_{snapshot.job_id}" if snapshot.job_id else "system"
            
            # Determine overall performance status
            status_scores = []
            
            for metric_type, value in snapshot.metrics.items():
                if metric_type in self.config.alert_thresholds:
                    thresholds = self.config.alert_thresholds[metric_type]
                    status = self._calculate_metric_status(value, thresholds, metric_type)
                    status_scores.append(self._status_to_score(status))
            
            # Calculate overall status
            if status_scores:
                avg_score = np.mean(status_scores)
                overall_status = self._score_to_status(avg_score)
            else:
                overall_status = PerformanceStatus.UNKNOWN
            
            # Store status
            self._real_time_metrics[job_key + "_status"] = {
                "status": overall_status,
                "timestamp": snapshot.timestamp,
                "details": {
                    metric_type.value: self._calculate_metric_status(
                        value, 
                        self.config.alert_thresholds.get(metric_type, {}),
                        metric_type
                    )
                    for metric_type, value in snapshot.metrics.items()
                    if metric_type in self.config.alert_thresholds
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to update performance status: {str(e)}")

    def _calculate_metric_status(
        self,
        value: float,
        thresholds: Dict[str, float],
        metric_type: PerformanceMetricType
    ) -> PerformanceStatus:
        """Calculate performance status for a specific metric"""
        
        # Different metrics have different interpretation (higher is better vs lower is better)
        higher_is_better = metric_type in [
            PerformanceMetricType.SUCCESS_RATE,
            PerformanceMetricType.THROUGHPUT,
            PerformanceMetricType.QUALITY_SCORE
        ]
        
        if higher_is_better:
            if value >= thresholds.get("optimal", float('inf')):
                return PerformanceStatus.OPTIMAL
            elif value >= thresholds.get("good", float('inf')):
                return PerformanceStatus.GOOD
            elif value >= thresholds.get("degraded", float('inf')):
                return PerformanceStatus.DEGRADED
            elif value >= thresholds.get("poor", float('inf')):
                return PerformanceStatus.POOR
            else:
                return PerformanceStatus.CRITICAL
        else:
            if value <= thresholds.get("optimal", 0):
                return PerformanceStatus.OPTIMAL
            elif value <= thresholds.get("good", 0):
                return PerformanceStatus.GOOD
            elif value <= thresholds.get("degraded", 0):
                return PerformanceStatus.DEGRADED
            elif value <= thresholds.get("poor", 0):
                return PerformanceStatus.POOR
            else:
                return PerformanceStatus.CRITICAL

    def _status_to_score(self, status: PerformanceStatus) -> float:
        """Convert performance status to numerical score"""
        status_scores = {
            PerformanceStatus.OPTIMAL: 1.0,
            PerformanceStatus.GOOD: 0.8,
            PerformanceStatus.DEGRADED: 0.6,
            PerformanceStatus.POOR: 0.4,
            PerformanceStatus.CRITICAL: 0.2,
            PerformanceStatus.UNKNOWN: 0.5
        }
        return status_scores.get(status, 0.5)

    def _score_to_status(self, score: float) -> PerformanceStatus:
        """Convert numerical score to performance status"""
        if score >= 0.9:
            return PerformanceStatus.OPTIMAL
        elif score >= 0.7:
            return PerformanceStatus.GOOD
        elif score >= 0.5:
            return PerformanceStatus.DEGRADED
        elif score >= 0.3:
            return PerformanceStatus.POOR
        else:
            return PerformanceStatus.CRITICAL

    def _check_for_anomalies(self):
        """Check for performance anomalies and generate alerts"""
        
        try:
            if len(self._performance_history) < 10:
                return
            
            # Get recent performance data
            recent_snapshots = list(self._performance_history)[-50:]  # Last 50 snapshots
            
            # Extract metrics for anomaly detection
            for metric_type in PerformanceMetricType:
                metric_values = []
                timestamps = []
                
                for snapshot in recent_snapshots:
                    if metric_type in snapshot.metrics:
                        metric_values.append(snapshot.metrics[metric_type])
                        timestamps.append(snapshot.timestamp)
                
                if len(metric_values) >= 10:
                    # Detect anomalies
                    anomalies = self._detect_metric_anomalies(metric_values, timestamps, metric_type)
                    
                    # Generate alerts for anomalies
                    for anomaly in anomalies:
                        self._generate_performance_alert(anomaly, metric_type)
            
        except Exception as e:
            logger.error(f"Failed to check for anomalies: {str(e)}")

    def _detect_metric_anomalies(
        self,
        values: List[float],
        timestamps: List[datetime],
        metric_type: PerformanceMetricType
    ) -> List[Dict[str, Any]]:
        """Detect anomalies in metric values"""
        
        anomalies = []
        
        try:
            if len(values) < 10:
                return anomalies
            
            # Statistical anomaly detection
            values_array = np.array(values).reshape(-1, 1)
            
            # Use Isolation Forest for anomaly detection
            anomaly_scores = self.anomaly_detector.fit_predict(values_array)
            
            # Find anomalous points
            for i, (score, value, timestamp) in enumerate(zip(anomaly_scores, values, timestamps)):
                if score == -1:  # Anomaly detected
                    # Calculate severity based on deviation from normal range
                    normal_values = [v for j, v in enumerate(values) if anomaly_scores[j] == 1]
                    if normal_values:
                        mean_normal = np.mean(normal_values)
                        std_normal = np.std(normal_values)
                        
                        if std_normal > 0:
                            deviation = abs(value - mean_normal) / std_normal
                            
                            # Determine severity
                            if deviation > 3:
                                severity = AlertSeverity.CRITICAL
                            elif deviation > 2:
                                severity = AlertSeverity.WARNING
                            else:
                                severity = AlertSeverity.INFO
                            
                            anomalies.append({
                                "timestamp": timestamp,
                                "metric_type": metric_type,
                                "value": value,
                                "expected_value": mean_normal,
                                "deviation": deviation,
                                "severity": severity
                            })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Failed to detect anomalies for {metric_type}: {str(e)}")
            return []

    def _generate_performance_alert(self, anomaly: Dict[str, Any], metric_type: PerformanceMetricType):
        """Generate performance alert for detected anomaly"""
        
        try:
            alert = {
                "alert_id": f"perf_alert_{uuid.uuid4().hex[:8]}",
                "timestamp": anomaly["timestamp"],
                "metric_type": metric_type,
                "severity": anomaly["severity"],
                "message": f"Performance anomaly detected in {metric_type.value}",
                "details": {
                    "current_value": anomaly["value"],
                    "expected_value": anomaly["expected_value"],
                    "deviation_factor": anomaly["deviation"],
                    "threshold_exceeded": True
                },
                "recommendations": self._generate_alert_recommendations(anomaly, metric_type)
            }
            
            # Store alert
            self._alerts.append(alert)
            
            # Log alert
            logger.warning(f"Performance alert generated: {alert['message']} - "
                         f"Value: {anomaly['value']:.2f}, Expected: {anomaly['expected_value']:.2f}")
            
        except Exception as e:
            logger.error(f"Failed to generate performance alert: {str(e)}")

    def _generate_alert_recommendations(
        self,
        anomaly: Dict[str, Any],
        metric_type: PerformanceMetricType
    ) -> List[str]:
        """Generate recommendations for performance alerts"""
        
        recommendations = []
        
        if metric_type == PerformanceMetricType.EXECUTION_TIME:
            if anomaly["value"] > anomaly["expected_value"]:
                recommendations.extend([
                    "Check for resource contention",
                    "Review scan rule complexity",
                    "Consider optimizing data source connections",
                    "Evaluate system load and concurrent operations"
                ])
        
        elif metric_type == PerformanceMetricType.SUCCESS_RATE:
            if anomaly["value"] < anomaly["expected_value"]:
                recommendations.extend([
                    "Investigate recent scan failures",
                    "Check data source connectivity",
                    "Review scan rule configurations",
                    "Examine system error logs"
                ])
        
        elif metric_type == PerformanceMetricType.CPU_USAGE:
            if anomaly["value"] > anomaly["expected_value"]:
                recommendations.extend([
                    "Monitor CPU-intensive operations",
                    "Consider scaling resources",
                    "Optimize scan algorithms",
                    "Review concurrent job limits"
                ])
        
        elif metric_type == PerformanceMetricType.MEMORY_USAGE:
            if anomaly["value"] > anomaly["expected_value"]:
                recommendations.extend([
                    "Check for memory leaks",
                    "Optimize data processing batch sizes",
                    "Consider increasing available memory",
                    "Review caching strategies"
                ])
        
        return recommendations

    async def analyze_performance_trends(
        self,
        time_period: timedelta = timedelta(hours=24),
        job_ids: Optional[List[int]] = None,
        db: Optional[Session] = None
    ) -> PerformanceAnalysis:
        """
        Analyze performance trends over a specified time period.
        
        Features:
        - Comprehensive trend analysis
        - Bottleneck identification
        - Predictive insights
        - Performance recommendations
        - Cost analysis
        """
        try:
            if not db:
                db = next(get_session())
            
            analysis_id = f"trend_analysis_{uuid.uuid4().hex[:8]}_{int(datetime.utcnow().timestamp())}"
            end_time = datetime.utcnow()
            start_time = end_time - time_period
            
            # Collect performance data for the period
            performance_data = await self._collect_historical_performance_data(
                start_time, end_time, job_ids, db
            )
            
            # Analyze trends for each metric type
            trend_analysis = {}
            for metric_type in PerformanceMetricType:
                trend = await self._analyze_metric_trend(metric_type, performance_data)
                trend_analysis[metric_type] = trend
            
            # Identify bottlenecks
            bottlenecks = await self._identify_performance_bottlenecks(performance_data)
            
            # Generate recommendations
            recommendations = await self._generate_performance_recommendations(
                trend_analysis, bottlenecks, performance_data
            )
            
            # Predictive insights
            predictive_insights = await self._generate_predictive_insights(
                performance_data, trend_analysis
            )
            
            # Cost analysis
            cost_analysis = await self._analyze_performance_costs(performance_data, db)
            
            # Quality assessment
            quality_assessment = await self._assess_performance_quality(performance_data)
            
            # Performance summary
            performance_summary = self._generate_performance_summary(
                performance_data, trend_analysis
            )
            
            # Overall status
            overall_status = self._determine_overall_performance_status(trend_analysis)
            
            analysis = PerformanceAnalysis(
                analysis_id=analysis_id,
                period_analyzed=(start_time, end_time),
                overall_status=overall_status,
                performance_summary=performance_summary,
                trend_analysis=trend_analysis,
                bottlenecks=bottlenecks,
                recommendations=recommendations,
                predictive_insights=predictive_insights,
                cost_analysis=cost_analysis,
                quality_assessment=quality_assessment
            )
            
            logger.info(f"Performance trend analysis completed: {analysis_id}")
            return analysis
            
        except Exception as e:
            logger.error(f"Performance trend analysis failed: {str(e)}")
            raise

    async def _collect_historical_performance_data(
        self,
        start_time: datetime,
        end_time: datetime,
        job_ids: Optional[List[int]],
        db: Session
    ) -> List[PerformanceSnapshot]:
        """Collect historical performance data from database"""
        
        performance_data = []
        
        try:
            # Build query for orchestration jobs
            job_query = select(ScanOrchestrationJob).where(
                and_(
                    ScanOrchestrationJob.created_at >= start_time,
                    ScanOrchestrationJob.created_at <= end_time
                )
            )
            
            if job_ids:
                job_query = job_query.where(ScanOrchestrationJob.id.in_(job_ids))
            
            jobs = db.exec(job_query).all()
            
            # Convert jobs to performance snapshots
            for job in jobs:
                snapshot = await self._convert_job_to_snapshot(job, db)
                if snapshot:
                    performance_data.append(snapshot)
            
            # Also collect from performance history if available
            if hasattr(self, '_performance_history') and self._performance_history:
                historical_snapshots = [
                    snapshot for snapshot in self._performance_history
                    if start_time <= snapshot.timestamp <= end_time
                ]
                
                if job_ids:
                    historical_snapshots = [
                        snapshot for snapshot in historical_snapshots
                        if snapshot.job_id in job_ids
                    ]
                
                performance_data.extend(historical_snapshots)
            
            # Remove duplicates and sort by timestamp
            performance_data = sorted(
                {(s.timestamp, s.job_id): s for s in performance_data}.values(),
                key=lambda x: x.timestamp
            )
            
            return performance_data
            
        except Exception as e:
            logger.error(f"Failed to collect historical performance data: {str(e)}")
            return []

    async def _convert_job_to_snapshot(
        self,
        job: ScanOrchestrationJob,
        db: Session
    ) -> Optional[PerformanceSnapshot]:
        """Convert orchestration job to performance snapshot"""
        
        try:
            # Calculate metrics based on job data
            execution_time = job.total_duration or 0.0
            success_rate = job.scans_completed / max(job.scans_planned, 1)
            error_rate = job.scans_failed / max(job.scans_planned, 1)
            throughput = 0.0
            
            if execution_time > 0 and job.scans_completed > 0:
                throughput = (job.scans_completed / execution_time) * 60  # per minute
            
            metrics = {
                PerformanceMetricType.EXECUTION_TIME: execution_time,
                PerformanceMetricType.SUCCESS_RATE: success_rate,
                PerformanceMetricType.ERROR_RATE: error_rate,
                PerformanceMetricType.THROUGHPUT: throughput,
                PerformanceMetricType.QUALITY_SCORE: job.accuracy_score or 0.0
            }
            
            # Get resource usage
            resource_query = select(ScanResourceAllocation).where(
                ScanResourceAllocation.orchestration_job_id == job.id
            )
            allocations = db.exec(resource_query).all()
            
            resource_usage = {}
            for allocation in allocations:
                if allocation.allocated_amount > 0:
                    usage_pct = allocation.actual_usage / allocation.allocated_amount
                    resource_usage[allocation.resource_type] = usage_pct
            
            # Context information
            context_info = {
                "job_name": job.name,
                "strategy": job.orchestration_strategy,
                "priority": job.priority,
                "data_sources_count": len(job.target_data_sources)
            }
            
            # Quality indicators
            quality_indicators = {
                "accuracy_score": job.accuracy_score or 0.0,
                "business_value_score": job.business_value_score or 0.0,
                "completeness_score": job.progress_percentage / 100.0
            }
            
            return PerformanceSnapshot(
                timestamp=job.created_at,
                job_id=job.id,
                rule_set_id=job.enhanced_rule_set_id,
                metrics=metrics,
                resource_usage=resource_usage,
                context_info=context_info,
                quality_indicators=quality_indicators
            )
            
        except Exception as e:
            logger.error(f"Failed to convert job to snapshot: {str(e)}")
            return None

    async def get_real_time_performance_status(
        self,
        job_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Get current real-time performance status.
        
        Features:
        - Current performance metrics
        - Active alerts
        - Resource utilization
        - Performance trends (short-term)
        """
        try:
            status_result = {
                "timestamp": datetime.utcnow().isoformat(),
                "overall_status": PerformanceStatus.UNKNOWN,
                "active_jobs": {},
                "system_metrics": {},
                "active_alerts": [],
                "resource_utilization": {},
                "recent_trends": {}
            }
            
            # Get job-specific status if requested
            if job_id:
                job_key = f"job_{job_id}"
                if job_key in self._real_time_metrics:
                    recent_snapshots = self._real_time_metrics[job_key][-10:]  # Last 10 snapshots
                    
                    if recent_snapshots:
                        latest_snapshot = recent_snapshots[-1]
                        
                        status_result["active_jobs"][str(job_id)] = {
                            "status": self._real_time_metrics.get(f"{job_key}_status", {}).get("status", "unknown"),
                            "metrics": latest_snapshot.metrics,
                            "resource_usage": latest_snapshot.resource_usage,
                            "quality_indicators": latest_snapshot.quality_indicators,
                            "last_updated": latest_snapshot.timestamp.isoformat()
                        }
            else:
                # Get all active jobs status
                for key, snapshots in self._real_time_metrics.items():
                    if key.startswith("job_") and not key.endswith("_status") and snapshots:
                        job_id_str = key.replace("job_", "")
                        latest_snapshot = snapshots[-1]
                        
                        status_result["active_jobs"][job_id_str] = {
                            "status": self._real_time_metrics.get(f"{key}_status", {}).get("status", "unknown"),
                            "metrics": latest_snapshot.metrics,
                            "resource_usage": latest_snapshot.resource_usage,
                            "quality_indicators": latest_snapshot.quality_indicators,
                            "last_updated": latest_snapshot.timestamp.isoformat()
                        }
            
            # Get recent alerts
            recent_alerts = [
                alert for alert in self._alerts
                if (datetime.utcnow() - alert["timestamp"]).total_seconds() < 3600  # Last hour
            ]
            status_result["active_alerts"] = recent_alerts[-10:]  # Last 10 alerts
            
            # Calculate system-wide metrics
            if self._performance_history:
                recent_history = list(self._performance_history)[-50:]  # Last 50 snapshots
                status_result["system_metrics"] = self._calculate_system_metrics(recent_history)
            
            # Determine overall status
            job_statuses = [
                job_info.get("status", "unknown")
                for job_info in status_result["active_jobs"].values()
            ]
            
            if job_statuses:
                status_counts = {status: job_statuses.count(status) for status in set(job_statuses)}
                # Use the most common status as overall status
                overall_status = max(status_counts, key=status_counts.get)
                status_result["overall_status"] = overall_status
            
            return status_result
            
        except Exception as e:
            logger.error(f"Failed to get real-time performance status: {str(e)}")
            return {"error": str(e)}

    def _calculate_system_metrics(self, snapshots: List[PerformanceSnapshot]) -> Dict[str, Any]:
        """Calculate system-wide performance metrics"""
        
        try:
            if not snapshots:
                return {}
            
            # Aggregate metrics across all snapshots
            all_metrics = defaultdict(list)
            all_resources = defaultdict(list)
            
            for snapshot in snapshots:
                for metric_type, value in snapshot.metrics.items():
                    all_metrics[metric_type].append(value)
                
                for resource_type, value in snapshot.resource_usage.items():
                    all_resources[resource_type].append(value)
            
            # Calculate averages and statistics
            system_metrics = {
                "average_metrics": {},
                "resource_utilization": {},
                "performance_summary": {}
            }
            
            for metric_type, values in all_metrics.items():
                system_metrics["average_metrics"][metric_type.value] = {
                    "mean": np.mean(values),
                    "median": np.median(values),
                    "std": np.std(values),
                    "min": np.min(values),
                    "max": np.max(values)
                }
            
            for resource_type, values in all_resources.items():
                system_metrics["resource_utilization"][resource_type.value] = {
                    "mean": np.mean(values),
                    "median": np.median(values),
                    "max": np.max(values)
                }
            
            # Performance summary
            system_metrics["performance_summary"] = {
                "total_snapshots": len(snapshots),
                "time_span_minutes": (snapshots[-1].timestamp - snapshots[0].timestamp).total_seconds() / 60,
                "active_jobs": len(set(s.job_id for s in snapshots if s.job_id))
            }
            
            return system_metrics
            
        except Exception as e:
            logger.error(f"Failed to calculate system metrics: {str(e)}")
            return {}

    async def stop_real_time_monitoring(self) -> bool:
        """Stop real-time performance monitoring"""
        
        try:
            if not self._monitoring_active:
                logger.warning("Real-time monitoring is not active")
                return False
            
            self._monitoring_active = False
            
            # Wait for monitoring thread to stop
            if self._monitor_thread and self._monitor_thread.is_alive():
                self._monitor_thread.join(timeout=10)
            
            # Shutdown executor
            self._executor.shutdown(wait=True)
            
            logger.info("Real-time performance monitoring stopped")
            return True
            
        except Exception as e:
            logger.error(f"Failed to stop real-time monitoring: {str(e)}")
            return False

    # Additional helper methods for comprehensive functionality

    async def _analyze_metric_trend(
        self,
        metric_type: PerformanceMetricType,
        performance_data: List[PerformanceSnapshot]
    ) -> TrendDirection:
        """Analyze trend for a specific metric"""
        
        try:
            values = []
            timestamps = []
            
            for snapshot in performance_data:
                if metric_type in snapshot.metrics:
                    values.append(snapshot.metrics[metric_type])
                    timestamps.append(snapshot.timestamp.timestamp())
            
            if len(values) < 3:
                return TrendDirection.UNKNOWN
            
            # Use linear regression to determine trend
            X = np.array(timestamps).reshape(-1, 1)
            y = np.array(values)
            
            self.trend_analyzer.fit(X, y)
            slope = self.trend_analyzer.coef_[0]
            
            # Determine trend direction based on slope and variance
            std_dev = np.std(values)
            mean_val = np.mean(values)
            coefficient_of_variation = std_dev / mean_val if mean_val != 0 else 0
            
            # High coefficient of variation indicates volatility
            if coefficient_of_variation > 0.3:
                return TrendDirection.VOLATILE
            
            # Determine trend based on slope
            slope_threshold = mean_val * 0.001  # 0.1% of mean as threshold
            if slope > slope_threshold:
                return TrendDirection.IMPROVING if metric_type in [
                    PerformanceMetricType.SUCCESS_RATE,
                    PerformanceMetricType.THROUGHPUT,
                    PerformanceMetricType.QUALITY_SCORE
                ] else TrendDirection.DEGRADING
            elif slope < -slope_threshold:
                return TrendDirection.DEGRADING if metric_type in [
                    PerformanceMetricType.SUCCESS_RATE,
                    PerformanceMetricType.THROUGHPUT,
                    PerformanceMetricType.QUALITY_SCORE
                ] else TrendDirection.IMPROVING
            else:
                return TrendDirection.STABLE
                
        except Exception as e:
            logger.error(f"Failed to analyze trend for {metric_type}: {str(e)}")
            return TrendDirection.UNKNOWN

    async def _identify_performance_bottlenecks(
        self,
        performance_data: List[PerformanceSnapshot]
    ) -> List[Dict[str, Any]]:
        """Identify performance bottlenecks from historical data"""
        
        bottlenecks = []
        
        try:
            # Analyze resource utilization patterns
            resource_bottlenecks = self._analyze_resource_bottlenecks(performance_data)
            bottlenecks.extend(resource_bottlenecks)
            
            # Analyze metric bottlenecks
            metric_bottlenecks = self._analyze_metric_bottlenecks(performance_data)
            bottlenecks.extend(metric_bottlenecks)
            
            # Analyze workflow bottlenecks
            workflow_bottlenecks = self._analyze_workflow_bottlenecks(performance_data)
            bottlenecks.extend(workflow_bottlenecks)
            
            return bottlenecks
            
        except Exception as e:
            logger.error(f"Failed to identify performance bottlenecks: {str(e)}")
            return []

    def _analyze_resource_bottlenecks(
        self,
        performance_data: List[PerformanceSnapshot]
    ) -> List[Dict[str, Any]]:
        """Analyze resource utilization bottlenecks"""
        
        bottlenecks = []
        
        try:
            # Aggregate resource usage data
            resource_data = defaultdict(list)
            
            for snapshot in performance_data:
                for resource_type, usage in snapshot.resource_usage.items():
                    resource_data[resource_type].append(usage)
            
            # Identify resources with consistently high utilization
            for resource_type, usage_values in resource_data.items():
                if usage_values:
                    avg_usage = np.mean(usage_values)
                    max_usage = np.max(usage_values)
                    p95_usage = np.percentile(usage_values, 95)
                    
                    # Consider as bottleneck if average usage > 80% or p95 > 90%
                    if avg_usage > 0.8 or p95_usage > 0.9:
                        bottlenecks.append({
                            "type": "resource_bottleneck",
                            "resource_type": resource_type.value,
                            "severity": "high" if avg_usage > 0.9 else "medium",
                            "average_usage": avg_usage,
                            "peak_usage": max_usage,
                            "p95_usage": p95_usage,
                            "recommendation": f"Consider scaling {resource_type.value} resources"
                        })
            
            return bottlenecks
            
        except Exception as e:
            logger.error(f"Failed to analyze resource bottlenecks: {str(e)}")
            return []

    # Additional placeholder methods would be implemented here for complete functionality...

    def __del__(self):
        """Cleanup when service is destroyed"""
        try:
            if self._monitoring_active:
                self._monitoring_active = False
            if hasattr(self, '_executor'):
                self._executor.shutdown(wait=False)
        except:
            pass


# Export the service
__all__ = [
    "ScanPerformanceService", "PerformanceConfig", "PerformanceSnapshot",
    "PerformanceAnalysis", "PerformanceMetricType", "PerformanceStatus",
    "AlertSeverity", "TrendDirection"
]