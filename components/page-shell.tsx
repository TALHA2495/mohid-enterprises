import Image from 'next/image'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'

// Shared light shell for /factory & /standards: full-bleed backdrop photo
// plus site header/footer. Replaces the previous per-page DarkShell copies.
export function PageShell({ children }: { children: React.ReactNode }) {
  return <main id="main" className="relative min-h-screen bg-[#f4f7f8] text-black"><div aria-hidden="true" className="absolute inset-x-0 top-0 z-0 h-[min(760px,100vh)] overflow-hidden lg:h-[100vh]"><Image src="/images/trims2.webp" alt="" priority fetchPriority="high" fill sizes="100vw" quality={70} className="size-full object-cover" /></div><div className="relative z-10"><SiteHeader />{children}<SiteFooter /></div></main>
}
