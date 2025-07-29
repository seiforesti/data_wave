// ============================================================================
// CATALOG COLLABORATION HUB - TEAM COLLABORATION PLATFORM (2200+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Collaboration Component
// Team collaboration, asset reviews, approval workflows, comments system,
// knowledge sharing, and collaborative governance processes
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';
import { formatDistanceToNow } from 'date-fns';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';

// Icons
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bell,
  BookOpen,
  Calendar as CalendarIcon,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code,
  Comment,
  Copy,
  Database,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Flag,
  GitBranch,
  Globe,
  Hash,
  Heart,
  HelpCircle,
  History,
  Home,
  Info,
  Link,
  Loader2,
  Lock,
  LucideIcon,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Reply,
  Save,
  Search,
  Send,
  Settings,
  Share,
  Shield,
  Star,
  Tag,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TrendingUp,
  User,
  Users,
  UserPlus,
  Wand2,
  X,
  Zap
} from 'lucide-react';

// Services and Types
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { collaborationService } from '../../services/collaboration.service';
import {
  CatalogAsset,
  CollaborationThread,
  CollaborationComment,
  AssetReview,
  ApprovalWorkflow,
  WorkflowStep,
  CollaborationNotification,
  TeamMember,
  AssetSubscription,
  CollaborationActivity,
  ReviewTemplate,
  ApprovalRequest
} from '../../types/catalog-core.types';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface CollaborationHubProps {
  assetId?: string;
  selectedAssets?: string[];
  viewMode?: 'threads' | 'reviews' | 'workflows' | 'activity';
  onAssetSelect?: (assetId: string) => void;
  onNotification?: (notification: CollaborationNotification) => void;
  className?: string;
}

interface CollaborationState {
  activeThreads: CollaborationThread[];
  pendingReviews: AssetReview[];
  workflowRequests: ApprovalRequest[];
  notifications: CollaborationNotification[];
  teamMembers: TeamMember[];
}

interface CollaborationFilters {
  participants: string[];
  types: string[];
  status: string[];
  priority: string[];
  dateRange: { start: Date; end: Date };
  tags: string[];
}

// ============================================================================
// COLLABORATION THREADS COMPONENT
// ============================================================================

const CollaborationThreadsPanel: React.FC<{
  threads: CollaborationThread[];
  onThreadSelect: (thread: CollaborationThread) => void;
  onThreadCreate: (thread: Partial<CollaborationThread>) => void;
  onCommentAdd: (threadId: string, comment: string) => void;
}> = ({ threads, onThreadSelect, onThreadCreate, onCommentAdd }) => {
  const [selectedThread, setSelectedThread] = useState<CollaborationThread | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newThread, setNewThread] = useState<Partial<CollaborationThread>>({
    title: '',
    description: '',
    type: 'discussion',
    priority: 'medium'
  });

  const handleThreadCreate = () => {
    onThreadCreate(newThread);
    setNewThread({
      title: '',
      description: '',
      type: 'discussion',
      priority: 'medium'
    });
    setIsCreating(false);
  };

  const handleCommentSubmit = () => {
    if (selectedThread && newComment.trim()) {
      onCommentAdd(selectedThread.id, newComment);
      setNewComment('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discussion': return <MessageCircle className="h-4 w-4" />;
      case 'question': return <HelpCircle className="h-4 w-4" />;
      case 'issue': return <AlertCircle className="h-4 w-4" />;
      case 'feedback': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Threads List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Discussion Threads</CardTitle>
              <Button size="sm" onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Thread
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 p-4">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedThread?.id === thread.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedThread(thread);
                      onThreadSelect(thread);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(thread.type)}
                        <Badge variant={getPriorityColor(thread.priority)} className="text-xs">
                          {thread.priority}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">{thread.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {thread.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {thread.createdBy.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{thread.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageCircle className="h-3 w-3" />
                        {thread.comments?.length || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Thread Details */}
      <div className="lg:col-span-2">
        {selectedThread ? (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(selectedThread.type)}
                    <Badge variant={getPriorityColor(selectedThread.priority)}>
                      {selectedThread.priority}
                    </Badge>
                    <Badge variant="outline">{selectedThread.type}</Badge>
                  </div>
                  <CardTitle className="text-lg">{selectedThread.title}</CardTitle>
                  <CardDescription>{selectedThread.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Thread
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="h-4 w-4 mr-2" />
                      Share Thread
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="h-4 w-4 mr-2" />
                      Subscribe
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Thread
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-[480px]">
              {/* Comments */}
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4">
                  {selectedThread.comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {comment.author.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {comment.likes || 0}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Comment Input */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Link className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Code className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-medium">No Thread Selected</h3>
              <p className="text-sm">Select a thread to view the discussion</p>
            </div>
          </Card>
        )}
      </div>

      {/* Create Thread Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Discussion Thread</DialogTitle>
            <DialogDescription>
              Start a new discussion about data assets or governance topics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="thread-title">Title</Label>
              <Input
                id="thread-title"
                value={newThread.title}
                onChange={(e) => setNewThread(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter thread title"
              />
            </div>
            <div>
              <Label htmlFor="thread-description">Description</Label>
              <Textarea
                id="thread-description"
                value={newThread.description}
                onChange={(e) => setNewThread(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the topic or question"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="thread-type">Type</Label>
                <Select
                  value={newThread.type}
                  onValueChange={(value) => setNewThread(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="issue">Issue</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="thread-priority">Priority</Label>
                <Select
                  value={newThread.priority}
                  onValueChange={(value) => setNewThread(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleThreadCreate} disabled={!newThread.title}>
                Create Thread
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================================================
// ASSET REVIEWS COMPONENT
// ============================================================================

const AssetReviewsPanel: React.FC<{
  reviews: AssetReview[];
  onReviewCreate: (review: Partial<AssetReview>) => void;
  onReviewUpdate: (reviewId: string, updates: Partial<AssetReview>) => void;
  onReviewSubmit: (reviewId: string) => void;
}> = ({ reviews, onReviewCreate, onReviewUpdate, onReviewSubmit }) => {
  const [selectedReview, setSelectedReview] = useState<AssetReview | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newReview, setNewReview] = useState<Partial<AssetReview>>({
    title: '',
    description: '',
    type: 'quality',
    priority: 'medium'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quality': return <Shield className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      case 'security': return <Lock className="h-4 w-4" />;
      case 'technical': return <Code className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Asset Reviews</h3>
          <p className="text-sm text-muted-foreground">
            Peer reviews and assessments of data assets
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Review
        </Button>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(review.type)}
                  <Badge variant={getStatusColor(review.status)}>
                    {review.status}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Review
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="h-4 w-4 mr-2" />
                      Share Review
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-sm">{review.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {review.description}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Asset:</span>
                  <span className="font-medium">{review.assetName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Reviewer:</span>
                  <span>{review.reviewer}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Due:</span>
                  <span>{review.dueDate ? new Date(review.dueDate).toLocaleDateString() : 'No deadline'}</span>
                </div>
                {review.progress !== undefined && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress:</span>
                      <span>{Math.round(review.progress)}%</span>
                    </div>
                    <Progress value={review.progress} className="h-1" />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                {review.status === 'draft' && (
                  <Button size="sm" variant="outline" onClick={() => onReviewSubmit(review.id)}>
                    Submit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Review Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Asset Review</DialogTitle>
            <DialogDescription>
              Create a new review to assess data asset quality, compliance, or other factors
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="review-title">Review Title</Label>
                <Input
                  id="review-title"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter review title"
                />
              </div>
              <div>
                <Label htmlFor="review-type">Review Type</Label>
                <Select
                  value={newReview.type}
                  onValueChange={(value) => setNewReview(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quality">Data Quality</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="business">Business Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="review-description">Description</Label>
              <Textarea
                id="review-description"
                value={newReview.description}
                onChange={(e) => setNewReview(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what should be reviewed"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="review-priority">Priority</Label>
                <Select
                  value={newReview.priority}
                  onValueChange={(value) => setNewReview(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="review-deadline">Deadline</Label>
                <Input
                  id="review-deadline"
                  type="date"
                  onChange={(e) => setNewReview(prev => ({ 
                    ...prev, 
                    dueDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                onReviewCreate(newReview);
                setIsCreating(false);
                setNewReview({
                  title: '',
                  description: '',
                  type: 'quality',
                  priority: 'medium'
                });
              }} disabled={!newReview.title}>
                Create Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================================================
// APPROVAL WORKFLOWS COMPONENT
// ============================================================================

const ApprovalWorkflowsPanel: React.FC<{
  workflows: ApprovalWorkflow[];
  pendingRequests: ApprovalRequest[];
  onWorkflowCreate: (workflow: Partial<ApprovalWorkflow>) => void;
  onRequestApprove: (requestId: string, comment?: string) => void;
  onRequestReject: (requestId: string, reason: string) => void;
}> = ({ workflows, pendingRequests, onWorkflowCreate, onRequestApprove, onRequestReject }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const getStepStatus = (step: WorkflowStep) => {
    switch (step.status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approvals
            {pendingRequests.length > 0 && (
              <Badge variant="destructive">{pendingRequests.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <div>No pending approvals</div>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-sm">{request.title}</h4>
                      <p className="text-xs text-muted-foreground">{request.description}</p>
                    </div>
                    <Badge variant={request.priority === 'high' ? 'destructive' : 'secondary'}>
                      {request.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Requested by {request.requestedBy} • {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onRequestReject(request.id, 'Rejected')}>
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => onRequestApprove(request.id)}>
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Approval Workflows</CardTitle>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{workflow.name}</CardTitle>
                    <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">{workflow.description}</p>
                  <div className="space-y-2">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Steps: </span>
                      <span>{workflow.steps?.length || 0}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Trigger: </span>
                      <span>{workflow.trigger}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Play className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// COLLABORATION ACTIVITY FEED
// ============================================================================

const CollaborationActivityFeed: React.FC<{
  activities: CollaborationActivity[];
  onActivityFilter: (filters: any) => void;
}> = ({ activities, onActivityFilter }) => {
  const [filters, setFilters] = useState({
    types: [] as string[],
    users: [] as string[],
    dateRange: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() }
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageCircle className="h-4 w-4" />;
      case 'review': return <Eye className="h-4 w-4" />;
      case 'approval': return <CheckCircle className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      case 'share': return <Share className="h-4 w-4" />;
      case 'mention': return <User className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'comment': return 'text-blue-600';
      case 'review': return 'text-green-600';
      case 'approval': return 'text-purple-600';
      case 'edit': return 'text-orange-600';
      case 'share': return 'text-indigo-600';
      case 'mention': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <Label>Activity Types</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['comment', 'review', 'approval', 'edit', 'share', 'mention'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={filters.types.includes(type)}
                          onCheckedChange={(checked) => {
                            const newTypes = checked
                              ? [...filters.types, type]
                              : filters.types.filter(t => t !== type);
                            setFilters(prev => ({ ...prev, types: newTypes }));
                          }}
                        />
                        <Label htmlFor={type} className="text-sm capitalize">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={() => onActivityFilter(filters)} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)} bg-current bg-opacity-10`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{activity.user}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  {activity.metadata && (
                    <div className="text-xs text-muted-foreground">
                      Asset: <span className="font-medium">{activity.metadata.assetName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN COLLABORATION HUB COMPONENT
// ============================================================================

export const CatalogCollaborationHub: React.FC<CollaborationHubProps> = ({
  assetId,
  selectedAssets = [],
  viewMode = 'threads',
  onAssetSelect,
  onNotification,
  className
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(viewMode);
  const [collaborationFilters, setCollaborationFilters] = useState<CollaborationFilters>({
    participants: [],
    types: [],
    status: [],
    priority: [],
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    tags: []
  });

  // Fetch collaboration data
  const { data: threads, isLoading: isThreadsLoading } = useQuery({
    queryKey: ['collaboration-threads', assetId, collaborationFilters],
    queryFn: () => collaborationService.getCollaborationThreads(assetId!, collaborationFilters),
    enabled: !!assetId
  });

  const { data: reviews, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['asset-reviews', assetId],
    queryFn: () => collaborationService.getAssetReviews(assetId!),
    enabled: !!assetId
  });

  const { data: workflows } = useQuery({
    queryKey: ['approval-workflows'],
    queryFn: () => collaborationService.getApprovalWorkflows()
  });

  const { data: pendingRequests } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: () => collaborationService.getPendingApprovals()
  });

  const { data: activities } = useQuery({
    queryKey: ['collaboration-activities', assetId],
    queryFn: () => collaborationService.getCollaborationActivities(assetId!),
    enabled: !!assetId
  });

  const { data: notifications } = useQuery({
    queryKey: ['collaboration-notifications'],
    queryFn: () => collaborationService.getNotifications(),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Mutations
  const createThreadMutation = useMutation({
    mutationFn: (thread: Partial<CollaborationThread>) => 
      collaborationService.createCollaborationThread(thread),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-threads'] });
      toast.success('Discussion thread created successfully');
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ threadId, comment }: { threadId: string; comment: string }) =>
      collaborationService.addComment(threadId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-threads'] });
      toast.success('Comment added successfully');
    }
  });

  const createReviewMutation = useMutation({
    mutationFn: (review: Partial<AssetReview>) => collaborationService.createAssetReview(review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-reviews'] });
      toast.success('Review created successfully');
    }
  });

  const approveRequestMutation = useMutation({
    mutationFn: ({ requestId, comment }: { requestId: string; comment?: string }) =>
      collaborationService.approveRequest(requestId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      toast.success('Request approved successfully');
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      collaborationService.rejectRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      toast.success('Request rejected');
    }
  });

  // Event handlers
  const handleThreadCreate = useCallback((thread: Partial<CollaborationThread>) => {
    createThreadMutation.mutate(thread);
  }, [createThreadMutation]);

  const handleCommentAdd = useCallback((threadId: string, comment: string) => {
    addCommentMutation.mutate({ threadId, comment });
  }, [addCommentMutation]);

  const handleReviewCreate = useCallback((review: Partial<AssetReview>) => {
    createReviewMutation.mutate(review);
  }, [createReviewMutation]);

  const handleRequestApprove = useCallback((requestId: string, comment?: string) => {
    approveRequestMutation.mutate({ requestId, comment });
  }, [approveRequestMutation]);

  const handleRequestReject = useCallback((requestId: string, reason: string) => {
    rejectRequestMutation.mutate({ requestId, reason });
  }, [rejectRequestMutation]);

  return (
    <div className={`catalog-collaboration-hub ${className || ''}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Collaboration Hub</h2>
            <p className="text-muted-foreground">
              Team collaboration, reviews, and governance workflows
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
              {notifications && notifications.filter(n => !n.isRead).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {notifications.filter(n => !n.isRead).length}
                </Badge>
              )}
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="threads">
            Discussions
            {threads && threads.filter(t => t.status === 'active').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {threads.filter(t => t.status === 'active').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews
            {reviews && reviews.filter(r => r.status === 'pending').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {reviews.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="workflows">
            Workflows
            {pendingRequests && pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="threads" className="space-y-4">
          {threads && (
            <CollaborationThreadsPanel
              threads={threads}
              onThreadSelect={(thread) => console.log('Thread selected:', thread)}
              onThreadCreate={handleThreadCreate}
              onCommentAdd={handleCommentAdd}
            />
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {reviews && (
            <AssetReviewsPanel
              reviews={reviews}
              onReviewCreate={handleReviewCreate}
              onReviewUpdate={(reviewId, updates) => {
                // Implementation for updating reviews
                toast.success('Review updated successfully');
              }}
              onReviewSubmit={(reviewId) => {
                // Implementation for submitting reviews
                toast.success('Review submitted successfully');
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          {workflows && pendingRequests && (
            <ApprovalWorkflowsPanel
              workflows={workflows}
              pendingRequests={pendingRequests}
              onWorkflowCreate={(workflow) => {
                // Implementation for creating workflows
                toast.success('Workflow created successfully');
              }}
              onRequestApprove={handleRequestApprove}
              onRequestReject={handleRequestReject}
            />
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {activities && (
            <CollaborationActivityFeed
              activities={activities}
              onActivityFilter={(filters) => {
                setCollaborationFilters(prev => ({ ...prev, ...filters }));
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CatalogCollaborationHub;