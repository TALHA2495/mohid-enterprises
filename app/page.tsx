import Image from 'next/image'
import { HeroSection } from '@/components/hero-section'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return <main className="relative min-h-screen overflow-hidden bg-[#f4f7f8]"><div className="fixed inset-x-0 top-0 z-0 h-[min(760px,100vh)] lg:h-[95vh]"><Image src="/images/bg-img-for-mobile-screen.webp" alt="" aria-hidden="true" priority fill quality={70} sizes="100vw" className="size-full object-cover lg:hidden" /><Image src="/images/hero-bg.webp" alt="" aria-hidden="true" priority fill quality={70} sizes="100vw" className="hidden size-full object-cover lg:block" /></div><SiteHeader /><HeroSection /><div className="relative z-10 bg-[#f4f7f8]"><SiteFooter /></div></main>
}