'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataTable } from '../shared/DataTable';
import {
  Settings,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Key,
  Lock,
  Unlock,
  FileText,
  Code,
  Database,
  Server,
  Network,
  Globe,
  Users,
  User,
  Crown,
  Tag,
  Calendar,
  Star,
  Heart,
  Bookmark,
  Share,
  ArrowLeft,
  GitBranch,
  Layers,
  Workflow,
  Zap,
  Bell,
  Mail,
  Phone,
  MapPin,
  Home,
  Building,
  Archive,
  BookOpen,
  Terminal,
  Monitor,
  Cpu,
  Play,
  Pause,
  Square,
  RotateCcw,
  Save,
  Loader2,
} from 'lucide-react';

// Hooks and Services
import { useConditions } from '../../hooks/useConditions';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';

// Types
import type { 
  Condition, 
  ConditionTemplate, 
  ConditionValidationResult,
  ConditionTest,
  ConditionAnalytics 
} from '../../types/condition.types';

// Utils
import { hasPermission } from '../../utils/permission.utils';
import { formatDate, formatDateTime } from '../../utils/format.utils';

// Sub-components
import ConditionBuilder from './ConditionBuilder';
import ConditionTemplates from './ConditionTemplates';
import ConditionValidator from './ConditionValidator';

interface ConditionManagementProps {
  className?: string;
}

interface ConditionStats {
  total: number;
  active: number;
  inactive: number;
  templates: number;
  policies: number;
  avgComplexity: number;
  recentlyCreated: number;
  validationErrors: number;
}

interface ViewMode {
  type: 'list' | 'builder' | 'templates' | 'validator' | 'details';
  data?: any;
}

const CONDITION_TYPES = [
  { value: 'time', label: 'Time-based', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  { value: 'location', label: 'Location-based', icon: MapPin, color: 'bg-green-100 text-green-800' },
  { value: 'attribute', label: 'Attribute-based', icon: Tag, color: 'bg-purple-100 text-purple-800' },
  { value: 'role', label: 'Role-based', icon: Crown, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'resource', label: 'Resource-based', icon: Database, color: 'bg-red-100 text-red-800' },
  { value: 'network', label: 'Network-based', icon: Network, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'custom', label: 'Custom', icon: Settings, color: 'bg-gray-100 text-gray-800' },
];

const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Equals', symbol: '=' },
  { value: 'not_equals', label: 'Not Equals', symbol: '!=' },
  { value: 'greater_than', label: 'Greater Than', symbol: '>' },
  { value: 'less_than', label: 'Less Than', symbol: '<' },
  { value: 'greater_equal', label: 'Greater or Equal', symbol: '>=' },
  { value: 'less_equal', label: 'Less or Equal', symbol: '<=' },
  { value: 'contains', label: 'Contains', symbol: 'CONTAINS' },
  { value: 'starts_with', label: 'Starts With', symbol: 'STARTS_WITH' },
  { value: 'ends_with', label: 'Ends With', symbol: 'ENDS_WITH' },
  { value: 'in', label: 'In List', symbol: 'IN' },
  { value: 'not_in', label: 'Not In List', symbol: 'NOT_IN' },
  { value: 'between', label: 'Between', symbol: 'BETWEEN' },
  { value: 'regex', label: 'Regex Match', symbol: 'REGEX' },
];

const CONDITION_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'error', label: 'Error', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
];

const ConditionManagement: React.FC<ConditionManagementProps> = ({
  className = ''
}) => {
  // State Management
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [templates, setTemplates] = useState<ConditionTemplate[]>([]);
  const [analytics, setAnalytics] = useState<ConditionAnalytics | null>(null);
  const [stats, setStats] = useState<ConditionStats | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // View Management
  const [currentView, setCurrentView] = useState<ViewMode>({ type: 'list' });
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);
  
  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Dialog State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  // Bulk Operations
  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Hooks
  const { user: currentUser } = useCurrentUser();
  const {
    getConditions,
    getConditionTemplates,
    getConditionAnalytics,
    createCondition,
    updateCondition,
    deleteCondition,
    duplicateCondition,
    validateCondition,
    testCondition,
    exportConditions,
    importConditions
  } = useConditions();
  const { checkPermission } = usePermissions();
  const { subscribe, unsubscribe } = useRBACWebSocket();

  // Computed Properties
  const canManageConditions = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'condition:manage');
  }, [currentUser]);

  const canCreateConditions = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'condition:create');
  }, [currentUser]);

  const canDeleteConditions = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'condition:delete');
  }, [currentUser]);

  const filteredConditions = useMemo(() => {
    let filtered = conditions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(condition =>
        condition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        condition.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        condition.expression.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(condition => condition.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(condition => condition.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'created_at':
          aValue = a.created_at;
          bValue = b.created_at;
          break;
        case 'updated_at':
          aValue = a.updated_at;
          bValue = b.updated_at;
          break;
        case 'complexity':
          aValue = a.complexity || 0;
          bValue = b.complexity || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [conditions, searchTerm, typeFilter, statusFilter, sortBy, sortOrder]);

  const conditionStats = useMemo(() => {
    if (!conditions.length) return null;

    const total = conditions.length;
    const active = conditions.filter(c => c.status === 'active').length;
    const inactive = conditions.filter(c => c.status === 'inactive').length;
    const templateCount = templates.length;
    const avgComplexity = conditions.reduce((sum, c) => sum + (c.complexity || 0), 0) / total;
    const recentlyCreated = conditions.filter(c => 
      new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    const validationErrors = conditions.filter(c => c.status === 'error').length;

    return {
      total,
      active,
      inactive,
      templates: templateCount,
      policies: conditions.filter(c => c.is_policy).length,
      avgComplexity,
      recentlyCreated,
      validationErrors
    };
  }, [conditions, templates]);

  // Data Loading
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [conditionsData, templatesData, analyticsData] = await Promise.all([
        getConditions(),
        getConditionTemplates(),
        getConditionAnalytics()
      ]);

      setConditions(conditionsData.items);
      setTemplates(templatesData.items);
      setAnalytics(analyticsData);

    } catch (err) {
      console.error('Error loading condition data:', err);
      setError('Failed to load condition data');
    } finally {
      setLoading(false);
    }
  }, [getConditions, getConditionTemplates, getConditionAnalytics]);

  // Real-time Updates
  useEffect(() => {
    const handleConditionUpdate = (data: any) => {
      loadData();
    };

    subscribe('conditions', handleConditionUpdate);
    
    return () => {
      unsubscribe('conditions', handleConditionUpdate);
    };
  }, [subscribe, unsubscribe, loadData]);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Effect for bulk actions visibility
  useEffect(() => {
    setShowBulkActions(selectedConditions.size > 0);
  }, [selectedConditions.size]);

  // Action Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const handleCreateCondition = useCallback(() => {
    setCurrentView({ type: 'builder', data: null });
  }, []);

  const handleEditCondition = useCallback((condition: Condition) => {
    setCurrentView({ type: 'builder', data: condition });
  }, []);

  const handleViewCondition = useCallback((condition: Condition) => {
    setCurrentView({ type: 'details', data: condition });
  }, []);

  const handleDuplicateCondition = useCallback(async (condition: Condition) => {
    if (!canCreateConditions) return;

    try {
      await duplicateCondition(condition.id);
      await loadData();
    } catch (err) {
      console.error('Error duplicating condition:', err);
      setError('Failed to duplicate condition');
    }
  }, [canCreateConditions, duplicateCondition, loadData]);

  const handleDeleteCondition = useCallback(async (conditionId: string) => {
    if (!canDeleteConditions) return;

    try {
      await deleteCondition(conditionId);
      setShowDeleteDialog(false);
      setSelectedCondition(null);
      await loadData();
    } catch (err) {
      console.error('Error deleting condition:', err);
      setError('Failed to delete condition');
    }
  }, [canDeleteConditions, deleteCondition, loadData]);

  const handleSaveCondition = useCallback(async (conditionData: Partial<Condition>) => {
    try {
      if (currentView.data?.id) {
        await updateCondition(currentView.data.id, conditionData);
      } else {
        await createCondition(conditionData);
      }
      setCurrentView({ type: 'list' });
      await loadData();
    } catch (err) {
      console.error('Error saving condition:', err);
      setError('Failed to save condition');
    }
  }, [currentView.data, updateCondition, createCondition, loadData]);

  const handleTestCondition = useCallback(async (condition: Condition, testData: any) => {
    try {
      const result = await testCondition(condition.id, testData);
      return result;
    } catch (err) {
      console.error('Error testing condition:', err);
      throw err;
    }
  }, [testCondition]);

  const handleExportConditions = useCallback(async (format: 'json' | 'yaml' | 'csv') => {
    try {
      const data = await exportConditions(format, Array.from(selectedConditions));
      // Trigger download
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 
              format === 'yaml' ? 'text/yaml' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conditions-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExportDialog(false);
    } catch (err) {
      console.error('Error exporting conditions:', err);
      setError('Failed to export conditions');
    }
  }, [exportConditions, selectedConditions]);

  const handleImportConditions = useCallback(async (file: File) => {
    try {
      await importConditions(file);
      setShowImportDialog(false);
      await loadData();
    } catch (err) {
      console.error('Error importing conditions:', err);
      setError('Failed to import conditions');
    }
  }, [importConditions, loadData]);

  // Selection Handlers
  const handleSelectCondition = useCallback((conditionId: string, selected: boolean) => {
    setSelectedConditions(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(conditionId);
      } else {
        newSet.delete(conditionId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedConditions(new Set(filteredConditions.map(c => c.id)));
    } else {
      setSelectedConditions(new Set());
    }
  }, [filteredConditions]);

  // Render Methods
  const renderHeader = () => (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Condition Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage ABAC conditions, templates, and policies for advanced access control
        </p>
        {conditionStats && (
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <span>{conditionStats.total} total conditions</span>
            <span>{conditionStats.active} active</span>
            <span>{conditionStats.templates} templates</span>
            <span>{conditionStats.validationErrors} validation errors</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {currentView.type !== 'list' && (
          <Button
            variant="outline"
            onClick={() => setCurrentView({ type: 'list' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        )}
        
        {canCreateConditions && currentView.type === 'list' && (
          <Button onClick={handleCreateCondition}>
            <Plus className="h-4 w-4 mr-2" />
            Create Condition
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setCurrentView({ type: 'templates' })}>
              <FileText className="h-4 w-4 mr-2" />
              View Templates
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentView({ type: 'validator' })}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Condition Validator
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Conditions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export Conditions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh data</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  const renderStatsCards = () => {
    if (!conditionStats) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{conditionStats.total}</div>
                <div className="text-sm text-gray-500">Total Conditions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{conditionStats.active}</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{conditionStats.templates}</div>
                <div className="text-sm text-gray-500">Templates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{conditionStats.validationErrors}</div>
                <div className="text-sm text-gray-500">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFiltersAndSearch = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conditions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {CONDITION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {CONDITION_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="created_at">Created</SelectItem>
              <SelectItem value="updated_at">Updated</SelectItem>
              <SelectItem value="complexity">Complexity</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderConditionsList = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Conditions ({filteredConditions.length})</span>
          </CardTitle>
          
          {selectedConditions.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedConditions.size} selected
              </span>
              <Button size="sm" variant="outline">
                Bulk Actions
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={filteredConditions}
          columns={[
            {
              id: 'select',
              header: ({ table }) => (
                <input
                  type="checkbox"
                  checked={table.getIsAllPageRowsSelected()}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              ),
              cell: ({ row }) => (
                <input
                  type="checkbox"
                  checked={selectedConditions.has(row.original.id)}
                  onChange={(e) => 
                    handleSelectCondition(row.original.id, e.target.checked)
                  }
                />
              ),
            },
            {
              accessorKey: 'name',
              header: 'Name',
              cell: ({ row }) => {
                const condition = row.original;
                const typeConfig = CONDITION_TYPES.find(t => t.value === condition.type);
                const TypeIcon = typeConfig?.icon || Settings;
                
                return (
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded ${typeConfig?.color || 'bg-gray-100'}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{condition.name}</div>
                      <div className="text-sm text-gray-500">
                        {condition.description?.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                );
              },
            },
            {
              accessorKey: 'type',
              header: 'Type',
              cell: ({ row }) => {
                const typeConfig = CONDITION_TYPES.find(t => t.value === row.getValue('type'));
                return (
                  <Badge className={typeConfig?.color}>
                    {typeConfig?.label || row.getValue('type')}
                  </Badge>
                );
              },
            },
            {
              accessorKey: 'status',
              header: 'Status',
              cell: ({ row }) => {
                const statusConfig = CONDITION_STATUSES.find(s => s.value === row.getValue('status'));
                const StatusIcon = statusConfig?.icon || Info;
                return (
                  <Badge className={statusConfig?.color} variant="secondary">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig?.label || row.getValue('status')}
                  </Badge>
                );
              },
            },
            {
              accessorKey: 'complexity',
              header: 'Complexity',
              cell: ({ row }) => {
                const complexity = row.getValue('complexity') as number || 0;
                return (
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(complexity * 10, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{complexity.toFixed(1)}</span>
                  </div>
                );
              },
            },
            {
              accessorKey: 'updated_at',
              header: 'Last Updated',
              cell: ({ row }) => formatDate(row.getValue('updated_at')),
            },
            {
              id: 'actions',
              header: 'Actions',
              cell: ({ row }) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewCondition(row.original)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {canManageConditions && (
                      <>
                        <DropdownMenuItem onClick={() => handleEditCondition(row.original)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateCondition(row.original)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCondition(row.original);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
        />
      </CardContent>
    </Card>
  );

  const renderConditionDetails = () => {
    const condition = currentView.data as Condition;
    if (!condition) return null;

    const typeConfig = CONDITION_TYPES.find(t => t.value === condition.type);
    const statusConfig = CONDITION_STATUSES.find(s => s.value === condition.status);
    const TypeIcon = typeConfig?.icon || Settings;
    const StatusIcon = statusConfig?.icon || Info;

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-lg ${typeConfig?.color || 'bg-gray-100'}`}>
                  <TypeIcon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{condition.name}</h2>
                  <p className="text-gray-600 mt-1">{condition.description}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <Badge className={typeConfig?.color}>
                      {typeConfig?.label}
                    </Badge>
                    <Badge className={statusConfig?.color} variant="secondary">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig?.label}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {canManageConditions && (
                  <Button onClick={() => handleEditCondition(condition)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => setCurrentView({ type: 'validator', data: condition })}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Test
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Expression Details */}
        <Card>
          <CardHeader>
            <CardTitle>Condition Expression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <code className="text-sm">{condition.expression}</code>
            </div>
            {condition.metadata?.parsed_expression && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Parsed Structure</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                  {JSON.stringify(condition.metadata.parsed_expression, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata and Properties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-500">Complexity</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((condition.complexity || 0) * 10, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm">{(condition.complexity || 0).toFixed(1)}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Created</Label>
                <div className="text-sm mt-1">{formatDateTime(condition.created_at)}</div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                <div className="text-sm mt-1">{formatDateTime(condition.updated_at)}</div>
              </div>
              
              {condition.tags && condition.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {condition.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{condition.usage_count || 0}</div>
                  <div className="text-sm text-gray-500">Times Used</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{condition.policy_count || 0}</div>
                  <div className="text-sm text-gray-500">In Policies</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{condition.success_rate || 0}%</div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{condition.avg_execution_time || 0}ms</div>
                  <div className="text-sm text-gray-500">Avg Execution</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-6 ${className}`}
    >
      {renderHeader()}

      {/* Main Content */}
      {currentView.type === 'list' && (
        <>
          {renderStatsCards()}
          {renderFiltersAndSearch()}
          {renderConditionsList()}
        </>
      )}

      {currentView.type === 'builder' && (
        <ConditionBuilder
          condition={currentView.data}
          onSave={handleSaveCondition}
          onCancel={() => setCurrentView({ type: 'list' })}
          templates={templates}
        />
      )}

      {currentView.type === 'templates' && (
        <ConditionTemplates
          templates={templates}
          onUseTemplate={(template) => 
            setCurrentView({ type: 'builder', data: { template } })
          }
          onEditTemplate={(template) => 
            setCurrentView({ type: 'builder', data: template })
          }
        />
      )}

      {currentView.type === 'validator' && (
        <ConditionValidator
          condition={currentView.data}
          onTest={handleTestCondition}
        />
      )}

      {currentView.type === 'details' && renderConditionDetails()}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Condition</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCondition?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCondition && handleDeleteCondition(selectedCondition.id)}
            >
              Delete Condition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Conditions</DialogTitle>
            <DialogDescription>
              Choose the format to export selected conditions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col"
              onClick={() => handleExportConditions('json')}
            >
              <Code className="h-6 w-6 mb-2" />
              JSON
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col"
              onClick={() => handleExportConditions('yaml')}
            >
              <FileText className="h-6 w-6 mb-2" />
              YAML
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col"
              onClick={() => handleExportConditions('csv')}
            >
              <Database className="h-6 w-6 mb-2" />
              CSV
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Conditions</DialogTitle>
            <DialogDescription>
              Upload a file to import conditions from JSON, YAML, or CSV format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600">
                Drag and drop a file here, or click to select
              </p>
              <input
                type="file"
                accept=".json,.yaml,.yml,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImportConditions(file);
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Bulk Actions */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    {selectedConditions.size} condition{selectedConditions.size !== 1 ? 's' : ''} selected
                  </span>
                  <Separator orientation="vertical" className="h-6" />
                  <Button size="sm" variant="outline">
                    Enable
                  </Button>
                  <Button size="sm" variant="outline">
                    Disable
                  </Button>
                  <Button size="sm" variant="outline">
                    Export
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedConditions(new Set())}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConditionManagement;