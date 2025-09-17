export async function register() {
  // Temporarily disabled for local development
  return;
  
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/node');
    const { nodeProfilingIntegration } = await import('@sentry/profiling-node');
    
    Sentry.init({
      dsn: "https://29191380717eadeceb9fa15d05bb9370@o4509820111880192.ingest.us.sentry.io/4509820113780736",
      
      integrations: [
        nodeProfilingIntegration(),
      ],
      
      // Tracing
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in production, 100% in development
      
      // Set sampling rate for profiling
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Send structured logs to Sentry
      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        if (event.user?.email) {
          event.user.email = '[REDACTED]';
        }
        return event;
      },
      
      // Environment
      environment: process.env.NODE_ENV || 'development',
      
      // Only enable in production or when explicitly set
      enabled: process.env.NODE_ENV === 'production' || process.env.SENTRY_ENABLED === 'true',
      
      // Ignore certain errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        // Random network errors
        'Network request failed',
        'NetworkError',
        'Failed to fetch',
        // Ignore specific Next.js errors that are expected
        'NEXT_NOT_FOUND',
        'NEXT_REDIRECT',
      ],
      
      // Release tracking
      release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
      
      // Additional options
      maxBreadcrumbs: 50,
      attachStacktrace: true,
      
      // Debugging
      debug: process.env.NODE_ENV === 'development',
    });
  }
}