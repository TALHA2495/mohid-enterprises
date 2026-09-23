'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

// ============================================================================
// CERTIFICATE GALLERY — direct document tiles, no card chrome or captions.
// ----------------------------------------------------------------------------
// 1 column on phones, 2 on small tablets, 4 in a single row on desktop.
// Each tile IS the certificate: object-contain inside a uniform aspect-[3/4]
// paper-white sheet so the WHOLE document stays visible (no cropped seals)
// and every tile aligns despite mixed page ratios. Click / Enter / Space
// opens the fullscreen lightbox.
// ============================================================================

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
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            className="group relative cursor-pointer overflow-hidden rounded-xl  transition-transform duration-500 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853] active:scale-[0.98]"
          >
            <div className="relative aspect-[3/4]">
              <Image
                src={cert.image}
                alt={cert.title}
                fill
                loading="lazy"
                quality={70}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="size-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
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
          <div className="relative max-h-[90vh] max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <img src={selected.image} alt="" className="max-h-[90vh] w-auto object-contain" />
          </div>
        </div>
      )}
    </>
  )
}
