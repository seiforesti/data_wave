'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  GitBranch, Database, Table, BarChart3, FileText, Network, Layers,
  ArrowRight, ArrowLeft, Target, Search, Filter, RefreshCw, Download,
  Share, Eye, Settings, X, Maximize, Minimize, ZoomIn, ZoomOut,
  RotateCw, Play, Pause, AlertTriangle, Info, CheckCircle,
  Clock, User, Tag, Zap, Brain, Sparkles, Activity, TrendingUp
} from 'lucide-react';

import { useAdvancedCatalog } from '../../../hooks/useAdvancedCatalog';
import { useWorkspaceManagement } from '../../../hooks/useWorkspaceManagement';
import { useActivityTracking } from '../../../hooks/useActivityTracking';

interface QuickLineageViewProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickLineageView: React.FC<QuickLineageViewProps> = ({
  isVisible, onClose, className = '',
}) => {
  const [activeTab, setActiveTab] = useState<string>('graph');
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [lineageDepth, setLineageDepth] = useState<number>(3);
  const [showImpactAnalysis, setShowImpactAnalysis] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { getDataLineage, catalogAssets, loading } = useAdvancedCatalog();
  const { currentWorkspace } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracking();

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  useEffect(() => {
    if (isVisible) {
      trackActivity({
        action: 'quick_lineage_view_opened',
        component: 'QuickLineageView',
        metadata: { workspace: currentWorkspace?.id },
      });
    }
  }, [isVisible, currentWorkspace, trackActivity]);

  const renderGraphTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Asset Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger>
              <SelectValue placeholder="Select asset to trace" />
            </SelectTrigger>
            <SelectContent>
              {catalogAssets?.slice(0, 10).map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Lineage Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center text-gray-500">
              <GitBranch className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Interactive lineage graph will appear here</p>
              <p className="text-xs mt-1">Select an asset to view its data lineage</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Label className="text-xs">Depth:</Label>
              <Select value={lineageDepth.toString()} onValueChange={(v) => setLineageDepth(parseInt(v))}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="outline"><ZoomIn className="h-3 w-3" /></Button>
              <Button size="sm" variant="outline"><ZoomOut className="h-3 w-3" /></Button>
              <Button size="sm" variant="outline"><RotateCw className="h-3 w-3" /></Button>
              <Button size="sm" variant="outline"><Maximize className="h-3 w-3" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Lineage Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-xs text-gray-500">Upstream</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-xs text-gray-500">Downstream</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">4</div>
              <div className="text-xs text-gray-500">Transforms</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderImpactTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Impact Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { asset: 'customer_orders', impact: 'high', type: 'table', affected: 15 },
              { asset: 'sales_dashboard', impact: 'medium', type: 'dashboard', affected: 8 },
              { asset: 'monthly_report', impact: 'low', type: 'report', affected: 3 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">{item.asset}</div>
                    <div className="text-xs text-gray-500">{item.affected} assets affected</div>
                  </div>
                </div>
                <Badge variant={item.impact === 'high' ? 'destructive' : item.impact === 'medium' ? 'default' : 'secondary'}>
                  {item.impact} impact
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Dependencies</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {['user_events', 'product_catalog', 'inventory_data', 'payment_logs'].map((dep, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{dep}</span>
                  <Badge variant="outline">critical</Badge>
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <GitBranch className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Data Lineage</h2>
              <p className="text-sm text-gray-500">Trace data dependencies</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="graph">Lineage Graph</TabsTrigger>
              <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="graph">{renderGraphTab()}</TabsContent>
            <TabsContent value="impact">{renderImpactTab()}</TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickLineageView;