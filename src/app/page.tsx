'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Link from 'next/link'
import { SERVICES } from '@/lib/services-data'

// ─── Real molar GLTF loader ───
function MolarModel({ onReady }: { onReady?: () => void }) {
  const gltf = useGLTF('/models/molar/scene.gltf')
  const { scene, animations } = gltf
  const { actions } = useAnimations(animations, scene)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 3.5 / maxDim
      groupRef.current.scale.setScalar(scale)
      groupRef.current.position.sub(center.multiplyScalar(scale))
    }
    if (actions) {
      const keys = Object.keys(actions)
      if (keys.length > 0) {
        const action = actions[keys[0]]
        if (action) action.play()
      }
    }
    onReady?.()
  }, [actions, onReady])

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

function LoaderFallback() {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4
  })
  return (
    <group ref={ref}>
      <mesh position={[0, 0.3, 0]}>
        <capsuleGeometry args={[0.55, 1.4, 6, 16]} />
        <meshStandardMaterial color="#f0ece8" metalness={0.05} roughness={0.4} />
      </mesh>
      <mesh position={[0, -1.2, 0]}>
        <coneGeometry args={[0.25, 1.2, 8]} />
        <meshStandardMaterial color="#e8e0d8" metalness={0.0} roughness={0.5} />
      </mesh>
    </group>
  )
}

function ModelWithFallback({ onReady }: { onReady?: () => void }) {
  return (
    <Suspense fallback={<LoaderFallback />}>
      <MolarModel onReady={onReady} />
    </Suspense>
  )
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 4]} intensity={1.6} castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
      <directionalLight position={[-4, 3, -4]} intensity={0.5} color="#c9d8e8" />
      <pointLight position={[0, -3, 3]} intensity={0.4} color="#c9a96e" />
      <spotLight position={[0, 6, -6]} angle={0.35} penumbra={1} intensity={0.6} color="#e0f5f3" />
    </>
  )
}

function Particles() {
  const pRef = useRef<THREE.Points>(null)
  useEffect(() => {
    const count = 80
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 16
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10 + 1
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({ color: '#0ea5a0', size: 0.035, transparent: true, opacity: 0.45, sizeAttenuation: true })
    if (pRef.current) { pRef.current.geometry = geo; pRef.current.material = mat }
  }, [])
  useFrame((_, delta) => { if (pRef.current) pRef.current.rotation.y += delta * 0.04 })
  return <points ref={pRef} />
}

function GroundGlow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0]} receiveShadow>
      <planeGeometry args={[24, 24]} />
      <meshStandardMaterial color="#e0f5f3" transparent opacity={0.25} roughness={0.9} />
    </mesh>
  )
}

function SceneContent({ onReady }: { onReady?: () => void }) {
  return (
    <>
      <SceneLights />
      <GroundGlow />
      <Particles />
      <ModelWithFallback onReady={onReady} />
      <OrbitControls enableDamping dampingFactor={0.08} autoRotate autoRotateSpeed={1.0}
        minDistance={2.5} maxDistance={10} target={[0, 0.2, 0]} enablePan={false} />
    </>
  )
}

// ─── Services accordion CSS ───
const ACCORDION_CSS = `
  @import url('https://fonts.bunny.net/css?family=jura:300,500');
  .sa-grid {
    --grid-cols: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    display: grid;
    grid-template-columns: var(--grid-cols);
    width: 100%;
    aspect-ratio: 3 / 1;
    counter-reset: sa-counter;
    transition: grid-template-columns 360ms cubic-bezier(0.4,0,0.2,1);
  }
  /* 6 cards × 3 columns, overlap by 1 each → spans cols 1-3, 3-5, 5-7, 7-9, 9-11, 11-13 */
  .sa-grid:has(.sa-item:nth-child(1):hover) { --grid-cols: 6fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr; }
  .sa-grid:has(.sa-item:nth-child(2):hover) { --grid-cols: 1fr 1fr 1fr 6fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr; }
  .sa-grid:has(.sa-item:nth-child(3):hover) { --grid-cols: 1fr 1fr 1fr 1fr 1fr 6fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr; }
  .sa-grid:has(.sa-item:nth-child(4):hover) { --grid-cols: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 6fr 1fr 1fr 1fr 1fr 1fr; }
  .sa-grid:has(.sa-item:nth-child(5):hover) { --grid-cols: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 6fr 1fr 1fr 1fr; }
  .sa-grid:has(.sa-item:nth-child(6):hover) { --grid-cols: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 6fr 1fr; }

  .sa-item {
    position: relative;
    overflow: hidden;
    border-radius: 0 0 0 30% / 0 0 0 50%;
    transition: all 360ms cubic-bezier(0.4,0,0.2,1);
    border: 4px solid rgba(248,244,238,0.9);
    background-image: var(--bg-img);
    background-size: cover;
    background-position: center;
    grid-row: 1;
    cursor: pointer;
    text-decoration: none;
  }
  .sa-item:first-child  { border-radius: 14px 0 0 14px; }
  .sa-item:last-child   { border-radius: 0 14px 14px 0; }
  .sa-item:hover,
  .sa-item:hover + .sa-item { border-radius: 0; }
  .sa-item:first-child:hover  { border-radius: 14px 0 0 14px; }
  .sa-item:last-child:hover   { border-radius: 0 14px 14px 14px; }
  .sa-item:nth-child(1) { grid-column: 1  / span 3; }
  .sa-item:nth-child(2) { grid-column: 3  / span 3; }
  .sa-item:nth-child(3) { grid-column: 5  / span 3; }
  .sa-item:nth-child(4) { grid-column: 7  / span 3; }
  .sa-item:nth-child(5) { grid-column: 9  / span 3; }
  .sa-item:nth-child(6) { grid-column: 11 / span 3; }

  /* Dark gradient overlay */
  .sa-item::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(10,10,30,0.25) 0%, rgba(10,10,30,0.65) 55%, rgba(10,10,30,0.92) 100%);
    transition: opacity 360ms ease;
  }
  .sa-item:hover::before { opacity: 0.85; }

  /* Counter number */
  .sa-item::after {
    content: counter(sa-counter, decimal-leading-zero);
    counter-increment: sa-counter;
    position: absolute;
    top: 0.75rem;
    left: 1rem;
    font-size: 2.4rem;
    font-family: 'Jura', sans-serif;
    font-weight: 300;
    color: rgba(255,255,255,0.88);
    transform: scale(0) translateY(-10px);
    opacity: 0;
    transition: transform 220ms ease, opacity 220ms ease;
    z-index: 2;
    line-height: 1;
  }
  .sa-item:hover::after { transform: scale(1) translateY(0); opacity: 1; }

  /* Vertical title (collapsed state) */
  .sa-vtitle {
    position: absolute;
    bottom: 1.25rem;
    left: 0.875rem;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-family: 'Jura', sans-serif;
    font-weight: 500;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.88);
    white-space: nowrap;
    z-index: 3;
    transition: opacity 240ms ease, transform 360ms ease;
  }
  .sa-item:hover .sa-vtitle {
    opacity: 0;
    transform: rotate(180deg) translateX(20px);
  }

  /* Expanded content panel */
  .sa-panel {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 1.25rem;
    z-index: 3;
    transform: translateY(64%);
    transition: transform 360ms cubic-bezier(0.4,0,0.2,1);
  }
  .sa-item:hover .sa-panel { transform: translateY(0); }

  .sa-panel-inner {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 220ms ease 100ms, transform 260ms ease 100ms;
  }
  .sa-item:hover .sa-panel-inner { opacity: 1; transform: translateY(0); }

  /* Mobile: stack vertically */
  @media (max-width: 640px) {
    .sa-grid {
      display: flex;
      flex-direction: column;
      aspect-ratio: auto;
      gap: 0.75rem;
    }
    .sa-item { border-radius: 14px !important; min-height: 190px; grid-column: auto !important; }
    .sa-vtitle { writing-mode: horizontal-tb; transform: none; position: static; }
    .sa-panel { transform: translateY(0) !important; }
    .sa-panel-inner { opacity: 1 !important; transform: none !important; }
    .sa-item::after { display: none; }
  }
`

export default function HomePage() {
  const [modelReady, setModelReady] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <style>{ACCORDION_CSS}</style>

      {/* ── Hero: 3D Molar + Headline ── */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-aqua-light/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left text */}
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-aqua-light text-aqua-dark text-xs font-semibold rounded-full">
                <span className="w-1.5 h-1.5 bg-aqua rounded-full animate-pulse" />
                Multi-clinic platform — Egypt
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy leading-[1.1] tracking-tight">
                Dental care and
                <span className="block text-aqua mt-1">education, booked online.</span>
              </h1>

              <p className="text-lg text-charcoal/80 max-w-lg leading-relaxed">
                Find clinics, compare services, rent chairs and dummy heads, enroll in courses,
                and get tooth-selection assistance — all from one place. Pay a deposit online
                and confirm your booking instantly.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/chair-rental"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-charcoal transition-all shadow-lg shadow-navy/10 hover:-translate-y-0.5">
                  Book a Chair
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link href="/tooth-assistance"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-aqua text-white text-sm font-semibold rounded-xl hover:bg-aqua-dark transition-all shadow-lg shadow-aqua/20 hover:-translate-y-0.5">
                  Tooth Assistance
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted">
                {[
                  ['Secure booking & payments', 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
                  ['Live availability', 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5v-5l3.5 2-3.5 3z'],
                  ['Paymob · EGP · 50% deposit', 'M20 6L9 17l-5-5'],
                ].map(([label, path]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={path} />
                    </svg>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 3D canvas */}
            <div className="relative animate-slide-up stagger-2">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-cream to-ivory border border-border shadow-2xl shadow-navy/5">
                <div className="w-full aspect-square max-w-md mx-auto">
                  <Canvas camera={{ position: [3.5, 1.5, 5], fov: 38 }} shadows
                    gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}
                    dpr={[1, 2]} className="touch-none">
                    <Suspense fallback={null}>
                      <SceneContent onReady={() => setModelReady(true)} />
                    </Suspense>
                  </Canvas>
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs text-muted border border-border/50 shadow-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  Drag to rotate · Scroll to zoom
                </div>

                {!modelReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ivory/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-aqua border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-muted">Loading 3D model…</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-white rounded-full px-3 py-1.5 shadow-lg border border-border text-xs font-semibold text-navy animate-float">
                Maxillary First Molar
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-aqua-light rounded-full opacity-60 blur-md" />
              <div className="absolute -top-6 left-8 w-8 h-8 bg-gold/20 rounded-full opacity-80 blur-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Accordion ── */}
      <section className="py-16 md:py-20 bg-cream/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 animate-fade-in">
            <span className="inline-block px-2.5 py-1 bg-aqua-light text-aqua-dark text-xs font-semibold rounded-full mb-3">
              What we offer
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy">
              All platform services
            </h2>
            <p className="text-charcoal/60 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Hover each card to explore. Each service has its own dedicated page with full details,
              pricing, and a direct booking flow.
            </p>
          </div>

          {/* Accordion cards */}
          <div className="sa-grid">
            {SERVICES.map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                className="sa-item"
                style={{ ['--bg-img' as string]: `url(${s.image})` }}
                aria-label={s.name}
              >
                <span className="sa-vtitle">{s.name}</span>
                <div className="sa-panel">
                  <div className="sa-panel-inner">
                    <div className="h-0.5 w-8 rounded mb-2" style={{ background: s.accentColor }} />
                    <p className="text-white/55 text-[10px] uppercase tracking-widest font-medium mb-1">
                      {s.tagline}
                    </p>
                    <h3 className="text-white font-bold text-sm leading-tight mb-1.5">
                      {s.name}
                    </h3>
                    <p className="text-white/65 text-[11px] leading-relaxed mb-3 line-clamp-2">
                      {s.shortDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold text-sm">{s.price} EGP</span>
                        <span className="text-white/45 text-[10px] ml-1">· {s.duration}min</span>
                      </div>
                      <span
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-lg"
                        style={{ background: s.accentColor }}
                      >
                        Explore →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <p className="text-center text-xs text-muted mt-4">
            Hover to expand · Click to view full service page · 50% deposit · All prices in EGP
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-navy">How it works</h2>
            <p className="text-charcoal/70 mt-3 max-w-xl mx-auto">
              Three simple steps from discovery to confirmed booking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01', title: 'Choose a clinic',
                desc: 'Browse clinics, view their services, hours, and resources. Each clinic configures its own profile.',
                href: '/clinics',
              },
              {
                step: '02', title: 'Pick a service & time',
                desc: 'See live availability, select your chair, dummy head, course, or assistance session, and choose a slot.',
                href: '/chair-rental',
              },
              {
                step: '03', title: 'Pay deposit & confirm',
                desc: 'Pay at least 50% of the total online via Paymob. Your booking is confirmed automatically.',
                href: '/auth/register',
              },
            ].map((item) => (
              <Link key={item.step} href={item.href}
                className="group relative p-6 rounded-xl bg-white border border-border hover:border-aqua/30 hover:shadow-lg transition-all">
                <span className="text-5xl font-black text-aqua/20 group-hover:text-aqua/30 transition-colors select-none">
                  {item.step}
                </span>
                <h3 className="text-base font-semibold text-navy mt-2 group-hover:text-aqua transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted mt-2 leading-relaxed">{item.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs text-aqua font-medium mt-4 group-hover:gap-2 transition-all">
                  Learn more
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 md:py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to book your next appointment?
          </h2>
          <p className="text-white/70 mt-3 max-w-lg mx-auto text-base">
            Create your account, browse clinics, and reserve a chair or dummy head in under two minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-aqua text-white text-sm font-semibold rounded-xl hover:bg-aqua-dark transition-all shadow-xl hover:-translate-y-0.5">
              Get Started Free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-all">
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
