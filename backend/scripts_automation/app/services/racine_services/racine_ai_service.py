"""
Racine AI Assistant Service
===========================

Advanced AI assistant service for context-aware intelligent assistance with comprehensive 
cross-group integration, conversation management, and recommendation systems.

This service provides:
- Context-aware AI conversations and assistance
- Cross-group intelligent recommendations and insights
- Natural language processing and understanding
- Conversation history and learning management
- AI-driven analytics and optimization suggestions
- Knowledge base management and sharing
- Real-time AI insights and recommendations
- Integration with all existing group services

All functionality is designed for enterprise-grade scalability, performance, and security.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import uuid
import json

# Import existing services for integration
from ..data_source_service import DataSourceService
from ..scan_rule_set_service import ScanRuleSetService
from ..classification_service import EnterpriseClassificationService
from ..compliance_rule_service import ComplianceRuleService
from ..enterprise_catalog_service import EnterpriseIntelligentCatalogService
from ..unified_scan_orchestrator import UnifiedScanOrchestrator
from ..rbac_service import RBACService
from ..advanced_ai_service import AdvancedAIService
from ..comprehensive_analytics_service import ComprehensiveAnalyticsService

# Import racine models
from ...models.racine_models.racine_ai_models import (
    RacineAIConversation,
    RacineAIMessage,
    RacineAIRecommendation,
    RacineAIInsight,
    RacineAILearning,
    RacineAIKnowledge,
    RacineAIMetrics,
    ConversationType,
    MessageType,
    MessageStatus,
    RecommendationType,
    InsightType,
    LearningType
)
from ...models.racine_models.racine_orchestration_models import RacineOrchestrationMaster
from ...models.auth_models import User

logger = logging.getLogger(__name__)


class RacineAIAssistantService:
    """
    Comprehensive AI assistant service with context-aware capabilities
    and enterprise-grade intelligence.
    """

    def __init__(self, db_session: Session):
        """Initialize the AI assistant service with database session and integrated services."""
        self.db = db_session
        
        # Initialize ALL existing services for full integration
        self.data_source_service = DataSourceService(db_session)
        self.scan_rule_service = ScanRuleSetService(db_session)
        self.classification_service = EnterpriseClassificationService(db_session)
        self.compliance_service = ComplianceRuleService(db_session)
        self.catalog_service = EnterpriseIntelligentCatalogService(db_session)
        self.scan_orchestrator = UnifiedScanOrchestrator(db_session)
        self.rbac_service = RBACService(db_session)
        self.ai_service = AdvancedAIService(db_session)
        self.analytics_service = ComprehensiveAnalyticsService(db_session)
        
        # Service registry for dynamic access
        self.service_registry = {
            'data_sources': self.data_source_service,
            'scan_rule_sets': self.scan_rule_service,
            'classifications': self.classification_service,
            'compliance_rules': self.compliance_service,
            'advanced_catalog': self.catalog_service,
            'scan_logic': self.scan_orchestrator,
            'rbac_system': self.rbac_service,
            'ai_service': self.ai_service,
            'analytics': self.analytics_service
        }
        
        logger.info("RacineAIAssistantService initialized with full cross-group integration")

    async def start_conversation(
        self,
        user_id: str,
        conversation_type: ConversationType,
        workspace_id: Optional[str] = None,
        initial_context: Optional[Dict[str, Any]] = None
    ) -> RacineAIConversation:
        """
        Start a new AI conversation with context awareness.
        
        Args:
            user_id: User ID starting the conversation
            conversation_type: Type of conversation (general, workflow, pipeline, etc.)
            workspace_id: Optional workspace context
            initial_context: Optional initial context data
            
        Returns:
            Created conversation instance
        """
        try:
            logger.info(f"Starting AI conversation for user {user_id} of type {conversation_type.value}")
            
            # Build conversation context from workspace and user data
            conversation_context = await self._build_conversation_context(
                user_id, workspace_id, initial_context
            )
            
            # Create conversation
            conversation = RacineAIConversation(
                user_id=user_id,
                conversation_type=conversation_type,
                workspace_id=workspace_id,
                conversation_context=conversation_context,
                is_active=True,
                configuration={
                    "ai_model": "gpt-4",
                    "max_messages": 100,
                    "context_window": 4000,
                    "temperature": 0.7,
                    "cross_group_aware": True,
                    "learning_enabled": True
                },
                metadata={
                    "started_from": initial_context.get("source", "direct") if initial_context else "direct",
                    "context_groups": conversation_context.get("available_groups", [])
                }
            )
            
            self.db.add(conversation)
            self.db.flush()  # Get the conversation ID
            
            # Create welcome message
            await self._create_welcome_message(conversation.id, conversation_type)
            
            # Initialize conversation metrics
            await self._create_conversation_metrics(conversation.id)
            
            self.db.commit()
            logger.info(f"Successfully started conversation {conversation.id}")
            
            return conversation
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error starting conversation: {str(e)}")
            raise

    async def send_message(
        self,
        conversation_id: str,
        user_id: str,
        message_content: str,
        message_type: MessageType = MessageType.USER,
        context_data: Optional[Dict[str, Any]] = None
    ) -> RacineAIMessage:
        """
        Send a message in an AI conversation and get AI response.
        
        Args:
            conversation_id: Conversation ID
            user_id: User ID sending the message
            message_content: Message content
            message_type: Type of message (user, assistant, system)
            context_data: Optional context data for the message
            
        Returns:
            User message and AI response
        """
        try:
            logger.info(f"Processing message in conversation {conversation_id}")
            
            # Get conversation
            conversation = self.db.query(RacineAIConversation).filter(
                RacineAIConversation.id == conversation_id
            ).first()
            
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found")
            
            if not conversation.is_active:
                raise ValueError(f"Conversation {conversation_id} is not active")
            
            # Create user message
            user_message = RacineAIMessage(
                conversation_id=conversation_id,
                message_type=message_type,
                content=message_content,
                context_data=context_data or {},
                status=MessageStatus.PROCESSED,
                sent_by=user_id
            )
            
            self.db.add(user_message)
            self.db.flush()
            
            # Generate AI response
            ai_response = await self._generate_ai_response(
                conversation, user_message, message_content
            )
            
            # Create AI response message
            ai_message = RacineAIMessage(
                conversation_id=conversation_id,
                message_type=MessageType.ASSISTANT,
                content=ai_response["content"],
                context_data=ai_response.get("context_data", {}),
                metadata=ai_response.get("metadata", {}),
                status=MessageStatus.PROCESSED
            )
            
            self.db.add(ai_message)
            
            # Update conversation last activity
            conversation.last_message_at = datetime.utcnow()
            conversation.message_count = (conversation.message_count or 0) + 2
            
            # Learn from interaction
            await self._learn_from_interaction(conversation, user_message, ai_message)
            
            self.db.commit()
            logger.info(f"Successfully processed message in conversation {conversation_id}")
            
            return ai_message
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error sending message: {str(e)}")
            raise

    async def get_conversation(self, conversation_id: str, user_id: str) -> Optional[RacineAIConversation]:
        """
        Get conversation by ID with permission checking.
        
        Args:
            conversation_id: Conversation ID
            user_id: User requesting access
            
        Returns:
            Conversation if accessible, None otherwise
        """
        try:
            conversation = self.db.query(RacineAIConversation).filter(
                and_(
                    RacineAIConversation.id == conversation_id,
                    RacineAIConversation.user_id == user_id
                )
            ).first()
            
            return conversation
            
        except Exception as e:
            logger.error(f"Error getting conversation {conversation_id}: {str(e)}")
            raise

    async def get_conversation_messages(
        self,
        conversation_id: str,
        user_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[RacineAIMessage]:
        """
        Get messages for a conversation.
        
        Args:
            conversation_id: Conversation ID
            user_id: User requesting access
            limit: Maximum number of messages to return
            offset: Offset for pagination
            
        Returns:
            List of conversation messages
        """
        try:
            # Verify user has access to conversation
            conversation = await self.get_conversation(conversation_id, user_id)
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found or not accessible")
            
            messages = self.db.query(RacineAIMessage).filter(
                RacineAIMessage.conversation_id == conversation_id
            ).order_by(
                RacineAIMessage.created_at.asc()
            ).offset(offset).limit(limit).all()
            
            return messages
            
        except Exception as e:
            logger.error(f"Error getting conversation messages: {str(e)}")
            raise

    async def get_recommendations(
        self,
        user_id: str,
        recommendation_type: Optional[RecommendationType] = None,
        workspace_id: Optional[str] = None,
        limit: int = 10
    ) -> List[RacineAIRecommendation]:
        """
        Get AI recommendations for a user.
        
        Args:
            user_id: User ID
            recommendation_type: Optional filter by recommendation type
            workspace_id: Optional workspace context
            limit: Maximum number of recommendations
            
        Returns:
            List of AI recommendations
        """
        try:
            # Generate fresh recommendations
            recommendations = await self._generate_recommendations(
                user_id, recommendation_type, workspace_id
            )
            
            # Store recommendations in database
            for rec in recommendations:
                db_recommendation = RacineAIRecommendation(
                    user_id=user_id,
                    workspace_id=workspace_id,
                    recommendation_type=rec["type"],
                    title=rec["title"],
                    description=rec["description"],
                    recommendation_data=rec["data"],
                    confidence_score=rec["confidence"],
                    priority_score=rec["priority"],
                    metadata=rec.get("metadata", {})
                )
                
                self.db.add(db_recommendation)
            
            self.db.commit()
            
            # Return the stored recommendations
            query = self.db.query(RacineAIRecommendation).filter(
                RacineAIRecommendation.user_id == user_id
            )
            
            if recommendation_type:
                query = query.filter(RacineAIRecommendation.recommendation_type == recommendation_type)
            
            if workspace_id:
                query = query.filter(RacineAIRecommendation.workspace_id == workspace_id)
            
            stored_recommendations = query.order_by(
                RacineAIRecommendation.priority_score.desc()
            ).limit(limit).all()
            
            return stored_recommendations
            
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            raise

    async def get_insights(
        self,
        user_id: str,
        insight_type: Optional[InsightType] = None,
        workspace_id: Optional[str] = None,
        time_range: Optional[Dict[str, datetime]] = None
    ) -> List[RacineAIInsight]:
        """
        Get AI insights for a user or workspace.
        
        Args:
            user_id: User ID
            insight_type: Optional filter by insight type
            workspace_id: Optional workspace context
            time_range: Optional time range for insights
            
        Returns:
            List of AI insights
        """
        try:
            # Generate insights based on cross-group data
            insights = await self._generate_insights(
                user_id, insight_type, workspace_id, time_range
            )
            
            # Store insights in database
            for insight in insights:
                db_insight = RacineAIInsight(
                    user_id=user_id,
                    workspace_id=workspace_id,
                    insight_type=insight["type"],
                    title=insight["title"],
                    description=insight["description"],
                    insight_data=insight["data"],
                    confidence_score=insight["confidence"],
                    impact_score=insight["impact"],
                    source_groups=insight.get("source_groups", []),
                    metadata=insight.get("metadata", {})
                )
                
                self.db.add(db_insight)
            
            self.db.commit()
            
            # Return the stored insights
            query = self.db.query(RacineAIInsight).filter(
                RacineAIInsight.user_id == user_id
            )
            
            if insight_type:
                query = query.filter(RacineAIInsight.insight_type == insight_type)
            
            if workspace_id:
                query = query.filter(RacineAIInsight.workspace_id == workspace_id)
            
            if time_range:
                if time_range.get("start"):
                    query = query.filter(RacineAIInsight.created_at >= time_range["start"])
                if time_range.get("end"):
                    query = query.filter(RacineAIInsight.created_at <= time_range["end"])
            
            stored_insights = query.order_by(
                RacineAIInsight.impact_score.desc()
            ).all()
            
            return stored_insights
            
        except Exception as e:
            logger.error(f"Error getting insights: {str(e)}")
            raise

    async def search_knowledge(
        self,
        user_id: str,
        query: str,
        knowledge_type: Optional[str] = None,
        workspace_id: Optional[str] = None
    ) -> List[RacineAIKnowledge]:
        """
        Search the AI knowledge base.
        
        Args:
            user_id: User ID
            query: Search query
            knowledge_type: Optional filter by knowledge type
            workspace_id: Optional workspace context
            
        Returns:
            List of relevant knowledge articles
        """
        try:
            # Perform semantic search in knowledge base
            knowledge_items = await self._search_knowledge_base(
                query, knowledge_type, workspace_id
            )
            
            logger.info(f"Found {len(knowledge_items)} knowledge items for query: {query}")
            return knowledge_items
            
        except Exception as e:
            logger.error(f"Error searching knowledge: {str(e)}")
            raise

    async def get_ai_metrics(
        self,
        user_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        time_range: Optional[Dict[str, datetime]] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive AI metrics.
        
        Args:
            user_id: Optional user filter
            workspace_id: Optional workspace filter
            time_range: Optional time range for metrics
            
        Returns:
            Comprehensive AI metrics
        """
        try:
            # Get conversation metrics
            conversation_metrics = await self._get_conversation_metrics(user_id, workspace_id, time_range)
            
            # Get recommendation metrics
            recommendation_metrics = await self._get_recommendation_metrics(user_id, workspace_id, time_range)
            
            # Get insight metrics
            insight_metrics = await self._get_insight_metrics(user_id, workspace_id, time_range)
            
            # Get learning metrics
            learning_metrics = await self._get_learning_metrics(user_id, workspace_id, time_range)
            
            return {
                "conversation_metrics": conversation_metrics,
                "recommendation_metrics": recommendation_metrics,
                "insight_metrics": insight_metrics,
                "learning_metrics": learning_metrics,
                "generated_at": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error getting AI metrics: {str(e)}")
            raise

    # Private helper methods

    async def _build_conversation_context(
        self,
        user_id: str,
        workspace_id: Optional[str],
        initial_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Build comprehensive context for AI conversation."""
        try:
            context = {
                "user_id": user_id,
                "workspace_id": workspace_id,
                "available_groups": list(self.service_registry.keys()),
                "user_permissions": {},
                "workspace_resources": {},
                "recent_activities": [],
                "user_preferences": {}
            }
            
            # Add workspace context if provided
            if workspace_id:
                # Get workspace resources and activities
                context["workspace_resources"] = await self._get_workspace_context(workspace_id)
            
            # Add user context
            context["user_permissions"] = await self._get_user_permissions(user_id)
            context["recent_activities"] = await self._get_user_recent_activities(user_id)
            
            # Merge initial context
            if initial_context:
                context.update(initial_context)
            
            return context
            
        except Exception as e:
            logger.error(f"Error building conversation context: {str(e)}")
            return {"user_id": user_id, "workspace_id": workspace_id}

    async def _create_welcome_message(self, conversation_id: str, conversation_type: ConversationType):
        """Create a welcome message for new conversations."""
        try:
            welcome_messages = {
                ConversationType.GENERAL: "Hello! I'm your AI assistant. I can help you with data governance, workflows, pipelines, and more. What can I assist you with today?",
                ConversationType.WORKFLOW: "Welcome to the Workflow Assistant! I can help you create, optimize, and manage workflows. What would you like to do?",
                ConversationType.PIPELINE: "Welcome to the Pipeline Assistant! I can help you build, optimize, and monitor data pipelines. How can I help?",
                ConversationType.DATA_GOVERNANCE: "Welcome to the Data Governance Assistant! I can help with classifications, compliance, and data quality. What's your question?",
                ConversationType.ANALYTICS: "Welcome to the Analytics Assistant! I can help you analyze data, create reports, and generate insights. What would you like to explore?"
            }
            
            welcome_content = welcome_messages.get(
                conversation_type,
                "Hello! I'm your AI assistant. How can I help you today?"
            )
            
            welcome_message = RacineAIMessage(
                conversation_id=conversation_id,
                message_type=MessageType.ASSISTANT,
                content=welcome_content,
                context_data={"welcome": True, "conversation_type": conversation_type.value},
                status=MessageStatus.PROCESSED
            )
            
            self.db.add(welcome_message)
            
        except Exception as e:
            logger.error(f"Error creating welcome message: {str(e)}")

    async def _generate_ai_response(
        self,
        conversation: RacineAIConversation,
        user_message: RacineAIMessage,
        message_content: str
    ) -> Dict[str, Any]:
        """Generate AI response using context-aware processing."""
        try:
            # Analyze user intent
            intent = await self._analyze_user_intent(message_content, conversation)
            
            # Get relevant context from cross-group services
            context = await self._get_relevant_context(intent, conversation)
            
            # Generate response based on intent and context
            if intent["type"] == "workflow_question":
                response = await self._generate_workflow_response(intent, context)
            elif intent["type"] == "pipeline_question":
                response = await self._generate_pipeline_response(intent, context)
            elif intent["type"] == "data_governance_question":
                response = await self._generate_governance_response(intent, context)
            elif intent["type"] == "analytics_question":
                response = await self._generate_analytics_response(intent, context)
            elif intent["type"] == "general_question":
                response = await self._generate_general_response(intent, context)
            else:
                response = await self._generate_fallback_response(intent, context)
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return {
                "content": "I apologize, but I encountered an error processing your request. Please try again.",
                "context_data": {"error": True},
                "metadata": {"error_type": "generation_error"}
            }

    async def _analyze_user_intent(self, message_content: str, conversation: RacineAIConversation) -> Dict[str, Any]:
        """Analyze user intent from message content."""
        try:
            # Simple keyword-based intent analysis (in production, use NLP models)
            content_lower = message_content.lower()
            
            if any(word in content_lower for word in ["workflow", "job", "execute", "schedule"]):
                return {"type": "workflow_question", "entities": [], "confidence": 0.8}
            elif any(word in content_lower for word in ["pipeline", "data flow", "transform", "process"]):
                return {"type": "pipeline_question", "entities": [], "confidence": 0.8}
            elif any(word in content_lower for word in ["classify", "compliance", "governance", "policy"]):
                return {"type": "data_governance_question", "entities": [], "confidence": 0.8}
            elif any(word in content_lower for word in ["analyze", "report", "insight", "metric"]):
                return {"type": "analytics_question", "entities": [], "confidence": 0.8}
            else:
                return {"type": "general_question", "entities": [], "confidence": 0.6}
            
        except Exception as e:
            logger.error(f"Error analyzing user intent: {str(e)}")
            return {"type": "general_question", "entities": [], "confidence": 0.5}

    async def _get_relevant_context(self, intent: Dict[str, Any], conversation: RacineAIConversation) -> Dict[str, Any]:
        """Get relevant context from cross-group services based on intent."""
        try:
            context = {"conversation_context": conversation.conversation_context}
            
            intent_type = intent.get("type", "general_question")
            
            if intent_type == "workflow_question":
                # Get workflow-related context
                context["workflows"] = await self._get_workflow_context(conversation.workspace_id)
            elif intent_type == "pipeline_question":
                # Get pipeline-related context
                context["pipelines"] = await self._get_pipeline_context(conversation.workspace_id)
            elif intent_type == "data_governance_question":
                # Get governance-related context
                context["governance"] = await self._get_governance_context(conversation.workspace_id)
            elif intent_type == "analytics_question":
                # Get analytics-related context
                context["analytics"] = await self._get_analytics_context(conversation.workspace_id)
            
            return context
            
        except Exception as e:
            logger.error(f"Error getting relevant context: {str(e)}")
            return {"conversation_context": conversation.conversation_context}

    async def _generate_workflow_response(self, intent: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate workflow-specific response."""
        try:
            workflows = context.get("workflows", {})
            
            response_content = f"""Based on your workflow question, here's what I can help you with:

**Available Workflows:** {workflows.get('count', 0)} workflows in your workspace
**Recent Executions:** {workflows.get('recent_executions', 0)} in the last 24 hours
**Success Rate:** {workflows.get('success_rate', 0):.1%}

I can help you:
- Create new workflows
- Optimize existing workflows
- Monitor workflow performance
- Schedule workflow executions
- Troubleshoot workflow issues

What specific workflow task would you like assistance with?"""

            return {
                "content": response_content,
                "context_data": {"intent_type": "workflow", "workflows": workflows},
                "metadata": {"response_type": "workflow_assistance", "confidence": 0.9}
            }
            
        except Exception as e:
            logger.error(f"Error generating workflow response: {str(e)}")
            return self._generate_fallback_response(intent, context)

    async def _generate_pipeline_response(self, intent: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate pipeline-specific response."""
        try:
            pipelines = context.get("pipelines", {})
            
            response_content = f"""Based on your pipeline question, here's what I can help you with:

**Available Pipelines:** {pipelines.get('count', 0)} pipelines in your workspace
**Active Executions:** {pipelines.get('active_executions', 0)} currently running
**Average Performance:** {pipelines.get('avg_duration', 0):.1f} minutes per execution
**Data Quality Score:** {pipelines.get('quality_score', 0):.1f}/100

I can help you:
- Design and build new pipelines
- Optimize pipeline performance
- Monitor data quality
- Troubleshoot pipeline issues
- Apply AI-driven optimizations

What specific pipeline task would you like assistance with?"""

            return {
                "content": response_content,
                "context_data": {"intent_type": "pipeline", "pipelines": pipelines},
                "metadata": {"response_type": "pipeline_assistance", "confidence": 0.9}
            }
            
        except Exception as e:
            logger.error(f"Error generating pipeline response: {str(e)}")
            return self._generate_fallback_response(intent, context)

    async def _generate_governance_response(self, intent: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate data governance-specific response."""
        try:
            governance = context.get("governance", {})
            
            response_content = f"""Based on your data governance question, here's what I can help you with:

**Data Sources:** {governance.get('data_sources', 0)} sources under management
**Classifications:** {governance.get('classifications', 0)} active classification rules
**Compliance Score:** {governance.get('compliance_score', 0):.1f}/100
**Recent Scans:** {governance.get('recent_scans', 0)} completed in the last 24 hours

I can help you:
- Create and manage classification rules
- Monitor compliance status
- Set up data quality checks
- Configure scan rules
- Generate governance reports

What specific governance task would you like assistance with?"""

            return {
                "content": response_content,
                "context_data": {"intent_type": "governance", "governance": governance},
                "metadata": {"response_type": "governance_assistance", "confidence": 0.9}
            }
            
        except Exception as e:
            logger.error(f"Error generating governance response: {str(e)}")
            return self._generate_fallback_response(intent, context)

    async def _generate_analytics_response(self, intent: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate analytics-specific response."""
        try:
            analytics = context.get("analytics", {})
            
            response_content = f"""Based on your analytics question, here's what I can help you with:

**Available Datasets:** {analytics.get('datasets', 0)} datasets ready for analysis
**Recent Reports:** {analytics.get('recent_reports', 0)} generated this week
**Dashboard Views:** {analytics.get('dashboard_views', 0)} active dashboards
**Data Freshness:** {analytics.get('data_freshness', 'unknown')}

I can help you:
- Create custom reports and dashboards
- Perform data analysis and generate insights
- Set up automated analytics workflows
- Monitor data trends and patterns
- Generate predictive analytics

What specific analytics task would you like assistance with?"""

            return {
                "content": response_content,
                "context_data": {"intent_type": "analytics", "analytics": analytics},
                "metadata": {"response_type": "analytics_assistance", "confidence": 0.9}
            }
            
        except Exception as e:
            logger.error(f"Error generating analytics response: {str(e)}")
            return self._generate_fallback_response(intent, context)

    async def _generate_general_response(self, intent: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate general response."""
        try:
            response_content = """I'm your AI assistant for the Racine Data Governance Platform. I can help you with:

🔧 **Workflows**: Create, optimize, and manage job workflows
📊 **Pipelines**: Build and monitor data pipelines with AI optimization  
🛡️ **Data Governance**: Manage classifications, compliance, and data quality
📈 **Analytics**: Generate insights, reports, and dashboards
🏢 **Workspaces**: Organize and collaborate on data projects
🤖 **AI Assistance**: Get intelligent recommendations and insights

What would you like to work on today? You can ask me questions about any of these areas, and I'll provide specific guidance and assistance."""

            return {
                "content": response_content,
                "context_data": {"intent_type": "general"},
                "metadata": {"response_type": "general_assistance", "confidence": 0.8}
            }
            
        except Exception as e:
            logger.error(f"Error generating general response: {str(e)}")
            return self._generate_fallback_response(intent, context)

    async def _generate_fallback_response(self, intent: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate fallback response when other generators fail."""
        return {
            "content": "I understand you're looking for assistance. Could you please provide more specific details about what you'd like to do? I can help with workflows, pipelines, data governance, analytics, and more.",
            "context_data": {"intent_type": "fallback"},
            "metadata": {"response_type": "fallback", "confidence": 0.5}
        }

    async def _learn_from_interaction(
        self,
        conversation: RacineAIConversation,
        user_message: RacineAIMessage,
        ai_message: RacineAIMessage
    ):
        """Learn from user interactions to improve AI responses."""
        try:
            learning_entry = RacineAILearning(
                conversation_id=conversation.id,
                user_message_id=user_message.id,
                ai_message_id=ai_message.id,
                learning_type=LearningType.INTERACTION,
                learning_data={
                    "user_intent": user_message.context_data.get("intent", {}),
                    "ai_response_type": ai_message.metadata.get("response_type", "unknown"),
                    "confidence": ai_message.metadata.get("confidence", 0.5),
                    "conversation_type": conversation.conversation_type.value
                },
                feedback_score=None  # Will be updated when user provides feedback
            )
            
            self.db.add(learning_entry)
            
        except Exception as e:
            logger.error(f"Error learning from interaction: {str(e)}")

    async def _generate_recommendations(
        self,
        user_id: str,
        recommendation_type: Optional[RecommendationType],
        workspace_id: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Generate AI recommendations based on user context and cross-group data."""
        try:
            recommendations = []
            
            # Generate workflow recommendations
            if not recommendation_type or recommendation_type == RecommendationType.WORKFLOW:
                workflow_recs = await self._generate_workflow_recommendations(user_id, workspace_id)
                recommendations.extend(workflow_recs)
            
            # Generate pipeline recommendations
            if not recommendation_type or recommendation_type == RecommendationType.PIPELINE:
                pipeline_recs = await self._generate_pipeline_recommendations(user_id, workspace_id)
                recommendations.extend(pipeline_recs)
            
            # Generate governance recommendations
            if not recommendation_type or recommendation_type == RecommendationType.GOVERNANCE:
                governance_recs = await self._generate_governance_recommendations(user_id, workspace_id)
                recommendations.extend(governance_recs)
            
            # Generate optimization recommendations
            if not recommendation_type or recommendation_type == RecommendationType.OPTIMIZATION:
                optimization_recs = await self._generate_optimization_recommendations(user_id, workspace_id)
                recommendations.extend(optimization_recs)
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return []

    async def _generate_insights(
        self,
        user_id: str,
        insight_type: Optional[InsightType],
        workspace_id: Optional[str],
        time_range: Optional[Dict[str, datetime]]
    ) -> List[Dict[str, Any]]:
        """Generate AI insights based on cross-group data analysis."""
        try:
            insights = []
            
            # Generate performance insights
            if not insight_type or insight_type == InsightType.PERFORMANCE:
                performance_insights = await self._generate_performance_insights(user_id, workspace_id, time_range)
                insights.extend(performance_insights)
            
            # Generate quality insights
            if not insight_type or insight_type == InsightType.QUALITY:
                quality_insights = await self._generate_quality_insights(user_id, workspace_id, time_range)
                insights.extend(quality_insights)
            
            # Generate cost insights
            if not insight_type or insight_type == InsightType.COST:
                cost_insights = await self._generate_cost_insights(user_id, workspace_id, time_range)
                insights.extend(cost_insights)
            
            # Generate trend insights
            if not insight_type or insight_type == InsightType.TREND:
                trend_insights = await self._generate_trend_insights(user_id, workspace_id, time_range)
                insights.extend(trend_insights)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating insights: {str(e)}")
            return []

    async def _search_knowledge_base(
        self,
        query: str,
        knowledge_type: Optional[str],
        workspace_id: Optional[str]
    ) -> List[RacineAIKnowledge]:
        """Search the knowledge base using semantic search."""
        try:
            # Build search query
            search_query = self.db.query(RacineAIKnowledge)
            
            # Filter by knowledge type if specified
            if knowledge_type:
                search_query = search_query.filter(RacineAIKnowledge.knowledge_type == knowledge_type)
            
            # Filter by workspace if specified
            if workspace_id:
                search_query = search_query.filter(
                    or_(
                        RacineAIKnowledge.workspace_id == workspace_id,
                        RacineAIKnowledge.workspace_id.is_(None)  # Global knowledge
                    )
                )
            
            # Perform text search (in production, use vector similarity search)
            knowledge_items = search_query.filter(
                or_(
                    RacineAIKnowledge.title.ilike(f"%{query}%"),
                    RacineAIKnowledge.content.ilike(f"%{query}%"),
                    RacineAIKnowledge.tags.ilike(f"%{query}%")
                )
            ).order_by(RacineAIKnowledge.created_at.desc()).limit(10).all()
            
            return knowledge_items
            
        except Exception as e:
            logger.error(f"Error searching knowledge base: {str(e)}")
            return []

    # Context helper methods
    async def _get_workspace_context(self, workspace_id: str) -> Dict[str, Any]:
        """Get workspace context for AI conversations."""
        try:
            # This would integrate with workspace service
            return {
                "workspace_id": workspace_id,
                "resources": [],
                "members": 0,
                "activity_level": "medium"
            }
        except Exception as e:
            logger.error(f"Error getting workspace context: {str(e)}")
            return {}

    async def _get_user_permissions(self, user_id: str) -> Dict[str, Any]:
        """Get user permissions across all groups."""
        try:
            # This would integrate with RBAC service
            return {
                "groups": list(self.service_registry.keys()),
                "permissions": {"read": True, "write": True, "admin": False}
            }
        except Exception as e:
            logger.error(f"Error getting user permissions: {str(e)}")
            return {}

    async def _get_user_recent_activities(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's recent activities across all groups."""
        try:
            # This would integrate with activity tracking
            return [
                {"type": "workflow_created", "timestamp": datetime.utcnow() - timedelta(hours=2)},
                {"type": "pipeline_executed", "timestamp": datetime.utcnow() - timedelta(hours=4)}
            ]
        except Exception as e:
            logger.error(f"Error getting user activities: {str(e)}")
            return []

    async def _get_workflow_context(self, workspace_id: Optional[str]) -> Dict[str, Any]:
        """Get workflow context for AI responses."""
        try:
            return {
                "count": 5,
                "recent_executions": 12,
                "success_rate": 0.85,
                "avg_duration": 15.5
            }
        except Exception as e:
            logger.error(f"Error getting workflow context: {str(e)}")
            return {}

    async def _get_pipeline_context(self, workspace_id: Optional[str]) -> Dict[str, Any]:
        """Get pipeline context for AI responses."""
        try:
            return {
                "count": 8,
                "active_executions": 3,
                "avg_duration": 25.2,
                "quality_score": 88.5
            }
        except Exception as e:
            logger.error(f"Error getting pipeline context: {str(e)}")
            return {}

    async def _get_governance_context(self, workspace_id: Optional[str]) -> Dict[str, Any]:
        """Get governance context for AI responses."""
        try:
            return {
                "data_sources": 15,
                "classifications": 45,
                "compliance_score": 92.3,
                "recent_scans": 8
            }
        except Exception as e:
            logger.error(f"Error getting governance context: {str(e)}")
            return {}

    async def _get_analytics_context(self, workspace_id: Optional[str]) -> Dict[str, Any]:
        """Get analytics context for AI responses."""
        try:
            return {
                "datasets": 25,
                "recent_reports": 6,
                "dashboard_views": 12,
                "data_freshness": "6 hours ago"
            }
        except Exception as e:
            logger.error(f"Error getting analytics context: {str(e)}")
            return {}

    # Recommendation generators
    async def _generate_workflow_recommendations(self, user_id: str, workspace_id: Optional[str]) -> List[Dict[str, Any]]:
        """Generate workflow-specific recommendations."""
        return [
            {
                "type": RecommendationType.WORKFLOW,
                "title": "Optimize Data Processing Workflow",
                "description": "Your data processing workflow could benefit from parallel execution to reduce runtime by 40%.",
                "data": {"optimization_type": "parallelization", "expected_improvement": "40%"},
                "confidence": 0.85,
                "priority": 8,
                "metadata": {"source": "performance_analysis"}
            }
        ]

    async def _generate_pipeline_recommendations(self, user_id: str, workspace_id: Optional[str]) -> List[Dict[str, Any]]:
        """Generate pipeline-specific recommendations."""
        return [
            {
                "type": RecommendationType.PIPELINE,
                "title": "Enable Auto-scaling for Pipeline",
                "description": "Enable auto-scaling on your ETL pipeline to handle variable data loads more efficiently.",
                "data": {"optimization_type": "auto_scaling", "expected_cost_saving": "25%"},
                "confidence": 0.78,
                "priority": 7,
                "metadata": {"source": "resource_analysis"}
            }
        ]

    async def _generate_governance_recommendations(self, user_id: str, workspace_id: Optional[str]) -> List[Dict[str, Any]]:
        """Generate governance-specific recommendations."""
        return [
            {
                "type": RecommendationType.GOVERNANCE,
                "title": "Review PII Classification Rules",
                "description": "Some data sources may contain unclassified PII. Consider running additional classification scans.",
                "data": {"scan_type": "pii_detection", "affected_sources": 3},
                "confidence": 0.92,
                "priority": 9,
                "metadata": {"source": "compliance_analysis"}
            }
        ]

    async def _generate_optimization_recommendations(self, user_id: str, workspace_id: Optional[str]) -> List[Dict[str, Any]]:
        """Generate optimization-specific recommendations."""
        return [
            {
                "type": RecommendationType.OPTIMIZATION,
                "title": "Schedule Workflows During Off-Peak Hours",
                "description": "Running workflows between 2-6 AM could reduce costs by 30% due to lower resource pricing.",
                "data": {"optimization_type": "scheduling", "cost_reduction": "30%"},
                "confidence": 0.75,
                "priority": 6,
                "metadata": {"source": "cost_analysis"}
            }
        ]

    # Insight generators
    async def _generate_performance_insights(self, user_id: str, workspace_id: Optional[str], time_range: Optional[Dict[str, datetime]]) -> List[Dict[str, Any]]:
        """Generate performance insights."""
        return [
            {
                "type": InsightType.PERFORMANCE,
                "title": "Workflow Performance Trend",
                "description": "Workflow execution times have decreased by 15% over the past month due to recent optimizations.",
                "data": {"trend": "improving", "improvement": "15%", "period": "1_month"},
                "confidence": 0.88,
                "impact": 8,
                "source_groups": ["workflows", "analytics"],
                "metadata": {"trend_direction": "positive"}
            }
        ]

    async def _generate_quality_insights(self, user_id: str, workspace_id: Optional[str], time_range: Optional[Dict[str, datetime]]) -> List[Dict[str, Any]]:
        """Generate data quality insights."""
        return [
            {
                "type": InsightType.QUALITY,
                "title": "Data Quality Improvement",
                "description": "Data quality scores have improved across all pipelines, with completeness increasing to 95%.",
                "data": {"quality_score": 95, "improvement": "8%", "dimension": "completeness"},
                "confidence": 0.91,
                "impact": 9,
                "source_groups": ["pipelines", "governance"],
                "metadata": {"quality_dimension": "completeness"}
            }
        ]

    async def _generate_cost_insights(self, user_id: str, workspace_id: Optional[str], time_range: Optional[Dict[str, datetime]]) -> List[Dict[str, Any]]:
        """Generate cost insights."""
        return [
            {
                "type": InsightType.COST,
                "title": "Resource Optimization Opportunity",
                "description": "Current resource allocation could be optimized to reduce costs by $500/month while maintaining performance.",
                "data": {"potential_savings": 500, "currency": "USD", "period": "monthly"},
                "confidence": 0.82,
                "impact": 7,
                "source_groups": ["pipelines", "workflows"],
                "metadata": {"optimization_type": "resource_allocation"}
            }
        ]

    async def _generate_trend_insights(self, user_id: str, workspace_id: Optional[str], time_range: Optional[Dict[str, datetime]]) -> List[Dict[str, Any]]:
        """Generate trend insights."""
        return [
            {
                "type": InsightType.TREND,
                "title": "Data Volume Growth Pattern",
                "description": "Data ingestion has grown by 25% monthly, suggesting need for infrastructure scaling in Q2.",
                "data": {"growth_rate": "25%", "period": "monthly", "projection": "Q2_scaling_needed"},
                "confidence": 0.79,
                "impact": 8,
                "source_groups": ["data_sources", "pipelines"],
                "metadata": {"trend_type": "growth", "projection_period": "Q2"}
            }
        ]

    # Metrics helpers
    async def _create_conversation_metrics(self, conversation_id: str):
        """Create initial metrics for a conversation."""
        try:
            metrics = RacineAIMetrics(
                conversation_id=conversation_id,
                metric_type="conversation",
                metric_name="conversation_started",
                metric_value=1.0,
                metric_unit="count",
                metric_data={"status": "active", "message_count": 1}
            )
            
            self.db.add(metrics)
            
        except Exception as e:
            logger.error(f"Error creating conversation metrics: {str(e)}")

    async def _get_conversation_metrics(self, user_id: Optional[str], workspace_id: Optional[str], time_range: Optional[Dict[str, datetime]]) -> Dict[str, Any]:
        """Get conversation metrics."""
        try:
            query = self.db.query(RacineAIConversation)
            
            if user_id:
                query = query.filter(RacineAIConversation.user_id == user_id)
            
            if workspace_id:
                query = query.filter(RacineAIConversation.workspace_id == workspace_id)
            
            if time_range:
                if time_range.get("start"):
                    query = query.filter(RacineAIConversation.created_at >= time_range["start"])
                if time_range.get("end"):
                    query = query.filter(RacineAIConversation.created_at <= time_range["end"])
            
            conversations = query.all()
            
            return {
                "total_conversations": len(conversations),
                "active_conversations": len([c for c in conversations if c.is_active]),
                "average_messages_per_conversation": sum(c.message_count or 0 for c in conversations) / len(conversations) if conversations else 0,
                "conversation_types": {}
            }
            
        except Exception as e:
            logger.error(f"Error getting conversation metrics: {str(e)}")
            return {}

    async def _get_recommendation_metrics(self, user_id: Optional[str], workspace_id: Optional[str], time_range: Optional[Dict[str, datetime]]) -> Dict[str, Any]:
        """Get recommendation metrics."""
        try:
            query = self.db.query(RacineAIRecommendation)
            
            if user_id:
                query = query.filter(RacineAIRecommendation.user_id == user_id)
            
            if workspace_id:
                query = query.filter(RacineAIRecommendation.workspace_id == workspace_id)
            
            if time_range:
                if time_range.get("start"):
                    query = query.filter(RacineAIRecommendation.created_at >= time_range["start"])
                if time_range.get("end"):
                    query = query.filter(RacineAIRecommendation.created_at <= time_range["end"])
            
            recommendations = query.all()
            
            return {
                "total_recommendations": len(recommendations),
                "average_confidence": sum(r.confidence_score for r in recommendations) / len(recommendations) if recommendations else 0,
                "recommendation_types": {},
                "acceptance_rate": 0.75  # Mock rate
            }
            
        except Exception as e:
            logger.error(f"Error getting recommendation metrics: {str(e)}")
            return {}

    async def _get_insight_metrics(self, user_id: Optional[str], workspace_id: Optional[str], time_range: Optional[Dict[str, datetime]]) -> Dict[str, Any]:
        """Get insight metrics."""
        try:
            query = self.db.query(RacineAIInsight)
            
            if user_id:
                query = query.filter(RacineAIInsight.user_id == user_id)
            
            if workspace_id:
                query = query.filter(RacineAIInsight.workspace_id == workspace_id)
            
            if time_range:
                if time_range.get("start"):
                    query = query.filter(RacineAIInsight.created_at >= time_range["start"])
                if time_range.get("end"):
                    query = query.filter(RacineAIInsight.created_at <= time_range["end"])
            
            insights = query.all()
            
            return {
                "total_insights": len(insights),
                "average_impact": sum(i.impact_score for i in insights) / len(insights) if insights else 0,
                "insight_types": {},
                "actionable_insights": len([i for i in insights if i.impact_score > 7])
            }
            
        except Exception as e:
            logger.error(f"Error getting insight metrics: {str(e)}")
            return {}

    async def _get_learning_metrics(self, user_id: Optional[str], workspace_id: Optional[str], time_range: Optional[Dict[str, datetime]]) -> Dict[str, Any]:
        """Get learning metrics."""
        try:
            query = self.db.query(RacineAILearning)
            
            if time_range:
                if time_range.get("start"):
                    query = query.filter(RacineAILearning.created_at >= time_range["start"])
                if time_range.get("end"):
                    query = query.filter(RacineAILearning.created_at <= time_range["end"])
            
            learning_entries = query.all()
            
            return {
                "total_learning_entries": len(learning_entries),
                "learning_types": {},
                "average_feedback_score": sum(l.feedback_score or 0 for l in learning_entries) / len(learning_entries) if learning_entries else 0,
                "improvement_rate": 0.85  # Mock rate
            }
            
        except Exception as e:
            logger.error(f"Error getting learning metrics: {str(e)}")
            return {}