'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  BarChart3, TrendingUp, Users, Shield, Activity, 
  X, RefreshCw, Target, Award, AlertTriangle, Eye
} from 'lucide-react';

interface QuickRBACMetricsProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickRBACMetrics: React.FC<QuickRBACMetricsProps> = ({
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">RBAC Metrics</h2>
              <p className="text-sm text-gray-500">Access control analytics</p>
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
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900">Security Score</h3>
                  <p className="text-sm text-orange-600">Overall RBAC health</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-900">87%</div>
                <div className="flex items-center space-x-1 text-sm text-orange-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+3%</span>
                </div>
              </div>
            </div>
            <Progress value={87} className="h-3" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Active Users', value: '148', trend: '+5%', icon: Users },
              { name: 'Roles Assigned', value: '324', trend: '+12%', icon: Shield },
              { name: 'Permissions', value: '1,245', trend: '+8%', icon: Eye },
              { name: 'Access Requests', value: '23', trend: '-15%', icon: Activity },
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
                    <div className={`text-xs font-medium ${metric.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.trend}
                    </div>
                    {metric.trend.startsWith('+') ? 
                      <TrendingUp className="h-3 w-3 text-green-500" /> : 
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    }
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { role: 'Admin', count: 8, percentage: 15, color: 'bg-red-500' },
                  { role: 'Data Steward', count: 24, percentage: 35, color: 'bg-blue-500' },
                  { role: 'Analyst', count: 45, percentage: 40, color: 'bg-green-500' },
                  { role: 'Viewer', count: 71, percentage: 10, color: 'bg-gray-500' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded ${item.color}`} />
                      <span className="text-sm">{item.role}</span>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { type: 'Privileged Access', count: 3, severity: 'high' },
                  { type: 'Inactive Users', count: 12, severity: 'medium' },
                  { type: 'Permission Reviews', count: 8, severity: 'low' },
                ].map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className={`h-4 w-4 ${
                        alert.severity === 'high' ? 'text-red-500' :
                        alert.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <span className="text-sm">{alert.type}</span>
                    </div>
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                      {alert.count}
                    </Badge>
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

export default QuickRBACMetrics;