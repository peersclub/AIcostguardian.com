import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://29191380717eadeceb9fa15d05bb9370@o4509820111880192.ingest.us.sentry.io/4509820113780736",
  
  // Adjust sample rate in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true',
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions will be recorded
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors will be recorded
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random network errors
    'Network request failed',
    'NetworkError',
    'Failed to fetch',
    // Ignore browser extension errors
    'Extension context invalidated',
    'ResizeObserver loop limit exceeded',
  ],
  
  // Before send callback
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SENTRY_ENABLED) {
      return null;
    }
    
    return event;
  },
});