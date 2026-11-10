'use client'

/**
 * Static fallback surface.
 *
 * Rendered whenever WebGL is unavailable, the model fails to load, or the
 * visitor prefers reduced motion. The surrounding content (heading, CTAs,
 * pricing) is always present in the DOM regardless of 3D state — a failed
 * scene never removes access to the product.
 */
export default function SceneFallback({
  image,
  alt,
  label,
  tone = 'light',
}: {
  image: string
  alt: string
  label?: string
  tone?: 'light' | 'dark'
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          tone === 'dark'
            ? 'radial-gradient(120% 90% at 60% 20%, #2B322F 0%, #202522 62%, #191D1B 100%)'
            : 'radial-gradient(120% 90% at 60% 20%, #FFFFFF 0%, #F2F0E9 62%, #E7EEE8 100%)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={alt}
        className="h-full w-full object-cover opacity-95"
        loading="lazy"
        decoding="async"
      />
      {label ? (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-sm">
          {label}
        </span>
      ) : null}
    </div>
  )
}
