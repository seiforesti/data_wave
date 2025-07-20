import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Copy,
  Edit,
  Eye,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash,
  Download,
  Upload,
  Settings,
  BarChart3,
  FileText,
  Check,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import classificationApi from '@/api/classification.api';
import {
  ClassificationFramework,
  CreateFrameworkRequest,
  UpdateFrameworkRequest,
  FrameworkType,
  PaginationParams,
  ClassificationFilters
} from './types/classification.types';

const ClassificationFrameworkManager: React.FC = () => {
  const [frameworks, setFrameworks] = useState<ClassificationFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, size: 10 });
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<ClassificationFilters>({});
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Form states
  const [selectedFramework, setSelectedFramework] = useState<ClassificationFramework | null>(null);
  const [formData, setFormData] = useState<CreateFrameworkRequest>({
    name: '',
    description: '',
    framework_type: FrameworkType.CUSTOM,
    version: '1.0.0',
    compliance_mappings: {},
    metadata: {}
  });
  const [duplicateName, setDuplicateName] = useState('');

  useEffect(() => {
    loadFrameworks();
  }, [pagination, filters]);

  const loadFrameworks = async () => {
    try {
      setLoading(true);
      const response = await classificationApi.getFrameworks(filters, pagination);
      setFrameworks(response.items);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to load frameworks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load classification frameworks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await classificationApi.createFramework(formData);
      toast({
        title: 'Success',
        description: 'Framework created successfully',
      });
      setCreateDialogOpen(false);
      resetForm();
      loadFrameworks();
    } catch (error) {
      console.error('Failed to create framework:', error);
      toast({
        title: 'Error',
        description: 'Failed to create framework',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedFramework) return;
    
    try {
      await classificationApi.updateFramework(selectedFramework.id, formData);
      toast({
        title: 'Success',
        description: 'Framework updated successfully',
      });
      setEditDialogOpen(false);
      resetForm();
      loadFrameworks();
    } catch (error) {
      console.error('Failed to update framework:', error);
      toast({
        title: 'Error',
        description: 'Failed to update framework',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedFramework) return;
    
    try {
      await classificationApi.deleteFramework(selectedFramework.id);
      toast({
        title: 'Success',
        description: 'Framework deleted successfully',
      });
      setDeleteDialogOpen(false);
      setSelectedFramework(null);
      loadFrameworks();
    } catch (error) {
      console.error('Failed to delete framework:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete framework',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async () => {
    if (!selectedFramework || !duplicateName.trim()) return;
    
    try {
      await classificationApi.duplicateFramework(selectedFramework.id, duplicateName);
      toast({
        title: 'Success',
        description: 'Framework duplicated successfully',
      });
      setDuplicateDialogOpen(false);
      setDuplicateName('');
      setSelectedFramework(null);
      loadFrameworks();
    } catch (error) {
      console.error('Failed to duplicate framework:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate framework',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (framework: ClassificationFramework) => {
    setSelectedFramework(framework);
    setFormData({
      name: framework.name,
      description: framework.description || '',
      framework_type: framework.framework_type,
      version: framework.version,
      is_active: framework.is_active,
      compliance_mappings: framework.compliance_mappings || {},
      metadata: framework.metadata || {}
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (framework: ClassificationFramework) => {
    setSelectedFramework(framework);
    setDeleteDialogOpen(true);
  };

  const openDuplicateDialog = (framework: ClassificationFramework) => {
    setSelectedFramework(framework);
    setDuplicateName(`${framework.name} (Copy)`);
    setDuplicateDialogOpen(true);
  };

  const openViewDialog = (framework: ClassificationFramework) => {
    setSelectedFramework(framework);
    setViewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      framework_type: FrameworkType.CUSTOM,
      version: '1.0.0',
      compliance_mappings: {},
      metadata: {}
    });
    setSelectedFramework(null);
  };

  const handleSearch = (query: string) => {
    setFilters({ ...filters, search_query: query });
    setPagination({ ...pagination, page: 1 });
  };

  const getFrameworkTypeColor = (type: FrameworkType): string => {
    const colors = {
      regulatory: 'bg-red-100 text-red-800',
      industry: 'bg-blue-100 text-blue-800',
      custom: 'bg-green-100 text-green-800',
      ai_generated: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classification Frameworks</h1>
          <p className="text-muted-foreground">
            Manage classification frameworks that define how data is categorized
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadFrameworks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Framework
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Classification Framework</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Framework name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="1.0.0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Framework Type</Label>
                  <Select
                    value={formData.framework_type}
                    onValueChange={(value) => setFormData({ ...formData, framework_type: value as FrameworkType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FrameworkType.REGULATORY}>Regulatory</SelectItem>
                      <SelectItem value={FrameworkType.INDUSTRY}>Industry</SelectItem>
                      <SelectItem value={FrameworkType.CUSTOM}>Custom</SelectItem>
                      <SelectItem value={FrameworkType.AI_GENERATED}>AI Generated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Framework description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={!formData.name.trim()}>
                    Create Framework
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search frameworks..."
                  className="pl-10"
                  value={filters.search_query || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <Select
              value={filters.is_active?.toString() || 'all'}
              onValueChange={(value) => setFilters({ 
                ...filters, 
                is_active: value === 'all' ? undefined : value === 'true' 
              })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Frameworks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Frameworks ({frameworks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2">Loading frameworks...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Rules</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frameworks.map((framework) => (
                  <TableRow key={framework.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{framework.name}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {framework.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getFrameworkTypeColor(framework.framework_type)}>
                        {framework.framework_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">v{framework.version}</Badge>
                    </TableCell>
                    <TableCell>
                      {framework.rules_count || 0} rules
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {framework.is_active ? (
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={framework.is_active ? 'text-green-700' : 'text-red-700'}>
                          {framework.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(framework.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openViewDialog(framework)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(framework)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDuplicateDialog(framework)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(framework)}>
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {totalPages}
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= totalPages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Framework</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-version">Version</Label>
                <Input
                  id="edit-version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active || false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>
                Update Framework
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Framework</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedFramework?.name}"? This action cannot be undone.
              All associated rules will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Framework</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="duplicate-name">New Framework Name</Label>
              <Input
                id="duplicate-name"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                placeholder="Enter new framework name"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDuplicate} disabled={!duplicateName.trim()}>
                Duplicate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Framework Details</DialogTitle>
          </DialogHeader>
          {selectedFramework && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedFramework.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground">{selectedFramework.framework_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Version</Label>
                  <p className="text-sm text-muted-foreground">{selectedFramework.version}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedFramework.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">{selectedFramework.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedFramework.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedFramework.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedFramework.usage_statistics && (
                <div>
                  <Label className="text-sm font-medium">Usage Statistics</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Rules</p>
                      <p className="text-sm font-medium">{selectedFramework.usage_statistics.total_rules}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                      <p className="text-sm font-medium">{selectedFramework.usage_statistics.success_rate}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassificationFrameworkManager;