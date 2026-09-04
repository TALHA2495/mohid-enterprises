'use client'

import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [['Showroom', '/showroom'], ['Factory & Capacity', '/factory'], ['Standards', '/standards']]

export function SiteHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  return <>
    <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 text-white sm:px-6">
      <a href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5" aria-label="Home"><img src="/images/LOGO%20MOHID.webp" alt="Mohid Enterprises logo" className="h-11 w-auto object-contain md:h-[30px]" /><span className="flex flex-col leading-[1.15]"><span className="text-[13px] font-semibold tracking-[0.08em]">MOHID</span><span className="text-[10px] font-medium tracking-[0.14em] text-current opacity-60">ENTERPRISES</span></span></a>
      <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md md:flex">
        {navLinks.map(([label, href]) => <a key={href} href={href} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${pathname === href ? 'bg-white/10 font-medium text-white' : 'text-white/70 hover:text-white'}`}>{label}</a>)}
      </nav>
      <div className="flex items-center gap-2"><a href="/quote" className="hidden rounded-full bg-[#01aa3f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00ff59] sm:inline-flex">Request a Quote</a><button type="button" aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)} className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur-sm md:hidden">{isOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>
    </header>
    {isOpen && <div className="fixed inset-0 z-20 md:hidden" role="dialog" aria-label="Mobile navigation"><button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} /><aside className="absolute top-20 right-4 left-4 rounded-2xl border border-white/10 bg-[#101413] p-2 text-white shadow-2xl"><nav aria-label="Mobile primary" className="flex flex-col">{navLinks.map(([label, href]) => <a key={href} href={href} onClick={() => setIsOpen(false)} className={`rounded-xl px-4 py-3 text-sm ${pathname === href ? 'bg-white/10 font-medium text-white' : 'text-white/70 hover:bg-white/5'}`}>{label}</a>)}</nav></aside></div>}
  </>
}