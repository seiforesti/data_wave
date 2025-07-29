// ============================================================================
// CATALOG COLLABORATION HUB - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Main collaboration hub for Advanced Catalog teams and governance
// Provides comprehensive team management, activity tracking, and collaboration tools
// ============================================================================

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Activity, 
  MessageSquare, 
  Settings,
  Plus,
  Search,
  Filter,
  MoreVertical,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  Target,
  Zap,
  BarChart3,
  Bell,
  Star,
  Shield,
  Globe,
  Eye,
  Edit3,
  Archive,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Hooks and Services
import { 
  useCatalogCollaboration,
  useCollaborationHubs,
  useCollaborationAnalytics,
  type CollaborationState,
  type CollaborationOperations
} from '../../hooks/useCatalogCollaboration';

// Types and Constants
import type {
  CatalogCollaborationHub,
  CollaborationTeam,
  CollaborationActivity,
  TeamType,
  TeamPurpose
} from '../../types/collaboration.types';

import {
  COLLABORATION_HUB_FEATURES,
  TEAM_TYPES,
  TEAM_PURPOSES,
  COLLABORATION_METRICS,
  COLLABORATION_HUB_DEFAULTS
} from '../../constants/collaboration-constants';

// Utils
import {
  formatHubDisplayName,
  formatTeamDisplayName,
  formatCollaborationDate,
  calculateTeamCollaborationScore,
  generateActivitySummary,
  calculateCollaborationHealth,
  transformHubForDisplay
} from '../../utils/collaboration-utils';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface CatalogCollaborationHubProps {
  hubId?: number;
  defaultView?: 'overview' | 'teams' | 'activities' | 'analytics';
  className?: string;
  onHubChange?: (hubId: number) => void;
  onTeamCreate?: (team: CollaborationTeam) => void;
  embedded?: boolean;
}

interface HubMetrics {
  totalTeams: number;
  totalMembers: number;
  activeMembers: number;
  recentActivities: number;
  collaborationScore: number;
  healthLevel: 'poor' | 'fair' | 'good' | 'excellent';
}

interface ActivityFilter {
  type?: string;
  team?: number;
  user?: string;
  timeframe: 'day' | 'week' | 'month';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CatalogCollaborationHub: React.FC<CatalogCollaborationHubProps> = ({
  hubId,
  defaultView = 'overview',
  className = '',
  onHubChange,
  onTeamCreate,
  embedded = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [selectedHubId, setSelectedHubId] = useState<number>(hubId || 0);
  const [activeView, setActiveView] = useState(defaultView);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState<TeamType | 'all'>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>({
    timeframe: 'week'
  });
  const [showCreateHub, setShowCreateHub] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ============================================================================
  // HOOKS AND DATA FETCHING
  // ============================================================================

  // Get all collaboration hubs
  const { 
    hubs, 
    isLoading: hubsLoading, 
    createHub,
    isCreating: isCreatingHub,
    refetch: refetchHubs
  } = useCollaborationHubs({
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Get collaboration data for selected hub
  const { state, operations } = useCatalogCollaboration({
    hubId: selectedHubId,
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Get analytics for selected hub
  const { 
    analytics, 
    insights, 
    compliance,
    isLoading: analyticsLoading 
  } = useCollaborationAnalytics(selectedHubId, {
    timePeriod: activityFilter.timeframe,
    autoRefresh: true
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedHub = useMemo(() => 
    hubs.find(hub => hub.id === selectedHubId),
    [hubs, selectedHubId]
  );

  const filteredTeams = useMemo(() => {
    let teams = state.teams || [];
    
    if (teamFilter !== 'all') {
      teams = teams.filter(team => team.teamType === teamFilter);
    }
    
    if (searchTerm) {
      teams = teams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return teams;
  }, [state.teams, teamFilter, searchTerm]);

  const hubMetrics = useMemo<HubMetrics>(() => {
    const teams = state.teams || [];
    const activities = state.activities || [];
    
    const totalMembers = teams.reduce((sum, team) => sum + (team.members?.length || 0), 0);
    const recentActivities = activities.filter(activity => 
      new Date(activity.createdAt).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const collaborationScore = selectedHub && activities.length > 0 
      ? calculateCollaborationHealth(selectedHub, activities).score 
      : 0;
    
    let healthLevel: 'poor' | 'fair' | 'good' | 'excellent' = 'poor';
    if (collaborationScore >= 80) healthLevel = 'excellent';
    else if (collaborationScore >= 60) healthLevel = 'good';
    else if (collaborationScore >= 40) healthLevel = 'fair';

    return {
      totalTeams: teams.length,
      totalMembers,
      activeMembers: Math.floor(totalMembers * 0.7), // Estimated active members
      recentActivities,
      collaborationScore,
      healthLevel
    };
  }, [state.teams, state.activities, selectedHub]);

  const activitySummary = useMemo(() => 
    generateActivitySummary(state.activities || [], activityFilter.timeframe),
    [state.activities, activityFilter.timeframe]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleHubSelect = useCallback((hubId: number) => {
    setSelectedHubId(hubId);
    onHubChange?.(hubId);
  }, [onHubChange]);

  const handleCreateHub = useCallback(async (hubData: {
    name: string;
    description: string;
    governanceEnabled?: boolean;
  }) => {
    try {
      const newHub = await createHub(hubData);
      setShowCreateHub(false);
      setSelectedHubId(newHub.id);
      toast.success('Collaboration hub created successfully');
    } catch (error) {
      toast.error('Failed to create collaboration hub');
    }
  }, [createHub]);

  const handleCreateTeam = useCallback(async (teamData: {
    name: string;
    description: string;
    teamType: TeamType;
    purpose: TeamPurpose;
  }) => {
    try {
      const newTeam = await operations.createTeam({
        ...teamData,
        hubId: selectedHubId
      });
      setShowCreateTeam(false);
      onTeamCreate?.(newTeam);
      toast.success('Team created successfully');
    } catch (error) {
      toast.error('Failed to create team');
    }
  }, [operations.createTeam, selectedHubId, onTeamCreate]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchHubs(),
        operations.refreshData()
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchHubs, operations.refreshData]);

  // ============================================================================
  // EFFECT HOOKS
  // ============================================================================

  useEffect(() => {
    if (hubId && hubId !== selectedHubId) {
      setSelectedHubId(hubId);
    }
  }, [hubId, selectedHubId]);

  useEffect(() => {
    if (hubs.length > 0 && !selectedHubId) {
      setSelectedHubId(hubs[0].id!);
    }
  }, [hubs, selectedHubId]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHubSelector = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Collaboration Hubs</CardTitle>
            <CardDescription>
              Select a hub to manage teams and activities
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={showCreateHub} onOpenChange={setShowCreateHub}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Hub
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Collaboration Hub</DialogTitle>
                  <DialogDescription>
                    Create a new hub to organize teams and collaboration activities
                  </DialogDescription>
                </DialogHeader>
                <CreateHubForm onSubmit={handleCreateHub} isCreating={isCreatingHub} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Select value={selectedHubId.toString()} onValueChange={(value) => handleHubSelect(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a collaboration hub" />
            </SelectTrigger>
            <SelectContent>
              {hubs.map((hub) => {
                const displayHub = transformHubForDisplay(hub);
                return (
                  <SelectItem key={hub.id} value={hub.id!.toString()}>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={displayHub.statusColor === 'green' ? 'default' : 'secondary'}
                        className="w-2 h-2 p-0 rounded-full"
                      />
                      <span>{displayHub.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        ({displayHub.teamsCount} teams)
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {selectedHub && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{hubMetrics.totalTeams}</p>
                      <p className="text-xs text-muted-foreground">Teams</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{hubMetrics.totalMembers}</p>
                      <p className="text-xs text-muted-foreground">Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">{hubMetrics.recentActivities}</p>
                      <p className="text-xs text-muted-foreground">Recent Activities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">{hubMetrics.collaborationScore}%</p>
                      <p className="text-xs text-muted-foreground">Health Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Collaboration Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Health</span>
                <Badge 
                  variant={hubMetrics.healthLevel === 'excellent' ? 'default' : 
                           hubMetrics.healthLevel === 'good' ? 'secondary' : 'destructive'}
                >
                  {hubMetrics.healthLevel.toUpperCase()}
                </Badge>
              </div>
              <Progress value={hubMetrics.collaborationScore} className="mb-4" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Active Teams</p>
                  <p className="font-medium">{hubMetrics.totalTeams}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Active Members</p>
                  <p className="font-medium">{hubMetrics.activeMembers}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Recent Activity Trends</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Weekly Activities</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activitySummary.totalActivities}</span>
                    <Badge 
                      variant={activitySummary.trendDirection === 'up' ? 'default' : 
                               activitySummary.trendDirection === 'down' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {activitySummary.trendDirection === 'up' ? '↗' : 
                       activitySummary.trendDirection === 'down' ? '↘' : '→'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Active Contributors</span>
                  <span className="font-medium">{activitySummary.uniqueUsers}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top Activity Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activitySummary.topActivities.map((activity, index) => (
              <div key={activity.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                  <span className="text-sm font-medium capitalize">
                    {activity.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ 
                        width: `${(activity.count / Math.max(...activitySummary.topActivities.map(a => a.count))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{activity.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTeamsTab = () => (
    <div className="space-y-6">
      {/* Teams Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage teams and their collaboration activities
          </p>
        </div>
        <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new collaboration team for your hub
              </DialogDescription>
            </DialogHeader>
            <CreateTeamForm onSubmit={handleCreateTeam} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={teamFilter} onValueChange={(value) => setTeamFilter(value as TeamType | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(TEAM_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {key.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      <div className="grid gap-4">
        {filteredTeams.map((team) => (
          <TeamCard 
            key={team.id} 
            team={team} 
            activities={state.activities?.filter(a => a.teamId === team.id) || []}
            onEdit={() => {/* Handle edit */}}
            onArchive={() => {/* Handle archive */}}
          />
        ))}
        
        {filteredTeams.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No teams found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || teamFilter !== 'all' 
                  ? 'No teams match your current filters' 
                  : 'Get started by creating your first team'}
              </p>
              {!searchTerm && teamFilter === 'all' && (
                <Button onClick={() => setShowCreateTeam(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Team
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  // ============================================================================
  // LOADING AND ERROR STATES
  // ============================================================================

  if (hubsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading collaboration hubs...</p>
        </div>
      </div>
    );
  }

  if (hubs.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Collaboration Hubs</h3>
          <p className="text-muted-foreground mb-4">
            Create your first collaboration hub to start organizing teams and activities
          </p>
          <Button onClick={() => setShowCreateHub(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Hub
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hub Selector */}
      {renderHubSelector()}

      {/* Main Content */}
      {selectedHub && (
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            {renderOverviewTab()}
          </TabsContent>
          
          <TabsContent value="teams" className="mt-6">
            {renderTeamsTab()}
          </TabsContent>
          
          <TabsContent value="activities" className="mt-6">
            <ActivitiesView 
              activities={state.activities || []} 
              filter={activityFilter}
              onFilterChange={setActivityFilter}
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <AnalyticsView 
              analytics={analytics}
              insights={insights}
              compliance={compliance}
              isLoading={analyticsLoading}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const CreateHubForm: React.FC<{
  onSubmit: (data: any) => void;
  isCreating: boolean;
}> = ({ onSubmit, isCreating }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    governanceEnabled: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Hub Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter hub name"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter hub description"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create Hub'}
        </Button>
      </div>
    </form>
  );
};

const CreateTeamForm: React.FC<{
  onSubmit: (data: any) => void;
}> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teamType: 'data_stewardship' as TeamType,
    purpose: 'asset_governance' as TeamPurpose
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Team Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter team name"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter team description"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Team Type</label>
        <Select value={formData.teamType} onValueChange={(value) => setFormData({ ...formData, teamType: value as TeamType })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TEAM_TYPES).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {key.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Purpose</label>
        <Select value={formData.purpose} onValueChange={(value) => setFormData({ ...formData, purpose: value as TeamPurpose })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TEAM_PURPOSES).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {key.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">Create Team</Button>
      </div>
    </form>
  );
};

const TeamCard: React.FC<{
  team: CollaborationTeam;
  activities: CollaborationActivity[];
  onEdit: () => void;
  onArchive: () => void;
}> = ({ team, activities, onEdit, onArchive }) => {
  const collaborationScore = calculateTeamCollaborationScore(team, activities);
  const displayTeam = transformTeamForDisplay(team);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{displayTeam.displayName}</CardTitle>
            <CardDescription className="mt-1">
              {displayTeam.purpose} • {displayTeam.membersCount} members
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onEdit}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Team
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="w-4 h-4 mr-2" />
                Archive Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={displayTeam.isActive ? 'default' : 'secondary'}>
                {displayTeam.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {displayTeam.type}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium">{collaborationScore}%</p>
              <p className="text-xs text-muted-foreground">Collaboration</p>
            </div>
            <Progress value={collaborationScore} className="w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ActivitiesView: React.FC<{
  activities: CollaborationActivity[];
  filter: ActivityFilter;
  onFilterChange: (filter: ActivityFilter) => void;
}> = ({ activities, filter, onFilterChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 20).map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <Avatar className="w-8 h-8">
                <AvatarFallback>{activity.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.activityType}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCollaborationDate(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AnalyticsView: React.FC<{
  analytics: any;
  insights: any;
  compliance: any;
  isLoading: boolean;
}> = ({ analytics, insights, compliance, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Collaboration Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Analytics data will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatalogCollaborationHub;