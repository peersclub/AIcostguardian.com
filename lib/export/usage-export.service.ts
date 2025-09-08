import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

interface ExportOptions {
  userId: string
  organizationId?: string
  startDate: Date
  endDate: Date
  format: 'csv' | 'json' | 'pdf'
  includeDetails?: boolean
  groupBy?: 'day' | 'week' | 'month' | 'provider' | 'model'
}

interface ExportResult {
  data: string | Buffer
  filename: string
  mimeType: string
}

class UsageExportService {
  private static instance: UsageExportService

  private constructor() {}

  static getInstance(): UsageExportService {
    if (!UsageExportService.instance) {
      UsageExportService.instance = new UsageExportService()
    }
    return UsageExportService.instance
  }

  /**
   * Export usage data in various formats
   */
  async exportUsage(options: ExportOptions): Promise<ExportResult> {
    // Fetch usage data
    const usage = await this.fetchUsageData(options)
    
    // Process based on format
    switch (options.format) {
      case 'csv':
        return this.exportAsCSV(usage, options)
      case 'json':
        return this.exportAsJSON(usage, options)
      case 'pdf':
        return this.exportAsPDF(usage, options)
      default:
        throw new Error(`Unsupported format: ${options.format}`)
    }
  }

  /**
   * Fetch usage data from database
   */
  private async fetchUsageData(options: ExportOptions) {
    const where = options.organizationId
      ? {
          organizationId: options.organizationId,
          timestamp: {
            gte: options.startDate,
            lte: options.endDate
          }
        }
      : {
          userId: options.userId,
          timestamp: {
            gte: options.startDate,
            lte: options.endDate
          }
        }
    
    const usage = await prisma.usage.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })
    
    return usage
  }

  /**
   * Export as CSV
   */
  private exportAsCSV(usage: any[], options: ExportOptions): ExportResult {
    const headers = [
      'Date',
      'Time',
      'User',
      'Provider',
      'Model',
      'Input Tokens',
      'Output Tokens',
      'Total Tokens',
      'Cost ($)',
      'Latency (ms)',
      'Status'
    ]
    
    // Add metadata if detailed export
    if (options.includeDetails) {
      headers.push('Request ID', 'Endpoint', 'Error')
    }
    
    const rows = usage.map(record => {
      const row = [
        format(new Date(record.timestamp), 'yyyy-MM-dd'),
        format(new Date(record.timestamp), 'HH:mm:ss'),
        record.user?.email || 'N/A',
        record.provider,
        record.model,
        record.inputTokens || 0,
        record.outputTokens || 0,
        record.totalTokens || 0,
        record.cost.toFixed(6),
        record.latency || 'N/A',
        record.success ? 'Success' : 'Failed'
      ]
      
      if (options.includeDetails) {
        row.push(
          record.requestId || 'N/A',
          record.endpoint || 'N/A',
          record.error || 'N/A'
        )
      }
      
      return row
    })
    
    // Group by if specified
    if (options.groupBy) {
      return this.groupAndExportCSV(usage, options)
    }
    
    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const filename = `usage-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`
    
    return {
      data: csvContent,
      filename,
      mimeType: 'text/csv'
    }
  }

  /**
   * Group data and export as CSV
   */
  private groupAndExportCSV(usage: any[], options: ExportOptions): ExportResult {
    const grouped = new Map<string, any>()
    
    for (const record of usage) {
      let key: string
      
      switch (options.groupBy) {
        case 'day':
          key = format(new Date(record.timestamp), 'yyyy-MM-dd')
          break
        case 'week':
          key = format(new Date(record.timestamp), 'yyyy-ww')
          break
        case 'month':
          key = format(new Date(record.timestamp), 'yyyy-MM')
          break
        case 'provider':
          key = record.provider
          break
        case 'model':
          key = record.model
          break
        default:
          key = 'all'
      }
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          count: 0,
          totalCost: 0,
          totalTokens: 0,
          providers: new Set(),
          models: new Set()
        })
      }
      
      const group = grouped.get(key)!
      group.count++
      group.totalCost += record.cost
      group.totalTokens += record.totalTokens || 0
      group.providers.add(record.provider)
      group.models.add(record.model)
    }
    
    // Build CSV for grouped data
    const headers = ['Group', 'Requests', 'Total Cost ($)', 'Total Tokens', 'Providers', 'Models']
    const rows = Array.from(grouped.values()).map(group => [
      group.key,
      group.count,
      group.totalCost.toFixed(2),
      group.totalTokens,
      Array.from(group.providers).join('; '),
      Array.from(group.models).join('; ')
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const filename = `usage-summary-${options.groupBy}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    
    return {
      data: csvContent,
      filename,
      mimeType: 'text/csv'
    }
  }

  /**
   * Export as JSON
   */
  private exportAsJSON(usage: any[], options: ExportOptions): ExportResult {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        startDate: options.startDate.toISOString(),
        endDate: options.endDate.toISOString(),
        recordCount: usage.length,
        totalCost: usage.reduce((sum, r) => sum + r.cost, 0),
        totalTokens: usage.reduce((sum, r) => sum + (r.totalTokens || 0), 0)
      },
      usage: usage.map(record => ({
        timestamp: record.timestamp,
        user: record.user?.email,
        provider: record.provider,
        model: record.model,
        promptTokens: record.inputTokens,
        completionTokens: record.outputTokens,
        totalTokens: record.totalTokens,
        cost: record.cost,
        latency: record.latency,
        success: record.success,
        ...(options.includeDetails && {
          requestId: record.requestId,
          endpoint: record.endpoint,
          error: record.error,
          metadata: record.metadata
        })
      }))
    }
    
    const filename = `usage-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`
    
    return {
      data: JSON.stringify(exportData, null, 2),
      filename,
      mimeType: 'application/json'
    }
  }

  /**
   * Export as PDF (returns HTML that can be converted to PDF)
   */
  private exportAsPDF(usage: any[], options: ExportOptions): ExportResult {
    const totalCost = usage.reduce((sum, r) => sum + r.cost, 0)
    const totalTokens = usage.reduce((sum, r) => sum + (r.totalTokens || 0), 0)
    const totalRequests = usage.length
    
    // Group by provider for summary
    const byProvider = new Map<string, { count: number, cost: number, tokens: number }>()
    
    for (const record of usage) {
      if (!byProvider.has(record.provider)) {
        byProvider.set(record.provider, { count: 0, cost: 0, tokens: 0 })
      }
      const stats = byProvider.get(record.provider)!
      stats.count++
      stats.cost += record.cost
      stats.tokens += record.totalTokens || 0
    }
    
    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Usage Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 { color: #1a1a1a; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
    h2 { color: #4f46e5; margin-top: 30px; }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .summary-card {
      padding: 15px;
      background: #f3f4f6;
      border-radius: 8px;
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #4f46e5;
      color: white;
      padding: 10px;
      text-align: left;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:hover {
      background: #f9fafb;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <h1>AI Usage Report</h1>
  
  <div class="header">
    <div>
      <strong>Report Period:</strong><br>
      ${format(options.startDate, 'MMM dd, yyyy')} - ${format(options.endDate, 'MMM dd, yyyy')}
    </div>
    <div>
      <strong>Generated:</strong><br>
      ${format(new Date(), 'MMM dd, yyyy HH:mm')}
    </div>
  </div>
  
  <h2>Summary</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <h3>Total Cost</h3>
      <div class="value">$${totalCost.toFixed(2)}</div>
    </div>
    <div class="summary-card">
      <h3>Total Requests</h3>
      <div class="value">${totalRequests.toLocaleString()}</div>
    </div>
    <div class="summary-card">
      <h3>Total Tokens</h3>
      <div class="value">${totalTokens.toLocaleString()}</div>
    </div>
  </div>
  
  <h2>Usage by Provider</h2>
  <table>
    <thead>
      <tr>
        <th>Provider</th>
        <th>Requests</th>
        <th>Cost</th>
        <th>Tokens</th>
        <th>Avg Cost/Request</th>
      </tr>
    </thead>
    <tbody>
      ${Array.from(byProvider.entries()).map(([provider, stats]) => `
        <tr>
          <td>${provider}</td>
          <td>${stats.count.toLocaleString()}</td>
          <td>$${stats.cost.toFixed(2)}</td>
          <td>${stats.tokens.toLocaleString()}</td>
          <td>$${(stats.cost / stats.count).toFixed(4)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  ${options.includeDetails ? `
  <h2>Detailed Usage</h2>
  <table>
    <thead>
      <tr>
        <th>Date/Time</th>
        <th>Provider</th>
        <th>Model</th>
        <th>Tokens</th>
        <th>Cost</th>
      </tr>
    </thead>
    <tbody>
      ${usage.slice(0, 100).map(record => `
        <tr>
          <td>${format(new Date(record.timestamp), 'MMM dd HH:mm')}</td>
          <td>${record.provider}</td>
          <td>${record.model}</td>
          <td>${record.totalTokens || 0}</td>
          <td>$${record.cost.toFixed(4)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ${usage.length > 100 ? '<p><em>Showing first 100 records</em></p>' : ''}
  ` : ''}
  
  <div class="footer">
    <p>AI Cost Guardian - Usage Report</p>
    <p>This report contains ${totalRequests} usage records from ${format(options.startDate, 'MMM dd, yyyy')} to ${format(options.endDate, 'MMM dd, yyyy')}</p>
  </div>
</body>
</html>
    `
    
    const filename = `usage-report-${format(new Date(), 'yyyy-MM-dd')}.html`
    
    return {
      data: html,
      filename,
      mimeType: 'text/html'
    }
  }
}

// Export singleton instance
export const usageExportService = UsageExportService.getInstance()

// Export types
export type { ExportOptions, ExportResult }