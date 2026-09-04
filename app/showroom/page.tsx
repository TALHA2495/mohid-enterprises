import { ShowroomSection } from '@/components/showroom-section'
import { SiteHeader } from '@/components/site-header'

export default function Page() { return <main className="relative min-h-screen bg-[#0a0c0b]"><div aria-hidden="true" className="absolute inset-x-0 top-0 z-0 h-[min(760px,100vh)] overflow-hidden lg:h-[100vh]"><img src="/images/trims2.webp" alt="" className="size-full object-cover" /><div className="absolute inset-0 bg-black/40" /><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-[#0a0c0b]" /></div><SiteHeader /><ShowroomSection /></main> }
