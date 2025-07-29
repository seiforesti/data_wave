'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  MessageSquare,
  Star,
  Edit,
  Tag,
  Share2,
  Clock,
  User,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  Plus,
  Search,
  Filter,
  Bell,
  Settings,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Bookmark,
  Flag,
  Database,
  GitBranch,
  Activity,
  Calendar,
  Send,
  Paperclip,
  Image,
  Hash,
  AtSign,
  Smile,
  Heart,
  Target,
  TrendingUp,
  Award,
  Zap,
  Brain,
  Lightbulb,
  Coffee,
  Video,
  Phone,
  Mail,
  Link,
  Archive,
  Download,
  Upload
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// Import hooks
import { useCatalogCollaboration } from '../../hooks/useCatalogCollaboration';

// Import types
import type {
  CollaborationThread,
  AssetAnnotation,
  CollaborationMetrics,
  TeamMember,
  ReviewWorkflow,
  KnowledgeArticle,
  CollaborationActivity,
  UserContext,
  CatalogAsset
} from '../../types';

interface CollaborationViewState {
  activeTab: 'discussions' | 'annotations' | 'reviews' | 'knowledge' | 'activity';
  selectedAsset: CatalogAsset | null;
  selectedThread: CollaborationThread | null;
  filterByUser: string | null;
  filterByAsset: string | null;
  filterByType: string | null;
  showOnlyUnread: boolean;
  searchQuery: string;
  sortBy: 'date' | 'priority' | 'activity';
  sortOrder: 'asc' | 'desc';
}

interface DiscussionThread {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  participantCount: number;
  isResolved: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  lastMessage: {
    content: string;
    authorName: string;
    timestamp: Date;
  };
  isUnread: boolean;
  isPinned: boolean;
  reactions: {
    emoji: string;
    count: number;
    userReacted: boolean;
  }[];
}

interface Message {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
  attachments: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  mentions: string[];
  reactions: {
    emoji: string;
    count: number;
    users: string[];
  }[];
  replies: Message[];
  isReply: boolean;
  parentMessageId?: string;
}

interface Annotation {
  id: string;
  assetId: string;
  assetName: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  type: 'comment' | 'question' | 'suggestion' | 'issue' | 'documentation';
  location: {
    field?: string;
    line?: number;
    column?: number;
    context?: string;
  };
  timestamp: Date;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  tags: string[];
  visibility: 'public' | 'team' | 'private';
  votes: {
    upvotes: number;
    downvotes: number;
    userVote?: 'up' | 'down';
  };
}

export const CatalogCollaborationHub: React.FC = () => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  const [viewState, setViewState] = useState<CollaborationViewState>({
    activeTab: 'discussions',
    selectedAsset: null,
    selectedThread: null,
    filterByUser: null,
    filterByAsset: null,
    filterByType: null,
    showOnlyUnread: false,
    searchQuery: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newAnnotation, setNewAnnotation] = useState('');
  const [showNewThreadDialog, setShowNewThreadDialog] = useState(false);
  const [showNewAnnotationDialog, setShowNewAnnotationDialog] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Mock data - in real implementation, this would come from hooks
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([
    {
      id: '1',
      title: 'Data quality issues in customer_profiles table',
      assetId: 'asset_1',
      assetName: 'customer_profiles',
      authorId: 'user_1',
      authorName: 'John Doe',
      authorAvatar: '/avatars/john.png',
      createdAt: new Date('2024-01-15T10:30:00'),
      updatedAt: new Date('2024-01-15T14:45:00'),
      messageCount: 8,
      participantCount: 4,
      isResolved: false,
      priority: 'high',
      tags: ['data-quality', 'customer-data'],
      lastMessage: {
        content: 'I think we should add validation rules for the email field',
        authorName: 'Jane Smith',
        timestamp: new Date('2024-01-15T14:45:00')
      },
      isUnread: true,
      isPinned: true,
      reactions: [
        { emoji: '👍', count: 3, userReacted: false },
        { emoji: '🔥', count: 1, userReacted: true }
      ]
    },
    // More mock discussions...
  ]);

  const [annotations, setAnnotations] = useState<Annotation[]>([
    {
      id: '1',
      assetId: 'asset_1',
      assetName: 'customer_profiles',
      authorId: 'user_2',
      authorName: 'Jane Smith',
      authorAvatar: '/avatars/jane.png',
      content: 'This field should have better documentation about the data format',
      type: 'documentation',
      location: {
        field: 'email_address',
        context: 'customer_profiles.email_address'
      },
      timestamp: new Date('2024-01-15T09:15:00'),
      isResolved: false,
      tags: ['documentation', 'email'],
      visibility: 'public',
      votes: {
        upvotes: 5,
        downvotes: 0,
        userVote: 'up'
      }
    },
    // More mock annotations...
  ]);

  // =============================================================================
  // HOOKS INTEGRATION
  // =============================================================================
  
  const {
    collaborationData,
    isLoadingCollaboration,
    getCollaborationMetrics,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    createDiscussionThread,
    addMessageToThread,
    getTeamActivity,
    getKnowledgeBase,
    createKnowledgeArticle
  } = useCatalogCollaboration();

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================
  
  const filteredDiscussions = useMemo(() => {
    let filtered = discussions;
    
    if (viewState.searchQuery) {
      filtered = filtered.filter(thread =>
        thread.title.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        thread.assetName.toLowerCase().includes(viewState.searchQuery.toLowerCase())
      );
    }
    
    if (viewState.filterByUser) {
      filtered = filtered.filter(thread => thread.authorId === viewState.filterByUser);
    }
    
    if (viewState.filterByAsset) {
      filtered = filtered.filter(thread => thread.assetId === viewState.filterByAsset);
    }
    
    if (viewState.showOnlyUnread) {
      filtered = filtered.filter(thread => thread.isUnread);
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = viewState.sortBy === 'date' ? a.updatedAt.getTime() : 
                   viewState.sortBy === 'priority' ? getPriorityScore(a.priority) : 
                   a.messageCount;
      const bVal = viewState.sortBy === 'date' ? b.updatedAt.getTime() : 
                   viewState.sortBy === 'priority' ? getPriorityScore(b.priority) : 
                   b.messageCount;
      
      return viewState.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
    
    return filtered;
  }, [discussions, viewState]);

  const filteredAnnotations = useMemo(() => {
    let filtered = annotations;
    
    if (viewState.searchQuery) {
      filtered = filtered.filter(annotation =>
        annotation.content.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        annotation.assetName.toLowerCase().includes(viewState.searchQuery.toLowerCase())
      );
    }
    
    if (viewState.filterByUser) {
      filtered = filtered.filter(annotation => annotation.authorId === viewState.filterByUser);
    }
    
    if (viewState.filterByAsset) {
      filtered = filtered.filter(annotation => annotation.assetId === viewState.filterByAsset);
    }
    
    if (viewState.filterByType) {
      filtered = filtered.filter(annotation => annotation.type === viewState.filterByType);
    }
    
    return filtered;
  }, [annotations, viewState]);

  const getPriorityScore = (priority: string): number => {
    const scores = { low: 1, medium: 2, high: 3, urgent: 4 };
    return scores[priority as keyof typeof scores] || 0;
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600', 
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      comment: MessageSquare,
      question: Info,
      suggestion: Lightbulb,
      issue: AlertTriangle,
      documentation: FileText
    };
    return icons[type as keyof typeof icons] || MessageSquare;
  };

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  
  const handleCreateThread = useCallback(async () => {
    if (!newThreadTitle.trim()) return;
    
    try {
      const newThread: DiscussionThread = {
        id: `thread_${Date.now()}`,
        title: newThreadTitle,
        assetId: viewState.selectedAsset?.id || '',
        assetName: viewState.selectedAsset?.name || '',
        authorId: 'current_user',
        authorName: 'Current User',
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 0,
        participantCount: 1,
        isResolved: false,
        priority: 'medium',
        tags: [],
        lastMessage: {
          content: '',
          authorName: 'Current User',
          timestamp: new Date()
        },
        isUnread: false,
        isPinned: false,
        reactions: []
      };
      
      setDiscussions(prev => [newThread, ...prev]);
      setNewThreadTitle('');
      setShowNewThreadDialog(false);
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  }, [newThreadTitle, viewState.selectedAsset]);

  const handleCreateAnnotation = useCallback(async () => {
    if (!newAnnotation.trim()) return;
    
    try {
      const annotation: Annotation = {
        id: `annotation_${Date.now()}`,
        assetId: viewState.selectedAsset?.id || '',
        assetName: viewState.selectedAsset?.name || '',
        authorId: 'current_user',
        authorName: 'Current User',
        content: newAnnotation,
        type: 'comment',
        location: {},
        timestamp: new Date(),
        isResolved: false,
        tags: [],
        visibility: 'public',
        votes: {
          upvotes: 0,
          downvotes: 0
        }
      };
      
      setAnnotations(prev => [annotation, ...prev]);
      setNewAnnotation('');
      setShowNewAnnotationDialog(false);
    } catch (error) {
      console.error('Failed to create annotation:', error);
    }
  }, [newAnnotation, viewState.selectedAsset]);

  const handleThreadSelect = useCallback((thread: DiscussionThread) => {
    setViewState(prev => ({ ...prev, selectedThread: thread }));
  }, []);

  const handleReaction = useCallback((threadId: string, emoji: string) => {
    setDiscussions(prev => prev.map(thread => {
      if (thread.id === threadId) {
        const existingReaction = thread.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          return {
            ...thread,
            reactions: thread.reactions.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.userReacted ? r.count - 1 : r.count + 1, userReacted: !r.userReacted }
                : r
            )
          };
        } else {
          return {
            ...thread,
            reactions: [...thread.reactions, { emoji, count: 1, userReacted: true }]
          };
        }
      }
      return thread;
    }));
  }, []);

  const handleVote = useCallback((annotationId: string, voteType: 'up' | 'down') => {
    setAnnotations(prev => prev.map(annotation => {
      if (annotation.id === annotationId) {
        const currentVote = annotation.votes.userVote;
        let newUpvotes = annotation.votes.upvotes;
        let newDownvotes = annotation.votes.downvotes;
        let newUserVote: 'up' | 'down' | undefined = voteType;
        
        // Remove previous vote if exists
        if (currentVote === 'up') newUpvotes--;
        if (currentVote === 'down') newDownvotes--;
        
        // Add new vote or remove if same
        if (currentVote === voteType) {
          newUserVote = undefined;
        } else {
          if (voteType === 'up') newUpvotes++;
          if (voteType === 'down') newDownvotes++;
        }
        
        return {
          ...annotation,
          votes: {
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: newUserVote
          }
        };
      }
      return annotation;
    }));
  }, []);

  // =============================================================================
  // COMPONENT RENDERS
  // =============================================================================
  
  const DiscussionsList = () => (
    <div className="space-y-4">
      {filteredDiscussions.map((thread) => (
        <Card 
          key={thread.id} 
          className={`cursor-pointer hover:shadow-md transition-shadow ${
            thread.isUnread ? 'border-l-4 border-l-blue-500' : ''
          } ${viewState.selectedThread?.id === thread.id ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleThreadSelect(thread)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={thread.authorAvatar} />
                  <AvatarFallback>{thread.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold">{thread.title}</h4>
                    {thread.isPinned && <Pin className="h-4 w-4 text-orange-500" />}
                    <Badge variant={thread.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-xs">
                      {thread.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    in <span className="font-medium">{thread.assetName}</span> • by {thread.authorName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(thread.updatedAt, { addSuffix: true })}
                </p>
                {thread.isUnread && (
                  <Badge variant="default" className="text-xs mt-1">New</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                {thread.messageCount}
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {thread.participantCount}
              </span>
              {thread.isResolved && (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolved
                </span>
              )}
            </div>
            
            {thread.lastMessage.content && (
              <div className="mt-3 p-2 bg-muted/50 rounded">
                <p className="text-sm">{thread.lastMessage.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {thread.lastMessage.authorName} • {formatDistanceToNow(thread.lastMessage.timestamp, { addSuffix: true })}
                </p>
              </div>
            )}
            
            {thread.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {thread.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {thread.reactions.length > 0 && (
              <div className="flex items-center space-x-2 mt-3">
                {thread.reactions.map(reaction => (
                  <Button
                    key={reaction.emoji}
                    variant="ghost"
                    size="sm"
                    className={`h-6 px-2 ${reaction.userReacted ? 'bg-blue-100' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReaction(thread.id, reaction.emoji);
                    }}
                  >
                    <span className="mr-1">{reaction.emoji}</span>
                    <span className="text-xs">{reaction.count}</span>
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmojiPicker(thread.id);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const AnnotationsList = () => (
    <div className="space-y-4">
      {filteredAnnotations.map((annotation) => {
        const TypeIcon = getTypeIcon(annotation.type);
        return (
          <Card key={annotation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    annotation.type === 'issue' ? 'bg-red-100 text-red-600' :
                    annotation.type === 'suggestion' ? 'bg-yellow-100 text-yellow-600' :
                    annotation.type === 'question' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <TypeIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {annotation.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        on <span className="font-medium">{annotation.assetName}</span>
                      </span>
                      {annotation.location.field && (
                        <Badge variant="secondary" className="text-xs">
                          {annotation.location.field}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{annotation.content}</p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={annotation.authorAvatar} />
                        <AvatarFallback>{annotation.authorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{annotation.authorName}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(annotation.timestamp, { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {annotation.isResolved ? (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolved
                    </Badge>
                  ) : (
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 ${annotation.votes.userVote === 'up' ? 'bg-green-100 text-green-700' : ''}`}
                    onClick={() => handleVote(annotation.id, 'up')}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {annotation.votes.upvotes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 ${annotation.votes.userVote === 'down' ? 'bg-red-100 text-red-700' : ''}`}
                    onClick={() => handleVote(annotation.id, 'down')}
                  >
                    <ThumbsDown className="h-3 w-3 mr-1" />
                    {annotation.votes.downvotes}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                </div>
                
                {annotation.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {annotation.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {annotation.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{annotation.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const ThreadDetail = () => {
    if (!viewState.selectedThread) {
      return (
        <Card className="h-full flex items-center justify-center">
          <CardContent className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Discussion</h3>
            <p className="text-muted-foreground">
              Choose a discussion thread to view messages and participate
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>{viewState.selectedThread.title}</span>
                {viewState.selectedThread.isPinned && (
                  <Pin className="h-4 w-4 text-orange-500" />
                )}
              </CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <Database className="h-4 w-4" />
                <span>{viewState.selectedThread.assetName}</span>
                <Separator orientation="vertical" className="h-4" />
                <span>{viewState.selectedThread.participantCount} participants</span>
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={viewState.selectedThread.priority === 'urgent' ? 'destructive' : 'secondary'}>
                {viewState.selectedThread.priority}
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {/* Mock messages */}
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">John Doe</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm">
                        This is a sample message in the discussion thread. We should look into the data quality issues mentioned.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        
        <div className="p-4 border-t">
          <div className="flex items-end space-x-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 min-h-[60px] resize-none"
            />
            <div className="flex flex-col space-y-2">
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button size="sm" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Collaboration Hub</h2>
            <p className="text-muted-foreground">
              Collaborate with your team on data assets and share knowledge
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewAnnotationDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Annotation
            </Button>
            <Button
              size="sm"
              onClick={() => setShowNewThreadDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Start Discussion
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search discussions, annotations, or assets..."
                    value={viewState.searchQuery}
                    onChange={(e) => setViewState(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={viewState.sortBy}
                  onValueChange={(value) => setViewState(prev => ({ ...prev, sortBy: value as any }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewState(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                >
                  {viewState.sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={viewState.showOnlyUnread}
                    onCheckedChange={(checked) => 
                      setViewState(prev => ({ ...prev, showOnlyUnread: !!checked }))
                    }
                  />
                  <Label className="text-sm">Show only unread</Label>
                </div>
                <Select
                  value={viewState.filterByType || ''}
                  onValueChange={(value) => setViewState(prev => ({ ...prev, filterByType: value || null }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="comment">Comments</SelectItem>
                    <SelectItem value="question">Questions</SelectItem>
                    <SelectItem value="suggestion">Suggestions</SelectItem>
                    <SelectItem value="issue">Issues</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={viewState.activeTab} onValueChange={(value) => setViewState(prev => ({ ...prev, activeTab: value as any }))}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="discussions">
              <MessageSquare className="h-4 w-4 mr-2" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="annotations">
              <Edit className="h-4 w-4 mr-2" />
              Annotations
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <CheckCircle className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <FileText className="h-4 w-4 mr-2" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Discussions</h3>
                  <Badge variant="secondary">{filteredDiscussions.length}</Badge>
                </div>
                <ScrollArea className="h-[600px]">
                  <DiscussionsList />
                </ScrollArea>
              </div>
              <div>
                <ThreadDetail />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="annotations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Asset Annotations</h3>
              <Badge variant="secondary">{filteredAnnotations.length}</Badge>
            </div>
            <ScrollArea className="h-[600px]">
              <AnnotationsList />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Workflows</CardTitle>
                <CardDescription>Manage asset review and approval processes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Review workflows will be implemented here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>Shared knowledge articles and documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Knowledge base will be implemented here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Activity</CardTitle>
                <CardDescription>Recent collaboration activities across the catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Activity feed will be implemented here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Thread Dialog */}
        <Dialog open={showNewThreadDialog} onOpenChange={setShowNewThreadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Discussion</DialogTitle>
              <DialogDescription>
                Create a new discussion thread about a data asset
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="thread-title">Discussion Title</Label>
                <Input
                  id="thread-title"
                  placeholder="What do you want to discuss?"
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="asset-select">Related Asset</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset1">customer_profiles</SelectItem>
                    <SelectItem value="asset2">order_history</SelectItem>
                    <SelectItem value="asset3">product_catalog</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewThreadDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateThread} disabled={!newThreadTitle.trim()}>
                  Start Discussion
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Annotation Dialog */}
        <Dialog open={showNewAnnotationDialog} onOpenChange={setShowNewAnnotationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Annotation</DialogTitle>
              <DialogDescription>
                Add a comment, question, or suggestion to a data asset
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="annotation-content">Annotation</Label>
                <Textarea
                  id="annotation-content"
                  placeholder="What would you like to add?"
                  value={newAnnotation}
                  onChange={(e) => setNewAnnotation(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="annotation-type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select annotation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="issue">Issue</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="asset-select">Asset</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset1">customer_profiles</SelectItem>
                    <SelectItem value="asset2">order_history</SelectItem>
                    <SelectItem value="asset3">product_catalog</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewAnnotationDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAnnotation} disabled={!newAnnotation.trim()}>
                  Add Annotation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default CatalogCollaborationHub;