// This is a temporary file to show the fix for insights and performance tabs
// Replace the existing insights and performance sections with these:

{selectedView === 'insights' && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="mt-8"
  >
    {businessInsights.length > 0 ? (
      <div className="space-y-6">
        {/* AI-Powered Recommendations */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-800/20 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">AI-Powered Business Intelligence</h3>
            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-full">
              Real-time
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {businessInsights.map((insight: any, index: number) => (
              <div key={index} className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                        {insight.priority}
                      </div>
                      <span className="text-gray-400 text-xs capitalize">{insight.category}</span>
                    </div>
                    <h4 className="text-white font-semibold mb-2">{insight.title}</h4>
                    <p className="text-gray-300 text-sm">{insight.description}</p>
                  </div>
                  <span className="text-gray-400 text-xs">{insight.confidence}%</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-sm font-medium ${insight.impact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {insight.impact > 0 ? '+' : ''}{insight.impact}% impact
                  </span>
                  <button className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                    Take Action <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-12 text-center">
        <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">No Insights Available</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Start using AI services to generate insights and recommendations.
        </p>
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configure AI Services
        </Link>
      </div>
    )}
  </motion.div>
)}

{selectedView === 'performance' && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="mt-8"
  >
    {performanceMetrics.providers.length > 0 ? (
      <div className="space-y-6">
        {/* Provider Performance Matrix */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-400" />
              Provider Performance Matrix
            </h3>
            <Link href="/analytics/providers/v2" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
              Detailed Analysis <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {performanceMetrics.providers.map((provider: any) => (
              <div key={provider.id} className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="text-white font-semibold capitalize">{provider.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      provider.status === 'active' 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {provider.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">${provider.spend.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">{provider.share.toFixed(1)}% of total</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Performance</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${provider.performance}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-300">{provider.performance.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Reliability</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${provider.reliability}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-300">{provider.reliability.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Cost Efficiency</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${provider.costEfficiency}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-300">{provider.costEfficiency.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {provider.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : provider.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    ) : (
                      <Activity className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`text-sm ${
                      provider.change > 0 ? 'text-green-400' : provider.change < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {provider.change > 0 ? '+' : ''}{provider.change}% this week
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">{provider.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-12 text-center">
        <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">No Performance Data Available</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Start using AI providers to track performance metrics and optimization opportunities.
        </p>
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Add API Keys
        </Link>
      </div>
    )}
  </motion.div>
)}