import { redirect } from 'next/navigation'

export default function AnalyticsTrendsV2Redirect() {
  // Redirect to the functional usage page which includes trend analytics
  redirect('/usage')
}