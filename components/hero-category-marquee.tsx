'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const CARD_SIZES = '(max-width: 639px) 142px, (max-width: 767px) 158px, (max-width: 1023px) 188px, (max-width: 1279px) 208px, 238px'

type HeroCategoryItem = {
  id: string
  label: string
  filter: string
  image: string
}

export function HeroCategoryMarquee({ categories }: { categories: readonly HeroCategoryItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pointer = useRef({ id: -1, startX: 0, startOffset: 0, moved: false })
  const dragOffset = useRef(0)
  const [paused, setPaused] = useState(false)
  const marqueeCategories = [...categories, ...categories]

  useEffect(() => {
    const track = trackRef.current
    if (!track || !categories.length) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointerState = pointer.current
    let frame = 0
    let position = 0
    let previous = performance.now()

    const draw = (time: number) => {
      const elapsed = Math.min((time - previous) / 1000, 0.05)
      previous = time
      const loopWidth = track.scrollWidth / 2
      if (!reducedMotion.matches && !paused && pointerState.id === -1) {
        position = (position - elapsed * 38) % loopWidth
        dragOffset.current = 0
      }
      track.style.transform = `translate3d(${reducedMotion.matches ? 0 : position - dragOffset.current}px, 0, 0)`
      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [categories.length, paused])

  return (
    <div
      aria-label="Product categories"
      data-marquee
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="marquee-shell relative -mx-5 mt-5 w-[calc(100%+2.5rem)] sm:-mx-8 sm:mt-6 sm:w-[calc(100%+4rem)] md:-mx-12 md:mt-7 md:w-[calc(100%+6rem)] lg:-mx-20 lg:w-[calc(100%+10rem)] xl:-mx-24 xl:w-[calc(100%+12rem)]"
    >
      <div
        ref={trackRef}
        data-marquee-track
        className="flex w-max gap-2.5 sm:gap-3 md:gap-4"
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return
          pointer.current = { id: event.pointerId, startX: event.clientX, startOffset: 0, moved: false }
          dragOffset.current = 0
          event.currentTarget.parentElement?.setAttribute('data-dragging', 'true')
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          const state = pointer.current
          if (state.id !== event.pointerId) return
          const distance = event.clientX - state.startX
          if (Math.abs(distance) > 5) state.moved = true
          const resistance = event.pointerType === 'touch' ? 0.82 : 1
          dragOffset.current = distance * resistance
        }}
        onPointerUp={(event) => {
          if (pointer.current.id === event.pointerId) {
            pointer.current.id = -1
            dragOffset.current = 0
            event.currentTarget.parentElement?.removeAttribute('data-dragging')
          }
        }}
        onPointerCancel={(event) => {
          if (pointer.current.id === event.pointerId) {
            pointer.current.id = -1
            dragOffset.current = 0
            event.currentTarget.parentElement?.removeAttribute('data-dragging')
          }
        }}
        onClickCapture={(event) => {
          if (!pointer.current.moved) return
          event.preventDefault()
          event.stopPropagation()
          pointer.current.moved = false
        }}
      >
        {marqueeCategories.map((category, index) => (
          <Link
            key={`${category.id}-${index}`}
            href={`/showroom?filter=${encodeURIComponent(category.filter)}`}
            aria-label={`View ${category.label} products`}
            className="group relative block h-[92px] w-[142px] shrink-0 touch-pan-y overflow-hidden rounded-xl border border-[#101412]/15 bg-[#e8eeea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2 sm:h-[112px] sm:w-[158px] sm:rounded-2xl md:h-[134px] md:w-[188px] lg:h-[148px] lg:w-[208px] xl:h-[164px] xl:w-[238px]"
          >
            <Image src={category.image} alt="" fill quality={70} sizes={CARD_SIZES} className="size-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5">
              <h2 title={category.label} className="line-clamp-2 break-words text-[10px] font-semibold leading-tight text-white drop-shadow sm:text-xs md:text-sm">{category.label}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
