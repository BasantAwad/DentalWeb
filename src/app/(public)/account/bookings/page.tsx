import type { Metadata } from 'next'
import AccountBookings from '@/components/account/AccountBookings'

export const metadata: Metadata = {
  title: 'My reservations',
  description: 'Every dental chair and phantom-head reservation you have made.',
}

export default function AccountBookingsPage() {
  return <AccountBookings />
}
