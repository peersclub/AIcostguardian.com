'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Minus, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users,
  Zap,
  Play,
  Save,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle,
  Settings2,
  ChevronDown,
  ChevronRight,
  Filter,
  Target,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { NotificationRule, NotificationConditions } from '@/lib/notifications/types'
import type { NotificationType, NotificationPriority } from '@prisma/client'

interface Condition {
  id: string
  field: string
  operator: string
  value: any
  logicOperator?: 'AND' | 'OR'
}

interface ConditionGroup {
  id: string
  conditions: Condition[]
  logicOperator: 'AND' | 'OR'
}

interface NotificationRuleBuilderProps {
  rule?: Partial<NotificationRule>
  onSave: (rule: NotificationRule) => Promise<void>
  onCancel?: () => void
  className?: string
}

const ruleTypes = [
  { value: 'COST_ALERT', label: 'Cost Alert', icon: DollarSign },
  { value: 'USAGE_ALERT', label: 'Usage Alert', icon: TrendingUp },
  { value: 'SYSTEM_ALERT', label: 'System Alert', icon: AlertTriangle },
  { value: 'TEAM_ALERT', label: 'Team Alert', icon: Users }
] as const

const priorities = [
  { value: 'LOW', label: 'Low', color: 'bg-green-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-500' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-500' }
] as const

const conditionFields = [
  { value: 'cost', label: 'Total Cost', type: 'number', unit: '$' },
  { value: 'costIncrease', label: 'Cost Increase', type: 'number', unit: '%' },
  { value: 'tokensUsed', label: 'Tokens Used', type: 'number', unit: 'tokens' },
  { value: 'requestCount', label: 'Request Count', type: 'number', unit: 'requests' },
  { value: 'provider', label: 'AI Provider', type: 'select', options: ['OpenAI', 'Claude', 'Gemini', 'Grok'] },
  { value: 'model', label: 'Model', type: 'select', options: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'gemini-pro'] },
  { value: 'user', label: 'User', type: 'select', options: [] }, // Will be populated from API
  { value: 'timeWindow', label: 'Time Window', type: 'select', options: ['1h', '6h', '12h', '24h', '7d', '30d'] }
]

const operators = [
  { value: 'gt', label: 'Greater than', symbol: '>' },
  { value: 'gte', label: 'Greater than or equal', symbol: '>=' },
  { value: 'lt', label: 'Less than', symbol: '<' },
  { value: 'lte', label: 'Less than or equal', symbol: '<=' },
  { value: 'eq', label: 'Equals', symbol: '=' },
  { value: 'contains', label: 'Contains', symbol: '⊃' },
  { value: 'in', label: 'In list', symbol: '∈' }
]

const scheduleOptions = [
  { value: '', label: 'Real-time (no schedule)' },
  { value: '0 * * * *', label: 'Every hour' },
  { value: '0 0 * * *', label: 'Daily at midnight' },
  { value: '0 9 * * 1-5', label: 'Weekdays at 9 AM' },
  { value: '0 0 * * 0', label: 'Weekly on Sunday' },
  { value: '0 0 1 * *', label: 'Monthly on 1st' }
]

let conditionIdCounter = 0
let groupIdCounter = 0

export function NotificationRuleBuilder({
  rule,
  onSave,
  onCancel,
  className
}: NotificationRuleBuilderProps) {
  const [formData, setFormData] = useState<Partial<NotificationRule>>({
    name: '',
    description: '',
    type: 'COST_ALERT',
    enabled: true,
    priority: 'MEDIUM',
    threshold: 100,
    comparisonOp: 'gte',
    timeWindow: 3600, // 1 hour
    schedule: '',
    timezone: 'UTC',
    cooldownMinutes: 60,
    maxPerDay: 10,
    tags: [],
    channels: [],
    conditions: {},
    ...rule
  })
  
  const [conditionGroups, setConditionGroups] = useState<ConditionGroup[]>([
    {
      id: `group-${++groupIdCounter}`,
      logicOperator: 'AND',
      conditions: [
        {
          id: `condition-${++conditionIdCounter}`,
          field: 'cost',
          operator: 'gte',
          value: 100
        }
      ]
    }
  ])
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewResult, setPreviewResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; matches: boolean; message: string } | null>(null)

  // Convert conditions to structured format
  useEffect(() => {
    const conditions: NotificationConditions = {}
    
    conditionGroups.forEach(group => {
      group.conditions.forEach(condition => {
        if (condition.field === 'cost') {
          conditions.costThreshold = condition.value
        } else if (condition.field === 'tokensUsed') {
          conditions.usageThreshold = condition.value
        } else if (condition.field === 'provider') {
          conditions.providerFilters = Array.isArray(condition.value) ? condition.value : [condition.value]
        } else if (condition.field === 'model') {
          conditions.modelFilters = Array.isArray(condition.value) ? condition.value : [condition.value]
        } else if (condition.field === 'user') {
          conditions.userFilters = Array.isArray(condition.value) ? condition.value : [condition.value]
        }
      })
    })
    
    setFormData(prev => ({ ...prev, conditions }))
  }, [conditionGroups])

  // Add new condition to group
  const addCondition = (groupId: string) => {
    setConditionGroups(prev => prev.map(group => 
      group.id === groupId 
        ? {
            ...group,
            conditions: [
              ...group.conditions,
              {
                id: `condition-${++conditionIdCounter}`,
                field: 'cost',
                operator: 'gte',
                value: 0
              }
            ]
          }
        : group
    ))
  }

  // Remove condition from group
  const removeCondition = (groupId: string, conditionId: string) => {
    setConditionGroups(prev => prev.map(group => 
      group.id === groupId 
        ? {
            ...group,
            conditions: group.conditions.filter(c => c.id !== conditionId)
          }
        : group
    ))
  }

  // Update condition
  const updateCondition = (groupId: string, conditionId: string, updates: Partial<Condition>) => {
    setConditionGroups(prev => prev.map(group => 
      group.id === groupId 
        ? {
            ...group,
            conditions: group.conditions.map(c => 
              c.id === conditionId ? { ...c, ...updates } : c
            )
          }
        : group
    ))
  }

  // Add new condition group
  const addConditionGroup = () => {
    setConditionGroups(prev => [
      ...prev,
      {
        id: `group-${++groupIdCounter}`,
        logicOperator: 'OR',
        conditions: [
          {
            id: `condition-${++conditionIdCounter}`,
            field: 'cost',
            operator: 'gte',
            value: 0
          }
        ]
      }
    ])
  }

  // Remove condition group
  const removeConditionGroup = (groupId: string) => {
    setConditionGroups(prev => prev.filter(g => g.id !== groupId))
  }

  // Update condition group
  const updateConditionGroup = (groupId: string, updates: Partial<ConditionGroup>) => {
    setConditionGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, ...updates } : group
    ))
  }

  // Test rule with sample data
  const testRule = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/notifications/rules/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rule: formData,
          sampleData: {
            cost: 150,
            tokensUsed: 50000,
            provider: 'OpenAI',
            model: 'gpt-4',
            user: 'test-user'
          }
        })
      })
      
      const result = await response.json()
      setTestResult(result)
    } catch (err) {
      setTestResult({
        success: false,
        matches: false,
        message: 'Failed to test rule'
      })
    } finally {
      setTesting(false)
    }
  }

  // Save rule
  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(formData as NotificationRule)
    } catch (err) {
      console.error('Failed to save rule:', err)
    } finally {
      setSaving(false)
    }
  }

  const getFieldConfig = (fieldValue: string) => {
    return conditionFields.find(f => f.value === fieldValue) || conditionFields[0]
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {rule?.id ? 'Edit Notification Rule' : 'Create Notification Rule'}
          </h2>
          <p className="text-muted-foreground">
            Set up automated notifications based on AI usage patterns
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={testRule}
            disabled={testing}
          >
            {testing ? (
              <>
                <Settings2 className="h-4 w-4 animate-spin mr-2" />
                Testing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Test Rule
              </>
            )}
          </Button>
          
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Settings2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Rule
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <Alert variant={testResult.success ? 'default' : 'destructive'}>
          <div className="flex items-center gap-2">
            {testResult.matches ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              <strong>Test Result:</strong> {testResult.message}
              {testResult.matches && ' - This rule would trigger with the sample data.'}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="High cost alert for OpenAI usage"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Alert when OpenAI costs exceed $100 per hour"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Rule Type</Label>
                  <select
                    id="type"
                    className="w-full p-2 border rounded"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as NotificationType }))}
                  >
                    {ruleTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="w-full p-2 border rounded"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as NotificationPriority }))}
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Enable rule</Label>
                <Switch
                  id="enabled"
                  checked={formData.enabled || false}
                  onCheckedChange={(enabled) => setFormData(prev => ({ ...prev, enabled }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Conditions
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addConditionGroup}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Group
                </Button>
              </div>
              <CardDescription>
                Define when this rule should trigger
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {conditionGroups.map((group, groupIndex) => (
                <div key={group.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Group {groupIndex + 1}
                      </Badge>
                      
                      {groupIndex > 0 && (
                        <select
                          className="px-2 py-1 border rounded text-sm"
                          value={group.logicOperator}
                          onChange={(e) => updateConditionGroup(group.id, { 
                            logicOperator: e.target.value as 'AND' | 'OR' 
                          })}
                        >
                          <option value="AND">AND</option>
                          <option value="OR">OR</option>
                        </select>
                      )}
                    </div>
                    
                    {conditionGroups.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeConditionGroup(group.id)}
                        className="h-6 w-6 p-0 text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {group.conditions.map((condition, conditionIndex) => {
                    const fieldConfig = getFieldConfig(condition.field)
                    
                    return (
                      <div key={condition.id} className="grid grid-cols-12 gap-2 items-end">
                        {conditionIndex > 0 && (
                          <div className="col-span-12 text-center text-sm text-muted-foreground">
                            AND
                          </div>
                        )}
                        
                        {/* Field */}
                        <div className="col-span-4">
                          <select
                            className="w-full p-2 border rounded text-sm"
                            value={condition.field}
                            onChange={(e) => updateCondition(group.id, condition.id, { 
                              field: e.target.value,
                              value: fieldConfig.type === 'number' ? 0 : ''
                            })}
                          >
                            {conditionFields.map(field => (
                              <option key={field.value} value={field.value}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Operator */}
                        <div className="col-span-3">
                          <select
                            className="w-full p-2 border rounded text-sm"
                            value={condition.operator}
                            onChange={(e) => updateCondition(group.id, condition.id, { operator: e.target.value })}
                          >
                            {operators.map(op => (
                              <option key={op.value} value={op.value}>
                                {op.symbol} {op.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Value */}
                        <div className="col-span-4">
                          {fieldConfig.type === 'number' ? (
                            <div className="relative">
                              <Input
                                type="number"
                                value={condition.value}
                                onChange={(e) => updateCondition(group.id, condition.id, { 
                                  value: parseFloat(e.target.value) || 0 
                                })}
                                className="text-sm"
                              />
                              {fieldConfig.unit && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                  {fieldConfig.unit}
                                </span>
                              )}
                            </div>
                          ) : (
                            <select
                              className="w-full p-2 border rounded text-sm"
                              value={condition.value}
                              onChange={(e) => updateCondition(group.id, condition.id, { value: e.target.value })}
                            >
                              <option value="">Select...</option>
                              {fieldConfig.options?.map(option => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        
                        {/* Remove condition */}
                        <div className="col-span-1">
                          {group.conditions.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCondition(group.id, condition.id)}
                              className="h-8 w-8 p-0 text-red-600"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCondition(group.id)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Thresholds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="threshold">Primary Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formData.threshold || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comparison">Comparison</Label>
                <select
                  id="comparison"
                  className="w-full p-2 border rounded"
                  value={formData.comparisonOp}
                  onChange={(e) => setFormData(prev => ({ ...prev, comparisonOp: e.target.value as any }))}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.symbol} {op.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time-window">Time Window (seconds)</Label>
                <Input
                  id="time-window"
                  type="number"
                  value={formData.timeWindow || 3600}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeWindow: parseInt(e.target.value) || 3600 }))}
                />
                <p className="text-xs text-muted-foreground">
                  {Math.floor((formData.timeWindow || 3600) / 60)} minutes
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule (Cron)</Label>
                <select
                  id="schedule"
                  className="w-full p-2 border rounded"
                  value={formData.schedule}
                  onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                >
                  {scheduleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  className="w-full p-2 border rounded"
                  value={formData.timezone}
                  onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Rate Limiting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cooldown">Cooldown (minutes)</Label>
                <Input
                  id="cooldown"
                  type="number"
                  value={formData.cooldownMinutes || 60}
                  onChange={(e) => setFormData(prev => ({ ...prev, cooldownMinutes: parseInt(e.target.value) || 60 }))}
                />
                <p className="text-xs text-muted-foreground">
                  Wait time between notifications
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-per-day">Max per day</Label>
                <Input
                  id="max-per-day"
                  type="number"
                  value={formData.maxPerDay || 10}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxPerDay: parseInt(e.target.value) || 10 }))}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum notifications in 24 hours
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default NotificationRuleBuilder