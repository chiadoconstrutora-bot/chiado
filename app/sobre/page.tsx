'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function SobrePage() {
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<{ titulo: string; conteudo: string } | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('paginas')
        .select('titulo, conteudo')
        .eq('slug', 'sobre')
        .single()

      if (error) {
        // Se não existir linha ainda, o Supabase costuma retornar erro no .single()
        setPage(null)
        setError(error.message)
        setLoading(false)
        return
      }

      setPage(data)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-zinc-200">Carregando...</div>
  }

  return (
    <main className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <div className="text-sm tracking-widest text-zinc-400 uppercase">Chiado Construtora</div>
          <h1 className="mt-2 text-4xl md:text-5xl font-semibold">
            {page?.titulo || 'Sobre nós'}
          </h1>
          <p className="mt-3 text-zinc-400 max-w-3xl leading-relaxed">
            Conheça nossa história, valores e padrão de entrega.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 md:p-10">
          {!page ? (
            <div className="text-zinc-400">
              <p className="mb-3">
                Nenhum conteúdo cadastrado para <strong>/sobre</strong> ainda.
              </p>
              <p className="text-sm text-zinc-500">
                No Supabase, insira um registro na tabela <strong>paginas</strong> com{' '}
                <strong>slug</strong> = <strong>sobre</strong>.
              </p>

              {error && (
                <p className="mt-4 text-sm text-red-400">
                  Detalhe do erro: {error}
                </p>
              )}
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              {/* Mantém quebras de linha do texto do Supabase */}
              <div className="whitespace-pre-line leading-relaxed text-zinc-200">
                {page.conteudo}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
