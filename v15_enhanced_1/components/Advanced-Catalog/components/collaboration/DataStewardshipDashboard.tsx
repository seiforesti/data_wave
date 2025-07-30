// ============================================================================
// DATA STEWARDSHIP DASHBOARD - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced dashboard for data stewardship activities and quality management
// Integrates with backend stewardship APIs for comprehensive governance control
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users,
  TrendingUp,
  Activity,
  FileText,
  Star,
  Award,
  Target,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit3,
  Eye,
  Settings,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  User,
  Crown,
  Database,
  Lock,
  Unlock,
  Flag,
  MessageSquare,
  Bell,
  Zap,
  Brain,
  Lightbulb,
  Network,
  Layers,
  Globe,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

// Advanced Catalog imports
import { useCollaboration } from '../../hooks/useCollaboration';
import { useCatalogAnalytics } from '../../hooks/useCatalogAnalytics';
import { useCatalogQuality } from '../../hooks/useCatalogQuality';
import { 
  DataStewardshipTask,
  TeamMember,
  StewardshipTaskType,
  StewardshipTaskStatus,
  StewardshipTaskPriority,
  DataQualityIssue,
  GovernancePolicy,
  ComplianceCheck,
  QualityMetrics,
  StewardshipMetrics
} from '../../types/collaboration.types';
import { toast } from 'sonner';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DataStewardshipDashboardProps {
  className?: string;
  workspaceId?: string;
  userId?: string;
  onTaskSelect?: (task: DataStewardshipTask) => void;
  onPolicySelect?: (policy: GovernancePolicy) => void;
}

interface TaskFilter {
  type: string;
  status: string;
  priority: string;
  assignee: string;
  timeRange: string;
  domain: string;
}

interface StewardshipOverview {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  criticalIssues: number;
  qualityScore: number;
  complianceScore: number;
  stewardshipEfficiency: number;
  avgResolutionTime: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DataStewardshipDashboard: React.FC<DataStewardshipDashboardProps> = ({
  className = '',
  workspaceId,
  userId,
  onTaskSelect,
  onPolicySelect
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<TaskFilter>({
    type: 'all',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    timeRange: '30d',
    domain: 'all'
  });
  const [selectedTask, setSelectedTask] = useState<DataStewardshipTask | null>(null);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    stewardshipTasks,
    teamMembers,
    metrics: collaborationMetrics,
    isLoading: collaborationLoading,
    error: collaborationError,
    refetch: refetchCollaboration,
    assignTask,
    updateTask,
    completeTask,
    getTasksByType
  } = useCollaboration(workspaceId, userId);

  const {
    getQualityMetrics,
    getQualityTrends,
    getDomainMetrics
  } = useCatalogAnalytics();

  const {
    qualityIssues,
    policies,
    complianceChecks,
    qualityMetrics,
    stewardshipMetrics,
    isLoading: qualityLoading,
    error: qualityError,
    refetch: refetchQuality,
    createQualityRule,
    updatePolicy,
    runComplianceCheck
  } = useCatalogQuality();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredTasks = useMemo(() => {
    if (!stewardshipTasks) return [];

    return stewardshipTasks.filter(task => {
      const matchesSearch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedFilters.type === 'all' || task.type === selectedFilters.type;
      const matchesStatus = selectedFilters.status === 'all' || task.status === selectedFilters.status;
      const matchesPriority = selectedFilters.priority === 'all' || task.priority === selectedFilters.priority;
      const matchesAssignee = selectedFilters.assignee === 'all' || task.assignedTo === selectedFilters.assignee;
      const matchesDomain = selectedFilters.domain === 'all' || task.dataDomain === selectedFilters.domain;

      const matchesTimeRange = (() => {
        if (selectedFilters.timeRange === 'all') return true;
        const now = new Date();
        const taskDate = new Date(task.createdAt);
        const daysDiff = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (selectedFilters.timeRange) {
          case '7d': return daysDiff <= 7;
          case '30d': return daysDiff <= 30;
          case '90d': return daysDiff <= 90;
          default: return true;
        }
      })();

      return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesAssignee && matchesDomain && matchesTimeRange;
    });
  }, [stewardshipTasks, searchQuery, selectedFilters]);

  const stewardshipOverview = useMemo((): StewardshipOverview => {
    if (!stewardshipTasks || !qualityIssues) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        criticalIssues: 0,
        qualityScore: 0,
        complianceScore: 0,
        stewardshipEfficiency: 0,
        avgResolutionTime: 0
      };
    }

    const now = new Date();
    const completedTasks = stewardshipTasks.filter(task => task.status === 'completed').length;
    const overdueTasks = stewardshipTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
    ).length;
    const criticalIssues = qualityIssues.filter(issue => issue.severity === 'critical').length;

    const qualityScore = qualityMetrics?.overallScore || 0;
    const complianceScore = stewardshipMetrics?.complianceScore || 0;
    
    const completionRate = stewardshipTasks.length > 0 ? (completedTasks / stewardshipTasks.length) * 100 : 0;
    const stewardshipEfficiency = Math.min(100, completionRate);

    const completedTasksWithTime = stewardshipTasks.filter(task => 
      task.status === 'completed' && task.completedAt && task.createdAt
    );
    const avgResolutionTime = completedTasksWithTime.length > 0 
      ? completedTasksWithTime.reduce((sum, task) => {
          const createdTime = new Date(task.createdAt).getTime();
          const completedTime = new Date(task.completedAt!).getTime();
          return sum + (completedTime - createdTime);
        }, 0) / completedTasksWithTime.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return {
      totalTasks: stewardshipTasks.length,
      completedTasks,
      overdueTasks,
      criticalIssues,
      qualityScore,
      complianceScore,
      stewardshipEfficiency,
      avgResolutionTime
    };
  }, [stewardshipTasks, qualityIssues, qualityMetrics, stewardshipMetrics]);

  const tasksByStatus = useMemo(() => {
    if (!filteredTasks) return {};
    
    return filteredTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredTasks]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTaskClick = useCallback((task: DataStewardshipTask) => {
    setSelectedTask(task);
    onTaskSelect?.(task);
  }, [onTaskSelect]);

  const handleAssignTask = useCallback(async (taskId: string, assigneeId: string) => {
    try {
      await assignTask(taskId, assigneeId);
      toast.success('Task assigned successfully');
      refetchCollaboration();
    } catch (error) {
      toast.error('Failed to assign task');
      console.error('Assign task error:', error);
    }
  }, [assignTask, refetchCollaboration]);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    try {
      await completeTask(taskId);
      toast.success('Task completed successfully');
      refetchCollaboration();
    } catch (error) {
      toast.error('Failed to complete task');
      console.error('Complete task error:', error);
    }
  }, [completeTask, refetchCollaboration]);

  const handleBulkAssign = useCallback(async (assigneeId: string) => {
    if (selectedTasks.length === 0) return;

    try {
      await Promise.all(selectedTasks.map(taskId => assignTask(taskId, assigneeId)));
      toast.success(`${selectedTasks.length} tasks assigned successfully`);
      setSelectedTasks([]);
      refetchCollaboration();
    } catch (error) {
      toast.error('Failed to assign tasks');
      console.error('Bulk assign error:', error);
    }
  }, [selectedTasks, assignTask, refetchCollaboration]);

  const handleFilterChange = useCallback((filterType: keyof TaskFilter, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const handleTaskSelection = useCallback((taskId: string, selected: boolean) => {
    setSelectedTasks(prev => 
      selected 
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    );
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (workspaceId && userId) {
      refetchCollaboration();
      refetchQuality();
    }
  }, [workspaceId, userId, refetchCollaboration, refetchQuality]);

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================

  const isLoading = collaborationLoading || qualityLoading;
  const error = collaborationError || qualityError;

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
              Error Loading Stewardship Dashboard
            </CardTitle>
            <CardDescription>
              {error.message || 'Failed to load stewardship data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => { refetchCollaboration(); refetchQuality(); }} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
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

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stewardshipOverview.totalTasks}</div>
          <p className="text-xs text-muted-foreground">
            {stewardshipOverview.completedTasks} completed
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stewardshipOverview.qualityScore.toFixed(1)}%</div>
          <Progress value={stewardshipOverview.qualityScore} className="mt-2" />
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{stewardshipOverview.criticalIssues}</div>
          <p className="text-xs text-muted-foreground">
            Require immediate attention
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stewardshipOverview.stewardshipEfficiency.toFixed(1)}%</div>
          <Progress value={stewardshipOverview.stewardshipEfficiency} className="mt-2" />
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
      </Card>
    </div>
  );

  const renderTaskFilters = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Task Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type-filter">Type</Label>
            <Select value={selectedFilters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="quality_validation">Quality Validation</SelectItem>
                <SelectItem value="data_classification">Data Classification</SelectItem>
                <SelectItem value="compliance_check">Compliance Check</SelectItem>
                <SelectItem value="metadata_enrichment">Metadata Enrichment</SelectItem>
                <SelectItem value="access_review">Access Review</SelectItem>
                <SelectItem value="policy_enforcement">Policy Enforcement</SelectItem>
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
                <SelectItem value="cancelled">Cancelled</SelectItem>
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

          <div className="space-y-2">
            <Label htmlFor="domain-filter">Domain</Label>
            <Select value={selectedFilters.domain} onValueChange={(value) => handleFilterChange('domain', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Domains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
                <SelectItem value="it">Information Technology</SelectItem>
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
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTasksList = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Stewardship Tasks
          </CardTitle>
          <CardDescription>
            {filteredTasks.length} of {stewardshipTasks?.length || 0} tasks
            {selectedTasks.length > 0 && ` • ${selectedTasks.length} selected`}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {selectedTasks.length > 0 && (
            <Select onValueChange={handleBulkAssign}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Assign to..." />
              </SelectTrigger>
              <SelectContent>
                {teamMembers?.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
          <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Stewardship Task</DialogTitle>
                <DialogDescription>
                  Create a new data stewardship task for your team.
                </DialogDescription>
              </DialogHeader>
              {/* Create task form would go here */}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          {viewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTasks(filteredTasks.map(task => task.id));
                        } else {
                          setSelectedTasks([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map(task => {
                  const assignee = teamMembers?.find(member => member.id === task.assignedTo);
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                  
                  return (
                    <TableRow 
                      key={task.id} 
                      className={`cursor-pointer ${isOverdue ? 'bg-red-50 dark:bg-red-950/20' : ''}`}
                      onClick={() => handleTaskClick(task)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={(checked) => handleTaskSelection(task.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          task.priority === 'critical' ? 'destructive' :
                          task.priority === 'high' ? 'default' :
                          task.priority === 'medium' ? 'secondary' : 'outline'
                        }>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'in_progress' ? 'secondary' :
                          task.status === 'blocked' ? 'destructive' : 'outline'
                        }>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={assignee.avatar} />
                              <AvatarFallback className="text-xs">
                                {assignee.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                            {new Date(task.dueDate).toLocaleDateString()}
                            {isOverdue && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No due date</span>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleTaskClick(task)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>
                          
                          {task.status !== 'completed' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleCompleteTask(task.id)}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Complete Task</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map(task => {
                const assignee = teamMembers?.find(member => member.id === task.assignedTo);
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <Card className={`hover:shadow-md transition-shadow ${isOverdue ? 'ring-2 ring-red-200' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedTasks.includes(task.id)}
                                onCheckedChange={(checked) => handleTaskSelection(task.id, checked as boolean)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <CardTitle className="text-base line-clamp-1">{task.title}</CardTitle>
                            </div>
                            <CardDescription className="text-sm line-clamp-2">
                              {task.description}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant={
                              task.priority === 'critical' ? 'destructive' :
                              task.priority === 'high' ? 'default' :
                              task.priority === 'medium' ? 'secondary' : 'outline'
                            } className="text-xs">
                              {task.priority}
                            </Badge>
                            {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline" className="text-xs">
                            {task.type}
                          </Badge>
                          <Badge variant={
                            task.status === 'completed' ? 'default' :
                            task.status === 'in_progress' ? 'secondary' :
                            task.status === 'blocked' ? 'destructive' : 'outline'
                          } className="text-xs">
                            {task.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {assignee ? (
                              <>
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={assignee.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {assignee.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{assignee.name}</span>
                              </>
                            ) : (
                              <span className="text-xs">Unassigned</span>
                            )}
                          </div>
                          
                          {task.dueDate && (
                            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : ''}`}>
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Created {new Date(task.createdAt).toLocaleDateString()}
                          </div>
                          
                          {task.status !== 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteTask(task.id);
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderStatusOverview = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Task Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(tasksByStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  status === 'completed' ? 'bg-green-500' :
                  status === 'in_progress' ? 'bg-blue-500' :
                  status === 'blocked' ? 'bg-red-500' :
                  status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                }`}></div>
                <span className="capitalize font-medium">{status.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{count}</span>
                <span className="text-sm text-muted-foreground">
                  ({((count / filteredTasks.length) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
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
            <h1 className="text-3xl font-bold tracking-tight">Data Stewardship Dashboard</h1>
            <p className="text-muted-foreground">
              Manage data quality, governance policies, and stewardship activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
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

        {/* Overview Cards */}
        {renderOverviewCards()}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {renderTaskFilters()}
              </div>
              <div>
                {renderStatusOverview()}
              </div>
            </div>
            {renderTasksList()}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            {renderTaskFilters()}
            {renderTasksList()}
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Management</CardTitle>
                <CardDescription>Monitor and manage data quality issues</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Quality management content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Governance Policies</CardTitle>
                <CardDescription>Manage data governance policies and compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Policy management content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stewardship Analytics</CardTitle>
                <CardDescription>Analytics and insights on stewardship activities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Selected Task Details Modal */}
        <AnimatePresence>
          {selectedTask && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedTask(null)}
            >
              <motion.div
                className="bg-background border rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
                      <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTask(null)}
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <Badge variant="outline">{selectedTask.type}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <Badge variant={
                          selectedTask.priority === 'critical' ? 'destructive' :
                          selectedTask.priority === 'high' ? 'default' :
                          selectedTask.priority === 'medium' ? 'secondary' : 'outline'
                        }>
                          {selectedTask.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant="outline">{selectedTask.status}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Data Domain</Label>
                        <p className="text-sm">{selectedTask.dataDomain || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Assigned To</Label>
                      {selectedTask.assignedTo ? (
                        <div className="flex items-center gap-2 mt-1">
                          {teamMembers?.find(member => member.id === selectedTask.assignedTo) && (
                            <>
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={teamMembers.find(member => member.id === selectedTask.assignedTo)?.avatar} />
                                <AvatarFallback className="text-xs">
                                  {teamMembers.find(member => member.id === selectedTask.assignedTo)?.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{teamMembers.find(member => member.id === selectedTask.assignedTo)?.name}</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Unassigned</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Created</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedTask.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {selectedTask.dueDate && (
                        <div>
                          <Label className="text-sm font-medium">Due Date</Label>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedTask.dueDate).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {selectedTask.metadata && (
                      <div>
                        <Label className="text-sm font-medium">Additional Information</Label>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(selectedTask.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {selectedTask.status !== 'completed' && (
                        <Button
                          onClick={() => {
                            handleCompleteTask(selectedTask.id);
                            setSelectedTask(null);
                          }}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setSelectedTask(null)}
                        className="flex-1"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default DataStewardshipDashboard;