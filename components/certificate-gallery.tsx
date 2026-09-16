'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

type Certificate = { title: string; image: string }

export function CertificateGallery({ certificates }: { certificates: Certificate[] }) {
  const [selected, setSelected] = useState<Certificate | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  const openCert = (cert: Certificate) => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setSelected(cert)
  }

  const closeCert = () => {
    setSelected(null)
    openerRef.current?.focus()
  }

  // Focus the dialog when it opens; the opener regains focus on close.
  useEffect(() => {
    if (selected) dialogRef.current?.focus()
  }, [selected])

  // Escape closes; Tab is trapped inside the single-element modal.
  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      closeCert()
    } else if (event.key === 'Tab') {
      event.preventDefault()
      dialogRef.current?.focus()
    }
  }

  return (
    <>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => (
          <figure
            key={cert.title}
            tabIndex={0}
            role="button"
            aria-label={`View ${cert.title} larger`}
            aria-haspopup="dialog"
            onClick={() => openCert(cert)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                openCert(cert)
              }
            }}
            className="relative cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-white transition-colors hover:border-black/20"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
              <Image src={cert.image} alt={cert.title} fill loading="lazy" quality={55} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="size-full object-cover" />
            </div>
            <figcaption className="p-4">
              <p className="text-center text-xs text-black/70">{cert.title}</p>
              <p className="mt-1 text-center text-[10px] text-[#00c853]">Click to view</p>
            </figcaption>
          </figure>
        ))}
      </div>
      {selected && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => closeCert()}
          onKeyDown={handleDialogKeyDown}
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-white/10" onClick={(event) => event.stopPropagation()}>
            <img src={selected.image} alt="" className="max-h-[90vh] w-auto object-contain" />
          </div>
        </div>
      )}
    </>
  )
}
