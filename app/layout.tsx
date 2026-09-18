import type { Metadata, Viewport } from 'next'
import { Calistoga, Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google'
import { AnalyticsLoader } from '@/components/analytics-loader'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
})
const calistoga = Calistoga({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['monospace'],
})
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
  preload: false, // only used in showroom product detail (below fold elsewhere)
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
      className={`bg-background ${inter.variable} ${calistoga.variable} ${jetbrainsMono.variable} ${playfair.variable}`}
    >
      <body className="font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 rounded-full bg-[#01aa3f] px-4 py-2 text-sm font-medium text-white">Skip to main content</a>
        {children}
        {process.env.NODE_ENV === 'production' && <AnalyticsLoader />}
      </body>
    </html>
  )
}
