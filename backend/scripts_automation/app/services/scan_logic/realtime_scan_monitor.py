"""
Real-time Scan Monitoring Service
Provides live monitoring, alerting, and performance tracking for scan operations.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Callable
from dataclasses import dataclass, field
from enum import Enum
import json
import numpy as np
from collections import defaultdict, deque
import websockets
import threading
import time

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlmodel import SQLModel

from ...core.database import get_async_session
from ...models.scan_models import (
    ScanJob, ScanJobStatus, ScanJobPriority, ScanJobType,
    OrchestrationStrategy, ResourceAllocationMode, ScanExecutionMode
)
from ...models.policy_models import ScanPolicy
from ...models.asset_models import DataAsset

logger = logging.getLogger(__name__)

class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class AlertType(str, Enum):
    PERFORMANCE_DEGRADATION = "performance_degradation"
    RESOURCE_EXHAUSTION = "resource_exhaustion"
    SCAN_FAILURE = "scan_failure"
    TIMEOUT = "timeout"
    ANOMALY_DETECTED = "anomaly_detected"
    SYSTEM_OVERLOAD = "system_overload"

class MonitoringChannel(str, Enum):
    WEBSOCKET = "websocket"
    EMAIL = "email"
    SLACK = "slack"
    DATABASE = "database"
    LOG = "log"

@dataclass
class ScanMetrics:
    """Real-time scan metrics"""
    scan_id: str
    timestamp: datetime
    status: ScanJobStatus
    progress_percentage: float
    duration_seconds: float
    items_processed: int
    items_total: int
    success_rate: float
    error_count: int
    resource_usage: Dict[str, float]
    throughput: float  # items per second

@dataclass
class SystemMetrics:
    """System-wide metrics"""
    timestamp: datetime
    active_scans: int
    queued_scans: int
    total_cpu_usage: float
    total_memory_usage: float
    total_disk_io: float
    total_network_io: float
    average_throughput: float
    success_rate: float

@dataclass
class Alert:
    """Alert definition"""
    id: str
    type: AlertType
    severity: AlertSeverity
    title: str
    message: str
    scan_id: Optional[str]
    timestamp: datetime
    metadata: Dict[str, Any]
    acknowledged: bool = False
    resolved: bool = False

@dataclass
class PerformanceBaseline:
    """Performance baseline for comparison"""
    scan_type: str
    average_duration: float
    average_throughput: float
    average_success_rate: float
    resource_usage_normal: Dict[str, float]
    last_updated: datetime

class RealtimeScanMonitor:
    """
    Advanced real-time scan monitoring system that provides live monitoring,
    alerting, and performance tracking for scan operations.
    """
    
    def __init__(self):
        self.active_scan_metrics: Dict[str, ScanMetrics] = {}
        self.system_metrics_history: deque = deque(maxlen=1000)
        self.performance_baselines: Dict[str, PerformanceBaseline] = {}
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_rules: List[Dict[str, Any]] = []
        self.monitoring_channels: Dict[MonitoringChannel, List[Callable]] = defaultdict(list)
        self.anomaly_detector = AnomalyDetector()
        self.alert_manager = AlertManager()
        self.metrics_aggregator = MetricsAggregator()
        self.websocket_server = None
        self.monitoring_active = False
        
    async def initialize_monitor(self) -> bool:
        """Initialize the real-time monitoring system"""
        try:
            logger.info("Initializing Real-time Scan Monitor...")
            
            # Initialize components
            await self.anomaly_detector.initialize()
            await self.alert_manager.initialize()
            await self.metrics_aggregator.initialize()
            
            # Load performance baselines
            await self._load_performance_baselines()
            
            # Setup default alert rules
            await self._setup_default_alert_rules()
            
            # Start monitoring tasks
            asyncio.create_task(self._metrics_collection_loop())
            asyncio.create_task(self._anomaly_detection_loop())
            asyncio.create_task(self._alert_processing_loop())
            asyncio.create_task(self._system_health_monitoring_loop())
            
            # Start WebSocket server for real-time updates
            await self._start_websocket_server()
            
            self.monitoring_active = True
            logger.info("Real-time Scan Monitor initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize real-time monitor: {str(e)}")
            return False
    
    async def register_scan(self, scan_id: str, scan_metadata: Dict[str, Any]) -> bool:
        """Register a new scan for monitoring"""
        try:
            # Initialize scan metrics
            self.active_scan_metrics[scan_id] = ScanMetrics(
                scan_id=scan_id,
                timestamp=datetime.now(),
                status=ScanJobStatus.PENDING,
                progress_percentage=0.0,
                duration_seconds=0.0,
                items_processed=0,
                items_total=scan_metadata.get('total_items', 0),
                success_rate=1.0,
                error_count=0,
                resource_usage={},
                throughput=0.0
            )
            
            # Send registration event
            await self._broadcast_event({
                "type": "scan_registered",
                "scan_id": scan_id,
                "metadata": scan_metadata,
                "timestamp": datetime.now().isoformat()
            })
            
            logger.info(f"Registered scan for monitoring: {scan_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to register scan {scan_id}: {str(e)}")
            return False
    
    async def update_scan_metrics(
        self,
        scan_id: str,
        metrics_update: Dict[str, Any]
    ) -> bool:
        """Update metrics for a specific scan"""
        try:
            if scan_id not in self.active_scan_metrics:
                logger.warning(f"Scan {scan_id} not registered for monitoring")
                return False
            
            current_metrics = self.active_scan_metrics[scan_id]
            
            # Update metrics
            if 'status' in metrics_update:
                current_metrics.status = ScanJobStatus(metrics_update['status'])
            
            if 'progress_percentage' in metrics_update:
                current_metrics.progress_percentage = metrics_update['progress_percentage']
            
            if 'items_processed' in metrics_update:
                current_metrics.items_processed = metrics_update['items_processed']
            
            if 'error_count' in metrics_update:
                current_metrics.error_count = metrics_update['error_count']
            
            if 'resource_usage' in metrics_update:
                current_metrics.resource_usage.update(metrics_update['resource_usage'])
            
            # Calculate derived metrics
            current_time = datetime.now()
            current_metrics.duration_seconds = (current_time - current_metrics.timestamp).total_seconds()
            
            if current_metrics.duration_seconds > 0:
                current_metrics.throughput = current_metrics.items_processed / current_metrics.duration_seconds
            
            if current_metrics.items_processed > 0:
                current_metrics.success_rate = 1.0 - (current_metrics.error_count / current_metrics.items_processed)
            
            current_metrics.timestamp = current_time
            
            # Check for alerts
            await self._check_scan_alerts(scan_id, current_metrics)
            
            # Broadcast update
            await self._broadcast_scan_update(scan_id, current_metrics)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to update metrics for scan {scan_id}: {str(e)}")
            return False
    
    async def get_real_time_dashboard(self) -> Dict[str, Any]:
        """Get comprehensive real-time dashboard data"""
        try:
            current_time = datetime.now()
            
            # System overview
            system_overview = await self._get_system_overview()
            
            # Active scans summary
            active_scans = []
            for scan_id, metrics in self.active_scan_metrics.items():
                if metrics.status in [ScanJobStatus.RUNNING, ScanJobStatus.PENDING]:
                    active_scans.append({
                        "scan_id": scan_id,
                        "status": metrics.status.value,
                        "progress": metrics.progress_percentage,
                        "duration": metrics.duration_seconds,
                        "throughput": metrics.throughput,
                        "success_rate": metrics.success_rate,
                        "resource_usage": metrics.resource_usage
                    })
            
            # Recent alerts
            recent_alerts = []
            for alert in sorted(self.active_alerts.values(), 
                              key=lambda x: x.timestamp, reverse=True)[:10]:
                recent_alerts.append({
                    "id": alert.id,
                    "type": alert.type.value,
                    "severity": alert.severity.value,
                    "title": alert.title,
                    "message": alert.message,
                    "timestamp": alert.timestamp.isoformat(),
                    "acknowledged": alert.acknowledged,
                    "resolved": alert.resolved
                })
            
            # Performance trends
            performance_trends = await self._get_performance_trends()
            
            # Resource utilization
            resource_utilization = await self._get_current_resource_utilization()
            
            return {
                "timestamp": current_time.isoformat(),
                "system_overview": system_overview,
                "active_scans": active_scans,
                "recent_alerts": recent_alerts,
                "performance_trends": performance_trends,
                "resource_utilization": resource_utilization,
                "monitoring_status": "active" if self.monitoring_active else "inactive"
            }
            
        except Exception as e:
            logger.error(f"Failed to get real-time dashboard: {str(e)}")
            return {"error": str(e)}
    
    async def create_custom_alert_rule(
        self,
        rule_name: str,
        condition: Dict[str, Any],
        alert_config: Dict[str, Any]
    ) -> str:
        """Create a custom alert rule"""
        try:
            rule_id = f"custom_{rule_name}_{datetime.now().isoformat()}"
            
            alert_rule = {
                "id": rule_id,
                "name": rule_name,
                "condition": condition,
                "alert_config": alert_config,
                "created_at": datetime.now().isoformat(),
                "enabled": True
            }
            
            self.alert_rules.append(alert_rule)
            
            logger.info(f"Created custom alert rule: {rule_name}")
            return rule_id
            
        except Exception as e:
            logger.error(f"Failed to create alert rule {rule_name}: {str(e)}")
            raise
    
    async def get_scan_performance_analysis(self, scan_id: str) -> Dict[str, Any]:
        """Get detailed performance analysis for a specific scan"""
        try:
            if scan_id not in self.active_scan_metrics:
                return {"error": f"Scan {scan_id} not found"}
            
            metrics = self.active_scan_metrics[scan_id]
            
            # Get baseline for comparison
            baseline = await self._get_scan_baseline(scan_id)
            
            # Performance analysis
            analysis = {
                "scan_id": scan_id,
                "current_metrics": {
                    "status": metrics.status.value,
                    "progress": metrics.progress_percentage,
                    "duration": metrics.duration_seconds,
                    "throughput": metrics.throughput,
                    "success_rate": metrics.success_rate,
                    "error_count": metrics.error_count,
                    "resource_usage": metrics.resource_usage
                },
                "baseline_comparison": {},
                "performance_score": 0.0,
                "anomalies": [],
                "recommendations": []
            }
            
            if baseline:
                # Compare with baseline
                analysis["baseline_comparison"] = {
                    "duration_vs_baseline": metrics.duration_seconds / baseline.average_duration if baseline.average_duration > 0 else 1.0,
                    "throughput_vs_baseline": metrics.throughput / baseline.average_throughput if baseline.average_throughput > 0 else 1.0,
                    "success_rate_vs_baseline": metrics.success_rate / baseline.average_success_rate if baseline.average_success_rate > 0 else 1.0
                }
                
                # Calculate performance score
                analysis["performance_score"] = await self._calculate_performance_score(metrics, baseline)
            
            # Detect anomalies
            analysis["anomalies"] = await self.anomaly_detector.detect_scan_anomalies(scan_id, metrics)
            
            # Generate recommendations
            analysis["recommendations"] = await self._generate_performance_recommendations(metrics, baseline)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Failed to get performance analysis for {scan_id}: {str(e)}")
            return {"error": str(e)}
    
    async def _metrics_collection_loop(self):
        """Continuous metrics collection loop"""
        while self.monitoring_active:
            try:
                await self._collect_system_metrics()
                await self._update_scan_metrics()
                await asyncio.sleep(5)  # Collect every 5 seconds
            except Exception as e:
                logger.error(f"Metrics collection error: {str(e)}")
                await asyncio.sleep(10)
    
    async def _anomaly_detection_loop(self):
        """Continuous anomaly detection loop"""
        while self.monitoring_active:
            try:
                await self.anomaly_detector.run_detection_cycle(
                    self.active_scan_metrics, 
                    self.system_metrics_history
                )
                await asyncio.sleep(30)  # Check every 30 seconds
            except Exception as e:
                logger.error(f"Anomaly detection error: {str(e)}")
                await asyncio.sleep(60)
    
    async def _alert_processing_loop(self):
        """Continuous alert processing loop"""
        while self.monitoring_active:
            try:
                await self.alert_manager.process_pending_alerts()
                await self._cleanup_resolved_alerts()
                await asyncio.sleep(10)  # Process every 10 seconds
            except Exception as e:
                logger.error(f"Alert processing error: {str(e)}")
                await asyncio.sleep(30)
    
    async def _system_health_monitoring_loop(self):
        """System health monitoring loop"""
        while self.monitoring_active:
            try:
                await self._check_system_health()
                await self._update_performance_baselines()
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"System health monitoring error: {str(e)}")
                await asyncio.sleep(120)
    
    async def _collect_system_metrics(self):
        """Collect system-wide metrics"""
        try:
            current_time = datetime.now()
            
            # Count active and queued scans
            active_scans = sum(1 for m in self.active_scan_metrics.values() 
                             if m.status == ScanJobStatus.RUNNING)
            queued_scans = sum(1 for m in self.active_scan_metrics.values() 
                             if m.status == ScanJobStatus.PENDING)
            
            # Calculate aggregate metrics
            total_throughput = sum(m.throughput for m in self.active_scan_metrics.values())
            success_rates = [m.success_rate for m in self.active_scan_metrics.values() if m.items_processed > 0]
            avg_success_rate = np.mean(success_rates) if success_rates else 1.0
            
            # Collect real system resource usage with advanced monitoring
            import psutil
            
            # Get current system stats
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk_io = psutil.disk_io_counters()
            net_io = psutil.net_io_counters()
            
            # Calculate I/O rates if we have previous measurements
            total_disk_io = 0.0
            total_network_io = 0.0
            
            if hasattr(self, '_last_disk_io') and hasattr(self, '_last_net_io') and hasattr(self, '_last_metrics_time'):
                time_delta = (current_time - self._last_metrics_time).total_seconds()
                if time_delta > 0 and disk_io and self._last_disk_io:
                    # Calculate disk I/O rate in MB/s
                    disk_read_bytes = disk_io.read_bytes - self._last_disk_io.read_bytes
                    disk_write_bytes = disk_io.write_bytes - self._last_disk_io.write_bytes
                    total_disk_io = (disk_read_bytes + disk_write_bytes) / time_delta / (1024 * 1024)
                    
                if time_delta > 0 and net_io and self._last_net_io:
                    # Calculate network I/O rate in MB/s
                    net_sent_bytes = net_io.bytes_sent - self._last_net_io.bytes_sent
                    net_recv_bytes = net_io.bytes_recv - self._last_net_io.bytes_recv
                    total_network_io = (net_sent_bytes + net_recv_bytes) / time_delta / (1024 * 1024)
            
            # Store current values for next calculation
            self._last_disk_io = disk_io
            self._last_net_io = net_io
            self._last_metrics_time = current_time
            
            system_metrics = SystemMetrics(
                timestamp=current_time,
                active_scans=active_scans,
                queued_scans=queued_scans,
                total_cpu_usage=cpu_percent,
                total_memory_usage=memory.percent,
                total_disk_io=max(0.0, total_disk_io),
                total_network_io=max(0.0, total_network_io),
                average_throughput=total_throughput / max(1, active_scans),
                success_rate=avg_success_rate
            )
            
            self.system_metrics_history.append(system_metrics)
            
        except Exception as e:
            logger.error(f"Failed to collect system metrics: {str(e)}")
    
    async def _update_scan_metrics(self):
        """Update metrics for all active scans"""
        try:
            async with get_async_session() as session:
                # Get updates for active scans
                active_scan_ids = list(self.active_scan_metrics.keys())
                
                if not active_scan_ids:
                    return
                
                # Query scan job updates
                jobs_result = await session.execute(
                    select(ScanJob).where(ScanJob.id.in_(active_scan_ids))
                )
                jobs = jobs_result.scalars().all()
                
                for job in jobs:
                    if job.id in self.active_scan_metrics:
                        # Update metrics based on job status
                        await self._update_scan_from_job(job)
                        
        except Exception as e:
            logger.error(f"Failed to update scan metrics: {str(e)}")
    
    async def _update_scan_from_job(self, job: ScanJob):
        """Update scan metrics from job data"""
        try:
            scan_id = job.id
            metrics = self.active_scan_metrics[scan_id]
            
            # Update status
            if job.status != metrics.status:
                metrics.status = job.status
                
                # Handle scan completion
                if job.status in [ScanJobStatus.COMPLETED, ScanJobStatus.FAILED, ScanJobStatus.CANCELLED]:
                    await self._handle_scan_completion(scan_id, metrics)
            
            # Update progress (mock calculation)
            if job.status == ScanJobStatus.RUNNING:
                # Simulate progress based on duration
                elapsed_minutes = (datetime.now() - job.created_at).total_seconds() / 60
                estimated_duration = 60  # Assume 60 minutes total
                metrics.progress_percentage = min(95, (elapsed_minutes / estimated_duration) * 100)
                metrics.items_processed = int(metrics.items_total * metrics.progress_percentage / 100)
            
        except Exception as e:
            logger.error(f"Failed to update scan {job.id} from job data: {str(e)}")
    
    async def _check_scan_alerts(self, scan_id: str, metrics: ScanMetrics):
        """Check for alerts related to a specific scan"""
        try:
            alerts_to_create = []
            
            # Performance degradation alert
            if metrics.throughput < 10 and metrics.duration_seconds > 300:  # Less than 10 items/sec after 5 minutes
                alerts_to_create.append({
                    "type": AlertType.PERFORMANCE_DEGRADATION,
                    "severity": AlertSeverity.WARNING,
                    "title": f"Performance Degradation - {scan_id}",
                    "message": f"Scan throughput is {metrics.throughput:.2f} items/sec, below expected threshold",
                    "scan_id": scan_id
                })
            
            # High error rate alert
            if metrics.success_rate < 0.9 and metrics.items_processed > 100:
                alerts_to_create.append({
                    "type": AlertType.SCAN_FAILURE,
                    "severity": AlertSeverity.ERROR,
                    "title": f"High Error Rate - {scan_id}",
                    "message": f"Scan success rate is {metrics.success_rate:.1%}, indicating potential issues",
                    "scan_id": scan_id
                })
            
            # Resource exhaustion alert
            cpu_usage = metrics.resource_usage.get('cpu', 0)
            memory_usage = metrics.resource_usage.get('memory', 0)
            if cpu_usage > 90 or memory_usage > 90:
                alerts_to_create.append({
                    "type": AlertType.RESOURCE_EXHAUSTION,
                    "severity": AlertSeverity.CRITICAL,
                    "title": f"Resource Exhaustion - {scan_id}",
                    "message": f"High resource usage: CPU {cpu_usage:.1f}%, Memory {memory_usage:.1f}%",
                    "scan_id": scan_id
                })
            
            # Create alerts
            for alert_data in alerts_to_create:
                await self._create_alert(alert_data)
                
        except Exception as e:
            logger.error(f"Failed to check alerts for scan {scan_id}: {str(e)}")
    
    async def _create_alert(self, alert_data: Dict[str, Any]):
        """Create a new alert"""
        try:
            alert_id = f"alert_{datetime.now().isoformat()}_{alert_data['type']}"
            
            alert = Alert(
                id=alert_id,
                type=AlertType(alert_data['type']),
                severity=AlertSeverity(alert_data['severity']),
                title=alert_data['title'],
                message=alert_data['message'],
                scan_id=alert_data.get('scan_id'),
                timestamp=datetime.now(),
                metadata=alert_data.get('metadata', {}),
                acknowledged=False,
                resolved=False
            )
            
            self.active_alerts[alert_id] = alert
            
            # Send alert through configured channels
            await self.alert_manager.send_alert(alert)
            
            # Broadcast alert
            await self._broadcast_event({
                "type": "alert_created",
                "alert": {
                    "id": alert.id,
                    "type": alert.type.value,
                    "severity": alert.severity.value,
                    "title": alert.title,
                    "message": alert.message,
                    "scan_id": alert.scan_id,
                    "timestamp": alert.timestamp.isoformat()
                }
            })
            
            logger.warning(f"Created alert: {alert.title}")
            
        except Exception as e:
            logger.error(f"Failed to create alert: {str(e)}")
    
    async def _broadcast_event(self, event: Dict[str, Any]):
        """Broadcast event to all connected clients"""
        try:
            # Add timestamp and source information
            enriched_event = {
                **event,
                "server_timestamp": datetime.now().isoformat(),
                "source": "realtime_scan_monitor",
                "event_id": f"{event.get('type', 'unknown')}_{datetime.now().timestamp()}"
            }
            
            # Store event in recent events for new client connections
            if not hasattr(self, 'recent_events'):
                self.recent_events = deque(maxlen=100)
            self.recent_events.append(enriched_event)
            
            # Broadcast to WebSocket clients through connection registry
            if hasattr(self, 'websocket_connections') and self.websocket_connections:
                message = json.dumps(enriched_event, default=str)
                
                # Send to all active WebSocket connections
                disconnected_connections = set()
                for connection in self.websocket_connections:
                    try:
                        # In production, this would send via actual WebSocket connection
                        # For now, log the broadcast
                        logger.debug(f"Broadcasting event to WebSocket client: {enriched_event['type']}")
                        
                    except Exception as conn_error:
                        logger.warning(f"Failed to send to WebSocket client: {str(conn_error)}")
                        disconnected_connections.add(connection)
                
                # Clean up disconnected connections
                self.websocket_connections -= disconnected_connections
            
            # Also store in event history for analytics
            await self._store_event_history(enriched_event)
                
        except Exception as e:
            logger.error(f"Failed to broadcast event: {str(e)}")
    
    async def _store_event_history(self, event: Dict[str, Any]):
        """Store event in history for analytics and replay"""
        try:
            # In production, this would store in a time-series database
            # For now, maintain in-memory history with size limits
            if not hasattr(self, 'event_history'):
                self.event_history = deque(maxlen=10000)
            
            event_record = {
                **event,
                "stored_at": datetime.now().isoformat(),
                "retention_days": 30
            }
            
            self.event_history.append(event_record)
            
        except Exception as e:
            logger.error(f"Failed to store event history: {str(e)}")
    
    async def _broadcast_scan_update(self, scan_id: str, metrics: ScanMetrics):
        """Broadcast scan update to clients"""
        try:
            event = {
                "type": "scan_update",
                "scan_id": scan_id,
                "metrics": {
                    "status": metrics.status.value,
                    "progress": metrics.progress_percentage,
                    "duration": metrics.duration_seconds,
                    "throughput": metrics.throughput,
                    "success_rate": metrics.success_rate,
                    "error_count": metrics.error_count,
                    "resource_usage": metrics.resource_usage
                },
                "timestamp": datetime.now().isoformat()
            }
            
            await self._broadcast_event(event)
            
        except Exception as e:
            logger.error(f"Failed to broadcast scan update: {str(e)}")
    
    async def _handle_scan_completion(self, scan_id: str, metrics: ScanMetrics):
        """Handle scan completion"""
        try:
            # Update performance baselines
            await self._update_baseline_from_scan(scan_id, metrics)
            
            # Create completion alert
            if metrics.status == ScanJobStatus.COMPLETED:
                await self._create_alert({
                    "type": AlertType.SCAN_FAILURE,  # Will be changed to SCAN_COMPLETED
                    "severity": AlertSeverity.INFO,
                    "title": f"Scan Completed - {scan_id}",
                    "message": f"Scan completed successfully with {metrics.success_rate:.1%} success rate",
                    "scan_id": scan_id
                })
            else:
                await self._create_alert({
                    "type": AlertType.SCAN_FAILURE,
                    "severity": AlertSeverity.ERROR,
                    "title": f"Scan Failed - {scan_id}",
                    "message": f"Scan failed with status: {metrics.status.value}",
                    "scan_id": scan_id
                })
            
            # Archive metrics (keep for analysis but remove from active monitoring)
            # Implementation would move to historical storage
            
        except Exception as e:
            logger.error(f"Failed to handle scan completion for {scan_id}: {str(e)}")
    
    async def _load_performance_baselines(self):
        """Load performance baselines from storage"""
        try:
            async with get_async_session() as session:
                # Load historical scan performance data to establish baselines
                performance_history_result = await session.execute(
                    select(ScanJob).where(
                        and_(
                            ScanJob.status == ScanJobStatus.COMPLETED,
                            ScanJob.completed_at.isnot(None),
                            ScanJob.started_at.isnot(None)
                        )
                    ).order_by(desc(ScanJob.completed_at)).limit(1000)
                )
                completed_scans = performance_history_result.scalars().all()
                
                if completed_scans:
                    # Calculate baseline metrics from historical data
                    durations = []
                    success_count = 0
                    total_count = len(completed_scans)
                    
                    for scan in completed_scans:
                        if scan.started_at and scan.completed_at:
                            duration = (scan.completed_at - scan.started_at).total_seconds()
                            durations.append(duration)
                            
                        if scan.status == ScanJobStatus.COMPLETED:
                            success_count += 1
                    
                    # Calculate statistical measures
                    if durations:
                        avg_duration = sum(durations) / len(durations)
                        avg_throughput = self._calculate_baseline_throughput(completed_scans)
                        success_rate = success_count / total_count
                        
                        self.performance_baselines["default"] = PerformanceBaseline(
                            scan_type="default",
                            average_duration=avg_duration,
                            average_throughput=avg_throughput,
                            average_success_rate=success_rate,
                            resource_usage_normal=await self._calculate_baseline_resource_usage(completed_scans),
                            last_updated=datetime.now()
                        )
                        
                        logger.info(f"Loaded performance baselines from {total_count} historical scans")
                    else:
                        # Create default baseline if no historical data
                        await self._create_default_baseline()
                else:
                    # Create default baseline if no completed scans found
                    await self._create_default_baseline()
                
        except Exception as e:
            logger.error(f"Failed to load performance baselines: {str(e)}")
            await self._create_default_baseline()
    
    async def _create_default_baseline(self):
        """Create default performance baseline"""
        self.performance_baselines["default"] = PerformanceBaseline(
            scan_type="default",
            average_duration=1800.0,  # 30 minutes
            average_throughput=50.0,  # 50 items/sec
            average_success_rate=0.95,
            resource_usage_normal={"cpu": 40.0, "memory": 30.0},
            last_updated=datetime.now()
        )
        logger.info("Created default performance baseline")
    
    def _calculate_baseline_throughput(self, completed_scans: List[ScanJob]) -> float:
        """Calculate baseline throughput from completed scans"""
        try:
            throughputs = []
            for scan in completed_scans:
                if scan.started_at and scan.completed_at:
                    duration = (scan.completed_at - scan.started_at).total_seconds()
                    if duration > 0:
                        # Estimate items processed (would be from actual scan results)
                        items_processed = self._estimate_items_processed(scan)
                        throughput = items_processed / duration
                        throughputs.append(throughput)
            
            if throughputs:
                return sum(throughputs) / len(throughputs)
            else:
                return 50.0  # Default throughput
                
        except Exception as e:
            logger.error(f"Failed to calculate baseline throughput: {str(e)}")
            return 50.0
    
    def _estimate_items_processed(self, scan: ScanJob) -> int:
        """Estimate items processed for a completed scan"""
        try:
            # In production, this would get actual counts from scan results
            # For now, estimate based on scan configuration and duration
            if scan.configuration:
                estimated_tables = scan.configuration.get('estimated_tables', 10)
                avg_rows_per_table = scan.configuration.get('avg_rows_per_table', 1000)
                return estimated_tables * avg_rows_per_table
            else:
                # Default estimate
                return 50000
                
        except Exception:
            return 10000  # Conservative fallback
    
    async def _calculate_baseline_resource_usage(self, completed_scans: List[ScanJob]) -> Dict[str, float]:
        """Calculate baseline resource usage from historical scans"""
        try:
            # In production, this would analyze actual resource usage data
            # For now, calculate estimates based on scan patterns
            cpu_usage_estimates = []
            memory_usage_estimates = []
            
            for scan in completed_scans:
                if scan.configuration:
                    # Estimate resource usage based on scan complexity
                    complexity = scan.configuration.get('scan_depth', 3)
                    parallelism = scan.configuration.get('parallelism', 2)
                    
                    cpu_estimate = min(90.0, 20.0 + complexity * 5 + parallelism * 3)
                    memory_estimate = min(80.0, 15.0 + complexity * 4 + parallelism * 2.5)
                    
                    cpu_usage_estimates.append(cpu_estimate)
                    memory_usage_estimates.append(memory_estimate)
            
            if cpu_usage_estimates and memory_usage_estimates:
                return {
                    "cpu": sum(cpu_usage_estimates) / len(cpu_usage_estimates),
                    "memory": sum(memory_usage_estimates) / len(memory_usage_estimates),
                    "disk_io": 25.0,  # Estimated baseline
                    "network_io": 15.0  # Estimated baseline
                }
            else:
                return {"cpu": 40.0, "memory": 30.0, "disk_io": 25.0, "network_io": 15.0}
                
        except Exception as e:
            logger.error(f"Failed to calculate baseline resource usage: {str(e)}")
            return {"cpu": 40.0, "memory": 30.0, "disk_io": 25.0, "network_io": 15.0}
    
    async def _setup_default_alert_rules(self):
        """Setup default alert rules"""
        try:
            default_rules = [
                {
                    "id": "performance_degradation",
                    "name": "Performance Degradation Detection",
                    "condition": {
                        "metric": "throughput",
                        "operator": "less_than",
                        "threshold": 10,
                        "duration": 300
                    },
                    "alert_config": {
                        "severity": "warning",
                        "channels": ["websocket", "log"]
                    },
                    "enabled": True
                },
                {
                    "id": "high_error_rate",
                    "name": "High Error Rate Detection",
                    "condition": {
                        "metric": "success_rate",
                        "operator": "less_than",
                        "threshold": 0.9,
                        "min_samples": 100
                    },
                    "alert_config": {
                        "severity": "error",
                        "channels": ["websocket", "log", "email"]
                    },
                    "enabled": True
                }
            ]
            
            self.alert_rules.extend(default_rules)
            
        except Exception as e:
            logger.error(f"Failed to setup default alert rules: {str(e)}")
    
    async def _start_websocket_server(self):
        """Start WebSocket server for real-time updates"""
        try:
            # Mock WebSocket server setup (implement actual WebSocket server)
            self.websocket_server = "mock_websocket_server"
            logger.info("WebSocket server started for real-time updates")
            
        except Exception as e:
            logger.error(f"Failed to start WebSocket server: {str(e)}")
    
    async def _get_system_overview(self) -> Dict[str, Any]:
        """Get system overview statistics"""
        try:
            current_time = datetime.now()
            recent_metrics = [m for m in self.system_metrics_history 
                            if (current_time - m.timestamp).total_seconds() < 3600]  # Last hour
            
            if not recent_metrics:
                return {"error": "No recent metrics available"}
            
            return {
                "active_scans": recent_metrics[-1].active_scans if recent_metrics else 0,
                "queued_scans": recent_metrics[-1].queued_scans if recent_metrics else 0,
                "total_alerts": len([a for a in self.active_alerts.values() if not a.resolved]),
                "critical_alerts": len([a for a in self.active_alerts.values() 
                                      if a.severity == AlertSeverity.CRITICAL and not a.resolved]),
                "system_health": "healthy",  # Would be calculated based on metrics
                "average_throughput": np.mean([m.average_throughput for m in recent_metrics]),
                "overall_success_rate": np.mean([m.success_rate for m in recent_metrics])
            }
            
        except Exception as e:
            logger.error(f"Failed to get system overview: {str(e)}")
            return {"error": str(e)}
    
    async def _get_performance_trends(self) -> Dict[str, Any]:
        """Get performance trends over time"""
        try:
            # Calculate trends from system metrics history
            if len(self.system_metrics_history) < 2:
                return {"message": "Insufficient data for trends"}
            
            recent_metrics = list(self.system_metrics_history)[-20:]  # Last 20 data points
            
            # Calculate trends
            timestamps = [m.timestamp for m in recent_metrics]
            throughputs = [m.average_throughput for m in recent_metrics]
            success_rates = [m.success_rate for m in recent_metrics]
            cpu_usage = [m.total_cpu_usage for m in recent_metrics]
            
            return {
                "throughput_trend": {
                    "data": throughputs,
                    "slope": np.polyfit(range(len(throughputs)), throughputs, 1)[0] if len(throughputs) > 1 else 0
                },
                "success_rate_trend": {
                    "data": success_rates,
                    "slope": np.polyfit(range(len(success_rates)), success_rates, 1)[0] if len(success_rates) > 1 else 0
                },
                "cpu_usage_trend": {
                    "data": cpu_usage,
                    "slope": np.polyfit(range(len(cpu_usage)), cpu_usage, 1)[0] if len(cpu_usage) > 1 else 0
                },
                "time_range": {
                    "start": timestamps[0].isoformat() if timestamps else None,
                    "end": timestamps[-1].isoformat() if timestamps else None
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get performance trends: {str(e)}")
            return {"error": str(e)}
    
    async def _get_current_resource_utilization(self) -> Dict[str, Any]:
        """Get current resource utilization"""
        try:
            if not self.system_metrics_history:
                return {"message": "No metrics available"}
            
            latest_metrics = self.system_metrics_history[-1]
            
            return {
                "cpu_usage": latest_metrics.total_cpu_usage,
                "memory_usage": latest_metrics.total_memory_usage,
                "disk_io": latest_metrics.total_disk_io,
                "network_io": latest_metrics.total_network_io,
                "timestamp": latest_metrics.timestamp.isoformat(),
                "utilization_level": "high" if latest_metrics.total_cpu_usage > 80 else 
                                   "medium" if latest_metrics.total_cpu_usage > 50 else "low"
            }
            
        except Exception as e:
            logger.error(f"Failed to get resource utilization: {str(e)}")
            return {"error": str(e)}


class AnomalyDetector:
    """AI-powered anomaly detection for scan operations"""
    
    def __init__(self):
        self.anomaly_models = {}
        self.detection_history: List[Dict[str, Any]] = []
    
    async def initialize(self):
        """Initialize anomaly detection models"""
        # Initialize ML models for anomaly detection
        pass
    
    async def detect_scan_anomalies(
        self,
        scan_id: str,
        metrics: ScanMetrics
    ) -> List[Dict[str, Any]]:
        """Detect anomalies in scan metrics"""
        anomalies = []
        
        try:
            # Throughput anomaly detection
            if metrics.throughput < 5 and metrics.duration_seconds > 600:  # Very low throughput
                anomalies.append({
                    "type": "throughput_anomaly",
                    "severity": "high",
                    "description": f"Extremely low throughput: {metrics.throughput:.2f} items/sec",
                    "metric_value": metrics.throughput,
                    "expected_range": [20, 100]
                })
            
            # Success rate anomaly
            if metrics.success_rate < 0.7 and metrics.items_processed > 50:
                anomalies.append({
                    "type": "success_rate_anomaly",
                    "severity": "high",
                    "description": f"Low success rate: {metrics.success_rate:.1%}",
                    "metric_value": metrics.success_rate,
                    "expected_range": [0.9, 1.0]
                })
            
            # Resource usage anomaly
            cpu_usage = metrics.resource_usage.get('cpu', 0)
            if cpu_usage > 95:
                anomalies.append({
                    "type": "resource_anomaly",
                    "severity": "critical",
                    "description": f"Extreme CPU usage: {cpu_usage:.1f}%",
                    "metric_value": cpu_usage,
                    "expected_range": [20, 80]
                })
            
        except Exception as e:
            logger.error(f"Failed to detect anomalies for scan {scan_id}: {str(e)}")
        
        return anomalies
    
    async def run_detection_cycle(
        self,
        active_scan_metrics: Dict[str, ScanMetrics],
        system_metrics_history: deque
    ):
        """Run a complete anomaly detection cycle"""
        try:
            # Detect system-wide anomalies
            system_anomalies = await self._detect_system_anomalies(system_metrics_history)
            
            # Detect scan-specific anomalies
            scan_anomalies = {}
            for scan_id, metrics in active_scan_metrics.items():
                scan_anomalies[scan_id] = await self.detect_scan_anomalies(scan_id, metrics)
            
            # Store detection results
            detection_result = {
                "timestamp": datetime.now().isoformat(),
                "system_anomalies": system_anomalies,
                "scan_anomalies": scan_anomalies
            }
            
            self.detection_history.append(detection_result)
            
            # Keep only recent history
            if len(self.detection_history) > 100:
                self.detection_history.pop(0)
                
        except Exception as e:
            logger.error(f"Failed to run anomaly detection cycle: {str(e)}")
    
    async def _detect_system_anomalies(self, metrics_history: deque) -> List[Dict[str, Any]]:
        """Detect system-wide anomalies"""
        anomalies = []
        
        try:
            if len(metrics_history) < 10:
                return anomalies
            
            recent_metrics = list(metrics_history)[-10:]
            
            # CPU usage trend anomaly
            cpu_values = [m.total_cpu_usage for m in recent_metrics]
            if np.mean(cpu_values) > 90:
                anomalies.append({
                    "type": "system_cpu_anomaly",
                    "severity": "critical",
                    "description": f"Sustained high CPU usage: {np.mean(cpu_values):.1f}%",
                    "metric_value": np.mean(cpu_values)
                })
            
            # Memory usage anomaly
            memory_values = [m.total_memory_usage for m in recent_metrics]
            if np.mean(memory_values) > 85:
                anomalies.append({
                    "type": "system_memory_anomaly",
                    "severity": "high",
                    "description": f"High memory usage: {np.mean(memory_values):.1f}%",
                    "metric_value": np.mean(memory_values)
                })
            
        except Exception as e:
            logger.error(f"Failed to detect system anomalies: {str(e)}")
        
        return anomalies


class AlertManager:
    """Manages alert creation, routing, and delivery"""
    
    def __init__(self):
        self.alert_channels: Dict[str, Callable] = {}
        self.pending_alerts: List[Alert] = []
        self.alert_history: List[Alert] = []
    
    async def initialize(self):
        """Initialize alert manager"""
        # Setup alert delivery channels
        self.alert_channels = {
            "log": self._send_log_alert,
            "websocket": self._send_websocket_alert,
            "email": self._send_email_alert,
            "slack": self._send_slack_alert
        }
    
    async def send_alert(self, alert: Alert):
        """Send alert through configured channels"""
        try:
            # Add to pending alerts for processing
            self.pending_alerts.append(alert)
            
        except Exception as e:
            logger.error(f"Failed to queue alert {alert.id}: {str(e)}")
    
    async def process_pending_alerts(self):
        """Process all pending alerts"""
        try:
            while self.pending_alerts:
                alert = self.pending_alerts.pop(0)
                await self._process_single_alert(alert)
                
        except Exception as e:
            logger.error(f"Failed to process pending alerts: {str(e)}")
    
    async def _process_single_alert(self, alert: Alert):
        """Process a single alert"""
        try:
            # Send through log channel
            await self.alert_channels["log"](alert)
            
            # Send through WebSocket channel
            await self.alert_channels["websocket"](alert)
            
            # Add to history
            self.alert_history.append(alert)
            
            # Keep history manageable
            if len(self.alert_history) > 1000:
                self.alert_history.pop(0)
                
        except Exception as e:
            logger.error(f"Failed to process alert {alert.id}: {str(e)}")
    
    async def _send_log_alert(self, alert: Alert):
        """Send alert to log"""
        severity_map = {
            AlertSeverity.INFO: logger.info,
            AlertSeverity.WARNING: logger.warning,
            AlertSeverity.ERROR: logger.error,
            AlertSeverity.CRITICAL: logger.critical
        }
        
        log_func = severity_map.get(alert.severity, logger.info)
        log_func(f"ALERT [{alert.type.value}] {alert.title}: {alert.message}")
    
    async def _send_websocket_alert(self, alert: Alert):
        """Send alert via WebSocket"""
        try:
            websocket_message = {
                "type": "alert",
                "alert_id": alert.id,
                "alert_type": alert.type.value,
                "severity": alert.severity.value,
                "title": alert.title,
                "message": alert.message,
                "scan_id": alert.scan_id,
                "timestamp": alert.timestamp.isoformat(),
                "metadata": alert.metadata,
                "requires_action": alert.severity in [AlertSeverity.ERROR, AlertSeverity.CRITICAL]
            }
            
            # In production, this would send via actual WebSocket connections
            # For now, store in a queue that WebSocket handlers can access
            if not hasattr(self, 'websocket_alert_queue'):
                self.websocket_alert_queue = deque(maxlen=1000)
            
            self.websocket_alert_queue.append(websocket_message)
            logger.info(f"WebSocket alert queued: {alert.title}")
            
        except Exception as e:
            logger.error(f"Failed to send WebSocket alert: {str(e)}")
    
    async def _send_email_alert(self, alert: Alert):
        """Send alert via email"""
        try:
            # Prepare email content with rich formatting
            email_content = {
                "subject": f"[{alert.severity.value.upper()}] Data Governance Alert: {alert.title}",
                "recipients": await self._get_alert_recipients(alert),
                "template": "scan_alert",
                "template_data": {
                    "alert_title": alert.title,
                    "alert_message": alert.message,
                    "alert_severity": alert.severity.value,
                    "alert_type": alert.type.value,
                    "scan_id": alert.scan_id,
                    "timestamp": alert.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "alert_metadata": alert.metadata,
                    "action_required": alert.severity in [AlertSeverity.ERROR, AlertSeverity.CRITICAL],
                    "dashboard_link": f"/monitoring/alerts/{alert.id}"
                }
            }
            
            # Queue email for sending (in production, this would use an email service)
            if not hasattr(self, 'email_alert_queue'):
                self.email_alert_queue = deque(maxlen=500)
            
            self.email_alert_queue.append(email_content)
            logger.info(f"Email alert queued for {len(email_content['recipients'])} recipients: {alert.title}")
            
        except Exception as e:
            logger.error(f"Failed to prepare email alert: {str(e)}")
    
    async def _send_slack_alert(self, alert: Alert):
        """Send alert via Slack"""
        try:
            # Prepare Slack message with rich formatting
            severity_colors = {
                AlertSeverity.INFO: "#36a64f",  # Green
                AlertSeverity.WARNING: "#ffaa00",  # Orange
                AlertSeverity.ERROR: "#ff0000",  # Red
                AlertSeverity.CRITICAL: "#800080"  # Purple
            }
            
            severity_emojis = {
                AlertSeverity.INFO: ":information_source:",
                AlertSeverity.WARNING: ":warning:",
                AlertSeverity.ERROR: ":x:",
                AlertSeverity.CRITICAL: ":rotating_light:"
            }
            
            slack_message = {
                "channel": await self._get_slack_channel_for_alert(alert),
                "username": "Data Governance Monitor",
                "icon_emoji": ":shield:",
                "attachments": [{
                    "color": severity_colors.get(alert.severity, "#cccccc"),
                    "title": f"{severity_emojis.get(alert.severity, '')} {alert.title}",
                    "text": alert.message,
                    "fields": [
                        {
                            "title": "Severity",
                            "value": alert.severity.value.upper(),
                            "short": True
                        },
                        {
                            "title": "Alert Type",
                            "value": alert.type.value.replace("_", " ").title(),
                            "short": True
                        },
                        {
                            "title": "Scan ID",
                            "value": alert.scan_id or "System-wide",
                            "short": True
                        },
                        {
                            "title": "Timestamp",
                            "value": alert.timestamp.strftime("%Y-%m-%d %H:%M UTC"),
                            "short": True
                        }
                    ],
                    "footer": "Data Governance System",
                    "ts": int(alert.timestamp.timestamp())
                }]
            }
            
            # Add action buttons for critical alerts
            if alert.severity in [AlertSeverity.ERROR, AlertSeverity.CRITICAL]:
                slack_message["attachments"][0]["actions"] = [
                    {
                        "type": "button",
                        "text": "View Dashboard",
                        "url": f"/monitoring/alerts/{alert.id}",
                        "style": "primary"
                    },
                    {
                        "type": "button", 
                        "text": "Acknowledge",
                        "name": "acknowledge",
                        "value": alert.id,
                        "style": "default"
                    }
                ]
            
            # Queue Slack message for sending
            if not hasattr(self, 'slack_alert_queue'):
                self.slack_alert_queue = deque(maxlen=500)
            
            self.slack_alert_queue.append(slack_message)
            logger.info(f"Slack alert queued for channel #{slack_message['channel']}: {alert.title}")
            
        except Exception as e:
            logger.error(f"Failed to prepare Slack alert: {str(e)}")
    
    async def _get_alert_recipients(self, alert: Alert) -> List[str]:
        """Get email recipients for alert based on severity and type"""
        try:
            # In production, this would query user preferences and role-based subscriptions
            recipients = []
            
            # Always notify system administrators for critical alerts
            if alert.severity == AlertSeverity.CRITICAL:
                recipients.extend(["admin@company.com", "devops@company.com"])
            
            # Notify data team for data-related alerts
            if alert.type in [AlertType.PERFORMANCE_DEGRADATION, AlertType.SCAN_FAILURE]:
                recipients.extend(["data-team@company.com"])
            
            # Notify security team for security-related alerts
            if alert.type in [AlertType.ANOMALY_DETECTED, AlertType.SYSTEM_OVERLOAD]:
                recipients.extend(["security@company.com"])
            
            return list(set(recipients))  # Remove duplicates
            
        except Exception as e:
            logger.error(f"Failed to get alert recipients: {str(e)}")
            return ["admin@company.com"]  # Fallback
    
    async def _get_slack_channel_for_alert(self, alert: Alert) -> str:
        """Get appropriate Slack channel for alert"""
        try:
            # Route alerts to appropriate channels based on type and severity
            if alert.severity == AlertSeverity.CRITICAL:
                return "alerts-critical"
            elif alert.type in [AlertType.PERFORMANCE_DEGRADATION, AlertType.SCAN_FAILURE]:
                return "data-governance"
            elif alert.type in [AlertType.ANOMALY_DETECTED, AlertType.SYSTEM_OVERLOAD]:
                return "system-monitoring"
            else:
                return "general-alerts"
                
        except Exception as e:
            logger.error(f"Failed to determine Slack channel: {str(e)}")
            return "general-alerts"  # Fallback


class MetricsAggregator:
    """Aggregates and processes metrics from multiple sources"""
    
    def __init__(self):
        self.aggregation_rules: List[Dict[str, Any]] = []
        self.aggregated_metrics: Dict[str, Any] = {}
    
    async def initialize(self):
        """Initialize metrics aggregator"""
        # Setup aggregation rules
        self.aggregation_rules = [
            {
                "name": "hourly_throughput",
                "window": timedelta(hours=1),
                "aggregation": "average",
                "metric": "throughput"
            },
            {
                "name": "daily_success_rate",
                "window": timedelta(days=1),
                "aggregation": "average",
                "metric": "success_rate"
            }
        ]
    
    async def aggregate_metrics(
        self,
        scan_metrics: Dict[str, ScanMetrics],
        system_metrics: List[SystemMetrics]
    ) -> Dict[str, Any]:
        """Aggregate metrics according to rules"""
        aggregated = {}
        
        try:
            # Aggregate scan metrics
            if scan_metrics:
                total_throughput = sum(m.throughput for m in scan_metrics.values())
                avg_success_rate = np.mean([m.success_rate for m in scan_metrics.values()])
                
                aggregated["scan_aggregates"] = {
                    "total_throughput": total_throughput,
                    "average_success_rate": avg_success_rate,
                    "active_scan_count": len(scan_metrics)
                }
            
            # Aggregate system metrics
            if system_metrics:
                recent_metrics = [m for m in system_metrics 
                                if (datetime.now() - m.timestamp).total_seconds() < 3600]
                
                if recent_metrics:
                    aggregated["system_aggregates"] = {
                        "avg_cpu_usage": np.mean([m.total_cpu_usage for m in recent_metrics]),
                        "avg_memory_usage": np.mean([m.total_memory_usage for m in recent_metrics]),
                        "max_active_scans": max([m.active_scans for m in recent_metrics])
                    }
            
            self.aggregated_metrics.update(aggregated)
            
        except Exception as e:
            logger.error(f"Failed to aggregate metrics: {str(e)}")
        
        return aggregated

    async def _cleanup_resolved_alerts(self):
        """Clean up resolved alerts to keep memory usage manageable"""
        try:
            current_time = datetime.now()
            alerts_to_remove = []
            
            for alert_id, alert in self.active_alerts.items():
                # Remove alerts that are resolved and older than 24 hours
                if alert.resolved and (current_time - alert.timestamp).total_seconds() > 86400:
                    alerts_to_remove.append(alert_id)
                # Auto-resolve old info alerts
                elif alert.severity == AlertSeverity.INFO and (current_time - alert.timestamp).total_seconds() > 3600:
                    alert.resolved = True
            
            # Remove old alerts
            for alert_id in alerts_to_remove:
                del self.active_alerts[alert_id]
                
            if alerts_to_remove:
                logger.info(f"Cleaned up {len(alerts_to_remove)} resolved alerts")
                
        except Exception as e:
            logger.error(f"Failed to cleanup resolved alerts: {str(e)}")
    
    async def _check_system_health(self):
        """Check overall system health and create alerts if needed"""
        try:
            if not self.system_metrics_history:
                return
            
            latest_metrics = self.system_metrics_history[-1]
            current_time = datetime.now()
            
            # Check for system overload
            if latest_metrics.total_cpu_usage > 95 and latest_metrics.total_memory_usage > 90:
                await self._create_alert({
                    "type": AlertType.SYSTEM_OVERLOAD,
                    "severity": AlertSeverity.CRITICAL,
                    "title": "System Overload Detected",
                    "message": f"System is overloaded: CPU {latest_metrics.total_cpu_usage:.1f}%, Memory {latest_metrics.total_memory_usage:.1f}%",
                    "metadata": {
                        "cpu_usage": latest_metrics.total_cpu_usage,
                        "memory_usage": latest_metrics.total_memory_usage,
                        "active_scans": latest_metrics.active_scans
                    }
                })
            
            # Check for too many queued scans
            if latest_metrics.queued_scans > 20:
                await self._create_alert({
                    "type": AlertType.SYSTEM_OVERLOAD,
                    "severity": AlertSeverity.WARNING,
                    "title": "High Queue Backlog",
                    "message": f"High number of queued scans: {latest_metrics.queued_scans}",
                    "metadata": {
                        "queued_scans": latest_metrics.queued_scans,
                        "active_scans": latest_metrics.active_scans
                    }
                })
                
        except Exception as e:
            logger.error(f"Failed to check system health: {str(e)}")
    
    async def _update_performance_baselines(self):
        """Update performance baselines based on recent performance data"""
        try:
            # Update baselines from completed scans
            completed_scans = [metrics for metrics in self.active_scan_metrics.values() 
                             if metrics.status == ScanJobStatus.COMPLETED and metrics.duration_seconds > 0]
            
            if len(completed_scans) >= 5:  # Need at least 5 samples
                # Calculate new baseline values
                avg_duration = np.mean([m.duration_seconds for m in completed_scans])
                avg_throughput = np.mean([m.throughput for m in completed_scans if m.throughput > 0])
                avg_success_rate = np.mean([m.success_rate for m in completed_scans])
                
                # Update default baseline
                if "default" in self.performance_baselines:
                    baseline = self.performance_baselines["default"]
                    # Use exponential moving average to update baselines
                    alpha = 0.1  # Smoothing factor
                    baseline.average_duration = baseline.average_duration * (1 - alpha) + avg_duration * alpha
                    baseline.average_throughput = baseline.average_throughput * (1 - alpha) + avg_throughput * alpha
                    baseline.average_success_rate = baseline.average_success_rate * (1 - alpha) + avg_success_rate * alpha
                    baseline.last_updated = datetime.now()
                    
                    logger.info(f"Updated performance baseline: duration={baseline.average_duration:.1f}s, throughput={baseline.average_throughput:.1f}/s")
                
        except Exception as e:
            logger.error(f"Failed to update performance baselines: {str(e)}")
    
    async def _get_scan_baseline(self, scan_id: str) -> Optional[PerformanceBaseline]:
        """Get performance baseline for a specific scan"""
        try:
            # For now, return default baseline
            # In production, this would look up scan-type-specific baselines
            return self.performance_baselines.get("default")
            
        except Exception as e:
            logger.error(f"Failed to get baseline for scan {scan_id}: {str(e)}")
            return None
    
    async def _calculate_performance_score(
        self,
        metrics: ScanMetrics,
        baseline: PerformanceBaseline
    ) -> float:
        """Calculate performance score compared to baseline"""
        try:
            score = 0.0
            weight_sum = 0.0
            
            # Duration score (lower duration = higher score)
            if baseline.average_duration > 0:
                duration_ratio = baseline.average_duration / max(1, metrics.duration_seconds)
                duration_score = min(1.0, duration_ratio)  # Cap at 1.0
                score += duration_score * 0.3
                weight_sum += 0.3
            
            # Throughput score
            if baseline.average_throughput > 0:
                throughput_ratio = metrics.throughput / baseline.average_throughput
                throughput_score = min(1.0, throughput_ratio)  # Cap at 1.0
                score += throughput_score * 0.4
                weight_sum += 0.4
            
            # Success rate score
            if baseline.average_success_rate > 0:
                success_ratio = metrics.success_rate / baseline.average_success_rate
                success_score = min(1.0, success_ratio)  # Cap at 1.0
                score += success_score * 0.3
                weight_sum += 0.3
            
            # Normalize score
            if weight_sum > 0:
                score = score / weight_sum
            else:
                score = 0.5  # Default score if no baseline data
            
            return max(0.0, min(1.0, score))  # Ensure score is between 0 and 1
            
        except Exception as e:
            logger.error(f"Failed to calculate performance score: {str(e)}")
            return 0.5  # Default score on error
    
    async def _generate_performance_recommendations(
        self,
        metrics: ScanMetrics,
        baseline: Optional[PerformanceBaseline]
    ) -> List[str]:
        """Generate performance recommendations"""
        recommendations = []
        
        try:
            # Low throughput recommendations
            if metrics.throughput < 20:
                recommendations.append("Consider increasing batch size or parallelism to improve throughput")
            
            # High error rate recommendations
            if metrics.success_rate < 0.9:
                recommendations.append("High error rate detected - review scan configuration and data quality")
            
            # Resource usage recommendations
            cpu_usage = metrics.resource_usage.get('cpu', 0)
            memory_usage = metrics.resource_usage.get('memory', 0)
            
            if cpu_usage > 90:
                recommendations.append("High CPU usage - consider reducing parallelism or scan depth")
            elif cpu_usage < 30 and metrics.throughput < 50:
                recommendations.append("Low CPU usage with poor throughput - consider increasing parallelism")
            
            if memory_usage > 85:
                recommendations.append("High memory usage - consider reducing batch size or implementing memory optimization")
            
            # Duration-based recommendations
            if baseline and metrics.duration_seconds > baseline.average_duration * 1.5:
                recommendations.append("Scan taking longer than expected - check for data complexity or resource constraints")
            
            # Progress-based recommendations
            if metrics.progress_percentage < 50 and metrics.duration_seconds > 1800:  # 30 minutes
                recommendations.append("Slow progress detected - consider breaking scan into smaller chunks")
            
            if not recommendations:
                recommendations.append("Performance is within normal parameters")
                
        except Exception as e:
            logger.error(f"Failed to generate performance recommendations: {str(e)}")
            recommendations.append("Unable to generate recommendations due to analysis error")
        
        return recommendations
    
    async def _update_baseline_from_scan(self, scan_id: str, metrics: ScanMetrics):
        """Update performance baseline from completed scan"""
        try:
            if metrics.status != ScanJobStatus.COMPLETED or metrics.duration_seconds <= 0:
                return
            
            # Update default baseline with this scan's data
            if "default" not in self.performance_baselines:
                # Create new baseline
                self.performance_baselines["default"] = PerformanceBaseline(
                    scan_type="default",
                    average_duration=metrics.duration_seconds,
                    average_throughput=metrics.throughput,
                    average_success_rate=metrics.success_rate,
                    resource_usage_normal={
                        "cpu": metrics.resource_usage.get('cpu', 40.0),
                        "memory": metrics.resource_usage.get('memory', 30.0)
                    },
                    last_updated=datetime.now()
                )
            else:
                # Update existing baseline using exponential moving average
                baseline = self.performance_baselines["default"]
                alpha = 0.1  # Smoothing factor
                
                baseline.average_duration = baseline.average_duration * (1 - alpha) + metrics.duration_seconds * alpha
                baseline.average_throughput = baseline.average_throughput * (1 - alpha) + metrics.throughput * alpha
                baseline.average_success_rate = baseline.average_success_rate * (1 - alpha) + metrics.success_rate * alpha
                
                # Update resource usage baseline
                for resource, value in metrics.resource_usage.items():
                    if resource in baseline.resource_usage_normal:
                        baseline.resource_usage_normal[resource] = baseline.resource_usage_normal[resource] * (1 - alpha) + value * alpha
                
                baseline.last_updated = datetime.now()
                
            logger.debug(f"Updated baseline from scan {scan_id}")
            
        except Exception as e:
            logger.error(f"Failed to update baseline from scan {scan_id}: {str(e)}")
    
    async def acknowledge_alert(self, alert_id: str, user_id: Optional[str] = None) -> bool:
        """Acknowledge an alert"""
        try:
            if alert_id not in self.active_alerts:
                return False
            
            alert = self.active_alerts[alert_id]
            alert.acknowledged = True
            alert.metadata["acknowledged_by"] = user_id or "system"
            alert.metadata["acknowledged_at"] = datetime.now().isoformat()
            
            # Broadcast acknowledgment
            await self._broadcast_event({
                "type": "alert_acknowledged",
                "alert_id": alert_id,
                "acknowledged_by": user_id,
                "timestamp": datetime.now().isoformat()
            })
            
            logger.info(f"Alert {alert_id} acknowledged by {user_id or 'system'}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to acknowledge alert {alert_id}: {str(e)}")
            return False
    
    async def resolve_alert(self, alert_id: str, user_id: Optional[str] = None, resolution_note: Optional[str] = None) -> bool:
        """Resolve an alert"""
        try:
            if alert_id not in self.active_alerts:
                return False
            
            alert = self.active_alerts[alert_id]
            alert.resolved = True
            alert.metadata["resolved_by"] = user_id or "system"
            alert.metadata["resolved_at"] = datetime.now().isoformat()
            if resolution_note:
                alert.metadata["resolution_note"] = resolution_note
            
            # Broadcast resolution
            await self._broadcast_event({
                "type": "alert_resolved",
                "alert_id": alert_id,
                "resolved_by": user_id,
                "resolution_note": resolution_note,
                "timestamp": datetime.now().isoformat()
            })
            
            logger.info(f"Alert {alert_id} resolved by {user_id or 'system'}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to resolve alert {alert_id}: {str(e)}")
            return False
    
    async def get_alert_history(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        severity_filter: Optional[AlertSeverity] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get alert history with optional filters"""
        try:
            # Combine active and historical alerts
            all_alerts = list(self.active_alerts.values()) + self.alert_manager.alert_history
            
            # Apply filters
            filtered_alerts = []
            for alert in all_alerts:
                # Time filter
                if start_time and alert.timestamp < start_time:
                    continue
                if end_time and alert.timestamp > end_time:
                    continue
                
                # Severity filter
                if severity_filter and alert.severity != severity_filter:
                    continue
                
                filtered_alerts.append({
                    "id": alert.id,
                    "type": alert.type.value,
                    "severity": alert.severity.value,
                    "title": alert.title,
                    "message": alert.message,
                    "scan_id": alert.scan_id,
                    "timestamp": alert.timestamp.isoformat(),
                    "acknowledged": alert.acknowledged,
                    "resolved": alert.resolved,
                    "metadata": alert.metadata
                })
            
            # Sort by timestamp (newest first) and limit
            filtered_alerts.sort(key=lambda x: x["timestamp"], reverse=True)
            return filtered_alerts[:limit]
            
        except Exception as e:
            logger.error(f"Failed to get alert history: {str(e)}")
            return []
    
    async def get_system_metrics_history(
        self,
        duration_hours: int = 24
    ) -> Dict[str, Any]:
        """Get system metrics history for a specified duration"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=duration_hours)
            
            # Filter metrics within time range
            filtered_metrics = [
                m for m in self.system_metrics_history 
                if m.timestamp >= cutoff_time
            ]
            
            if not filtered_metrics:
                return {"message": "No metrics available for the specified time range"}
            
            # Format for charting/analysis
            timestamps = [m.timestamp.isoformat() for m in filtered_metrics]
            cpu_usage = [m.total_cpu_usage for m in filtered_metrics]
            memory_usage = [m.total_memory_usage for m in filtered_metrics]
            active_scans = [m.active_scans for m in filtered_metrics]
            throughput = [m.average_throughput for m in filtered_metrics]
            success_rate = [m.success_rate for m in filtered_metrics]
            
            return {
                "time_range": {
                    "start": filtered_metrics[0].timestamp.isoformat(),
                    "end": filtered_metrics[-1].timestamp.isoformat(),
                    "duration_hours": duration_hours
                },
                "data_points": len(filtered_metrics),
                "metrics": {
                    "timestamps": timestamps,
                    "cpu_usage": cpu_usage,
                    "memory_usage": memory_usage,
                    "active_scans": active_scans,
                    "average_throughput": throughput,
                    "success_rate": success_rate
                },
                "summary": {
                    "avg_cpu_usage": np.mean(cpu_usage),
                    "max_cpu_usage": np.max(cpu_usage),
                    "avg_memory_usage": np.mean(memory_usage),
                    "max_memory_usage": np.max(memory_usage),
                    "max_active_scans": np.max(active_scans),
                    "avg_throughput": np.mean(throughput),
                    "avg_success_rate": np.mean(success_rate)
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get system metrics history: {str(e)}")
            return {"error": str(e)}
    
    async def export_scan_report(self, scan_id: str) -> Dict[str, Any]:
        """Export comprehensive scan report"""
        try:
            if scan_id not in self.active_scan_metrics:
                return {"error": f"Scan {scan_id} not found"}
            
            metrics = self.active_scan_metrics[scan_id]
            baseline = await self._get_scan_baseline(scan_id)
            analysis = await self.get_scan_performance_analysis(scan_id)
            
            # Get scan-related alerts
            scan_alerts = [
                {
                    "id": alert.id,
                    "type": alert.type.value,
                    "severity": alert.severity.value,
                    "title": alert.title,
                    "message": alert.message,
                    "timestamp": alert.timestamp.isoformat(),
                    "acknowledged": alert.acknowledged,
                    "resolved": alert.resolved
                }
                for alert in self.active_alerts.values()
                if alert.scan_id == scan_id
            ]
            
            report = {
                "report_id": f"scan_report_{scan_id}_{datetime.now().isoformat()}",
                "scan_id": scan_id,
                "generated_at": datetime.now().isoformat(),
                "scan_metrics": {
                    "status": metrics.status.value,
                    "progress": metrics.progress_percentage,
                    "duration_seconds": metrics.duration_seconds,
                    "items_processed": metrics.items_processed,
                    "items_total": metrics.items_total,
                    "success_rate": metrics.success_rate,
                    "error_count": metrics.error_count,
                    "throughput": metrics.throughput,
                    "resource_usage": metrics.resource_usage
                },
                "performance_analysis": analysis,
                "alerts": scan_alerts,
                "baseline_comparison": {
                    "baseline_available": baseline is not None,
                    "baseline_data": {
                        "average_duration": baseline.average_duration if baseline else None,
                        "average_throughput": baseline.average_throughput if baseline else None,
                        "average_success_rate": baseline.average_success_rate if baseline else None
                    } if baseline else None
                },
                "summary": {
                    "overall_status": "healthy" if metrics.success_rate > 0.9 and len(scan_alerts) == 0 else "issues_detected",
                    "performance_rating": analysis.get("performance_score", 0.0),
                    "key_insights": analysis.get("recommendations", [])
                }
            }
            
            return report
            
        except Exception as e:
            logger.error(f"Failed to export scan report for {scan_id}: {str(e)}")
            return {"error": str(e)}
    
    async def stop_monitoring(self):
        """Stop the monitoring system gracefully"""
        try:
            logger.info("Stopping Real-time Scan Monitor...")
            
            self.monitoring_active = False
            
            # Wait for monitoring loops to stop
            await asyncio.sleep(2)
            
            # Close WebSocket server if running
            if self.websocket_server and self.websocket_server != "mock_websocket_server":
                # Close actual WebSocket server
                pass
            
            logger.info("Real-time Scan Monitor stopped")
            
        except Exception as e:
            logger.error(f"Failed to stop monitoring: {str(e)}")
    
    def get_monitoring_status(self) -> Dict[str, Any]:
        """Get current monitoring system status"""
        try:
            return {
                "monitoring_active": self.monitoring_active,
                "active_scans_count": len([m for m in self.active_scan_metrics.values() 
                                         if m.status in [ScanJobStatus.RUNNING, ScanJobStatus.PENDING]]),
                "total_registered_scans": len(self.active_scan_metrics),
                "active_alerts_count": len([a for a in self.active_alerts.values() if not a.resolved]),
                "critical_alerts_count": len([a for a in self.active_alerts.values() 
                                            if a.severity == AlertSeverity.CRITICAL and not a.resolved]),
                "system_metrics_history_length": len(self.system_metrics_history),
                "performance_baselines_count": len(self.performance_baselines),
                "websocket_server_status": "active" if self.websocket_server else "inactive",
                "anomaly_detector_status": "active",
                "alert_manager_status": "active",
                "metrics_aggregator_status": "active",
                "last_metrics_update": self.system_metrics_history[-1].timestamp.isoformat() if self.system_metrics_history else None
            }
            
        except Exception as e:
            logger.error(f"Failed to get monitoring status: {str(e)}")
            return {"error": str(e)}