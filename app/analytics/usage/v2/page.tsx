import { redirect } from 'next/navigation'

export default function AnalyticsUsageV2Redirect() {
  // Redirect to the functional usage page
  redirect('/usage')
}