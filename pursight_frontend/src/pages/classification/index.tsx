import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ClassificationDashboard,
  ClassificationFrameworkManager,
  ClassificationRuleManager,
  ClassificationResults,
  ClassificationBulkUpload,
  ClassificationAuditTrail,
  ClassificationSettings,
  ClassificationApplier
} from '@/components/classification';
import {
  BarChart3,
  FileText,
  Target,
  Database,
  Upload,
  History,
  Settings,
  Zap
} from 'lucide-react';

const ClassificationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight">Data Classification</h1>
          <p className="text-lg text-muted-foreground">
            Enterprise-grade data classification and sensitivity labeling system
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="frameworks" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Frameworks</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Rules</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Results</span>
            </TabsTrigger>
            <TabsTrigger value="apply" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Apply</span>
            </TabsTrigger>
            <TabsTrigger value="bulk-upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Bulk Upload</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Audit</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ClassificationDashboard />
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-6">
            <ClassificationFrameworkManager />
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <ClassificationRuleManager />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <ClassificationResults />
          </TabsContent>

          <TabsContent value="apply" className="space-y-6">
            <ClassificationApplier />
          </TabsContent>

          <TabsContent value="bulk-upload" className="space-y-6">
            <ClassificationBulkUpload />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <ClassificationAuditTrail />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <ClassificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClassificationPage;