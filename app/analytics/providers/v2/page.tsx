import { redirect } from 'next/navigation'

export default function AnalyticsProvidersV2Redirect() {
  // Redirect to the functional usage page which includes provider analytics
  redirect('/usage')
}