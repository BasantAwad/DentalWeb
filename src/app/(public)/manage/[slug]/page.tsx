import type { Metadata } from 'next'
import OwnerWorkspace from '@/components/manage/OwnerWorkspace'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Manage ${slug}`,
    description: 'Facility catalogue, resources and availability.',
  }
}

export default async function ManageFacilityPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <OwnerWorkspace slug={slug} facility={null} />
}
