import { preload } from 'react-dom'
import { HeroSection } from '@/components/hero-section'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  preload('/images/bg-img-for-mobile-screen.webp', { as: 'image', fetchPriority: 'high' })
  preload('/images/hero-bg.webp', { as: 'image', fetchPriority: 'high' })
  return <main className="relative min-h-screen overflow-hidden bg-[#0a0c0b]"><div className="fixed inset-x-0 top-0 z-0 h-[min(760px,100vh)] lg:h-[95vh]"><img src="/images/bg-img-for-mobile-screen.webp" alt="" aria-hidden="true" fetchPriority="high" loading="eager" className="size-full object-cover lg:hidden" /><img src="/images/hero-bg.webp" alt="" aria-hidden="true" fetchPriority="high" loading="eager" className="hidden size-full object-cover lg:block" /><div className="absolute inset-0 bg-black/40" /><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/65" /></div><SiteHeader /><HeroSection /><div className="relative z-10 bg-[#0a0c0b]"><SiteFooter /></div></main>
}