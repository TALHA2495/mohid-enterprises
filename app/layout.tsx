import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AnalyticsLoader } from '@/components/analytics-loader'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
})
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mohident.com'),
  title: {
    default: 'Textile Trims — Made for Scale | Faisalabad, Pakistan',
    template: '%s | Mohid Enterprises',
  },
  description:
    'A trusted manufacturing partner for custom laces, cords, tapes and specialty trims engineered in Faisalabad for global procurement teams.',
  applicationName: 'Mohid Enterprises',
  openGraph: {
    type: 'website',
    siteName: 'Mohid Enterprises',
    url: '/',
    locale: 'en_US',
    title: 'Textile Trims — Made for Scale | Faisalabad, Pakistan',
    description:
      'Custom laces, cords, tapes and specialty trims, engineered in Faisalabad for global procurement teams.',
    images: [
      {
        url: '/images/hero-bg.webp',
        width: 1600,
        height: 900,
        alt: 'Mohid Enterprises — textile trims manufacturing floor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Textile Trims — Made for Scale | Faisalabad, Pakistan',
    description: 'Custom laces, cords, tapes and specialty trims, engineered in Faisalabad.',
    images: ['/images/hero-bg.webp'],
  },
  robots: { index: true, follow: true },
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
      className={`bg-background ${inter.variable}`}
    >
      <body className="font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 rounded-full bg-[#01aa3f] px-4 py-2 text-sm font-medium text-white">Skip to main content</a>
        {children}
        {process.env.NODE_ENV === 'production' && <AnalyticsLoader />}
      </body>
    </html>
  )
}
