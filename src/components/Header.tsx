'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/src/lib/supabase'

type Obra = {
  id: string
  nome: string
  slug: string
}

export default function Header() {
  const [obras, setObras] = useState<Obra[]>([])
  const [openObrasDesktop, setOpenObrasDesktop] = useState(false)
  const [openObrasMobile, setOpenObrasMobile] = useState(false)
  const [openMobile, setOpenMobile] = useState(false)

  const pathname = usePathname()
  const obrasDesktopRef = useRef<HTMLDivElement | null>(null)

  async function loadObras() {
    const { data, error } = await supabase
      .from('obras')
      .select('id, nome, slug')
      .order('nome', { ascending: true })

    if (error) {
      console.log('Erro ao carregar obras:', error.message)
      return
    }

    setObras((data as Obra[]) || [])
  }

  // Fecha dropdown desktop clicando fora + ESC
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!obrasDesktopRef.current) return
      if (!obrasDesktopRef.current.contains(e.target as Node)) setOpenObrasDesktop(false)
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenObrasDesktop(false)
        setOpenObrasMobile(false)
        setOpenMobile(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    loadObras()
  }, [])

  // Fecha menus ao navegar
  useEffect(() => {
    setOpenObrasDesktop(false)
    setOpenObrasMobile(false)
    setOpenMobile(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo (maior) */}
          <Link href="/" className="flex items-center">
  <div className="relative h-14 sm:h-16 md:h-20 w-[260px] sm:w-[320px] md:w-[380px]">
    <Image
      src="/brand/logo-empresa.png"
      alt="Chiado Construtora"
      fill
      className="object-contain"
      priority
    />
  </div>
</Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-zinc-200 hover:text-white transition">
              Home
            </Link>

            {/* Obras dropdown */}
            <div className="relative" ref={obrasDesktopRef}>
              <button
                type="button"
                onClick={() => setOpenObrasDesktop((v) => !v)}
                className="inline-flex items-center gap-2 text-zinc-200 hover:text-white transition"
              >
                Obras <span className="text-zinc-500">▾</span>
              </button>

              {openObrasDesktop && (
                <div className="absolute left-0 mt-3 w-72 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-xl">
                  <div className="px-3 py-2 text-xs text-zinc-400 border-b border-white/10">
                    Empreendimentos
                  </div>

                  <div className="max-h-80 overflow-auto">
                    {obras.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-zinc-500">
                        Nenhuma obra cadastrada.
                      </div>
                    ) : (
                      obras.map((o) => (
                        <Link
                          key={o.id}
                          href={`/obras/${o.slug}`}
                          className="block px-4 py-3 text-sm text-zinc-200 hover:bg-white/5 transition"
                          onClick={() => setOpenObrasDesktop(false)}
                        >
                          {o.nome}
                        </Link>
                      ))
                    )}
                  </div>

                  <div className="border-t border-white/10 p-2">
                    <Link
                      href="/obras"
                      className="block rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-white/5 transition"
                      onClick={() => setOpenObrasDesktop(false)}
                    >
                      Ver todas →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/sobre" className="text-zinc-200 hover:text-white transition">
              Sobre nós
            </Link>

            <Link href="/tabela" className="text-zinc-200 hover:text-white transition">
              Tabela
            </Link>

            <Link href="/contato" className="text-zinc-200 hover:text-white transition">
              Contato
            </Link>

            {/* REMOVIDO: Admin (você acessa direto /admin) */}
            {/* REMOVIDO: botão Ver obras (já tem menu Obras) */}
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 hover:bg-white/10 transition"
            onClick={() => setOpenMobile((v) => !v)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
        </div>

        {/* Mobile menu */}
        {openMobile && (
          <div className="md:hidden pb-4">
            <div className="mt-2 rounded-xl border border-white/10 bg-zinc-950 overflow-hidden">
              <div className="p-3 border-b border-white/10 text-xs text-zinc-400">Menu</div>

              <div className="p-2">
                <Link
                  href="/"
                  className="block rounded-lg px-3 py-2 text-zinc-200 hover:bg-white/5 transition"
                  onClick={() => setOpenMobile(false)}
                >
                  Home
                </Link>

                <button
                  type="button"
                  onClick={() => setOpenObrasMobile((v) => !v)}
                  className="w-full text-left rounded-lg px-3 py-2 text-zinc-200 hover:bg-white/5 transition"
                >
                  Obras <span className="text-zinc-500">▾</span>
                </button>

                {openObrasMobile && (
                  <div className="mt-2 rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                    {obras.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-zinc-500">
                        Nenhuma obra cadastrada.
                      </div>
                    ) : (
                      obras.map((o) => (
                        <Link
                          key={o.id}
                          href={`/obras/${o.slug}`}
                          className="block px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 transition"
                          onClick={() => {
                            setOpenMobile(false)
                            setOpenObrasMobile(false)
                          }}
                        >
                          {o.nome}
                        </Link>
                      ))
                    )}

                    <Link
                      href="/obras"
                      className="block px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 transition border-t border-white/10"
                      onClick={() => {
                        setOpenMobile(false)
                        setOpenObrasMobile(false)
                      }}
                    >
                      Ver todas →
                    </Link>
                  </div>
                )}

                <Link
                  href="/sobre"
                  className="block rounded-lg px-3 py-2 text-zinc-200 hover:bg-white/5 transition mt-2"
                  onClick={() => setOpenMobile(false)}
                >
                  Sobre nós
                </Link>

                <Link
                  href="/tabela"
                  className="block rounded-lg px-3 py-2 text-zinc-200 hover:bg-white/5 transition"
                  onClick={() => setOpenMobile(false)}
                >
                  Tabela
                </Link>

                <Link
                  href="/contato"
                  className="block rounded-lg px-3 py-2 text-zinc-200 hover:bg-white/5 transition"
                  onClick={() => setOpenMobile(false)}
                >
                  Contato
                </Link>

                {/* REMOVIDO: Admin */}
                {/* REMOVIDO: Ver obras */}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
