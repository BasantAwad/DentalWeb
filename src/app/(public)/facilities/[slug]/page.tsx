import type { Metadata } from 'next'
import FacilityProfile from '@/components/facilities/FacilityProfile'

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
      'Services, equipment, opening hours and availability for this dental training facility.',
  }
}

export default async function FacilityProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <FacilityProfile slug={slug} />
}
