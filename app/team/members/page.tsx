import { redirect } from 'next/navigation'

export default function TeamMembersRedirect() {
  // Redirect to the functional organization members page
  redirect('/organization/members')
}