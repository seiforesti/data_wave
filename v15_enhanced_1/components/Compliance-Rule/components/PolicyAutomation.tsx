import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Gavel, 
  Robot, 
  Shield, 
  Zap, 
  Brain, 
  Play, 
  Pause, 
  Stop,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Target,
  Activity
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  TreeMap
} from 'recharts';
import { useEnterpriseCompliance } from '../hooks/use-enterprise-compliance';
import { complianceWorkflowEngine } from '../core/workflow-engine';

interface PolicyRule {
  id: string;
  name: string;
  description: string;
  type: 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE';
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'INACTIVE' | 'TESTING' | 'DRAFT';
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  schedule: string;
  effectiveness: number;
  violations: number;
  lastTriggered?: Date;
  createdBy: string;
  createdAt: Date;
  aiGenerated: boolean;
}

interface PolicyCondition {
  id: string;
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'REGEX' | 'GREATER_THAN' | 'LESS_THAN';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface PolicyAction {
  id: string;
  type: 'ALERT' | 'BLOCK' | 'LOG' | 'QUARANTINE' | 'NOTIFY' | 'REMEDIATE';
  parameters: Record<string, any>;
  priority: number;
  automated: boolean;
}

interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  rules: Partial<PolicyRule>[];
  aiRecommended: boolean;
}

interface PolicyExecution {
  id: string;
  policyId: string;
  timestamp: Date;
  status: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  affectedEntities: number;
  actionsExecuted: number;
  duration: number;
  details: string;
}

const PolicyAutomation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('policies');
  const [policies, setPolicies] = useState<PolicyRule[]>([]);
  const [templates, setTemplates] = useState<PolicyTemplate[]>([]);
  const [executions, setExecutions] = useState<PolicyExecution[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRule | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // New policy form state
  const [newPolicy, setNewPolicy] = useState<Partial<PolicyRule>>({
    name: '',
    description: '',
    type: 'DETECTIVE',
    category: '',
    priority: 'MEDIUM',
    status: 'DRAFT',
    conditions: [],
    actions: [],
    schedule: 'CONTINUOUS',
    aiGenerated: false
  });

  const {
    realTimeMetrics,
    aiInsights,
    workflowMetrics,
    crossGroupData
  } = useEnterpriseCompliance({
    componentName: 'policy-automation',
    enableAnalytics: true,
    enableWorkflows: true,
    enableAIInsights: true,
    enableCrossGroupIntegration: true
  });

  // Load policy data
  useEffect(() => {
    loadPolicyData();
    const interval = setInterval(loadPolicyData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadPolicyData = async () => {
    try {
      // Generate sample policy data
      const policiesData: PolicyRule[] = [
        {
          id: 'pol1',
          name: 'Data Privacy Protection',
          description: 'Automatically detects and prevents unauthorized access to PII data',
          type: 'PREVENTIVE',
          category: 'PRIVACY',
          priority: 'CRITICAL',
          status: 'ACTIVE',
          conditions: [
            {
              id: 'c1',
              field: 'dataType',
              operator: 'EQUALS',
              value: 'PII'
            }
          ],
          actions: [
            {
              id: 'a1',
              type: 'BLOCK',
              parameters: { reason: 'Unauthorized PII access' },
              priority: 1,
              automated: true
            }
          ],
          schedule: 'CONTINUOUS',
          effectiveness: 94,
          violations: 12,
          lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
          createdBy: 'AI Assistant',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          aiGenerated: true
        },
        {
          id: 'pol2',
          name: 'Regulatory Compliance Monitor',
          description: 'Monitors and ensures GDPR compliance across all data operations',
          type: 'DETECTIVE',
          category: 'REGULATORY',
          priority: 'HIGH',
          status: 'ACTIVE',
          conditions: [
            {
              id: 'c2',
              field: 'framework',
              operator: 'EQUALS',
              value: 'GDPR'
            }
          ],
          actions: [
            {
              id: 'a2',
              type: 'ALERT',
              parameters: { severity: 'HIGH', stakeholders: ['compliance-team'] },
              priority: 1,
              automated: true
            }
          ],
          schedule: 'HOURLY',
          effectiveness: 87,
          violations: 5,
          lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
          createdBy: 'Compliance Team',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          aiGenerated: false
        },
        {
          id: 'pol3',
          name: 'Data Quality Enforcement',
          description: 'Automatically validates and corrects data quality issues',
          type: 'CORRECTIVE',
          category: 'QUALITY',
          priority: 'MEDIUM',
          status: 'ACTIVE',
          conditions: [
            {
              id: 'c3',
              field: 'qualityScore',
              operator: 'LESS_THAN',
              value: 80
            }
          ],
          actions: [
            {
              id: 'a3',
              type: 'REMEDIATE',
              parameters: { workflow: 'data-quality-fix' },
              priority: 1,
              automated: true
            }
          ],
          schedule: 'DAILY',
          effectiveness: 76,
          violations: 23,
          lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000),
          createdBy: 'Data Team',
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          aiGenerated: false
        }
      ];

      // Generate sample templates
      const templatesData: PolicyTemplate[] = [
        {
          id: 'tmpl1',
          name: 'GDPR Compliance Template',
          description: 'Complete GDPR compliance policy set',
          category: 'REGULATORY',
          framework: 'GDPR',
          rules: [
            { name: 'Data Consent Validation', type: 'DETECTIVE' },
            { name: 'Right to be Forgotten', type: 'CORRECTIVE' },
            { name: 'Data Breach Notification', type: 'DETECTIVE' }
          ],
          aiRecommended: true
        },
        {
          id: 'tmpl2',
          name: 'SOX Compliance Template',
          description: 'Sarbanes-Oxley compliance policies',
          category: 'FINANCIAL',
          framework: 'SOX',
          rules: [
            { name: 'Financial Data Access Control', type: 'PREVENTIVE' },
            { name: 'Audit Trail Monitoring', type: 'DETECTIVE' }
          ],
          aiRecommended: true
        }
      ];

      // Generate sample executions
      const executionsData: PolicyExecution[] = [
        {
          id: 'exec1',
          policyId: 'pol1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'SUCCESS',
          affectedEntities: 15,
          actionsExecuted: 2,
          duration: 245,
          details: 'Blocked unauthorized PII access attempts'
        },
        {
          id: 'exec2',
          policyId: 'pol2',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'SUCCESS',
          affectedEntities: 8,
          actionsExecuted: 1,
          duration: 120,
          details: 'GDPR compliance check completed'
        }
      ];

      setPolicies(policiesData);
      setTemplates(templatesData);
      setExecutions(executionsData);

    } catch (error) {
      console.error('Error loading policy data:', error);
    }
  };

  // AI-powered policy generation
  const generateAIPolicy = async (description: string, category: string) => {
    setAiGenerating(true);
    try {
      // Simulate AI policy generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const aiPolicy: PolicyRule = {
        id: `ai-pol-${Date.now()}`,
        name: `AI Generated: ${description}`,
        description: `Auto-generated policy for ${description.toLowerCase()}`,
        type: 'DETECTIVE',
        category: category.toUpperCase(),
        priority: 'MEDIUM',
        status: 'DRAFT',
        conditions: [
          {
            id: `ai-c-${Date.now()}`,
            field: 'riskLevel',
            operator: 'GREATER_THAN',
            value: 70
          }
        ],
        actions: [
          {
            id: `ai-a-${Date.now()}`,
            type: 'ALERT',
            parameters: { aiGenerated: true },
            priority: 1,
            automated: true
          }
        ],
        schedule: 'CONTINUOUS',
        effectiveness: Math.floor(Math.random() * 20) + 80,
        violations: 0,
        createdBy: 'AI Assistant',
        createdAt: new Date(),
        aiGenerated: true
      };

      setPolicies(prev => [aiPolicy, ...prev]);
      setNewPolicy(aiPolicy);
      setShowCreateDialog(true);

    } catch (error) {
      console.error('Error generating AI policy:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  // Execute policy
  const executePolicy = async (policyId: string) => {
    setIsExecuting(true);
    try {
      // Start workflow execution
      await complianceWorkflowEngine.startWorkflow('policy-execution', {
        policyId,
        timestamp: new Date()
      });

      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      const execution: PolicyExecution = {
        id: `exec-${Date.now()}`,
        policyId,
        timestamp: new Date(),
        status: 'SUCCESS',
        affectedEntities: Math.floor(Math.random() * 20) + 1,
        actionsExecuted: Math.floor(Math.random() * 5) + 1,
        duration: Math.floor(Math.random() * 300) + 100,
        details: 'Policy executed successfully'
      };

      setExecutions(prev => [execution, ...prev]);

      // Update policy last triggered
      setPolicies(prev => prev.map(p => 
        p.id === policyId 
          ? { ...p, lastTriggered: new Date() }
          : p
      ));

    } catch (error) {
      console.error('Error executing policy:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  // Filter policies
  const filteredPolicies = useMemo(() => {
    return policies.filter(policy => {
      const matchesSearch = searchTerm === '' || 
        policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || policy.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [policies, searchTerm, filterCategory, filterStatus]);

  // Policy effectiveness data
  const effectivenessData = useMemo(() => {
    return policies.map(policy => ({
      name: policy.name.substring(0, 20) + '...',
      effectiveness: policy.effectiveness,
      violations: policy.violations
    }));
  }, [policies]);

  // Policy type distribution
  const typeDistribution = useMemo(() => {
    const distribution = policies.reduce((acc, policy) => {
      acc[policy.type] = (acc[policy.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([type, count]) => ({
      name: type,
      value: count
    }));
  }, [policies]);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'TESTING': return 'bg-blue-100 text-blue-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Policy Automation</h1>
          <p className="text-muted-foreground">
            AI-powered policy creation, enforcement, and monitoring
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => generateAIPolicy('Smart Security Policy', 'SECURITY')} 
            variant="outline" 
            size="sm"
            disabled={aiGenerating}
          >
            <Brain className={`h-4 w-4 mr-2 ${aiGenerating ? 'animate-pulse' : ''}`} />
            {aiGenerating ? 'Generating...' : 'AI Generate'}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} variant="default" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
          <Button onClick={() => setShowTemplateDialog(true)} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Gavel className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {policies.filter(p => p.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {policies.length} total policies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
            <Robot className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {policies.filter(p => p.aiGenerated).length}
            </div>
            <p className="text-xs text-muted-foreground">
              AI-powered policies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Effectiveness</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {policies.length > 0 ? 
                Math.round(policies.reduce((sum, p) => sum + p.effectiveness, 0) / policies.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Policy effectiveness
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executions.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="PRIVACY">Privacy</SelectItem>
                <SelectItem value="REGULATORY">Regulatory</SelectItem>
                <SelectItem value="SECURITY">Security</SelectItem>
                <SelectItem value="QUALITY">Quality</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="TESTING">Testing</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Policies List */}
          <div className="space-y-4">
            {filteredPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{policy.name}</CardTitle>
                        {policy.aiGenerated && (
                          <Badge variant="outline" className="text-purple-600">
                            <Robot className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{policy.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(policy.priority)}>
                        {policy.priority}
                      </Badge>
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Policy Metrics */}
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-1">Effectiveness</div>
                        <div className="text-2xl font-bold">{policy.effectiveness}%</div>
                        <Progress value={policy.effectiveness} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Violations</div>
                        <div className="text-2xl font-bold">{policy.violations}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Type</div>
                        <div className="text-sm">{policy.type}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Schedule</div>
                        <div className="text-sm">{policy.schedule}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {policy.lastTriggered 
                          ? `Last triggered: ${policy.lastTriggered.toLocaleString()}`
                          : 'Never triggered'
                        }
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => executePolicy(policy.id)}
                          variant="outline"
                          size="sm"
                          disabled={isExecuting}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Execute
                        </Button>
                        <Button
                          onClick={() => setSelectedPolicy(policy)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions" className="space-y-4">
          <div className="space-y-4">
            {executions.map((execution) => (
              <Card key={execution.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {policies.find(p => p.id === execution.policyId)?.name || 'Unknown Policy'}
                      </CardTitle>
                      <CardDescription>
                        Executed at {execution.timestamp.toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge variant={execution.status === 'SUCCESS' ? 'default' : 'destructive'}>
                      {execution.status === 'SUCCESS' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {execution.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-1">Affected Entities</div>
                      <div className="text-2xl font-bold">{execution.affectedEntities}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Actions Executed</div>
                      <div className="text-2xl font-bold">{execution.actionsExecuted}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Duration</div>
                      <div className="text-2xl font-bold">{execution.duration}ms</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Details</div>
                      <div className="text-sm">{execution.details}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Policy Effectiveness Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Effectiveness</CardTitle>
                <CardDescription>Effectiveness and violations by policy</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={effectivenessData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="effectiveness" fill="#22c55e" name="Effectiveness %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Policy Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Type Distribution</CardTitle>
                <CardDescription>Distribution of policy types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{template.name}</CardTitle>
                    {template.aiRecommended && (
                      <Badge variant="outline" className="text-purple-600">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Recommended
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-1">Framework</div>
                      <Badge variant="outline">{template.framework}</Badge>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Included Rules:</div>
                      <ul className="text-sm space-y-1">
                        {template.rules.map((rule, index) => (
                          <li key={index} className="flex items-center">
                            <Gavel className="h-3 w-3 mr-2 text-blue-600" />
                            {rule.name} ({rule.type})
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button className="w-full" size="sm">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Policy Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Policy</DialogTitle>
            <DialogDescription>
              Define a new compliance policy with automated enforcement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policyName">Policy Name</Label>
                <Input
                  id="policyName"
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                  placeholder="Enter policy name"
                />
              </div>
              <div>
                <Label htmlFor="policyType">Policy Type</Label>
                <Select 
                  value={newPolicy.type} 
                  onValueChange={(value: any) => setNewPolicy({ ...newPolicy, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                    <SelectItem value="DETECTIVE">Detective</SelectItem>
                    <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="policyDescription">Description</Label>
              <Textarea
                id="policyDescription"
                value={newPolicy.description}
                onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                placeholder="Describe the policy purpose and scope"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policyCategory">Category</Label>
                <Input
                  id="policyCategory"
                  value={newPolicy.category}
                  onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })}
                  placeholder="e.g., PRIVACY, SECURITY"
                />
              </div>
              <div>
                <Label htmlFor="policyPriority">Priority</Label>
                <Select 
                  value={newPolicy.priority} 
                  onValueChange={(value: any) => setNewPolicy({ ...newPolicy, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCreateDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={() => {
              // Add policy creation logic here
              setShowCreateDialog(false);
            }}>
              Create Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PolicyAutomation;