import { HeroSection } from '@/components/hero-section'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return <main className="relative min-h-screen overflow-hidden bg-[#f4f7f8]"><div className="fixed inset-x-0 top-0 z-0 h-[min(760px,100vh)]"><img src="/images/trims-bg.webp" alt="" aria-hidden="true" className="size-full object-cover" /><div className="absolute inset-0 bg-black/40" /><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/65" /></div><SiteHeader /><HeroSection /><div className="relative z-10 bg-[#f4f7f8]"><SiteFooter /></div></main>
}
