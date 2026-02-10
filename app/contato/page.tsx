'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

type ContatoConfig = {
  titulo?: string
  subtitulo?: string
  telefone?: string
  whatsappLink?: string
  email?: string
  cidade?: string
  endereco?: string
  mapaLink?: string
}

const DEFAULTS: ContatoConfig = {
  titulo: 'Contato',
  subtitulo: 'Fale com a Chiado Construtora e tire suas dúvidas.',
  telefone: '(coloque seu telefone)',
  whatsappLink: '',
  email: '(coloque seu e-mail)',
  cidade: '(coloque sua cidade)',
  endereco: '',
  mapaLink: '',
}

function safeParse(json: any): ContatoConfig | null {
  if (!json) return null
  if (typeof json === 'object') return json as ContatoConfig
  if (typeof json === 'string') {
    try {
      return JSON.parse(json) as ContatoConfig
    } catch {
      return null
    }
  }
  return null
}

export default function ContatoPage() {
  const [cfg, setCfg] = useState<ContatoConfig>(DEFAULTS)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('paginas').select('*').eq('slug', 'contato').single()
      const parsed = safeParse(data?.conteudo)
      if (parsed) setCfg({ ...DEFAULTS, ...parsed })
    }
    load()
  }, [])

  return (
    <main className="min-h-screen text-white bg-zinc-900/20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <section className="rounded-3xl border border-white/10 bg-zinc-900/40 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-semibold">{cfg.titulo}</h1>
          <p className="text-zinc-200/70 mt-3 max-w-2xl">{cfg.subtitulo}</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <div className="text-lg font-semibold">Fale com a gente</div>

              <div className="mt-4 space-y-2 text-zinc-200/80">
                <div>📞 {cfg.telefone}</div>
                <div>✉️ {cfg.email}</div>
                <div>📍 {cfg.cidade}</div>
                {cfg.endereco && <div>🏢 {cfg.endereco}</div>}
              </div>

              {cfg.whatsappLink && (
                <a
                  href={cfg.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 font-medium chiado-btn"
                >
                  Chamar no WhatsApp
                </a>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <div className="text-lg font-semibold">Localização</div>
              <p className="text-zinc-200/70 mt-2">
                Se quiser, adicione um link do Google Maps no Admin.
              </p>

              {cfg.mapaLink ? (
                <a
                  href={cfg.mapaLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center justify-center rounded-xl px-5 py-3 border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  Abrir mapa
                </a>
              ) : (
                <div className="mt-5 text-zinc-200/60 text-sm">
                  (mapa ainda não configurado)
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
