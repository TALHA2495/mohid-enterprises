'use client'

import Image from 'next/image'
import { useState } from 'react'

export function CertificateGallery({ certificates }: { certificates: { title: string; image: string }[] }) {
  const [selectedCert, setSelectedCert] = useState<string | null>(null)
  return <>
    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{certificates.map((cert)=><figure key={cert.title} className="relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#101413] transition-colors hover:border-white/20" onClick={()=>setSelectedCert(cert.image)}><div className="relative aspect-[16/10] overflow-hidden bg-black/40"><Image src={cert.image} alt={cert.title} fill loading="lazy" quality={55} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="size-full object-cover" /></div><figcaption className="p-4"><p className="text-center text-xs text-white/70">{cert.title}</p><p className="mt-1 text-center text-[10px] text-[#00c853]">Click to view</p></figcaption></figure>)}</div>
    {selectedCert && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={()=>setSelectedCert(null)}><div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-white/10" onClick={(e)=>e.stopPropagation()}><img src={selectedCert} alt="" className="max-h-[90vh] w-auto object-contain" /></div></div>}
  </>
}