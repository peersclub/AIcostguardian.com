'use client'

import { motion } from 'framer-motion'
import { Code2, Terminal, GitBranch, Package, Cpu, Database, ChevronRight, CheckCircle, ArrowRight, Zap, Github, Container, Layers, Building, RefreshCw, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { getAIProviderLogo, getAIProviderLogoWithFallback } from '@/components/ui/ai-logos'
import { AI_PROVIDER_IDS } from '@/lib/ai-providers-config'

const features = [
  {
    icon: Terminal,
    title: 'CLI & SDK',
    description: 'Native SDKs for Python, Node.js, Go, and more. Full CLI for automation.',
  },
  {
    icon: GitBranch,
    title: 'Git Integration',
    description: 'Track costs per branch, PR, and deployment. Integrate with GitHub Actions.',
  },
  {
    icon: Package,
    title: 'Package Manager',
    description: 'Install via npm, pip, cargo, or your favorite package manager.',
  },
  {
    icon: Cpu,
    title: 'Real-time Monitoring',
    description: 'Stream metrics to your monitoring stack. Prometheus and Grafana ready.',
  },
  {
    icon: Database,
    title: 'Data Export',
    description: 'Export raw data to S3, BigQuery, or your data warehouse for analysis.',
  },
  {
    icon: Zap,
    title: 'Webhooks',
    description: 'Real-time notifications for cost spikes, limits, and anomalies.',
  }
]

const codeExamples = [
  {
    language: 'Python',
    code: `from aicostguardian import Guardian

# Initialize the client
guardian = Guardian(api_key="your_api_key")

# Track AI API calls
with guardian.track("gpt-4-analysis"):
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": "Analyze this data"}]
    )

# Get cost insights
costs = guardian.get_costs(timeframe="24h")
print(f"Total cost: $\{costs.total:.2f}")`
  },
  {
    language: 'Node.js',
    code: `import { Guardian } from '@aicostguardian/sdk';

// Initialize the client
const guardian = new Guardian({ apiKey: 'your_api_key' });

// Track AI API calls
const tracked = await guardian.track('gpt-4-analysis', async () => {
  return await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Analyze this data' }]
  });
});

// Get cost insights
const costs = await guardian.getCosts({ timeframe: '24h' });
console.log(\`Total cost: $\${costs.total.toFixed(2)}\`);`
  },
  {
    language: 'CLI',
    code: `# Install CLI
$ npm install -g @aicostguardian/cli

# Configure API key
$ aicost configure --api-key your_api_key

# Track costs in your scripts
$ aicost track --name "batch-processing" -- python process.py

# View real-time costs
$ aicost dashboard

# Export cost report
$ aicost export --format csv --output costs.csv`
  }
]

const integrations = [
  { name: 'GitHub Actions', icon: Github, description: 'Track costs per workflow' },
  { name: 'Docker', icon: Container, description: 'Monitor containerized AI workloads' },
  { name: 'Kubernetes', icon: Layers, description: 'Cost allocation per pod/namespace' },
  { name: 'Terraform', icon: Building, description: 'Infrastructure cost tracking' },
  { name: 'CI/CD', icon: RefreshCw, description: 'Jenkins, CircleCI, GitLab CI' },
  { name: 'Jupyter', icon: BookOpen, description: 'Notebook cost tracking' }
]

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-blue-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium mb-6 border border-green-500/30">
              <Code2 className="w-4 h-4" />
              <span>Built for Developers</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">
              AI Cost Tracking for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mt-2">
                Developer Teams
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Open source SDKs, powerful APIs, and CLI tools to track and optimize AI costs in your development workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/docs/quickstart"
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium inline-flex items-center gap-2"
              >
                View Documentation
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="https://github.com/aicostguardian"
                className="px-8 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                View on GitHub
              </Link>
            </div>
          </motion.div>

          {/* Quick Install */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 max-w-2xl mx-auto"
          >
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <code className="text-green-400 font-mono text-sm">
                $ npm install @aicostguardian/sdk
              </code>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Start Tracking in Minutes</h2>
            <p className="text-lg text-gray-400">Simple integration with your existing codebase</p>
          </motion.div>

          <div className="space-y-8">
            {codeExamples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
              >
                <div className="px-6 py-3 bg-gray-900 border-b border-gray-700">
                  <span className="text-sm font-medium text-gray-300">{example.language}</span>
                </div>
                <pre className="p-6 overflow-x-auto">
                  <code className="text-sm text-gray-300 font-mono whitespace-pre">
                    {example.code}
                  </code>
                </pre>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Developer-First Features</h2>
            <p className="text-lg text-gray-400">Everything you need to integrate cost tracking</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-green-500/50 transition-colors"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Works with Your Stack</h2>
            <p className="text-lg text-gray-400">Seamless integration with your development tools</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {integrations.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition-colors text-center"
              >
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <integration.icon className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-sm font-medium text-white">{integration.name}</div>
                <div className="text-xs text-gray-500 mt-1">{integration.description}</div>
              </motion.div>
            ))}
          </div>

          {/* AI Providers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-gray-400 mb-6">Track costs across all major AI providers</p>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              {AI_PROVIDER_IDS.map((provider) => {
                const logo = getAIProviderLogo(provider, 'w-8 h-8', true)
                return logo ? (
                  <div key={provider} className="opacity-60 hover:opacity-100 transition-opacity">
                    {logo}
                  </div>
                ) : null
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* API Documentation */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Powerful REST API
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                Full programmatic access to all features. Build custom integrations, 
                automate workflows, and embed cost tracking into your applications.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'RESTful API with OpenAPI 3.0 spec',
                  'GraphQL endpoint for complex queries',
                  'WebSocket support for real-time data',
                  'Rate limiting: 10,000 requests/hour',
                  'Comprehensive API documentation'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/docs/api"
                className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium"
              >
                Explore API Docs
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden"
            >
              <div className="px-6 py-3 bg-gray-800 border-b border-gray-700">
                <span className="text-sm font-medium text-gray-300">API Response</span>
              </div>
              <pre className="p-6 overflow-x-auto">
                <code className="text-sm text-gray-300 font-mono whitespace-pre">
{`{
  "costs": {
    "total": 127.45,
    "by_provider": {
      "openai": 89.20,
      "claude": 38.25
    },
    "by_model": {
      "gpt-4": 72.10,
      "claude-3-opus": 38.25,
      "gpt-3.5-turbo": 17.10
    }
  },
  "usage": {
    "total_requests": 15234,
    "total_tokens": 4827193
  },
  "timeframe": "24h"
}`}
                </code>
              </pre>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-12 border border-gray-700"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Open Source & Extensible
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Our SDKs are open source. Contribute, extend, or self-host.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="https://github.com/aicostguardian/sdk"
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                ⭐ Star on GitHub
              </Link>
              <Link
                href="/docs/self-hosting"
                className="px-6 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Self-Hosting Guide
              </Link>
            </div>
            <div className="flex justify-center gap-8 text-sm text-gray-400">
              <span>MIT License</span>
              <span>•</span>
              <span>1.2k Stars</span>
              <span>•</span>
              <span>150+ Contributors</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Tracking AI Costs Today
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Free for individual developers. Team plans available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-medium inline-flex items-center gap-2"
              >
                Get API Key
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs"
                className="px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
              >
                Read Documentation
              </Link>
            </div>
            <p className="text-white/80 text-sm mt-4">Free tier: 10,000 API calls/month</p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}