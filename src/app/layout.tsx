import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dental — Multi-Clinic Booking & Education Platform',
  description: 'Discover dental clinics, book appointments, rent chairs and dummy heads, enroll in courses, and get tooth-selection assistance — all in one place.',
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
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  )
}
