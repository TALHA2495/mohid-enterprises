'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

const CARD_SIZES = '(max-width: 639px) 142px, (max-width: 767px) 158px, (max-width: 1023px) 188px, (max-width: 1279px) 208px, 238px'

type HeroCategoryItem = {
  id: string
  label: string
  filter: string
  image: string
}

export function HeroCategoryMarquee({ categories }: { categories: readonly HeroCategoryItem[] }) {
  const marqueeCategories = [...categories, ...categories]
  const scrollerRef = useRef<HTMLDivElement>(null)

  // Touch devices: drift by advancing scrollLeft (layout and pixels always in
  // sync, so dragging can never reveal a dead zone). User drags take priority:
  // we stop writing scrollLeft and native momentum runs untouched, resuming
  // shortly after release.
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    if (!window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const track = el.querySelector<HTMLElement>('[data-marquee-track]')
    const first = track?.children[0] as HTMLElement | undefined
    const firstClone = track?.children[categories.length] as HTMLElement | undefined
    if (!first || !firstClone) return

    const setWidth = firstClone.offsetLeft - first.offsetLeft
    if (!Number.isFinite(setWidth) || setWidth <= 0) return
    // Start one full set in: sets are pixel-identical, so this is visually
    // invisible and gives equal smooth drag range to the left and right.
    el.scrollLeft = setWidth

    const speed = setWidth / 60000 // px per ms (one set per 60s, matches --marquee-duration)
    let raf = 0
    let last = 0
    let interacting = false
    let resumeAt = 0

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      if (last === 0) { last = t; return }
      const dt = t - last
      last = t
      if (interacting || t < resumeAt || el.matches(':focus-within')) return
      const x = (el.scrollLeft + speed * dt) % setWidth
      el.scrollLeft = x
    }

    const startInteract = () => { interacting = true }
    const endInteract = () => { interacting = false; resumeAt = performance.now() + 800 }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else if (!raf) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }

    el.addEventListener('pointerdown', startInteract)
    el.addEventListener('touchstart', startInteract, { passive: true })
    window.addEventListener('pointerup', endInteract)
    window.addEventListener('pointercancel', endInteract)
    window.addEventListener('touchend', endInteract, { passive: true })
    window.addEventListener('touchcancel', endInteract, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointerdown', startInteract)
      el.removeEventListener('touchstart', startInteract)
      window.removeEventListener('pointerup', endInteract)
      window.removeEventListener('pointercancel', endInteract)
      window.removeEventListener('touchend', endInteract)
      window.removeEventListener('touchcancel', endInteract)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [categories.length])

  return (
    <div ref={scrollerRef} role="region" aria-label="Product categories" tabIndex={0} data-marquee className="relative -mx-5 mt-12 md:mt-6  mb-6 w-[calc(100%+2.5rem)] sm:-mx-8 sm:mt-8 sm:mb-8 sm:w-[calc(100%+4rem)] md:-mx-12 md:mt-10 md:mb-10 md:w-[calc(100%+6rem)] lg:-mx-20 lg:w-[calc(100%+10rem)] xl:-mx-24 xl:w-[calc(100%+12rem)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#101412]">
      <div data-marquee-track className="flex w-max gap-3 md:gap-4">
        {marqueeCategories.map((category, index) => {
          const isClone = index >= categories.length
          return (
            <Link key={`${category.id}-${index}`} href={`/showroom?filter=${encodeURIComponent(category.filter)}`} aria-label={`View ${category.label} products`} aria-hidden={isClone || undefined} tabIndex={isClone ? -1 : undefined} className="group relative block h-[92px] w-[142px] shrink-0 overflow-hidden rounded-xl border border-[#101412]/15 bg-[#dfe6e1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2 sm:h-[112px] sm:w-[158px] sm:rounded-2xl md:h-[134px] md:w-[188px] lg:h-[148px] lg:w-[208px] xl:h-[164px] xl:w-[238px]">
              <Image src={category.image} alt="" fill quality={70} sizes={CARD_SIZES} loading="eager" decoding="sync" fetchPriority={index < categories.length ? "high" : "low"} className="size-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5"><h2 title={category.label} className="line-clamp-2 break-words text-[11px] font-semibold leading-tight text-white drop-shadow sm:text-xs md:text-sm">{category.label}</h2></div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
