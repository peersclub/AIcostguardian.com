-- Unified metrics table (main source of truth)
CREATE TABLE IF NOT EXISTS unified_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'xai')),
  organization_id UUID NOT NULL,
  user_id UUID,
  timestamp TIMESTAMPTZ NOT NULL,
  
  -- Unified token metrics
  input_tokens BIGINT NOT NULL DEFAULT 0,
  output_tokens BIGINT NOT NULL DEFAULT 0,
  total_tokens BIGINT GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  
  -- Request metrics
  successful_requests INTEGER NOT NULL DEFAULT 0,
  failed_requests INTEGER NOT NULL DEFAULT 0,
  total_requests INTEGER GENERATED ALWAYS AS (successful_requests + failed_requests) STORED,
  
  -- Cost metrics (always in USD)
  cost_usd DECIMAL(12, 6) NOT NULL DEFAULT 0,
  cost_breakdown JSONB,
  
  -- Model information
  model_name VARCHAR(100) NOT NULL,
  model_family VARCHAR(50) NOT NULL,
  model_category VARCHAR(20) NOT NULL CHECK (model_category IN ('text', 'vision', 'embedding', 'audio', 'image')),
  model_version VARCHAR(50),
  
  -- Aggregation metadata
  aggregation_level VARCHAR(10) NOT NULL CHECK (aggregation_level IN ('raw', 'minute', 'hour', 'day', 'month')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_unified_provider_timestamp ON unified_usage_metrics(provider, timestamp DESC);
CREATE INDEX idx_unified_org_provider_period ON unified_usage_metrics(organization_id, provider, period_start DESC);
CREATE INDEX idx_unified_user_provider ON unified_usage_metrics(user_id, provider) WHERE user_id IS NOT NULL;
CREATE INDEX idx_unified_aggregation ON unified_usage_metrics(aggregation_level, period_start DESC);
CREATE INDEX idx_unified_model ON unified_usage_metrics(model_family, model_name);

-- Prevent duplicates
CREATE UNIQUE INDEX idx_unified_unique ON unified_usage_metrics(
  provider, 
  organization_id, 
  timestamp, 
  model_name, 
  aggregation_level
) WHERE user_id IS NULL;

CREATE UNIQUE INDEX idx_unified_unique_user ON unified_usage_metrics(
  provider, 
  organization_id, 
  user_id,
  timestamp, 
  model_name, 
  aggregation_level
) WHERE user_id IS NOT NULL;

-- Provider-specific metrics table
CREATE TABLE IF NOT EXISTS provider_specific_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_metric_id UUID REFERENCES unified_usage_metrics(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'xai')),
  metrics JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provider_specific_unified ON provider_specific_metrics(unified_metric_id);
CREATE INDEX idx_provider_specific_provider ON provider_specific_metrics(provider);
CREATE INDEX idx_provider_specific_metrics_gin ON provider_specific_metrics USING gin(metrics);

-- Fetch status tracking
CREATE TABLE IF NOT EXISTS fetch_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'xai')),
  organization_id UUID NOT NULL,
  last_successful_fetch TIMESTAMPTZ,
  last_fetch_attempt TIMESTAMPTZ,
  next_scheduled_fetch TIMESTAMPTZ,
  fetch_status VARCHAR(20) DEFAULT 'pending' CHECK (fetch_status IN ('pending', 'in_progress', 'success', 'failed')),
  error_message TEXT,
  consecutive_failures INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_fetch_status_unique ON fetch_status(provider, organization_id);
CREATE INDEX idx_fetch_status_next ON fetch_status(next_scheduled_fetch) WHERE fetch_status != 'failed';

-- Data freshness view
CREATE OR REPLACE VIEW data_freshness AS
SELECT 
  fs.provider,
  fs.organization_id,
  fs.last_successful_fetch,
  fs.next_scheduled_fetch,
  CASE 
    WHEN fs.last_successful_fetch IS NULL THEN 'NO_DATA'
    WHEN fs.provider = 'xai' AND fs.last_successful_fetch > NOW() - INTERVAL '2 minutes' THEN 'LIVE'
    WHEN fs.provider = 'anthropic' AND fs.last_successful_fetch > NOW() - INTERVAL '10 minutes' THEN 'LIVE'
    WHEN fs.provider = 'google' AND fs.last_successful_fetch > NOW() - INTERVAL '2 hours' THEN 'RECENT'
    WHEN fs.provider = 'openai' AND fs.last_successful_fetch > NOW() - INTERVAL '25 hours' THEN 'RECENT'
    WHEN fs.last_successful_fetch > NOW() - INTERVAL '24 hours' THEN 'DELAYED'
    ELSE 'STALE'
  END as freshness_status,
  CASE 
    WHEN fs.consecutive_failures = 0 THEN 1.0
    WHEN fs.consecutive_failures = 1 THEN 0.9
    WHEN fs.consecutive_failures = 2 THEN 0.7
    WHEN fs.consecutive_failures = 3 THEN 0.5
    ELSE 0.3
  END as confidence_score
FROM fetch_status fs;

-- Aggregated daily summary
CREATE TABLE IF NOT EXISTS daily_usage_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  organization_id UUID NOT NULL,
  provider VARCHAR(20) NOT NULL,
  
  -- Aggregated metrics
  total_input_tokens BIGINT DEFAULT 0,
  total_output_tokens BIGINT DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(12, 6) DEFAULT 0,
  
  -- Model breakdown
  model_breakdown JSONB,
  
  -- User breakdown
  user_breakdown JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_daily_summary_unique ON daily_usage_summary(date, organization_id, provider);
CREATE INDEX idx_daily_summary_date ON daily_usage_summary(date DESC, organization_id);

-- Function to update daily summary
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_usage_summary (
    date,
    organization_id,
    provider,
    total_input_tokens,
    total_output_tokens,
    total_tokens,
    total_requests,
    failed_requests,
    total_cost_usd
  )
  VALUES (
    DATE(NEW.timestamp),
    NEW.organization_id,
    NEW.provider,
    NEW.input_tokens,
    NEW.output_tokens,
    NEW.total_tokens,
    NEW.successful_requests,
    NEW.failed_requests,
    NEW.cost_usd
  )
  ON CONFLICT (date, organization_id, provider)
  DO UPDATE SET
    total_input_tokens = daily_usage_summary.total_input_tokens + NEW.input_tokens,
    total_output_tokens = daily_usage_summary.total_output_tokens + NEW.output_tokens,
    total_tokens = daily_usage_summary.total_tokens + NEW.total_tokens,
    total_requests = daily_usage_summary.total_requests + NEW.successful_requests,
    failed_requests = daily_usage_summary.failed_requests + NEW.failed_requests,
    total_cost_usd = daily_usage_summary.total_cost_usd + NEW.cost_usd,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic daily summary updates
CREATE TRIGGER update_daily_summary_trigger
AFTER INSERT ON unified_usage_metrics
FOR EACH ROW
WHEN (NEW.aggregation_level = 'raw')
EXECUTE FUNCTION update_daily_summary();

-- Cost alerts table
CREATE TABLE IF NOT EXISTS cost_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('daily_limit', 'monthly_limit', 'unusual_spike', 'rate_increase')),
  threshold_value DECIMAL(12, 2),
  current_value DECIMAL(12, 2),
  provider VARCHAR(20),
  message TEXT,
  severity VARCHAR(20) CHECK (severity IN ('info', 'warning', 'critical')),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_cost_alerts_org ON cost_alerts(organization_id, created_at DESC);
CREATE INDEX idx_cost_alerts_unresolved ON cost_alerts(organization_id, is_resolved) WHERE is_resolved = FALSE;