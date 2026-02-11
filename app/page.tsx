'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import HomeCarousel, { type HomeBanner } from '@/src/components/HomeCarousel'

type HomeConfig = {
  heroTag?: string
  heroTitle?: string
  heroSubtitle?: string
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
  banners?: HomeBanner[]
}

const DEFAULT_HOME: HomeConfig = {
  heroTag: 'CHIADO CONSTRUTORA',
  heroTitle: 'Construção premium',
  heroSubtitle: 'com padrão e confiança',
  ctaPrimaryLabel: '',
  ctaPrimaryHref: '/obras',
  ctaSecondaryLabel: 'Fale conosco',
  ctaSecondaryHref: '/contato',
  banners: [
    { imageUrl: '/brand/logo-empresa.png', title: 'Chiado Construtora', subtitle: 'Seu banner 1' },
    { imageUrl: '/brand/logo-empresa.png', title: 'Projeto & Qualidade', subtitle: 'Seu banner 2' },
    { imageUrl: '/brand/logo-empresa.png', title: 'Transparência', subtitle: 'Seu banner 3' },
  ],
}

function safeParse(json: any): HomeConfig | null {
  if (!json) return null
  if (typeof json === 'object') return json as HomeConfig
  if (typeof json === 'string') {
    try {
      return JSON.parse(json) as HomeConfig
    } catch {
      return null
    }
  }
  return null
}

export default function Home() {
  const [obras, setObras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cfg, setCfg] = useState<HomeConfig>(DEFAULT_HOME)

  useEffect(() => {
    async function loadHomeCfg() {
      const { data } = await supabase.from('paginas').select('*').eq('slug', 'home').single()
      const parsed = safeParse(data?.conteudo)
      if (parsed) setCfg({ ...DEFAULT_HOME, ...parsed })
    }
    loadHomeCfg()
  }, [])

  useEffect(() => {
    async function loadObras() {
      setLoading(true)

      const { data, error } = await supabase
        .from('obras')
        .select('id,nome,slug,descricao,banner,banner_real,concluida')
        .order('created_at', { ascending: false })

      if (error) {
        console.log(error)
        setObras([])
        setLoading(false)
        return
      }

      setObras(data || [])
      setLoading(false)
    }

    loadObras()
  }, [])

  const banners = useMemo(() => cfg.banners || [], [cfg.banners])

  return (
    <main className="min-h-screen text-white bg-zinc-900/20">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        {/* Carrossel de banners */}
        <HomeCarousel items={banners} intervalMs={5000} />

        {/* HERO */}
        <section className="mt-8 relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 p-10 md:p-14">
          <div className="absolute inset-0 opacity-60 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="relative">
            <div className="text-zinc-300/80 tracking-wider text-sm mb-3">
              {cfg.heroTag}
            </div>

            <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
              {cfg.heroTitle}{' '}
              <span className="text-zinc-200/80">{cfg.heroSubtitle}</span>
            </h1>

            <p className="text-zinc-200/70 mt-5 max-w-2xl leading-relaxed">
              Acompanhe o andamento das obras, diferenciais e evolução por etapas.
              Transparência e qualidade em cada detalhe.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
  {(cfg.ctaPrimaryLabel?.trim() && cfg.ctaPrimaryHref?.trim()) && (
    <Link
      href={cfg.ctaPrimaryHref}
      className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
    >
      {cfg.ctaPrimaryLabel}
    </Link>
  )}

  {(cfg.ctaSecondaryLabel?.trim() && cfg.ctaSecondaryHref?.trim()) && (
    <Link
      href={cfg.ctaSecondaryHref}
      className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition"
    >
      {cfg.ctaSecondaryLabel}
    </Link>
  )}
</div>
          </div>
        </section>

        {/* OBRAS */}
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold">Obras</h2>
              <p className="text-zinc-200/70 mt-2">
                Acompanhe cada empreendimento em tempo real.
              </p>
            </div>

            <Link href="/obras" className="text-zinc-200/80 hover:text-white transition">
              Ver todas →
            </Link>
          </div>

          {loading ? (
            <p className="text-zinc-200/60">Carregando...</p>
          ) : obras.length === 0 ? (
            <p className="text-zinc-200/60">Nenhuma obra cadastrada ainda.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {obras.map((o) => {
                const bannerUrl = o.concluida && o.banner_real ? o.banner_real : o.banner

                return (
                  <Link
                    key={o.id}
                    href={`/obras/${o.slug}`}
                    className="group rounded-2xl border border-white/10 bg-zinc-900/40 overflow-hidden hover:border-white/20 transition"
                  >
                    <div className="relative h-56 bg-white/5">
                      {bannerUrl ? (
                        <>
                          <img
                            src={bannerUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-200/60">
                          Sem banner
                        </div>
                      )}

                      <div className="absolute top-4 left-4">
                        <span className="text-xs tracking-wider px-3 py-1 rounded-full bg-black/35 border border-white/10">
                          {o.concluida ? 'CONCLUÍDA' : 'EM ANDAMENTO'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="text-xl font-semibold">{o.nome}</div>
                      <div className="text-zinc-200/70 mt-2 line-clamp-2">{o.descricao}</div>

                      <div className="mt-4 text-zinc-200/80 group-hover:text-white transition">
                        Ver detalhes →
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
