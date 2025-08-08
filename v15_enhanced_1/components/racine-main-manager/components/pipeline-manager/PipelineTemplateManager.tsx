'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Racine System Hooks
import { usePipelineManagement } from '../../hooks/usePipelineManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';

// Backend Integration Utilities
import {
  getPipelineTemplates,
  createPipelineTemplate,
  updatePipelineTemplate,
  deletePipelineTemplate,
  cloneTemplate,
  shareTemplate,
  importTemplate,
  exportTemplate,
  validateTemplate,
  getTemplateCategories,
  searchTemplates,
  getTemplateUsageStats,
  generateTemplateFromPipeline,
  customizeTemplate,
  previewTemplate
} from '../../utils/pipeline-backend-integration';

// Types from racine-core.types
import {
  PipelineTemplate,
  TemplateCategory,
  TemplateMetadata,
  TemplateConfiguration,
  TemplateParameter,
  TemplateValidation,
  TemplateUsageStats,
  TemplatePermission,
  TemplateVersion,
  TemplatePreview,
  Pipeline,
  SPAIntegration
} from '../../types/racine-core.types';

// Icons
import {
  FileTemplate,
  Plus,
  Search,
  Filter,
  Star,
  Download,
  Upload,
  Share2,
  Copy,
  Edit,
  Trash2,
  Eye,
  Settings,
  Save,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Tag,
  BookOpen,
  Zap,
  GitBranch,
  Layout,
  Code,
  Database,
  Workflow,
  Globe,
  Lock,
  Unlock,
  Heart,
  TrendingUp,
  Calendar,
  Folder,
  FolderOpen
} from 'lucide-react';

interface PipelineTemplateManagerProps {
  className?: string;
  onTemplateSelected?: (template: PipelineTemplate) => void;
  onTemplateApplied?: (template: PipelineTemplate, config: TemplateConfiguration) => void;
}

export default function PipelineTemplateManager({
  className,
  onTemplateSelected,
  onTemplateApplied
}: PipelineTemplateManagerProps) {
  // Racine System Hooks
  const {
    templates,
    loading: pipelineLoading,
    createFromTemplate,
    applyTemplate
  } = usePipelineManagement();

  const { orchestrateTemplateDeployment } = useRacineOrchestration();
  const { validateCrossGroupTemplate } = useCrossGroupIntegration();
  const { currentUser, permissions } = useUserManagement();
  const { currentWorkspace } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();

  // Component State
  const [activeTab, setActiveTab] = useState('library');
  const [allTemplates, setAllTemplates] = useState<PipelineTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PipelineTemplate | null>(null);
  const [templatePreview, setTemplatePreview] = useState<TemplatePreview | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavorites, setShowFavorites] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<PipelineTemplate>>({
    name: '',
    description: '',
    category: '',
    isPublic: false,
    parameters: [],
    stages: [],
    metadata: {}
  });
  const [templateValidation, setTemplateValidation] = useState<TemplateValidation | null>(null);
  const [usageStats, setUsageStats] = useState<TemplateUsageStats[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load templates and categories
  useEffect(() => {
    loadTemplateData();
  }, []);

  const loadTemplateData = async () => {
    try {
      // Load templates
      const templatesData = await getPipelineTemplates();
      setAllTemplates(templatesData);

      // Load categories
      const categoriesData = await getTemplateCategories();
      setCategories(categoriesData);

      // Load usage stats
      const statsData = await getTemplateUsageStats();
      setUsageStats(statsData);

      // Load user favorites (mock for now)
      setFavorites(['template-1', 'template-5']); // This would come from user preferences

    } catch (error) {
      console.error('Error loading template data:', error);
    }
  };

  // Filtered and sorted templates
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Additional filters
    if (filterBy === 'public') {
      filtered = filtered.filter(template => template.isPublic);
    } else if (filterBy === 'private') {
      filtered = filtered.filter(template => !template.isPublic);
    } else if (filterBy === 'mine') {
      filtered = filtered.filter(template => template.createdBy === currentUser?.id);
    }

    // Favorites filter
    if (showFavorites) {
      filtered = filtered.filter(template => favorites.includes(template.id));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'usage':
          const usageA = usageStats.find(s => s.templateId === a.id)?.usageCount || 0;
          const usageB = usageStats.find(s => s.templateId === b.id)?.usageCount || 0;
          return usageB - usageA;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allTemplates, searchQuery, selectedCategory, filterBy, sortBy, showFavorites, favorites, currentUser, usageStats]);

  const handleCreateTemplate = async () => {
    try {
      if (!newTemplate.name || !newTemplate.description) {
        return;
      }

      const templateData = {
        ...newTemplate,
        createdBy: currentUser?.id,
        workspaceId: currentWorkspace?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as PipelineTemplate;

      const createdTemplate = await createPipelineTemplate(templateData);
      setAllTemplates(prev => [...prev, createdTemplate]);
      
      setIsCreateDialogOpen(false);
      setNewTemplate({
        name: '',
        description: '',
        category: '',
        isPublic: false,
        parameters: [],
        stages: [],
        metadata: {}
      });

      await trackActivity('template_created', {
        templateId: createdTemplate.id,
        templateName: createdTemplate.name,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleTemplateSelect = async (template: PipelineTemplate) => {
    setSelectedTemplate(template);
    
    // Generate preview
    try {
      const preview = await previewTemplate(template.id);
      setTemplatePreview(preview);
    } catch (error) {
      console.error('Error generating template preview:', error);
    }

    if (onTemplateSelected) {
      onTemplateSelected(template);
    }
  };

  const handleTemplateApply = async (template: PipelineTemplate, customConfig?: TemplateConfiguration) => {
    try {
      const config = customConfig || template.defaultConfiguration;
      await applyTemplate(template.id, config);

      if (onTemplateApplied) {
        onTemplateApplied(template, config);
      }

      await trackActivity('template_applied', {
        templateId: template.id,
        templateName: template.name,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const handleToggleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getTemplateIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'data-ingestion': return <Database className="h-5 w-5" />;
      case 'etl': return <Workflow className="h-5 w-5" />;
      case 'analytics': return <TrendingUp className="h-5 w-5" />;
      case 'ml': return <Zap className="h-5 w-5" />;
      case 'governance': return <Lock className="h-5 w-5" />;
      default: return <FileTemplate className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'data-ingestion': return 'bg-blue-100 text-blue-800';
      case 'etl': return 'bg-green-100 text-green-800';
      case 'analytics': return 'bg-purple-100 text-purple-800';
      case 'ml': return 'bg-orange-100 text-orange-800';
      case 'governance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTemplateCard = (template: PipelineTemplate) => (
    <Card 
      key={template.id} 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={() => handleTemplateSelect(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getTemplateIcon(template.category)}
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {template.name}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(template.id);
            }}
          >
            <Heart 
              className={`h-4 w-4 ${
                favorites.includes(template.id) 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-400'
              }`} 
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Badge className={getCategoryColor(template.category)}>
              {template.category}
            </Badge>
            {template.isPublic ? (
              <Badge variant="outline">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              <Users className="h-3 w-3 mr-1 inline" />
              {usageStats.find(s => s.templateId === template.id)?.usageCount || 0} uses
            </span>
            <span>
              <Star className="h-3 w-3 mr-1 inline" />
              {template.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              by {template.createdBy}
            </span>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle clone
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle share
                }}
              >
                <Share2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTemplateApply(template);
                }}
              >
                <CheckCircle2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <TooltipProvider>
      <div className={`pipeline-template-manager h-full ${className}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight flex items-center">
                <FileTemplate className="h-8 w-8 mr-3 text-primary" />
                Pipeline Template Manager
              </h2>
              <p className="text-muted-foreground">
                Create, manage, and share pipeline templates
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="library">Template Library</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Template Library Tab */}
            <TabsContent value="library" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search templates..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="created">Created</SelectItem>
                          <SelectItem value="updated">Updated</SelectItem>
                          <SelectItem value="usage">Usage</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterBy} onValueChange={setFilterBy}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="mine">My Templates</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(template => renderTemplateCard(template))}
              </div>

              {filteredTemplates.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileTemplate className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No templates found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or create a new template.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {getTemplateIcon(category.name)}
                        <span className="ml-2">{category.name}</span>
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge className={getCategoryColor(category.name)}>
                          {allTemplates.filter(t => t.category === category.id).length} templates
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setActiveTab('library');
                          }}
                        >
                          View Templates
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTemplates
                  .filter(template => favorites.includes(template.id))
                  .map(template => renderTemplateCard(template))
                }
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                    <FileTemplate className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{allTemplates.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Public Templates</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {allTemplates.filter(t => t.isPublic).length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {usageStats.reduce((sum, stat) => sum + stat.usageCount, 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(allTemplates
                        .filter(t => t.rating)
                        .reduce((sum, t) => sum + (t.rating || 0), 0) / 
                        allTemplates.filter(t => t.rating).length
                      ).toFixed(1)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Create Template Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a reusable pipeline template for your team
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-category">Category</Label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this template does..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newTemplate.isPublic}
                    onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <Label>Make this template public</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTemplate}
                    disabled={!newTemplate.name || !newTemplate.description}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
}