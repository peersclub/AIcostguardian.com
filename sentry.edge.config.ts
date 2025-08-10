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
  
  // Debugging
  debug: false,
});