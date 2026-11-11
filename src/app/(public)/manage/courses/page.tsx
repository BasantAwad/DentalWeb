import type { Metadata } from 'next'
import CourseManager from '@/components/manage/CourseManager'

export const metadata: Metadata = {
  title: 'Manage courses',
  description:
    'Create, publish and manage the courses your facility teaches, and see who has registered.',
}

export default function ManageCoursesPage() {
  return <CourseManager />
}
