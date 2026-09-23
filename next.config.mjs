/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Live ImageKit account for all public photography (products, factory,
      // certificates, brand logo). Delivery transforms are appended by
      // lib/public-data.server.ts and the page components.
      { protocol: 'https', hostname: 'ik.imagekit.io', pathname: '/a2q8u8qtw/**' },
      // Previous account. No component references it any more, but admin users
      // can paste a legacy URL into any `image_url` column, so keep it allowed
      // rather than turning a stale row into a 500.
      { protocol: 'https', hostname: 'ik.imagekit.io', pathname: '/wavawecyl/**' },
    ],
    qualities: [55, 70, 75],
  },
  experimental: {
    inlineCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  async headers() {
    return [
      // ---------------------------------------------------------------------
      // Catch-all FIRST. When several rules match, the LAST one wins per header
      // key — so the catch-all has to lead, otherwise its 86400s Cache-Control
      // overrides every specific rule below (which is what used to happen:
      // /images/* was served with s-maxage=86400 instead of max-age=604800).
      // ---------------------------------------------------------------------
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/certificates/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // NOTE: these folders were renamed — the legacy "factory webp images"
        // and "product images compressed" paths no longer exist and 404, so
        // their old cache rules were dead.
        source: '/:folder(factory|products)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      // ---------------------------------------------------------------------
      // DB-driven pages. They render rows from Supabase, so they get a short
      // edge TTL (matching `export const revalidate = 60`) — an admin edit is
      // visible within a minute instead of being pinned for 24h by the
      // catch-all above.
      // ---------------------------------------------------------------------
      ...['/showroom', '/factory', '/standards'].map((source) => ({
        source,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      })),
    ]
  },
}

export default nextConfig
