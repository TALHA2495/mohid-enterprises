import type { Metadata, Viewport } from 'next'
import { Fraunces, Instrument_Sans, Playfair_Display } from 'next/font/google'
import { AnalyticsLoader } from '@/components/analytics-loader'
import './globals.css'

const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
})
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
  preload: false, // only used in showroom product detail (below fold elsewhere)
})
const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
})

export const metadata: Metadata = {
  title: 'Textile Trims — Made for Scale | Faisalabad, Pakistan',
  description:
    'A trusted manufacturing partner for custom laces, cords, tapes and specialty trims engineered in Faisalabad for global procurement teams.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f4f7f8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${instrument.variable} ${playfair.variable} ${fraunces.variable}`}
    >
      <body className="font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 rounded-full bg-[#01aa3f] px-4 py-2 text-sm font-medium text-black">Skip to main content</a>
        {children}
        {process.env.NODE_ENV === 'production' && <AnalyticsLoader />}
      </body>
    </html>
  )
}
