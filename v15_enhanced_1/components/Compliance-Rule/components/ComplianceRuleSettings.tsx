"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Settings, Shield, Bell, Database, Users, Lock, Globe,
  Save, RefreshCw, Download, Upload, AlertTriangle, CheckCircle,
  Server, Cloud, Boxes, Key, Monitor, Wifi, HardDrive
} from "lucide-react"

// Enterprise Integration
import { useEnterpriseFeatures } from '../hooks/use-enterprise-features'
import { useEnterpriseCompliance } from '../enterprise-integration'
import { ComplianceAPIs } from '../services/enterprise-apis'

interface ComplianceRuleSettingsProps {
  dataSourceId?: number
}

const ComplianceRuleSettings: React.FC<ComplianceRuleSettingsProps> = ({ dataSourceId }) => {
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const enterprise = useEnterpriseCompliance()
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'ComplianceRuleSettings',
    dataSourceId,
    enableMonitoring: true
  })

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        
        // Load current configuration from enterprise integration
        const currentConfig = enterprise.config
        const systemHealth = enterprise.systemHealth
        const performanceMetrics = enterprise.performanceMetrics
        
        // Load additional settings from API
        const [
          integrationSettings,
          notificationSettings,
          securitySettings,
          frameworkSettings
        ] = await Promise.all([
          fetch('/api/compliance/settings/integrations').then(res => res.ok ? res.json() : {}),
          fetch('/api/compliance/settings/notifications').then(res => res.ok ? res.json() : {}),
          fetch('/api/compliance/settings/security').then(res => res.ok ? res.json() : {}),
          fetch('/api/compliance/settings/frameworks').then(res => res.ok ? res.json() : {})
        ])

        setSettings({
          general: {
            companyName: 'Enterprise Corp',
            complianceOfficer: 'John Doe',
            defaultFramework: 'SOC 2',
            dataRetentionDays: 2555,
            autoAssessment: true,
            realTimeMonitoring: currentConfig.monitoring.enableRealTimeMonitoring,
            aiInsights: currentConfig.analytics.enableAiInsights,
            ...currentConfig
          },
          integrations: {
            enableWebhooks: true,
            webhookUrl: 'https://api.company.com/webhooks/compliance',
            apiRateLimit: 1000,
            enableSso: true,
            ssoProvider: 'okta',
            enableAuditLogging: true,
            ...integrationSettings
          },
          notifications: {
            emailNotifications: true,
            slackNotifications: false,
            teamsNotifications: true,
            smsNotifications: false,
            notificationFrequency: 'immediate',
            escalationEnabled: true,
            escalationThreshold: 24,
            ...notificationSettings
          },
          security: {
            encryptionEnabled: true,
            encryptionAlgorithm: 'AES-256',
            accessControlEnabled: true,
            mfaRequired: true,
            sessionTimeout: 480,
            passwordPolicy: 'strong',
            dataClassification: true,
            ...securitySettings
          },
          frameworks: {
            enabledFrameworks: ['SOC 2', 'GDPR', 'HIPAA', 'ISO 27001'],
            autoImport: true,
            crosswalkMapping: true,
            customFrameworks: false,
            assessmentFrequency: 'quarterly',
            ...frameworkSettings
          },
          performance: {
            cacheEnabled: true,
            cacheTtl: 300,
            batchSize: 100,
            maxConcurrentRequests: 10,
            enableCompression: true,
            enableCdn: false,
            ...performanceMetrics
          },
          system: {
            status: systemHealth.status,
            uptime: systemHealth.uptime,
            latency: systemHealth.latency,
            errorRate: systemHealth.errorRate,
            version: '2.1.0',
            lastUpdated: new Date().toISOString()
          }
        })

      } catch (error) {
        console.error('Failed to load settings:', error)
        enterprise.sendNotification('error', 'Failed to load settings')
        
        // Set default settings
        setSettings({
          general: {
            companyName: '',
            complianceOfficer: '',
            defaultFramework: 'SOC 2',
            dataRetentionDays: 2555,
            autoAssessment: false,
            realTimeMonitoring: false,
            aiInsights: false
          },
          integrations: {},
          notifications: {},
          security: {},
          frameworks: {},
          performance: {},
          system: {}
        })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [enterprise, dataSourceId])

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      
      // Update enterprise configuration
      await enterprise.updateConfig({
        monitoring: {
          ...enterprise.config.monitoring,
          enableRealTimeMonitoring: settings.general.realTimeMonitoring
        },
        analytics: {
          ...enterprise.config.analytics,
          enableAiInsights: settings.general.aiInsights
        }
      })

      // Save settings to API
      await Promise.all([
        fetch('/api/compliance/settings/integrations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings.integrations)
        }),
        fetch('/api/compliance/settings/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings.notifications)
        }),
        fetch('/api/compliance/settings/security', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings.security)
        }),
        fetch('/api/compliance/settings/frameworks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings.frameworks)
        })
      ])

      enterprise.sendNotification('success', 'Settings saved successfully')
      
    } catch (error) {
      console.error('Failed to save settings:', error)
      enterprise.sendNotification('error', 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleResetSettings = () => {
    setSettings({
      general: {
        companyName: '',
        complianceOfficer: '',
        defaultFramework: 'SOC 2',
        dataRetentionDays: 2555,
        autoAssessment: false,
        realTimeMonitoring: false,
        aiInsights: false
      },
      integrations: {},
      notifications: {},
      security: {},
      frameworks: {},
      performance: {},
      system: {}
    })
    enterprise.sendNotification('info', 'Settings reset to defaults')
  }

  const handleTestIntegration = async (integrationId: number) => {
    try {
      const result = await ComplianceAPIs.Integration.testIntegration(integrationId)
      if (result.status === 'success') {
        enterprise.sendNotification('success', 'Integration test successful')
      } else {
        enterprise.sendNotification('error', `Integration test failed: ${result.error_message}`)
      }
    } catch (error) {
      console.error('Failed to test integration:', error)
      enterprise.sendNotification('error', 'Failed to test integration')
    }
  }

  const handleExportSettings = async () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `compliance-settings-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      enterprise.sendNotification('success', 'Settings exported successfully')
    } catch (error) {
      console.error('Failed to export settings:', error)
      enterprise.sendNotification('error', 'Failed to export settings')
    }
  }

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedSettings = JSON.parse(text)
      setSettings(importedSettings)
      enterprise.sendNotification('success', 'Settings imported successfully')
    } catch (error) {
      console.error('Failed to import settings:', error)
      enterprise.sendNotification('error', 'Failed to import settings')
    }
  }

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Basic company and compliance information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.general?.companyName || ''}
                onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label htmlFor="complianceOfficer">Compliance Officer</Label>
              <Input
                id="complianceOfficer"
                value={settings.general?.complianceOfficer || ''}
                onChange={(e) => updateSetting('general', 'complianceOfficer', e.target.value)}
                placeholder="Enter compliance officer name"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultFramework">Default Framework</Label>
              <Select 
                value={settings.general?.defaultFramework || 'SOC 2'} 
                onValueChange={(value) => updateSetting('general', 'defaultFramework', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOC 2">SOC 2</SelectItem>
                  <SelectItem value="GDPR">GDPR</SelectItem>
                  <SelectItem value="HIPAA">HIPAA</SelectItem>
                  <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                  <SelectItem value="PCI DSS">PCI DSS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dataRetention">Data Retention (Days)</Label>
              <Input
                id="dataRetention"
                type="number"
                value={settings.general?.dataRetentionDays || 2555}
                onChange={(e) => updateSetting('general', 'dataRetentionDays', parseInt(e.target.value))}
                placeholder="2555"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automation Settings</CardTitle>
          <CardDescription>Configure automated compliance processes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoAssessment">Automatic Assessments</Label>
              <p className="text-sm text-muted-foreground">Enable automated compliance assessments</p>
            </div>
            <Switch
              id="autoAssessment"
              checked={settings.general?.autoAssessment || false}
              onCheckedChange={(checked) => updateSetting('general', 'autoAssessment', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="realTimeMonitoring">Real-time Monitoring</Label>
              <p className="text-sm text-muted-foreground">Enable real-time compliance monitoring</p>
            </div>
            <Switch
              id="realTimeMonitoring"
              checked={settings.general?.realTimeMonitoring || false}
              onCheckedChange={(checked) => updateSetting('general', 'realTimeMonitoring', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="aiInsights">AI Insights</Label>
              <p className="text-sm text-muted-foreground">Enable AI-powered compliance insights</p>
            </div>
            <Switch
              id="aiInsights"
              checked={settings.general?.aiInsights || false}
              onCheckedChange={(checked) => updateSetting('general', 'aiInsights', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Configure API and webhook settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              value={settings.integrations?.webhookUrl || ''}
              onChange={(e) => updateSetting('integrations', 'webhookUrl', e.target.value)}
              placeholder="https://api.company.com/webhooks/compliance"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="apiRateLimit">API Rate Limit (req/min)</Label>
              <Input
                id="apiRateLimit"
                type="number"
                value={settings.integrations?.apiRateLimit || 1000}
                onChange={(e) => updateSetting('integrations', 'apiRateLimit', parseInt(e.target.value))}
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="ssoProvider">SSO Provider</Label>
              <Select 
                value={settings.integrations?.ssoProvider || 'okta'} 
                onValueChange={(value) => updateSetting('integrations', 'ssoProvider', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select SSO provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="okta">Okta</SelectItem>
                  <SelectItem value="azure">Azure AD</SelectItem>
                  <SelectItem value="auth0">Auth0</SelectItem>
                  <SelectItem value="saml">SAML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableWebhooks">Enable Webhooks</Label>
                <p className="text-sm text-muted-foreground">Send compliance events via webhooks</p>
              </div>
              <Switch
                id="enableWebhooks"
                checked={settings.integrations?.enableWebhooks || false}
                onCheckedChange={(checked) => updateSetting('integrations', 'enableWebhooks', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableSso">Enable SSO</Label>
                <p className="text-sm text-muted-foreground">Single sign-on integration</p>
              </div>
              <Switch
                id="enableSso"
                checked={settings.integrations?.enableSso || false}
                onCheckedChange={(checked) => updateSetting('integrations', 'enableSso', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableAuditLogging">Enable Audit Logging</Label>
                <p className="text-sm text-muted-foreground">Log all API and system activities</p>
              </div>
              <Switch
                id="enableAuditLogging"
                checked={settings.integrations?.enableAuditLogging || false}
                onCheckedChange={(checked) => updateSetting('integrations', 'enableAuditLogging', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSystemStatus = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Current system status and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                settings.system?.status === 'healthy' ? 'bg-green-100 text-green-600' :
                settings.system?.status === 'degraded' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {settings.system?.status === 'healthy' ? <CheckCircle className="h-6 w-6" /> :
                 settings.system?.status === 'degraded' ? <AlertTriangle className="h-6 w-6" /> :
                 <AlertTriangle className="h-6 w-6" />}
              </div>
              <p className="font-medium">System Status</p>
              <p className="text-sm text-muted-foreground capitalize">
                {settings.system?.status || 'Unknown'}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-2">
                <Monitor className="h-6 w-6" />
              </div>
              <p className="font-medium">Uptime</p>
              <p className="text-sm text-muted-foreground">
                {Math.floor((settings.system?.uptime || 0) / 3600)}h {Math.floor(((settings.system?.uptime || 0) % 3600) / 60)}m
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-2">
                <Wifi className="h-6 w-6" />
              </div>
              <p className="font-medium">Latency</p>
              <p className="text-sm text-muted-foreground">
                {settings.system?.latency || 0}ms
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-2">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <p className="font-medium">Error Rate</p>
              <p className="text-sm text-muted-foreground">
                {settings.system?.errorRate || 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Version and deployment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Version</span>
              <Badge variant="outline">{settings.system?.version || '2.1.0'}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last Updated</span>
              <span className="text-sm text-muted-foreground">
                {settings.system?.lastUpdated ? 
                  new Date(settings.system.lastUpdated).toLocaleDateString() : 
                  'Unknown'
                }
              </span>
            </div>
            <Separator />
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh Status
              </Button>
              <Button variant="outline" size="sm">
                <HardDrive className="h-4 w-4 mr-1" />
                System Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Settings</h2>
          <p className="text-muted-foreground">
            Configure compliance rules, integrations, and system settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".json"
            onChange={handleImportSettings}
            className="hidden"
            id="import-settings"
          />
          <Button variant="outline" size="sm" onClick={() => document.getElementById('import-settings')?.click()}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          {renderGeneralSettings()}
        </TabsContent>

        <TabsContent value="integrations">
          {renderIntegrationSettings()}
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive compliance notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.notifications?.emailNotifications || false}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="slackNotifications">Slack Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications to Slack</p>
                  </div>
                  <Switch
                    id="slackNotifications"
                    checked={settings.notifications?.slackNotifications || false}
                    onCheckedChange={(checked) => updateSetting('notifications', 'slackNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="encryptionEnabled">Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">Enable data encryption at rest</p>
                  </div>
                  <Switch
                    id="encryptionEnabled"
                    checked={settings.security?.encryptionEnabled || false}
                    onCheckedChange={(checked) => updateSetting('security', 'encryptionEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mfaRequired">Multi-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require MFA for all users</p>
                  </div>
                  <Switch
                    id="mfaRequired"
                    checked={settings.security?.mfaRequired || false}
                    onCheckedChange={(checked) => updateSetting('security', 'mfaRequired', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks">
          <Card>
            <CardHeader>
              <CardTitle>Framework Settings</CardTitle>
              <CardDescription>Configure compliance frameworks and assessment settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoImport">Auto Import Requirements</Label>
                    <p className="text-sm text-muted-foreground">Automatically import framework requirements</p>
                  </div>
                  <Switch
                    id="autoImport"
                    checked={settings.frameworks?.autoImport || false}
                    onCheckedChange={(checked) => updateSetting('frameworks', 'autoImport', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="crosswalkMapping">Crosswalk Mapping</Label>
                    <p className="text-sm text-muted-foreground">Enable framework crosswalk mapping</p>
                  </div>
                  <Switch
                    id="crosswalkMapping"
                    checked={settings.frameworks?.crosswalkMapping || false}
                    onCheckedChange={(checked) => updateSetting('frameworks', 'crosswalkMapping', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          {renderSystemStatus()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ComplianceRuleSettings