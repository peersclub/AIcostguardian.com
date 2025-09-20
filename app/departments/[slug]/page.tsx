import { Metadata } from 'next'
import AuthWrapper from '@/components/AuthWrapper'
import DepartmentDetailsClient from './department-details-client'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.slug} Department | AI Cost Guardian`,
    description: `Detailed insights and analytics for the ${params.slug} department`,
  }
}

export default function DepartmentDetailsPage({ params }: Props) {
  return (
    <AuthWrapper>
      <DepartmentDetailsClient slug={params.slug} />
    </AuthWrapper>
  )
}