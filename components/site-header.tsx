'use client'

import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [['Showroom', '/showroom'], ['Factory & Capacity', '/factory'], ['Standards', '/standards']]

export function SiteHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  return <>
    <header className="relative z-30 mx-auto flex w-full items-center justify-between gap-4 bg-white border-b border-black/5 px-4 py-5 text-black sm:px-6">
      <a href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5" aria-label="Home"><Image src="/images/LOGO%20MOHID.webp" alt="Mohid Enterprises logo" width={1600} height={1491} sizes="(min-width: 768px) 32px, 47px" className="h-11 w-auto object-contain md:h-[30px]" priority /><span className="flex flex-col leading-[1.15]"><span className="text-[13px] font-semibold tracking-[0.08em]">MOHID</span><span className="text-[10px] font-medium tracking-[0.14em] text-current opacity-60">ENTERPRISES</span></span></a>
      <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
        {navLinks.map(([label, href]) => <a key={href} href={href} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${pathname === href ? 'bg-black/[0.06] font-medium text-black' : 'text-black/70 hover:text-black'}`}>{label}</a>)}
      </nav>
      <div className="flex items-center gap-2"><a href="/quote" className="hidden rounded-full bg-[#01aa3f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00ff59] sm:inline-flex">Request a Quote</a><button type="button" aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)} className="inline-flex size-10 items-center justify-center rounded-full border border-black/15 bg-black/[0.04] text-black backdrop-blur-sm md:hidden">{isOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>
    </header>
    <div className={`fixed inset-0 z-20 md:hidden transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} role="dialog" aria-label="Mobile navigation" aria-hidden={!isOpen}><button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} /><aside className={`absolute top-24 right-4 left-4 rounded-2xl border border-black/10 bg-white p-2 text-black shadow-2xl transition-transform duration-500 ease-in-out will-change-transform ${isOpen ? 'translate-y-0' : '-translate-y-10'}`}><nav aria-label="Mobile primary" className="flex flex-col">{navLinks.map(([label, href]) => <a key={href} href={href} onClick={() => setIsOpen(false)} className={`rounded-xl px-4 py-3 text-sm ${pathname === href ? 'bg-black/[0.06] font-medium text-black' : 'text-black/70 hover:bg-black/[0.04]'}`}>{label}</a>)}</nav></aside></div>
  </>
}