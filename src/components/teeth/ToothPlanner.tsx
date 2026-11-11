'use client'

import { useState } from 'react'
import ToothSelector from '@/components/teeth/ToothSelector'
import Section, { Eyebrow } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'

/**
 * Tooth selection.
 *
 * Kept deliberately separate from station selection: choosing a station says
 * *where* you will work, choosing teeth says *what* you intend to work on.
 * They are independent pieces of state and neither implies the other.
 *
 * Selection is optional — a reservation never depends on it.
 */
export default function ToothPlanner() {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (code: string) => {
    setSelected((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    )
  }

  return (
    <>
      <Section theme="porcelain" className="relative overflow-hidden pt-32 md:pt-40">
        <div className="page">
          <div className="grid-12 items-end gap-y-10">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow>Optional planning step</Eyebrow>
              <h1 className="mt-6 font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
                Tell the facility what you plan to work on.
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <p className="text-[1.0625rem] leading-relaxed text-graphite-700">
                Mark the teeth you intend to work on so the station can be
                prepared. This is a request, not a diagnosis — and you can
                continue without it.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section theme="chalk" className="relative overflow-hidden">
        <div className="page py-16 md:py-20">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 lg:col-span-7">
              <ToothSelector
                selected={selected}
                onToggle={toggle}
                onClear={() => setSelected([])}
              />
            </div>

            {/* Contextual panel */}
            <aside className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="lg:sticky lg:top-28">
                <div className="rounded-[18px] border border-stone-300 bg-porcelain-100 p-6">
                  <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-slate-600">
                    How to read this
                  </p>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-graphite-700">
                    Teeth are numbered using the FDI two-digit system: the first
                    digit is the quadrant, the second is the position from the
                    middle of the arch.
                  </p>

                  <dl className="mt-6 space-y-3 text-[0.875rem]">
                    {[
                      { term: '1', value: 'Upper right' },
                      { term: '2', value: 'Upper left' },
                      { term: '3', value: 'Lower left' },
                      { term: '4', value: 'Lower right' },
                    ].map((row) => (
                      <div key={row.term} className="flex gap-4">
                        <dt className="tnum w-5 font-semibold text-teal-700">
                          {row.term}
                        </dt>
                        <dd className="text-graphite-700">{row.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <p className="mt-6 border-t border-stone-300 pt-4 text-[0.8125rem] leading-relaxed text-slate-600">
                    For example, tooth <span className="tnum font-semibold">16</span>{' '}
                    is the upper right first molar.
                  </p>
                </div>

                <div className="mt-5">
                  <ButtonLink href="/services" variant="primary" size="lg" withArrow className="w-full">
                    Explore services
                  </ButtonLink>
                  <p className="mt-3 text-center text-[0.75rem] leading-relaxed text-slate-600">
                    Tooth selection is optional and is never required to book.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </Section>
    </>
  )
}
