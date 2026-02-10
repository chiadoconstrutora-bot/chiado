'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

type FooterSettings = {
  empresaNome?: string
  descricao?: string
  links?: { label: string; href: string }[]
  contato?: { telefone?: string; email?: string; cidade?: string }
  copyright?: string
}

const DEFAULTS: FooterSettings = {
  empresaNome: 'Chiado Construtora',
  descricao:
    'Construção e incorporação com padrão premium. Acompanhamento de obra e transparência em cada etapa.',
  links: [
    { label: 'A Construtora', href: '/sobre' },
    { label: 'Tabela (PDF)', href: '/tabela' },
    { label: 'Contato', href: '/contato' },
  ],
  contato: {
    telefone: '(coloque seu telefone)',
    email: '(coloque seu e-mail)',
    cidade: '(coloque sua cidade)',
  },
  copyright: '© {year} Chiado Construtora. Todos os direitos reservados.',
}

function safeParse(json: any): FooterSettings | null {
  if (!json) return null
  if (typeof json === 'object') return json as FooterSettings
  if (typeof json === 'string') {
    try {
      return JSON.parse(json) as FooterSettings
    } catch {
      return null
    }
  }
  return null
}

export default function Footer() {
  const [cfg, setCfg] = useState<FooterSettings>(DEFAULTS)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('paginas')
        .select('*')
        .eq('slug', 'footer')
        .single()

      if (error) {
        // sem registro ainda → usa default
        return
      }

      const parsed = safeParse(data?.conteudo)
      if (parsed) setCfg({ ...DEFAULTS, ...parsed })
    }

    load()
  }, [])

  const year = new Date().getFullYear()
  const copyright =
    (cfg.copyright || DEFAULTS.copyright || '').replace('{year}', String(year))

  return (
    <footer className="border-t border-zinc-900 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="text-white font-semibold text-lg">{cfg.empresaNome}</div>
          <p className="text-zinc-400 mt-3 text-sm leading-relaxed">{cfg.descricao}</p>
        </div>

        <div>
          <div className="text-white font-semibold mb-3">Links</div>
          <div className="flex flex-col gap-2 text-sm text-zinc-300">
            {(cfg.links || DEFAULTS.links || []).map((l, idx) => (
              <a key={idx} className="hover:text-white" href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-white font-semibold mb-3">Contato</div>
          <div className="text-sm text-zinc-300 space-y-2">
            <div>📞 {cfg.contato?.telefone}</div>
            <div>✉️ {cfg.contato?.email}</div>
            <div>📍 {cfg.contato?.cidade}</div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-zinc-500 py-6">{copyright}</div>
    </footer>
  )
}
