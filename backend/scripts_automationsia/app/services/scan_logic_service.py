from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlmodel import Session, select, and_, or_, func
from sqlalchemy import desc, asc
import uuid
import json
import logging
from croniter import croniter
import asyncio
from concurrent.futures import ThreadPoolExecutor

from ..models.scan_logic_models import (
    ScanConfiguration, ScanRun, ScanLog, ScanResult, DiscoveredEntity, ScanIssue,
    ScanSchedule, ScanAnalytics, ScanType, ScanStatus, ScanTriggerType,
    IssueSeverity, IssueType, EntityType
)
from ..models.data_source_models import DataSource
from ..core.database import get_session
from ..core.security import get_current_user
from ..core.exceptions import NotFoundException, ValidationError, BusinessLogicError
from ..services.audit_service import AuditService
from ..services.notification_service import NotificationService
from ..services.analytics_service import AnalyticsService

logger = logging.getLogger(__name__)


class ScanLogicService:
    """Enterprise service for managing scan logic operations"""
    
    def __init__(self):
        self.audit_service = AuditService()
        self.notification_service = NotificationService()
        self.analytics_service = AnalyticsService()
        self.executor = ThreadPoolExecutor(max_workers=10)
    
    # Scan Configuration Management
    async def create_scan_configuration(
        self, 
        db: Session, 
        config_data: Dict[str, Any], 
        user_id: str
    ) -> ScanConfiguration:
        """Create a new scan configuration"""
        try:
            # Validate data source exists
            data_source = db.exec(
                select(DataSource).where(DataSource.id == config_data["data_source_id"])
            ).first()
            if not data_source:
                raise ValidationError("Data source not found")
            
            # Create scan configuration
            scan_config = ScanConfiguration(
                name=config_data["name"],
                description=config_data.get("description"),
                data_source_id=config_data["data_source_id"],
                scan_type=config_data.get("scan_type", ScanType.FULL),
                scope=config_data.get("scope", {}),
                settings=config_data.get("settings", {}),
                schedule_enabled=config_data.get("schedule_enabled", False),
                schedule_cron=config_data.get("schedule_cron"),
                schedule_timezone=config_data.get("schedule_timezone", "UTC"),
                status=config_data.get("status", "active"),
                priority=config_data.get("priority", 5),
                created_by=user_id,
                updated_by=user_id
            )
            
            db.add(scan_config)
            db.commit()
            db.refresh(scan_config)
            
            # Create schedule if enabled
            if scan_config.schedule_enabled and scan_config.schedule_cron:
                await self._create_scan_schedule(db, scan_config, user_id)
            
            # Audit log
            await self.audit_service.log_action(
                db, user_id, "scan_configuration_created", 
                f"Created scan configuration: {scan_config.name}",
                {"scan_config_id": scan_config.id}
            )
            
            return scan_config
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating scan configuration: {str(e)}")
            raise
    
    async def get_scan_configurations(
        self, 
        db: Session, 
        user_id: str,
        data_source_id: Optional[int] = None,
        status: Optional[str] = None,
        scan_type: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ScanConfiguration], int]:
        """Get scan configurations with filtering and pagination"""
        try:
            query = select(ScanConfiguration)
            
            # Apply filters
            if data_source_id:
                query = query.where(ScanConfiguration.data_source_id == data_source_id)
            if status:
                query = query.where(ScanConfiguration.status == status)
            if scan_type:
                query = query.where(ScanConfiguration.scan_type == scan_type)
            
            # Get total count
            total_query = select(func.count(ScanConfiguration.id))
            if data_source_id:
                total_query = total_query.where(ScanConfiguration.data_source_id == data_source_id)
            if status:
                total_query = total_query.where(ScanConfiguration.status == status)
            if scan_type:
                total_query = total_query.where(ScanConfiguration.scan_type == scan_type)
            
            total = db.exec(total_query).first()
            
            # Apply pagination and ordering
            query = query.offset((page - 1) * page_size).limit(page_size)
            query = query.order_by(desc(ScanConfiguration.created_at))
            
            configurations = db.exec(query).all()
            return configurations, total
            
        except Exception as e:
            logger.error(f"Error getting scan configurations: {str(e)}")
            raise
    
    async def get_scan_configuration(
        self, 
        db: Session, 
        config_id: int, 
        user_id: str
    ) -> ScanConfiguration:
        """Get a specific scan configuration"""
        try:
            config = db.exec(
                select(ScanConfiguration).where(ScanConfiguration.id == config_id)
            ).first()
            
            if not config:
                raise NotFoundException("Scan configuration not found")
            
            return config
            
        except Exception as e:
            logger.error(f"Error getting scan configuration: {str(e)}")
            raise
    
    async def update_scan_configuration(
        self, 
        db: Session, 
        config_id: int, 
        update_data: Dict[str, Any], 
        user_id: str
    ) -> ScanConfiguration:
        """Update a scan configuration"""
        try:
            config = await self.get_scan_configuration(db, config_id, user_id)
            
            # Update fields
            for field, value in update_data.items():
                if hasattr(config, field):
                    setattr(config, field, value)
            
            config.updated_at = datetime.now()
            config.updated_by = user_id
            
            db.add(config)
            db.commit()
            db.refresh(config)
            
            # Update schedule if needed
            if "schedule_enabled" in update_data or "schedule_cron" in update_data:
                await self._update_scan_schedule(db, config, user_id)
            
            # Audit log
            await self.audit_service.log_action(
                db, user_id, "scan_configuration_updated", 
                f"Updated scan configuration: {config.name}",
                {"scan_config_id": config.id}
            )
            
            return config
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating scan configuration: {str(e)}")
            raise
    
    async def delete_scan_configuration(
        self, 
        db: Session, 
        config_id: int, 
        user_id: str
    ) -> bool:
        """Delete a scan configuration"""
        try:
            config = await self.get_scan_configuration(db, config_id, user_id)
            
            # Check if there are running scans
            running_scans = db.exec(
                select(ScanRun).where(
                    and_(
                        ScanRun.scan_config_id == config_id,
                        ScanRun.status == ScanStatus.RUNNING
                    )
                )
            ).all()
            
            if running_scans:
                raise BusinessLogicError("Cannot delete configuration with running scans")
            
            # Delete related schedules
            db.exec(
                select(ScanSchedule).where(ScanSchedule.scan_config_id == config_id)
            ).delete()
            
            # Delete the configuration
            db.delete(config)
            db.commit()
            
            # Audit log
            await self.audit_service.log_action(
                db, user_id, "scan_configuration_deleted", 
                f"Deleted scan configuration: {config.name}",
                {"scan_config_id": config_id}
            )
            
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting scan configuration: {str(e)}")
            raise
    
    # Scan Run Management
    async def create_scan_run(
        self, 
        db: Session, 
        config_id: int, 
        trigger_type: ScanTriggerType,
        user_id: str,
        run_name: Optional[str] = None
    ) -> ScanRun:
        """Create and start a new scan run"""
        try:
            config = await self.get_scan_configuration(db, config_id, user_id)
            
            # Check if scan is active
            if config.status != "active":
                raise BusinessLogicError("Cannot run inactive scan configuration")
            
            # Create scan run
            run_id = str(uuid.uuid4())
            scan_run = ScanRun(
                scan_config_id=config_id,
                run_id=run_id,
                name=run_name or f"{config.name} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                status=ScanStatus.PENDING,
                trigger_type=trigger_type,
                started_at=datetime.now(),
                scan_config_snapshot=config.dict(),
                created_by=user_id
            )
            
            db.add(scan_run)
            db.commit()
            db.refresh(scan_run)
            
            # Start scan execution in background
            asyncio.create_task(self._execute_scan(db, scan_run, config))
            
            # Audit log
            await self.audit_service.log_action(
                db, user_id, "scan_run_started", 
                f"Started scan run: {scan_run.name}",
                {"scan_run_id": scan_run.id, "scan_config_id": config_id}
            )
            
            return scan_run
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating scan run: {str(e)}")
            raise
    
    async def get_scan_runs(
        self, 
        db: Session, 
        user_id: str,
        config_id: Optional[int] = None,
        status: Optional[ScanStatus] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ScanRun], int]:
        """Get scan runs with filtering and pagination"""
        try:
            query = select(ScanRun)
            
            # Apply filters
            if config_id:
                query = query.where(ScanRun.scan_config_id == config_id)
            if status:
                query = query.where(ScanRun.status == status)
            
            # Get total count
            total_query = select(func.count(ScanRun.id))
            if config_id:
                total_query = total_query.where(ScanRun.scan_config_id == config_id)
            if status:
                total_query = total_query.where(ScanRun.status == status)
            
            total = db.exec(total_query).first()
            
            # Apply pagination and ordering
            query = query.offset((page - 1) * page_size).limit(page_size)
            query = query.order_by(desc(ScanRun.created_at))
            
            runs = db.exec(query).all()
            return runs, total
            
        except Exception as e:
            logger.error(f"Error getting scan runs: {str(e)}")
            raise
    
    async def get_scan_run(
        self, 
        db: Session, 
        run_id: int, 
        user_id: str
    ) -> ScanRun:
        """Get a specific scan run with all related data"""
        try:
            run = db.exec(
                select(ScanRun).where(ScanRun.id == run_id)
            ).first()
            
            if not run:
                raise NotFoundException("Scan run not found")
            
            return run
            
        except Exception as e:
            logger.error(f"Error getting scan run: {str(e)}")
            raise
    
    async def cancel_scan_run(
        self, 
        db: Session, 
        run_id: int, 
        user_id: str
    ) -> ScanRun:
        """Cancel a running scan"""
        try:
            run = await self.get_scan_run(db, run_id, user_id)
            
            if run.status not in [ScanStatus.PENDING, ScanStatus.RUNNING]:
                raise BusinessLogicError("Can only cancel pending or running scans")
            
            run.status = ScanStatus.CANCELLED
            run.completed_at = datetime.now()
            run.duration_seconds = int((run.completed_at - run.started_at).total_seconds())
            
            # Add cancellation log
            cancellation_log = ScanLog(
                scan_run_id=run_id,
                level="warning",
                message="Scan cancelled by user",
                details={"cancelled_by": user_id, "cancelled_at": datetime.now().isoformat()}
            )
            db.add(cancellation_log)
            
            db.add(run)
            db.commit()
            db.refresh(run)
            
            # Audit log
            await self.audit_service.log_action(
                db, user_id, "scan_run_cancelled", 
                f"Cancelled scan run: {run.name}",
                {"scan_run_id": run_id}
            )
            
            return run
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error cancelling scan run: {str(e)}")
            raise
    
    # Scan Results and Analytics
    async def get_scan_results(
        self, 
        db: Session, 
        run_id: int, 
        user_id: str
    ) -> Dict[str, Any]:
        """Get comprehensive scan results"""
        try:
            run = await self.get_scan_run(db, run_id, user_id)
            
            # Get scan result
            result = db.exec(
                select(ScanResult).where(ScanResult.scan_run_id == run_id)
            ).first()
            
            # Get discovered entities
            entities = db.exec(
                select(DiscoveredEntity).where(DiscoveredEntity.scan_run_id == run_id)
            ).all()
            
            # Get scan issues
            issues = db.exec(
                select(ScanIssue).where(ScanIssue.scan_run_id == run_id)
            ).all()
            
            # Get scan logs
            logs = db.exec(
                select(ScanLog).where(ScanLog.scan_run_id == run_id)
                .order_by(desc(ScanLog.timestamp))
            ).all()
            
            return {
                "scan_run": run,
                "scan_result": result,
                "discovered_entities": entities,
                "scan_issues": issues,
                "scan_logs": logs
            }
            
        except Exception as e:
            logger.error(f"Error getting scan results: {str(e)}")
            raise
    
    async def get_scan_analytics(
        self, 
        db: Session, 
        user_id: str,
        data_source_id: Optional[int] = None,
        period: str = "daily",
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get scan analytics and metrics"""
        try:
            if not start_date:
                start_date = datetime.now() - timedelta(days=30)
            if not end_date:
                end_date = datetime.now()
            
            # Get scan runs in period
            runs_query = select(ScanRun).where(
                and_(
                    ScanRun.created_at >= start_date,
                    ScanRun.created_at <= end_date
                )
            )
            
            if data_source_id:
                runs_query = runs_query.join(ScanConfiguration).where(
                    ScanConfiguration.data_source_id == data_source_id
                )
            
            runs = db.exec(runs_query).all()
            
            # Calculate metrics
            total_runs = len(runs)
            successful_runs = len([r for r in runs if r.status == ScanStatus.COMPLETED])
            failed_runs = len([r for r in runs if r.status == ScanStatus.FAILED])
            running_runs = len([r for r in runs if r.status == ScanStatus.RUNNING])
            
            total_entities = sum(r.entities_scanned for r in runs)
            total_issues = sum(r.issues_found for r in runs)
            
            avg_duration = 0
            if successful_runs > 0:
                durations = [r.duration_seconds for r in runs if r.duration_seconds]
                avg_duration = sum(durations) / len(durations) if durations else 0
            
            # Get issue breakdown
            issues_query = select(ScanIssue).where(
                and_(
                    ScanIssue.created_at >= start_date,
                    ScanIssue.created_at <= end_date
                )
            )
            if data_source_id:
                issues_query = issues_query.join(ScanRun).join(ScanConfiguration).where(
                    ScanConfiguration.data_source_id == data_source_id
                )
            
            issues = db.exec(issues_query).all()
            
            issue_breakdown = {
                "critical": len([i for i in issues if i.severity == IssueSeverity.CRITICAL]),
                "high": len([i for i in issues if i.severity == IssueSeverity.HIGH]),
                "medium": len([i for i in issues if i.severity == IssueSeverity.MEDIUM]),
                "low": len([i for i in issues if i.severity == IssueSeverity.LOW])
            }
            
            return {
                "period": {
                    "start_date": start_date,
                    "end_date": end_date,
                    "period_type": period
                },
                "metrics": {
                    "total_runs": total_runs,
                    "successful_runs": successful_runs,
                    "failed_runs": failed_runs,
                    "running_runs": running_runs,
                    "success_rate": (successful_runs / total_runs * 100) if total_runs > 0 else 0,
                    "total_entities_scanned": total_entities,
                    "total_issues_found": total_issues,
                    "avg_duration_seconds": avg_duration
                },
                "issue_breakdown": issue_breakdown,
                "recent_runs": runs[:10]  # Last 10 runs
            }
            
        except Exception as e:
            logger.error(f"Error getting scan analytics: {str(e)}")
            raise
    
    # Schedule Management
    async def _create_scan_schedule(
        self, 
        db: Session, 
        config: ScanConfiguration, 
        user_id: str
    ) -> ScanSchedule:
        """Create a scan schedule for a configuration"""
        try:
            # Validate cron expression
            if not croniter.is_valid(config.schedule_cron):
                raise ValidationError("Invalid cron expression")
            
            # Calculate next run
            cron = croniter(config.schedule_cron, datetime.now())
            next_run = cron.get_next(datetime)
            
            schedule = ScanSchedule(
                scan_config_id=config.id,
                name=f"Schedule for {config.name}",
                description=f"Automated schedule for {config.name}",
                cron_expression=config.schedule_cron,
                timezone=config.schedule_timezone,
                is_enabled=config.schedule_enabled,
                next_run=next_run,
                created_by=user_id,
                updated_by=user_id
            )
            
            db.add(schedule)
            db.commit()
            db.refresh(schedule)
            
            return schedule
            
        except Exception as e:
            logger.error(f"Error creating scan schedule: {str(e)}")
            raise
    
    async def _update_scan_schedule(
        self, 
        db: Session, 
        config: ScanConfiguration, 
        user_id: str
    ) -> Optional[ScanSchedule]:
        """Update scan schedule for a configuration"""
        try:
            schedule = db.exec(
                select(ScanSchedule).where(ScanSchedule.scan_config_id == config.id)
            ).first()
            
            if config.schedule_enabled and config.schedule_cron:
                if schedule:
                    # Update existing schedule
                    schedule.cron_expression = config.schedule_cron
                    schedule.timezone = config.schedule_timezone
                    schedule.is_enabled = config.schedule_enabled
                    schedule.updated_at = datetime.now()
                    schedule.updated_by = user_id
                    
                    # Recalculate next run
                    cron = croniter(config.schedule_cron, datetime.now())
                    schedule.next_run = cron.get_next(datetime)
                    
                    db.add(schedule)
                else:
                    # Create new schedule
                    schedule = await self._create_scan_schedule(db, config, user_id)
            else:
                # Disable schedule
                if schedule:
                    schedule.is_enabled = False
                    schedule.updated_at = datetime.now()
                    schedule.updated_by = user_id
                    db.add(schedule)
            
            db.commit()
            return schedule
            
        except Exception as e:
            logger.error(f"Error updating scan schedule: {str(e)}")
            raise
    
    # Scan Execution
    async def _execute_scan(
        self, 
        db: Session, 
        scan_run: ScanRun, 
        config: ScanConfiguration
    ):
        """Execute a scan in the background"""
        try:
            # Update status to running
            scan_run.status = ScanStatus.RUNNING
            scan_run.started_at = datetime.now()
            db.add(scan_run)
            db.commit()
            
            # Add start log
            start_log = ScanLog(
                scan_run_id=scan_run.id,
                level="info",
                message="Scan execution started",
                step_name="scan_start"
            )
            db.add(start_log)
            db.commit()
            
            # Simulate scan execution (replace with actual scan logic)
            await self._simulate_scan_execution(db, scan_run, config)
            
            # Update status to completed
            scan_run.status = ScanStatus.COMPLETED
            scan_run.completed_at = datetime.now()
            scan_run.duration_seconds = int((scan_run.completed_at - scan_run.started_at).total_seconds())
            scan_run.progress_percentage = 100.0
            
            db.add(scan_run)
            db.commit()
            
            # Add completion log
            completion_log = ScanLog(
                scan_run_id=scan_run.id,
                level="info",
                message="Scan execution completed successfully",
                step_name="scan_complete"
            )
            db.add(completion_log)
            db.commit()
            
            # Send notification
            await self.notification_service.send_notification(
                db, 
                scan_run.created_by,
                "scan_completed",
                f"Scan '{scan_run.name}' completed successfully",
                {"scan_run_id": scan_run.id}
            )
            
        except Exception as e:
            # Update status to failed
            scan_run.status = ScanStatus.FAILED
            scan_run.completed_at = datetime.now()
            scan_run.duration_seconds = int((scan_run.completed_at - scan_run.started_at).total_seconds())
            scan_run.error_message = str(e)
            
            db.add(scan_run)
            db.commit()
            
            # Add error log
            error_log = ScanLog(
                scan_run_id=scan_run.id,
                level="error",
                message=f"Scan execution failed: {str(e)}",
                step_name="scan_error"
            )
            db.add(error_log)
            db.commit()
            
            logger.error(f"Scan execution failed: {str(e)}")
    
    async def _simulate_scan_execution(
        self, 
        db: Session, 
        scan_run: ScanRun, 
        config: ScanConfiguration
    ):
        """Simulate scan execution (replace with actual scan logic)"""
        try:
            # Simulate progress updates
            for i in range(1, 11):
                await asyncio.sleep(1)  # Simulate work
                
                # Update progress
                scan_run.progress_percentage = i * 10
                scan_run.entities_scanned = i * 100
                scan_run.entities_total = 1000
                db.add(scan_run)
                db.commit()
                
                # Add progress log
                progress_log = ScanLog(
                    scan_run_id=scan_run.id,
                    level="info",
                    message=f"Scan progress: {i * 10}% complete",
                    step_name="scan_progress"
                )
                db.add(progress_log)
                db.commit()
            
            # Simulate discovered entities
            entities = [
                DiscoveredEntity(
                    scan_run_id=scan_run.id,
                    entity_id=f"entity_{i}",
                    name=f"Table_{i}",
                    type=EntityType.TABLE,
                    path=f"database.schema.table_{i}",
                    data_source=config.data_source_id,
                    schema_name="schema",
                    table_name=f"table_{i}",
                    row_count=1000 + i * 100,
                    size_bytes=1024 * 1024 * (i + 1),
                    quality_score=85.0 + i,
                    classifications=["business_data"],
                    pii_tags=[] if i % 3 != 0 else ["email", "phone"]
                )
                for i in range(1, 21)
            ]
            
            for entity in entities:
                db.add(entity)
            db.commit()
            
            # Simulate scan issues
            issues = [
                ScanIssue(
                    scan_run_id=scan_run.id,
                    severity=IssueSeverity.MEDIUM if i % 3 == 0 else IssueSeverity.LOW,
                    type=IssueType.DATA_QUALITY if i % 2 == 0 else IssueType.SECURITY,
                    title=f"Issue {i}",
                    description=f"Description for issue {i}",
                    entity_name=f"Table_{i}",
                    entity_type="table",
                    entity_path=f"database.schema.table_{i}",
                    recommendation=f"Recommendation for issue {i}",
                    impact="Medium",
                    effort="Low"
                )
                for i in range(1, 6)
            ]
            
            for issue in issues:
                db.add(issue)
            db.commit()
            
            # Update final metrics
            scan_run.entities_discovered = len(entities)
            scan_run.issues_found = len(issues)
            scan_run.classifications_applied = len([e for e in entities if e.classifications])
            scan_run.pii_detected = len([e for e in entities if e.pii_tags])
            
            db.add(scan_run)
            db.commit()
            
        except Exception as e:
            logger.error(f"Error in scan simulation: {str(e)}")
            raise
    
    # Utility Methods
    async def get_scan_statistics(
        self, 
        db: Session, 
        user_id: str
    ) -> Dict[str, Any]:
        """Get overall scan statistics"""
        try:
            # Get total configurations
            total_configs = db.exec(select(func.count(ScanConfiguration.id))).first()
            active_configs = db.exec(
                select(func.count(ScanConfiguration.id)).where(ScanConfiguration.status == "active")
            ).first()
            
            # Get running scans
            running_scans = db.exec(
                select(func.count(ScanRun.id)).where(ScanRun.status == ScanStatus.RUNNING)
            ).first()
            
            # Get recent issues
            recent_issues = db.exec(
                select(func.count(ScanIssue.id)).where(
                    ScanIssue.created_at >= datetime.now() - timedelta(days=7)
                )
            ).first()
            
            # Get success rate
            total_runs = db.exec(select(func.count(ScanRun.id))).first()
            successful_runs = db.exec(
                select(func.count(ScanRun.id)).where(ScanRun.status == ScanStatus.COMPLETED)
            ).first()
            
            success_rate = (successful_runs / total_runs * 100) if total_runs > 0 else 0
            
            return {
                "total_configurations": total_configs,
                "active_configurations": active_configs,
                "running_scans": running_scans,
                "recent_issues": recent_issues,
                "success_rate": round(success_rate, 2)
            }
            
        except Exception as e:
            logger.error(f"Error getting scan statistics: {str(e)}")
            raise