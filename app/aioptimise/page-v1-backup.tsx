import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-config';
import AIOptimiseProClient from './aioptimise-pro-client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AIOptimisePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  return <AIOptimiseProClient />;
}