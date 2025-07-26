/**
 * Advanced Scan Rule Sets SPA
 * 
 * Master orchestration component for the Advanced Scan Rule Sets system
 */

import React, { useState, useEffect, useCallback } from 'react';

// Import hooks
import { useScanRules } from '../hooks/useScanRules';
import { useOrchestration } from '../hooks/useOrchestration';
import { useOptimization } from '../hooks/useOptimization';
import { useIntelligence } from '../hooks/useIntelligence';
import { useCollaboration } from '../hooks/useCollaboration';
import { useReporting } from '../hooks/useReporting';
import { usePatternLibrary } from '../hooks/usePatternLibrary';
import { useValidation } from '../hooks/useValidation';

// Import utilities
import { aiHelper } from '../utils/ai-helpers';
import { performanceCalculator } from '../utils/performance-calculator';
import { ruleParser } from '../utils/rule-parser';
import { workflowEngine } from '../utils/workflow-engine';

// Import types
import type { ScanRuleSet } from '../types/scan-rules.types';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ScanRuleSetsSPA: React.FC = () => {
  // State management
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedRuleSet, setSelectedRuleSet] = useState<ScanRuleSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Custom hooks
  const scanRulesHook = useScanRules();
  const orchestrationHook = useOrchestration();
  const optimizationHook = useOptimization();
  const intelligenceHook = useIntelligence();
  const collaborationHook = useCollaboration();
  const reportingHook = useReporting();
  const patternLibraryHook = usePatternLibrary();
  const validationHook = useValidation();
  
  // Initialize data
  useEffect(() => {
    initializeData();
  }, []);
  
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load initial data
      await Promise.all([
        scanRulesHook.loadScanRuleSets(),
        orchestrationHook.loadOrchestrationJobs(),
        optimizationHook.loadOptimizationJobs(),
        intelligenceHook.loadIntelligenceData(),
        collaborationHook.loadCollaborationData(),
        reportingHook.loadReportingData(),
        patternLibraryHook.loadPatternLibraries(),
        validationHook.loadValidationEngines()
      ]);
      
    } catch (error) {
      console.error('Failed to initialize data:', error);
      setErrors(['Failed to initialize application']);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Navigation
  const navigateToView = useCallback((view: string) => {
    setCurrentView(view);
  }, []);
  
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed]);
  
  // Selection
  const selectRuleSet = useCallback((ruleSet: ScanRuleSet) => {
    setSelectedRuleSet(ruleSet);
  }, []);
  
  // Error handling
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);
  
  // Render methods
  const renderHeader = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <span className="text-xl">☰</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Advanced Scan Rule Sets
          </h1>
          {realTimeUpdates && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Live
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Auto-refresh:</span>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Real-time:</span>
            <input
              type="checkbox"
              checked={realTimeUpdates}
              onChange={(e) => setRealTimeUpdates(e.target.checked)}
              className="rounded"
            />
          </div>
        </div>
      </div>
    </header>
  );
  
  const renderSidebar = () => (
    <aside className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      <nav className="p-4">
        <ul className="space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'rule-designer', label: 'Rule Designer', icon: '🎨' },
            { id: 'orchestration', label: 'Orchestration', icon: '⚡' },
            { id: 'optimization', label: 'Optimization', icon: '🔬' },
            { id: 'intelligence', label: 'Intelligence', icon: '🧠' },
            { id: 'collaboration', label: 'Collaboration', icon: '👥' },
            { id: 'reporting', label: 'Reporting', icon: '📈' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(item => (
            <li key={item.id}>
              <button
                onClick={() => navigateToView(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
  
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Rule Sets</h3>
          <p className="text-3xl font-bold text-blue-600">
            {scanRulesHook.scanRuleSets.length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Active Jobs</h3>
          <p className="text-3xl font-bold text-green-600">
            {orchestrationHook.orchestrationJobs.length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Optimization Jobs</h3>
          <p className="text-3xl font-bold text-purple-600">
            {optimizationHook.optimizationJobs.length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Pattern Libraries</h3>
          <p className="text-3xl font-bold text-orange-600">
            {patternLibraryHook.patternLibraries.length}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Rule Sets</h3>
          <div className="space-y-3">
            {scanRulesHook.scanRuleSets.slice(0, 5).map(ruleSet => (
              <div
                key={ruleSet.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => selectRuleSet(ruleSet)}
              >
                <div>
                  <h4 className="font-medium text-gray-900">{ruleSet.name}</h4>
                  <p className="text-sm text-gray-500">{ruleSet.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ruleSet.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {ruleSet.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
          <div className="space-y-3">
            {orchestrationHook.orchestrationJobs.slice(0, 5).map(job => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{job.name}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  job.status === 'completed' ? 'bg-green-100 text-green-800' :
                  job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderRuleDesigner = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Rule Designer</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Create New Rule
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">
          Advanced rule design interface with AI-powered suggestions and real-time validation.
        </p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Data Quality</h4>
              <p className="text-sm text-gray-500">Completeness, accuracy, consistency</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Business Logic</h4>
              <p className="text-sm text-gray-500">Policy compliance, workflow validation</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Security</h4>
              <p className="text-sm text-gray-500">PII detection, encryption validation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderOrchestration = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Orchestration Center</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
          New Workflow
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">
          Enterprise workflow orchestration with advanced scheduling and resource management.
        </p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Workflows</h3>
          <div className="space-y-2">
            {orchestrationHook.orchestrationJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">{job.name}</h4>
                  <p className="text-sm text-gray-500">{job.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  job.status === 'running' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderOptimization = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Optimization Engine</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
          Start Optimization
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">
          AI-powered optimization with genetic algorithms and performance tuning.
        </p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimization Jobs</h3>
          <div className="space-y-2">
            {optimizationHook.optimizationJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">{job.name}</h4>
                  <p className="text-sm text-gray-500">{job.description}</p>
                </div>
                <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderIntelligence = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Intelligence Center</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Analyze Patterns
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">
          Machine learning-powered pattern recognition and predictive analytics.
        </p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Pattern Detection</h4>
              <p className="text-sm text-gray-500">Automated pattern recognition</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Predictive Analytics</h4>
              <p className="text-sm text-gray-500">Future trend predictions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderCollaboration = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Collaboration Hub</h2>
        <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
          New Team
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">
          Team collaboration with real-time communication and knowledge sharing.
        </p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Activities</h3>
          <div className="space-y-2">
            {collaborationHook.collaborationData.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-medium">T</span>
                </div>
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderReporting = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reporting & Analytics</h2>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">
          Generate Report
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">
          Comprehensive reporting with advanced analytics and executive dashboards.
        </p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Performance Report</h4>
              <p className="text-sm text-gray-500">System performance metrics</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Compliance Report</h4>
              <p className="text-sm text-gray-500">Regulatory compliance status</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Usage Analytics</h4>
              <p className="text-sm text-gray-500">User activity and patterns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Real-time Updates</span>
            <input
              type="checkbox"
              checked={realTimeUpdates}
              onChange={(e) => setRealTimeUpdates(e.target.checked)}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Auto-refresh</span>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Analytics</span>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Notifications</span>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'rule-designer':
        return renderRuleDesigner();
      case 'orchestration':
        return renderOrchestration();
      case 'optimization':
        return renderOptimization();
      case 'intelligence':
        return renderIntelligence();
      case 'collaboration':
        return renderCollaboration();
      case 'reporting':
        return renderReporting();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };
  
  const renderNotifications = () => (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {errors.map((error, index) => (
        <div
          key={index}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setErrors(errors.filter((_, i) => i !== index))}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
  
  // Main render
  return (
    <div className="flex h-screen bg-gray-100">
      {renderSidebar()}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderHeader()}
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading Advanced Scan Rule Sets...</p>
                </div>
              </div>
            ) : (
              renderCurrentView()
            )}
          </div>
        </main>
      </div>
      
      {renderNotifications()}
    </div>
  );
};

export default ScanRuleSetsSPA;