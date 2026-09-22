import type { MetadataRoute } from 'next'

// Web app manifest (seo.md contract). Icons are the existing PWA assets.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mohid Enterprises',
    short_name: 'Mohid',
    description:
      'Textile trims — laces, cords, tapes and specialty trims manufactured in Faisalabad, Pakistan.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f7f8',
    theme_color: '#f4f7f8',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
