import type { Metadata } from 'next'
import CourseExplorer from '@/components/courses/CourseExplorer'

export const metadata: Metadata = {
  title: 'Courses and practical training',
  description:
    'Find dental courses and supervised practical training offered by dental facilities. Filter by subject, level and format, then register online.',
}

export default function CoursesPage() {
  return <CourseExplorer />
}
