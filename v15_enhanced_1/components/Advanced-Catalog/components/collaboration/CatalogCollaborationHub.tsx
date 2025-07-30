// ============================================================================
// CATALOG COLLABORATION HUB - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced team collaboration center for data catalog management
// Integrates with backend collaboration APIs for real-time team coordination
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Bell, 
  Settings, 
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Globe,
  Shield,
  Zap,
  Target,
  Award,
  BookOpen,
  Share2,
  Eye,
  Edit3,
  MessageCircle,
  ThumbsUp,
  GitBranch,
  FileText,
  Database,
  BarChart3,
  Brain,
  Lightbulb,
  Workflow,
  Network,
  Layers,
  Sparkles
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Advanced Catalog imports
import { useCollaboration } from '../../hooks/useCollaboration';
import { useCatalogAnalytics } from '../../hooks/useCatalogAnalytics';
import { 
  CollaborationActivity,
  TeamMember,
  CollaborationProject,
  CollaborationMetrics,
  CollaborationNotification,
  DataStewardshipTask,
  KnowledgeBaseArticle,
  CommunityDiscussion,
  ExpertConnection,
  CollaborationWorkspace,
  CollaborationInsight
} from '../../types/collaboration.types';
import { toast } from 'sonner';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CatalogCollaborationHubProps {
  className?: string;
  workspaceId?: string;
  userId?: string;
  onActivitySelect?: (activity: CollaborationActivity) => void;
  onProjectSelect?: (project: CollaborationProject) => void;
  onMemberSelect?: (member: TeamMember) => void;
}

interface ActivityFilter {
  type: string;
  timeRange: string;
  priority: string;
  status: string;
  assignee: string;
}

interface CollaborationStats {
  totalActivities: number;
  activeProjects: number;
  teamMembers: number;
  completedTasks: number;
  avgResponseTime: number;
  collaborationScore: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CatalogCollaborationHub: React.FC<CatalogCollaborationHubProps> = ({
  className = '',
  workspaceId,
  userId,
  onActivitySelect,
  onProjectSelect,
  onMemberSelect
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<ActivityFilter>({
    type: 'all',
    timeRange: '7d',
    priority: 'all',
    status: 'all',
    assignee: 'all'
  });
  const [selectedActivity, setSelectedActivity] = useState<CollaborationActivity | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    activities,
    projects,
    teamMembers,
    notifications,
    stewardshipTasks,
    knowledgeBase,
    discussions,
    experts,
    workspaces,
    insights,
    metrics,
    isLoading,
    error,
    refetch,
    createActivity,
    updateActivity,
    deleteActivity,
    createProject,
    updateProject,
    assignTask,
    markNotificationRead,
    joinDiscussion,
    connectWithExpert,
    createWorkspace,
    getCollaborationInsights
  } = useCollaboration(workspaceId, userId);

  const {
    getUsageAnalytics,
    getTrendAnalysis
  } = useCatalogAnalytics();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredActivities = useMemo(() => {
    if (!activities) return [];

    return activities.filter(activity => {
      const matchesSearch = searchQuery === '' || 
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedFilters.type === 'all' || activity.type === selectedFilters.type;
      const matchesPriority = selectedFilters.priority === 'all' || activity.priority === selectedFilters.priority;
      const matchesStatus = selectedFilters.status === 'all' || activity.status === selectedFilters.status;
      const matchesAssignee = selectedFilters.assignee === 'all' || 
        activity.assignedTo?.some(assignee => assignee.id === selectedFilters.assignee);

      const matchesTimeRange = (() => {
        if (selectedFilters.timeRange === 'all') return true;
        const now = new Date();
        const activityDate = new Date(activity.createdAt);
        const daysDiff = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (selectedFilters.timeRange) {
          case '1d': return daysDiff <= 1;
          case '7d': return daysDiff <= 7;
          case '30d': return daysDiff <= 30;
          case '90d': return daysDiff <= 90;
          default: return true;
        }
      })();

      return matchesSearch && matchesType && matchesPriority && matchesStatus && matchesAssignee && matchesTimeRange;
    });
  }, [activities, searchQuery, selectedFilters]);

  const collaborationStats = useMemo((): CollaborationStats => {
    if (!activities || !projects || !teamMembers || !stewardshipTasks) {
      return {
        totalActivities: 0,
        activeProjects: 0,
        teamMembers: 0,
        completedTasks: 0,
        avgResponseTime: 0,
        collaborationScore: 0
      };
    }

    const completedTasks = stewardshipTasks.filter(task => task.status === 'completed').length;
    const totalResponseTimes = activities
      .filter(activity => activity.responseTime)
      .map(activity => activity.responseTime || 0);
    const avgResponseTime = totalResponseTimes.length > 0 
      ? totalResponseTimes.reduce((sum, time) => sum + time, 0) / totalResponseTimes.length 
      : 0;

    const collaborationScore = Math.min(100, Math.round(
      (completedTasks / Math.max(stewardshipTasks.length, 1)) * 40 +
      (projects.filter(p => p.status === 'active').length / Math.max(projects.length, 1)) * 30 +
      (activities.filter(a => a.status === 'completed').length / Math.max(activities.length, 1)) * 30
    ));

    return {
      totalActivities: activities.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      teamMembers: teamMembers.length,
      completedTasks,
      avgResponseTime,
      collaborationScore
    };
  }, [activities, projects, teamMembers, stewardshipTasks]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleActivityClick = useCallback((activity: CollaborationActivity) => {
    setSelectedActivity(activity);
    onActivitySelect?.(activity);
  }, [onActivitySelect]);

  const handleProjectClick = useCallback((project: CollaborationProject) => {
    onProjectSelect?.(project);
  }, [onProjectSelect]);

  const handleMemberClick = useCallback((member: TeamMember) => {
    onMemberSelect?.(member);
  }, [onMemberSelect]);

  const handleCreateActivity = useCallback(async (activityData: Partial<CollaborationActivity>) => {
    try {
      await createActivity(activityData);
      toast.success('Activity created successfully');
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to create activity');
      console.error('Create activity error:', error);
    }
  }, [createActivity, refetch]);

  const handleFilterChange = useCallback((filterType: keyof ActivityFilter, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (workspaceId && userId) {
      refetch();
    }
  }, [workspaceId, userId, refetch]);

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-16 bg-muted rounded"></div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Collaboration Hub
            </CardTitle>
            <CardDescription>
              {error.message || 'Failed to load collaboration data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refetch} className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{collaborationStats.totalActivities}</div>
          <p className="text-xs text-muted-foreground">
            Across all projects
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <Workflow className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{collaborationStats.activeProjects}</div>
          <p className="text-xs text-muted-foreground">
            Currently in progress
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{collaborationStats.teamMembers}</div>
          <p className="text-xs text-muted-foreground">
            Active collaborators
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Collaboration Score</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{collaborationStats.collaborationScore}%</div>
          <Progress value={collaborationStats.collaborationScore} className="mt-2" />
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
      </Card>
    </div>
  );

  const renderActivityFilters = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Activity Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type-filter">Type</Label>
            <Select value={selectedFilters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="annotation">Annotation</SelectItem>
                <SelectItem value="stewardship">Stewardship</SelectItem>
                <SelectItem value="discussion">Discussion</SelectItem>
                <SelectItem value="approval">Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time-filter">Time Range</Label>
            <Select value={selectedFilters.timeRange} onValueChange={(value) => handleFilterChange('timeRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1d">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority-filter">Priority</Label>
            <Select value={selectedFilters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={selectedFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee-filter">Assignee</Label>
            <Select value={selectedFilters.assignee} onValueChange={(value) => handleFilterChange('assignee', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {teamMembers?.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderActivitiesList = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activities
          </CardTitle>
          <CardDescription>
            {filteredActivities.length} of {activities?.length || 0} activities
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Layers className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Activity</DialogTitle>
                <DialogDescription>
                  Create a new collaboration activity for your team.
                </DialogDescription>
              </DialogHeader>
              {/* Create activity form would go here */}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
            {filteredActivities.map(activity => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="cursor-pointer"
                onClick={() => handleActivityClick(activity)}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{activity.title}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {activity.description}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        activity.priority === 'critical' ? 'destructive' :
                        activity.priority === 'high' ? 'default' :
                        activity.priority === 'medium' ? 'secondary' : 'outline'
                      }>
                        {activity.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        {activity.assignedTo?.slice(0, 3).map(assignee => (
                          <Avatar key={assignee.id} className="h-6 w-6">
                            <AvatarImage src={assignee.avatar} />
                            <AvatarFallback className="text-xs">
                              {assignee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {(activity.assignedTo?.length || 0) > 3 && (
                          <span className="text-xs">+{(activity.assignedTo?.length || 0) - 3}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Collaboration Hub</h1>
            <p className="text-muted-foreground">
              Coordinate team efforts and manage data governance activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="stewardship">Stewardship</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {renderActivityFilters()}
            {renderActivitiesList()}
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            {renderActivitiesList()}
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {/* Projects content would go here */}
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Manage collaboration projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Projects content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stewardship" className="space-y-6">
            {/* Stewardship content would go here */}
            <Card>
              <CardHeader>
                <CardTitle>Data Stewardship</CardTitle>
                <CardDescription>Manage data stewardship tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Stewardship content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            {/* Knowledge base content would go here */}
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>Access team knowledge and documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Knowledge base content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Insights content would go here */}
            <Card>
              <CardHeader>
                <CardTitle>Collaboration Insights</CardTitle>
                <CardDescription>Analytics and insights on team collaboration</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Insights content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Selected Activity Details */}
        <AnimatePresence>
          {selectedActivity && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedActivity(null)}
            >
              <motion.div
                className="bg-background border rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedActivity.title}</h3>
                      <p className="text-sm text-muted-foreground">{selectedActivity.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedActivity(null)}
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <Badge variant={
                          selectedActivity.priority === 'critical' ? 'destructive' :
                          selectedActivity.priority === 'high' ? 'default' :
                          selectedActivity.priority === 'medium' ? 'secondary' : 'outline'
                        }>
                          {selectedActivity.priority}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant="outline">{selectedActivity.status}</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Assigned To</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedActivity.assignedTo?.map(assignee => (
                          <div key={assignee.id} className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={assignee.avatar} />
                              <AvatarFallback className="text-xs">
                                {assignee.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{assignee.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedActivity.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    {selectedActivity.metadata && (
                      <div>
                        <Label className="text-sm font-medium">Additional Information</Label>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(selectedActivity.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default CatalogCollaborationHub;