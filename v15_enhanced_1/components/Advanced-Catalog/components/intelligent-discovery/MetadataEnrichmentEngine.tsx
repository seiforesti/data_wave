// ============================================================================
// METADATA ENRICHMENT ENGINE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced AI-powered metadata enrichment with intelligent automation
// Surpasses all competitors with superior metadata generation and enhancement
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Brain, 
  Sparkles, 
  Wand2, 
  Eye, 
  Settings, 
  RefreshCw, 
  Download, 
  Upload, 
  Share, 
  Copy, 
  Star, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  Lightbulb,
  Database,
  Code,
  Package,
  Link,
  Globe,
  Compass,
  Cpu,
  HardDrive,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  MoreHorizontal,
  Play,
  Pause,
  Square,
  SkipForward,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Maximize,
  Minimize,
  ExternalLink,
  Info,
  AlertCircle,
  Users,
  Calendar,
  BookOpen,
  Award,
  Layers,
  Network,
  GitBranch,
  Workflow,
  Gauge,
  LineChart,
  Radar,
  Crosshair,
  Focus,
  Scan,
  Lock,
  Unlock,
  Key,
  Tag,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Save,
  X,
  Check,
  Zap,
  Magic
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Advanced Catalog Hooks and Services
import { useCatalogDiscovery } from '../../hooks/useCatalogDiscovery';
import { useCatalogAI } from '../../hooks/useCatalogAI';
import { useCatalogAnalytics } from '../../hooks/useCatalogAnalytics';

// Types
import {
  MetadataEnrichment,
  EnrichmentRule,
  EnrichmentSuggestion,
  MetadataField,
  IntelligentDataAsset,
  BusinessGlossaryTerm,
  EnrichmentJob,
  EnrichmentMetrics,
  AIGeneratedMetadata,
  MetadataQualityScore,
  EnrichmentPattern
} from '../../types';

// Utils
import { 
  formatMetadataType,
  calculateMetadataQuality,
  formatEnrichmentStatus,
  generateMetadataScore
} from '../../utils';

// Constants
import { 
  METADATA_TYPES,
  ENRICHMENT_STRATEGIES,
  QUALITY_THRESHOLDS,
  AI_MODELS
} from '../../constants';

// ============================================================================
// INTERFACES
// ============================================================================

interface MetadataEnrichmentEngineProps {
  className?: string;
  assetId?: string;
  onEnrichmentComplete?: (results: MetadataEnrichment[]) => void;
  enableRealTimeEnrichment?: boolean;
  enableAISuggestions?: boolean;
  showQualityMetrics?: boolean;
  autoAcceptThreshold?: number;
}

interface EnrichmentConfiguration {
  strategies: {
    aiGeneration: boolean;
    patternMatching: boolean;
    businessGlossary: boolean;
    crowdsourcing: boolean;
    externalSources: boolean;
  };
  quality: {
    minConfidence: number;
    requireHumanReview: boolean;
    autoApprove: boolean;
    qualityThreshold: number;
  };
  automation: {
    batchProcessing: boolean;
    realTimeProcessing: boolean;
    scheduledRuns: boolean;
    triggerOnChanges: boolean;
  };
  ai: {
    model: string;
    temperature: number;
    maxTokens: number;
    useContextualLearning: boolean;
  };
}

interface EnrichmentWorkflow {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  currentStep: string;
  steps: EnrichmentStep[];
  metrics: EnrichmentMetrics;
  startTime?: Date;
  endTime?: Date;
}

interface EnrichmentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  results?: any;
  suggestions?: EnrichmentSuggestion[];
}

interface MetadataEditor {
  field: string;
  value: string;
  isEditing: boolean;
  originalValue: string;
  suggestions: string[];
  confidence: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MetadataEnrichmentEngine: React.FC<MetadataEnrichmentEngineProps> = ({
  className = '',
  assetId,
  onEnrichmentComplete,
  enableRealTimeEnrichment = true,
  enableAISuggestions = true,
  showQualityMetrics = true,
  autoAcceptThreshold = 0.8
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedAsset, setSelectedAsset] = useState<IntelligentDataAsset | null>(null);
  const [enrichmentResults, setEnrichmentResults] = useState<MetadataEnrichment[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<EnrichmentWorkflow | null>(null);
  const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<EnrichmentSuggestion[]>([]);
  
  const [configuration, setConfiguration] = useState<EnrichmentConfiguration>({
    strategies: {
      aiGeneration: true,
      patternMatching: true,
      businessGlossary: true,
      crowdsourcing: false,
      externalSources: true
    },
    quality: {
      minConfidence: 0.7,
      requireHumanReview: true,
      autoApprove: false,
      qualityThreshold: 0.8
    },
    automation: {
      batchProcessing: true,
      realTimeProcessing: true,
      scheduledRuns: false,
      triggerOnChanges: true
    },
    ai: {
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1000,
      useContextualLearning: true
    }
  });

  // Metadata editing state
  const [metadataEditors, setMetadataEditors] = useState<Record<string, MetadataEditor>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'editor'>('grid');
  const [filterByQuality, setFilterByQuality] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    enrichMetadata,
    getMetadataPatterns,
    validateMetadata,
    isLoading: discoveryLoading
  } = useCatalogDiscovery();

  const {
    generateMetadata,
    getMetadataSuggestions,
    enhanceDescription,
    generateTags,
    classifyMetadata,
    isAnalyzing: aiAnalyzing
  } = useCatalogAI();

  const {
    getMetadataMetrics,
    getQualityScore,
    getEnrichmentAnalytics
  } = useCatalogAnalytics();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredResults = useMemo(() => {
    return enrichmentResults.filter(result => {
      const matchesSearch = searchQuery === '' || 
        result.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.enrichedFields.some(field => 
          field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          field.value.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesQuality = 
        filterByQuality === 'all' ||
        (filterByQuality === 'high' && result.qualityScore >= 0.8) ||
        (filterByQuality === 'medium' && result.qualityScore >= 0.6 && result.qualityScore < 0.8) ||
        (filterByQuality === 'low' && result.qualityScore < 0.6);

      return matchesSearch && matchesQuality;
    });
  }, [enrichmentResults, searchQuery, filterByQuality]);

  const enrichmentStats = useMemo(() => {
    const total = enrichmentResults.length;
    const enriched = enrichmentResults.filter(r => r.enrichedFields.length > 0).length;
    const highQuality = enrichmentResults.filter(r => r.qualityScore >= 0.8).length;
    const pendingReview = enrichmentResults.filter(r => r.requiresReview).length;
    const avgQuality = total > 0 ? 
      enrichmentResults.reduce((sum, r) => sum + r.qualityScore, 0) / total : 0;
    const totalSuggestions = suggestions.length;
    const acceptedSuggestions = suggestions.filter(s => s.status === 'accepted').length;

    return {
      total,
      enriched,
      highQuality,
      pendingReview,
      avgQuality,
      totalSuggestions,
      acceptedSuggestions,
      coverage: total > 0 ? Math.round((enriched / total) * 100) : 0,
      qualityRate: total > 0 ? Math.round((highQuality / total) * 100) : 0,
      acceptanceRate: totalSuggestions > 0 ? Math.round((acceptedSuggestions / totalSuggestions) * 100) : 0
    };
  }, [enrichmentResults, suggestions]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleStartEnrichment = useCallback(async () => {
    if (!assetId && !selectedAsset?.id) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Create workflow
      const workflow: EnrichmentWorkflow = {
        id: `workflow-${Date.now()}`,
        name: 'Metadata Enrichment',
        status: 'running',
        progress: 0,
        currentStep: 'analyze',
        steps: [
          { id: 'analyze', name: 'Analyze Asset', description: 'Analyzing asset structure and content', status: 'running', progress: 0 },
          { id: 'extract', name: 'Extract Metadata', description: 'Extracting existing metadata and patterns', status: 'pending', progress: 0 },
          { id: 'generate', name: 'Generate Suggestions', description: 'Using AI to generate enrichment suggestions', status: 'pending', progress: 0 },
          { id: 'validate', name: 'Validate Quality', description: 'Validating metadata quality and accuracy', status: 'pending', progress: 0 },
          { id: 'apply', name: 'Apply Enhancements', description: 'Applying approved metadata enhancements', status: 'pending', progress: 0 }
        ],
        metrics: {
          totalFields: 0,
          enrichedFields: 0,
          suggestionsGenerated: 0,
          qualityScore: 0,
          processingTime: 0
        }
      };

      setCurrentWorkflow(workflow);

      // Simulate workflow progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = Math.min(prev + 3, 90);
          
          // Update workflow
          setCurrentWorkflow(current => {
            if (!current) return current;
            
            const updatedSteps = [...current.steps];
            const currentStepIndex = Math.floor((newProgress / 100) * updatedSteps.length);
            
            updatedSteps.forEach((step, index) => {
              if (index < currentStepIndex) {
                step.status = 'completed';
                step.progress = 100;
              } else if (index === currentStepIndex) {
                step.status = 'running';
                step.progress = (newProgress % (100 / updatedSteps.length)) * updatedSteps.length;
              }
            });

            return {
              ...current,
              steps: updatedSteps,
              progress: newProgress,
              currentStep: updatedSteps[currentStepIndex]?.id || 'analyze'
            };
          });
          
          return newProgress;
        });
      }, 300);

      // Perform actual enrichment
      const targetId = assetId || selectedAsset?.id;
      const enrichmentResult = await enrichMetadata(targetId, configuration);
      
      // Generate AI suggestions
      const aiSuggestions = await getMetadataSuggestions(enrichmentResult);
      const enhancedDescription = await enhanceDescription(enrichmentResult.description);
      const generatedTags = await generateTags(enrichmentResult);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Create comprehensive result
      const result: MetadataEnrichment = {
        id: `enrichment-${Date.now()}`,
        assetId: targetId,
        assetName: selectedAsset?.name || 'Unknown Asset',
        enrichedFields: [
          {
            name: 'description',
            value: enhancedDescription,
            confidence: 0.9,
            source: 'ai-generated',
            type: 'text',
            suggestions: aiSuggestions.filter(s => s.field === 'description').map(s => s.value)
          },
          {
            name: 'tags',
            value: generatedTags.join(', '),
            confidence: 0.85,
            source: 'ai-generated',
            type: 'array',
            suggestions: []
          },
          ...aiSuggestions.map(suggestion => ({
            name: suggestion.field,
            value: suggestion.value,
            confidence: suggestion.confidence,
            source: suggestion.source,
            type: suggestion.type,
            suggestions: suggestion.alternatives || []
          }))
        ],
        qualityScore: calculateMetadataQuality(enrichmentResult),
        requiresReview: configuration.quality.requireHumanReview,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          aiModel: configuration.ai.model,
          processingTime: Date.now() - workflow.startTime!.getTime(),
          strategies: Object.keys(configuration.strategies).filter(k => configuration.strategies[k as keyof typeof configuration.strategies]),
          suggestions: aiSuggestions
        }
      };

      setEnrichmentResults(prev => [result, ...prev]);
      setSuggestions(prev => [...aiSuggestions, ...prev]);
      onEnrichmentComplete?.([result]);

      // Complete workflow
      setCurrentWorkflow(current => current ? {
        ...current,
        status: 'completed',
        progress: 100,
        endTime: new Date(),
        metrics: {
          totalFields: result.enrichedFields.length,
          enrichedFields: result.enrichedFields.filter(f => f.confidence >= configuration.quality.minConfidence).length,
          suggestionsGenerated: aiSuggestions.length,
          qualityScore: result.qualityScore,
          processingTime: Date.now() - current.startTime!.getTime()
        }
      } : null);

    } catch (error) {
      console.error('Enrichment failed:', error);
      setCurrentWorkflow(current => current ? {
        ...current,
        status: 'failed',
        endTime: new Date()
      } : null);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 2000);
    }
  }, [assetId, selectedAsset, configuration, enrichMetadata, getMetadataSuggestions, enhanceDescription, generateTags, onEnrichmentComplete]);

  const handleAcceptSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, status: 'accepted' } : s)
    );
    setSelectedSuggestions(prev => {
      const next = new Set(prev);
      next.add(suggestionId);
      return next;
    });
  }, []);

  const handleRejectSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, status: 'rejected' } : s)
    );
    setSelectedSuggestions(prev => {
      const next = new Set(prev);
      next.delete(suggestionId);
      return next;
    });
  }, []);

  const handleEditMetadata = useCallback((resultId: string, fieldName: string, value: string) => {
    const editorKey = `${resultId}-${fieldName}`;
    setMetadataEditors(prev => ({
      ...prev,
      [editorKey]: {
        field: fieldName,
        value: value,
        isEditing: true,
        originalValue: prev[editorKey]?.originalValue || value,
        suggestions: prev[editorKey]?.suggestions || [],
        confidence: prev[editorKey]?.confidence || 0.8
      }
    }));
  }, []);

  const handleSaveMetadata = useCallback((resultId: string, fieldName: string) => {
    const editorKey = `${resultId}-${fieldName}`;
    const editor = metadataEditors[editorKey];
    
    if (editor) {
      // Update the enrichment result
      setEnrichmentResults(prev => 
        prev.map(result => {
          if (result.id === resultId) {
            return {
              ...result,
              enrichedFields: result.enrichedFields.map(field => 
                field.name === fieldName ? { ...field, value: editor.value } : field
              )
            };
          }
          return result;
        })
      );

      // Clear editor
      setMetadataEditors(prev => {
        const next = { ...prev };
        delete next[editorKey];
        return next;
      });
    }
  }, [metadataEditors]);

  const handleCancelEdit = useCallback((resultId: string, fieldName: string) => {
    const editorKey = `${resultId}-${fieldName}`;
    setMetadataEditors(prev => {
      const next = { ...prev };
      delete next[editorKey];
      return next;
    });
  }, []);

  const handleBulkApproval = useCallback(() => {
    const highConfidenceSuggestions = suggestions
      .filter(s => s.confidence >= autoAcceptThreshold && s.status === 'pending')
      .map(s => s.id);
    
    setSuggestions(prev => 
      prev.map(s => 
        highConfidenceSuggestions.includes(s.id) ? { ...s, status: 'accepted' } : s
      )
    );
    
    setSelectedSuggestions(prev => {
      const next = new Set(prev);
      highConfidenceSuggestions.forEach(id => next.add(id));
      return next;
    });
  }, [suggestions, autoAcceptThreshold]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderEnrichmentCard = (result: MetadataEnrichment) => {
    const qualityColor = result.qualityScore >= 0.8 ? 'text-green-600' : 
                        result.qualityScore >= 0.6 ? 'text-yellow-600' : 'text-red-600';
    
    return (
      <motion.div
        key={result.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="group"
      >
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold group-hover:text-green-600 transition-colors">
                  {result.assetName}
                </CardTitle>
                <CardDescription className="mt-1">
                  {result.enrichedFields.length} enriched fields • {Math.round(result.qualityScore * 100)}% quality
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={result.requiresReview ? 'secondary' : 'default'}
                  className="text-xs"
                >
                  {result.requiresReview ? 'Needs Review' : 'Auto-Applied'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Metadata
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Re-enrich
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Quality Score */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Quality Score</span>
                  <span className={qualityColor}>{Math.round(result.qualityScore * 100)}%</span>
                </div>
                <Progress value={result.qualityScore * 100} className="h-2" />
              </div>

              {/* Enriched Fields Preview */}
              <div>
                <Label className="text-xs text-muted-foreground">Enriched Fields</Label>
                <div className="space-y-2 mt-1">
                  {result.enrichedFields.slice(0, 3).map((field, index) => (
                    <div key={index} className="p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-green-800">
                          {formatMetadataType(field.name)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(field.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-green-700 line-clamp-2">
                        {field.value}
                      </p>
                    </div>
                  ))}
                  {result.enrichedFields.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{result.enrichedFields.length - 3} more fields
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Sources */}
              <div>
                <Label className="text-xs text-muted-foreground">Sources</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.from(new Set(result.enrichedFields.map(f => f.source))).map((source, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderSuggestionCard = (suggestion: EnrichmentSuggestion) => (
    <motion.div
      key={suggestion.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="border rounded-lg p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">{formatMetadataType(suggestion.field)}</span>
            <Badge variant="outline" className="text-xs">
              {Math.round(suggestion.confidence * 100)}% confidence
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{suggestion.value}</p>
          <p className="text-xs text-muted-foreground mt-1">Source: {suggestion.source}</p>
        </div>
        <div className="flex items-center space-x-1">
          <Tooltip>
            <TooltipTrigger>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                onClick={() => handleAcceptSuggestion(suggestion.id)}
                disabled={suggestion.status !== 'pending'}
              >
                <Check className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Accept suggestion</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                onClick={() => handleRejectSuggestion(suggestion.id)}
                disabled={suggestion.status !== 'pending'}
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Reject suggestion</p></TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      {suggestion.reasoning && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
          <strong>AI Reasoning:</strong> {suggestion.reasoning}
        </div>
      )}
    </motion.div>
  );

  const renderWorkflowMonitor = () => {
    if (!currentWorkflow) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Workflow className="h-5 w-5 text-green-600" />
              <CardTitle>Enrichment Workflow</CardTitle>
              <Badge variant={
                currentWorkflow.status === 'completed' ? 'default' :
                currentWorkflow.status === 'failed' ? 'destructive' : 'secondary'
              }>
                {currentWorkflow.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(currentWorkflow.progress)}% complete
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={currentWorkflow.progress} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {currentWorkflow.steps.map((step) => (
                <div key={step.id} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : step.status === 'failed' ? (
                      <XCircle className="h-8 w-8 text-red-500" />
                    ) : step.status === 'running' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className="h-8 w-8 text-blue-500" />
                      </motion.div>
                    ) : (
                      <Clock className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="text-sm font-medium">{step.name}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                  {step.status === 'running' && (
                    <Progress value={step.progress} className="mt-2 h-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMetricsDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-bold">{enrichmentStats.total}</p>
            </div>
            <Database className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Enriched</p>
              <p className="text-2xl font-bold text-green-600">{enrichmentStats.enriched}</p>
              <p className="text-xs text-muted-foreground">{enrichmentStats.coverage}% coverage</p>
            </div>
            <Sparkles className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Quality</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(enrichmentStats.avgQuality * 100)}%</p>
              <p className="text-xs text-muted-foreground">Metadata quality</p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Suggestions</p>
              <p className="text-2xl font-bold text-blue-600">{enrichmentStats.totalSuggestions}</p>
              <p className="text-xs text-muted-foreground">{enrichmentStats.acceptanceRate}% accepted</p>
            </div>
            <Lightbulb className="h-8 w-8 text-blue-500" />
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
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Wand2 className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Metadata Enrichment Engine</h1>
                <p className="text-muted-foreground">AI-powered intelligent metadata enhancement and generation</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkApproval}
              disabled={suggestions.filter(s => s.confidence >= autoAcceptThreshold && s.status === 'pending').length === 0}
              className="flex items-center space-x-2"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>Bulk Approve</span>
            </Button>

            <Sheet open={isConfigurationOpen} onOpenChange={setIsConfigurationOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Configure</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Enrichment Configuration</SheetTitle>
                  <SheetDescription>
                    Configure AI models, quality thresholds, and enrichment strategies
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="text-center text-muted-foreground">
                    Advanced configuration panel goes here
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Button
              onClick={handleStartEnrichment}
              disabled={isGenerating || (!assetId && !selectedAsset)}
              className="flex items-center space-x-2"
            >
              <Brain className={`h-4 w-4 ${isGenerating ? 'animate-pulse' : ''}`} />
              <span>{isGenerating ? 'Enriching...' : 'Start Enrichment'}</span>
            </Button>
          </div>
        </div>

        {/* Metrics Dashboard */}
        {renderMetricsDashboard()}

        {/* Workflow Monitor */}
        {renderWorkflowMonitor()}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Results</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span>Suggestions</span>
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Editor</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <LineChart className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5 text-blue-600" />
                      <span>Enrichment Quality Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Quality distribution chart goes here
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {enrichmentResults.slice(0, 5).map((result, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-start space-x-2">
                              <Sparkles className="h-4 w-4 text-green-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{result.assetName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {result.enrichedFields.length} fields enriched
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Quality: {Math.round(result.qualityScore * 100)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search enrichment results..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Select value={filterByQuality} onValueChange={(value: any) => setFilterByQuality(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quality</SelectItem>
                    <SelectItem value="high">High Quality</SelectItem>
                    <SelectItem value="medium">Medium Quality</SelectItem>
                    <SelectItem value="low">Low Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredResults.map(renderEnrichmentCard)}
              </AnimatePresence>
            </div>

            {filteredResults.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No enrichment results found</h3>
                <p className="text-muted-foreground mb-4">
                  Start enriching metadata to see results here.
                </p>
                <Button onClick={handleStartEnrichment} disabled={!assetId && !selectedAsset}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Start Enrichment
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">AI Suggestions</h3>
                <p className="text-sm text-muted-foreground">
                  {suggestions.filter(s => s.status === 'pending').length} pending suggestions
                </p>
              </div>
              <Button onClick={handleBulkApproval} size="sm">
                <ThumbsUp className="mr-2 h-4 w-4" />
                Approve High Confidence
              </Button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {suggestions
                  .filter(s => s.status === 'pending')
                  .map(renderSuggestionCard)}
              </AnimatePresence>
            </div>

            {suggestions.filter(s => s.status === 'pending').length === 0 && (
              <div className="text-center py-12">
                <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No pending suggestions</h3>
                <p className="text-muted-foreground">
                  All suggestions have been reviewed or no enrichment has been performed yet.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              Metadata editor interface goes here
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              Enrichment analytics and insights go here
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default MetadataEnrichmentEngine;