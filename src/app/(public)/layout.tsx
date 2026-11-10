import PublicLayout from '@/components/PublicLayout'
import type { ReactNode } from 'react'

export default function PublicGroupLayout({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>
}
