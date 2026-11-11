import type { Metadata } from 'next'
import CourseDetail from '@/components/courses/CourseDetail'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return {
    title: slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    description:
      'Course details, learning objectives, schedule and registration for this dental training course.',
  }
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <CourseDetail slug={slug} />
}
