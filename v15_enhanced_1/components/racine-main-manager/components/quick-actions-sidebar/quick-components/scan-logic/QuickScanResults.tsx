'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  FileText, CheckCircle, AlertTriangle, Info, Eye, Download,
  X, Database, Shield, Users, Search, Filter, Star
} from 'lucide-react';

interface QuickScanResultsProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickScanResults: React.FC<QuickScanResultsProps> = ({
  isVisible, onClose, className = '',
}) => {
  const [activeTab, setActiveTab] = useState<string>('findings');
  
  const findings = [
    { type: 'PII', count: 245, severity: 'high', assets: ['user_table', 'customer_data'] },
    { type: 'GDPR', count: 89, severity: 'medium', assets: ['email_logs', 'preferences'] },
    { type: 'Quality', count: 156, severity: 'low', assets: ['analytics_data'] },
  ];

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Scan Results</h2>
              <p className="text-sm text-gray-500">Analysis & findings</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="findings">Findings</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="findings" className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">245</div>
                  <div className="text-xs text-gray-500">High Risk</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">89</div>
                  <div className="text-xs text-gray-500">Medium Risk</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">156</div>
                  <div className="text-xs text-gray-500">Low Risk</div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Critical Findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-3">
                      {findings.map((finding, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(finding.severity)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4" />
                              <span className="font-medium text-sm">{finding.type}</span>
                            </div>
                            <Badge variant={finding.severity === 'high' ? 'destructive' : 'secondary'}>
                              {finding.count} issues
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            Assets: {finding.assets.join(', ')}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">Severity: {finding.severity}</span>
                            <Button size="sm" variant="ghost" className="h-6 text-xs">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Scan Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Assets Scanned</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Issues Found</span>
                    <span className="font-medium">490</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Compliance Score</span>
                    <span className="font-medium text-green-600">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Scan Duration</span>
                    <span className="font-medium">23 minutes</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Top Assets by Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {[
                        { name: 'user_credentials', risk: 'high', issues: 45 },
                        { name: 'payment_data', risk: 'high', issues: 38 },
                        { name: 'customer_info', risk: 'medium', issues: 23 },
                        { name: 'analytics_logs', risk: 'low', issues: 12 },
                      ].map((asset, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <Database className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{asset.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={asset.risk === 'high' ? 'destructive' : 'secondary'}>
                              {asset.issues} issues
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickScanResults;