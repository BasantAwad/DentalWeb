import type { Metadata } from 'next'
import AccountSettings from '@/components/account/AccountSettings'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Your account details, password and session.',
}

export default function AccountSettingsPage() {
  return <AccountSettings />
}
