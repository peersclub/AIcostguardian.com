import { NotificationType, ChannelType, NotificationStatus, NotificationPriority } from '@prisma/client'

// Core notification interfaces
export interface NotificationData {
  id?: string
  ruleId?: string
  userId: string
  organizationId: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  data?: Record<string, any>
  groupId?: string
  parentId?: string
  expiresAt?: Date
  channels?: NotificationChannelConfig[]
}

export interface NotificationChannelConfig {
  type: ChannelType
  destination: string
  config?: Record<string, any>
  enabled?: boolean
  includeDetails?: boolean
  format?: 'html' | 'text' | 'markdown'
}

export interface NotificationRule {
  id?: string
  userId: string
  organizationId: string
  name: string
  description?: string
  type: NotificationType
  enabled: boolean
  conditions: NotificationConditions
  threshold?: number
  comparisonOp?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq'
  timeWindow?: number
  schedule?: string // Cron expression
  timezone: string
  cooldownMinutes: number
  maxPerDay: number
  priority: NotificationPriority
  tags: string[]
  channels: NotificationChannelConfig[]
}

export interface NotificationConditions {
  costThreshold?: number
  usageThreshold?: number
  providerFilters?: string[]
  modelFilters?: string[]
  userFilters?: string[]
  timeRange?: {
    start: string
    end: string
  }
  customConditions?: Array<{
    field: string
    operator: string
    value: any
  }>
}

export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  channel: ChannelType
  subject?: string
  bodyTemplate: string
  bodyHtml?: string
  variables: Record<string, any>
  locale: string
  brand?: BrandConfig
}

export interface BrandConfig {
  primaryColor?: string
  logoUrl?: string
  companyName?: string
  brandName?: string
  footerText?: string
  unsubscribeUrl?: string
}

export interface NotificationPreferences {
  userId: string
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  slackEnabled: boolean
  teamsEnabled: boolean
  quietHoursEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  timezone: string
  weekendQuiet: boolean
  batchEmails: boolean
  batchFrequency: 'immediate' | 'hourly' | 'daily'
  preferredChannel: ChannelType
  costAlerts: boolean
  usageAlerts: boolean
  systemAlerts: boolean
  teamAlerts: boolean
  reports: boolean
  recommendations: boolean
  autoEscalate: boolean
  escalateAfterMinutes: number
}

// Channel-specific interfaces
export interface EmailChannelConfig {
  from?: string
  replyTo?: string
  provider?: 'sendgrid' | 'aws-ses'
  templateId?: string
  attachments?: EmailAttachment[]
  headers?: Record<string, string>
  trackOpens?: boolean
  trackClicks?: boolean
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
  disposition?: 'attachment' | 'inline'
}

export interface SlackChannelConfig {
  botToken?: string
  channel?: string
  username?: string
  iconEmoji?: string
  iconUrl?: string
  threadTs?: string
  unfurlLinks?: boolean
  unfurlMedia?: boolean
  blocks?: SlackBlock[]
  attachments?: SlackAttachment[]
}

export interface SlackBlock {
  type: string
  text?: {
    type: 'mrkdwn' | 'plain_text'
    text: string
  }
  elements?: any[]
  accessory?: any
}

export interface SlackAttachment {
  color?: string
  fields?: Array<{
    title: string
    value: string
    short?: boolean
  }>
  actions?: any[]
}

export interface WebhookChannelConfig {
  url: string
  method?: 'POST' | 'PUT' | 'PATCH'
  headers?: Record<string, string>
  authentication?: {
    type: 'bearer' | 'basic' | 'apikey'
    token?: string
    username?: string
    password?: string
    header?: string
  }
  retries?: number
  timeout?: number
  payload?: 'full' | 'minimal'
}

export interface InAppChannelConfig {
  persistent?: boolean
  actionable?: boolean
  sound?: boolean
  vibration?: boolean
  actions?: Array<{
    label: string
    action: string
    style?: 'default' | 'primary' | 'destructive'
  }>
}

// Queue and processing interfaces
export interface QueueJob {
  id: string
  type: 'notification' | 'batch' | 'digest'
  priority: number
  data: any
  attempts: number
  maxAttempts: number
  delay?: number
  createdAt: Date
  scheduledFor?: Date
  lastAttemptAt?: Date
  error?: string
}

export interface QueueConfig {
  concurrency: number
  retryDelays: number[] // Exponential backoff delays in ms
  maxRetries: number
  defaultJobExpiry: number // TTL in seconds
  cleanupInterval: number // Cleanup old jobs interval in ms
}

export interface RetryConfig {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
  jitter: boolean
}

export interface DeliveryResult {
  success: boolean
  channel: ChannelType
  destination: string
  messageId?: string
  error?: string
  latency?: number
  attempts: number
  metadata?: Record<string, any>
}

export interface BatchNotification {
  userId: string
  notifications: NotificationData[]
  frequency: 'hourly' | 'daily' | 'weekly'
  template: string
  scheduledFor: Date
}

// Real-time interfaces
export interface RealtimeConnection {
  userId: string
  connectionId: string
  type: 'websocket' | 'sse'
  lastPing: Date
  metadata?: Record<string, any>
}

export interface RealtimeMessage {
  type: 'notification' | 'ping' | 'ack' | 'error'
  id?: string
  data?: any
  timestamp: Date
}

// Template rendering interfaces
export interface TemplateVariables {
  user: {
    id: string
    name?: string
    email: string
    company?: string
  }
  organization: {
    id: string
    name: string
    domain: string
  }
  notification: {
    type: NotificationType
    priority: NotificationPriority
    title: string
    message: string
    data?: Record<string, any>
  }
  context: {
    currentCost?: number
    threshold?: number
    provider?: string
    model?: string
    timeframe?: string
    timestamp: Date
  }
  branding?: BrandConfig
}

export interface TemplateRenderResult {
  subject?: string
  body: string
  html?: string
  attachments?: EmailAttachment[]
  metadata?: Record<string, any>
}

// Condition evaluation interfaces
export interface ConditionEvaluator {
  evaluate(conditions: NotificationConditions, context: EvaluationContext): boolean
}

export interface EvaluationContext {
  userId: string
  organizationId: string
  currentCost: number
  previousCost: number
  costIncrease: number
  usageData: {
    provider: string
    model: string
    tokens: number
    requests: number
  }[]
  timeframe: {
    start: Date
    end: Date
  }
  alerts: any[]
  metadata?: Record<string, any>
}

// Service interfaces
export interface NotificationChannel {
  type: ChannelType
  name: string
  send(notification: NotificationData, config: any, template?: TemplateRenderResult): Promise<DeliveryResult>
  validate(config: any): boolean
  test(config: any): Promise<boolean>
}

export interface NotificationQueue {
  enqueue(job: QueueJob): Promise<void>
  dequeue(): Promise<QueueJob | null>
  retry(job: QueueJob): Promise<void>
  fail(job: QueueJob, error: string): Promise<void>
  complete(job: QueueJob, result?: any): Promise<void>
  getStats(): Promise<QueueStats>
  cleanup(): Promise<void>
}

export interface QueueStats {
  pending: number
  processing: number
  completed: number
  failed: number
  delayed: number
}

export interface TemplateEngine {
  render(templateName: string, variables: TemplateVariables): Promise<TemplateRenderResult>
  registerTemplate(template: NotificationTemplate): void
  getTemplate(name: string, type: NotificationType, channel: ChannelType): Promise<NotificationTemplate>
  compile(template: string, variables: TemplateVariables): string
}

export interface RealtimeService {
  connect(userId: string, connectionId: string, type: 'websocket' | 'sse'): Promise<void>
  disconnect(connectionId: string): Promise<void>
  send(userId: string, message: RealtimeMessage): Promise<boolean>
  broadcast(userIds: string[], message: RealtimeMessage): Promise<number>
  isConnected(userId: string): boolean
  getConnectionCount(): number
}

// Error types
export class NotificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public channel?: ChannelType,
    public recoverable = true
  ) {
    super(message)
    this.name = 'NotificationError'
  }
}

export class ChannelError extends NotificationError {
  constructor(
    message: string,
    channel: ChannelType,
    public statusCode?: number,
    recoverable = true
  ) {
    super(message, 'CHANNEL_ERROR', channel, recoverable)
    this.name = 'ChannelError'
  }
}

export class TemplateError extends NotificationError {
  constructor(message: string, public templateName?: string) {
    super(message, 'TEMPLATE_ERROR', undefined, false)
    this.name = 'TemplateError'
  }
}

export class QueueError extends NotificationError {
  constructor(message: string, recoverable = true) {
    super(message, 'QUEUE_ERROR', undefined, recoverable)
    this.name = 'QueueError'
  }
}

// Configuration types
export interface NotificationServiceConfig {
  queue: QueueConfig
  retry: RetryConfig
  channels: {
    email: {
      enabled: boolean
      providers: {
        sendgrid?: {
          apiKey: string
          fromEmail: string
          fromName: string
        }
        awsSes?: {
          region: string
          accessKeyId: string
          secretAccessKey: string
          fromEmail: string
          fromName: string
        }
      }
    }
    slack: {
      enabled: boolean
      appId?: string
      clientId?: string
      clientSecret?: string
      signingSecret?: string
      botToken?: string
    }
    webhook: {
      enabled: boolean
      defaultTimeout: number
      maxRetries: number
    }
    inApp: {
      enabled: boolean
      persistDuration: number // seconds
    }
  }
  templates: {
    defaultLocale: string
    supportedLocales: string[]
    brandConfig: BrandConfig
  }
  realtime: {
    enabled: boolean
    pingInterval: number
    connectionTimeout: number
  }
}

// Export utility types
export type NotificationChannelType = ChannelType
export type NotificationEvent = NotificationType
export type DeliveryStatus = NotificationStatus
export type Priority = NotificationPriority