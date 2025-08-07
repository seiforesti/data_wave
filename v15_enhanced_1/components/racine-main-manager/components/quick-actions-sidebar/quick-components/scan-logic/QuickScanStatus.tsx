'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Activity, Play, Pause, Stop, Clock, CheckCircle, AlertTriangle,
  X, RefreshCw, Database, Shield, Target, Eye, BarChart3
} from 'lucide-react';

import { useScanLogic } from '../../../hooks/useScanLogic';

interface QuickScanStatusProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickScanStatus: React.FC<QuickScanStatusProps> = ({
  isVisible, onClose, className = '',
}) => {
  const [activeScans] = useState([
    { id: '1', name: 'Full Workspace Scan', progress: 65, status: 'running', eta: '12 min' },
    { id: '2', name: 'Compliance Check', progress: 100, status: 'completed', eta: '0 min' },
    { id: '3', name: 'PII Detection', progress: 30, status: 'running', eta: '25 min' },
  ]);

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'border-blue-500 bg-blue-50';
      case 'completed': return 'border-green-500 bg-green-50';
      case 'failed': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Scan Status</h2>
              <p className="text-sm text-gray-500">Monitor active scans</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-xs text-gray-500">Active Scans</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">1</div>
              <div className="text-xs text-gray-500">Queued</div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Active Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {activeScans.map((scan) => (
                    <div key={scan.id} className={`p-4 rounded-lg border-2 ${getStatusColor(scan.status)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(scan.status)}
                          <div>
                            <div className="font-medium text-sm">{scan.name}</div>
                            <div className="text-xs text-gray-500">ETA: {scan.eta}</div>
                          </div>
                        </div>
                        <Badge variant={scan.status === 'running' ? 'default' : 'secondary'}>
                          {scan.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{scan.progress}%</span>
                        </div>
                        <Progress value={scan.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Database className="h-3 w-3" />
                          <span>1,234 assets</span>
                          <Shield className="h-3 w-3" />
                          <span>45 rules</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                          {scan.status === 'running' && (
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Pause className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold">2.3k</div>
                  <div className="text-xs text-gray-500">Records/sec</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">98.5%</div>
                  <div className="text-xs text-gray-500">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickScanStatus;