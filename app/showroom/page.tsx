import Image from 'next/image'
import { ShowroomSection } from '@/components/showroom-section'
import { SiteHeader } from '@/components/site-header'

export default function Page() { return <main id="main" className="relative bg-[#f4f7f8]"><div aria-hidden="true" className="fixed inset-x-0 top-0 z-0 h-[100vh] overflow-hidden"><Image src="/images/trims2.webp" alt="" priority fetchPriority="high" fill quality={70} sizes="100vw" className="size-full object-cover" /></div><SiteHeader /><ShowroomSection /></main> }
