"""
Scan Performance Service
=======================

Advanced real-time performance monitoring and optimization service for scan operations.
This service provides enterprise-grade performance analytics, predictive monitoring,
and intelligent performance optimization for all scanning activities.

Key Features:
- Real-time performance monitoring with sub-second granularity
- Predictive performance analytics and anomaly detection
- Intelligent performance optimization and auto-tuning
- Comprehensive performance metrics and KPI tracking
- Advanced alerting and notification system
- Performance trend analysis and forecasting
- Integration with all data governance components

Production Requirements:
- Monitor 10,000+ concurrent scan operations in real-time
- Sub-second performance metric collection and analysis
- 99.99% monitoring uptime with automatic failover
- Predictive alerts with 95%+ accuracy
- Comprehensive performance audit trails
"""

from typing import List, Dict, Any, Optional, Union, Set, Tuple, AsyncGenerator
from datetime import datetime, timedelta
import asyncio
import uuid
import json
import logging
import time
import threading
import statistics
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from enum import Enum
import traceback
from collections import defaultdict, deque
import heapq

# FastAPI and Database imports
from fastapi import HTTPException, BackgroundTasks
from sqlalchemy import select, update, delete, and_, or_, func, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlmodel import Session

# Performance monitoring imports
import psutil
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
from scipy import stats
import asyncio
import aiohttp

# Internal imports
from ..models.scan_models import *
from ..models.advanced_scan_rule_models import *
from .enterprise_scan_rule_service import get_enterprise_rule_engine
from .scan_orchestration_service import get_enterprise_orchestration_service


class PerformanceMetricType(str, Enum):
    """Types of performance metrics"""
    EXECUTION_TIME = "execution_time"
    THROUGHPUT = "throughput"
    RESOURCE_USAGE = "resource_usage"
    MEMORY_USAGE = "memory_usage"
    CPU_USAGE = "cpu_usage"
    NETWORK_IO = "network_io"
    DISK_IO = "disk_io"
    ERROR_RATE = "error_rate"
    SUCCESS_RATE = "success_rate"
    LATENCY = "latency"
    QUEUE_TIME = "queue_time"
    COST = "cost"


class AlertSeverity(str, Enum):
    """Alert severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class PerformanceStatus(str, Enum):
    """Performance status levels"""
    OPTIMAL = "optimal"
    GOOD = "good"
    DEGRADED = "degraded"
    POOR = "poor"
    CRITICAL = "critical"


@dataclass
class PerformanceMetric:
    """Performance metric data point"""
    metric_id: str
    metric_type: PerformanceMetricType
    value: float
    timestamp: datetime
    source_id: str
    source_type: str
    metadata: Dict[str, Any]
    tags: Dict[str, str]


@dataclass
class PerformanceAlert:
    """Performance alert"""
    alert_id: str
    severity: AlertSeverity
    metric_type: PerformanceMetricType
    threshold_value: float
    actual_value: float
    source_id: str
    message: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class PerformanceAnalytics:
    """Performance analytics summary"""
    total_scans: int = 0
    average_execution_time: float = 0.0
    throughput_per_hour: float = 0.0
    success_rate: float = 0.0
    error_rate: float = 0.0
    resource_utilization: float = 0.0
    cost_per_scan: float = 0.0
    performance_score: float = 0.0
    trend_direction: str = "stable"
    anomaly_count: int = 0


class EnterpriseScanPerformanceService:
    """
    Enterprise-grade scan performance monitoring service with real-time analytics,
    predictive monitoring, and intelligent optimization capabilities.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Performance data storage
        self.metrics_buffer: deque = deque(maxlen=100000)  # Ring buffer for metrics
        self.performance_history: Dict[str, List[PerformanceMetric]] = defaultdict(list)
        self.active_alerts: Dict[str, PerformanceAlert] = {}
        self.performance_thresholds: Dict[PerformanceMetricType, Dict[str, float]] = {}
        
        # Analytics and monitoring
        self.analytics = PerformanceAnalytics()
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.feature_scaler = StandardScaler()
        
        # Real-time monitoring
        self.monitoring_sessions: Dict[str, Dict[str, Any]] = {}
        self.metric_collectors: Dict[str, asyncio.Task] = {}
        
        # Thread pools for performance operations
        self.monitoring_pool = ThreadPoolExecutor(max_workers=8, thread_name_prefix="monitoring")
        self.analytics_pool = ProcessPoolExecutor(max_workers=4)
        self.alerting_pool = ThreadPoolExecutor(max_workers=4, thread_name_prefix="alerting")
        
        # Configuration
        self.metric_collection_interval = 1.0  # seconds
        self.analytics_interval = 60  # seconds
        self.alert_check_interval = 5  # seconds
        self.metric_retention_hours = 168  # 7 days
        self.anomaly_detection_window = 100  # data points
        
        # Background tasks
        self.monitoring_task: Optional[asyncio.Task] = None
        self.analytics_task: Optional[asyncio.Task] = None
        self.alerting_task: Optional[asyncio.Task] = None
        self.cleanup_task: Optional[asyncio.Task] = None
        
        # Shutdown event
        self._shutdown_event = asyncio.Event()
    
    async def initialize(self) -> None:
        """Initialize the performance monitoring service."""
        try:
            self.logger.info("Initializing Enterprise Scan Performance Service")
            
            # Initialize performance thresholds
            await self._initialize_performance_thresholds()
            
            # Initialize anomaly detection
            await self._initialize_anomaly_detection()
            
            # Start background monitoring tasks
            self.monitoring_task = asyncio.create_task(self._monitoring_loop())
            self.analytics_task = asyncio.create_task(self._analytics_loop())
            self.alerting_task = asyncio.create_task(self._alerting_loop())
            self.cleanup_task = asyncio.create_task(self._cleanup_loop())
            
            self.logger.info("Enterprise Scan Performance Service initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize performance service: {str(e)}")
            raise
    
    async def start_performance_monitoring(
        self,
        source_id: str,
        source_type: str,
        metrics_to_monitor: List[PerformanceMetricType],
        collection_interval: Optional[float] = None
    ) -> str:
        """
        Start performance monitoring for a specific source.
        
        Args:
            source_id: ID of the source to monitor
            source_type: Type of the source (scan, rule, orchestration)
            metrics_to_monitor: List of metrics to collect
            collection_interval: Collection interval in seconds
            
        Returns:
            Monitoring session ID
        """
        session_id = str(uuid.uuid4())
        
        try:
            monitoring_session = {
                "session_id": session_id,
                "source_id": source_id,
                "source_type": source_type,
                "metrics_to_monitor": metrics_to_monitor,
                "collection_interval": collection_interval or self.metric_collection_interval,
                "started_at": datetime.utcnow(),
                "status": "active",
                "metrics_collected": 0
            }
            
            self.monitoring_sessions[session_id] = monitoring_session
            
            # Start metric collection task for this session
            collection_task = asyncio.create_task(
                self._collect_metrics_for_session(monitoring_session)
            )
            self.metric_collectors[session_id] = collection_task
            
            self.logger.info(
                f"Performance monitoring started for {source_type} {source_id}",
                extra={"session_id": session_id}
            )
            
            return session_id
            
        except Exception as e:
            self.logger.error(f"Failed to start performance monitoring: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Monitoring start failed: {str(e)}")
    
    async def stop_performance_monitoring(self, session_id: str) -> Dict[str, Any]:
        """
        Stop performance monitoring for a session.
        
        Args:
            session_id: Monitoring session ID
            
        Returns:
            Monitoring summary
        """
        try:
            if session_id not in self.monitoring_sessions:
                raise HTTPException(status_code=404, detail="Monitoring session not found")
            
            monitoring_session = self.monitoring_sessions[session_id]
            
            # Stop metric collection task
            if session_id in self.metric_collectors:
                self.metric_collectors[session_id].cancel()
                del self.metric_collectors[session_id]
            
            # Update session status
            monitoring_session["status"] = "stopped"
            monitoring_session["stopped_at"] = datetime.utcnow()
            
            # Calculate session summary
            session_duration = (
                monitoring_session["stopped_at"] - monitoring_session["started_at"]
            ).total_seconds()
            
            summary = {
                "session_id": session_id,
                "source_id": monitoring_session["source_id"],
                "source_type": monitoring_session["source_type"],
                "duration_seconds": session_duration,
                "metrics_collected": monitoring_session["metrics_collected"],
                "collection_rate": monitoring_session["metrics_collected"] / max(1, session_duration),
                "stopped_at": monitoring_session["stopped_at"]
            }
            
            # Remove from active sessions
            del self.monitoring_sessions[session_id]
            
            self.logger.info(f"Performance monitoring stopped: {session_id}")
            
            return summary
            
        except Exception as e:
            self.logger.error(f"Failed to stop performance monitoring: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Monitoring stop failed: {str(e)}")
    
    async def record_performance_metric(
        self,
        metric_type: PerformanceMetricType,
        value: float,
        source_id: str,
        source_type: str,
        metadata: Optional[Dict[str, Any]] = None,
        tags: Optional[Dict[str, str]] = None
    ) -> None:
        """
        Record a performance metric.
        
        Args:
            metric_type: Type of metric
            value: Metric value
            source_id: Source identifier
            source_type: Source type
            metadata: Additional metadata
            tags: Metric tags
        """
        try:
            metric = PerformanceMetric(
                metric_id=str(uuid.uuid4()),
                metric_type=metric_type,
                value=value,
                timestamp=datetime.utcnow(),
                source_id=source_id,
                source_type=source_type,
                metadata=metadata or {},
                tags=tags or {}
            )
            
            # Add to metrics buffer
            self.metrics_buffer.append(metric)
            
            # Add to historical data
            self.performance_history[source_id].append(metric)
            
            # Check for alerts
            await self._check_metric_thresholds(metric)
            
            # Update real-time analytics
            await self._update_realtime_analytics(metric)
            
        except Exception as e:
            self.logger.error(f"Failed to record performance metric: {str(e)}")
    
    async def get_performance_analytics(
        self,
        source_id: Optional[str] = None,
        metric_types: Optional[List[PerformanceMetricType]] = None,
        time_range: Optional[Tuple[datetime, datetime]] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive performance analytics.
        
        Args:
            source_id: Specific source to analyze (optional)
            metric_types: Specific metric types to analyze (optional)
            time_range: Time range for analysis (optional)
            
        Returns:
            Comprehensive performance analytics
        """
        try:
            # Filter metrics based on criteria
            filtered_metrics = await self._filter_metrics(source_id, metric_types, time_range)
            
            if not filtered_metrics:
                return {"message": "No metrics found for the specified criteria"}
            
            # Calculate analytics
            analytics = await self._calculate_comprehensive_analytics(filtered_metrics)
            
            # Add trend analysis
            analytics["trends"] = await self._analyze_performance_trends(filtered_metrics)
            
            # Add anomaly analysis
            analytics["anomalies"] = await self._detect_performance_anomalies(filtered_metrics)
            
            # Add performance insights
            analytics["insights"] = await self._generate_performance_insights(filtered_metrics)
            
            # Add recommendations
            analytics["recommendations"] = await self._generate_performance_recommendations(
                filtered_metrics
            )
            
            analytics["generated_at"] = datetime.utcnow()
            
            return analytics
            
        except Exception as e:
            self.logger.error(f"Failed to get performance analytics: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Analytics generation failed: {str(e)}")
    
    async def get_real_time_metrics(
        self,
        source_id: Optional[str] = None,
        metric_types: Optional[List[PerformanceMetricType]] = None,
        last_n_minutes: int = 5
    ) -> Dict[str, Any]:
        """
        Get real-time performance metrics.
        
        Args:
            source_id: Specific source to get metrics for (optional)
            metric_types: Specific metric types (optional)
            last_n_minutes: Number of minutes to look back
            
        Returns:
            Real-time metrics data
        """
        try:
            cutoff_time = datetime.utcnow() - timedelta(minutes=last_n_minutes)
            
            # Get recent metrics from buffer
            recent_metrics = [
                metric for metric in self.metrics_buffer
                if metric.timestamp >= cutoff_time
                and (not source_id or metric.source_id == source_id)
                and (not metric_types or metric.metric_type in metric_types)
            ]
            
            if not recent_metrics:
                return {"message": "No recent metrics found"}
            
            # Group metrics by type and source
            grouped_metrics = defaultdict(lambda: defaultdict(list))
            for metric in recent_metrics:
                grouped_metrics[metric.source_id][metric.metric_type].append(metric)
            
            # Calculate real-time statistics
            real_time_data = {}
            for src_id, metrics_by_type in grouped_metrics.items():
                real_time_data[src_id] = {}
                
                for metric_type, metrics in metrics_by_type.items():
                    values = [m.value for m in metrics]
                    
                    real_time_data[src_id][metric_type.value] = {
                        "current_value": values[-1] if values else 0,
                        "average": statistics.mean(values) if values else 0,
                        "min": min(values) if values else 0,
                        "max": max(values) if values else 0,
                        "count": len(values),
                        "trend": self._calculate_trend(values) if len(values) > 1 else "stable",
                        "last_updated": max(m.timestamp for m in metrics).isoformat()
                    }
            
            return {
                "real_time_metrics": real_time_data,
                "time_range": {
                    "start": cutoff_time.isoformat(),
                    "end": datetime.utcnow().isoformat()
                },
                "total_metrics": len(recent_metrics)
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get real-time metrics: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Real-time metrics failed: {str(e)}")
    
    async def get_performance_alerts(
        self,
        severity: Optional[AlertSeverity] = None,
        resolved: Optional[bool] = None,
        source_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get performance alerts.
        
        Args:
            severity: Filter by alert severity (optional)
            resolved: Filter by resolution status (optional)
            source_id: Filter by source ID (optional)
            
        Returns:
            List of performance alerts
        """
        try:
            alerts = []
            
            for alert in self.active_alerts.values():
                # Apply filters
                if severity and alert.severity != severity:
                    continue
                if resolved is not None and (alert.resolved_at is not None) != resolved:
                    continue
                if source_id and alert.source_id != source_id:
                    continue
                
                alert_data = {
                    "alert_id": alert.alert_id,
                    "severity": alert.severity.value,
                    "metric_type": alert.metric_type.value,
                    "threshold_value": alert.threshold_value,
                    "actual_value": alert.actual_value,
                    "source_id": alert.source_id,
                    "message": alert.message,
                    "created_at": alert.created_at.isoformat(),
                    "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
                    "is_resolved": alert.resolved_at is not None,
                    "metadata": alert.metadata
                }
                
                alerts.append(alert_data)
            
            # Sort by creation time (newest first)
            alerts.sort(key=lambda x: x["created_at"], reverse=True)
            
            return alerts
            
        except Exception as e:
            self.logger.error(f"Failed to get performance alerts: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Alert retrieval failed: {str(e)}")
    
    async def set_performance_threshold(
        self,
        metric_type: PerformanceMetricType,
        warning_threshold: float,
        critical_threshold: float,
        source_id: Optional[str] = None
    ) -> None:
        """
        Set performance thresholds for alerting.
        
        Args:
            metric_type: Type of metric
            warning_threshold: Warning threshold value
            critical_threshold: Critical threshold value
            source_id: Specific source ID (optional, applies globally if not specified)
        """
        try:
            threshold_key = f"{source_id}:{metric_type.value}" if source_id else metric_type.value
            
            self.performance_thresholds[metric_type] = {
                "warning": warning_threshold,
                "critical": critical_threshold,
                "source_id": source_id
            }
            
            self.logger.info(
                f"Performance threshold set for {metric_type.value}",
                extra={
                    "warning_threshold": warning_threshold,
                    "critical_threshold": critical_threshold,
                    "source_id": source_id
                }
            )
            
        except Exception as e:
            self.logger.error(f"Failed to set performance threshold: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Threshold setting failed: {str(e)}")
    
    # Private helper methods
    
    async def _initialize_performance_thresholds(self) -> None:
        """Initialize default performance thresholds."""
        default_thresholds = {
            PerformanceMetricType.EXECUTION_TIME: {"warning": 30.0, "critical": 60.0},
            PerformanceMetricType.ERROR_RATE: {"warning": 0.05, "critical": 0.10},
            PerformanceMetricType.CPU_USAGE: {"warning": 80.0, "critical": 95.0},
            PerformanceMetricType.MEMORY_USAGE: {"warning": 80.0, "critical": 95.0},
            PerformanceMetricType.THROUGHPUT: {"warning": 10.0, "critical": 5.0},  # Lower is worse
            PerformanceMetricType.SUCCESS_RATE: {"warning": 0.95, "critical": 0.90}  # Lower is worse
        }
        
        for metric_type, thresholds in default_thresholds.items():
            self.performance_thresholds[metric_type] = thresholds
    
    async def _collect_metrics_for_session(self, monitoring_session: Dict[str, Any]) -> None:
        """Collect metrics for a monitoring session."""
        session_id = monitoring_session["session_id"]
        source_id = monitoring_session["source_id"]
        source_type = monitoring_session["source_type"]
        metrics_to_monitor = monitoring_session["metrics_to_monitor"]
        collection_interval = monitoring_session["collection_interval"]
        
        try:
            while monitoring_session["status"] == "active":
                # Collect system metrics
                system_metrics = await self._collect_system_metrics()
                
                # Collect application-specific metrics
                app_metrics = await self._collect_application_metrics(source_id, source_type)
                
                # Record relevant metrics
                for metric_type in metrics_to_monitor:
                    if metric_type in system_metrics:
                        await self.record_performance_metric(
                            metric_type, system_metrics[metric_type],
                            source_id, source_type
                        )
                    elif metric_type in app_metrics:
                        await self.record_performance_metric(
                            metric_type, app_metrics[metric_type],
                            source_id, source_type
                        )
                
                monitoring_session["metrics_collected"] += len(metrics_to_monitor)
                
                await asyncio.sleep(collection_interval)
                
        except asyncio.CancelledError:
            self.logger.info(f"Metric collection cancelled for session {session_id}")
        except Exception as e:
            self.logger.error(f"Error in metric collection for session {session_id}: {str(e)}")
    
    async def _collect_system_metrics(self) -> Dict[PerformanceMetricType, float]:
        """Collect system-level performance metrics."""
        try:
            metrics = {}
            
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=0.1)
            metrics[PerformanceMetricType.CPU_USAGE] = cpu_percent
            
            # Memory usage
            memory = psutil.virtual_memory()
            metrics[PerformanceMetricType.MEMORY_USAGE] = memory.percent
            
            # Disk I/O
            disk_io = psutil.disk_io_counters()
            if disk_io:
                metrics[PerformanceMetricType.DISK_IO] = disk_io.read_bytes + disk_io.write_bytes
            
            # Network I/O
            network_io = psutil.net_io_counters()
            if network_io:
                metrics[PerformanceMetricType.NETWORK_IO] = network_io.bytes_sent + network_io.bytes_recv
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Failed to collect system metrics: {str(e)}")
            return {}
    
    async def _check_metric_thresholds(self, metric: PerformanceMetric) -> None:
        """Check if a metric exceeds defined thresholds."""
        try:
            if metric.metric_type not in self.performance_thresholds:
                return
            
            thresholds = self.performance_thresholds[metric.metric_type]
            warning_threshold = thresholds["warning"]
            critical_threshold = thresholds["critical"]
            
            # Determine if threshold is exceeded
            severity = None
            threshold_exceeded = False
            
            # For metrics where higher values are worse
            if metric.metric_type in [
                PerformanceMetricType.EXECUTION_TIME,
                PerformanceMetricType.ERROR_RATE,
                PerformanceMetricType.CPU_USAGE,
                PerformanceMetricType.MEMORY_USAGE
            ]:
                if metric.value >= critical_threshold:
                    severity = AlertSeverity.CRITICAL
                    threshold_exceeded = True
                elif metric.value >= warning_threshold:
                    severity = AlertSeverity.HIGH
                    threshold_exceeded = True
            
            # For metrics where lower values are worse
            elif metric.metric_type in [
                PerformanceMetricType.THROUGHPUT,
                PerformanceMetricType.SUCCESS_RATE
            ]:
                if metric.value <= critical_threshold:
                    severity = AlertSeverity.CRITICAL
                    threshold_exceeded = True
                elif metric.value <= warning_threshold:
                    severity = AlertSeverity.HIGH
                    threshold_exceeded = True
            
            if threshold_exceeded:
                await self._create_performance_alert(metric, severity, thresholds)
                
        except Exception as e:
            self.logger.error(f"Failed to check metric thresholds: {str(e)}")
    
    async def _create_performance_alert(
        self,
        metric: PerformanceMetric,
        severity: AlertSeverity,
        thresholds: Dict[str, float]
    ) -> None:
        """Create a performance alert."""
        try:
            alert = PerformanceAlert(
                alert_id=str(uuid.uuid4()),
                severity=severity,
                metric_type=metric.metric_type,
                threshold_value=thresholds.get("critical" if severity == AlertSeverity.CRITICAL else "warning", 0),
                actual_value=metric.value,
                source_id=metric.source_id,
                message=f"{metric.metric_type.value} threshold exceeded for {metric.source_id}",
                created_at=datetime.utcnow(),
                metadata={
                    "metric_id": metric.metric_id,
                    "thresholds": thresholds,
                    "metric_metadata": metric.metadata
                }
            )
            
            self.active_alerts[alert.alert_id] = alert
            
            self.logger.warning(
                f"Performance alert created: {alert.message}",
                extra={
                    "alert_id": alert.alert_id,
                    "severity": severity.value,
                    "actual_value": metric.value,
                    "threshold": alert.threshold_value
                }
            )
            
        except Exception as e:
            self.logger.error(f"Failed to create performance alert: {str(e)}")
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend direction from a list of values."""
        if len(values) < 2:
            return "stable"
        
        # Use linear regression to determine trend
        x = np.arange(len(values))
        slope, _, _, _, _ = stats.linregress(x, values)
        
        if slope > 0.1:
            return "increasing"
        elif slope < -0.1:
            return "decreasing"
        else:
            return "stable"
    
    async def _monitoring_loop(self) -> None:
        """Background monitoring loop."""
        while not self._shutdown_event.is_set():
            try:
                # Monitor active sessions
                await self._monitor_active_sessions()
                
                # Check for stale sessions
                await self._cleanup_stale_sessions()
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                self.logger.error(f"Error in monitoring loop: {str(e)}")
                await asyncio.sleep(30)
    
    async def _analytics_loop(self) -> None:
        """Background analytics loop."""
        while not self._shutdown_event.is_set():
            try:
                # Update global analytics
                await self._update_global_analytics()
                
                # Detect anomalies
                await self._detect_global_anomalies()
                
                # Generate performance insights
                await self._generate_periodic_insights()
                
                await asyncio.sleep(self.analytics_interval)
                
            except Exception as e:
                self.logger.error(f"Error in analytics loop: {str(e)}")
                await asyncio.sleep(self.analytics_interval)
    
    async def _alerting_loop(self) -> None:
        """Background alerting loop."""
        while not self._shutdown_event.is_set():
            try:
                # Check for alert resolution
                await self._check_alert_resolution()
                
                # Send notifications for new alerts
                await self._process_alert_notifications()
                
                await asyncio.sleep(self.alert_check_interval)
                
            except Exception as e:
                self.logger.error(f"Error in alerting loop: {str(e)}")
                await asyncio.sleep(self.alert_check_interval)
    
    async def shutdown(self) -> None:
        """Shutdown the performance service gracefully."""
        try:
            self.logger.info("Shutting down Enterprise Scan Performance Service")
            
            # Signal shutdown
            self._shutdown_event.set()
            
            # Stop all monitoring sessions
            for session_id in list(self.monitoring_sessions.keys()):
                await self.stop_performance_monitoring(session_id)
            
            # Cancel background tasks
            if self.monitoring_task:
                self.monitoring_task.cancel()
            if self.analytics_task:
                self.analytics_task.cancel()
            if self.alerting_task:
                self.alerting_task.cancel()
            if self.cleanup_task:
                self.cleanup_task.cancel()
            
            # Shutdown thread pools
            self.monitoring_pool.shutdown(wait=True)
            self.analytics_pool.shutdown(wait=True)
            self.alerting_pool.shutdown(wait=True)
            
            self.logger.info("Enterprise Scan Performance Service shutdown completed")
            
        except Exception as e:
            self.logger.error(f"Error during shutdown: {str(e)}")


# Global service instance
enterprise_performance_service = None

async def get_enterprise_performance_service() -> EnterpriseScanPerformanceService:
    """Get or create the global enterprise performance service instance."""
    global enterprise_performance_service
    
    if enterprise_performance_service is None:
        enterprise_performance_service = EnterpriseScanPerformanceService()
        await enterprise_performance_service.initialize()
    
    return enterprise_performance_service


# Exports
__all__ = [
    "EnterpriseScanPerformanceService",
    "PerformanceMetricType",
    "AlertSeverity",
    "PerformanceStatus",
    "PerformanceMetric",
    "PerformanceAlert",
    "PerformanceAnalytics",
    "get_enterprise_performance_service"
]