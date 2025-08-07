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
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Play, Pause, Stop, Settings, Target, Database, Search, Filter,
  Clock, Calendar, Zap, Brain, Activity, RefreshCw, X, CheckCircle,
  AlertTriangle, Info, BarChart3, Users, Shield, Eye
} from 'lucide-react';

import { useScanLogic } from '../../../hooks/useScanLogic';
import { useWorkspaceManagement } from '../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { useActivityTracking } from '../../../hooks/useActivityTracking';

interface QuickScanStartProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickScanStart: React.FC<QuickScanStartProps> = ({
  isVisible, onClose, className = '',
}) => {
  const [activeTab, setActiveTab] = useState<string>('quick');
  const [scanConfig, setScanConfig] = useState({
    type: 'full',
    sources: [],
    rules: [],
    schedule: false,
    parallel: true,
    aiEnhanced: true,
  });
  const [isStarting, setIsStarting] = useState(false);
  const [progress, setProgress] = useState(0);

  const { startScan, getScanTemplates, loading } = useScanLogic();
  const { currentWorkspace } = useWorkspaceManagement();
  const { currentUser } = useUserManagement();
  const { trackActivity } = useActivityTracking();

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const handleStartScan = useCallback(async () => {
    if (!currentWorkspace) return;
    
    setIsStarting(true);
    setProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => prev < 90 ? prev + Math.random() * 10 : prev);
      }, 500);

      await startScan({
        workspaceId: currentWorkspace.id,
        ...scanConfig,
      });

      clearInterval(progressInterval);
      setProgress(100);

      trackActivity({
        action: 'scan_started',
        component: 'QuickScanStart',
        metadata: { workspace: currentWorkspace.id, scanType: scanConfig.type },
      });

      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Scan start failed:', error);
    } finally {
      setIsStarting(false);
    }
  }, [currentWorkspace, scanConfig, startScan, trackActivity, onClose]);

  const renderQuickTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Scan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Scan Type</Label>
            <Select value={scanConfig.type} onValueChange={(value) => setScanConfig(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Workspace Scan</SelectItem>
                <SelectItem value="incremental">Incremental Scan</SelectItem>
                <SelectItem value="targeted">Targeted Scan</SelectItem>
                <SelectItem value="compliance">Compliance Scan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="parallel">Parallel Processing</Label>
              <Switch
                id="parallel"
                checked={scanConfig.parallel}
                onCheckedChange={(checked) => setScanConfig(prev => ({ ...prev, parallel: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-enhanced">AI Enhanced</Label>
              <Switch
                id="ai-enhanced"
                checked={scanConfig.aiEnhanced}
                onCheckedChange={(checked) => setScanConfig(prev => ({ ...prev, aiEnhanced: checked }))}
              />
            </div>
          </div>

          {isStarting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Starting scan...</span>
                <span className="text-sm">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Scan Scope</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Database className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-lg font-bold">245</div>
              <div className="text-xs text-gray-500">Data Sources</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Shield className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-lg font-bold">1,234</div>
              <div className="text-xs text-gray-500">Assets to Scan</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-2">
        <Button
          onClick={handleStartScan}
          disabled={isStarting}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          {isStarting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Scan
            </>
          )}
        </Button>
        <Button variant="outline" disabled={isStarting}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {['Production DB', 'Analytics Warehouse', 'S3 Data Lake', 'API Endpoints'].map((source, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox />
                  <Label className="text-sm">{source}</Label>
                  <Badge variant="outline" className="text-xs">connected</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Scan Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {['PII Detection', 'GDPR Compliance', 'Data Quality', 'Schema Validation'].map((rule, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox defaultChecked />
                  <Label className="text-sm">{rule}</Label>
                  <Badge variant="secondary" className="text-xs">active</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Schedule Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="schedule">Enable Scheduling</Label>
            <Switch
              id="schedule"
              checked={scanConfig.schedule}
              onCheckedChange={(checked) => setScanConfig(prev => ({ ...prev, schedule: checked }))}
            />
          </div>
          {scanConfig.schedule && (
            <div className="space-y-2">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Start Scan</h2>
              <p className="text-sm text-gray-500">Initiate data discovery scan</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick">Quick Start</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="quick">{renderQuickTab()}</TabsContent>
            <TabsContent value="advanced">{renderAdvancedTab()}</TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickScanStart;