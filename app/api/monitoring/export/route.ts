import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { usageMonitor } from '@/lib/services/usage-monitor'
import prisma from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const provider = searchParams.get('provider')

    // Default to last 30 days if no dates provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get usage data from database
    const usageData = await prisma.usage.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: start,
          lte: end
        },
        ...(provider && { provider: provider.toUpperCase() })
      },
      orderBy: { timestamp: 'desc' }
    })

    if (format === 'csv') {
      const csv = generateCSV(usageData)
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ai-usage-report-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'json') {
      // Get aggregated usage data
      const aggregatedUsage = await usageMonitor.getAggregatedUsage(start, end)
      
      const report = {
        reportMetadata: {
          generatedAt: new Date().toISOString(),
          period: {
            start: start.toISOString(),
            end: end.toISOString()
          },
          user: {
            email: session.user.email,
            company: session.user.company
          }
        },
        summary: {
          totalRecords: usageData.length,
          totalCost: usageData.reduce((sum: number, record: any) => sum + record.cost, 0),
          totalTokens: usageData.reduce((sum: number, record: any) => sum + record.totalTokens, 0),
          providers: Array.from(new Set(usageData.map((record: any) => record.provider)))
        },
        aggregatedData: aggregatedUsage,
        detailedUsage: usageData
      }

      return NextResponse.json(report, {
        headers: {
          'Content-Disposition': `attachment; filename="ai-usage-report-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.json"`
        }
      })
    } else {
      return NextResponse.json({ error: 'Unsupported format. Use csv or json' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Error exporting usage data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export usage data' },
      { status: 500 }
    )
  }
}

function generateCSV(usageData: any[]): string {
  if (usageData.length === 0) {
    return 'No data available for the selected period'
  }

  // CSV headers
  const headers = [
    'Timestamp',
    'Provider',
    'Model',
    'Input Tokens',
    'Output Tokens',
    'Total Tokens',
    'Cost (USD)',
    'Request ID'
  ]

  // Generate CSV content
  const csvContent = [
    headers.join(','),
    ...usageData.map(record => [
      record.timestamp.toISOString(),
      record.provider,
      record.model,
      record.inputTokens,
      record.outputTokens,
      record.totalTokens,
      record.cost.toFixed(4),
      record.requestId || ''
    ].map(field => 
      // Escape fields that contain commas or quotes
      typeof field === 'string' && (field.includes(',') || field.includes('"')) 
        ? `"${field.replace(/"/g, '""')}"` 
        : field
    ).join(','))
  ].join('\n')

  return csvContent
}

// PDF export endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { startDate, endDate, provider, includeCharts } = await request.json()

    // Default to last 30 days if no dates provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get aggregated usage data for PDF report
    const aggregatedUsage = await usageMonitor.getAggregatedUsage(start, end)
    
    // Generate PDF report data
    const reportData = {
      title: 'AI Usage Report',
      company: session.user.company || 'Your Organization',
      period: {
        start: start.toLocaleDateString(),
        end: end.toLocaleDateString()
      },
      summary: {
        totalCost: Object.values(aggregatedUsage).reduce((sum: number, usage: any) => sum + (usage.totalCost || 0), 0),
        totalTokens: Object.values(aggregatedUsage).reduce((sum: number, usage: any) => sum + (usage.totalTokens || 0), 0),
        totalRequests: Object.values(aggregatedUsage).reduce((sum: number, usage: any) => sum + (usage.totalRequests || 0), 0)
      },
      providerBreakdown: aggregatedUsage,
      generatedAt: new Date().toLocaleString()
    }

    // For now, return the PDF report data as JSON
    // In a real implementation, you would use a PDF generation library like puppeteer or jsPDF
    return NextResponse.json({
      success: true,
      message: 'PDF generation would be implemented here',
      reportData,
      downloadUrl: null // Would contain the PDF download URL
    })

  } catch (error: any) {
    console.error('Error generating PDF report:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF report' },
      { status: 500 }
    )
  }
}