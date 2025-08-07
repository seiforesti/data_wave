'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

// Icons
import {
  MessageSquare,
  Users,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreHorizontal,
  Search,
  Filter,
  Settings,
  UserPlus,
  Crown,
  Shield,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Pin,
  PinOff,
  Edit,
  Trash2,
  Reply,
  Forward,
  Quote,
  Download,
  Upload,
  File,
  FileText,
  Image,
  FileVideo,
  FileAudio,
  Archive,
  Link,
  ExternalLink,
  Copy,
  Share,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Hash,
  AtSign,
  Zap,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Minus,
  X,
  Check,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  MonitorOff,
  Maximize,
  Minimize,
  CornerDownLeft,
  CornerDownRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  ChevronsDown,
  MoreVertical,
  Workflow,
  GitBranch,
  Database,
  Server,
  Cloud,
  Globe,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  AlertTriangle,
  Gauge,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Crosshair,
  Focus,
  Scan,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  List,
  Grid,
  Columns,
  Rows,
  Layout,
  Sidebar,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  SplitSquareHorizontal,
  SplitSquareVertical,
  MousePointer,
  Hand,
  Move,
  Resize,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  Minimize2,
  Maximize2,
  PictureInPicture,
  PictureInPicture2,
  ScreenShare,
  ScreenShareOff,
  Cast,
  Airplay,
  Bluetooth,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  Antenna,
  Router,
  Ethernet,
  Cable,
  Usb,
  HardDrive,
  SdCard,
  Smartphone,
  Tablet,
  Laptop,
  Monitor as MonitorIcon,
  Tv,
  Watch,
  Headphones,
  Speaker,
  Gamepad2,
  Joystick,
  Mouse,
  Keyboard,
  Printer,
  Scanner,
  Webcam,
  Projector,
} from 'lucide-react';

// Import hooks and services
import { useAIAssistant } from '../../../hooks/useAIAssistant';
import { useWorkspaceManagement } from '../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { useCrossGroupIntegration } from '../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../hooks/useActivityTracking';
import { usePipelineManagement } from '../../../hooks/usePipelineManagement';
import { useJobWorkflow } from '../../../hooks/useJobWorkflow';
import { useDataSources } from '../../../hooks/useDataSources';
import { useScanRuleSets } from '../../../hooks/useScanRuleSets';
import { useClassifications } from '../../../hooks/useClassifications';
import { useComplianceRule } from '../../../hooks/useComplianceRule';
import { useAdvancedCatalog } from '../../../hooks/useAdvancedCatalog';
import { useScanLogic } from '../../../hooks/useScanLogic';
import { useRBAC } from '../../../hooks/useRBAC';

// Types
interface ChatMessage {
  id: string;
  type: 'text' | 'file' | 'image' | 'video' | 'audio' | 'workflow' | 'system' | 'ai';
  content: string;
  author: TeamMember;
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
  replyTo?: string;
  thread?: ChatMessage[];
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
  mentions: string[];
  tags: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: {
    workflowId?: string;
    pipelineId?: string;
    taskId?: string;
    assetId?: string;
    location?: string;
    duration?: number;
    size?: number;
    format?: string;
    language?: string;
    encrypted?: boolean;
  };
  aiContext?: {
    confidence: number;
    suggestions: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string[];
    entities: string[];
    summary?: string;
  };
}

interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

interface MessageAttachment {
  id: string;
  name: string;
  type: 'file' | 'image' | 'video' | 'audio' | 'document' | 'link';
  url: string;
  size: number;
  format: string;
  thumbnail?: string;
  preview?: string;
  metadata?: {
    duration?: number;
    dimensions?: { width: number; height: number };
    pages?: number;
    encoding?: string;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'moderator' | 'member' | 'guest';
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  permissions: TeamPermissions;
  profile: {
    title?: string;
    department?: string;
    location?: string;
    timezone?: string;
    workingHours?: { start: string; end: string };
    skills?: string[];
    bio?: string;
  };
  preferences: {
    notifications: boolean;
    sounds: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
    autoStatus: boolean;
  };
  stats: {
    messagesCount: number;
    filesShared: number;
    workflowsCreated: number;
    collaborations: number;
    joinedAt: string;
    lastActivity: string;
  };
}

interface TeamPermissions {
  canSendMessages: boolean;
  canUploadFiles: boolean;
  canCreateWorkflows: boolean;
  canManageMembers: boolean;
  canDeleteMessages: boolean;
  canPinMessages: boolean;
  canCreateChannels: boolean;
  canManageChannels: boolean;
  canStartCalls: boolean;
  canScreenShare: boolean;
  canAccessHistory: boolean;
  canExportData: boolean;
}

interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'direct' | 'group' | 'announcement' | 'workflow';
  members: string[];
  admins: string[];
  owner: string;
  createdAt: string;
  lastActivity: string;
  messageCount: number;
  unreadCount: number;
  pinnedMessages: string[];
  settings: ChannelSettings;
  integration?: {
    workspaceId?: string;
    workflowId?: string;
    pipelineId?: string;
    spaType?: string;
    autoNotifications?: boolean;
    eventFilters?: string[];
  };
}

interface ChannelSettings {
  notifications: boolean;
  sounds: boolean;
  mentions: boolean;
  slowMode: number;
  messageRetention: number;
  fileUploads: boolean;
  linkPreviews: boolean;
  reactions: boolean;
  threads: boolean;
  readReceipts: boolean;
  encryption: boolean;
}

interface VoiceCall {
  id: string;
  type: 'voice' | 'video' | 'screen-share';
  participants: CallParticipant[];
  status: 'ringing' | 'connecting' | 'active' | 'ended';
  startTime: string;
  endTime?: string;
  duration?: number;
  recording?: {
    enabled: boolean;
    url?: string;
    size?: number;
    duration?: number;
  };
  settings: {
    muteOnJoin: boolean;
    videoOnJoin: boolean;
    allowScreenShare: boolean;
    maxParticipants: number;
    quality: 'low' | 'medium' | 'high' | 'hd';
    bandwidth: number;
  };
}

interface CallParticipant {
  userId: string;
  joinedAt: string;
  leftAt?: string;
  status: 'connecting' | 'connected' | 'disconnected';
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  speaking: boolean;
  signalStrength: number;
  latency: number;
}

interface WorkflowIntegration {
  id: string;
  type: 'pipeline' | 'job' | 'scan' | 'compliance' | 'catalog' | 'rbac';
  name: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'scheduled';
  progress: number;
  startTime: string;
  endTime?: string;
  owner: string;
  collaborators: string[];
  notifications: {
    onStart: boolean;
    onComplete: boolean;
    onError: boolean;
    onProgress: boolean;
    channels: string[];
  };
  actions: {
    canStart: boolean;
    canStop: boolean;
    canPause: boolean;
    canRestart: boolean;
    canConfigure: boolean;
  };
}

interface TeamAnalytics {
  members: {
    total: number;
    online: number;
    active: number;
    new: number;
  };
  messages: {
    total: number;
    today: number;
    average: number;
    trend: number;
  };
  channels: {
    total: number;
    active: number;
    private: number;
    public: number;
  };
  files: {
    shared: number;
    storage: number;
    types: Record<string, number>;
  };
  calls: {
    total: number;
    duration: number;
    participants: number;
    quality: number;
  };
  workflows: {
    integrated: number;
    active: number;
    completed: number;
    collaborations: number;
  };
  engagement: {
    messageRate: number;
    responseTime: number;
    participation: number;
    satisfaction: number;
  };
}

interface QuickTeamChatProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
  initialChannel?: string;
  workflowContext?: {
    workflowId: string;
    type: string;
    name: string;
  };
}

const QuickTeamChat: React.FC<QuickTeamChatProps> = ({
  isVisible,
  onClose,
  className = '',
  initialChannel,
  workflowContext,
}) => {
  // State management
  const [activeChannel, setActiveChannel] = useState<string>(initialChannel || 'general');
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCall, setActiveCall] = useState<VoiceCall | null>(null);
  const [isTyping, setIsTyping] = useState<Record<string, string[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([]);
  const [showMemberList, setShowMemberList] = useState<boolean>(true);
  const [showThreads, setShowThreads] = useState<boolean>(false);
  const [showFiles, setShowFiles] = useState<boolean>(false);
  const [showWorkflows, setShowWorkflows] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'calls' | 'files' | 'workflows' | 'analytics'>('chat');
  const [channelFilter, setChannelFilter] = useState<'all' | 'public' | 'private' | 'direct' | 'workflow'>('all');
  const [messageFilter, setMessageFilter] = useState<'all' | 'mentions' | 'starred' | 'files' | 'workflows'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'relevance'>('newest');
  const [notifications, setNotifications] = useState<boolean>(true);
  const [sounds, setSounds] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [workflowIntegrations, setWorkflowIntegrations] = useState<WorkflowIntegration[]>([]);
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState<boolean>(false);
  const [mentionQuery, setMentionQuery] = useState<string>('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Hooks
  const {
    getAIRecommendations,
    processNaturalLanguage,
    generateInsights,
    analyzeUserBehavior,
    getContextualHelp,
    autoComplete,
    generateCode,
    validateConfiguration
  } = useAIAssistant();

  const {
    currentWorkspace,
    workspaceMembers,
    getWorkspaceMetrics,
    getWorkspaceActivities,
    inviteMember,
    removeMember
  } = useWorkspaceManagement();

  const {
    currentUser,
    userPermissions,
    getUserById,
    updateUserStatus,
    getUserPreferences
  } = useUserManagement();

  const {
    getCrossGroupMetrics,
    getSPAStatus,
    getIntegrationStatus,
    triggerCrossGroupAction
  } = useCrossGroupIntegration();

  const {
    trackActivity,
    getActivityHistory,
    getCollaborationMetrics,
    getUserInteractions
  } = useActivityTracking();

  // SPA Integration Hooks
  const { pipelines, createPipeline, executePipeline } = usePipelineManagement();
  const { workflows, createWorkflow, executeWorkflow } = useJobWorkflow();
  const { dataSources, connectDataSource } = useDataSources();
  const { scanJobs, startScan } = useScanLogic();
  const { complianceRules, checkCompliance } = useComplianceRule();
  const { catalogItems, addToCatalog } = useAdvancedCatalog();
  const { users: rbacUsers, roles, assignRole } = useRBAC();

  // Emoji reactions
  const commonEmojis = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉', '🚀', '💡', '✅', '❌', '⚠️', '📝', '🔥'];

  // Message types for workflow integration
  const workflowMessageTypes = [
    { type: 'pipeline', label: 'Pipeline Update', icon: GitBranch },
    { type: 'job', label: 'Job Status', icon: Workflow },
    { type: 'scan', label: 'Scan Results', icon: Scan },
    { type: 'compliance', label: 'Compliance Alert', icon: ShieldCheck },
    { type: 'catalog', label: 'Catalog Entry', icon: Database },
    { type: 'rbac', label: 'Access Change', icon: Lock }
  ];

  // Initialize component
  useEffect(() => {
    loadChannels();
    loadMembers();
    loadMessages();
    loadWorkflowIntegrations();
    loadAnalytics();
    setupRealTimeConnection();
    trackActivity('team-chat-opened', { component: 'QuickTeamChat' });

    if (workflowContext) {
      handleWorkflowIntegration(workflowContext);
    }

    return () => {
      cleanupRealTimeConnection();
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel]);

  // Handle typing indicators
  useEffect(() => {
    if (currentMessage.length > 0) {
      handleTyping(true);
    } else {
      handleTyping(false);
    }
  }, [currentMessage]);

  // AI suggestions based on message content
  useEffect(() => {
    if (currentMessage.length > 10) {
      generateAISuggestions(currentMessage);
    } else {
      setAISuggestions([]);
    }
  }, [currentMessage]);

  // Load channels
  const loadChannels = useCallback(async () => {
    try {
      const defaultChannels: ChatChannel[] = [
        {
          id: 'general',
          name: 'general',
          description: 'General team discussions',
          type: 'public',
          members: [],
          admins: [],
          owner: currentUser?.id || '',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          messageCount: 0,
          unreadCount: 0,
          pinnedMessages: [],
          settings: {
            notifications: true,
            sounds: true,
            mentions: true,
            slowMode: 0,
            messageRetention: 30,
            fileUploads: true,
            linkPreviews: true,
            reactions: true,
            threads: true,
            readReceipts: true,
            encryption: false
          }
        },
        {
          id: 'data-governance',
          name: 'data-governance',
          description: 'Data governance discussions and updates',
          type: 'public',
          members: [],
          admins: [],
          owner: currentUser?.id || '',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          messageCount: 0,
          unreadCount: 0,
          pinnedMessages: [],
          settings: {
            notifications: true,
            sounds: true,
            mentions: true,
            slowMode: 0,
            messageRetention: 90,
            fileUploads: true,
            linkPreviews: true,
            reactions: true,
            threads: true,
            readReceipts: true,
            encryption: true
          },
          integration: {
            workspaceId: currentWorkspace?.id,
            autoNotifications: true,
            eventFilters: ['compliance', 'scan', 'catalog']
          }
        },
        {
          id: 'workflows',
          name: 'workflows',
          description: 'Workflow collaboration and status updates',
          type: 'workflow',
          members: [],
          admins: [],
          owner: currentUser?.id || '',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          messageCount: 0,
          unreadCount: 0,
          pinnedMessages: [],
          settings: {
            notifications: true,
            sounds: false,
            mentions: true,
            slowMode: 0,
            messageRetention: 180,
            fileUploads: true,
            linkPreviews: true,
            reactions: true,
            threads: true,
            readReceipts: true,
            encryption: true
          },
          integration: {
            workspaceId: currentWorkspace?.id,
            autoNotifications: true,
            eventFilters: ['pipeline', 'job', 'workflow']
          }
        }
      ];

      setChannels(defaultChannels);
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  }, [currentUser, currentWorkspace]);

  // Load members
  const loadMembers = useCallback(async () => {
    try {
      if (workspaceMembers) {
        const teamMembers: TeamMember[] = workspaceMembers.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          avatar: member.avatar,
          role: member.role === 'admin' ? 'admin' : 'member',
          status: 'online',
          lastSeen: new Date().toISOString(),
          permissions: {
            canSendMessages: true,
            canUploadFiles: true,
            canCreateWorkflows: member.role === 'admin',
            canManageMembers: member.role === 'admin',
            canDeleteMessages: member.role === 'admin',
            canPinMessages: true,
            canCreateChannels: member.role === 'admin',
            canManageChannels: member.role === 'admin',
            canStartCalls: true,
            canScreenShare: true,
            canAccessHistory: true,
            canExportData: member.role === 'admin'
          },
          profile: {
            title: member.title,
            department: member.department,
            location: member.location,
            timezone: member.timezone,
            skills: member.skills || [],
            bio: member.bio
          },
          preferences: {
            notifications: true,
            sounds: true,
            theme: 'auto',
            language: 'en',
            autoStatus: true
          },
          stats: {
            messagesCount: 0,
            filesShared: 0,
            workflowsCreated: 0,
            collaborations: 0,
            joinedAt: member.joinedAt || new Date().toISOString(),
            lastActivity: new Date().toISOString()
          }
        }));

        setMembers(teamMembers);
        setOnlineUsers(teamMembers.map(m => m.id));
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  }, [workspaceMembers]);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from an API
      const defaultMessages: Record<string, ChatMessage[]> = {
        general: [
          {
            id: 'msg-1',
            type: 'text',
            content: 'Welcome to the team chat! 🎉',
            author: members[0] || {
              id: 'system',
              name: 'System',
              email: 'system@example.com',
              role: 'admin',
              status: 'online',
              lastSeen: new Date().toISOString(),
              permissions: {} as TeamPermissions,
              profile: {},
              preferences: {} as any,
              stats: {} as any
            },
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            reactions: [{ emoji: '👋', users: ['user-1', 'user-2'], count: 2 }],
            attachments: [],
            mentions: [],
            tags: [],
            priority: 'normal',
            status: 'read'
          }
        ]
      };

      setMessages(defaultMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [members]);

  // Load workflow integrations
  const loadWorkflowIntegrations = useCallback(async () => {
    try {
      const integrations: WorkflowIntegration[] = [
        {
          id: 'wf-1',
          type: 'pipeline',
          name: 'Data Quality Pipeline',
          status: 'running',
          progress: 65,
          startTime: new Date(Date.now() - 1800000).toISOString(),
          owner: currentUser?.id || '',
          collaborators: [],
          notifications: {
            onStart: true,
            onComplete: true,
            onError: true,
            onProgress: false,
            channels: ['workflows', 'data-governance']
          },
          actions: {
            canStart: false,
            canStop: true,
            canPause: true,
            canRestart: false,
            canConfigure: true
          }
        },
        {
          id: 'wf-2',
          type: 'scan',
          name: 'Compliance Scan',
          status: 'completed',
          progress: 100,
          startTime: new Date(Date.now() - 7200000).toISOString(),
          endTime: new Date(Date.now() - 3600000).toISOString(),
          owner: currentUser?.id || '',
          collaborators: [],
          notifications: {
            onStart: true,
            onComplete: true,
            onError: true,
            onProgress: false,
            channels: ['workflows', 'data-governance']
          },
          actions: {
            canStart: true,
            canStop: false,
            canPause: false,
            canRestart: true,
            canConfigure: true
          }
        }
      ];

      setWorkflowIntegrations(integrations);
    } catch (error) {
      console.error('Failed to load workflow integrations:', error);
    }
  }, [currentUser]);

  // Load analytics
  const loadAnalytics = useCallback(async () => {
    try {
      const analyticsData: TeamAnalytics = {
        members: {
          total: members.length,
          online: onlineUsers.length,
          active: Math.floor(members.length * 0.8),
          new: 2
        },
        messages: {
          total: 1847,
          today: 156,
          average: 98,
          trend: 12
        },
        channels: {
          total: channels.length,
          active: 3,
          private: 1,
          public: 2
        },
        files: {
          shared: 234,
          storage: 1.2, // GB
          types: {
            documents: 45,
            images: 78,
            videos: 12,
            audio: 8,
            other: 91
          }
        },
        calls: {
          total: 23,
          duration: 8.5, // hours
          participants: 12,
          quality: 4.2
        },
        workflows: {
          integrated: 15,
          active: 3,
          completed: 28,
          collaborations: 67
        },
        engagement: {
          messageRate: 2.3,
          responseTime: 4.2, // minutes
          participation: 0.85,
          satisfaction: 4.6
        }
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }, [members, onlineUsers, channels]);

  // Setup real-time connection
  const setupRealTimeConnection = useCallback(() => {
    // In a real implementation, this would setup WebSocket or similar
    console.log('Setting up real-time connection...');
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update online status
      setOnlineUsers(prev => {
        const shuffled = [...prev].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.floor(Math.random() * members.length) + 1);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [members]);

  // Cleanup real-time connection
  const cleanupRealTimeConnection = useCallback(() => {
    console.log('Cleaning up real-time connection...');
  }, []);

  // Handle workflow integration
  const handleWorkflowIntegration = useCallback((context: { workflowId: string; type: string; name: string }) => {
    const workflowMessage: ChatMessage = {
      id: `workflow-${Date.now()}`,
      type: 'workflow',
      content: `Workflow "${context.name}" has been integrated with this chat`,
      author: {
        id: 'system',
        name: 'Workflow System',
        email: 'system@example.com',
        role: 'admin',
        status: 'online',
        lastSeen: new Date().toISOString(),
        permissions: {} as TeamPermissions,
        profile: {},
        preferences: {} as any,
        stats: {} as any
      },
      timestamp: new Date().toISOString(),
      reactions: [],
      attachments: [],
      mentions: [],
      tags: [context.type],
      priority: 'normal',
      status: 'sent',
      metadata: {
        workflowId: context.workflowId
      }
    };

    setMessages(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), workflowMessage]
    }));

    trackActivity('workflow-integrated-chat', context);
  }, [activeChannel, trackActivity]);

  // Handle typing
  const handleTyping = useCallback((typing: boolean) => {
    if (!currentUser) return;

    setIsTyping(prev => ({
      ...prev,
      [activeChannel]: typing 
        ? [...(prev[activeChannel] || []).filter(id => id !== currentUser.id), currentUser.id]
        : (prev[activeChannel] || []).filter(id => id !== currentUser.id)
    }));
  }, [activeChannel, currentUser]);

  // Generate AI suggestions
  const generateAISuggestions = useCallback(async (content: string) => {
    try {
      const suggestions = await autoComplete(content, {
        context: 'team-chat',
        channelType: channels.find(c => c.id === activeChannel)?.type,
        recentMessages: messages[activeChannel]?.slice(-5) || []
      });

      if (suggestions && Array.isArray(suggestions)) {
        setAISuggestions(suggestions.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    }
  }, [activeChannel, channels, messages, autoComplete]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || !currentUser) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'text',
      content: currentMessage.trim(),
      author: currentUser,
      timestamp: new Date().toISOString(),
      replyTo: replyTo || undefined,
      reactions: [],
      attachments: [],
      mentions: extractMentions(currentMessage),
      tags: extractTags(currentMessage),
      priority: 'normal',
      status: 'sending'
    };

    // Add to messages
    setMessages(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMessage]
    }));

    // Clear input
    setCurrentMessage('');
    setReplyTo(null);
    setAISuggestions([]);

    // Simulate sending
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [activeChannel]: prev[activeChannel]?.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'sent' as const }
            : msg
        ) || []
      }));
    }, 500);

    // Track activity
    trackActivity('message-sent', {
      channelId: activeChannel,
      messageLength: newMessage.content.length,
      mentions: newMessage.mentions.length,
      replyTo: !!replyTo
    });

    // Process with AI if needed
    if (newMessage.content.includes('@ai') || newMessage.content.includes('/ai')) {
      handleAIResponse(newMessage);
    }
  }, [currentMessage, currentUser, activeChannel, replyTo, trackActivity]);

  // Handle AI response
  const handleAIResponse = useCallback(async (userMessage: ChatMessage) => {
    try {
      const aiResponse = await processNaturalLanguage(userMessage.content, {
        context: 'team-chat',
        channelType: channels.find(c => c.id === activeChannel)?.type,
        recentMessages: messages[activeChannel]?.slice(-10) || [],
        workflowIntegrations: workflowIntegrations
      });

      if (aiResponse) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: aiResponse.response || 'I\'m here to help with your data governance tasks!',
          author: {
            id: 'ai-assistant',
            name: 'AI Assistant',
            email: 'ai@example.com',
            role: 'admin',
            status: 'online',
            lastSeen: new Date().toISOString(),
            permissions: {} as TeamPermissions,
            profile: { title: 'AI Assistant' },
            preferences: {} as any,
            stats: {} as any
          },
          timestamp: new Date().toISOString(),
          replyTo: userMessage.id,
          reactions: [],
          attachments: [],
          mentions: [],
          tags: ['ai'],
          priority: 'normal',
          status: 'sent',
          aiContext: {
            confidence: aiResponse.confidence || 0.9,
            suggestions: aiResponse.suggestions || [],
            sentiment: 'positive',
            topics: aiResponse.topics || [],
            entities: aiResponse.entities || [],
            summary: aiResponse.summary
          }
        };

        setMessages(prev => ({
          ...prev,
          [activeChannel]: [...(prev[activeChannel] || []), aiMessage]
        }));
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    }
  }, [activeChannel, channels, messages, workflowIntegrations, processNaturalLanguage]);

  // Extract mentions from message
  const extractMentions = useCallback((content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }, []);

  // Extract tags from message
  const extractTags = useCallback((content: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const tags = [];
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!currentUser) return;

    for (const file of Array.from(files)) {
      const attachment: MessageAttachment = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: getFileType(file.type),
        url: URL.createObjectURL(file),
        size: file.size,
        format: file.type,
        thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      };

      const fileMessage: ChatMessage = {
        id: `file-msg-${Date.now()}`,
        type: 'file',
        content: `Shared a file: ${file.name}`,
        author: currentUser,
        timestamp: new Date().toISOString(),
        reactions: [],
        attachments: [attachment],
        mentions: [],
        tags: [],
        priority: 'normal',
        status: 'sending'
      };

      setMessages(prev => ({
        ...prev,
        [activeChannel]: [...(prev[activeChannel] || []), fileMessage]
      }));

      // Simulate upload
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setMessages(prevMsgs => ({
              ...prevMsgs,
              [activeChannel]: prevMsgs[activeChannel]?.map(msg => 
                msg.id === fileMessage.id 
                  ? { ...msg, status: 'sent' as const }
                  : msg
              ) || []
            }));
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }

    trackActivity('file-shared', { fileCount: files.length, channel: activeChannel });
  }, [currentUser, activeChannel, trackActivity]);

  // Get file type
  const getFileType = useCallback((mimeType: string): MessageAttachment['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('doc') || mimeType.includes('text')) return 'document';
    return 'file';
  }, []);

  // Handle message reaction
  const handleMessageReaction = useCallback((messageId: string, emoji: string) => {
    if (!currentUser) return;

    setMessages(prev => ({
      ...prev,
      [activeChannel]: prev[activeChannel]?.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find(r => r.emoji === emoji);
          if (existingReaction) {
            const userIndex = existingReaction.users.indexOf(currentUser.id);
            if (userIndex > -1) {
              // Remove reaction
              existingReaction.users.splice(userIndex, 1);
              existingReaction.count = existingReaction.users.length;
              if (existingReaction.count === 0) {
                msg.reactions = msg.reactions.filter(r => r.emoji !== emoji);
              }
            } else {
              // Add reaction
              existingReaction.users.push(currentUser.id);
              existingReaction.count = existingReaction.users.length;
            }
          } else {
            // New reaction
            msg.reactions.push({
              emoji,
              users: [currentUser.id],
              count: 1
            });
          }
        }
        return msg;
      }) || []
    }));
  }, [activeChannel, currentUser]);

  // Handle mention suggestions
  const handleMentionInput = useCallback((value: string) => {
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex > -1 && lastAtIndex === value.length - 1) {
      setShowMentionSuggestions(true);
      setMentionQuery('');
    } else if (lastAtIndex > -1) {
      const query = value.substring(lastAtIndex + 1);
      if (query.includes(' ')) {
        setShowMentionSuggestions(false);
      } else {
        setMentionQuery(query);
        setShowMentionSuggestions(true);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  }, []);

  // Filter members for mentions
  const filteredMembersForMention = useMemo(() => {
    if (!mentionQuery) return members.slice(0, 5);
    return members.filter(member => 
      member.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(mentionQuery.toLowerCase())
    ).slice(0, 5);
  }, [members, mentionQuery]);

  // Filter messages based on current filter
  const filteredMessages = useMemo(() => {
    const channelMessages = messages[activeChannel] || [];
    
    switch (messageFilter) {
      case 'mentions':
        return channelMessages.filter(msg => 
          msg.mentions.includes(currentUser?.name || '') || 
          msg.content.includes(`@${currentUser?.name}`)
        );
      case 'starred':
        return channelMessages.filter(msg => 
          pinnedMessages.includes(msg.id)
        );
      case 'files':
        return channelMessages.filter(msg => 
          msg.attachments.length > 0
        );
      case 'workflows':
        return channelMessages.filter(msg => 
          msg.type === 'workflow' || msg.metadata?.workflowId
        );
      default:
        return channelMessages;
    }
  }, [messages, activeChannel, messageFilter, currentUser, pinnedMessages]);

  // Filter channels based on current filter
  const filteredChannels = useMemo(() => {
    switch (channelFilter) {
      case 'public':
        return channels.filter(ch => ch.type === 'public');
      case 'private':
        return channels.filter(ch => ch.type === 'private');
      case 'direct':
        return channels.filter(ch => ch.type === 'direct');
      case 'workflow':
        return channels.filter(ch => ch.type === 'workflow');
      default:
        return channels;
    }
  }, [channels, channelFilter]);

  // Render message
  const renderMessage = useCallback((message: ChatMessage, index: number) => {
    const isCurrentUser = message.author.id === currentUser?.id;
    const showAvatar = index === 0 || 
      messages[activeChannel]?.[index - 1]?.author.id !== message.author.id;

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 p-3 hover:bg-muted/30 transition-colors ${
          isCurrentUser ? 'flex-row-reverse' : ''
        }`}
      >
        {showAvatar && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={message.author.avatar} />
            <AvatarFallback>
              {message.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex-1 min-w-0 ${showAvatar ? '' : 'ml-11'}`}>
          {showAvatar && (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{message.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              {message.author.role === 'admin' && (
                <Crown className="w-3 h-3 text-yellow-500" />
              )}
              {message.type === 'ai' && (
                <Badge variant="secondary" className="text-xs">AI</Badge>
              )}
            </div>
          )}
          
          <div className={`rounded-lg p-3 max-w-lg ${
            isCurrentUser 
              ? 'bg-primary text-primary-foreground ml-auto' 
              : 'bg-muted'
          }`}>
            {message.replyTo && (
              <div className="text-xs text-muted-foreground mb-2 pl-2 border-l-2 border-muted-foreground">
                Replying to message...
              </div>
            )}
            
            <div className="text-sm whitespace-pre-wrap">
              {message.content}
            </div>
            
            {message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center gap-2 p-2 rounded border">
                    {attachment.type === 'image' ? (
                      <Image className="w-4 h-4" />
                    ) : attachment.type === 'video' ? (
                      <FileVideo className="w-4 h-4" />
                    ) : attachment.type === 'audio' ? (
                      <FileAudio className="w-4 h-4" />
                    ) : (
                      <File className="w-4 h-4" />
                    )}
                    <span className="text-xs truncate">{attachment.name}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {message.mentions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {message.mentions.map(mention => (
                  <Badge key={mention} variant="secondary" className="text-xs">
                    @{mention}
                  </Badge>
                ))}
              </div>
            )}
            
            {message.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {message.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map(reaction => (
                <Button
                  key={reaction.emoji}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleMessageReaction(message.id, reaction.emoji)}
                >
                  {reaction.emoji} {reaction.count}
                </Button>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Smile className="w-3 h-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="top">
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {commonEmojis.map(emoji => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleMessageReaction(message.id, emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setReplyTo(message.id)}
            >
              <Reply className="w-3 h-3" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="w-3 h-3 mr-1" />
                  Forward
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pin className="w-3 h-3 mr-1" />
                  Pin
                </DropdownMenuItem>
                {isCurrentUser && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    );
  }, [activeChannel, messages, currentUser, handleMessageReaction, commonEmojis]);

  // Main render
  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <div className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-4 bg-background border rounded-lg shadow-lg flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Team Chat</h2>
                <p className="text-sm text-muted-foreground">
                  Real-time collaboration hub with workflow integration
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {notifications && (
                <Bell className="h-4 w-4 text-green-500" />
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMemberList(!showMemberList)}
              >
                <Users className="h-4 w-4 mr-1" />
                Members ({onlineUsers.length})
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Bell className="h-3 w-3 mr-1" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Volume2 className="h-3 w-3 mr-1" />
                    Sounds
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="h-3 w-3 mr-1" />
                    Privacy
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Channels */}
            <div className="w-80 border-r bg-muted/30 flex flex-col">
              {/* Channel Filter */}
              <div className="p-3 border-b">
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="workflow">Workflows</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Channels List */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {filteredChannels.map(channel => (
                    <div
                      key={channel.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        activeChannel === channel.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setActiveChannel(channel.id)}
                    >
                      {channel.type === 'public' && <Hash className="w-4 h-4" />}
                      {channel.type === 'private' && <Lock className="w-4 h-4" />}
                      {channel.type === 'direct' && <AtSign className="w-4 h-4" />}
                      {channel.type === 'workflow' && <Workflow className="w-4 h-4" />}
                      
                      <span className="flex-1 text-sm font-medium truncate">
                        {channel.name}
                      </span>
                      
                      {channel.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {channel.unreadCount}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="p-2 border-t space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Channel
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Members
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Workflow className="w-4 h-4 mr-2" />
                  Workflow Integration
                </Button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">
                    #{channels.find(c => c.id === activeChannel)?.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {members.length} members
                  </Badge>
                  {isTyping[activeChannel]?.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-75" />
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-150" />
                      </div>
                      <span>
                        {isTyping[activeChannel].length === 1 
                          ? `${members.find(m => m.id === isTyping[activeChannel][0])?.name} is typing...`
                          : `${isTyping[activeChannel].length} people are typing...`
                        }
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={messageFilter} onValueChange={setMessageFilter}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Messages</SelectItem>
                      <SelectItem value="mentions">Mentions</SelectItem>
                      <SelectItem value="starred">Starred</SelectItem>
                      <SelectItem value="files">Files</SelectItem>
                      <SelectItem value="workflows">Workflows</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4 mr-1" />
                    Video
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea 
                ref={chatContainerRef}
                className="flex-1 p-0"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    handleFileUpload(files);
                  }
                }}
              >
                <div className="space-y-0">
                  {filteredMessages.map((message, index) => (
                    <div key={message.id} className="group">
                      {renderMessage(message, index)}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {isDragOver && (
                  <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="h-12 w-12 mx-auto mb-2 text-primary" />
                      <p className="text-lg font-medium">Drop files to share</p>
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Reply Banner */}
              {replyTo && (
                <div className="flex items-center justify-between p-2 bg-muted border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Reply className="w-4 h-4" />
                    <span>Replying to message</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="p-2 border-t bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">AI Suggestions</span>
                  </div>
                  <div className="space-y-1">
                    {aiSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-auto p-2"
                        onClick={() => setCurrentMessage(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-3 border-t">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={messageInputRef}
                      value={currentMessage}
                      onChange={(e) => {
                        setCurrentMessage(e.target.value);
                        handleMentionInput(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message... (@mention, #tag, /command)"
                      className="min-h-[40px] max-h-32 resize-none"
                      rows={1}
                    />
                    
                    {showMentionSuggestions && (
                      <div className="absolute bottom-full left-0 w-full bg-background border rounded-md shadow-lg mb-1 z-10">
                        {filteredMembersForMention.map(member => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                            onClick={() => {
                              const lastAtIndex = currentMessage.lastIndexOf('@');
                              const newMessage = currentMessage.substring(0, lastAtIndex + 1) + member.name + ' ';
                              setCurrentMessage(newMessage);
                              setShowMentionSuggestions(false);
                              messageInputRef.current?.focus();
                            }}
                          >
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="text-xs">
                                {member.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{member.name}</div>
                              <div className="text-xs text-muted-foreground">{member.profile.title}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRecording(!isRecording)}
                    className={isRecording ? 'text-red-500' : ''}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim()}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <span className="text-xs text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </span>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files);
                    }
                  }}
                />
              </div>
            </div>

            {/* Right Sidebar - Members & Info */}
            {showMemberList && (
              <div className="w-80 border-l bg-muted/30 flex flex-col">
                <Tabs defaultValue="members" className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 m-2">
                    <TabsTrigger value="members" className="text-xs">Members</TabsTrigger>
                    <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
                    <TabsTrigger value="workflows" className="text-xs">Workflows</TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-hidden">
                    {/* Members Tab */}
                    <TabsContent value="members" className="h-full m-0 p-2">
                      <ScrollArea className="h-full">
                        <div className="space-y-2">
                          {members.map(member => (
                            <div key={member.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                              <div className="relative">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {member.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                                  onlineUsers.includes(member.id)
                                    ? member.status === 'online' ? 'bg-green-500'
                                      : member.status === 'away' ? 'bg-yellow-500'
                                      : member.status === 'busy' ? 'bg-red-500'
                                      : 'bg-gray-500'
                                    : 'bg-gray-500'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-medium truncate">
                                    {member.name}
                                  </span>
                                  {member.role === 'owner' && (
                                    <Crown className="w-3 h-3 text-yellow-500" />
                                  )}
                                  {member.role === 'admin' && (
                                    <Shield className="w-3 h-3 text-blue-500" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {member.profile.title || member.email}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Phone className="w-3 h-3 mr-1" />
                                    Call
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="w-3 h-3 mr-1" />
                                    Profile
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Files Tab */}
                    <TabsContent value="files" className="h-full m-0 p-2">
                      <ScrollArea className="h-full">
                        <div className="space-y-2">
                          {filteredMessages
                            .filter(msg => msg.attachments.length > 0)
                            .map(msg => msg.attachments.map(attachment => (
                              <div key={attachment.id} className="flex items-center gap-2 p-2 rounded border">
                                {attachment.type === 'image' ? (
                                  <Image className="w-4 h-4" />
                                ) : attachment.type === 'video' ? (
                                  <FileVideo className="w-4 h-4" />
                                ) : attachment.type === 'audio' ? (
                                  <FileAudio className="w-4 h-4" />
                                ) : (
                                  <File className="w-4 h-4" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {attachment.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {(attachment.size / 1024 / 1024).toFixed(1)} MB
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            )))
                          }
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Workflows Tab */}
                    <TabsContent value="workflows" className="h-full m-0 p-2">
                      <ScrollArea className="h-full">
                        <div className="space-y-2">
                          {workflowIntegrations.map(workflow => (
                            <Card key={workflow.id} className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Workflow className="w-4 h-4" />
                                  <span className="text-sm font-medium">{workflow.name}</span>
                                </div>
                                <Badge variant={
                                  workflow.status === 'running' ? 'default' :
                                  workflow.status === 'completed' ? 'secondary' :
                                  workflow.status === 'failed' ? 'destructive' : 'outline'
                                }>
                                  {workflow.status}
                                </Badge>
                              </div>
                              
                              {workflow.status === 'running' && (
                                <div className="mb-2">
                                  <Progress value={workflow.progress} className="h-2" />
                                  <span className="text-xs text-muted-foreground">
                                    {workflow.progress}% complete
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex gap-1">
                                {workflow.actions.canStop && (
                                  <Button variant="outline" size="sm" className="text-xs">
                                    Stop
                                  </Button>
                                )}
                                {workflow.actions.canPause && (
                                  <Button variant="outline" size="sm" className="text-xs">
                                    Pause
                                  </Button>
                                )}
                                {workflow.actions.canConfigure && (
                                  <Button variant="outline" size="sm" className="text-xs">
                                    Configure
                                  </Button>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default QuickTeamChat;