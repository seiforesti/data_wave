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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Download,
  Filter,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  Upload,
  Users,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import classificationApi from '@/api/classification.api';
import {
  ClassificationStats,
  ClassificationFramework,
  ClassificationRule,
  ClassificationResult,
  HealthCheckResult,
  SensitivityLevel,
  ConfidenceLevel
} from './types/classification.types';

const ClassificationDashboard: React.FC = () => {
  const [stats, setStats] = useState<ClassificationStats | null>(null);
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [frameworks, setFrameworks] = useState<ClassificationFramework[]>([]);
  const [recentResults, setRecentResults] = useState<ClassificationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, healthData, frameworksData, resultsData] = await Promise.all([
        classificationApi.getStats(),
        classificationApi.getHealthCheck(),
        classificationApi.getFrameworks({}, { page: 1, size: 5, sort_by: 'updated_at', sort_order: 'desc' }),
        classificationApi.getResults({}, { page: 1, size: 10, sort_by: 'applied_at', sort_order: 'desc' })
      ]);

      setStats(statsData);
      setHealth(healthData);
      setFrameworks(frameworksData.items);
      setRecentResults(resultsData.items);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast({
      title: 'Success',
      description: 'Dashboard data refreshed',
    });
  };

  const getSensitivityColor = (level: SensitivityLevel): string => {
    const colors = {
      public: 'bg-green-100 text-green-800',
      internal: 'bg-blue-100 text-blue-800',
      confidential: 'bg-yellow-100 text-yellow-800',
      restricted: 'bg-orange-100 text-orange-800',
      top_secret: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (level: ConfidenceLevel): string => {
    const colors = {
      low: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-blue-100 text-blue-800',
      very_high: 'bg-green-100 text-green-800',
      certain: 'bg-purple-100 text-purple-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading Classification Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classification Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor enterprise data classification across your organization
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Quick Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Plus className="h-4 w-4 mr-2" />
                Create Framework
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Target className="h-4 w-4 mr-2" />
                Create Rule
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Zap className="h-4 w-4 mr-2" />
                Apply Rules
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Health Status */}
      {health && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              {getHealthStatusIcon(health.status)}
              <span className="ml-2">System Health</span>
              <Badge className={`ml-auto ${
                health.status === 'healthy' ? 'bg-green-100 text-green-800' :
                health.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {health.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-sm">DB Connection: {health.database_connection ? 'OK' : 'Failed'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm">Response: {health.response_time_ms}ms</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Active Frameworks: {health.active_frameworks}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Background Tasks: {health.background_tasks}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Frameworks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_frameworks}</div>
              <p className="text-xs text-muted-foreground">
                Active classification frameworks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classification Rules</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_rules}</div>
              <p className="text-xs text-muted-foreground">
                Configured classification rules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classifications</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_classifications.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All-time classifications applied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Classifications</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.classifications_today}</div>
              <p className="text-xs text-muted-foreground">
                New classifications today
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="recent-activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="frameworks">Active Frameworks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Recent Activity */}
        <TabsContent value="recent-activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Classifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">{result.target_identifier}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.classification_value}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSensitivityColor(result.sensitivity_label)}>
                        {result.sensitivity_label}
                      </Badge>
                      <Badge className={getConfidenceColor(result.confidence_level)}>
                        {(result.confidence_score * 100).toFixed(1)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Frameworks */}
        <TabsContent value="frameworks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Classification Frameworks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frameworks.map((framework) => (
                  <div key={framework.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{framework.name}</h3>
                      <p className="text-sm text-muted-foreground">{framework.description}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Badge variant="outline">{framework.framework_type}</Badge>
                        <Badge variant="outline">v{framework.version}</Badge>
                        {framework.rules_count && (
                          <span className="text-xs text-muted-foreground">
                            {framework.rules_count} rules
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={framework.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {framework.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Framework</DropdownMenuItem>
                          <DropdownMenuItem>Apply Rules</DropdownMenuItem>
                          <DropdownMenuItem>View Analytics</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sensitivity Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sensitivity Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.top_sensitivity_labels.map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getSensitivityColor(item.label)}>
                            {item.label}
                          </Badge>
                          <span className="text-sm">{item.count.toLocaleString()}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Framework Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Framework Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.framework_distribution.map((item) => (
                      <div key={item.framework_name} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.framework_name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{item.count.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassificationDashboard;