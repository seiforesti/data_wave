"""
Enterprise Telemetry Service
===========================

Production-grade telemetry and monitoring service for the Advanced Data Governance Platform.
Provides comprehensive metrics, performance monitoring, and real-time insights across all
6 core data governance groups.

Features:
- Real-time performance metrics collection
- API endpoint monitoring and analytics
- Resource utilization tracking
- Error rate monitoring and alerting
- Custom metrics and dashboards
- Integration with enterprise monitoring tools
- High-performance metrics aggregation
"""

import asyncio
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Union
from collections import defaultdict, deque
import logging
import json
from dataclasses import dataclass, asdict
from sqlmodel import Session, select
import psutil
import threading
from concurrent.futures import ThreadPoolExecutor

# Database and models
from app.db_session import get_session

# Configure logging
logger = logging.getLogger(__name__)

# ===============================================================================
# TELEMETRY DATA MODELS
# ===============================================================================

@dataclass
class RequestMetric:
    """Individual request metric data"""
    endpoint: str
    method: str
    duration: float
    status_code: int
    timestamp: datetime
    user_id: Optional[int] = None
    group: Optional[str] = None
    error_type: Optional[str] = None

@dataclass
class SystemMetric:
    """System resource metric data"""
    cpu_percent: float
    memory_percent: float
    disk_usage_percent: float
    active_connections: int
    timestamp: datetime

@dataclass
class GroupMetric:
    """Group-specific metric aggregation"""
    group_name: str
    total_requests: int
    avg_response_time: float
    error_rate: float
    active_users: int
    timestamp: datetime

@dataclass
class PerformanceAlert:
    """Performance alert data"""
    alert_type: str
    severity: str
    message: str
    metric_value: float
    threshold: float
    timestamp: datetime
    group: Optional[str] = None

# ===============================================================================
# TELEMETRY SERVICE
# ===============================================================================

class TelemetryService:
    """
    Enterprise-grade telemetry service for comprehensive monitoring and analytics
    """
    
    def __init__(self, max_metrics_history: int = 10000):
        self.max_metrics_history = max_metrics_history
        
        # In-memory metric storage for real-time analytics
        self.request_metrics: deque = deque(maxlen=max_metrics_history)
        self.system_metrics: deque = deque(maxlen=1000)  # Smaller for system metrics
        self.group_metrics: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.error_metrics: deque = deque(maxlen=5000)
        
        # Performance thresholds and alerts
        self.performance_thresholds = {
            "response_time_ms": 2000,
            "error_rate_percent": 5.0,
            "cpu_percent": 80.0,
            "memory_percent": 85.0,
            "disk_usage_percent": 90.0
        }
        
        # Metrics aggregation
        self.metrics_lock = threading.Lock()
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Real-time counters
        self.request_counters = defaultdict(lambda: defaultdict(int))
        self.active_connections = set()
        
        # Start background tasks
        self._start_background_tasks()
        
        logger.info("Telemetry Service initialized")
    
    def _start_background_tasks(self):
        """Start background tasks for metrics collection"""
        asyncio.create_task(self._collect_system_metrics())
        asyncio.create_task(self._aggregate_group_metrics())
        asyncio.create_task(self._monitor_performance_thresholds())
    
    # ===============================================================================
    # METRICS COLLECTION
    # ===============================================================================
    
    async def record_request_metrics(
        self, 
        endpoint: str, 
        method: str, 
        duration: float, 
        status_code: int,
        user_id: Optional[int] = None,
        group: Optional[str] = None
    ):
        """Record individual request metrics"""
        metric = RequestMetric(
            endpoint=endpoint,
            method=method,
            duration=duration,
            status_code=status_code,
            timestamp=datetime.utcnow(),
            user_id=user_id,
            group=group
        )
        
        with self.metrics_lock:
            self.request_metrics.append(metric)
            
            # Update real-time counters
            self.request_counters[endpoint][method] += 1
            
            if user_id:
                self.active_connections.add(user_id)
        
        # Async processing for heavy operations
        await self._process_request_metric(metric)
        
        logger.debug(f"Recorded request metric: {method} {endpoint} - {duration:.3f}ms")
    
    async def record_error_metrics(
        self, 
        endpoint: str, 
        method: str, 
        error_type: str, 
        duration: float,
        user_id: Optional[int] = None
    ):
        """Record error metrics"""
        error_metric = RequestMetric(
            endpoint=endpoint,
            method=method,
            duration=duration,
            status_code=500,
            timestamp=datetime.utcnow(),
            user_id=user_id,
            error_type=error_type
        )
        
        with self.metrics_lock:
            self.error_metrics.append(error_metric)
        
        logger.warning(f"Recorded error metric: {error_type} on {method} {endpoint}")
    
    async def _collect_system_metrics(self):
        """Collect system resource metrics periodically"""
        while True:
            try:
                # Collect system metrics
                cpu_percent = psutil.cpu_percent(interval=1)
                memory = psutil.virtual_memory()
                disk = psutil.disk_usage('/')
                
                metric = SystemMetric(
                    cpu_percent=cpu_percent,
                    memory_percent=memory.percent,
                    disk_usage_percent=(disk.used / disk.total) * 100,
                    active_connections=len(self.active_connections),
                    timestamp=datetime.utcnow()
                )
                
                with self.metrics_lock:
                    self.system_metrics.append(metric)
                
                # Check for performance alerts
                await self._check_system_performance_alerts(metric)
                
                # Sleep for 30 seconds
                await asyncio.sleep(30)
                
            except Exception as e:
                logger.error(f"Error collecting system metrics: {e}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def _aggregate_group_metrics(self):
        """Aggregate metrics by group periodically"""
        while True:
            try:
                await asyncio.sleep(60)  # Aggregate every minute
                
                current_time = datetime.utcnow()
                one_hour_ago = current_time - timedelta(hours=1)
                
                # Group metrics by API group
                groups = ["data_sources", "catalog", "classifications", "compliance", "scan_rulesets", "scan_logic"]
                
                for group in groups:
                    group_requests = [
                        metric for metric in self.request_metrics 
                        if metric.group == group and metric.timestamp > one_hour_ago
                    ]
                    
                    if group_requests:
                        total_requests = len(group_requests)
                        avg_response_time = sum(r.duration for r in group_requests) / total_requests
                        error_count = sum(1 for r in group_requests if r.status_code >= 400)
                        error_rate = (error_count / total_requests) * 100
                        active_users = len(set(r.user_id for r in group_requests if r.user_id))
                        
                        group_metric = GroupMetric(
                            group_name=group,
                            total_requests=total_requests,
                            avg_response_time=avg_response_time,
                            error_rate=error_rate,
                            active_users=active_users,
                            timestamp=current_time
                        )
                        
                        with self.metrics_lock:
                            self.group_metrics[group].append(group_metric)
                
            except Exception as e:
                logger.error(f"Error aggregating group metrics: {e}")
    
    async def _monitor_performance_thresholds(self):
        """Monitor performance thresholds and generate alerts"""
        while True:
            try:
                await asyncio.sleep(120)  # Check every 2 minutes
                
                # Check API performance
                await self._check_api_performance_alerts()
                
                # Clean up old connections
                self.active_connections.clear()
                
            except Exception as e:
                logger.error(f"Error monitoring performance: {e}")
    
    # ===============================================================================
    # METRICS ANALYSIS AND ALERTS
    # ===============================================================================
    
    async def _check_system_performance_alerts(self, metric: SystemMetric):
        """Check system metrics against thresholds"""
        alerts = []
        
        if metric.cpu_percent > self.performance_thresholds["cpu_percent"]:
            alerts.append(PerformanceAlert(
                alert_type="high_cpu",
                severity="warning",
                message=f"High CPU usage: {metric.cpu_percent:.1f}%",
                metric_value=metric.cpu_percent,
                threshold=self.performance_thresholds["cpu_percent"],
                timestamp=metric.timestamp
            ))
        
        if metric.memory_percent > self.performance_thresholds["memory_percent"]:
            alerts.append(PerformanceAlert(
                alert_type="high_memory",
                severity="warning",
                message=f"High memory usage: {metric.memory_percent:.1f}%",
                metric_value=metric.memory_percent,
                threshold=self.performance_thresholds["memory_percent"],
                timestamp=metric.timestamp
            ))
        
        if metric.disk_usage_percent > self.performance_thresholds["disk_usage_percent"]:
            alerts.append(PerformanceAlert(
                alert_type="high_disk",
                severity="critical",
                message=f"High disk usage: {metric.disk_usage_percent:.1f}%",
                metric_value=metric.disk_usage_percent,
                threshold=self.performance_thresholds["disk_usage_percent"],
                timestamp=metric.timestamp
            ))
        
        for alert in alerts:
            await self._handle_performance_alert(alert)
    
    async def _check_api_performance_alerts(self):
        """Check API performance metrics"""
        current_time = datetime.utcnow()
        five_minutes_ago = current_time - timedelta(minutes=5)
        
        recent_requests = [
            metric for metric in self.request_metrics 
            if metric.timestamp > five_minutes_ago
        ]
        
        if not recent_requests:
            return
        
        # Check average response time
        avg_response_time = sum(r.duration for r in recent_requests) / len(recent_requests)
        if avg_response_time > self.performance_thresholds["response_time_ms"]:
            alert = PerformanceAlert(
                alert_type="slow_response",
                severity="warning",
                message=f"Slow API response time: {avg_response_time:.0f}ms",
                metric_value=avg_response_time,
                threshold=self.performance_thresholds["response_time_ms"],
                timestamp=current_time
            )
            await self._handle_performance_alert(alert)
        
        # Check error rate
        error_count = sum(1 for r in recent_requests if r.status_code >= 400)
        error_rate = (error_count / len(recent_requests)) * 100
        if error_rate > self.performance_thresholds["error_rate_percent"]:
            alert = PerformanceAlert(
                alert_type="high_error_rate",
                severity="critical",
                message=f"High API error rate: {error_rate:.1f}%",
                metric_value=error_rate,
                threshold=self.performance_thresholds["error_rate_percent"],
                timestamp=current_time
            )
            await self._handle_performance_alert(alert)
    
    async def _handle_performance_alert(self, alert: PerformanceAlert):
        """Handle performance alerts"""
        logger.warning(f"Performance Alert: {alert.message}")
        # Here you would typically:
        # - Send notifications to administrators
        # - Update monitoring dashboards
        # - Trigger automated responses
        # - Store in database for historical analysis
    
    async def _process_request_metric(self, metric: RequestMetric):
        """Process individual request metrics asynchronously"""
        # This is where you could:
        # - Send to external monitoring systems (Prometheus, Grafana, etc.)
        # - Store in time-series database
        # - Trigger real-time dashboards
        pass
    
    # ===============================================================================
    # METRICS RETRIEVAL API
    # ===============================================================================
    
    async def get_api_metrics(self) -> Dict[str, Any]:
        """Get comprehensive API metrics"""
        current_time = datetime.utcnow()
        one_hour_ago = current_time - timedelta(hours=1)
        
        recent_requests = [
            metric for metric in self.request_metrics 
            if metric.timestamp > one_hour_ago
        ]
        
        if not recent_requests:
            return {
                "total_requests": 0,
                "avg_response_time": 0,
                "error_rate": 0,
                "requests_per_minute": 0
            }
        
        total_requests = len(recent_requests)
        avg_response_time = sum(r.duration for r in recent_requests) / total_requests
        error_count = sum(1 for r in recent_requests if r.status_code >= 400)
        error_rate = (error_count / total_requests) * 100
        requests_per_minute = total_requests / 60
        
        # Group by endpoint
        endpoint_stats = defaultdict(lambda: {"count": 0, "avg_time": 0, "errors": 0})
        for request in recent_requests:
            endpoint_stats[request.endpoint]["count"] += 1
            endpoint_stats[request.endpoint]["avg_time"] += request.duration
            if request.status_code >= 400:
                endpoint_stats[request.endpoint]["errors"] += 1
        
        # Calculate averages
        for endpoint, stats in endpoint_stats.items():
            if stats["count"] > 0:
                stats["avg_time"] = stats["avg_time"] / stats["count"]
                stats["error_rate"] = (stats["errors"] / stats["count"]) * 100
        
        return {
            "summary": {
                "total_requests": total_requests,
                "avg_response_time": round(avg_response_time, 2),
                "error_rate": round(error_rate, 2),
                "requests_per_minute": round(requests_per_minute, 2)
            },
            "endpoints": dict(endpoint_stats),
            "timestamp": current_time.isoformat()
        }
    
    async def get_group_metrics(self) -> Dict[str, Any]:
        """Get metrics by API group"""
        group_data = {}
        
        for group_name, metrics in self.group_metrics.items():
            if metrics:
                latest_metric = metrics[-1]
                group_data[group_name] = asdict(latest_metric)
        
        return {
            "groups": group_data,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def get_system_metrics(self) -> Dict[str, Any]:
        """Get current system metrics"""
        if not self.system_metrics:
            return {"status": "no_data"}
        
        latest_metric = self.system_metrics[-1]
        return {
            "system": asdict(latest_metric),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def get_performance_alerts(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get recent performance alerts"""
        # In a production system, this would query a database
        # For now, return empty list as alerts are logged
        return []
    
    async def get_real_time_metrics(self) -> Dict[str, Any]:
        """Get real-time metrics for dashboards"""
        current_requests = len(self.active_connections)
        recent_errors = len([
            metric for metric in self.error_metrics 
            if metric.timestamp > datetime.utcnow() - timedelta(minutes=5)
        ])
        
        latest_system = self.system_metrics[-1] if self.system_metrics else None
        
        return {
            "active_connections": current_requests,
            "recent_errors": recent_errors,
            "system": asdict(latest_system) if latest_system else None,
            "timestamp": datetime.utcnow().isoformat()
        }

# ===============================================================================
# GLOBAL INSTANCE AND DEPENDENCY
# ===============================================================================

_telemetry_service = None

def get_telemetry_service() -> TelemetryService:
    """Get or create the global telemetry service instance"""
    global _telemetry_service
    if _telemetry_service is None:
        _telemetry_service = TelemetryService()
    return _telemetry_service

# FastAPI dependency
async def get_telemetry_dependency() -> TelemetryService:
    """FastAPI dependency for telemetry service"""
    return get_telemetry_service()

# Export
__all__ = [
    "TelemetryService",
    "RequestMetric",
    "SystemMetric",
    "GroupMetric",
    "PerformanceAlert",
    "get_telemetry_service",
    "get_telemetry_dependency"
]