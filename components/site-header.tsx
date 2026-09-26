'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { siteNavLinks } from '@/lib/navigation'

// Brand logo lives on the ImageKit CDN (account a2q8u8qtw, /Brand folder).
// NEXT_PUBLIC_LOGO_URL overrides it when set; the literal keeps the header
// rendering if the variable is blank. Verified reachable (HTTP 200).
const LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL?.trim() ||
  `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? 'https://ik.imagekit.io/a2q8u8qtw'}/Brand/Mohid%20logo.png`

export function SiteHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close the mobile menu with Escape at any focus point while it is open.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  return <>
    <header className="relative z-30 mx-auto flex w-full items-center justify-between gap-4 bg-white border-b border-black/10 px-4 py-5 text-black sm:px-6">
      <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5"><Image src={LOGO_URL} alt="Mohid Enterprises logo" width={1600} height={1491} sizes="(min-width: 768px) 24px, 32px" className="h-6 w-auto object-contain md:h-6" priority /><span className="flex flex-col leading-[1.15]"><span className="text-[16px] font-bold tracking-[0.055em]">MOHID</span><span className="text-[12px] font-semibold tracking-[0.12em] text-current opacity-75">ENTERPRISES</span></span></Link>
      <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
        {siteNavLinks.map(([label, href]) => <Link key={href} href={href} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${pathname === href ? 'bg-[#01aa3f]/12 font-medium text-[#01aa3f]' : 'text-black/70 hover:text-black'}`}>{label}</Link>)}
      </nav>
      <div className="flex items-center gap-2"><Link href="/quote" className="hidden rounded-full bg-[#01aa3f] px-5 py-2.5 text-sm font-medium text-[#07120b] transition-colors hover:bg-[#00be48] active:scale-[0.98] sm:inline-flex">Request a Quote</Link><button type="button" aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)} className="inline-flex size-11 items-center justify-center rounded-full border border-black/15 bg-black/[0.04] text-black backdrop-blur-sm transition-colors active:scale-[0.95] md:hidden">{isOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>
    </header>
    <div className={`fixed inset-0 z-20 md:hidden transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} role="dialog" aria-label="Mobile navigation" aria-hidden={!isOpen} inert={!isOpen} tabIndex={-1}><button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} /><aside className={`absolute top-24 right-4 left-4 rounded-2xl border border-black/10 bg-white p-2 text-black shadow-2xl transition-all duration-500 ease-in-out will-change-transform ${isOpen ? 'origin-top translate-y-0 opacity-100' : 'origin-top -translate-y-10 opacity-0'}`}><nav aria-label="Mobile primary" className="flex flex-col">{siteNavLinks.map(([label, href]) => <Link key={href} href={href} onClick={() => setIsOpen(false)} className={`rounded-xl px-4 py-3 text-sm transition-colors ${pathname === href ? 'bg-[#01aa3f]/12 font-medium text-[#01aa3f]' : 'text-black/70 hover:bg-black/[0.04]'}`}>{label}</Link>)}</nav></aside></div>
  </>
}