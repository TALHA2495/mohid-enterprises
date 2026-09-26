import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'

// Shared light shell for /factory & /standards: full-bleed backdrop photo
// plus site header/footer. Replaces the previous per-page DarkShell copies.
export function PageShell({ children }: { children: React.ReactNode }) {
  return <main id="main" className="relative min-h-screen bg-[#f7f8f5] text-[#101412]"><SiteHeader />{children}<SiteFooter /></main>
}
