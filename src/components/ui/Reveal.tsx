'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Scroll-reveal primitives.
 *
 * Content enters with a short, calm move rather than a bounce. The reveal is
 * progressive enhancement: without JavaScript the content is simply present.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className = '',
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'span' | 'li' | 'section'
}) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as]

  if (reduced) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px -8% 0px' }}
      transition={{ duration: 0.62, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}

/**
 * A word-by-word editorial reveal for display headings.
 * Used sparingly — one per page — so it stays meaningful.
 */
export function RevealWords({
  text,
  className = '',
  as: Tag = 'h2',
  delay = 0,
}: {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
  delay?: number
}) {
  const reduced = useReducedMotion()
  const words = text.split(' ')

  if (reduced) {
    return <Tag className={className}>{text}</Tag>
  }

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.035, delayChildren: delay } },
  }
  const word: Variants = {
    hidden: { opacity: 0, y: '0.4em' },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px' }}
    >
      <Tag className="inline">
        {words.map((text, index) => (
          <span
            key={`${text}-${index}`}
            className="inline-block overflow-hidden align-bottom"
          >
            <motion.span className="inline-block" variants={word}>
              {text}
            </motion.span>
            {/* The space lives outside the clipped span so it is never
                trimmed by the overflow mask. */}
            {index < words.length - 1 ? (
              <span className="inline-block">&nbsp;</span>
            ) : null}
          </span>
        ))}
      </Tag>
    </motion.div>
  )
}
