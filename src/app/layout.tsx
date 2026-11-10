import type { Metadata } from 'next'
import '@fontsource-variable/manrope'
import '@fontsource-variable/inter'
import './globals.css'
import { ThemeProvider } from '@/components/site/ThemeProvider'
import SiteHeader from '@/components/site/SiteHeader'
import SiteFooter from '@/components/site/SiteFooter'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'DentalWeb — A space to practice',
    template: '%s · DentalWeb',
  },
  description:
    'Discover and reserve dental training equipment by the hour. Dental chairs from 150 EGP and phantom heads from 100 EGP, with a 50% deposit to confirm.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-porcelain-100 antialiased">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:h-11 focus:rounded-[10px] focus:bg-graphite-900 focus:px-4 focus:py-2.5 focus:text-[0.9375rem] focus:font-semibold focus:text-porcelain-50"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
