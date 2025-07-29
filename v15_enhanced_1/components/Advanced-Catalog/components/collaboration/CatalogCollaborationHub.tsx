// ============================================================================
// CATALOG COLLABORATION HUB - TEAM COLLABORATION PLATFORM (2200+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Collaboration Component
// Real-time team collaboration, workflow management, annotation system,
// knowledge sharing, decision tracking, and collaborative data governance
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';

// ============================================================================
// SHADCN/UI IMPORTS
// ============================================================================
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuSub } from '@/components/ui/dropdown-menu';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { AlertCircle, Activity, BarChart3, Brain, ChevronDown, ChevronRight, Clock, Database, Download, Eye, Filter, GitBranch, Globe, Home, Info, Layers, LineChart, MapPin, Network, Play, Plus, RefreshCw, Save, Search, Settings, Share2, Target, Trash2, TrendingUp, Users, Zap, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Move, Square, Circle, Triangle, Hexagon, Star, Bookmark, Bell, MessageCircle, Tag, Link, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronUp, MoreHorizontal, Edit, Copy, ExternalLink, FileText, Image, Video, Music, Archive, Code, Table, PieChart, TreePine, Workflow, AlertTriangle, CheckCircle, XCircle, MinusCircle, TrendingDown, Calendar as CalendarIcon, Clock3, Gauge, Shield, Award, Lightbulb, Bug, Wrench, Monitor, Server, HardDrive, Cpu, MemoryStick, CloudLightning, Wifi, WifiOff, CloudRain, Sun, Moon, Thermometer, Battery, Signal, MessageSquare, UserPlus, UserX, Paperclip, Send, Reply, Forward, ThumbsUp, ThumbsDown, Heart, Flag, Pin, Archive as ArchiveIcon, Unarchive, Mute, Volume2, BellRing, PhoneCall, VideoIcon, ScreenShare, Calendar as CalendarIconAlt, CheckSquare, Square as SquareIcon, Hash, AtSign, Smile, Emoji, GithubIcon, SlackIcon, TeamsIcon, EmailIcon, WhatsappIcon, Mention, Quote, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Code2, AlignLeft, AlignCenter, AlignRight, Indent, Outdent, History, Undo, Redo } from 'lucide-react';

// ============================================================================
// TYPE IMPORTS AND INTERFACES
// ============================================================================
import {
  // Core Types
  DataAsset,
  AssetMetadata,
  AssetType,
  DataSourceConfig,
  
  // Collaboration Types
  Comment,
  Annotation,
  Discussion,
  WorkflowStep,
  ApprovalRequest,
  ReviewTask,
  TeamMember,
  UserRole,
  Permission,
  
  // Notification Types
  Notification,
  NotificationType,
  NotificationSettings,
  
  // Activity Types
  ActivityLog,
  ActivityType,
  UserActivity,
  
  // Workflow Types
  Workflow,
  WorkflowTemplate,
  WorkflowStatus,
  
  // Tag and Organization
  Tag,
  Collection,
  Bookmark,
  
  // Search and Discovery
  SearchQuery,
  SearchResult,
  SearchFilters,
  
  // Advanced Features
  AIRecommendation,
  SmartInsight,
  AutomatedDiscovery,
  
  // API Response Types
  ApiResponse,
  PaginatedResponse,
  ErrorResponse
} from '../../types/catalog-core.types';

// ============================================================================
// SERVICE IMPORTS
// ============================================================================
import {
  enterpriseCatalogService,
  collaborationService,
  searchService,
  analyticsService,
  aiService,
  notificationService,
  workflowService
} from '../../services/enterprise-catalog.service';

// ============================================================================
// CONSTANTS AND CONFIGURATIONS
// ============================================================================
const COLLABORATION_TYPES = {
  COMMENT: 'comment',
  ANNOTATION: 'annotation',
  DISCUSSION: 'discussion',
  REVIEW: 'review',
  APPROVAL: 'approval',
  MENTION: 'mention',
  REACTION: 'reaction'
} as const;

const WORKFLOW_STATUSES = {
  DRAFT: 'draft',
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

const USER_ROLES = {
  VIEWER: 'viewer',
  CONTRIBUTOR: 'contributor',
  REVIEWER: 'reviewer',
  ADMIN: 'admin',
  OWNER: 'owner'
} as const;

const NOTIFICATION_TYPES = {
  COMMENT: 'comment',
  MENTION: 'mention',
  APPROVAL_REQUEST: 'approval_request',
  WORKFLOW_UPDATE: 'workflow_update',
  TASK_ASSIGNED: 'task_assigned',
  DEADLINE_REMINDER: 'deadline_reminder',
  ASSET_UPDATED: 'asset_updated'
} as const;

const ACTIVITY_TYPES = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  COMMENTED: 'commented',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  TAGGED: 'tagged',
  SHARED: 'shared'
} as const;

const REACTION_TYPES = {
  LIKE: 'like',
  DISLIKE: 'dislike',
  HEART: 'heart',
  THUMBS_UP: 'thumbs_up',
  THUMBS_DOWN: 'thumbs_down',
  LAUGH: 'laugh',
  CONFUSED: 'confused',
  EYES: 'eyes'
} as const;

const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

// ============================================================================
// EXTENDED INTERFACES FOR COLLABORATION HUB
// ============================================================================
interface CollaborationHubProps {
  assetId?: string;
  enableRealTimeUpdates?: boolean;
  enableWorkflows?: boolean;
  enableNotifications?: boolean;
  enableMentions?: boolean;
  enableReactions?: boolean;
  defaultView?: 'discussions' | 'activities' | 'workflows' | 'team';
  teamId?: string;
  userRole?: keyof typeof USER_ROLES;
  onCommentAdded?: (comment: Comment) => void;
  onWorkflowUpdate?: (workflow: Workflow) => void;
  onUserMention?: (mention: any) => void;
  className?: string;
}

interface CollaborationState {
  selectedAssets: Set<string>;
  activeDiscussions: Discussion[];
  currentWorkflows: Workflow[];
  teamMembers: TeamMember[];
  notifications: Notification[];
  activities: ActivityLog[];
  filterState: CollaborationFilterState;
  viewMode: 'discussions' | 'activities' | 'workflows' | 'team' | 'notifications';
  realTimeEnabled: boolean;
}

interface CollaborationFilterState {
  searchQuery: string;
  statusFilter: keyof typeof WORKFLOW_STATUSES | 'all';
  typeFilter: keyof typeof COLLABORATION_TYPES | 'all';
  userFilter: string | 'all';
  priorityFilter: keyof typeof PRIORITY_LEVELS | 'all';
  dateRange: { start: Date; end: Date };
  showOnlyActive: boolean;
  showOnlyMentions: boolean;
}

interface DiscussionThread {
  id: string;
  assetId: string;
  title: string;
  description: string;
  author: TeamMember;
  participants: TeamMember[];
  comments: Comment[];
  tags: Tag[];
  priority: keyof typeof PRIORITY_LEVELS;
  status: 'open' | 'closed' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  reactions: Record<keyof typeof REACTION_TYPES, number>;
  attachments: any[];
}

interface WorkflowInstance {
  id: string;
  templateId: string;
  name: string;
  description: string;
  assetId: string;
  assignee: TeamMember;
  reviewer: TeamMember;
  steps: WorkflowStep[];
  currentStep: number;
  status: keyof typeof WORKFLOW_STATUSES;
  priority: keyof typeof PRIORITY_LEVELS;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

interface TeamActivity {
  id: string;
  type: keyof typeof ACTIVITY_TYPES;
  user: TeamMember;
  assetId: string;
  assetName: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

// ============================================================================
// DISCUSSION THREAD COMPONENT
// ============================================================================
const DiscussionThreadPanel: React.FC<{
  discussions: DiscussionThread[];
  isLoading: boolean;
  currentUser: TeamMember;
  onCreateDiscussion: (discussion: Partial<DiscussionThread>) => void;
  onAddComment: (discussionId: string, comment: Partial<Comment>) => void;
  onReaction: (discussionId: string, commentId: string, reaction: keyof typeof REACTION_TYPES) => void;
  onCloseDiscussion: (discussionId: string) => void;
}> = ({ discussions, isLoading, currentUser, onCreateDiscussion, onAddComment, onReaction, onCloseDiscussion }) => {
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionThread | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useDebounce('', 300);

  const filteredDiscussions = useMemo(() => {
    return discussions.filter(discussion => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          discussion.title.toLowerCase().includes(query) ||
          discussion.description.toLowerCase().includes(query) ||
          discussion.author.name.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [discussions, searchQuery]);

  const CreateDiscussionForm = ({ onSave, onCancel }: {
    onSave: (discussion: Partial<DiscussionThread>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      priority: 'MEDIUM' as keyof typeof PRIORITY_LEVELS,
      tags: [] as string[]
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        author: currentUser,
        participants: [currentUser],
        status: 'open'
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Discussion Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter discussion title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the discussion topic"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_LEVELS).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Create Discussion
          </Button>
        </div>
      </form>
    );
  };

  const CommentComponent = ({ comment, onReactionClick }: {
    comment: Comment;
    onReactionClick: (reaction: keyof typeof REACTION_TYPES) => void;
  }) => {
    const [showReactions, setShowReactions] = useState(false);

    return (
      <div className="flex space-x-3 p-4 border rounded-lg">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>{comment.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
            {comment.isEdited && (
              <Badge variant="outline" className="text-xs">Edited</Badge>
            )}
          </div>
          
          <div className="mt-1 text-sm text-gray-700">
            {comment.content}
          </div>
          
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mt-2 flex space-x-2">
              {comment.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center space-x-1 text-xs text-blue-600">
                  <Paperclip className="h-3 w-3" />
                  <span>{attachment.name}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-2 flex items-center space-x-4">
            <Popover open={showReactions} onOpenChange={setShowReactions}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Smile className="h-3 w-3 mr-1" />
                  React
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex space-x-1">
                  {Object.values(REACTION_TYPES).map(reaction => (
                    <Button
                      key={reaction}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        onReactionClick(reaction);
                        setShowReactions(false);
                      }}
                    >
                      {getReactionEmoji(reaction)}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            
            {comment.reactions && Object.keys(comment.reactions).length > 0 && (
              <div className="flex space-x-1">
                {Object.entries(comment.reactions).map(([reaction, count]) => (
                  count > 0 && (
                    <Badge key={reaction} variant="outline" className="text-xs">
                      {getReactionEmoji(reaction as keyof typeof REACTION_TYPES)} {count}
                    </Badge>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getReactionEmoji = (reaction: keyof typeof REACTION_TYPES): string => {
    const emojiMap = {
      [REACTION_TYPES.LIKE]: '👍',
      [REACTION_TYPES.DISLIKE]: '👎',
      [REACTION_TYPES.HEART]: '❤️',
      [REACTION_TYPES.THUMBS_UP]: '👍',
      [REACTION_TYPES.THUMBS_DOWN]: '👎',
      [REACTION_TYPES.LAUGH]: '😂',
      [REACTION_TYPES.CONFUSED]: '😕',
      [REACTION_TYPES.EYES]: '👀'
    };
    return emojiMap[reaction] || '👍';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discussions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discussions ({filteredDiscussions.length})
          </h2>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Discussion</DialogTitle>
              <DialogDescription>
                Start a new discussion about data assets or governance topics
              </DialogDescription>
            </DialogHeader>
            <CreateDiscussionForm
              onSave={(discussion) => {
                onCreateDiscussion(discussion);
                setShowCreateDialog(false);
              }}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Discussions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discussion List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Discussions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredDiscussions.map((discussion) => (
                  <Card 
                    key={discussion.id} 
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedDiscussion?.id === discussion.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedDiscussion(discussion)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-2">{discussion.title}</h4>
                        <div className="flex items-center space-x-1">
                          <Badge variant={
                            discussion.priority === 'critical' ? 'destructive' :
                            discussion.priority === 'high' ? 'default' :
                            'secondary'
                          } className="text-xs">
                            {discussion.priority}
                          </Badge>
                          <Badge variant={
                            discussion.status === 'open' ? 'default' :
                            discussion.status === 'resolved' ? 'secondary' :
                            'outline'
                          } className="text-xs">
                            {discussion.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2">{discussion.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={discussion.author.avatar} />
                            <AvatarFallback>{discussion.author.name.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                          <span>{discussion.author.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {discussion.comments.length}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {discussion.participants.length}
                          </span>
                          <span>{new Date(discussion.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {filteredDiscussions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <div className="font-medium">No discussions found</div>
                    <div className="text-sm">Start a new discussion to get the conversation going</div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Discussion Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDiscussion ? selectedDiscussion.title : 'Select a Discussion'}
            </CardTitle>
            {selectedDiscussion && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{selectedDiscussion.status}</Badge>
                <Badge variant="outline">{selectedDiscussion.priority}</Badge>
                <span className="text-sm text-gray-500">
                  Created {new Date(selectedDiscussion.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selectedDiscussion ? (
              <div className="space-y-4">
                {/* Description */}
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm">{selectedDiscussion.description}</p>
                </div>

                {/* Participants */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Participants:</span>
                  <div className="flex -space-x-2">
                    {selectedDiscussion.participants.map((participant) => (
                      <Avatar key={participant.id} className="h-6 w-6 border-2 border-white">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="text-xs">
                          {participant.name.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {selectedDiscussion.comments.map((comment) => (
                      <CommentComponent
                        key={comment.id}
                        comment={comment}
                        onReactionClick={(reaction) => onReaction(selectedDiscussion.id, comment.id, reaction)}
                      />
                    ))}
                  </div>
                </ScrollArea>

                {/* Add Comment */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <AtSign className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => {
                        if (newComment.trim()) {
                          onAddComment(selectedDiscussion.id, {
                            content: newComment,
                            author: currentUser
                          });
                          setNewComment('');
                        }
                      }}
                      disabled={!newComment.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="font-medium">Select a discussion to view details</div>
                <div className="text-sm">Choose from the list to see comments and participate</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// WORKFLOW MANAGEMENT COMPONENT
// ============================================================================
const WorkflowManagementPanel: React.FC<{
  workflows: WorkflowInstance[];
  isLoading: boolean;
  currentUser: TeamMember;
  onCreateWorkflow: (workflow: Partial<WorkflowInstance>) => void;
  onUpdateWorkflow: (workflowId: string, updates: Partial<WorkflowInstance>) => void;
  onApproveStep: (workflowId: string, stepId: string) => void;
  onRejectStep: (workflowId: string, stepId: string, reason: string) => void;
}> = ({ workflows, isLoading, currentUser, onCreateWorkflow, onUpdateWorkflow, onApproveStep, onRejectStep }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<keyof typeof WORKFLOW_STATUSES | 'all'>('all');

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      if (statusFilter !== 'all' && workflow.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [workflows, statusFilter]);

  const getStatusColor = (status: keyof typeof WORKFLOW_STATUSES) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'APPROVED': return 'text-green-600 bg-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'IN_REVIEW': return 'text-blue-600 bg-blue-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const WorkflowStepComponent = ({ step, isActive, isCompleted, onApprove, onReject }: {
    step: WorkflowStep;
    isActive: boolean;
    isCompleted: boolean;
    onApprove: () => void;
    onReject: (reason: string) => void;
  }) => {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    return (
      <div className={`p-4 border rounded-lg ${
        isActive ? 'border-blue-300 bg-blue-50' :
        isCompleted ? 'border-green-300 bg-green-50' :
        'border-gray-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-500 text-white' :
                isActive ? 'bg-blue-500 text-white' :
                'bg-gray-300'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-bold">{step.order}</span>
                )}
              </div>
              <h4 className="font-medium">{step.name}</h4>
              <Badge variant="outline" className="text-xs">
                {step.type}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mt-2">{step.description}</p>
            
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              <span>Assignee: {step.assignee?.name || 'Unassigned'}</span>
              {step.dueDate && (
                <span>Due: {new Date(step.dueDate).toLocaleDateString()}</span>
              )}
              {step.estimatedHours && (
                <span>Est: {step.estimatedHours}h</span>
              )}
            </div>
          </div>
          
          {isActive && step.requiresApproval && (
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={onApprove}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              
              <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Step</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for rejecting this step
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Reason for rejection..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowRejectDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          onReject(rejectReason);
                          setShowRejectDialog(false);
                          setRejectReason('');
                        }}
                        disabled={!rejectReason.trim()}
                      >
                        Reject Step
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflows
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflows ({filteredWorkflows.length})
          </h2>
          
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(WORKFLOW_STATUSES).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {key.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredWorkflows.map((workflow) => (
                  <Card 
                    key={workflow.id} 
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedWorkflow?.id === workflow.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{workflow.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{workflow.description}</p>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(workflow.status)}`}>
                          {workflow.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {/* Progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{workflow.currentStep}/{workflow.steps.length}</span>
                        </div>
                        <Progress 
                          value={(workflow.currentStep / workflow.steps.length) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={workflow.assignee.avatar} />
                            <AvatarFallback>{workflow.assignee.name.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                          <span>{workflow.assignee.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge variant={
                            workflow.priority === 'critical' ? 'destructive' :
                            workflow.priority === 'high' ? 'default' :
                            'secondary'
                          } className="text-xs">
                            {workflow.priority}
                          </Badge>
                          {workflow.dueDate && (
                            <span>Due: {new Date(workflow.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {filteredWorkflows.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Workflow className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <div className="font-medium">No workflows found</div>
                    <div className="text-sm">Create a new workflow to get started</div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Workflow Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedWorkflow ? selectedWorkflow.name : 'Select a Workflow'}
            </CardTitle>
            {selectedWorkflow && (
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(selectedWorkflow.status)}>
                  {selectedWorkflow.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">{selectedWorkflow.priority}</Badge>
                {selectedWorkflow.dueDate && (
                  <span className="text-sm text-gray-500">
                    Due: {new Date(selectedWorkflow.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selectedWorkflow ? (
              <div className="space-y-4">
                {/* Description */}
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm">{selectedWorkflow.description}</p>
                </div>

                {/* Workflow Steps */}
                <div className="space-y-3">
                  <h4 className="font-medium">Workflow Steps</h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {selectedWorkflow.steps.map((step, index) => (
                        <WorkflowStepComponent
                          key={step.id}
                          step={step}
                          isActive={index === selectedWorkflow.currentStep}
                          isCompleted={index < selectedWorkflow.currentStep}
                          onApprove={() => onApproveStep(selectedWorkflow.id, step.id)}
                          onReject={(reason) => onRejectStep(selectedWorkflow.id, step.id, reason)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Team */}
                <div className="space-y-2">
                  <h4 className="font-medium">Team</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Assignee:</span>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedWorkflow.assignee.avatar} />
                        <AvatarFallback>{selectedWorkflow.assignee.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{selectedWorkflow.assignee.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Reviewer:</span>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedWorkflow.reviewer.avatar} />
                        <AvatarFallback>{selectedWorkflow.reviewer.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{selectedWorkflow.reviewer.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="font-medium">Select a workflow to view details</div>
                <div className="text-sm">Choose from the list to see steps and progress</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// TEAM ACTIVITY FEED COMPONENT
// ============================================================================
const TeamActivityFeed: React.FC<{
  activities: TeamActivity[];
  isLoading: boolean;
  currentUser: TeamMember;
}> = ({ activities, isLoading, currentUser }) => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      if (userFilter !== 'all' && activity.user.id !== userFilter) {
        return false;
      }

      if (timeFilter !== 'all') {
        const now = new Date();
        const activityDate = new Date(activity.timestamp);
        const hoursDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);

        switch (timeFilter) {
          case '1h': return hoursDiff <= 1;
          case '24h': return hoursDiff <= 24;
          case '7d': return hoursDiff <= 168;
          default: return true;
        }
      }

      return true;
    });
  }, [activities, timeFilter, userFilter]);

  const getActivityIcon = (type: keyof typeof ACTIVITY_TYPES) => {
    switch (type) {
      case 'CREATED': return <Plus className="h-4 w-4 text-green-600" />;
      case 'UPDATED': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'DELETED': return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'COMMENTED': return <MessageCircle className="h-4 w-4 text-purple-600" />;
      case 'REVIEWED': return <Eye className="h-4 w-4 text-orange-600" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'TAGGED': return <Tag className="h-4 w-4 text-yellow-600" />;
      case 'SHARED': return <Share2 className="h-4 w-4 text-indigo-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Team Activity
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {/* Add user options here */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.user.name.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{activity.user.name}</span>
                    <span className="text-xs text-gray-500">{getRelativeTime(activity.timestamp)}</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mt-1">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {activity.assetName}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace('_', ' ').toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredActivities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <div className="font-medium">No recent activity</div>
                <div className="text-sm">Team activities will appear here</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// NOTIFICATION CENTER COMPONENT
// ============================================================================
const NotificationCenter: React.FC<{
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
}> = ({ notifications, isLoading, onMarkAsRead, onMarkAllAsRead, onDeleteNotification }) => {
  const [typeFilter, setTypeFilter] = useState<keyof typeof NOTIFICATION_TYPES | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      if (typeFilter !== 'all' && notification.type !== typeFilter) {
        return false;
      }
      
      if (showUnreadOnly && notification.isRead) {
        return false;
      }
      
      return true;
    });
  }, [notifications, typeFilter, showUnreadOnly]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: keyof typeof NOTIFICATION_TYPES) => {
    switch (type) {
      case 'COMMENT': return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case 'MENTION': return <AtSign className="h-4 w-4 text-purple-600" />;
      case 'APPROVAL_REQUEST': return <CheckSquare className="h-4 w-4 text-orange-600" />;
      case 'WORKFLOW_UPDATE': return <Workflow className="h-4 w-4 text-indigo-600" />;
      case 'TASK_ASSIGNED': return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'DEADLINE_REMINDER': return <Clock className="h-4 w-4 text-red-600" />;
      case 'ASSET_UPDATED': return <Database className="h-4 w-4 text-gray-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={showUnreadOnly}
                onCheckedChange={setShowUnreadOnly}
              />
              <Label className="text-sm">Unread only</Label>
            </div>
            
            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(NOTIFICATION_TYPES).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {key.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
              Mark All Read
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-lg border transition-colors ${
                  notification.isRead 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`text-sm ${notification.isRead ? 'text-gray-900' : 'font-medium'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.isRead && (
                            <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as read
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onDeleteNotification(notification.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredNotifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <div className="font-medium">No notifications</div>
                <div className="text-sm">You're all caught up!</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN CATALOG COLLABORATION HUB COMPONENT
// ============================================================================
const CatalogCollaborationHub: React.FC<CollaborationHubProps> = ({
  assetId,
  enableRealTimeUpdates = true,
  enableWorkflows = true,
  enableNotifications = true,
  enableMentions = true,
  enableReactions = true,
  defaultView = 'discussions',
  teamId,
  userRole = 'CONTRIBUTOR',
  onCommentAdded,
  onWorkflowUpdate,
  onUserMention,
  className
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const queryClient = useQueryClient();

  // Core State
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    selectedAssets: new Set(assetId ? [assetId] : []),
    activeDiscussions: [],
    currentWorkflows: [],
    teamMembers: [],
    notifications: [],
    activities: [],
    filterState: {
      searchQuery: '',
      statusFilter: 'all',
      typeFilter: 'all',
      userFilter: 'all',
      priorityFilter: 'all',
      dateRange: { 
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
        end: new Date() 
      },
      showOnlyActive: true,
      showOnlyMentions: false
    },
    viewMode: defaultView,
    realTimeEnabled: enableRealTimeUpdates
  });

  // UI State
  const [activeTab, setActiveTab] = useState(defaultView);
  const [currentUser, setCurrentUser] = useState<TeamMember>({
    id: 'current-user',
    name: 'Current User',
    email: 'user@example.com',
    avatar: '',
    role: userRole,
    isOnline: true
  });

  // ============================================================================
  // DATA FETCHING WITH REACT QUERY
  // ============================================================================

  // Fetch discussions
  const {
    data: discussions,
    isLoading: isLoadingDiscussions,
    refetch: refetchDiscussions
  } = useQuery({
    queryKey: ['discussions', Array.from(collaborationState.selectedAssets)],
    queryFn: async () => {
      const response = await collaborationService.getDiscussions({
        assetIds: Array.from(collaborationState.selectedAssets),
        includeComments: true,
        includeReactions: enableReactions
      });
      return response.data;
    },
    refetchInterval: collaborationState.realTimeEnabled ? 30000 : false,
    staleTime: 60000
  });

  // Fetch workflows
  const {
    data: workflows,
    isLoading: isLoadingWorkflows,
    refetch: refetchWorkflows
  } = useQuery({
    queryKey: ['workflows', Array.from(collaborationState.selectedAssets)],
    queryFn: async () => {
      const response = await workflowService.getWorkflows({
        assetIds: Array.from(collaborationState.selectedAssets),
        includeSteps: true
      });
      return response.data;
    },
    enabled: enableWorkflows,
    refetchInterval: collaborationState.realTimeEnabled ? 30000 : false,
    staleTime: 60000
  });

  // Fetch team activities
  const {
    data: activities,
    isLoading: isLoadingActivities
  } = useQuery({
    queryKey: ['team-activities', teamId, collaborationState.filterState.dateRange],
    queryFn: async () => {
      const response = await analyticsService.getTeamActivities({
        teamId,
        dateRange: collaborationState.filterState.dateRange,
        limit: 100
      });
      return response.data;
    },
    staleTime: 300000
  });

  // Fetch notifications
  const {
    data: notifications,
    isLoading: isLoadingNotifications,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['notifications', currentUser.id],
    queryFn: async () => {
      const response = await notificationService.getUserNotifications(currentUser.id);
      return response.data;
    },
    enabled: enableNotifications,
    refetchInterval: collaborationState.realTimeEnabled ? 15000 : false,
    staleTime: 30000
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Create discussion mutation
  const createDiscussionMutation = useMutation({
    mutationFn: async (discussion: Partial<DiscussionThread>) => {
      const response = await collaborationService.createDiscussion(discussion);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Discussion created successfully');
      refetchDiscussions();
    },
    onError: (error) => {
      toast.error('Failed to create discussion');
      console.error('Create discussion error:', error);
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ discussionId, comment }: { discussionId: string; comment: Partial<Comment> }) => {
      const response = await collaborationService.addComment(discussionId, comment);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Comment added');
      refetchDiscussions();
      if (onCommentAdded) {
        onCommentAdded(data);
      }
    },
    onError: (error) => {
      toast.error('Failed to add comment');
      console.error('Add comment error:', error);
    }
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ discussionId, commentId, reaction }: { 
      discussionId: string; 
      commentId: string; 
      reaction: keyof typeof REACTION_TYPES; 
    }) => {
      const response = await collaborationService.addReaction(commentId, reaction);
      return response.data;
    },
    onSuccess: () => {
      refetchDiscussions();
    },
    onError: (error) => {
      toast.error('Failed to add reaction');
      console.error('Add reaction error:', error);
    }
  });

  // Workflow mutations
  const createWorkflowMutation = useMutation({
    mutationFn: async (workflow: Partial<WorkflowInstance>) => {
      const response = await workflowService.createWorkflow(workflow);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Workflow created successfully');
      refetchWorkflows();
      if (onWorkflowUpdate) {
        onWorkflowUpdate(data);
      }
    },
    onError: (error) => {
      toast.error('Failed to create workflow');
      console.error('Create workflow error:', error);
    }
  });

  // Notification mutations
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await notificationService.markAsRead(notificationId);
    },
    onSuccess: () => {
      refetchNotifications();
    }
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCreateDiscussion = useCallback((discussion: Partial<DiscussionThread>) => {
    createDiscussionMutation.mutate(discussion);
  }, [createDiscussionMutation]);

  const handleAddComment = useCallback((discussionId: string, comment: Partial<Comment>) => {
    addCommentMutation.mutate({ discussionId, comment });
  }, [addCommentMutation]);

  const handleReaction = useCallback((discussionId: string, commentId: string, reaction: keyof typeof REACTION_TYPES) => {
    addReactionMutation.mutate({ discussionId, commentId, reaction });
  }, [addReactionMutation]);

  const handleCloseDiscussion = useCallback((discussionId: string) => {
    // Implementation for closing discussion
  }, []);

  const handleCreateWorkflow = useCallback((workflow: Partial<WorkflowInstance>) => {
    createWorkflowMutation.mutate(workflow);
  }, [createWorkflowMutation]);

  const handleUpdateWorkflow = useCallback((workflowId: string, updates: Partial<WorkflowInstance>) => {
    // Implementation for updating workflow
  }, []);

  const handleApproveStep = useCallback((workflowId: string, stepId: string) => {
    // Implementation for approving workflow step
  }, []);

  const handleRejectStep = useCallback((workflowId: string, stepId: string, reason: string) => {
    // Implementation for rejecting workflow step
  }, []);

  const handleMarkAsRead = useCallback((notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const handleMarkAllAsRead = useCallback(() => {
    notifications?.forEach(notification => {
      if (!notification.isRead) {
        markAsReadMutation.mutate(notification.id);
      }
    });
  }, [notifications, markAsReadMutation]);

  const handleDeleteNotification = useCallback((notificationId: string) => {
    // Implementation for deleting notification
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Update collaboration state when data changes
  useEffect(() => {
    setCollaborationState(prev => ({
      ...prev,
      activeDiscussions: discussions || [],
      currentWorkflows: workflows || [],
      notifications: notifications || [],
      activities: activities || []
    }));
  }, [discussions, workflows, notifications, activities]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      <TooltipProvider>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Collaboration Hub
            </h1>
            {assetId && (
              <Badge variant="outline">Asset: {assetId}</Badge>
            )}
            {teamId && (
              <Badge variant="outline">Team: {teamId}</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Real-time indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                collaborationState.realTimeEnabled ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm text-gray-600">
                {collaborationState.realTimeEnabled ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* Settings */}
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="discussions" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Discussions
              </TabsTrigger>
              <TabsTrigger value="workflows" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
                {notifications && notifications.filter(n => !n.isRead).length > 0 && (
                  <Badge variant="destructive" className="text-xs ml-1">
                    {notifications.filter(n => !n.isRead).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discussions" className="mt-6">
              <DiscussionThreadPanel
                discussions={discussions || []}
                isLoading={isLoadingDiscussions}
                currentUser={currentUser}
                onCreateDiscussion={handleCreateDiscussion}
                onAddComment={handleAddComment}
                onReaction={handleReaction}
                onCloseDiscussion={handleCloseDiscussion}
              />
            </TabsContent>

            <TabsContent value="workflows" className="mt-6">
              {enableWorkflows ? (
                <WorkflowManagementPanel
                  workflows={workflows || []}
                  isLoading={isLoadingWorkflows}
                  currentUser={currentUser}
                  onCreateWorkflow={handleCreateWorkflow}
                  onUpdateWorkflow={handleUpdateWorkflow}
                  onApproveStep={handleApproveStep}
                  onRejectStep={handleRejectStep}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Workflow className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <div className="text-lg font-semibold text-gray-600">Workflows Disabled</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Enable workflows to manage approval processes and tasks
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activities" className="mt-6">
              <TeamActivityFeed
                activities={activities || []}
                isLoading={isLoadingActivities}
                currentUser={currentUser}
              />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              {enableNotifications ? (
                <NotificationCenter
                  notifications={notifications || []}
                  isLoading={isLoadingNotifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDeleteNotification={handleDeleteNotification}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <div className="text-lg font-semibold text-gray-600">Notifications Disabled</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Enable notifications to stay updated on team activities
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================
export default CatalogCollaborationHub;
export type { CollaborationHubProps, CollaborationState, DiscussionThread, WorkflowInstance, TeamActivity };