'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export type HomeBanner = {
  imageUrl: string
  title?: string
  subtitle?: string
  href?: string
}

export default function HomeCarousel({
  items,
  intervalMs = 5000,
}: {
  items: HomeBanner[]
  intervalMs?: number
}) {
  const slides = useMemo(
    () => (items || []).filter((i) => i?.imageUrl?.trim()),
    [items]
  )

  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => {
      setIdx((p) => (p + 1) % slides.length)
    }, intervalMs)
    return () => clearInterval(t)
  }, [slides.length, intervalMs])

  // Se a lista mudar e o índice ficar inválido
  useEffect(() => {
    if (idx >= slides.length) setIdx(0)
  }, [slides.length, idx])

  if (slides.length === 0) return null

  const current = slides[idx]
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    current.href ? (
      <Link href={current.href} className="block">
        {children}
      </Link>
    ) : (
      <>{children}</>
    )

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/30">
      <Wrapper>
        <div className="relative h-[200px] sm:h-[260px] md:h-[340px]">
          <Image
            src={current.imageUrl}
            alt={current.title || 'Banner'}
            fill
            className="object-cover"
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 1100px"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {(current.title || current.subtitle) && (
            <div className="absolute left-6 right-6 bottom-6">
              {current.title && (
                <div className="text-white text-xl md:text-2xl font-semibold">
                  {current.title}
                </div>
              )}
              {current.subtitle && (
                <div className="text-zinc-200/85 mt-1">{current.subtitle}</div>
              )}
            </div>
          )}
        </div>
      </Wrapper>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={[
                'h-2.5 w-2.5 rounded-full border border-white/30 transition',
                i === idx ? 'bg-white/90' : 'bg-white/20 hover:bg-white/40',
              ].join(' ')}
              aria-label={`Ir para banner ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIdx((p) => (p - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/25 px-3 py-2 text-white hover:bg-black/40 transition"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIdx((p) => (p + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/25 px-3 py-2 text-white hover:bg-black/40 transition"
            aria-label="Próximo"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}
