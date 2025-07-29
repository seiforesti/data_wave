// ============================================================================
// CATALOG COLLABORATION HUB - TEAM COLLABORATION COMPONENT (2200+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Team Collaboration Hub Component
// Real-time collaboration, team messaging, shared annotations, workflow management,
// asset discussions, approval workflows, and collaborative data governance
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle, Search, Filter, Download, Upload, Share2, Settings, Info, Eye, EyeOff, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Move, Maximize2, Minimize2, Clock, Users, MessageSquare, Bookmark, Star, Edit3, Save, X, Plus, Minus, RefreshCw, Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle, Activity, Database, FileText, Code, BarChart3, PieChart, LineChart, Layers, Network, TreePine, Workflow, Route, MapPin, Calendar as CalendarIcon, Timer, UserCheck, Flag, Hash, Link, Globe, Shield, Lock, Unlock, Key, Award, Zap, Sparkles, Brain, Cpu, HardDrive, Cloud, Server, Wifi, Radio, Bluetooth, Cable, Usb, Monitor, Smartphone, Tablet, Laptop, Watch, Gamepad2, Headphones, Camera, Mic, Speaker, Volume2, VolumeX, MoreHorizontal, MoreVertical, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUp, ChevronsDown, Home, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Send, Reply, ThumbsUp, ThumbsDown, AtSign, Bell, BellOff, Archive, Trash2, Forward, Copy, Pin, PinOff, GitBranch, GitCommit, GitMerge, Calendar as CalIcon, CheckSquare, Square, Heart, MessageCircle, Repeat, ExternalLink, Paperclip, Image, Video, Smile, Folder, FolderOpen, Tag, TagIcon } from 'lucide-react';

// Import types and services
import type {
  CollaborationWorkspace,
  TeamMember,
  Discussion,
  Comment,
  Annotation,
  ApprovalWorkflow,
  WorkflowStep,
  CollaborationEvent,
  Notification,
  AssetReview,
  TeamRole,
  Permission,
  CollaborationMetrics,
  ActivityFeed,
  MentionUser,
  FileAttachment,
  CollaborationSettings,
  ChatMessage,
  ChannelInfo,
  ThreadInfo
} from '../../types/catalog-collaboration.types';

import {
  enterpriseCatalogService,
  collaborationService,
  teamManagementService,
  workflowService,
  notificationService,
  activityService,
  discussionService,
  annotationService,
  approvalService,
  messagingService
} from '../../services/enterprise-catalog.service';

import {
  COLLABORATION_ROLES,
  PERMISSIONS,
  WORKFLOW_TYPES,
  APPROVAL_STATUS,
  NOTIFICATION_TYPES,
  ACTIVITY_TYPES,
  DISCUSSION_TYPES,
  COMMENT_TYPES,
  MENTION_TYPES,
  COLLABORATION_SETTINGS
} from '../../constants/catalog-collaboration.constants';

import {
  useCollaboration,
  useTeamMembers,
  useDiscussions,
  useAnnotations,
  useWorkflows,
  useNotifications,
  useActivityFeed,
  useMessaging,
  useAssetReviews,
  useCollaborationMetrics,
  useApprovals,
  usePermissions
} from '../../hooks/useAdvancedCollaboration';

// ============================================================================
// TEAM ACTIVITY FEED COMPONENT
// ============================================================================
interface TeamActivityFeedProps {
  activities: ActivityFeed[];
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  className?: string;
}

const TeamActivityFeed: React.FC<TeamActivityFeedProps> = ({
  activities,
  isLoading,
  onLoadMore,
  hasMore,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredActivities = useMemo(() => {
    if (selectedFilter === 'all') return activities;
    return activities.filter(activity => activity.type === selectedFilter);
  }, [activities, selectedFilter]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'asset_created': return Plus;
      case 'asset_updated': return Edit3;
      case 'comment_added': return MessageCircle;
      case 'annotation_added': return MessageSquare;
      case 'approval_requested': return CheckCircle;
      case 'workflow_started': return Workflow;
      case 'team_member_added': return UserCheck;
      case 'discussion_started': return MessageSquare;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'asset_created': return 'text-green-600';
      case 'asset_updated': return 'text-blue-600';
      case 'comment_added': return 'text-purple-600';
      case 'annotation_added': return 'text-orange-600';
      case 'approval_requested': return 'text-yellow-600';
      case 'workflow_started': return 'text-indigo-600';
      case 'team_member_added': return 'text-cyan-600';
      case 'discussion_started': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Team Activity</CardTitle>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activity</SelectItem>
              {ACTIVITY_TYPES.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80" ref={containerRef}>
          <div className="space-y-3">
            {filteredActivities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className={`p-1.5 rounded-full bg-background border ${getActivityColor(activity.type)}`}>
                    <ActivityIcon className="h-3 w-3" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {activity.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{activity.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      {activity.description}
                    </p>
                    
                    {activity.assetName && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Database className="h-3 w-3" />
                        <span>{activity.assetName}</span>
                      </div>
                    )}
                  </div>
                  
                  {activity.metadata?.hasAttachment && (
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                  )}
                </motion.div>
              );
            })}
            
            {hasMore && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3 mr-2" />
                  )}
                  Load More
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// REAL-TIME CHAT COMPONENT
// ============================================================================
interface RealTimeChatProps {
  channelId: string;
  messages: ChatMessage[];
  currentUser: TeamMember;
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  onReplyToMessage: (messageId: string, content: string) => void;
  isLoading: boolean;
  className?: string;
}

const RealTimeChat: React.FC<RealTimeChatProps> = ({
  channelId,
  messages,
  currentUser,
  onSendMessage,
  onReplyToMessage,
  isLoading,
  className
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    if (replyingTo) {
      onReplyToMessage(replyingTo, newMessage);
      setReplyingTo(null);
    } else {
      onSendMessage(newMessage);
    }
    
    setNewMessage('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const time = new Date(timestamp);
    const now = new Date();
    const isToday = time.toDateString() === now.toDateString();
    
    if (isToday) {
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return time.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const groupedMessages = useMemo(() => {
    const groups: ChatMessage[][] = [];
    let currentGroup: ChatMessage[] = [];
    
    messages.forEach((message, index) => {
      const prevMessage = messages[index - 1];
      const timeDiff = prevMessage 
        ? new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()
        : 0;
      
      if (!prevMessage || 
          prevMessage.user.id !== message.user.id || 
          timeDiff > 5 * 60 * 1000) { // 5 minutes
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  }, [messages]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Team Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Messages Area */}
        <ScrollArea className="h-80 px-4">
          <div className="space-y-4 py-4">
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-1">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={group[0].user.avatar} />
                    <AvatarFallback className="text-sm">
                      {group[0].user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{group[0].user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(group[0].timestamp)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {group.map((message) => (
                        <div
                          key={message.id}
                          className="group relative p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
                        >
                          {message.replyTo && (
                            <div className="text-xs text-muted-foreground mb-1 pl-2 border-l-2 border-muted">
                              Replying to: {message.replyTo.content.substring(0, 50)}...
                            </div>
                          )}
                          
                          <p className="text-sm">{message.content}</p>
                          
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.attachments.map((attachment, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  <Paperclip className="h-3 w-3 mr-1" />
                                  {attachment.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setReplyingTo(message.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Reply className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Message Input */}
        <div className="p-4 border-t">
          {replyingTo && (
            <div className="flex items-center justify-between p-2 mb-2 bg-muted rounded text-sm">
              <span>Replying to message</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplyingTo(null)}
                className="h-5 w-5 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[40px] max-h-32 resize-none pr-20"
                rows={1}
              />
              
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                >
                  <Paperclip className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowEmoji(!showEmoji)}
                >
                  <Smile className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// DISCUSSION THREADS COMPONENT
// ============================================================================
interface DiscussionThreadsProps {
  discussions: Discussion[];
  selectedDiscussion: string | null;
  onSelectDiscussion: (discussionId: string) => void;
  onCreateDiscussion: (discussion: Omit<Discussion, 'id' | 'createdAt'>) => void;
  onAddComment: (discussionId: string, comment: string) => void;
  isLoading: boolean;
  className?: string;
}

const DiscussionThreads: React.FC<DiscussionThreadsProps> = ({
  discussions,
  selectedDiscussion,
  onSelectDiscussion,
  onCreateDiscussion,
  onAddComment,
  isLoading,
  className
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    description: '',
    type: 'general',
    assetId: '',
    tags: [] as string[]
  });
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDiscussions = useMemo(() => {
    if (!searchQuery) return discussions;
    return discussions.filter(discussion =>
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [discussions, searchQuery]);

  const selectedDiscussionData = useMemo(() => {
    return discussions.find(d => d.id === selectedDiscussion);
  }, [discussions, selectedDiscussion]);

  const handleCreateDiscussion = () => {
    if (!newDiscussion.title.trim()) return;
    
    onCreateDiscussion({
      title: newDiscussion.title,
      description: newDiscussion.description,
      type: newDiscussion.type,
      assetId: newDiscussion.assetId,
      tags: newDiscussion.tags,
      status: 'active',
      priority: 'medium'
    });
    
    setNewDiscussion({
      title: '',
      description: '',
      type: 'general',
      assetId: '',
      tags: []
    });
    setShowCreateDialog(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedDiscussion) return;
    
    onAddComment(selectedDiscussion, newComment);
    setNewComment('');
  };

  const getDiscussionTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return MessageCircle;
      case 'issue': return AlertTriangle;
      case 'proposal': return Lightbulb;
      case 'review': return Eye;
      default: return MessageSquare;
    }
  };

  const getDiscussionTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'text-blue-600';
      case 'issue': return 'text-red-600';
      case 'proposal': return 'text-green-600';
      case 'review': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${className}`}>
      {/* Discussions List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Discussions</CardTitle>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-3 w-3 mr-2" />
              New
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="space-y-1 p-4">
              {filteredDiscussions.map((discussion) => {
                const TypeIcon = getDiscussionTypeIcon(discussion.type);
                
                return (
                  <motion.div
                    key={discussion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedDiscussion === discussion.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => onSelectDiscussion(discussion.id)}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <TypeIcon className={`h-4 w-4 mt-0.5 ${getDiscussionTypeColor(discussion.type)}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{discussion.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {discussion.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Badge variant={getPriorityColor(discussion.priority)} className="text-xs">
                          {discussion.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {discussion.comments?.length || 0} replies
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={discussion.author.avatar} />
                          <AvatarFallback className="text-xs">
                            {discussion.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {new Date(discussion.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Discussion Detail */}
      <Card className="lg:col-span-2">
        {selectedDiscussionData ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {(() => {
                      const TypeIcon = getDiscussionTypeIcon(selectedDiscussionData.type);
                      return <TypeIcon className={`h-4 w-4 ${getDiscussionTypeColor(selectedDiscussionData.type)}`} />;
                    })()}
                    {selectedDiscussionData.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedDiscussionData.description}
                  </CardDescription>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin Discussion
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getPriorityColor(selectedDiscussionData.priority)} className="text-xs">
                  {selectedDiscussionData.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedDiscussionData.type}
                </Badge>
                {selectedDiscussionData.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Comments */}
              <ScrollArea className="h-64 mb-4">
                <div className="space-y-3">
                  {selectedDiscussionData.comments?.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {comment.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Add Comment */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 min-h-[60px]"
                />
                <Button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a discussion to view details</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Create Discussion Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Discussion</DialogTitle>
            <DialogDescription>
              Start a new discussion thread with your team
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Discussion title"
                value={newDiscussion.title}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What would you like to discuss?"
                value={newDiscussion.description}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newDiscussion.type}
                  onValueChange={(value) => setNewDiscussion(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCUSSION_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Asset (Optional)</Label>
                <Input
                  placeholder="Asset ID"
                  value={newDiscussion.assetId}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, assetId: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDiscussion} disabled={!newDiscussion.title.trim()}>
              Create Discussion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================================================
// APPROVAL WORKFLOWS COMPONENT
// ============================================================================
interface ApprovalWorkflowsProps {
  workflows: ApprovalWorkflow[];
  onCreateWorkflow: (workflow: Omit<ApprovalWorkflow, 'id' | 'createdAt'>) => void;
  onUpdateWorkflow: (id: string, updates: Partial<ApprovalWorkflow>) => void;
  onApprove: (workflowId: string, stepId: string, comments?: string) => void;
  onReject: (workflowId: string, stepId: string, reason: string) => void;
  currentUser: TeamMember;
  isLoading: boolean;
  className?: string;
}

const ApprovalWorkflows: React.FC<ApprovalWorkflowsProps> = ({
  workflows,
  onCreateWorkflow,
  onUpdateWorkflow,
  onApprove,
  onReject,
  currentUser,
  isLoading,
  className
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filteredWorkflows = useMemo(() => {
    if (filterStatus === 'all') return workflows;
    return workflows.filter(workflow => workflow.status === filterStatus);
  }, [workflows, filterStatus]);

  const selectedWorkflowData = useMemo(() => {
    return workflows.find(w => w.id === selectedWorkflow);
  }, [workflows, selectedWorkflow]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      case 'in_progress': return 'secondary';
      default: return 'outline';
    }
  };

  const getStepStatus = (step: WorkflowStep) => {
    if (step.completedAt) {
      return step.approved ? 'approved' : 'rejected';
    }
    return 'pending';
  };

  const canUserApprove = (step: WorkflowStep) => {
    return step.assignee.id === currentUser.id && !step.completedAt;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Approval Workflows</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-3 w-3 mr-2" />
              New Workflow
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workflows List */}
          <div className="space-y-3">
            <ScrollArea className="h-96">
              {filteredWorkflows.map((workflow) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedWorkflow === workflow.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedWorkflow(workflow.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{workflow.title}</h4>
                      <p className="text-xs text-muted-foreground">{workflow.description}</p>
                    </div>
                    
                    <Badge variant={getStatusColor(workflow.status)} className="text-xs">
                      {workflow.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {workflow.steps.filter(s => s.completedAt).length}/{workflow.steps.length} steps
                      </span>
                      <Progress 
                        value={(workflow.steps.filter(s => s.completedAt).length / workflow.steps.length) * 100}
                        className="w-16 h-1"
                      />
                    </div>
                    
                    <span className="text-xs text-muted-foreground">
                      {new Date(workflow.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </ScrollArea>
          </div>

          {/* Workflow Detail */}
          <div>
            {selectedWorkflowData ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{selectedWorkflowData.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedWorkflowData.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusColor(selectedWorkflowData.status)} className="text-xs">
                      {selectedWorkflowData.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedWorkflowData.type}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                {/* Workflow Steps */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Approval Steps</h4>
                  
                  {selectedWorkflowData.steps.map((step, index) => {
                    const stepStatus = getStepStatus(step);
                    const canApprove = canUserApprove(step);
                    
                    return (
                      <div
                        key={step.id}
                        className={`p-3 rounded-lg border ${
                          stepStatus === 'approved' ? 'bg-green-50 border-green-200' :
                          stepStatus === 'rejected' ? 'bg-red-50 border-red-200' :
                          'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              stepStatus === 'approved' ? 'bg-green-500 text-white' :
                              stepStatus === 'rejected' ? 'bg-red-500 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{step.title}</span>
                                {stepStatus === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                {stepStatus === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={step.assignee.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {step.assignee.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  {step.assignee.name}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {canApprove && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onApprove(selectedWorkflowData.id, step.id)}
                                className="h-6 px-2 text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onReject(selectedWorkflowData.id, step.id, 'Rejected')}
                                className="h-6 px-2 text-xs"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {step.comments && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {step.comments}
                          </p>
                        )}
                        
                        {step.completedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Completed: {new Date(step.completedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <div className="text-center">
                  <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a workflow to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// TEAM MEMBERS MANAGEMENT COMPONENT
// ============================================================================
interface TeamMembersManagementProps {
  members: TeamMember[];
  onInviteMember: (email: string, role: string) => void;
  onUpdateMemberRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string) => void;
  currentUser: TeamMember;
  isLoading: boolean;
  className?: string;
}

const TeamMembersManagement: React.FC<TeamMembersManagementProps> = ({
  members,
  onInviteMember,
  onUpdateMemberRole,
  onRemoveMember,
  currentUser,
  isLoading,
  className
}) => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    return members.filter(member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return;
    
    onInviteMember(inviteEmail, inviteRole);
    setInviteEmail('');
    setInviteRole('member');
    setShowInviteDialog(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'default';
      case 'member': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const canManageMember = (member: TeamMember) => {
    return currentUser.role === 'admin' && member.id !== currentUser.id;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          <Button size="sm" onClick={() => setShowInviteDialog(true)}>
            <Plus className="h-3 w-3 mr-2" />
            Invite Member
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background ${getStatusColor(member.status)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{member.name}</span>
                      {member.id === currentUser.id && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getRoleColor(member.role)} className="text-xs">
                        {member.role}
                      </Badge>
                      <span className={`text-xs ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                {canManageMember(member) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onUpdateMemberRole(member.id, 'admin')}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateMemberRole(member.id, 'member')}>
                        <Users className="h-4 w-4 mr-2" />
                        Make Member
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onRemoveMember(member.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Invite Member Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Invite a new member to join your collaboration workspace
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="member@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLABORATION_ROLES.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.label} - {role.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteMember} disabled={!inviteEmail.trim()}>
                Send Invite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN CATALOG COLLABORATION HUB COMPONENT
// ============================================================================
export interface CatalogCollaborationHubProps {
  workspaceId?: string;
  className?: string;
}

export const CatalogCollaborationHub: React.FC<CatalogCollaborationHubProps> = ({
  workspaceId,
  className
}) => {
  // State management
  const [activeView, setActiveView] = useState('overview');
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);
  const [currentChannel, setCurrentChannel] = useState('general');
  
  // Refs
  const queryClient = useQueryClient();

  // Custom hooks for data management
  const {
    data: workspace,
    isLoading: isWorkspaceLoading
  } = useCollaboration(workspaceId);

  const {
    data: teamMembers,
    isLoading: isMembersLoading,
    mutate: inviteMember,
    updateMemberRole,
    removeMember
  } = useTeamMembers(workspaceId);

  const {
    data: discussions,
    isLoading: isDiscussionsLoading,
    mutate: createDiscussion,
    addComment
  } = useDiscussions(workspaceId);

  const {
    data: workflows,
    isLoading: isWorkflowsLoading,
    mutate: createWorkflow,
    updateWorkflow,
    approve: approveWorkflow,
    reject: rejectWorkflow
  } = useWorkflows(workspaceId);

  const {
    data: activities,
    isLoading: isActivitiesLoading,
    hasNextPage,
    fetchNextPage
  } = useActivityFeed(workspaceId);

  const {
    data: chatMessages,
    isLoading: isMessagesLoading,
    mutate: sendMessage,
    replyToMessage
  } = useMessaging(currentChannel);

  const {
    data: notifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const {
    data: collaborationMetrics,
    isLoading: isMetricsLoading
  } = useCollaborationMetrics(workspaceId);

  // Event handlers
  const handleCreateDiscussion = useCallback((discussion: Omit<Discussion, 'id' | 'createdAt'>) => {
    createDiscussion(discussion, {
      onSuccess: () => {
        toast.success('Discussion created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create discussion');
      }
    });
  }, [createDiscussion]);

  const handleAddComment = useCallback((discussionId: string, comment: string) => {
    addComment({ discussionId, content: comment }, {
      onSuccess: () => {
        toast.success('Comment added');
      },
      onError: (error) => {
        toast.error('Failed to add comment');
      }
    });
  }, [addComment]);

  const handleSendMessage = useCallback((content: string, attachments?: FileAttachment[]) => {
    sendMessage({
      channelId: currentChannel,
      content,
      attachments
    }, {
      onSuccess: () => {
        // Message sent successfully
      },
      onError: (error) => {
        toast.error('Failed to send message');
      }
    });
  }, [sendMessage, currentChannel]);

  const handleReplyToMessage = useCallback((messageId: string, content: string) => {
    replyToMessage({
      messageId,
      content
    }, {
      onSuccess: () => {
        // Reply sent successfully
      },
      onError: (error) => {
        toast.error('Failed to send reply');
      }
    });
  }, [replyToMessage]);

  const handleInviteMember = useCallback((email: string, role: string) => {
    inviteMember({
      email,
      role,
      workspaceId
    }, {
      onSuccess: () => {
        toast.success('Invitation sent successfully');
      },
      onError: (error) => {
        toast.error('Failed to send invitation');
      }
    });
  }, [inviteMember, workspaceId]);

  const handleUpdateMemberRole = useCallback((memberId: string, role: string) => {
    updateMemberRole({ memberId, role }, {
      onSuccess: () => {
        toast.success('Member role updated');
      },
      onError: (error) => {
        toast.error('Failed to update member role');
      }
    });
  }, [updateMemberRole]);

  const handleRemoveMember = useCallback((memberId: string) => {
    removeMember(memberId, {
      onSuccess: () => {
        toast.success('Member removed from workspace');
      },
      onError: (error) => {
        toast.error('Failed to remove member');
      }
    });
  }, [removeMember]);

  const handleCreateWorkflow = useCallback((workflow: Omit<ApprovalWorkflow, 'id' | 'createdAt'>) => {
    createWorkflow(workflow, {
      onSuccess: () => {
        toast.success('Workflow created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create workflow');
      }
    });
  }, [createWorkflow]);

  const handleApproveWorkflow = useCallback((workflowId: string, stepId: string, comments?: string) => {
    approveWorkflow({ workflowId, stepId, comments }, {
      onSuccess: () => {
        toast.success('Step approved');
      },
      onError: (error) => {
        toast.error('Failed to approve step');
      }
    });
  }, [approveWorkflow]);

  const handleRejectWorkflow = useCallback((workflowId: string, stepId: string, reason: string) => {
    rejectWorkflow({ workflowId, stepId, reason }, {
      onSuccess: () => {
        toast.success('Step rejected');
      },
      onError: (error) => {
        toast.error('Failed to reject step');
      }
    });
  }, [rejectWorkflow]);

  const currentUser = useMemo(() => {
    return teamMembers?.find(member => member.isCurrentUser) || {
      id: 'current-user',
      name: 'Current User',
      email: 'user@example.com',
      role: 'member',
      status: 'active',
      isCurrentUser: true
    } as TeamMember;
  }, [teamMembers]);

  // Loading state
  if (isWorkspaceLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading collaboration workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration Hub
          </h1>
          
          {workspace && (
            <Badge variant="outline">
              Workspace: {workspace.name}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Collaboration Metrics */}
      {collaborationMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{collaborationMetrics.totalMembers}</div>
                  <div className="text-xs text-muted-foreground">Team Members</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{collaborationMetrics.activeDiscussions}</div>
                  <div className="text-xs text-muted-foreground">Active Discussions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{collaborationMetrics.pendingApprovals}</div>
                  <div className="text-xs text-muted-foreground">Pending Approvals</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{collaborationMetrics.todayActivity}</div>
                  <div className="text-xs text-muted-foreground">Today's Activity</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {activeView === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RealTimeChat
                channelId={currentChannel}
                messages={chatMessages || []}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onReplyToMessage={handleReplyToMessage}
                isLoading={isMessagesLoading}
              />
              
              <TeamActivityFeed
                activities={activities?.pages.flat() || []}
                isLoading={isActivitiesLoading}
                onLoadMore={() => fetchNextPage()}
                hasMore={!!hasNextPage}
              />
            </div>
          )}

          {activeView === 'discussions' && (
            <DiscussionThreads
              discussions={discussions || []}
              selectedDiscussion={selectedDiscussion}
              onSelectDiscussion={setSelectedDiscussion}
              onCreateDiscussion={handleCreateDiscussion}
              onAddComment={handleAddComment}
              isLoading={isDiscussionsLoading}
            />
          )}

          {activeView === 'workflows' && (
            <ApprovalWorkflows
              workflows={workflows || []}
              onCreateWorkflow={handleCreateWorkflow}
              onUpdateWorkflow={updateWorkflow}
              onApprove={handleApproveWorkflow}
              onReject={handleRejectWorkflow}
              currentUser={currentUser}
              isLoading={isWorkflowsLoading}
            />
          )}

          {activeView === 'team' && (
            <TeamMembersManagement
              members={teamMembers || []}
              onInviteMember={handleInviteMember}
              onUpdateMemberRole={handleUpdateMemberRole}
              onRemoveMember={handleRemoveMember}
              currentUser={currentUser}
              isLoading={isMembersLoading}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Notifications */}
          {notifications && notifications.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAllAsRead()}
                    className="h-6 px-2 text-xs"
                  >
                    Mark all read
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-2 rounded text-sm ${
                          notification.read ? 'bg-muted/50' : 'bg-primary/10'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                size="sm"
                className="w-full justify-start"
                onClick={() => setActiveView('discussions')}
              >
                <MessageSquare className="h-3 w-3 mr-2" />
                Start Discussion
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveView('workflows')}
              >
                <Workflow className="h-3 w-3 mr-2" />
                Create Workflow
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveView('team')}
              >
                <Users className="h-3 w-3 mr-2" />
                Invite Member
              </Button>
            </CardContent>
          </Card>

          {/* Online Members */}
          {teamMembers && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Online Now</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {teamMembers
                    .filter(member => member.status === 'active')
                    .slice(0, 5)
                    .map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <div className="relative">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
                        </div>
                        <span className="text-sm font-medium">{member.name}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogCollaborationHub;