import { PrismaClient } from '@prisma/client'
import { subDays, addDays, addHours, startOfDay } from 'date-fns'

const prisma = new PrismaClient()

interface ForecastDataConfig {
  userId: string
  organizationId?: string
  daysOfHistory: number
  baseGrowthRate: number // Percentage growth per month
  seasonalVariation: number // 0-1, amount of seasonal variation
  weeklyPattern: boolean // Higher usage during weekdays
  peakHours: number[] // Hours with higher usage
}

// AI provider and model configurations with realistic pricing
const PROVIDERS = [
  {
    name: 'openai',
    models: [
      { name: 'gpt-4o', inputCost: 0.005, outputCost: 0.015, popularity: 0.3 },
      { name: 'gpt-4o-mini', inputCost: 0.0001, outputCost: 0.0006, popularity: 0.4 },
      { name: 'gpt-3.5-turbo', inputCost: 0.0010, outputCost: 0.0020, popularity: 0.2 },
      { name: 'text-embedding-3-large', inputCost: 0.00013, outputCost: 0, popularity: 0.1 }
    ]
  },
  {
    name: 'anthropic',
    models: [
      { name: 'claude-3.5-sonnet', inputCost: 0.003, outputCost: 0.015, popularity: 0.35 },
      { name: 'claude-3-haiku', inputCost: 0.00025, outputCost: 0.00125, popularity: 0.4 },
      { name: 'claude-3-opus', inputCost: 0.015, outputCost: 0.075, popularity: 0.15 },
      { name: 'claude-3-sonnet', inputCost: 0.003, outputCost: 0.015, popularity: 0.1 }
    ]
  },
  {
    name: 'google',
    models: [
      { name: 'gemini-1.5-pro', inputCost: 0.0035, outputCost: 0.0105, popularity: 0.25 },
      { name: 'gemini-1.5-flash', inputCost: 0.00015, outputCost: 0.0006, popularity: 0.45 },
      { name: 'gemini-pro', inputCost: 0.0005, outputCost: 0.0015, popularity: 0.3 }
    ]
  },
  {
    name: 'perplexity',
    models: [
      { name: 'sonar-medium-online', inputCost: 0.0006, outputCost: 0.0018, popularity: 0.6 },
      { name: 'sonar-small-online', inputCost: 0.0002, outputCost: 0.0006, popularity: 0.4 }
    ]
  }
]

function generateRealisticUsage(
  date: Date,
  hour: number,
  config: ForecastDataConfig,
  dayIndex: number
): {
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  cost: number
} {
  // Apply growth factor
  const growthFactor = 1 + (config.baseGrowthRate / 100) * (dayIndex / 30)

  // Apply seasonal variation (simulate monthly cycles)
  const seasonalFactor = 1 + config.seasonalVariation * Math.sin((dayIndex / 30) * 2 * Math.PI)

  // Apply weekly pattern (Monday-Friday higher usage)
  const dayOfWeek = date.getDay()
  const weeklyFactor = config.weeklyPattern
    ? (dayOfWeek >= 1 && dayOfWeek <= 5 ? 1.3 : 0.7)
    : 1.0

  // Apply hourly pattern
  const isPeakHour = config.peakHours.includes(hour)
  const hourlyFactor = isPeakHour ? 2.0 : 0.8

  // Base usage intensity
  let baseUsage = Math.random() * growthFactor * seasonalFactor * weeklyFactor * hourlyFactor

  // Ensure some minimum usage
  baseUsage = Math.max(baseUsage, 0.1)

  // Select provider/model based on popularity
  const allModels = PROVIDERS.flatMap(p =>
    p.models.map(m => ({ ...m, provider: p.name }))
  )

  // Weighted random selection
  const totalPopularity = allModels.reduce((sum, m) => sum + m.popularity, 0)
  let random = Math.random() * totalPopularity

  let selectedModel = allModels[0]
  for (const model of allModels) {
    random -= model.popularity
    if (random <= 0) {
      selectedModel = model
      break
    }
  }

  // Generate realistic token counts
  const avgInputTokens = 1000 + Math.random() * 2000 // 1K-3K input tokens
  const avgOutputTokens = 200 + Math.random() * 800   // 200-1K output tokens

  const inputTokens = Math.floor(avgInputTokens * baseUsage)
  const outputTokens = Math.floor(avgOutputTokens * baseUsage)

  // Calculate cost based on realistic pricing
  const cost = (inputTokens / 1000) * selectedModel.inputCost +
               (outputTokens / 1000) * selectedModel.outputCost

  return {
    provider: selectedModel.provider,
    model: selectedModel.name,
    inputTokens,
    outputTokens,
    cost
  }
}

async function generateForecastData(config: ForecastDataConfig) {
  console.log(`🚀 Generating ${config.daysOfHistory} days of forecast data...`)

  const usageRecords = []
  const startDate = subDays(new Date(), config.daysOfHistory)

  for (let dayIndex = 0; dayIndex < config.daysOfHistory; dayIndex++) {
    const currentDate = addDays(startDate, dayIndex)
    const dayStart = startOfDay(currentDate)

    // Generate 8-50 requests per day with realistic distribution
    const requestsPerDay = Math.floor(8 + Math.random() * 42)

    for (let requestIndex = 0; requestIndex < requestsPerDay; requestIndex++) {
      // Generate realistic timestamp distribution throughout the day
      const hour = Math.floor(Math.random() * 24)
      const minute = Math.floor(Math.random() * 60)
      const timestamp = addHours(dayStart, hour)
      timestamp.setMinutes(minute)

      const usage = generateRealisticUsage(currentDate, hour, config, dayIndex)

      usageRecords.push({
        userId: config.userId,
        organizationId: config.organizationId,
        timestamp,
        provider: usage.provider,
        model: usage.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        cost: usage.cost,
        metadata: JSON.stringify({
          request_type: Math.random() > 0.7 ? 'batch' : 'interactive',
          source: Math.random() > 0.5 ? 'api' : 'ui'
        })
      })
    }
  }

  console.log(`📊 Generated ${usageRecords.length} usage records`)

  // Insert in batches to avoid database limits
  const batchSize = 100
  for (let i = 0; i < usageRecords.length; i += batchSize) {
    const batch = usageRecords.slice(i, i + batchSize)
    await prisma.usage.createMany({
      data: batch,
      skipDuplicates: true
    })
    console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(usageRecords.length / batchSize)}`)
  }

  // Generate cost predictions for this data
  console.log('🔮 Generating cost predictions...')

  // Create predictions for different periods
  const predictions = [
    {
      userId: config.userId,
      organizationId: config.organizationId,
      period: 'daily',
      predictedCost: usageRecords.slice(-7).reduce((sum, r) => sum + r.cost, 0) / 7 * 1.1,
      confidence: 0.85,
      basedOnDays: 7,
      features: JSON.stringify({
        growthRate: config.baseGrowthRate,
        avgDailyCost: usageRecords.slice(-7).reduce((sum, r) => sum + r.cost, 0) / 7,
        confidence: 0.85
      })
    },
    {
      userId: config.userId,
      organizationId: config.organizationId,
      period: 'weekly',
      predictedCost: usageRecords.slice(-14).reduce((sum, r) => sum + r.cost, 0) / 2 * 1.15,
      confidence: 0.78,
      basedOnDays: 14,
      features: JSON.stringify({
        growthRate: config.baseGrowthRate,
        weeklyPattern: config.weeklyPattern,
        confidence: 0.78
      })
    },
    {
      userId: config.userId,
      organizationId: config.organizationId,
      period: 'monthly',
      predictedCost: usageRecords.slice(-30).reduce((sum, r) => sum + r.cost, 0) * 1.2,
      confidence: 0.72,
      basedOnDays: 30,
      features: JSON.stringify({
        growthRate: config.baseGrowthRate,
        seasonalVariation: config.seasonalVariation,
        confidence: 0.72
      })
    }
  ]

  for (const prediction of predictions) {
    await prisma.costPrediction.create({
      data: prediction
    })
  }

  console.log('✅ Cost predictions generated')

  // Calculate and display statistics
  const totalCost = usageRecords.reduce((sum, r) => sum + r.cost, 0)
  const avgDailyCost = totalCost / config.daysOfHistory
  const totalTokens = usageRecords.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0)

  console.log('\n📈 Generated Data Statistics:')
  console.log(`   Total Cost: $${totalCost.toFixed(2)}`)
  console.log(`   Average Daily Cost: $${avgDailyCost.toFixed(2)}`)
  console.log(`   Total Tokens: ${totalTokens.toLocaleString()}`)
  console.log(`   Total Requests: ${usageRecords.length}`)
  console.log(`   Growth Rate: ${config.baseGrowthRate}% per month`)

  return {
    totalCost,
    avgDailyCost,
    totalTokens,
    totalRequests: usageRecords.length
  }
}

// Example configuration for different user types
const ENTERPRISE_CONFIG: ForecastDataConfig = {
  userId: '', // Will be set dynamically
  daysOfHistory: 90,
  baseGrowthRate: 15, // 15% monthly growth
  seasonalVariation: 0.3,
  weeklyPattern: true,
  peakHours: [9, 10, 11, 14, 15, 16] // Business hours
}

const STARTUP_CONFIG: ForecastDataConfig = {
  userId: '', // Will be set dynamically
  daysOfHistory: 60,
  baseGrowthRate: 35, // 35% monthly growth
  seasonalVariation: 0.5,
  weeklyPattern: false, // 24/7 usage
  peakHours: [10, 14, 16, 20, 22] // Irregular hours
}

const RESEARCH_CONFIG: ForecastDataConfig = {
  userId: '', // Will be set dynamically
  daysOfHistory: 120,
  baseGrowthRate: 8, // 8% monthly growth
  seasonalVariation: 0.2,
  weeklyPattern: true,
  peakHours: [9, 10, 13, 14, 15] // Academic hours
}

async function main() {
  try {
    console.log('🎯 AI Cost Guardian - Forecast Data Generator')
    console.log('============================================\n')

    // Get or create a test user
    const testUser = await prisma.user.upsert({
      where: { email: 'forecast-demo@aicostguardian.com' },
      update: {},
      create: {
        email: 'forecast-demo@aicostguardian.com',
        name: 'Forecast Demo User',
        role: 'USER'
      },
      include: { organization: true }
    })

    console.log(`👤 Using user: ${testUser.name} (${testUser.email})`)

    // Generate data for different scenarios
    const configs = [
      { ...ENTERPRISE_CONFIG, userId: testUser.id, organizationId: testUser.organizationId || undefined },
    ]

    let totalStats = {
      totalCost: 0,
      avgDailyCost: 0,
      totalTokens: 0,
      totalRequests: 0
    }

    for (const config of configs) {
      const stats = await generateForecastData(config)
      totalStats.totalCost += stats.totalCost
      totalStats.avgDailyCost += stats.avgDailyCost
      totalStats.totalTokens += stats.totalTokens
      totalStats.totalRequests += stats.totalRequests
    }

    console.log('\n🎉 Forecast Data Generation Complete!')
    console.log('=====================================')
    console.log(`💰 Total Generated Cost: $${totalStats.totalCost.toFixed(2)}`)
    console.log(`📊 Total Requests: ${totalStats.totalRequests.toLocaleString()}`)
    console.log(`🔤 Total Tokens: ${totalStats.totalTokens.toLocaleString()}`)
    console.log('\n🔍 Next Steps:')
    console.log('   1. Visit /analytics?tab=forecasts to see visualizations')
    console.log('   2. Check the Cost Forecast Visualization')
    console.log('   3. Review predictions and accuracy metrics')

  } catch (error) {
    console.error('❌ Error generating forecast data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// CLI execution
if (require.main === module) {
  main()
}

export { generateForecastData, ENTERPRISE_CONFIG, STARTUP_CONFIG, RESEARCH_CONFIG }