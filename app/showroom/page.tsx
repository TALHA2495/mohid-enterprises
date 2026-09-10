import Image from 'next/image'
import { ShowroomSection } from '@/components/showroom-section'
import { SiteHeader } from '@/components/site-header'

export default function Page() { return <main className="relative min-h-screen bg-[#f4f7f8]"><div aria-hidden="true" className="absolute inset-x-0 top-0 z-0 h-[min(760px,100vh)] overflow-hidden lg:h-[100vh]"><Image src="/images/trims2.webp" alt="" priority fetchPriority="high" fill quality={70} sizes="100vw" className="size-full object-cover" /></div><SiteHeader /><ShowroomSection /></main> }
