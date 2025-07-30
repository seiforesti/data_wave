// ============================================================================
// BUSINESS GLOSSARY MANAGER - ADVANCED CATALOG ANALYTICS
// ============================================================================
// Enterprise-grade business glossary management providing comprehensive business
// term management, semantic relationships, and intelligent term suggestions
// ============================================================================

"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Link,
  Users,
  Tag,
  Star,
  Globe,
  Target,
  Activity,
  TrendingUp,
  Database,
  RefreshCw,
  Download,
  Upload,
  Settings,
  FileText,
  Brain,
  Network,
  Layers,
  Bookmark,
  Share2,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Clock,
  Zap,
  Shield,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Code,
  Type,
  Hash
} from 'lucide-react';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Button,
} from '@/components/ui/button';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Input,
} from '@/components/ui/input';
import {
  Label,
} from '@/components/ui/label';
import {
  Textarea,
} from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Switch,
} from '@/components/ui/switch';
import {
  Progress,
} from '@/components/ui/progress';
import {
  ScrollArea,
} from '@/components/ui/scroll-area';
import {
  Separator,
} from '@/components/ui/separator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Chart Components
import {
  ResponsiveContainer,
  TreeMap,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Network as NetworkChart
} from 'recharts';

// Services and Types
import { 
  useBusinessGlossary,
  useGlossarySearch,
  useGlossaryRelationships
} from '../../hooks/useBusinessGlossary';
import { 
  BusinessGlossaryTerm,
  TermRelationship,
  GlossaryCategory,
  TermUsage,
  GlossaryMetrics,
  TermApproval,
  GlossaryConfig
} from '../../types/catalog-core.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface BusinessGlossaryManagerProps {
  className?: string;
  enableBulkOperations?: boolean;
  enableApprovalWorkflow?: boolean;
  onTermCreated?: (term: BusinessGlossaryTerm) => void;
  onTermUpdated?: (term: BusinessGlossaryTerm) => void;
  onTermDeleted?: (termId: string) => void;
}

interface GlossaryState {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  selectedCategory: string;
  selectedTerm: BusinessGlossaryTerm | null;
  searchQuery: string;
  viewMode: 'grid' | 'list' | 'hierarchy' | 'network';
  filters: GlossaryFilters;
}

interface GlossaryFilters {
  category: string;
  status: 'all' | 'approved' | 'pending' | 'draft' | 'rejected';
  owner: string;
  tags: string[];
  usageLevel: 'all' | 'high' | 'medium' | 'low' | 'unused';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface TermFormData {
  name: string;
  definition: string;
  description: string;
  category: string;
  synonyms: string[];
  acronyms: string[];
  examples: string[];
  businessRules: string[];
  tags: string[];
  owner: string;
  stewards: string[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
  relatedTerms: string[];
}

interface RelationshipFormData {
  sourceTermId: string;
  targetTermId: string;
  relationshipType: 'synonym' | 'antonym' | 'broader' | 'narrower' | 'related' | 'part-of' | 'instance-of';
  description: string;
}

// ============================================================================
// BUSINESS GLOSSARY MANAGER COMPONENT
// ============================================================================

export const BusinessGlossaryManager: React.FC<BusinessGlossaryManagerProps> = ({
  className = '',
  enableBulkOperations = true,
  enableApprovalWorkflow = true,
  onTermCreated,
  onTermUpdated,
  onTermDeleted
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [glossaryState, setGlossaryState] = useState<GlossaryState>({
    loading: true,
    error: null,
    lastUpdated: null,
    selectedCategory: 'all',
    selectedTerm: null,
    searchQuery: '',
    viewMode: 'grid',
    filters: {
      category: 'all',
      status: 'all',
      owner: 'all',
      tags: [],
      usageLevel: 'all',
      dateRange: {
        start: null,
        end: null
      }
    }
  });

  const [showTermDialog, setShowTermDialog] = useState(false);
  const [showRelationshipDialog, setShowRelationshipDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  
  const [termFormData, setTermFormData] = useState<TermFormData>({
    name: '',
    definition: '',
    description: '',
    category: '',
    synonyms: [],
    acronyms: [],
    examples: [],
    businessRules: [],
    tags: [],
    owner: '',
    stewards: [],
    status: 'draft',
    confidentiality: 'internal',
    relatedTerms: []
  });

  const [relationshipFormData, setRelationshipFormData] = useState<RelationshipFormData>({
    sourceTermId: '',
    targetTermId: '',
    relationshipType: 'related',
    description: ''
  });

  // Refs for performance optimization
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // HOOKS & DATA FETCHING
  // ============================================================================

  const {
    terms,
    categories,
    metrics,
    loading: glossaryLoading,
    error: glossaryError,
    createTerm,
    updateTerm,
    deleteTerm,
    approveTerm,
    refreshGlossary
  } = useBusinessGlossary({
    enableRealTime: true,
    includeMetrics: true
  });

  const {
    searchResults,
    suggestions,
    loading: searchLoading,
    performSearch,
    clearSearch
  } = useGlossarySearch({
    enableSuggestions: true,
    enableFuzzySearch: true
  });

  const {
    relationships,
    loading: relationshipsLoading,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    getTermRelationships
  } = useGlossaryRelationships({
    enableNetworkAnalysis: true
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredTerms = useMemo(() => {
    let filtered = terms || [];

    // Apply search filter
    if (glossaryState.searchQuery) {
      const query = glossaryState.searchQuery.toLowerCase();
      filtered = filtered.filter(term =>
        term.name.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query) ||
        term.description?.toLowerCase().includes(query) ||
        term.synonyms?.some(synonym => synonym.toLowerCase().includes(query)) ||
        term.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (glossaryState.filters.category !== 'all') {
      filtered = filtered.filter(term => term.category === glossaryState.filters.category);
    }

    // Apply status filter
    if (glossaryState.filters.status !== 'all') {
      filtered = filtered.filter(term => term.status === glossaryState.filters.status);
    }

    // Apply owner filter
    if (glossaryState.filters.owner !== 'all') {
      filtered = filtered.filter(term => term.owner === glossaryState.filters.owner);
    }

    // Apply tags filter
    if (glossaryState.filters.tags.length > 0) {
      filtered = filtered.filter(term =>
        term.tags?.some(tag => glossaryState.filters.tags.includes(tag))
      );
    }

    // Apply usage level filter
    if (glossaryState.filters.usageLevel !== 'all') {
      filtered = filtered.filter(term => {
        const usage = term.usage || { level: 'unused' };
        return usage.level === glossaryState.filters.usageLevel;
      });
    }

    return filtered;
  }, [terms, glossaryState.searchQuery, glossaryState.filters]);

  const glossaryMetrics = useMemo(() => {
    if (!metrics || !terms) return null;

    const totalTerms = terms.length;
    const approvedTerms = terms.filter(term => term.status === 'approved').length;
    const pendingTerms = terms.filter(term => term.status === 'pending').length;
    const draftTerms = terms.filter(term => term.status === 'draft').length;
    const categoriesCount = categories?.length || 0;

    return {
      totalTerms,
      approvedTerms,
      pendingTerms,
      draftTerms,
      categoriesCount,
      approvalRate: totalTerms > 0 ? (approvedTerms / totalTerms) * 100 : 0,
      ...metrics
    };
  }, [metrics, terms, categories]);

  const networkData = useMemo(() => {
    if (!relationships || !terms) return { nodes: [], links: [] };

    const nodes = terms.map(term => ({
      id: term.id,
      name: term.name,
      category: term.category,
      status: term.status,
      usage: term.usage?.count || 0
    }));

    const links = relationships.map(rel => ({
      source: rel.sourceTermId,
      target: rel.targetTermId,
      type: rel.relationshipType,
      strength: rel.confidence || 1
    }));

    return { nodes, links };
  }, [relationships, terms]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setGlossaryState(prev => ({
      ...prev,
      loading: glossaryLoading || searchLoading || relationshipsLoading,
      error: glossaryError,
      lastUpdated: new Date()
    }));
  }, [glossaryLoading, searchLoading, relationshipsLoading, glossaryError]);

  // Auto-search when query changes
  useEffect(() => {
    if (glossaryState.searchQuery) {
      const debounceTimer = setTimeout(() => {
        performSearch(glossaryState.searchQuery);
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      clearSearch();
    }
  }, [glossaryState.searchQuery, performSearch, clearSearch]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback((query: string) => {
    setGlossaryState(prev => ({
      ...prev,
      searchQuery: query
    }));
  }, []);

  const handleFilterChange = useCallback((filterKey: keyof GlossaryFilters, value: any) => {
    setGlossaryState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterKey]: value
      }
    }));
  }, []);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list' | 'hierarchy' | 'network') => {
    setGlossaryState(prev => ({
      ...prev,
      viewMode: mode
    }));
  }, []);

  const handleTermSelect = useCallback((term: BusinessGlossaryTerm) => {
    setGlossaryState(prev => ({
      ...prev,
      selectedTerm: term
    }));
  }, []);

  const handleCreateTerm = useCallback(async () => {
    try {
      const newTerm = await createTerm(termFormData);
      setShowTermDialog(false);
      setTermFormData({
        name: '',
        definition: '',
        description: '',
        category: '',
        synonyms: [],
        acronyms: [],
        examples: [],
        businessRules: [],
        tags: [],
        owner: '',
        stewards: [],
        status: 'draft',
        confidentiality: 'internal',
        relatedTerms: []
      });
      onTermCreated?.(newTerm);
    } catch (error) {
      console.error('Failed to create term:', error);
    }
  }, [createTerm, termFormData, onTermCreated]);

  const handleUpdateTerm = useCallback(async () => {
    if (!glossaryState.selectedTerm) return;

    try {
      const updatedTerm = await updateTerm(glossaryState.selectedTerm.id, termFormData);
      setShowTermDialog(false);
      setIsEditing(false);
      setGlossaryState(prev => ({
        ...prev,
        selectedTerm: updatedTerm
      }));
      onTermUpdated?.(updatedTerm);
    } catch (error) {
      console.error('Failed to update term:', error);
    }
  }, [updateTerm, glossaryState.selectedTerm, termFormData, onTermUpdated]);

  const handleDeleteTerm = useCallback(async (termId: string) => {
    try {
      await deleteTerm(termId);
      if (glossaryState.selectedTerm?.id === termId) {
        setGlossaryState(prev => ({
          ...prev,
          selectedTerm: null
        }));
      }
      onTermDeleted?.(termId);
    } catch (error) {
      console.error('Failed to delete term:', error);
    }
  }, [deleteTerm, glossaryState.selectedTerm, onTermDeleted]);

  const handleApproveTerm = useCallback(async (termId: string, approved: boolean) => {
    try {
      await approveTerm(termId, approved, 'Approved via glossary manager');
    } catch (error) {
      console.error('Failed to approve term:', error);
    }
  }, [approveTerm]);

  const handleCreateRelationship = useCallback(async () => {
    try {
      await createRelationship(relationshipFormData);
      setShowRelationshipDialog(false);
      setRelationshipFormData({
        sourceTermId: '',
        targetTermId: '',
        relationshipType: 'related',
        description: ''
      });
    } catch (error) {
      console.error('Failed to create relationship:', error);
    }
  }, [createRelationship, relationshipFormData]);

  const handleBulkOperation = useCallback(async (operation: string) => {
    if (selectedTerms.length === 0) return;

    try {
      switch (operation) {
        case 'approve':
          await Promise.all(selectedTerms.map(id => approveTerm(id, true, 'Bulk approval')));
          break;
        case 'reject':
          await Promise.all(selectedTerms.map(id => approveTerm(id, false, 'Bulk rejection')));
          break;
        case 'delete':
          await Promise.all(selectedTerms.map(id => deleteTerm(id)));
          break;
      }
      setSelectedTerms([]);
      setShowBulkDialog(false);
    } catch (error) {
      console.error('Failed to perform bulk operation:', error);
    }
  }, [selectedTerms, approveTerm, deleteTerm]);

  const handleExport = useCallback(async (format: 'csv' | 'json' | 'xlsx') => {
    // Implementation for exporting glossary terms
    const dataToExport = filteredTerms.map(term => ({
      name: term.name,
      definition: term.definition,
      category: term.category,
      status: term.status,
      owner: term.owner,
      synonyms: term.synonyms?.join(', ') || '',
      tags: term.tags?.join(', ') || '',
      createdAt: term.createdAt,
      updatedAt: term.updatedAt
    }));

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-glossary-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredTerms]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshGlossary();
    } catch (error) {
      console.error('Failed to refresh glossary:', error);
    }
  }, [refreshGlossary]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderMetricsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Total Terms</CardTitle>
          <BookOpen className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">
            {glossaryMetrics?.totalTerms || 0}
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Across {glossaryMetrics?.categoriesCount || 0} categories
          </p>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Approved</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {glossaryMetrics?.approvedTerms || 0}
          </div>
          <div className="mt-2">
            <Progress 
              value={glossaryMetrics?.approvalRate || 0} 
              className="w-full h-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700">Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-900">
            {glossaryMetrics?.pendingTerms || 0}
          </div>
          <p className="text-xs text-yellow-600 mt-1">
            Awaiting approval
          </p>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Drafts</CardTitle>
          <FileText className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">
            {glossaryMetrics?.draftTerms || 0}
          </div>
          <p className="text-xs text-purple-600 mt-1">
            In development
          </p>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">Usage</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">
            {glossaryMetrics?.totalUsage || 0}
          </div>
          <p className="text-xs text-orange-600 mt-1">
            Total references
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderSearchAndFilters = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Search and Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <Label className="text-sm font-medium">Search Terms</Label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search terms, definitions, tags..."
                value={glossaryState.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Category</Label>
            <Select 
              value={glossaryState.filters.category}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Select 
              value={glossaryState.filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Usage Level</Label>
            <Select 
              value={glossaryState.filters.usageLevel}
              onValueChange={(value) => handleFilterChange('usageLevel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High Usage</SelectItem>
                <SelectItem value="medium">Medium Usage</SelectItem>
                <SelectItem value="low">Low Usage</SelectItem>
                <SelectItem value="unused">Unused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">View Mode</Label>
            <Select 
              value={glossaryState.viewMode}
              onValueChange={(value) => handleViewModeChange(value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
                <SelectItem value="hierarchy">Hierarchy</SelectItem>
                <SelectItem value="network">Network</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTermsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTerms.map((term) => (
        <Card 
          key={term.id} 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleTermSelect(term)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold truncate">
                  {term.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant={term.status === 'approved' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {term.status}
                  </Badge>
                  {term.category && (
                    <Badge variant="outline" className="text-xs">
                      {term.category}
                    </Badge>
                  )}
                </div>
              </div>
              {enableBulkOperations && (
                <input
                  type="checkbox"
                  checked={selectedTerms.includes(term.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTerms(prev => [...prev, term.id]);
                    } else {
                      setSelectedTerms(prev => prev.filter(id => id !== term.id));
                    }
                  }}
                  className="ml-2"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 line-clamp-3 mb-3">
              {term.definition}
            </p>
            
            <div className="space-y-2">
              {term.synonyms && term.synonyms.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Type className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Synonyms: {term.synonyms.slice(0, 2).join(', ')}
                    {term.synonyms.length > 2 && ` +${term.synonyms.length - 2}`}
                  </span>
                </div>
              )}
              
              {term.tags && term.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Tag className="h-3 w-3 text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {term.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {term.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{term.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {term.owner || 'Unassigned'}
                  </span>
                </div>
                {term.usage && (
                  <div className="flex items-center space-x-1">
                    <Activity className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {term.usage.count || 0} uses
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTermsList = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Business Terms</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {enableBulkOperations && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedTerms.length === filteredTerms.length && filteredTerms.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTerms(filteredTerms.map(term => term.id));
                        } else {
                          setSelectedTerms([]);
                        }
                      }}
                    />
                  </TableHead>
                )}
                <TableHead>Term</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTerms.map((term) => (
                <TableRow key={term.id} className="hover:bg-gray-50">
                  {enableBulkOperations && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedTerms.includes(term.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTerms(prev => [...prev, term.id]);
                          } else {
                            setSelectedTerms(prev => prev.filter(id => id !== term.id));
                          }
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    <button
                      onClick={() => handleTermSelect(term)}
                      className="text-left hover:text-blue-600"
                    >
                      {term.name}
                    </button>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{term.definition}</div>
                  </TableCell>
                  <TableCell>
                    {term.category && (
                      <Badge variant="outline">{term.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={term.status === 'approved' ? 'default' : 'secondary'}
                    >
                      {term.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{term.owner || 'Unassigned'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Activity className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{term.usage?.count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setIsEditing(true);
                          setTermFormData({
                            name: term.name,
                            definition: term.definition,
                            description: term.description || '',
                            category: term.category || '',
                            synonyms: term.synonyms || [],
                            acronyms: term.acronyms || [],
                            examples: term.examples || [],
                            businessRules: term.businessRules || [],
                            tags: term.tags || [],
                            owner: term.owner || '',
                            stewards: term.stewards || [],
                            status: term.status,
                            confidentiality: term.confidentiality || 'internal',
                            relatedTerms: term.relatedTerms || []
                          });
                          handleTermSelect(term);
                          setShowTermDialog(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {enableApprovalWorkflow && term.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleApproveTerm(term.id, true)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleApproveTerm(term.id, false)}>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTerm(term.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const renderNetworkView = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Term Relationships Network</CardTitle>
        <CardDescription>
          Visual representation of business term relationships and connections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
          {networkData.nodes.length > 0 ? (
            <div className="text-center">
              <Network className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-600">Network Visualization</p>
              <p className="text-sm text-gray-500">
                {networkData.nodes.length} terms, {networkData.links.length} relationships
              </p>
              <Button className="mt-4" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Full Network View
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Network className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-600">No Relationships</p>
              <p className="text-sm text-gray-500">
                Create relationships between terms to see the network
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderTermDialog = () => (
    <Dialog open={showTermDialog} onOpenChange={setShowTermDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Business Term' : 'Create New Business Term'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the business term details' : 'Add a new term to the business glossary'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="termName">Term Name *</Label>
              <Input
                id="termName"
                value={termFormData.name}
                onChange={(e) => setTermFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter term name"
              />
            </div>

            <div>
              <Label htmlFor="termDefinition">Definition *</Label>
              <Textarea
                id="termDefinition"
                value={termFormData.definition}
                onChange={(e) => setTermFormData(prev => ({ ...prev, definition: e.target.value }))}
                placeholder="Enter precise definition"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="termDescription">Description</Label>
              <Textarea
                id="termDescription"
                value={termFormData.description}
                onChange={(e) => setTermFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional context and details"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="termCategory">Category</Label>
              <Select 
                value={termFormData.category}
                onValueChange={(value) => setTermFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="termOwner">Owner</Label>
              <Input
                id="termOwner"
                value={termFormData.owner}
                onChange={(e) => setTermFormData(prev => ({ ...prev, owner: e.target.value }))}
                placeholder="Term owner"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="termSynonyms">Synonyms</Label>
              <Textarea
                id="termSynonyms"
                value={termFormData.synonyms.join(', ')}
                onChange={(e) => setTermFormData(prev => ({ 
                  ...prev, 
                  synonyms: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                }))}
                placeholder="Comma-separated synonyms"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="termTags">Tags</Label>
              <Textarea
                id="termTags"
                value={termFormData.tags.join(', ')}
                onChange={(e) => setTermFormData(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                }))}
                placeholder="Comma-separated tags"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="termExamples">Examples</Label>
              <Textarea
                id="termExamples"
                value={termFormData.examples.join('\n')}
                onChange={(e) => setTermFormData(prev => ({ 
                  ...prev, 
                  examples: e.target.value.split('\n').filter(s => s.trim()) 
                }))}
                placeholder="One example per line"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="termStatus">Status</Label>
              <Select 
                value={termFormData.status}
                onValueChange={(value) => setTermFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="termConfidentiality">Confidentiality</Label>
              <Select 
                value={termFormData.confidentiality}
                onValueChange={(value) => setTermFormData(prev => ({ ...prev, confidentiality: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="confidential">Confidential</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowTermDialog(false)}>
            Cancel
          </Button>
          <Button onClick={isEditing ? handleUpdateTerm : handleCreateTerm}>
            {isEditing ? 'Update Term' : 'Create Term'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderActionButtons = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-900">Business Glossary</h1>
        <Badge variant="outline" className="text-sm">
          {filteredTerms.length} terms
        </Badge>
        {glossaryState.lastUpdated && (
          <Badge variant="outline" className="text-sm">
            Updated: {glossaryState.lastUpdated.toLocaleTimeString()}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={glossaryState.loading}
              >
                <RefreshCw className={`h-4 w-4 ${glossaryState.loading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh Glossary</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {enableBulkOperations && selectedTerms.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Bulk Actions ({selectedTerms.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {enableApprovalWorkflow && (
                <>
                  <DropdownMenuItem onClick={() => handleBulkOperation('approve')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkOperation('reject')}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Reject Selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                onClick={() => handleBulkOperation('delete')}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('xlsx')}>
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('json')}>
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={() => {
            setIsEditing(false);
            setTermFormData({
              name: '',
              definition: '',
              description: '',
              category: '',
              synonyms: [],
              acronyms: [],
              examples: [],
              businessRules: [],
              tags: [],
              owner: '',
              stewards: [],
              status: 'draft',
              confidentiality: 'internal',
              relatedTerms: []
            });
            setShowTermDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Term
        </Button>

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  if (glossaryState.error) {
    return (
      <div className={`p-6 ${className}`}>
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Glossary Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {glossaryState.error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={`p-6 space-y-6 bg-gray-50 min-h-screen ${className}`}>
      {/* Action Buttons */}
      {renderActionButtons()}

      {/* Metrics Overview */}
      {renderMetricsOverview()}

      {/* Search and Filters */}
      {renderSearchAndFilters()}

      {/* Loading Overlay */}
      {glossaryState.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Loading glossary...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={glossaryState.viewMode} onValueChange={(value) => handleViewModeChange(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          {renderTermsGrid()}
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          {renderTermsList()}
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Term Hierarchy</CardTitle>
              <CardDescription>
                Hierarchical view of business terms organized by categories and relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Layers className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-600">Hierarchy View</p>
                  <p className="text-sm text-gray-500">
                    Terms organized by categories and parent-child relationships
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          {renderNetworkView()}
        </TabsContent>
      </Tabs>

      {/* Term Dialog */}
      {renderTermDialog()}

      {/* Relationship Dialog */}
      <Dialog open={showRelationshipDialog} onOpenChange={setShowRelationshipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Term Relationship</DialogTitle>
            <DialogDescription>
              Define relationships between business terms
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="sourceTermId">Source Term</Label>
              <Select 
                value={relationshipFormData.sourceTermId}
                onValueChange={(value) => setRelationshipFormData(prev => ({ ...prev, sourceTermId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source term" />
                </SelectTrigger>
                <SelectContent>
                  {terms?.map(term => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="relationshipType">Relationship Type</Label>
              <Select 
                value={relationshipFormData.relationshipType}
                onValueChange={(value) => setRelationshipFormData(prev => ({ ...prev, relationshipType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="synonym">Synonym</SelectItem>
                  <SelectItem value="antonym">Antonym</SelectItem>
                  <SelectItem value="broader">Broader Term</SelectItem>
                  <SelectItem value="narrower">Narrower Term</SelectItem>
                  <SelectItem value="related">Related Term</SelectItem>
                  <SelectItem value="part-of">Part Of</SelectItem>
                  <SelectItem value="instance-of">Instance Of</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetTermId">Target Term</Label>
              <Select 
                value={relationshipFormData.targetTermId}
                onValueChange={(value) => setRelationshipFormData(prev => ({ ...prev, targetTermId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target term" />
                </SelectTrigger>
                <SelectContent>
                  {terms?.map(term => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="relationshipDescription">Description</Label>
              <Textarea
                id="relationshipDescription"
                value={relationshipFormData.description}
                onChange={(e) => setRelationshipFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the relationship"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRelationshipDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRelationship}>
              Create Relationship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessGlossaryManager;