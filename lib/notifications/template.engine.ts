import { 
  NotificationTemplate, 
  TemplateVariables, 
  TemplateRenderResult, 
  TemplateError
} from './types'
import { NotificationType, ChannelType } from '@prisma/client'
import prisma from '@/lib/prisma'

interface HandlebarsHelpers {
  [key: string]: (...args: any[]) => string
}

/**
 * Template engine for rendering notification content
 * Supports Handlebars-style templating with custom helpers
 */
export class NotificationTemplateEngine {
  private templates = new Map<string, NotificationTemplate>()
  private compiledTemplates = new Map<string, Function>()
  private helpers: HandlebarsHelpers = {}

  constructor() {
    this.registerDefaultHelpers()
  }

  /**
   * Initialize the template engine by loading templates from database
   */
  async initialize(): Promise<void> {
    try {
      // Skip database operations during build or when DATABASE_URL is not set
      if (typeof window === 'undefined' && !process.env.DATABASE_URL) {
        console.log('Database not available, using default templates')
        this.loadDefaultTemplates()
        return
      }

      const templates = await prisma.notificationTemplate.findMany({
        where: { isActive: true }
      })

      for (const template of templates) {
        this.registerTemplate({
          id: template.id,
          name: template.name,
          type: template.type,
          channel: template.channel,
          subject: template.subject || undefined,
          bodyTemplate: template.bodyTemplate,
          bodyHtml: template.bodyHtml || undefined,
          variables: template.variables as Record<string, any>,
          locale: template.locale,
          brand: template.brand as any
        })
      }

      console.log(`Loaded ${templates.length} notification templates`)
    } catch (error) {
      console.warn('Failed to initialize template engine, using defaults:', error)
      this.loadDefaultTemplates()
    }
  }

  /**
   * Load default templates when database is unavailable
   */
  private loadDefaultTemplates(): void {
    // Register minimal default templates for build time
    const defaultTemplates = [
      {
        id: 'default-cost-alert',
        name: 'Cost Alert',
        type: 'COST_ALERT',
        channel: 'email',
        subject: 'Cost Alert: {{provider}}',
        bodyTemplate: 'Your {{provider}} usage has exceeded the threshold.',
        variables: {},
        locale: 'en'
      }
    ]

    defaultTemplates.forEach(template => this.registerTemplate(template as any))
    console.log('Loaded default templates')
  }

  /**
   * Register a notification template
   */
  registerTemplate(template: NotificationTemplate): void {
    const key = this.getTemplateKey(template.type, template.channel, template.locale)
    this.templates.set(key, template)
    
    // Pre-compile templates for performance
    this.compileTemplate(template)
  }

  /**
   * Get a template by criteria
   */
  async getTemplate(
    name: string,
    type: NotificationType,
    channel: ChannelType,
    locale = 'en'
  ): Promise<NotificationTemplate> {
    // First try exact match
    let key = this.getTemplateKey(type, channel, locale)
    let template = this.templates.get(key)

    // Fall back to default locale if not found
    if (!template && locale !== 'en') {
      key = this.getTemplateKey(type, channel, 'en')
      template = this.templates.get(key)
    }

    // If still not found, try to load from database
    if (!template) {
      const dbTemplate = await prisma.notificationTemplate.findFirst({
        where: {
          OR: [
            { name, type, channel, locale },
            { name, type, channel, locale: 'en' },
            { type, channel, locale, isDefault: true },
            { type, channel, locale: 'en', isDefault: true }
          ],
          isActive: true
        },
        orderBy: [
          { locale: locale === 'en' ? 'asc' : 'desc' },
          { isDefault: 'desc' }
        ]
      })

      if (dbTemplate) {
        template = {
          id: dbTemplate.id,
          name: dbTemplate.name,
          type: dbTemplate.type,
          channel: dbTemplate.channel,
          subject: dbTemplate.subject || undefined,
          bodyTemplate: dbTemplate.bodyTemplate,
          bodyHtml: dbTemplate.bodyHtml || undefined,
          variables: dbTemplate.variables as Record<string, any>,
          locale: dbTemplate.locale,
          brand: dbTemplate.brand as any
        }
        
        this.registerTemplate(template)
      }
    }

    if (!template) {
      throw new TemplateError(
        `Template not found: ${name} for ${type}/${channel}/${locale}`,
        name
      )
    }

    return template
  }

  /**
   * Render a notification template
   */
  async render(
    templateName: string,
    variables: TemplateVariables,
    type?: NotificationType,
    channel?: ChannelType
  ): Promise<TemplateRenderResult> {
    try {
      // If type and channel provided, get template by those criteria
      let template: NotificationTemplate
      if (type && channel) {
        template = await this.getTemplate(templateName, type, channel, 'en')
      } else {
        // Find template by name (first match)
        const foundTemplate = Array.from(this.templates.values()).find(t => t.name === templateName)
        if (!foundTemplate) {
          throw new TemplateError(`Template not found: ${templateName}`, templateName)
        }
        template = foundTemplate
      }

      // Merge brand config into variables
      const enhancedVariables = {
        ...variables,
        branding: {
          ...template.brand,
          ...variables.branding
        }
      }

      // Render subject (for email)
      let subject: string | undefined
      if (template.subject) {
        subject = this.compile(template.subject, enhancedVariables)
      }

      // Render body template
      const body = this.compile(template.bodyTemplate, enhancedVariables)

      // Render HTML template if available
      let html: string | undefined
      if (template.bodyHtml) {
        html = this.compile(template.bodyHtml, enhancedVariables)
      }

      // Generate attachments if needed (for reports, etc.)
      const attachments = await this.generateAttachments(template, enhancedVariables)

      return {
        subject,
        body,
        html,
        attachments,
        metadata: {
          templateId: template.id,
          templateName: template.name,
          locale: template.locale
        }
      }
    } catch (error) {
      if (error instanceof TemplateError) {
        throw error
      }
      throw new TemplateError(`Failed to render template ${templateName}: ${(error as Error).message}`)
    }
  }

  /**
   * Compile a template string with variables
   */
  compile(template: string, variables: TemplateVariables): string {
    try {
      // Replace Handlebars-style variables {{variable}}
      return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
        const value = this.evaluateExpression(expression.trim(), variables)
        return value !== undefined ? String(value) : match
      })
    } catch (error) {
      console.error('Template compilation error:', error)
      return template
    }
  }

  /**
   * Register custom helper functions
   */
  registerHelper(name: string, helper: (...args: any[]) => string): void {
    this.helpers[name] = helper
  }

  /**
   * Validate template syntax
   */
  validateTemplate(template: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check for unclosed braces
    const openBraces = (template.match(/\{\{/g) || []).length
    const closeBraces = (template.match(/\}\}/g) || []).length
    
    if (openBraces !== closeBraces) {
      errors.push(`Mismatched braces: ${openBraces} opening, ${closeBraces} closing`)
    }

    // Check for valid variable names
    const variables = template.match(/\{\{([^}]+)\}\}/g) || []
    for (const variable of variables) {
      const expr = variable.replace(/^\{\{|\}\}$/g, '').trim()
      if (!this.isValidExpression(expr)) {
        errors.push(`Invalid expression: ${expr}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Generate preview for a template
   */
  async generatePreview(
    templateName: string,
    type: NotificationType,
    channel: ChannelType
  ): Promise<TemplateRenderResult> {
    const mockVariables: TemplateVariables = {
      user: {
        id: 'preview-user-id',
        name: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Example Corp'
      },
      organization: {
        id: 'preview-org-id',
        name: 'Example Corporation',
        domain: 'example.com'
      },
      notification: {
        type,
        priority: 'MEDIUM' as any,
        title: 'Preview Notification',
        message: 'This is a preview of your notification template.',
        data: { sampleData: true }
      },
      context: {
        currentCost: 150.75,
        threshold: 100,
        provider: 'openai',
        model: 'gpt-4',
        timeframe: 'Last 24 hours',
        timestamp: new Date()
      },
      branding: {
        primaryColor: '#3b82f6',
        logoUrl: 'https://example.com/logo.png',
        companyName: 'AI Cost Guardian',
        brandName: 'AI Cost Guardian',
        footerText: 'Manage your AI costs intelligently'
      }
    }

    return this.render(templateName, mockVariables, type, channel)
  }

  // Private methods

  private compileTemplate(template: NotificationTemplate): void {
    const key = this.getTemplateKey(template.type, template.channel, template.locale)
    
    // Store pre-compiled function for faster rendering
    this.compiledTemplates.set(key, (variables: TemplateVariables) => {
      return this.compile(template.bodyTemplate, variables)
    })
  }

  private getTemplateKey(type: NotificationType, channel: ChannelType, locale: string): string {
    return `${type}:${channel}:${locale}`
  }

  private evaluateExpression(expression: string, variables: TemplateVariables): any {
    try {
      // Handle helper functions
      if (expression.includes('(')) {
        return this.evaluateHelper(expression, variables)
      }

      // Handle object property access with dot notation
      const parts = expression.split('.')
      let value: any = variables
      
      for (const part of parts) {
        value = value?.[part]
        if (value === undefined) break
      }

      return value
    } catch (error) {
      console.warn(`Failed to evaluate expression: ${expression}`, error)
      return undefined
    }
  }

  private evaluateHelper(expression: string, variables: TemplateVariables): string {
    const match = expression.match(/(\w+)\((.*)\)/)
    if (!match) return expression

    const [, helperName, argsStr] = match
    const helper = this.helpers[helperName]
    
    if (!helper) {
      console.warn(`Unknown helper: ${helperName}`)
      return expression
    }

    // Parse arguments (simplified - doesn't handle complex cases)
    const args = argsStr.split(',').map(arg => {
      const trimmed = arg.trim().replace(/^["']|["']$/g, '')
      return this.evaluateExpression(trimmed, variables) || trimmed
    })

    return helper(...args)
  }

  private isValidExpression(expression: string): boolean {
    // Basic validation - can be enhanced
    return /^[\w\.\(\)\s,"']+$/.test(expression)
  }

  private async generateAttachments(
    template: NotificationTemplate,
    variables: TemplateVariables
  ): Promise<any[]> {
    const attachments: any[] = []

    // Generate report attachments for certain notification types
    if (template.type.includes('REPORT')) {
      // This would integrate with your reporting service
      // For now, return empty array
    }

    return attachments
  }

  private registerDefaultHelpers(): void {
    // Date formatting helper
    this.registerHelper('formatDate', (date: Date | string, format = 'short') => {
      const d = typeof date === 'string' ? new Date(date) : date
      if (!d || isNaN(d.getTime())) return 'Invalid Date'

      switch (format) {
        case 'short':
          return d.toLocaleDateString()
        case 'long':
          return d.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        case 'time':
          return d.toLocaleTimeString()
        case 'datetime':
          return d.toLocaleString()
        default:
          return d.toISOString()
      }
    })

    // Currency formatting helper
    this.registerHelper('formatCurrency', (amount: number, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
      }).format(amount || 0)
    })

    // Number formatting helper
    this.registerHelper('formatNumber', (num: number, decimals = 0) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(num || 0)
    })

    // Percentage helper
    this.registerHelper('formatPercent', (num: number, decimals = 1) => {
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format((num || 0) / 100)
    })

    // Conditional helper
    this.registerHelper('if', (condition: any, trueValue: string, falseValue = '') => {
      return condition ? trueValue : falseValue
    })

    // Uppercase helper
    this.registerHelper('upper', (text: string) => {
      return String(text || '').toUpperCase()
    })

    // Lowercase helper
    this.registerHelper('lower', (text: string) => {
      return String(text || '').toLowerCase()
    })

    // Capitalize helper
    this.registerHelper('capitalize', (text: string) => {
      return String(text || '').charAt(0).toUpperCase() + String(text || '').slice(1)
    })

    // Truncate helper
    this.registerHelper('truncate', (text: string, length = 50) => {
      const str = String(text || '')
      return str.length > length ? str.substring(0, length) + '...' : str
    })

    // Default value helper
    this.registerHelper('default', (value: any, defaultValue: string) => {
      return value || defaultValue
    })

    // Join array helper
    this.registerHelper('join', (array: any[], separator = ', ') => {
      return Array.isArray(array) ? array.join(separator) : String(array || '')
    })

    // Math helpers
    this.registerHelper('add', (a: number, b: number) => String((a || 0) + (b || 0)))
    this.registerHelper('subtract', (a: number, b: number) => String((a || 0) - (b || 0)))
    this.registerHelper('multiply', (a: number, b: number) => String((a || 0) * (b || 0)))
    this.registerHelper('divide', (a: number, b: number) => String(b !== 0 ? (a || 0) / b : 0))

    // Comparison helpers
    this.registerHelper('eq', (a: any, b: any) => String(a === b))
    this.registerHelper('neq', (a: any, b: any) => String(a !== b))
    this.registerHelper('gt', (a: number, b: number) => String((a || 0) > (b || 0)))
    this.registerHelper('gte', (a: number, b: number) => String((a || 0) >= (b || 0)))
    this.registerHelper('lt', (a: number, b: number) => String((a || 0) < (b || 0)))
    this.registerHelper('lte', (a: number, b: number) => String((a || 0) <= (b || 0)))
  }
}

// Default templates for common notification types
export const DEFAULT_TEMPLATES: Partial<NotificationTemplate>[] = [
  {
    name: 'cost-threshold-warning-email',
    type: 'COST_THRESHOLD_WARNING',
    channel: 'EMAIL',
    subject: 'Cost Alert: {{organization.name}} approaching spend limit',
    bodyTemplate: `
Hello {{user.name}},

Your AI usage costs are approaching the configured threshold.

Current spend: {{formatCurrency context.currentCost}}
Threshold: {{formatCurrency context.threshold}}
Percentage used: {{formatPercent (divide context.currentCost context.threshold)}}

Provider: {{context.provider}}
Time period: {{context.timeframe}}

Please review your usage and consider adjusting your limits if needed.

Best regards,
The AI Cost Guardian Team
    `.trim(),
    bodyHtml: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: {{branding.primaryColor}};">Cost Alert</h2>
  
  <p>Hello {{user.name}},</p>
  
  <p>Your AI usage costs are approaching the configured threshold.</p>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <table style="width: 100%;">
      <tr>
        <td><strong>Current spend:</strong></td>
        <td>{{formatCurrency context.currentCost}}</td>
      </tr>
      <tr>
        <td><strong>Threshold:</strong></td>
        <td>{{formatCurrency context.threshold}}</td>
      </tr>
      <tr>
        <td><strong>Percentage used:</strong></td>
        <td>{{formatPercent (divide context.currentCost context.threshold)}}</td>
      </tr>
      <tr>
        <td><strong>Provider:</strong></td>
        <td>{{context.provider}}</td>
      </tr>
    </table>
  </div>
  
  <p>Time period: {{context.timeframe}}</p>
  
  <p>Please review your usage and consider adjusting your limits if needed.</p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
  <p style="color: #666; font-size: 12px;">{{branding.footerText}}</p>
</div>
    `.trim(),
    variables: {
      user: { name: '', email: '' },
      context: { currentCost: 0, threshold: 0, provider: '', timeframe: '' },
      branding: {}
    },
    locale: 'en'
  },

  {
    name: 'cost-threshold-warning-slack',
    type: 'COST_THRESHOLD_WARNING',
    channel: 'SLACK',
    bodyTemplate: `
:warning: *Cost Alert for {{organization.name}}*

Current spend: *{{formatCurrency context.currentCost}}* / {{formatCurrency context.threshold}} ({{formatPercent (divide context.currentCost context.threshold)}})

Provider: {{context.provider}}
Time: {{context.timeframe}}

<https://dashboard.example.com/costs|View Dashboard>
    `.trim(),
    variables: {
      organization: { name: '' },
      context: { currentCost: 0, threshold: 0, provider: '', timeframe: '' }
    },
    locale: 'en'
  }
]

// Singleton instance
export const templateEngine = new NotificationTemplateEngine()

// Auto-initialize with default templates
templateEngine.initialize().catch(console.error)

// Register default templates
for (const template of DEFAULT_TEMPLATES) {
  if (template.type && template.channel) {
    templateEngine.registerTemplate(template as NotificationTemplate)
  }
}