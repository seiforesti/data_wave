'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  BarChart3, TrendingUp, TrendingDown, Clock, Target, Activity,
  X, RefreshCw, Gauge, Zap, Shield, Database, Award
} from 'lucide-react';

interface QuickScanMetricsProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickScanMetrics: React.FC<QuickScanMetricsProps> = ({
  isVisible, onClose, className = '',
}) => {
  const [timeRange, setTimeRange] = useState<string>('7d');

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
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
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Scan Metrics</h2>
              <p className="text-sm text-gray-500">Performance analytics</p>
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
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Gauge className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-900">Scan Efficiency</h3>
                  <p className="text-sm text-indigo-600">Overall performance score</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-900">92%</div>
                <div className="flex items-center space-x-1 text-sm text-indigo-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+5%</span>
                </div>
              </div>
            </div>
            <Progress value={92} className="h-3" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Avg Duration', value: '18m', trend: '-12%', icon: Clock, color: 'green' },
              { name: 'Success Rate', value: '98.5%', trend: '+2%', icon: Target, color: 'blue' },
              { name: 'Throughput', value: '2.3k/s', trend: '+15%', icon: Zap, color: 'purple' },
              { name: 'Coverage', value: '94%', trend: '+3%', icon: Shield, color: 'orange' },
            ].map((metric, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <metric.icon className={`h-4 w-4 text-${metric.color}-500`} />
                    <div>
                      <div className="font-bold text-lg">{metric.value}</div>
                      <div className="text-xs text-gray-500">{metric.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium ${metric.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.trend}
                    </div>
                    {metric.trend.startsWith('+') ? 
                      <TrendingUp className="h-3 w-3 text-green-500" /> : 
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    }
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Scan Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Performance trend chart</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top Performing Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: 'Full Workspace Scan', score: 96, duration: '15m' },
                  { name: 'PII Detection', score: 94, duration: '8m' },
                  { name: 'Compliance Check', score: 91, duration: '12m' },
                ].map((scan, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{scan.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{scan.duration}</span>
                      <span className="text-sm font-bold text-green-600">{scan.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickScanMetrics;