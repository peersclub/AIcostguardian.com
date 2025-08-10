import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://29191380717eadeceb9fa15d05bb9370@o4509820111880192.ingest.us.sentry.io/4509820113780736",
  
  // Adjust sample rate in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production' || process.env.SENTRY_ENABLED === 'true',
  
  // Ignore certain errors
  ignoreErrors: [
    // Ignore specific Next.js errors that are expected
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],
  
  // Before send callback
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    if (event.user?.email) {
      // Hash email for privacy
      event.user.email = '[REDACTED]';
    }
    
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_ENABLED) {
      return null;
    }
    
    return event;
  },
  
  // Debugging
  debug: process.env.NODE_ENV === 'development' && process.env.SENTRY_DEBUG === 'true',
});