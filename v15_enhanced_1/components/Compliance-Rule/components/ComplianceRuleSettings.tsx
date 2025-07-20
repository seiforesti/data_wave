"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Shield,
  Bell,
  Clock,
  Users,
  Database,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  Save,
  Download,
  Upload,
  Trash2,
  Plus,
  Minus,
  Info
} from "lucide-react"
import { useEnterpriseFeatures } from "../hooks/use-enterprise-features"
import { ComplianceAPIs } from "../services/enterprise-apis"

interface ComplianceRuleSettingsProps {
  onClose?: () => void
}

interface NotificationRule {
  id: string
  name: string
  triggers: string[]
  recipients: string[]
  enabled: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface AutomationRule {
  id: string
  name: string
  trigger: string
  action: string
  conditions: any
  enabled: boolean
}

export function ComplianceRuleSettings({ onClose }: ComplianceRuleSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState<any>({
    general: {
      auto_scan_enabled: true,
      scan_frequency: "daily",
      max_concurrent_scans: 5,
      retention_days: 365,
      enable_notifications: true,
      enable_auto_remediation: false,
      default_severity: "medium",
      global_timeout: 300
    },
    notifications: {
      email_enabled: true,
      slack_enabled: false,
      webhook_enabled: false,
      email_recipients: ["compliance@company.com"],
      slack_channel: "#compliance",
      webhook_url: "",
      notification_rules: []
    },
    automation: {
      auto_remediation_enabled: false,
      auto_escalation_enabled: true,
      workflow_automation: true,
      automation_rules: []
    },
    security: {
      encryption_enabled: true,
      audit_logging: true,
      access_control_enabled: true,
      api_rate_limiting: true,
      session_timeout: 3600,
      require_mfa: false
    },
    integration: {
      data_sources_sync: true,
      external_apis_enabled: true,
      webhook_integrations: [],
      sso_enabled: false,
      ldap_enabled: false
    }
  })

  const { 
    executeAction, 
    sendNotification, 
    getMetrics 
  } = useEnterpriseFeatures({
    componentName: 'ComplianceRuleSettings',
    enableAnalytics: true,
    enableMonitoring: true,
    enableWorkflows: true
  })

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        const settingsData = await ComplianceAPIs.Management.getSettings()
        setSettings(settingsData)
      } catch (error) {
        console.error('Failed to load settings:', error)
        sendNotification('error', 'Failed to load compliance settings')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [sendNotification])

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true)
      await ComplianceAPIs.Management.updateSettings(settings)
      sendNotification('success', 'Compliance settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      sendNotification('error', 'Failed to save compliance settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSettings = async () => {
    try {
      await ComplianceAPIs.Management.resetSettings()
      sendNotification('info', 'Settings reset to defaults')
      // Reload settings
      const settingsData = await ComplianceAPIs.Management.getSettings()
      setSettings(settingsData)
    } catch (error) {
      console.error('Failed to reset settings:', error)
      sendNotification('error', 'Failed to reset settings')
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
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Configuration
          </CardTitle>
          <CardDescription>
            Configure general compliance rule behavior and system settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scan Frequency</Label>
              <Select 
                value={settings.general.scan_frequency} 
                onValueChange={(value) => updateSetting('general', 'scan_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continuous">Continuous</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Default Severity</Label>
              <Select 
                value={settings.general.default_severity} 
                onValueChange={(value) => updateSetting('general', 'default_severity', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Concurrent Scans</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={settings.general.max_concurrent_scans}
                onChange={(e) => updateSetting('general', 'max_concurrent_scans', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Retention (Days)</Label>
              <Input
                type="number"
                min="30"
                max="2555"
                value={settings.general.retention_days}
                onChange={(e) => updateSetting('general', 'retention_days', parseInt(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Auto-Scan Enabled</Label>
                <p className="text-sm text-muted-foreground">Automatically scan data sources for compliance</p>
              </div>
              <Switch
                checked={settings.general.auto_scan_enabled}
                onCheckedChange={(checked) => updateSetting('general', 'auto_scan_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Send notifications for compliance events</p>
              </div>
              <Switch
                checked={settings.general.enable_notifications}
                onCheckedChange={(checked) => updateSetting('general', 'enable_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Auto-Remediation</Label>
                <p className="text-sm text-muted-foreground">Automatically fix compliance violations when possible</p>
              </div>
              <Switch
                checked={settings.general.enable_auto_remediation}
                onCheckedChange={(checked) => updateSetting('general', 'enable_auto_remediation', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Configure how and when compliance notifications are sent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send compliance alerts via email</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.email_enabled}
                onCheckedChange={(checked) => updateSetting('notifications', 'email_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <Label className="text-base">Slack Integration</Label>
                  <p className="text-sm text-muted-foreground">Send alerts to Slack channels</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.slack_enabled}
                onCheckedChange={(checked) => updateSetting('notifications', 'slack_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <Label className="text-base">Webhook Integration</Label>
                  <p className="text-sm text-muted-foreground">Send events to external webhooks</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.webhook_enabled}
                onCheckedChange={(checked) => updateSetting('notifications', 'webhook_enabled', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Recipients</Label>
              <Textarea
                placeholder="Enter email addresses separated by commas"
                value={settings.notifications.email_recipients.join(', ')}
                onChange={(e) => {
                  const emails = e.target.value.split(',').map(email => email.trim()).filter(email => email)
                  updateSetting('notifications', 'email_recipients', emails)
                }}
              />
            </div>

            {settings.notifications.slack_enabled && (
              <div className="space-y-2">
                <Label>Slack Channel</Label>
                <Input
                  placeholder="#compliance"
                  value={settings.notifications.slack_channel}
                  onChange={(e) => updateSetting('notifications', 'slack_channel', e.target.value)}
                />
              </div>
            )}

            {settings.notifications.webhook_enabled && (
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://your-webhook-endpoint.com"
                  value={settings.notifications.webhook_url}
                  onChange={(e) => updateSetting('notifications', 'webhook_url', e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAutomationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation & Workflows
          </CardTitle>
          <CardDescription>
            Configure automated responses and workflow triggers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Auto-Remediation</Label>
                <p className="text-sm text-muted-foreground">Automatically fix violations when possible</p>
              </div>
              <Switch
                checked={settings.automation.auto_remediation_enabled}
                onCheckedChange={(checked) => updateSetting('automation', 'auto_remediation_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Auto-Escalation</Label>
                <p className="text-sm text-muted-foreground">Escalate unresolved issues automatically</p>
              </div>
              <Switch
                checked={settings.automation.auto_escalation_enabled}
                onCheckedChange={(checked) => updateSetting('automation', 'auto_escalation_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Workflow Automation</Label>
                <p className="text-sm text-muted-foreground">Enable automated workflow execution</p>
              </div>
              <Switch
                checked={settings.automation.workflow_automation}
                onCheckedChange={(checked) => updateSetting('automation', 'workflow_automation', checked)}
              />
            </div>
          </div>

          {settings.automation.auto_remediation_enabled && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Auto-remediation is enabled. The system will attempt to automatically fix compliance violations.
                Ensure you have tested remediation actions thoroughly before enabling in production.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Access Control
          </CardTitle>
          <CardDescription>
            Configure security settings and access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-green-600" />
                <div>
                  <Label className="text-base">Data Encryption</Label>
                  <p className="text-sm text-muted-foreground">Encrypt sensitive compliance data</p>
                </div>
              </div>
              <Switch
                checked={settings.security.encryption_enabled}
                onCheckedChange={(checked) => updateSetting('security', 'encryption_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-blue-600" />
                <div>
                  <Label className="text-base">Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">Log all compliance activities</p>
                </div>
              </div>
              <Switch
                checked={settings.security.audit_logging}
                onCheckedChange={(checked) => updateSetting('security', 'audit_logging', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-purple-600" />
                <div>
                  <Label className="text-base">Access Control</Label>
                  <p className="text-sm text-muted-foreground">Enable role-based access control</p>
                </div>
              </div>
              <Switch
                checked={settings.security.access_control_enabled}
                onCheckedChange={(checked) => updateSetting('security', 'access_control_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <Label className="text-base">API Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">Limit API requests per user</p>
                </div>
              </div>
              <Switch
                checked={settings.security.api_rate_limiting}
                onCheckedChange={(checked) => updateSetting('security', 'api_rate_limiting', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-red-600" />
                <div>
                  <Label className="text-base">Require MFA</Label>
                  <p className="text-sm text-muted-foreground">Require multi-factor authentication</p>
                </div>
              </div>
              <Switch
                checked={settings.security.require_mfa}
                onCheckedChange={(checked) => updateSetting('security', 'require_mfa', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Session Timeout (seconds)</Label>
            <Input
              type="number"
              min="300"
              max="86400"
              value={settings.security.session_timeout}
              onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              User sessions will expire after this period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            External Integrations
          </CardTitle>
          <CardDescription>
            Configure integrations with external systems and data sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-blue-600" />
                <div>
                  <Label className="text-base">Data Sources Sync</Label>
                  <p className="text-sm text-muted-foreground">Automatically sync with connected data sources</p>
                </div>
              </div>
              <Switch
                checked={settings.integration.data_sources_sync}
                onCheckedChange={(checked) => updateSetting('integration', 'data_sources_sync', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-green-600" />
                <div>
                  <Label className="text-base">External APIs</Label>
                  <p className="text-sm text-muted-foreground">Enable external API integrations</p>
                </div>
              </div>
              <Switch
                checked={settings.integration.external_apis_enabled}
                onCheckedChange={(checked) => updateSetting('integration', 'external_apis_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-purple-600" />
                <div>
                  <Label className="text-base">SSO Integration</Label>
                  <p className="text-sm text-muted-foreground">Enable Single Sign-On authentication</p>
                </div>
              </div>
              <Switch
                checked={settings.integration.sso_enabled}
                onCheckedChange={(checked) => updateSetting('integration', 'sso_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-orange-600" />
                <div>
                  <Label className="text-base">LDAP Integration</Label>
                  <p className="text-sm text-muted-foreground">Connect to LDAP directory services</p>
                </div>
              </div>
              <Switch
                checked={settings.integration.ldap_enabled}
                onCheckedChange={(checked) => updateSetting('integration', 'ldap_enabled', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Settings</h2>
          <p className="text-muted-foreground">
            Configure compliance rules, notifications, and system behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          {renderGeneralSettings()}
        </TabsContent>

        <TabsContent value="notifications">
          {renderNotificationSettings()}
        </TabsContent>

        <TabsContent value="automation">
          {renderAutomationSettings()}
        </TabsContent>

        <TabsContent value="security">
          {renderSecuritySettings()}
        </TabsContent>

        <TabsContent value="integration">
          {renderIntegrationSettings()}
        </TabsContent>
      </Tabs>
    </div>
  )
}