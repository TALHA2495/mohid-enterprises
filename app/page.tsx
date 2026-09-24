import { HeroSection } from '@/components/hero-section'
import { HomeCategoryDirectory } from '@/components/home-category-directory'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <main id="main" className="relative min-h-screen overflow-x-hidden bg-[#f4f7f8]">
      <SiteHeader />
      <HeroSection />
      <HomeCategoryDirectory />
      <SiteFooter />
    </main>
  )
}
