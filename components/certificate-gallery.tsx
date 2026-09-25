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

export function CertificateGallery({ certificates, single = false }: { certificates: Certificate[]; single?: boolean }) {
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

  // Lock background scroll while the lightbox is open, restore on close.
  useEffect(() => {
    if (!selected) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
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
      <div
        className={
          single
            ? 'mx-auto mt-3 grid w-full max-w-[15rem] grid-cols-1 sm:max-w-[17rem] lg:max-w-[19rem]'
            : 'mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
        }
      >
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
            className="group relative cursor-pointer overflow-hidden rounded-xl  transition-transform duration-500 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] active:scale-[0.98]"
          >
            <div className="relative aspect-[3/4]" style={single ? { maxHeight: 'min(70vh, 26rem)' } : undefined}>
              <Image
                src={cert.image}
                alt={cert.title}
                fill
                loading="lazy"
                quality={70}
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 92vw"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c1310]/72 p-4 backdrop-blur-sm"
          onClick={() => closeCert()}
          onKeyDown={handleDialogKeyDown}
        >
          <div
            className="relative max-w-[min(56rem,92vw)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selected.image}
              alt=""
              width={1600}
              height={2200}
              quality={80}
              sizes="(min-width: 1024px) 90vw, 92vw"
              className="max-h-[85vh] w-auto object-contain"
              priority
            />
          </div>
          <button
            type="button"
            aria-label="Close certificate"
            onClick={closeCert}
            className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span aria-hidden="true" className="text-2xl leading-none">
              &#215;
            </span>
          </button>
        </div>
      )}
    </>
  )
}
