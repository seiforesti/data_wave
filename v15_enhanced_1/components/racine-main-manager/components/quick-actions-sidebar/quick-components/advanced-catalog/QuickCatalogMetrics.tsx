'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  BarChart3, TrendingUp, TrendingDown, Target, Award, Clock, 
  ArrowUpRight, ArrowDownRight, Activity, Gauge, PieChart,
  RefreshCw, Download, X, Database, Eye, Search, Users, Heart
} from 'lucide-react';

import { useAdvancedCatalog } from '../../../hooks/useAdvancedCatalog';
import { useWorkspaceManagement } from '../../../hooks/useWorkspaceManagement';

interface QuickCatalogMetricsProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickCatalogMetrics: React.FC<QuickCatalogMetricsProps> = ({
  isVisible, onClose, className = '',
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<string>('7d');

  const { getCatalogMetrics, loading } = useAdvancedCatalog();
  const { currentWorkspace } = useWorkspaceManagement();

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const renderOverviewTab = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Catalog Health</h3>
              <p className="text-sm text-blue-600">Overall catalog performance</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-900">94%</div>
            <div className="flex items-center space-x-1 text-sm text-blue-600">
              <TrendingUp className="h-4 w-4" />
              <span>Excellent</span>
            </div>
          </div>
        </div>
        <Progress value={94} className="h-3" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { name: 'Total Assets', value: '2,847', trend: '+12%', icon: Database },
          { name: 'Active Users', value: '156', trend: '+8%', icon: Users },
          { name: 'Searches/Day', value: '1,234', trend: '+15%', icon: Search },
          { name: 'Favorites', value: '789', trend: '+5%', icon: Heart },
        ].map((metric, index) => (
          <Card key={index} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <metric.icon className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-bold text-lg">{metric.value}</div>
                  <div className="text-xs text-gray-500">{metric.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-600 font-medium">{metric.trend}</div>
                <TrendingUp className="h-3 w-3 text-green-500" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Asset Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: 'Tables', count: 1245, percentage: 44 },
              { type: 'Dashboards', count: 789, percentage: 28 },
              { type: 'Reports', count: 456, percentage: 16 },
              { type: 'Views', count: 357, percentage: 12 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }} />
                  <span className="text-sm">{item.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{item.count}</span>
                  <div className="w-16">
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsageTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Usage analytics chart</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Top Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {[
                { name: 'customer_analytics', views: 1247, type: 'dashboard' },
                { name: 'sales_pipeline', views: 892, type: 'report' },
                { name: 'user_events', views: 756, type: 'table' },
                { name: 'revenue_forecast', views: 634, type: 'model' },
              ].map((asset, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{asset.name}</div>
                    <div className="text-xs text-gray-500">{asset.type}</div>
                  </div>
                  <div className="text-sm font-bold">{asset.views} views</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`bg-white rounded-xl shadow-xl border border-gray-200 ${className}`}
        style={{ width: '420px', maxHeight: '85vh' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Catalog Metrics</h2>
              <p className="text-sm text-gray-500">Performance & usage analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1d</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
                <SelectItem value="90d">90d</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
            <TabsContent value="usage">{renderUsageTab()}</TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickCatalogMetrics;