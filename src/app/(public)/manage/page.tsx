import type { Metadata } from 'next'
import OwnerIndex from '@/components/manage/OwnerIndex'

export const metadata: Metadata = {
  title: 'Facility workspace',
  description:
    'Manage your facility profile, rooms, equipment and reservations on DentalWeb.',
}

export default function ManagePage() {
  return <OwnerIndex />
}
