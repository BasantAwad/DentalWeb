import type { Metadata } from 'next'
import AccountCourses from '@/components/account/AccountCourses'

export const metadata: Metadata = {
  title: 'My courses',
  description: 'The courses you are registered for and their session schedules.',
}

export default function AccountCoursesPage() {
  return <AccountCourses />
}
