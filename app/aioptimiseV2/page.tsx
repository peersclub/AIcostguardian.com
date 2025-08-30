import { redirect } from 'next/navigation'

// Redirect from old V2 URL to the main aioptimise URL
export default function AIOptimiseV2Redirect() {
  redirect('/aioptimise')
}