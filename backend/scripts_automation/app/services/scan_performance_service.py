"""
📊 SCAN PERFORMANCE SERVICE
Advanced performance monitoring, analytics, and optimization service for scan operations
with real-time metrics, predictive analytics, and intelligent performance management.
"""

from typing import List, Dict, Any, Optional, Union, Set, Tuple
from datetime import datetime, timedelta
from enum import Enum
import asyncio
import json
import logging
import numpy as np
import pandas as pd
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import time
import psutil
import threading
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy import and_, or_, func, desc
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ..models.scan_models import (
    Scan, ScanStatus, DataSource, ScanResult
)
from ..models.advanced_scan_rule_models import (
    IntelligentScanRule, RuleExecutionHistory, ScanRulePerformance
)
from ..models.scan_orchestration_models import (
    ScanOrchestrationJob, ScanWorkflow, ScanPerformanceMetrics
)
from ..core.database import get_session
from .enterprise_scan_rule_service import EnterpriseScanRuleService
from .scan_orchestration_service import ScanOrchestrationService

logger = logging.getLogger(__name__)

class PerformanceMetricType(str, Enum):
    """Types of performance metrics"""
    EXECUTION_TIME = "execution_time"
    THROUGHPUT = "throughput"
    CPU_USAGE = "cpu_usage"
    MEMORY_USAGE = "memory_usage"
    NETWORK_IO = "network_io"
    DISK_IO = "disk_io"
    ERROR_RATE = "error_rate"
    ACCURACY = "accuracy"
    LATENCY = "latency"
    QUEUE_SIZE = "queue_size"

class AlertSeverity(str, Enum):
    """Performance alert severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class PerformanceTrend(str, Enum):
    """Performance trend directions"""
    IMPROVING = "improving"
    DEGRADING = "degrading"
    STABLE = "stable"
    VOLATILE = "volatile"

@dataclass
class PerformanceSnapshot:
    """Real-time performance snapshot"""
    timestamp: datetime
    scan_id: Optional[str]
    rule_id: Optional[str]
    data_source_id: Optional[int]
    execution_time: float
    cpu_usage: float
    memory_usage: float
    network_io: Dict[str, float]
    disk_io: Dict[str, float]
    throughput: float
    error_count: int
    success_rate: float
    queue_length: int
    concurrent_scans: int

@dataclass
class PerformanceAlert:
    """Performance alert information"""
    id: str
    alert_type: str
    severity: AlertSeverity
    metric_type: PerformanceMetricType
    threshold_value: float
    current_value: float
    rule_id: Optional[str]
    data_source_id: Optional[int]
    message: str
    timestamp: datetime
    resolved: bool = False
    resolution_time: Optional[datetime] = None

@dataclass
class PerformanceAnalysis:
    """Performance analysis results"""
    metric_type: PerformanceMetricType
    current_value: float
    trend: PerformanceTrend
    trend_percentage: float
    baseline_value: float
    percentile_95: float
    percentile_99: float
    anomaly_score: float
    recommendations: List[str]

class RealTimePerformanceMonitor:
    """Real-time performance monitoring system"""
    
    def __init__(self):
        self.performance_snapshots = deque(maxlen=10000)  # Keep last 10K snapshots
        self.active_scans = {}
        self.monitoring_active = False
        self.monitor_thread = None
        self.performance_callbacks = []
        
    def start_monitoring(self):
        """Start real-time performance monitoring"""
        if not self.monitoring_active:
            self.monitoring_active = True
            self.monitor_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
            self.monitor_thread.start()
            logger.info("Real-time performance monitoring started")
    
    def stop_monitoring(self):
        """Stop real-time performance monitoring"""
        self.monitoring_active = False
        if self.monitor_thread and self.monitor_thread.is_alive():
            self.monitor_thread.join(timeout=5)
        logger.info("Real-time performance monitoring stopped")
    
    def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.monitoring_active:
            try:
                snapshot = self._capture_performance_snapshot()
                self.performance_snapshots.append(snapshot)
                
                # Trigger callbacks
                for callback in self.performance_callbacks:
                    try:
                        callback(snapshot)
                    except Exception as e:
                        logger.error(f"Performance callback error: {str(e)}")
                
                time.sleep(1)  # 1-second intervals
                
            except Exception as e:
                logger.error(f"Performance monitoring error: {str(e)}")
                time.sleep(5)  # Wait before retrying
    
    def _capture_performance_snapshot(self) -> PerformanceSnapshot:
        """Capture current performance snapshot"""
        
        # Get system metrics
        cpu_percent = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory()
        network_io = psutil.net_io_counters()._asdict()
        disk_io = psutil.disk_io_counters()._asdict() if psutil.disk_io_counters() else {}
        
        # Get scan-specific metrics
        concurrent_scans = len(self.active_scans)
        queue_length = self._get_scan_queue_length()
        
        return PerformanceSnapshot(
            timestamp=datetime.utcnow(),
            scan_id=None,  # Will be set for specific scans
            rule_id=None,
            data_source_id=None,
            execution_time=0.0,
            cpu_usage=cpu_percent,
            memory_usage=memory.percent,
            network_io={
                'bytes_sent': network_io.get('bytes_sent', 0),
                'bytes_recv': network_io.get('bytes_recv', 0)
            },
            disk_io={
                'read_bytes': disk_io.get('read_bytes', 0),
                'write_bytes': disk_io.get('write_bytes', 0)
            },
            throughput=self._calculate_current_throughput(),
            error_count=0,
            success_rate=self._calculate_current_success_rate(),
            queue_length=queue_length,
            concurrent_scans=concurrent_scans
        )
    
    def _get_scan_queue_length(self) -> int:
        """Get current scan queue length"""
        try:
            with get_session() as session:
                queue_count = session.query(Scan).filter(
                    Scan.status == ScanStatus.PENDING
                ).count()
                return queue_count
        except Exception as e:
            logger.error(f"Error getting queue length: {str(e)}")
            return 0
    
    def _calculate_current_throughput(self) -> float:
        """Calculate current throughput (scans per minute)"""
        if len(self.performance_snapshots) < 60:  # Need at least 1 minute of data
            return 0.0
        
        # Count completed scans in last minute
        one_minute_ago = datetime.utcnow() - timedelta(minutes=1)
        recent_snapshots = [s for s in list(self.performance_snapshots)[-60:] 
                           if s.timestamp >= one_minute_ago]
        
        return len(recent_snapshots) / max(1, len(recent_snapshots) / 60)
    
    def _calculate_current_success_rate(self) -> float:
        """Calculate current success rate"""
        try:
            with get_session() as session:
                total_recent = session.query(Scan).filter(
                    Scan.created_at >= datetime.utcnow() - timedelta(minutes=10)
                ).count()
                
                if total_recent == 0:
                    return 1.0
                
                successful_recent = session.query(Scan).filter(
                    Scan.created_at >= datetime.utcnow() - timedelta(minutes=10),
                    Scan.status == ScanStatus.COMPLETED
                ).count()
                
                return successful_recent / total_recent
        except Exception as e:
            logger.error(f"Error calculating success rate: {str(e)}")
            return 0.5
    
    def register_scan_start(self, scan_id: str, rule_id: str, data_source_id: int):
        """Register start of a scan for tracking"""
        self.active_scans[scan_id] = {
            'start_time': time.time(),
            'rule_id': rule_id,
            'data_source_id': data_source_id
        }
    
    def register_scan_end(self, scan_id: str, success: bool, error_count: int = 0):
        """Register end of a scan"""
        if scan_id in self.active_scans:
            scan_info = self.active_scans.pop(scan_id)
            execution_time = time.time() - scan_info['start_time']
            
            # Create specific snapshot for this scan
            snapshot = self._capture_performance_snapshot()
            snapshot.scan_id = scan_id
            snapshot.rule_id = scan_info['rule_id']
            snapshot.data_source_id = scan_info['data_source_id']
            snapshot.execution_time = execution_time
            snapshot.error_count = error_count
            snapshot.success_rate = 1.0 if success else 0.0
            
            self.performance_snapshots.append(snapshot)
    
    def get_recent_snapshots(self, minutes: int = 60) -> List[PerformanceSnapshot]:
        """Get performance snapshots from recent time period"""
        cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
        return [s for s in self.performance_snapshots if s.timestamp >= cutoff_time]
    
    def add_performance_callback(self, callback):
        """Add callback function for performance events"""
        self.performance_callbacks.append(callback)

class PerformanceAnalyzer:
    """Advanced performance analyzer with trend detection and anomaly detection"""
    
    def __init__(self):
        self.baseline_metrics = {}
        self.trend_windows = {
            'short': 15,   # 15 minutes
            'medium': 60,  # 1 hour
            'long': 720    # 12 hours
        }
        
    async def analyze_performance_trends(
        self,
        snapshots: List[PerformanceSnapshot],
        metric_type: PerformanceMetricType
    ) -> PerformanceAnalysis:
        """Analyze performance trends for a specific metric"""
        
        if not snapshots:
            return self._create_empty_analysis(metric_type)
        
        # Extract metric values
        values = self._extract_metric_values(snapshots, metric_type)
        
        if not values:
            return self._create_empty_analysis(metric_type)
        
        # Calculate statistics
        current_value = values[-1] if values else 0.0
        baseline_value = self._get_baseline_value(metric_type)
        percentile_95 = np.percentile(values, 95)
        percentile_99 = np.percentile(values, 99)
        
        # Detect trend
        trend, trend_percentage = self._detect_trend(values)
        
        # Calculate anomaly score
        anomaly_score = self._calculate_anomaly_score(values, current_value)
        
        # Generate recommendations
        recommendations = await self._generate_recommendations(
            metric_type, current_value, trend, anomaly_score
        )
        
        return PerformanceAnalysis(
            metric_type=metric_type,
            current_value=current_value,
            trend=trend,
            trend_percentage=trend_percentage,
            baseline_value=baseline_value,
            percentile_95=percentile_95,
            percentile_99=percentile_99,
            anomaly_score=anomaly_score,
            recommendations=recommendations
        )
    
    def _extract_metric_values(
        self,
        snapshots: List[PerformanceSnapshot],
        metric_type: PerformanceMetricType
    ) -> List[float]:
        """Extract values for a specific metric type"""
        
        values = []
        for snapshot in snapshots:
            if metric_type == PerformanceMetricType.EXECUTION_TIME:
                values.append(snapshot.execution_time)
            elif metric_type == PerformanceMetricType.CPU_USAGE:
                values.append(snapshot.cpu_usage)
            elif metric_type == PerformanceMetricType.MEMORY_USAGE:
                values.append(snapshot.memory_usage)
            elif metric_type == PerformanceMetricType.THROUGHPUT:
                values.append(snapshot.throughput)
            elif metric_type == PerformanceMetricType.ERROR_RATE:
                values.append(1.0 - snapshot.success_rate)
            elif metric_type == PerformanceMetricType.LATENCY:
                values.append(snapshot.execution_time)  # Same as execution time
            elif metric_type == PerformanceMetricType.QUEUE_SIZE:
                values.append(snapshot.queue_length)
        
        return [v for v in values if v is not None]
    
    def _detect_trend(self, values: List[float]) -> Tuple[PerformanceTrend, float]:
        """Detect trend in values"""
        
        if len(values) < 10:
            return PerformanceTrend.STABLE, 0.0
        
        # Use linear regression to detect trend
        x = np.arange(len(values))
        y = np.array(values)
        
        # Calculate correlation coefficient
        correlation = np.corrcoef(x, y)[0, 1]
        
        # Calculate percentage change
        if len(values) >= 2:
            start_avg = np.mean(values[:len(values)//4])
            end_avg = np.mean(values[-len(values)//4:])
            percentage_change = ((end_avg - start_avg) / start_avg) * 100 if start_avg != 0 else 0
        else:
            percentage_change = 0.0
        
        # Determine trend
        if abs(correlation) < 0.3:
            if np.std(values) / np.mean(values) > 0.5:  # High coefficient of variation
                return PerformanceTrend.VOLATILE, percentage_change
            else:
                return PerformanceTrend.STABLE, percentage_change
        elif correlation > 0.3:
            return PerformanceTrend.DEGRADING if percentage_change > 0 else PerformanceTrend.IMPROVING, abs(percentage_change)
        else:
            return PerformanceTrend.IMPROVING if percentage_change < 0 else PerformanceTrend.DEGRADING, abs(percentage_change)
    
    def _calculate_anomaly_score(self, values: List[float], current_value: float) -> float:
        """Calculate anomaly score for current value"""
        
        if len(values) < 10:
            return 0.0
        
        # Use z-score based anomaly detection
        mean_val = np.mean(values)
        std_val = np.std(values)
        
        if std_val == 0:
            return 0.0
        
        z_score = abs((current_value - mean_val) / std_val)
        
        # Convert z-score to 0-1 anomaly score
        return min(1.0, z_score / 3.0)  # 3-sigma rule
    
    def _get_baseline_value(self, metric_type: PerformanceMetricType) -> float:
        """Get baseline value for metric type"""
        return self.baseline_metrics.get(metric_type.value, 0.0)
    
    def _create_empty_analysis(self, metric_type: PerformanceMetricType) -> PerformanceAnalysis:
        """Create empty analysis for cases with no data"""
        return PerformanceAnalysis(
            metric_type=metric_type,
            current_value=0.0,
            trend=PerformanceTrend.STABLE,
            trend_percentage=0.0,
            baseline_value=0.0,
            percentile_95=0.0,
            percentile_99=0.0,
            anomaly_score=0.0,
            recommendations=["Insufficient data for analysis"]
        )
    
    async def _generate_recommendations(
        self,
        metric_type: PerformanceMetricType,
        current_value: float,
        trend: PerformanceTrend,
        anomaly_score: float
    ) -> List[str]:
        """Generate performance recommendations"""
        
        recommendations = []
        
        # High-level recommendations based on metric type and trend
        if metric_type == PerformanceMetricType.EXECUTION_TIME:
            if trend == PerformanceTrend.DEGRADING:
                recommendations.append("Consider optimizing scan rules for better performance")
                recommendations.append("Review data source connection settings")
            if current_value > 10.0:  # More than 10 seconds
                recommendations.append("Execution time is high - consider rule optimization")
        
        elif metric_type == PerformanceMetricType.CPU_USAGE:
            if current_value > 80.0:
                recommendations.append("High CPU usage detected - consider scaling resources")
            if trend == PerformanceTrend.DEGRADING:
                recommendations.append("CPU usage is increasing - monitor for bottlenecks")
        
        elif metric_type == PerformanceMetricType.MEMORY_USAGE:
            if current_value > 85.0:
                recommendations.append("High memory usage - consider memory optimization")
            if trend == PerformanceTrend.DEGRADING:
                recommendations.append("Memory usage is increasing - check for memory leaks")
        
        elif metric_type == PerformanceMetricType.ERROR_RATE:
            if current_value > 0.05:  # More than 5% error rate
                recommendations.append("High error rate detected - review rule configurations")
            if trend == PerformanceTrend.DEGRADING:
                recommendations.append("Error rate is increasing - investigate root causes")
        
        elif metric_type == PerformanceMetricType.THROUGHPUT:
            if trend == PerformanceTrend.DEGRADING:
                recommendations.append("Throughput is decreasing - optimize scan performance")
            if current_value < 10.0:  # Less than 10 scans per minute
                recommendations.append("Low throughput - consider parallel processing")
        
        # Anomaly-based recommendations
        if anomaly_score > 0.7:
            recommendations.append("Anomalous behavior detected - investigate immediately")
        elif anomaly_score > 0.5:
            recommendations.append("Unusual pattern detected - monitor closely")
        
        return recommendations or ["Performance is within normal ranges"]

class AlertManager:
    """Performance alert management system"""
    
    def __init__(self):
        self.active_alerts = {}
        self.alert_thresholds = {
            PerformanceMetricType.CPU_USAGE: 85.0,
            PerformanceMetricType.MEMORY_USAGE: 90.0,
            PerformanceMetricType.EXECUTION_TIME: 30.0,
            PerformanceMetricType.ERROR_RATE: 0.1,
            PerformanceMetricType.QUEUE_SIZE: 100
        }
        self.alert_callbacks = []
    
    async def check_alerts(self, snapshot: PerformanceSnapshot):
        """Check for performance alerts based on current snapshot"""
        
        alerts_to_trigger = []
        
        # Check CPU usage
        if snapshot.cpu_usage > self.alert_thresholds[PerformanceMetricType.CPU_USAGE]:
            alert = self._create_alert(
                "high_cpu_usage",
                AlertSeverity.HIGH,
                PerformanceMetricType.CPU_USAGE,
                self.alert_thresholds[PerformanceMetricType.CPU_USAGE],
                snapshot.cpu_usage,
                f"CPU usage is {snapshot.cpu_usage:.1f}%, exceeding threshold of {self.alert_thresholds[PerformanceMetricType.CPU_USAGE]:.1f}%"
            )
            alerts_to_trigger.append(alert)
        
        # Check memory usage
        if snapshot.memory_usage > self.alert_thresholds[PerformanceMetricType.MEMORY_USAGE]:
            alert = self._create_alert(
                "high_memory_usage",
                AlertSeverity.HIGH,
                PerformanceMetricType.MEMORY_USAGE,
                self.alert_thresholds[PerformanceMetricType.MEMORY_USAGE],
                snapshot.memory_usage,
                f"Memory usage is {snapshot.memory_usage:.1f}%, exceeding threshold of {self.alert_thresholds[PerformanceMetricType.MEMORY_USAGE]:.1f}%"
            )
            alerts_to_trigger.append(alert)
        
        # Check execution time
        if snapshot.execution_time > self.alert_thresholds[PerformanceMetricType.EXECUTION_TIME]:
            alert = self._create_alert(
                "slow_execution",
                AlertSeverity.MEDIUM,
                PerformanceMetricType.EXECUTION_TIME,
                self.alert_thresholds[PerformanceMetricType.EXECUTION_TIME],
                snapshot.execution_time,
                f"Scan execution time is {snapshot.execution_time:.1f}s, exceeding threshold of {self.alert_thresholds[PerformanceMetricType.EXECUTION_TIME]:.1f}s"
            )
            alert.rule_id = snapshot.rule_id
            alert.data_source_id = snapshot.data_source_id
            alerts_to_trigger.append(alert)
        
        # Check error rate
        error_rate = 1.0 - snapshot.success_rate
        if error_rate > self.alert_thresholds[PerformanceMetricType.ERROR_RATE]:
            alert = self._create_alert(
                "high_error_rate",
                AlertSeverity.CRITICAL,
                PerformanceMetricType.ERROR_RATE,
                self.alert_thresholds[PerformanceMetricType.ERROR_RATE],
                error_rate,
                f"Error rate is {error_rate:.1%}, exceeding threshold of {self.alert_thresholds[PerformanceMetricType.ERROR_RATE]:.1%}"
            )
            alerts_to_trigger.append(alert)
        
        # Check queue size
        if snapshot.queue_length > self.alert_thresholds[PerformanceMetricType.QUEUE_SIZE]:
            alert = self._create_alert(
                "large_queue",
                AlertSeverity.MEDIUM,
                PerformanceMetricType.QUEUE_SIZE,
                self.alert_thresholds[PerformanceMetricType.QUEUE_SIZE],
                snapshot.queue_length,
                f"Scan queue size is {snapshot.queue_length}, exceeding threshold of {self.alert_thresholds[PerformanceMetricType.QUEUE_SIZE]}"
            )
            alerts_to_trigger.append(alert)
        
        # Trigger new alerts
        for alert in alerts_to_trigger:
            await self._trigger_alert(alert)
    
    def _create_alert(
        self,
        alert_type: str,
        severity: AlertSeverity,
        metric_type: PerformanceMetricType,
        threshold_value: float,
        current_value: float,
        message: str
    ) -> PerformanceAlert:
        """Create a performance alert"""
        
        alert_id = f"{alert_type}_{int(time.time())}"
        
        return PerformanceAlert(
            id=alert_id,
            alert_type=alert_type,
            severity=severity,
            metric_type=metric_type,
            threshold_value=threshold_value,
            current_value=current_value,
            rule_id=None,
            data_source_id=None,
            message=message,
            timestamp=datetime.utcnow()
        )
    
    async def _trigger_alert(self, alert: PerformanceAlert):
        """Trigger a performance alert"""
        
        # Check if similar alert is already active
        for existing_alert in self.active_alerts.values():
            if (existing_alert.alert_type == alert.alert_type and
                existing_alert.metric_type == alert.metric_type and
                not existing_alert.resolved):
                # Update existing alert instead of creating new one
                existing_alert.current_value = alert.current_value
                existing_alert.timestamp = alert.timestamp
                return
        
        # Add new alert
        self.active_alerts[alert.id] = alert
        
        logger.warning(f"Performance alert triggered: {alert.message}")
        
        # Notify callbacks
        for callback in self.alert_callbacks:
            try:
                await callback(alert)
            except Exception as e:
                logger.error(f"Alert callback error: {str(e)}")
    
    async def resolve_alert(self, alert_id: str):
        """Resolve a performance alert"""
        if alert_id in self.active_alerts:
            alert = self.active_alerts[alert_id]
            alert.resolved = True
            alert.resolution_time = datetime.utcnow()
            logger.info(f"Performance alert resolved: {alert.message}")
    
    def get_active_alerts(self) -> List[PerformanceAlert]:
        """Get all active alerts"""
        return [alert for alert in self.active_alerts.values() if not alert.resolved]
    
    def add_alert_callback(self, callback):
        """Add callback for alert notifications"""
        self.alert_callbacks.append(callback)

class ScanPerformanceService:
    """
    📊 SCAN PERFORMANCE SERVICE
    
    Advanced performance monitoring, analytics, and optimization service that provides
    comprehensive performance management for scan operations with real-time monitoring,
    predictive analytics, and intelligent performance optimization.
    """
    
    def __init__(self):
        self.monitor = RealTimePerformanceMonitor()
        self.analyzer = PerformanceAnalyzer()
        self.alert_manager = AlertManager()
        self.enterprise_rule_service = EnterpriseScanRuleService()
        self.orchestration_service = ScanOrchestrationService()
        
        # Set up monitoring callbacks
        self.monitor.add_performance_callback(self._on_performance_snapshot)
        
        # Performance history cache
        self.performance_history = defaultdict(list)
        self.aggregated_metrics = {}
        
        # Start monitoring
        self.monitor.start_monitoring()
        
    async def _on_performance_snapshot(self, snapshot: PerformanceSnapshot):
        """Handle new performance snapshot"""
        try:
            # Check for alerts
            await self.alert_manager.check_alerts(snapshot)
            
            # Store in history
            if snapshot.rule_id:
                self.performance_history[snapshot.rule_id].append(snapshot)
                
                # Keep only recent history
                if len(self.performance_history[snapshot.rule_id]) > 1000:
                    self.performance_history[snapshot.rule_id] = self.performance_history[snapshot.rule_id][-1000:]
            
        except Exception as e:
            logger.error(f"Error processing performance snapshot: {str(e)}")
    
    async def get_real_time_metrics(self) -> Dict[str, Any]:
        """Get current real-time performance metrics"""
        
        recent_snapshots = self.monitor.get_recent_snapshots(minutes=5)
        
        if not recent_snapshots:
            return {
                "status": "no_data",
                "message": "No recent performance data available"
            }
        
        # Calculate current metrics
        latest_snapshot = recent_snapshots[-1]
        
        # Calculate averages over last 5 minutes
        avg_cpu = np.mean([s.cpu_usage for s in recent_snapshots])
        avg_memory = np.mean([s.memory_usage for s in recent_snapshots])
        avg_throughput = np.mean([s.throughput for s in recent_snapshots])
        avg_success_rate = np.mean([s.success_rate for s in recent_snapshots])
        
        return {
            "timestamp": latest_snapshot.timestamp,
            "current_metrics": {
                "cpu_usage": latest_snapshot.cpu_usage,
                "memory_usage": latest_snapshot.memory_usage,
                "concurrent_scans": latest_snapshot.concurrent_scans,
                "queue_length": latest_snapshot.queue_length,
                "throughput": latest_snapshot.throughput,
                "success_rate": latest_snapshot.success_rate
            },
            "5_minute_averages": {
                "cpu_usage": avg_cpu,
                "memory_usage": avg_memory,
                "throughput": avg_throughput,
                "success_rate": avg_success_rate
            },
            "active_alerts_count": len(self.alert_manager.get_active_alerts()),
            "monitoring_status": "active" if self.monitor.monitoring_active else "inactive"
        }
    
    async def get_performance_analysis(
        self,
        metric_type: PerformanceMetricType,
        time_window_minutes: int = 60
    ) -> PerformanceAnalysis:
        """Get detailed performance analysis for a specific metric"""
        
        recent_snapshots = self.monitor.get_recent_snapshots(minutes=time_window_minutes)
        return await self.analyzer.analyze_performance_trends(recent_snapshots, metric_type)
    
    async def get_rule_performance_report(
        self,
        rule_id: str,
        time_window_hours: int = 24
    ) -> Dict[str, Any]:
        """Get comprehensive performance report for a specific rule"""
        
        if rule_id not in self.performance_history:
            return {
                "rule_id": rule_id,
                "status": "no_data",
                "message": "No performance data available for this rule"
            }
        
        # Get rule history
        cutoff_time = datetime.utcnow() - timedelta(hours=time_window_hours)
        rule_snapshots = [
            s for s in self.performance_history[rule_id] 
            if s.timestamp >= cutoff_time
        ]
        
        if not rule_snapshots:
            return {
                "rule_id": rule_id,
                "status": "no_recent_data",
                "message": f"No performance data in last {time_window_hours} hours"
            }
        
        # Calculate statistics
        execution_times = [s.execution_time for s in rule_snapshots if s.execution_time > 0]
        success_rates = [s.success_rate for s in rule_snapshots]
        error_counts = [s.error_count for s in rule_snapshots]
        
        # Performance analysis for different metrics
        analyses = {}
        for metric_type in [PerformanceMetricType.EXECUTION_TIME, PerformanceMetricType.ERROR_RATE]:
            analyses[metric_type.value] = await self.analyzer.analyze_performance_trends(
                rule_snapshots, metric_type
            )
        
        return {
            "rule_id": rule_id,
            "time_window_hours": time_window_hours,
            "total_executions": len(rule_snapshots),
            "performance_statistics": {
                "avg_execution_time": np.mean(execution_times) if execution_times else 0,
                "min_execution_time": np.min(execution_times) if execution_times else 0,
                "max_execution_time": np.max(execution_times) if execution_times else 0,
                "p95_execution_time": np.percentile(execution_times, 95) if execution_times else 0,
                "avg_success_rate": np.mean(success_rates) if success_rates else 0,
                "total_errors": sum(error_counts)
            },
            "trend_analyses": {k: asdict(v) for k, v in analyses.items()},
            "recent_performance": [asdict(s) for s in rule_snapshots[-10:]]  # Last 10 executions
        }
    
    async def get_data_source_performance_report(
        self,
        data_source_id: int,
        time_window_hours: int = 24
    ) -> Dict[str, Any]:
        """Get performance report for a specific data source"""
        
        # Collect snapshots for this data source
        cutoff_time = datetime.utcnow() - timedelta(hours=time_window_hours)
        data_source_snapshots = []
        
        for rule_snapshots in self.performance_history.values():
            for snapshot in rule_snapshots:
                if (snapshot.data_source_id == data_source_id and 
                    snapshot.timestamp >= cutoff_time):
                    data_source_snapshots.append(snapshot)
        
        if not data_source_snapshots:
            return {
                "data_source_id": data_source_id,
                "status": "no_data",
                "message": f"No performance data in last {time_window_hours} hours"
            }
        
        # Calculate statistics
        execution_times = [s.execution_time for s in data_source_snapshots if s.execution_time > 0]
        success_rates = [s.success_rate for s in data_source_snapshots]
        
        # Group by rule
        rules_performance = defaultdict(list)
        for snapshot in data_source_snapshots:
            if snapshot.rule_id:
                rules_performance[snapshot.rule_id].append(snapshot)
        
        rules_stats = {}
        for rule_id, snapshots in rules_performance.items():
            rule_execution_times = [s.execution_time for s in snapshots if s.execution_time > 0]
            rules_stats[rule_id] = {
                "executions": len(snapshots),
                "avg_execution_time": np.mean(rule_execution_times) if rule_execution_times else 0,
                "avg_success_rate": np.mean([s.success_rate for s in snapshots])
            }
        
        return {
            "data_source_id": data_source_id,
            "time_window_hours": time_window_hours,
            "total_scans": len(data_source_snapshots),
            "performance_statistics": {
                "avg_execution_time": np.mean(execution_times) if execution_times else 0,
                "p95_execution_time": np.percentile(execution_times, 95) if execution_times else 0,
                "avg_success_rate": np.mean(success_rates) if success_rates else 0,
                "unique_rules_executed": len(rules_performance)
            },
            "rules_performance": rules_stats,
            "recent_scans": [asdict(s) for s in data_source_snapshots[-20:]]
        }
    
    async def get_system_performance_dashboard(self) -> Dict[str, Any]:
        """Get comprehensive system performance dashboard"""
        
        # Get recent snapshots
        recent_snapshots = self.monitor.get_recent_snapshots(minutes=60)
        
        if not recent_snapshots:
            return {
                "status": "no_data",
                "message": "No performance data available"
            }
        
        # System-wide metrics
        current_snapshot = recent_snapshots[-1]
        
        # Calculate trend analyses
        trend_analyses = {}
        for metric_type in [
            PerformanceMetricType.CPU_USAGE,
            PerformanceMetricType.MEMORY_USAGE,
            PerformanceMetricType.THROUGHPUT,
            PerformanceMetricType.ERROR_RATE
        ]:
            trend_analyses[metric_type.value] = await self.analyzer.analyze_performance_trends(
                recent_snapshots, metric_type
            )
        
        # Get top performing rules
        top_rules = await self._get_top_performing_rules()
        
        # Get bottleneck analysis
        bottlenecks = await self._identify_bottlenecks(recent_snapshots)
        
        return {
            "timestamp": current_snapshot.timestamp,
            "system_overview": {
                "cpu_usage": current_snapshot.cpu_usage,
                "memory_usage": current_snapshot.memory_usage,
                "concurrent_scans": current_snapshot.concurrent_scans,
                "queue_length": current_snapshot.queue_length,
                "throughput": current_snapshot.throughput,
                "success_rate": current_snapshot.success_rate
            },
            "trend_analyses": {k: asdict(v) for k, v in trend_analyses.items()},
            "active_alerts": [asdict(alert) for alert in self.alert_manager.get_active_alerts()],
            "top_performing_rules": top_rules,
            "bottleneck_analysis": bottlenecks,
            "performance_summary": {
                "total_snapshots_analyzed": len(recent_snapshots),
                "monitoring_duration_minutes": 60,
                "performance_score": await self._calculate_overall_performance_score(recent_snapshots)
            }
        }
    
    async def _get_top_performing_rules(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top performing rules based on recent performance"""
        
        rule_performance = {}
        
        for rule_id, snapshots in self.performance_history.items():
            if not snapshots:
                continue
            
            recent_snapshots = [
                s for s in snapshots 
                if s.timestamp >= datetime.utcnow() - timedelta(hours=24)
            ]
            
            if recent_snapshots:
                avg_execution_time = np.mean([s.execution_time for s in recent_snapshots if s.execution_time > 0])
                avg_success_rate = np.mean([s.success_rate for s in recent_snapshots])
                
                # Calculate performance score (lower execution time and higher success rate is better)
                performance_score = avg_success_rate / max(avg_execution_time, 0.1)
                
                rule_performance[rule_id] = {
                    "rule_id": rule_id,
                    "performance_score": performance_score,
                    "avg_execution_time": avg_execution_time,
                    "avg_success_rate": avg_success_rate,
                    "execution_count": len(recent_snapshots)
                }
        
        # Sort by performance score and return top rules
        top_rules = sorted(rule_performance.values(), key=lambda x: x["performance_score"], reverse=True)
        return top_rules[:limit]
    
    async def _identify_bottlenecks(self, snapshots: List[PerformanceSnapshot]) -> List[Dict[str, Any]]:
        """Identify system bottlenecks based on performance data"""
        
        bottlenecks = []
        
        # CPU bottleneck
        high_cpu_snapshots = [s for s in snapshots if s.cpu_usage > 80]
        if len(high_cpu_snapshots) > len(snapshots) * 0.2:  # More than 20% of time
            bottlenecks.append({
                "type": "cpu_bottleneck",
                "severity": "high" if len(high_cpu_snapshots) > len(snapshots) * 0.5 else "medium",
                "description": f"CPU usage exceeded 80% for {len(high_cpu_snapshots)} out of {len(snapshots)} samples",
                "recommendation": "Consider scaling CPU resources or optimizing scan rules"
            })
        
        # Memory bottleneck
        high_memory_snapshots = [s for s in snapshots if s.memory_usage > 85]
        if len(high_memory_snapshots) > len(snapshots) * 0.2:
            bottlenecks.append({
                "type": "memory_bottleneck",
                "severity": "high" if len(high_memory_snapshots) > len(snapshots) * 0.5 else "medium",
                "description": f"Memory usage exceeded 85% for {len(high_memory_snapshots)} out of {len(snapshots)} samples",
                "recommendation": "Consider increasing memory allocation or optimizing memory usage"
            })
        
        # Queue bottleneck
        large_queue_snapshots = [s for s in snapshots if s.queue_length > 50]
        if len(large_queue_snapshots) > len(snapshots) * 0.3:
            bottlenecks.append({
                "type": "queue_bottleneck",
                "severity": "medium",
                "description": f"Scan queue exceeded 50 items for {len(large_queue_snapshots)} out of {len(snapshots)} samples",
                "recommendation": "Consider increasing scan parallelism or optimizing scan execution"
            })
        
        # Throughput bottleneck
        avg_throughput = np.mean([s.throughput for s in snapshots])
        if avg_throughput < 5:  # Less than 5 scans per minute
            bottlenecks.append({
                "type": "throughput_bottleneck",
                "severity": "medium",
                "description": f"Average throughput is {avg_throughput:.1f} scans/minute, which is below optimal",
                "recommendation": "Optimize scan rules and increase parallelism"
            })
        
        return bottlenecks
    
    async def _calculate_overall_performance_score(self, snapshots: List[PerformanceSnapshot]) -> float:
        """Calculate overall system performance score (0-100)"""
        
        if not snapshots:
            return 50.0  # Neutral score
        
        # Component scores
        cpu_score = max(0, 100 - np.mean([s.cpu_usage for s in snapshots]))
        memory_score = max(0, 100 - np.mean([s.memory_usage for s in snapshots]))
        success_rate_score = np.mean([s.success_rate for s in snapshots]) * 100
        throughput_score = min(100, np.mean([s.throughput for s in snapshots]) * 2)  # Scale throughput
        
        # Weighted average
        overall_score = (
            cpu_score * 0.25 +
            memory_score * 0.25 +
            success_rate_score * 0.30 +
            throughput_score * 0.20
        )
        
        return min(100, max(0, overall_score))
    
    async def start_performance_recording(self, scan_id: str, rule_id: str, data_source_id: int):
        """Start performance recording for a scan"""
        self.monitor.register_scan_start(scan_id, rule_id, data_source_id)
    
    async def end_performance_recording(self, scan_id: str, success: bool, error_count: int = 0):
        """End performance recording for a scan"""
        self.monitor.register_scan_end(scan_id, success, error_count)
    
    async def get_performance_alerts(self) -> List[PerformanceAlert]:
        """Get current performance alerts"""
        return self.alert_manager.get_active_alerts()
    
    async def resolve_performance_alert(self, alert_id: str) -> bool:
        """Resolve a performance alert"""
        try:
            await self.alert_manager.resolve_alert(alert_id)
            return True
        except Exception as e:
            logger.error(f"Error resolving alert {alert_id}: {str(e)}")
            return False
    
    async def get_performance_recommendations(self) -> List[Dict[str, Any]]:
        """Get performance optimization recommendations"""
        
        recommendations = []
        
        # Analyze recent performance
        recent_snapshots = self.monitor.get_recent_snapshots(minutes=60)
        
        if not recent_snapshots:
            return [{"type": "info", "message": "Insufficient data for recommendations"}]
        
        # System-level recommendations
        avg_cpu = np.mean([s.cpu_usage for s in recent_snapshots])
        avg_memory = np.mean([s.memory_usage for s in recent_snapshots])
        avg_throughput = np.mean([s.throughput for s in recent_snapshots])
        
        if avg_cpu > 75:
            recommendations.append({
                "type": "resource_optimization",
                "priority": "high",
                "message": f"CPU usage is high (avg: {avg_cpu:.1f}%)",
                "recommendation": "Consider scaling CPU resources or optimizing scan rules",
                "estimated_impact": "20-30% performance improvement"
            })
        
        if avg_memory > 80:
            recommendations.append({
                "type": "resource_optimization",
                "priority": "high",
                "message": f"Memory usage is high (avg: {avg_memory:.1f}%)",
                "recommendation": "Increase memory allocation or optimize memory usage patterns",
                "estimated_impact": "15-25% performance improvement"
            })
        
        if avg_throughput < 10:
            recommendations.append({
                "type": "throughput_optimization",
                "priority": "medium",
                "message": f"Throughput is below optimal (avg: {avg_throughput:.1f} scans/min)",
                "recommendation": "Optimize scan rules and increase parallel processing",
                "estimated_impact": "40-60% throughput improvement"
            })
        
        # Rule-specific recommendations
        slow_rules = []
        for rule_id, snapshots in self.performance_history.items():
            recent_rule_snapshots = [
                s for s in snapshots 
                if s.timestamp >= datetime.utcnow() - timedelta(hours=2)
            ]
            
            if recent_rule_snapshots:
                avg_execution_time = np.mean([s.execution_time for s in recent_rule_snapshots if s.execution_time > 0])
                if avg_execution_time > 15:  # More than 15 seconds
                    slow_rules.append((rule_id, avg_execution_time))
        
        if slow_rules:
            slow_rules.sort(key=lambda x: x[1], reverse=True)
            top_slow_rules = slow_rules[:3]
            
            recommendations.append({
                "type": "rule_optimization",
                "priority": "medium",
                "message": f"Found {len(slow_rules)} slow-performing rules",
                "recommendation": f"Optimize rules: {', '.join([r[0] for r in top_slow_rules])}",
                "estimated_impact": "10-20% execution time reduction"
            })
        
        return recommendations or [{"type": "info", "message": "System performance is optimal"}]
    
    def shutdown(self):
        """Shutdown the performance service"""
        self.monitor.stop_monitoring()
        logger.info("Scan Performance Service shutdown complete")


# Global service instance
scan_performance_service = ScanPerformanceService()