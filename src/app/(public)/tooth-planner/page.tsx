import type { Metadata } from 'next'
import ToothPlanner from '@/components/teeth/ToothPlanner'

export const metadata: Metadata = {
  title: 'Tooth planner',
  description:
    'Mark the teeth you intend to work on so the facility can prepare your station. Optional, and never a diagnosis.',
}

export default function ToothPlannerPage() {
  return <ToothPlanner />
}
