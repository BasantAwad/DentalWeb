import type { Metadata } from 'next'
import AccountDashboard from '@/components/account/AccountDashboard'

export const metadata: Metadata = {
  title: 'Your dashboard',
  description:
    'Your DentalWeb reservations, course registrations and recent activity in one place.',
}

export default function AccountPage() {
  return <AccountDashboard />
}
