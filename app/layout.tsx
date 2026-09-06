import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter, Playfair_Display } from 'next/font/google'
import { AnalyticsLoader } from '@/components/analytics-loader'
import './globals.css'

const inter = Inter({
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
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a0c0b' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0c0b' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${inter.variable} ${playfair.variable} ${fraunces.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <AnalyticsLoader />}
      </body>
    </html>
  )
}
