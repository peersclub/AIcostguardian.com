'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Mail, CheckCircle, XCircle, Info } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function TestEmailPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [emailType, setEmailType] = useState('test')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [result, setResult] = useState<{
    type: 'success' | 'error' | 'info' | null
    message: string
    details?: any
  }>({ type: null, message: '' })
  const [connectionStatus, setConnectionStatus] = useState<any>(null)

  const verifyConnection = async () => {
    setVerifying(true)
    try {
      const response = await fetch('/api/test-email', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setConnectionStatus(data)
      
      if (data.connected) {
        setResult({
          type: 'success',
          message: 'SES connection verified successfully',
          details: data.settings
        })
      } else {
        setResult({
          type: 'info',
          message: 'SES is configured but connection could not be verified',
          details: data.settings
        })
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Failed to verify SES connection',
        details: (error as Error).message
      })
    } finally {
      setVerifying(false)
    }
  }

  const sendTestEmail = async () => {
    setLoading(true)
    setResult({ type: null, message: '' })

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: emailType,
          recipientEmail: recipientEmail || session?.user?.email
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          type: 'success',
          message: data.message,
          details: data.details
        })
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Failed to send email',
          details: data.details
        })
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Failed to send test email',
        details: (error as Error).message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Amazon SES Email Testing</h1>
        <p className="text-muted-foreground mt-2">
          Test your Amazon SES email configuration and send sample notifications
        </p>
      </div>

      {/* Connection Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>SES Connection Status</CardTitle>
          <CardDescription>
            Verify that Amazon SES is properly configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={verifyConnection} 
            disabled={verifying}
            variant="outline"
            className="mb-4"
          >
            {verifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Info className="mr-2 h-4 w-4" />
                Verify Connection
              </>
            )}
          </Button>

          {connectionStatus && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {connectionStatus.connected ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">
                  Connection: {connectionStatus.connected ? 'Active' : 'Not Connected'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Host: {connectionStatus.settings?.host}</p>
                <p>Port: {connectionStatus.settings?.port}</p>
                <p>From: {connectionStatus.settings?.fromEmail}</p>
                <p>Region: {connectionStatus.settings?.region}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Test Email Card */}
      <Card>
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
          <CardDescription>
            Send different types of notification emails to test the integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-type">Email Type</Label>
            <Select value={emailType} onValueChange={setEmailType}>
              <SelectTrigger id="email-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Simple Test Email</SelectItem>
                <SelectItem value="welcome">Welcome Email</SelectItem>
                <SelectItem value="usage-alert">Usage Alert</SelectItem>
                <SelectItem value="monthly-report">Monthly Report</SelectItem>
                <SelectItem value="team-invite">Team Invitation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Email (optional)</Label>
            <Input
              id="recipient"
              type="email"
              placeholder={session?.user?.email || "your.email@example.com"}
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to send to your account email
            </p>
          </div>

          <Button 
            onClick={sendTestEmail} 
            disabled={loading || !session}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>

          {!session && (
            <Alert>
              <AlertDescription>
                Please sign in to test email functionality
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Result Alert */}
      {result.type && (
        <Alert 
          className="mt-6"
          variant={result.type === 'error' ? 'destructive' : 'default'}
        >
          <AlertTitle className="flex items-center gap-2">
            {result.type === 'success' && <CheckCircle className="h-4 w-4" />}
            {result.type === 'error' && <XCircle className="h-4 w-4" />}
            {result.type === 'info' && <Info className="h-4 w-4" />}
            {result.type === 'success' ? 'Success' : result.type === 'error' ? 'Error' : 'Info'}
          </AlertTitle>
          <AlertDescription>
            <p>{result.message}</p>
            {result.details && (
              <pre className="mt-2 text-xs overflow-auto p-2 bg-background rounded">
                {typeof result.details === 'string' 
                  ? result.details 
                  : JSON.stringify(result.details, null, 2)}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Sandbox Mode:</strong> If your AWS SES account is in sandbox mode, 
            you can only send emails to verified email addresses.
          </p>
          <p>
            <strong>Verified Domains:</strong> Make sure your sender domain (noreply@aicostguardian.com) 
            is verified in AWS SES.
          </p>
          <p>
            <strong>Rate Limits:</strong> AWS SES has sending rate limits. The service 
            is configured to respect these limits automatically.
          </p>
          <p>
            <strong>Email Templates:</strong> The system includes pre-designed templates for 
            welcome emails, usage alerts, monthly reports, and team invitations.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}