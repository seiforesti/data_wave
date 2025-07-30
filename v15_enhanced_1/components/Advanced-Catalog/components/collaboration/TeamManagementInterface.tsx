// ============================================================================
// TEAM MANAGEMENT INTERFACE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced interface for team management and organizational structure
// Integrates with backend collaboration APIs for comprehensive team coordination
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Shield, 
  Crown,
  Search,
  Filter,
  Edit3,
  Eye,
  Trash2,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Award,
  Target,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  User,
  UserX,
  UserCheck,
  Briefcase,
  GraduationCap,
  Star,
  Network,
  MessageSquare,
  Bell,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Minus,
  Building,
  Department,
  Globe,
  Lock,
  Unlock,
  Key,
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
  TeamMember,
  TeamRole,
  TeamPermission,
  TeamDepartment,
  TeamInvitation,
  TeamMetrics,
  MemberStatus,
  MemberActivity,
  RoleHierarchy,
  PermissionGroup
} from '../../types/collaboration.types';
import { toast } from 'sonner';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TeamManagementInterfaceProps {
  className?: string;
  workspaceId?: string;
  onMemberSelect?: (member: TeamMember) => void;
  onRoleSelect?: (role: TeamRole) => void;
}

interface MemberFilter {
  status: string;
  role: string;
  department: string;
  location: string;
  joinDate: string;
}

interface TeamOverview {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  totalRoles: number;
  averageEngagement: number;
  topPerformers: TeamMember[];
  recentActivity: MemberActivity[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TeamManagementInterface: React.FC<TeamManagementInterfaceProps> = ({
  className = '',
  workspaceId,
  onMemberSelect,
  onRoleSelect
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<MemberFilter>({
    status: 'all',
    role: 'all',
    department: 'all',
    location: 'all',
    joinDate: 'all'
  });
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'org-chart'>('grid');

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    teamMembers,
    invitations,
    roles,
    departments,
    permissions,
    metrics,
    isLoading,
    error,
    refetch,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    inviteMember,
    updateMemberRole,
    updateMemberPermissions,
    createRole,
    updateRole,
    deleteRole
  } = useCollaboration(workspaceId);

  const {
    getTeamAnalytics,
    getMemberPerformance,
    getEngagementMetrics
  } = useCatalogAnalytics();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredMembers = useMemo(() => {
    if (!teamMembers) return [];

    return teamMembers.filter(member => {
      const matchesSearch = searchQuery === '' || 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.username.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedFilters.status === 'all' || member.status === selectedFilters.status;
      const matchesRole = selectedFilters.role === 'all' || member.role === selectedFilters.role;
      const matchesDepartment = selectedFilters.department === 'all' || member.department === selectedFilters.department;
      const matchesLocation = selectedFilters.location === 'all' || member.location === selectedFilters.location;

      const matchesJoinDate = (() => {
        if (selectedFilters.joinDate === 'all') return true;
        const now = new Date();
        const joinDate = new Date(member.joinedAt);
        const daysDiff = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (selectedFilters.joinDate) {
          case '7d': return daysDiff <= 7;
          case '30d': return daysDiff <= 30;
          case '90d': return daysDiff <= 90;
          case '1y': return daysDiff <= 365;
          default: return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesRole && matchesDepartment && matchesLocation && matchesJoinDate;
    });
  }, [teamMembers, searchQuery, selectedFilters]);

  const teamOverview = useMemo((): TeamOverview => {
    if (!teamMembers || !invitations) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        pendingInvitations: 0,
        totalRoles: 0,
        averageEngagement: 0,
        topPerformers: [],
        recentActivity: []
      };
    }

    const activeMembers = teamMembers.filter(member => member.status === 'active').length;
    const pendingInvitations = invitations.filter(inv => inv.status === 'pending').length;
    const totalRoles = roles?.length || 0;

    // Calculate average engagement (mock calculation)
    const averageEngagement = teamMembers.length > 0 
      ? teamMembers.reduce((sum, member) => sum + (member.engagementScore || 0), 0) / teamMembers.length 
      : 0;

    // Get top performers (mock data)
    const topPerformers = teamMembers
      .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
      .slice(0, 5);

    return {
      totalMembers: teamMembers.length,
      activeMembers,
      pendingInvitations,
      totalRoles,
      averageEngagement,
      topPerformers,
      recentActivity: [] // Would be populated from backend
    };
  }, [teamMembers, invitations, roles]);

  const membersByRole = useMemo(() => {
    if (!filteredMembers) return {};
    
    return filteredMembers.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredMembers]);

  const membersByDepartment = useMemo(() => {
    if (!filteredMembers) return {};
    
    return filteredMembers.reduce((acc, member) => {
      acc[member.department] = (acc[member.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredMembers]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleMemberClick = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    onMemberSelect?.(member);
  }, [onMemberSelect]);

  const handleMemberSelection = useCallback((memberId: string, selected: boolean) => {
    setSelectedMembers(prev => 
      selected 
        ? [...prev, memberId]
        : prev.filter(id => id !== memberId)
    );
  }, []);

  const handleInviteMember = useCallback(async (invitationData: Partial<TeamInvitation>) => {
    try {
      await inviteMember(invitationData);
      toast.success('Invitation sent successfully');
      setIsInviteDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to send invitation');
      console.error('Invite member error:', error);
    }
  }, [inviteMember, refetch]);

  const handleUpdateMemberRole = useCallback(async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole(memberId, newRole);
      toast.success('Member role updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update member role');
      console.error('Update role error:', error);
    }
  }, [updateMemberRole, refetch]);

  const handleRemoveMember = useCallback(async (memberId: string) => {
    try {
      await removeTeamMember(memberId);
      toast.success('Member removed successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to remove member');
      console.error('Remove member error:', error);
    }
  }, [removeTeamMember, refetch]);

  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedMembers.length === 0) return;

    try {
      switch (action) {
        case 'activate':
          await Promise.all(selectedMembers.map(id => updateTeamMember(id, { status: 'active' })));
          toast.success(`${selectedMembers.length} members activated`);
          break;
        case 'deactivate':
          await Promise.all(selectedMembers.map(id => updateTeamMember(id, { status: 'inactive' })));
          toast.success(`${selectedMembers.length} members deactivated`);
          break;
        case 'remove':
          await Promise.all(selectedMembers.map(id => removeTeamMember(id)));
          toast.success(`${selectedMembers.length} members removed`);
          break;
      }
      setSelectedMembers([]);
      refetch();
    } catch (error) {
      toast.error('Bulk action failed');
      console.error('Bulk action error:', error);
    }
  }, [selectedMembers, updateTeamMember, removeTeamMember, refetch]);

  const handleFilterChange = useCallback((filterType: keyof MemberFilter, value: string) => {
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
              Error Loading Team Management
            </CardTitle>
            <CardDescription>
              {error.message || 'Failed to load team data'}
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
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teamOverview.totalMembers}</div>
          <p className="text-xs text-muted-foreground">
            {teamOverview.activeMembers} active
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teamOverview.pendingInvitations}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting response
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Roles</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teamOverview.totalRoles}</div>
          <p className="text-xs text-muted-foreground">
            Defined roles
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engagement</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teamOverview.averageEngagement.toFixed(1)}%</div>
          <Progress value={teamOverview.averageEngagement} className="mt-2" />
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
      </Card>
    </div>
  );

  const renderMemberFilters = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Member Filters
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-filter">Role</Label>
            <Select value={selectedFilters.role} onValueChange={(value) => handleFilterChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles?.map(role => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department-filter">Department</Label>
            <Select value={selectedFilters.department} onValueChange={(value) => handleFilterChange('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location-filter">Location</Label>
            <Select value={selectedFilters.location} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="join-date-filter">Join Date</Label>
            <Select value={selectedFilters.joinDate} onValueChange={(value) => handleFilterChange('joinDate', value)}>
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

  const renderMembersList = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            {filteredMembers.length} of {teamMembers?.length || 0} members
            {selectedMembers.length > 0 && ` • ${selectedMembers.length} selected`}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {selectedMembers.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate Members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate Members
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction('remove')} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Members
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <Activity className="h-4 w-4" />
          </Button>
          
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team workspace.
                </DialogDescription>
              </DialogHeader>
              {/* Invite form would go here */}
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
                      checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMembers(filteredMembers.map(member => member.id));
                        } else {
                          setSelectedMembers([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map(member => (
                  <TableRow 
                    key={member.id} 
                    className="cursor-pointer"
                    onClick={() => handleMemberClick(member)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={(checked) => handleMemberSelection(member.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role}</Badge>
                    </TableCell>
                    <TableCell>{member.department}</TableCell>
                    <TableCell>
                      <Badge variant={
                        member.status === 'active' ? 'default' :
                        member.status === 'inactive' ? 'secondary' :
                        member.status === 'pending' ? 'destructive' : 'outline'
                      }>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.lastActiveAt ? (
                        <span className="text-sm text-muted-foreground">
                          {new Date(member.lastActiveAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleMemberClick(member)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Member
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Key className="h-4 w-4 mr-2" />
                            Manage Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map(member => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="cursor-pointer"
                  onClick={() => handleMemberClick(member)}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={selectedMembers.includes(member.id)}
                            onCheckedChange={(checked) => handleMemberSelection(member.id, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-base">{member.name}</CardTitle>
                            <CardDescription className="text-sm">{member.email}</CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleMemberClick(member)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit Member
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Key className="h-4 w-4 mr-2" />
                              Manage Permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                        <Badge variant={
                          member.status === 'active' ? 'default' :
                          member.status === 'inactive' ? 'secondary' :
                          member.status === 'pending' ? 'destructive' : 'outline'
                        } className="text-xs">
                          {member.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          <span>{member.department}</span>
                        </div>
                        {member.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{member.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {member.engagementScore !== undefined && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>Engagement</span>
                            <span>{member.engagementScore.toFixed(1)}%</span>
                          </div>
                          <Progress value={member.engagementScore} className="h-1" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderTeamAnalytics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members by Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(membersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="font-medium">{role}</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-sm text-muted-foreground">
                    ({((count / filteredMembers.length) * 100).toFixed(1)}%)
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
            <Building className="h-5 w-5" />
            Members by Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(membersByDepartment).map(([department, count]) => (
              <div key={department} className="flex items-center justify-between">
                <span className="font-medium">{department}</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-sm text-muted-foreground">
                    ({((count / filteredMembers.length) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
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
            <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
            <p className="text-muted-foreground">
              Manage team members, roles, and organizational structure
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
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
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            {renderMemberFilters()}
            {renderMembersList()}
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>Define and manage team roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Role management content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Structure</CardTitle>
                <CardDescription>Organize teams by departments and hierarchies</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Department management content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Invitations</CardTitle>
                <CardDescription>Manage pending and sent invitations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Invitation management content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {renderTeamAnalytics()}
          </TabsContent>
        </Tabs>

        {/* Selected Member Details Modal */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedMember(null)}
            >
              <motion.div
                className="bg-background border rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedMember.avatar} />
                        <AvatarFallback className="text-lg">
                          {selectedMember.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                        <p className="text-sm text-muted-foreground">@{selectedMember.username}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMember(null)}
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Role</Label>
                        <Badge variant="outline">{selectedMember.role}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant={
                          selectedMember.status === 'active' ? 'default' :
                          selectedMember.status === 'inactive' ? 'secondary' :
                          selectedMember.status === 'pending' ? 'destructive' : 'outline'
                        }>
                          {selectedMember.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Department</Label>
                        <p className="text-sm">{selectedMember.department}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <p className="text-sm">{selectedMember.location || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Joined</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedMember.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Last Active</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedMember.lastActiveAt 
                            ? new Date(selectedMember.lastActiveAt).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {selectedMember.engagementScore !== undefined && (
                      <div>
                        <Label className="text-sm font-medium">Engagement Score</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={selectedMember.engagementScore} className="flex-1" />
                          <span className="text-sm font-medium">{selectedMember.engagementScore.toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedMember.bio && (
                      <div>
                        <Label className="text-sm font-medium">Bio</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedMember.bio}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
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

export default TeamManagementInterface;