# Web Search & Dataset Configuration Guide

## Overview

This guide explains how to configure web search and external datasets for your AssetWorks AI Financial Analytics Platform. The system supports both enabling/disabling web search and integrating specific datasets/URLs for real-time financial data.

## Current Configuration

The AssetWorks AI project type has been enhanced with comprehensive web search and dataset integration capabilities. Here's how to use and customize them:

### 🔍 Web Search Configuration

#### Enabled by Default
```typescript
WEB_SEARCH_ENABLED: TRUE
```

#### Allowed Domains (Whitelist)
```typescript
ALLOWED_DOMAINS: [
  "finance.yahoo.com",
  "economictimes.indiatimes.com",
  "moneycontrol.com",
  "nseindia.com",
  "bseindia.com",
  "rbi.org.in",
  "sebi.gov.in",
  "reuters.com/markets",
  "bloomberg.com",
  "ft.com/markets",
  "tradingview.com",
  "screener.in",
  "valueresearchonline.com",
  "morningstar.in"
]
```

#### Blocked Domains (Blacklist)
```typescript
BLOCKED_DOMAINS: [
  "social media platforms",
  "unverified blogs",
  "promotional content"
]
```

### 📊 Dataset Integration

#### Required API Endpoints
```typescript
REQUIRED_DATASETS: {
  // Real-time Stock Prices
  "NSE_BSE_PRICES": "https://api.nseindia.com",

  // Economic Data
  "RBI_DATA": "https://api.rbi.org.in",

  // Corporate Announcements
  "CORPORATE_NEWS": "https://www.nseindia.com/api/corporates-under-scanner",

  // Sectoral Information
  "SECTOR_DATA": "https://api.nseindia.com/api/equity-meta-info",

  // Mutual Funds
  "MUTUAL_FUNDS": "https://api.mfapi.in",

  // Currency Exchange
  "FOREX_RATES": "https://api.exchangerate-api.com"
}
```

## How to Customize Web Search Settings

### 1. Enable/Disable Web Search

To disable web search for specific scenarios:

```typescript
// In your project context system prompt
**WEB_SEARCH_ENABLED**: FALSE
```

To enable with restrictions:
```typescript
**WEB_SEARCH_ENABLED**: TRUE
**SEARCH_TRIGGERS**: ["latest", "recent", "breaking", "news"]
```

### 2. Modify Allowed Domains

Add your specific financial data sources:

```typescript
**ALLOWED_DOMAINS**: [
  // Indian Markets
  "nseindia.com",
  "bseindia.com",
  "moneycontrol.com",

  // Your Custom Sources
  "yourapi.com",
  "customfinancedata.com",

  // International Markets (if needed)
  "yahoo.com",
  "bloomberg.com"
]
```

### 3. Add Custom Datasets

```typescript
**CUSTOM_DATASETS**: {
  "CRYPTO_DATA": "https://api.coingecko.com/api/v3",
  "COMMODITY_PRICES": "https://api.metals.live/v1/spot",
  "BOND_YIELDS": "https://api.fiscaldata.treasury.gov/services/api/fiscal_service",
  "YOUR_PROPRIETARY_DATA": "https://your-internal-api.com/v1/market-data"
}
```

## Triggering Web Search vs Cached Data

### Automatic Web Search Triggers

The system automatically uses web search when users mention:

- **Time-sensitive keywords**: "latest", "current", "today", "recent", "breaking"
- **News queries**: "news", "announcement", "update", "result"
- **Real-time requests**: "live price", "current market", "now"

### Example Queries That Trigger Web Search

```
✅ "What's the latest price of Reliance?"
✅ "Current market news about TCS"
✅ "Today's Nifty performance"
✅ "Recent updates on Bitcoin"
✅ "Breaking news in banking sector"
```

### Example Queries Using Cached Data

```
📊 "Show me historical performance of HDFC"
📊 "Compare P/E ratios of IT companies"
📊 "Analyze last quarter results"
```

## API Integration Examples

### 1. NSE Real-time Data
```javascript
// Fetching real-time stock quote
const stockData = await fetch(`https://api.nseindia.com/api/quote-equity?symbol=${symbol}`, {
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json"
  }
});
```

### 2. RBI Economic Data
```javascript
// Getting exchange rates
const exchangeRates = await fetch("https://api.rbi.org.in/api/exchange-rates", {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  }
});
```

### 3. Custom Dataset Integration
```javascript
// Your proprietary market data
const customData = await fetch("https://your-api.com/market-data", {
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  }
});
```

## Configuration Through Project Settings UI

### Using the AssetWorks AI Project Setup

1. **Navigate to Project Settings**: Click the Project dropdown → "Set up project"
2. **Select AssetWorks AI**: Choose the AssetWorks AI project type
3. **Customize Settings**: The system prompt includes all web search and dataset configurations
4. **Save Configuration**: Your settings are applied to all conversations in that thread

### Advanced Customization

For advanced users, you can modify the system prompt directly:

```typescript
// Add to your system prompt
**WEB_SEARCH_CONFIGURATION:**
- Enable for real-time data: TRUE
- Allowed domains: ["your-custom-domains.com"]
- Dataset endpoints: ["your-api-endpoints.com"]
- Search triggers: ["custom", "triggers"]
- Data freshness: 1 hour for active markets
```

## Data Source Priority

The system follows this priority order:

1. **Official Exchange APIs** (NSE, BSE) - Highest priority
2. **Regulatory Bodies** (RBI, SEBI) - For policy data
3. **Verified Financial News** - For context and analysis
4. **Corporate Filings** - For fundamental data
5. **Market Data Providers** - For technical indicators
6. **Web Search Results** - For latest updates and news

## Error Handling & Fallbacks

### When Primary Data Sources Fail

```typescript
// Automatic fallback chain
if (nseAPI.failed) {
  try bseAPI;
  if (bseAPI.failed) {
    try webSearch("moneycontrol.com OR economictimes.com");
    if (webSearch.failed) {
      return cachedData + "⚠️ Using cached data";
    }
  }
}
```

### Rate Limiting Protection

```typescript
// Built-in rate limiting
rateLimits: {
  "api.nseindia.com": "10 requests/minute",
  "web_search": "50 searches/hour",
  "custom_apis": "100 requests/hour"
}
```

## Best Practices

### 1. **For Real-time Trading Data**
- Enable web search
- Use official exchange APIs first
- Include data timestamps in all visualizations

### 2. **For Historical Analysis**
- Disable web search to improve performance
- Use cached datasets for consistency
- Focus on fundamental data sources

### 3. **For News & Sentiment Analysis**
- Enable web search with news-focused domains
- Use sentiment analysis on search results
- Include source attribution

### 4. **For Custom Use Cases**
- Define specific allowed domains for your industry
- Set up custom API endpoints in the configuration
- Create custom search triggers based on your needs

## Example: Complete Custom Configuration

```typescript
// Custom AssetWorks AI configuration for crypto trading
**WEB_SEARCH_ENABLED**: TRUE
**ALLOWED_DOMAINS**: [
  "coinbase.com",
  "binance.com",
  "coingecko.com",
  "cryptonews.com"
]
**REQUIRED_DATASETS**: {
  "CRYPTO_PRICES": "https://api.coingecko.com/api/v3/simple/price",
  "TRADING_VOLUME": "https://api.coinbase.com/v2/exchange-rates",
  "NEWS_SENTIMENT": "https://api.cryptonews.io/v1/sentiment"
}
**SEARCH_TRIGGERS**: ["moon", "dump", "ath", "dip", "whale"]
**DATA_REFRESH**: "30 seconds"
```

## Testing Your Configuration

### 1. **Test Web Search**
Ask: "What's the latest news about [your asset]?"

### 2. **Test Dataset Integration**
Ask: "Show me current price of [your asset]"

### 3. **Test Fallbacks**
Ask: "Analyze [asset] when primary APIs are down"

### 4. **Verify Data Sources**
Check that visualizations include proper source attribution and timestamps

## Summary

The AssetWorks AI platform provides flexible web search and dataset integration that can be customized for your specific financial analysis needs. Whether you're working with Indian equities, cryptocurrencies, commodities, or custom datasets, the system can be configured to provide real-time, accurate, and compliant financial analysis.

Key benefits:
- ✅ Real-time data integration
- ✅ Configurable data sources
- ✅ Automatic fallback mechanisms
- ✅ Compliance with financial regulations
- ✅ Customizable for any asset class
- ✅ Performance optimization with caching

For technical support or advanced customization, refer to the project documentation or contact the development team.