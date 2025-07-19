import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Video, 
  Share2, 
  Settings, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Edit3,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Crown,
  Shield,
  MessageCircle,
  Activity,
  Download,
  Upload,
  Search,
  Filter,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useComplianceStore from '../../core/state-manager';
import { 
  complianceCollaborationEngine, 
  CollaborationSession, 
  CollaborationParticipant,
  CollaborationMessage,
  CollaborationDocument
} from '../../collaboration/realtime-collaboration';
import { useEnterpriseCompliance } from '../../hooks/use-enterprise-compliance';

interface TypingIndicator {
  userId: string;
  username: string;
  timestamp: Date;
}

const CollaborationStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [participants, setParticipants] = useState<CollaborationParticipant[]>([]);
  const [documents, setDocuments] = useState<CollaborationDocument[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [isEditingDocument, setIsEditingDocument] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionType, setNewSessionType] = useState<CollaborationSession['type']>('COMPLIANCE_REVIEW');
  const [showCreateSession, setShowCreateSession] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    rules,
    violations,
    audits
  } = useComplianceStore();

  const {
    collaborationMetrics
  } = useEnterpriseCompliance();

  // Load collaboration data
  useEffect(() => {
    loadCollaborationData();
    const interval = setInterval(loadCollaborationData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicators
  useEffect(() => {
    if (selectedSession && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (isTyping && selectedSession) {
      complianceCollaborationEngine.setTypingIndicator(selectedSession, 'current-user', true);
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        complianceCollaborationEngine.setTypingIndicator(selectedSession, 'current-user', false);
      }, 3000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, selectedSession]);

  const loadCollaborationData = () => {
    try {
      // Get all sessions
      const allSessions = complianceCollaborationEngine.getAllSessions();
      setSessions(allSessions);

      // If a session is selected, get its details
      if (selectedSession) {
        const session = complianceCollaborationEngine.getSession(selectedSession);
        if (session) {
          setMessages(session.messages);
          setParticipants(session.participants);
          setDocuments(session.documents);
          
          // Get typing indicators
          const indicators = complianceCollaborationEngine.getTypingIndicators(selectedSession);
          setTypingUsers(indicators.map(userId => ({
            userId,
            username: userId,
            timestamp: new Date()
          })));
        }
      }
    } catch (error) {
      console.error('Error loading collaboration data:', error);
    }
  };

  // Create new session
  const createNewSession = () => {
    if (!newSessionName.trim()) return;

    const session = complianceCollaborationEngine.createSession({
      name: newSessionName,
      type: newSessionType,
      createdBy: 'current-user',
      tags: ['compliance', 'collaboration']
    });

    setSelectedSession(session.id);
    setNewSessionName('');
    setShowCreateSession(false);
    loadCollaborationData();
  };

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;

    complianceCollaborationEngine.sendMessage(selectedSession, {
      userId: 'current-user',
      username: 'Current User',
      type: 'TEXT',
      content: newMessage
    });

    setNewMessage('');
    setIsTyping(false);
    loadCollaborationData();
  };

  // Handle document editing
  const handleDocumentEdit = () => {
    if (!selectedDocument || !selectedSession) return;

    complianceCollaborationEngine.updateDocument(
      selectedSession,
      selectedDocument,
      'current-user',
      documentContent
    );

    setIsEditingDocument(false);
    loadCollaborationData();
  };

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchTerm === '' || 
      session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Get participant role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-3 w-3 text-yellow-600" />;
      case 'EDITOR':
        return <Edit3 className="h-3 w-3 text-blue-600" />;
      case 'VIEWER':
        return <Eye className="h-3 w-3 text-gray-600" />;
      default:
        return <MessageCircle className="h-3 w-3 text-green-600" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'bg-green-500';
      case 'AWAY':
        return 'bg-yellow-500';
      case 'BUSY':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] space-x-4 p-6">
      {/* Sidebar */}
      <div className="w-80 space-y-4">
        {/* Session List */}
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Collaboration Sessions</CardTitle>
              <Button
                onClick={() => setShowCreateSession(true)}
                size="sm"
                variant="outline"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Active compliance collaboration sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="space-y-2 mb-4">
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Create Session Modal */}
            {showCreateSession && (
              <div className="space-y-4 p-4 border rounded-lg mb-4">
                <div>
                  <Label htmlFor="sessionName">Session Name</Label>
                  <Input
                    id="sessionName"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="Enter session name"
                  />
                </div>
                <div>
                  <Label htmlFor="sessionType">Session Type</Label>
                  <Select value={newSessionType} onValueChange={(value: CollaborationSession['type']) => setNewSessionType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPLIANCE_REVIEW">Compliance Review</SelectItem>
                      <SelectItem value="RULE_DESIGN">Rule Design</SelectItem>
                      <SelectItem value="VIOLATION_ANALYSIS">Violation Analysis</SelectItem>
                      <SelectItem value="AUDIT_COLLABORATION">Audit Collaboration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createNewSession} size="sm">Create</Button>
                  <Button onClick={() => setShowCreateSession(false)} variant="outline" size="sm">Cancel</Button>
                </div>
              </div>
            )}

            {/* Sessions List */}
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSession === session.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">{session.name}</h4>
                        <p className="text-xs text-muted-foreground">{session.type}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            session.status === 'ACTIVE' ? 'default' :
                            session.status === 'PAUSED' ? 'secondary' :
                            'outline'
                          } className="text-xs">
                            {session.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {session.participants.length} participants
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {session.participants.slice(0, 3).map((participant, index) => (
                          <div key={index} className="relative">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {participant.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div 
                              className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${getStatusColor(participant.status)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {selectedSession ? (
          <div className="grid grid-cols-3 gap-4 h-full">
            {/* Chat Area */}
            <div className="col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {sessions.find(s => s.id === selectedSession)?.name}
                      </CardTitle>
                      <CardDescription>
                        {participants.length} participants • {messages.length} messages
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Session Settings</DropdownMenuItem>
                          <DropdownMenuItem>Export Chat</DropdownMenuItem>
                          <DropdownMenuItem>Leave Session</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Messages */}
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {message.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{message.username}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                              {message.type !== 'TEXT' && (
                                <Badge variant="outline" className="text-xs">
                                  {message.type}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm">
                              {message.content}
                            </div>
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex space-x-1 mt-2">
                                {message.reactions.map((reaction, reactionIndex) => (
                                  <Badge key={reactionIndex} variant="outline" className="text-xs">
                                    {reaction.emoji} {reaction.username}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Typing Indicators */}
                      {typingUsers.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Activity className="h-4 w-4 animate-pulse" />
                          <span>
                            {typingUsers.map(user => user.username).join(', ')} 
                            {typingUsers.length === 1 ? ' is' : ' are'} typing...
                          </span>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          setIsTyping(true);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button onClick={sendMessage} size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              {/* Participants */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {participant.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div 
                              className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${getStatusColor(participant.status)}`}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{participant.username}</p>
                            <p className="text-xs text-muted-foreground">{participant.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(participant.role)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {documents.map((document) => (
                      <div
                        key={document.id}
                        onClick={() => {
                          setSelectedDocument(document.id);
                          setDocumentContent(document.content);
                        }}
                        className={`p-2 border rounded cursor-pointer transition-colors ${
                          selectedDocument === document.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{document.name}</p>
                            <p className="text-xs text-muted-foreground">
                              v{document.version} • {document.comments.length} comments
                            </p>
                          </div>
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Document Editor */}
              {selectedDocument && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Document Editor</CardTitle>
                      <Button
                        onClick={() => setIsEditingDocument(!isEditingDocument)}
                        variant="outline"
                        size="sm"
                      >
                        {isEditingDocument ? 'Preview' : 'Edit'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditingDocument ? (
                      <div className="space-y-2">
                        <Textarea
                          value={documentContent}
                          onChange={(e) => setDocumentContent(e.target.value)}
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <div className="flex space-x-2">
                          <Button onClick={handleDocumentEdit} size="sm">
                            Save Changes
                          </Button>
                          <Button 
                            onClick={() => setIsEditingDocument(false)} 
                            variant="outline" 
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ScrollArea className="h-32">
                          <pre className="text-xs whitespace-pre-wrap">
                            {documentContent}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center space-y-4">
              <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-medium">No Session Selected</h3>
                <p className="text-sm text-muted-foreground">
                  Select a collaboration session to start working together
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CollaborationStudio;