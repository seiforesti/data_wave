// ============================================================================
// PROJECT WORKSPACE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced workspace for project collaboration and coordination
// Integrates with backend collaboration APIs for comprehensive project management
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  Users,
  Target,
  TrendingUp,
  Activity,
  FileText,
  Star,
  Award,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Edit3,
  Eye,
  Settings,
  MoreHorizontal,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RefreshCw,
  Download,
  Upload,
  MessageSquare,
  Bell,
  Flag,
  MapPin,
  Timer,
  Layers,
  GitBranch,
  Workflow,
  Network,
  Database,
  Shield,
  Lock,
  Unlock,
  Key,
  Zap,
  Brain,
  Lightbulb,
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Advanced Catalog imports
import { useCollaboration } from '../../hooks/useCollaboration';
import { useCatalogAnalytics } from '../../hooks/useCatalogAnalytics';
import { 
  CollaborationProject,
  ProjectTask,
  ProjectMilestone,
  ProjectResource,
  ProjectTimeline,
  TeamMember,
  ProjectStatus,
  ProjectType,
  ProjectPriority,
  TaskStatus,
  TaskPriority
} from '../../types/collaboration.types';
import { toast } from 'sonner';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ProjectWorkspaceProps {
  className?: string;
  workspaceId?: string;
  projectId?: string;
  onProjectSelect?: (project: CollaborationProject) => void;
  onTaskSelect?: (task: ProjectTask) => void;
}

interface ProjectFilter {
  status: string;
  type: string;
  priority: string;
  owner: string;
  dateRange: string;
}

interface ProjectOverview {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueTasks: number;
  teamUtilization: number;
  avgCompletionTime: number;
  upcomingMilestones: ProjectMilestone[];
  recentActivity: any[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  className = '',
  workspaceId,
  projectId,
  onProjectSelect,
  onTaskSelect
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<ProjectFilter>({
    status: 'all',
    type: 'all',
    priority: 'all',
    owner: 'all',
    dateRange: '30d'
  });
  const [selectedProject, setSelectedProject] = useState<CollaborationProject | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban' | 'timeline'>('grid');

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    projects,
    tasks,
    milestones,
    teamMembers,
    metrics,
    isLoading,
    error,
    refetch,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    createMilestone,
    updateMilestone
  } = useCollaboration(workspaceId);

  const {
    getProjectAnalytics,
    getTeamUtilization,
    getTimelineAnalysis
  } = useCatalogAnalytics();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter(project => {
      const matchesSearch = searchQuery === '' || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedFilters.status === 'all' || project.status === selectedFilters.status;
      const matchesType = selectedFilters.type === 'all' || project.type === selectedFilters.type;
      const matchesPriority = selectedFilters.priority === 'all' || project.priority === selectedFilters.priority;
      const matchesOwner = selectedFilters.owner === 'all' || project.ownerId === selectedFilters.owner;

      const matchesDateRange = (() => {
        if (selectedFilters.dateRange === 'all') return true;
        const now = new Date();
        const projectDate = new Date(project.createdAt);
        const daysDiff = Math.floor((now.getTime() - projectDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (selectedFilters.dateRange) {
          case '7d': return daysDiff <= 7;
          case '30d': return daysDiff <= 30;
          case '90d': return daysDiff <= 90;
          case '1y': return daysDiff <= 365;
          default: return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesOwner && matchesDateRange;
    });
  }, [projects, searchQuery, selectedFilters]);

  const projectOverview = useMemo((): ProjectOverview => {
    if (!projects || !tasks || !milestones) {
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        overdueTasks: 0,
        teamUtilization: 0,
        avgCompletionTime: 0,
        upcomingMilestones: [],
        recentActivity: []
      };
    }

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    const now = new Date();
    const overdueTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
    ).length;

    // Calculate team utilization (mock calculation)
    const teamUtilization = Math.min(100, (activeProjects / Math.max(projects.length, 1)) * 100);

    // Calculate average completion time for completed projects
    const completedProjectsWithDates = projects.filter(p => 
      p.status === 'completed' && p.completedAt && p.startDate
    );
    const avgCompletionTime = completedProjectsWithDates.length > 0
      ? completedProjectsWithDates.reduce((sum, project) => {
          const startTime = new Date(project.startDate!).getTime();
          const endTime = new Date(project.completedAt!).getTime();
          return sum + (endTime - startTime);
        }, 0) / completedProjectsWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Get upcoming milestones
    const upcomingMilestones = milestones
      .filter(milestone => milestone.dueDate && new Date(milestone.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);

    return {
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      overdueTasks,
      teamUtilization,
      avgCompletionTime,
      upcomingMilestones,
      recentActivity: [] // Would be populated from backend
    };
  }, [projects, tasks, milestones]);

  const projectsByStatus = useMemo(() => {
    if (!filteredProjects) return {};
    
    return filteredProjects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredProjects]);

  const tasksByStatus = useMemo(() => {
    if (!tasks) return {};
    
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [tasks]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleProjectClick = useCallback((project: CollaborationProject) => {
    setSelectedProject(project);
    onProjectSelect?.(project);
  }, [onProjectSelect]);

  const handleProjectSelection = useCallback((projectId: string, selected: boolean) => {
    setSelectedProjects(prev => 
      selected 
        ? [...prev, projectId]
        : prev.filter(id => id !== projectId)
    );
  }, []);

  const handleCreateProject = useCallback(async (projectData: Partial<CollaborationProject>) => {
    try {
      await createProject(projectData);
      toast.success('Project created successfully');
      setIsCreateProjectDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to create project');
      console.error('Create project error:', error);
    }
  }, [createProject, refetch]);

  const handleUpdateProjectStatus = useCallback(async (projectId: string, newStatus: ProjectStatus) => {
    try {
      await updateProject(projectId, { status: newStatus });
      toast.success('Project status updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update project status');
      console.error('Update project error:', error);
    }
  }, [updateProject, refetch]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    try {
      await deleteProject(projectId);
      toast.success('Project deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete project');
      console.error('Delete project error:', error);
    }
  }, [deleteProject, refetch]);

  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedProjects.length === 0) return;

    try {
      switch (action) {
        case 'activate':
          await Promise.all(selectedProjects.map(id => updateProject(id, { status: 'active' })));
          toast.success(`${selectedProjects.length} projects activated`);
          break;
        case 'pause':
          await Promise.all(selectedProjects.map(id => updateProject(id, { status: 'paused' })));
          toast.success(`${selectedProjects.length} projects paused`);
          break;
        case 'complete':
          await Promise.all(selectedProjects.map(id => updateProject(id, { status: 'completed' })));
          toast.success(`${selectedProjects.length} projects completed`);
          break;
        case 'archive':
          await Promise.all(selectedProjects.map(id => updateProject(id, { status: 'archived' })));
          toast.success(`${selectedProjects.length} projects archived`);
          break;
      }
      setSelectedProjects([]);
      refetch();
    } catch (error) {
      toast.error('Bulk action failed');
      console.error('Bulk action error:', error);
    }
  }, [selectedProjects, updateProject, refetch]);

  const handleFilterChange = useCallback((filterType: keyof ProjectFilter, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (workspaceId) {
      refetch();
    }
  }, [workspaceId, refetch]);

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
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Project Workspace
            </CardTitle>
            <CardDescription>
              {error.message || 'Failed to load project data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refetch} className="w-full">
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
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectOverview.totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            {projectOverview.activeProjects} active
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{projectOverview.overdueTasks}</div>
          <p className="text-xs text-muted-foreground">
            Need attention
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectOverview.teamUtilization.toFixed(1)}%</div>
          <Progress value={projectOverview.teamUtilization} className="mt-2" />
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(projectOverview.avgCompletionTime)}</div>
          <p className="text-xs text-muted-foreground">
            days average
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
      </Card>
    </div>
  );

  const renderProjectFilters = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Project Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={selectedFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type-filter">Type</Label>
            <Select value={selectedFilters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="data_migration">Data Migration</SelectItem>
                <SelectItem value="quality_improvement">Quality Improvement</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
                <SelectItem value="governance">Governance</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
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
            <Label htmlFor="owner-filter">Owner</Label>
            <Select value={selectedFilters.owner} onValueChange={(value) => handleFilterChange('owner', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Owners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                {teamMembers?.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-filter">Date Range</Label>
            <Select value={selectedFilters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderProjectsList = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Projects
          </CardTitle>
          <CardDescription>
            {filteredProjects.length} of {projects?.length || 0} projects
            {selectedProjects.length > 0 && ` • ${selectedProjects.length} selected`}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {selectedProjects.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Activate Projects
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('pause')}>
                  <PauseCircle className="h-4 w-4 mr-2" />
                  Pause Projects
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('complete')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Projects
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                  <StopCircle className="h-4 w-4 mr-2" />
                  Archive Projects
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          
          <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new collaboration project for your team.
                </DialogDescription>
              </DialogHeader>
              {/* Create project form would go here */}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map(project => {
              const owner = teamMembers?.find(member => member.id === project.ownerId);
              const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'completed';
              const progress = project.progress || 0;
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="cursor-pointer"
                  onClick={() => handleProjectClick(project)}
                >
                  <Card className={`hover:shadow-md transition-shadow ${isOverdue ? 'ring-2 ring-red-200' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedProjects.includes(project.id)}
                              onCheckedChange={(checked) => handleProjectSelection(project.id, checked as boolean)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <CardTitle className="text-base line-clamp-1">{project.name}</CardTitle>
                          </div>
                          <CardDescription className="text-sm line-clamp-2">
                            {project.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant={
                            project.priority === 'critical' ? 'destructive' :
                            project.priority === 'high' ? 'default' :
                            project.priority === 'medium' ? 'secondary' : 'outline'
                          } className="text-xs">
                            {project.priority}
                          </Badge>
                          {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className="text-xs">
                          {project.type}
                        </Badge>
                        <Badge variant={
                          project.status === 'completed' ? 'default' :
                          project.status === 'active' ? 'secondary' :
                          project.status === 'paused' ? 'destructive' : 'outline'
                        } className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {owner ? (
                            <>
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={owner.avatar} />
                                <AvatarFallback className="text-xs">
                                  {owner.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{owner.name}</span>
                            </>
                          ) : (
                            <span className="text-xs">Unassigned</span>
                          )}
                        </div>
                        
                        {project.dueDate && (
                          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : ''}`}>
                            <Calendar className="h-3 w-3" />
                            {new Date(project.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProjectClick(project);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Project
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="h-4 w-4 mr-2" />
                                Manage Team
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                View Timeline
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteProject(project.id)}
                                className="text-destructive"
                              >
                                <StopCircle className="h-4 w-4 mr-2" />
                                Archive Project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderProjectAnalytics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Projects by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(projectsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'completed' ? 'bg-green-500' :
                    status === 'active' ? 'bg-blue-500' :
                    status === 'paused' ? 'bg-yellow-500' :
                    status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="capitalize font-medium">{status.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-sm text-muted-foreground">
                    ({((count / filteredProjects.length) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Upcoming Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectOverview.upcomingMilestones.length > 0 ? (
              projectOverview.upcomingMilestones.map(milestone => (
                <div key={milestone.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Flag className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium">{milestone.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Due {new Date(milestone.dueDate!).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {milestone.projectId}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming milestones</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
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
            <h1 className="text-3xl font-bold tracking-tight">Project Workspace</h1>
            <p className="text-muted-foreground">
              Coordinate projects, track progress, and manage team collaboration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
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
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            {renderProjectFilters()}
            {renderProjectsList()}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>Manage project tasks and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Task management content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>Visualize project schedules and dependencies</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Timeline visualization content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Management</CardTitle>
                <CardDescription>Manage project resources and allocations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Resource management content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {renderProjectAnalytics()}
          </TabsContent>
        </Tabs>

        {/* Selected Project Details Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                className="bg-background border rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{selectedProject.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProject(null)}
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant={
                          selectedProject.status === 'completed' ? 'default' :
                          selectedProject.status === 'active' ? 'secondary' :
                          selectedProject.status === 'paused' ? 'destructive' : 'outline'
                        }>
                          {selectedProject.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <Badge variant={
                          selectedProject.priority === 'critical' ? 'destructive' :
                          selectedProject.priority === 'high' ? 'default' :
                          selectedProject.priority === 'medium' ? 'secondary' : 'outline'
                        }>
                          {selectedProject.priority}
                        </Badge>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <p className="text-sm">{selectedProject.type}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Progress</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={selectedProject.progress || 0} className="flex-1" />
                          <span className="text-sm font-medium">{selectedProject.progress || 0}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Owner</Label>
                        <p className="text-sm">{teamMembers?.find(m => m.id === selectedProject.ownerId)?.name || 'Unassigned'}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Start Date</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Due Date</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedProject.dueDate ? new Date(selectedProject.dueDate).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Created</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedProject.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-6">
                    <Button className="flex-1">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Project
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Team
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Timeline
                    </Button>
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

export default ProjectWorkspace;