'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, CheckCircle, Info, Download } from 'lucide-react';

export function UsageBackfill() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [backfillInfo, setBackfillInfo] = useState<any>(null);

  const checkBackfillStatus = async () => {
    try {
      const response = await fetch('/api/usage/backfill');
      if (response.ok) {
        const data = await response.json();
        setBackfillInfo(data);
      }
    } catch (error) {
      console.error('Failed to check backfill status:', error);
    }
  };

  const runBackfill = async () => {
    setIsLoading(true);
    setStatus('idle');
    setResult(null);

    try {
      const response = await fetch('/api/usage/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setResult(data);
        // Refresh the status
        await checkBackfillStatus();
      } else {
        setStatus('error');
        setResult({ error: data.error || 'Backfill failed' });
      }
    } catch (error) {
      setStatus('error');
      setResult({ error: 'Network error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  // Check status on mount
  useState(() => {
    checkBackfillStatus();
  });

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Usage Data Backfill
        </CardTitle>
        <CardDescription>
          Fetch historical usage data from your API providers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        {backfillInfo && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">API Keys Configured:</span>
                <span className="ml-2 font-medium">{backfillInfo.apiKeysConfigured}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Records:</span>
                <span className="ml-2 font-medium">{backfillInfo.currentStats?.totalRecords || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="ml-2 font-medium">
                  ${(backfillInfo.currentStats?.totalCost || 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Tokens:</span>
                <span className="ml-2 font-medium">
                  {(backfillInfo.currentStats?.totalTokens || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Provider Status */}
            {backfillInfo.providers && backfillInfo.providers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Configured Providers:</p>
                <div className="flex gap-2 flex-wrap">
                  {backfillInfo.providers.map((provider: string) => (
                    <span
                      key={provider}
                      className="px-2 py-1 bg-gray-800 rounded text-xs"
                    >
                      {provider}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Alert */}
        <Alert className="border-blue-900/50 bg-blue-950/30">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertTitle className="text-blue-400">Backfill Limitations</AlertTitle>
          <AlertDescription className="text-gray-400">
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>OpenAI:</strong> Limited historical data available via API</li>
              <li><strong>Claude:</strong> No public usage API - future tracking only</li>
              <li><strong>Gemini:</strong> Usage tracked through Google Cloud Console</li>
              <li><strong>Grok:</strong> Usage API endpoints not yet documented</li>
            </ul>
            <p className="mt-2">
              Most providers don't offer comprehensive historical usage APIs. 
              Future usage will be tracked automatically when you make API calls.
            </p>
          </AlertDescription>
        </Alert>

        {/* Result Messages */}
        {status === 'success' && result && (
          <Alert className="border-green-900/50 bg-green-950/30">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertTitle className="text-green-400">Backfill Complete</AlertTitle>
            <AlertDescription className="text-gray-400">
              {result.message || `Added ${result.recordsAdded} new records`}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-yellow-400">Some issues encountered:</p>
                  <ul className="list-disc list-inside">
                    {result.errors.map((error: string, i: number) => (
                      <li key={i} className="text-xs">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && result && (
          <Alert className="border-red-900/50 bg-red-950/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-400">Backfill Failed</AlertTitle>
            <AlertDescription className="text-gray-400">
              {result.error || 'An error occurred during backfill'}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <Button
          onClick={runBackfill}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Fetching Usage Data...' : 'Run Backfill'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          This will attempt to fetch any available historical usage data from your configured API providers.
        </p>
      </CardContent>
    </Card>
  );
}