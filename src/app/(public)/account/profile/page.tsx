import type { Metadata } from 'next'
import AccountProfile from '@/components/account/AccountProfile'

export const metadata: Metadata = {
  title: 'My profile',
  description: 'Your contact details and dental student information.',
}

export default function AccountProfilePage() {
  return <AccountProfile />
}
