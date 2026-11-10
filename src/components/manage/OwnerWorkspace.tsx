'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getFacility,
  type FacilityDetail,
  type FacilityResource,
} from '@/lib/platform-api'
import Section, { Eyebrow } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import Breadcrumb from '@/components/ui/Breadcrumb'

/**
 * Facility owner workspace.
 *
 * Connected to the facility's own record where the backend exposes it.
 * Nothing here is decorative: every figure comes from the facility data, and
 * anything the backend does not expose is stated as unavailable rather than
 * invented.
 */

const RESOURCE_TYPE_LABEL: Record<string, string> = {
  chair: 'Dental chair',
  dummy_head: 'Phantom head',
  xray: 'X-ray',
  sterilization: 'Sterilization',
  course: 'Course',
}

export default function OwnerWorkspace({
  slug,
  facility,
  onResourcesChange,
}: {
  slug: string
  facility: FacilityDetail | null
  onResourcesChange?: (resources: FacilityResource[]) => void
}) {
  const [current, setCurrent] = useState<FacilityDetail | null>(facility)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'resources'>('overview')

  const load = useCallback(async () => {
    try {
      const payload = await getFacility(slug)
      if (!payload.facility) {
        setStatus('error')
        setMessage('That facility could not be found.')
        return
      }
      setCurrent(payload.facility)
      onResourcesChange?.(payload.facility.resources)
      setStatus('ready')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Could not load the facility.')
    }
  }, [slug, onResourcesChange])

  useEffect(() => {
    void load()
  }, [load])

  if (status === 'loading') {
    return (
      <Section theme="porcelain" className="pt-32">
        <div className="page">
          <p role="status" aria-live="polite" className="text-[0.9375rem] text-slate-600">
            Loading workspace…
          </p>
        </div>
      </Section>
    )
  }

  if (status === 'error' || !current) {
    return (
      <Section theme="porcelain" className="pt-32">
        <div className="page">
          <div className="mx-auto max-w-xl py-12 text-center">
            <p className="font-display text-[1.75rem] font-semibold text-graphite-900">
              The workspace is not available
            </p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
              {message || 'The facility could not be loaded.'}
            </p>
            <div className="mt-7">
              <ButtonLink href="/facilities" variant="primary">
                Browse facilities
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    )
  }

  const activeServices = current.services.filter((s) => s.isBookable !== false)
  const activeResources = current.resources.filter((r) => r.isActive)
  const inactiveResources = current.resources.filter((r) => !r.isActive)
  const chairs = current.resources.filter((r) => r.type === 'chair' && r.isActive)
  const phantomHeads = current.resources.filter((r) => r.type === 'dummy_head' && r.isActive)

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Section theme="dark" className="relative overflow-hidden pt-28 md:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(100% 80% at 20% 10%, rgba(47,119,114,0.2) 0%, rgba(32,37,34,0) 58%)',
          }}
        />
        <div className="page relative">
          <Breadcrumb
            tone="dark"
            items={[
              { href: '/manage', label: 'Workspace' },
              { href: `/manage/${current.slug}`, label: current.name },
            ]}
          />

          <div className="mt-7 grid-12 items-end gap-y-8">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow tone="dark">Facility workspace</Eyebrow>
              <h1 className="mt-5 font-display text-[clamp(2rem,4.4vw,3.25rem)] font-semibold leading-[1.03] tracking-[-0.035em]">
                {current.name}
              </h1>
              <p className="mt-3 text-[0.9375rem] text-porcelain-100/60">
                {current.timezone} · {current.depositPct}% deposit ·{' '}
                {current.cancellationCutoffHours}h cancellation notice
              </p>
            </div>
            <div className="col-span-12 flex flex-wrap gap-3 lg:col-span-4 lg:col-start-9 lg:justify-end">
              <ButtonLink
                href={`/facilities/${current.slug}`}
                variant="tertiary-on-dark"
                size="lg"
              >
                View public page
              </ButtonLink>
              <ButtonLink href={`/facilities/${current.slug}/room`} variant="on-dark" size="lg">
                Open room plan
              </ButtonLink>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-10 flex gap-1 border-b border-white/10">
            {(
              [
                { key: 'overview', label: 'Overview' },
                { key: 'resources', label: 'Resources' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                aria-selected={activeTab === tab.key}
                role="tab"
                className={[
                  'relative px-4 py-3 text-[0.9375rem] font-medium transition-colors duration-200',
                  activeTab === tab.key
                    ? 'text-porcelain-50'
                    : 'text-porcelain-100/50 hover:text-porcelain-100/80',
                ].join(' ')}
              >
                {tab.label}
                {activeTab === tab.key ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-4 -bottom-px h-px bg-sage-200"
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Panels ─────────────────────────────────────────────────── */}
      <Section theme="porcelain" className="relative overflow-hidden">
        <div className="page py-16 md:py-20">
          {activeTab === 'overview' ? (
            <>
              {/* Metrics — all derived from the facility's own record */}
              <dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
                {[
                  { term: 'Bookable services', value: activeServices.length },
                  { term: 'Active resources', value: activeResources.length },
                  { term: 'Dental chairs', value: chairs.length },
                  { term: 'Phantom heads', value: phantomHeads.length },
                ].map((metric) => (
                  <div key={metric.term} className="border-t border-stone-300 pt-5">
                    <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-slate-600">
                      {metric.term}
                    </dt>
                    <dd className="tnum mt-2 font-display text-[2.5rem] font-semibold leading-none tracking-[-0.03em] text-graphite-900">
                      {metric.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Services and their rates */}
              <div className="mt-16 grid-12 gap-y-12">
                <div className="col-span-12 lg:col-span-4">
                  <Eyebrow>Your catalogue</Eyebrow>
                  <h2 className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]">
                    Services and rates
                  </h2>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-graphite-700">
                    Customers see these prices on your public page and in the
                    booking flow. They are the only rates the platform quotes.
                  </p>
                </div>

                <div className="col-span-12 lg:col-span-7 lg:col-start-6">
                  {activeServices.length === 0 ? (
                    <p className="text-[0.9375rem] text-slate-600">
                      No bookable services have been published yet.
                    </p>
                  ) : (
                    <ul>
                      {activeServices.map((service) => (
                        <li
                          key={service.id}
                          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-stone-300 py-4"
                        >
                          <div className="min-w-0">
                            <p className="font-display text-[1rem] font-semibold text-graphite-900">
                              {service.name}
                            </p>
                            <p className="mt-0.5 text-[0.75rem] uppercase tracking-[0.1em] text-slate-600">
                              {service.resourceType
                                ? (RESOURCE_TYPE_LABEL[service.resourceType] ??
                                  service.resourceType)
                                : service.category}
                            </p>
                          </div>
                          <p className="tnum text-[1rem] font-semibold text-teal-700">
                            {service.priceEgp} EGP
                            <span className="ml-1 text-[0.8125rem] font-normal text-slate-600">
                              /hr
                            </span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Reservations */}
              <div className="mt-16 grid-12 gap-y-12">
                <div className="col-span-12 lg:col-span-4">
                  <Eyebrow>Reservations</Eyebrow>
                  <h2 className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]">
                    Where reservations live
                  </h2>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-graphite-700">
                    Reservations, holds and payment states are recorded by the
                    platform against each resource, so two stations can be
                    booked at once and one station can never be double-booked.
                  </p>
                </div>

                <div className="col-span-12 lg:col-span-7 lg:col-start-6">
                  <div className="rounded-[16px] border border-stone-300 bg-chalk p-6">
                    <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
                      The reservation calendar and the payment ledger are served
                      by the platform&rsquo;s booking API and require a signed-in
                      facility account. They are not displayed here because the
                      workspace is not authenticated.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <ButtonLink href="/auth/login" variant="primary">
                        Sign in to manage bookings
                      </ButtonLink>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid-12 gap-y-12">
                <div className="col-span-12 lg:col-span-4">
                  <Eyebrow>Inventory</Eyebrow>
                  <h2 className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]">
                    Resources
                  </h2>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-graphite-700">
                    Each resource is a real bookable unit with its own
                    availability. Deactivating one stops new bookings without
                    touching its history.
                  </p>
                </div>

                <div className="col-span-12 lg:col-span-7 lg:col-start-6">
                  {current.resources.length === 0 ? (
                    <p className="text-[0.9375rem] text-slate-600">
                      No resources have been created for this facility yet.
                    </p>
                  ) : (
                    <ul>
                      {current.resources.map((resource) => (
                        <li
                          key={resource.id}
                          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-stone-300 py-4"
                        >
                          <div className="min-w-0">
                            <p className="text-[0.9375rem] font-semibold text-graphite-900">
                              {resource.name}
                            </p>
                            <p className="mt-0.5 text-[0.75rem] uppercase tracking-[0.1em] text-slate-600">
                              {RESOURCE_TYPE_LABEL[resource.type] ?? resource.type}
                              {resource.location ? ` · ${resource.location}` : ''}
                            </p>
                          </div>
                          <span
                            className={[
                              'shrink-0 rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]',
                              resource.isActive
                                ? 'border-success/30 bg-success/10 text-success'
                                : 'border-stone-300 bg-stone-200/50 text-slate-600',
                            ].join(' ')}
                          >
                            {resource.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {inactiveResources.length > 0 ? (
                    <p className="mt-4 text-[0.8125rem] text-slate-600">
                      {inactiveResources.length} inactive{' '}
                      {inactiveResources.length === 1 ? 'resource is' : 'resources are'}{' '}
                      hidden from customers. Their past bookings are preserved.
                    </p>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </Section>
    </>
  )
}
