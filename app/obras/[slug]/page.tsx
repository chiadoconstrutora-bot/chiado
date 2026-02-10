'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/src/lib/supabase'
import GraficoPizza from '@/src/components/GraficoPizza'

export default function ObraPage() {
  const params = useParams()
  const slug = params.slug as string

  const [obra, setObra] = useState<any>(null)
  const [etapas, setEtapas] = useState<any[]>([])
  const [fotos, setFotos] = useState<any[]>([])
  const [diferenciais, setDiferenciais] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data: obraData, error: obraErr } = await supabase
        .from('obras')
        .select('*')
        .eq('slug', slug)
        .single()

      if (obraErr || !obraData) {
        console.log('Erro obra:', obraErr)
        setLoading(false)
        return
      }

      setObra(obraData)

      const { data: etapasData, error: etapasErr } = await supabase
        .from('etapas')
        .select('*')
        .eq('obra_id', obraData.id)

      if (etapasErr) console.log('Erro etapas:', etapasErr)
      setEtapas(etapasData || [])

      const { data: fotosData, error: fotosErr } = await supabase
        .from('fotos')
        .select('*')
        .eq('obra_id', obraData.id)

      if (fotosErr) console.log('Erro fotos:', fotosErr)
      setFotos(fotosData || [])

      const { data: difData, error: difErr } = await supabase
        .from('diferenciais')
        .select('*')
        .eq('obra_id', obraData.id)

      if (difErr) console.log('Erro diferenciais:', difErr)
      setDiferenciais(difData || [])

      setLoading(false)
    }

    load()
  }, [slug])

  if (loading) return <div className="p-10 text-white">Carregando...</div>
  if (!obra) return <div className="p-10 text-red-500">Obra não encontrada.</div>

  // ✅ banner seguro
  const bannerUrl =
    obra?.concluida && obra?.banner_real ? obra.banner_real : obra?.banner

  const progressoGeral =
    etapas.length > 0
      ? Math.round(
          etapas.reduce((sum, e) => sum + (e.percentual || 0), 0) / etapas.length
        )
      : 0

  return (
    <main className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">

        {/* Banner */}
        {bannerUrl && (
          <div className="mb-10">
            <div className="relative w-full h-[320px] md:h-[420px] rounded-2xl overflow-hidden border border-zinc-900">
              <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <div className="text-zinc-300 text-sm tracking-wider mb-2">
                  {obra?.concluida ? 'OBRA CONCLUÍDA' : 'OBRA EM ANDAMENTO'}
                </div>
                <div className="text-3xl md:text-5xl font-semibold">
                  {obra.nome}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Título / descrição */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold">{obra.nome}</h1>
          <p className="text-zinc-400 mt-3 max-w-3xl leading-relaxed">
            {obra.descricao}
          </p>
        </div>

        {/* Progresso + gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-medium">Progresso geral</h2>
                <div className="text-zinc-300 font-semibold">{progressoGeral}%</div>
              </div>

              <div className="mt-4 w-full bg-zinc-800 h-3 rounded">
                <div
                  className="bg-green-500 h-3 rounded transition-all"
                  style={{ width: `${progressoGeral}%` }}
                />
              </div>

              <div className="mt-6">
                <div className="text-sm text-zinc-400 mb-3">Etapas</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {etapas.map((e: any) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
                    >
                      <span>{e.nome}</span>
                      <span className="text-zinc-300 font-medium">{e.percentual || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <GraficoPizza etapas={etapas} />
        </div>

        {/* Diferenciais */}
        <div className="mb-12">
          <h2 className="text-2xl font-medium mb-4">Diferenciais</h2>

          {diferenciais.length === 0 ? (
            <p className="text-zinc-500">Nenhum diferencial cadastrado ainda.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {diferenciais.map((d: any) => (
                <div
                  key={d.id}
                  className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-zinc-200">{d.titulo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fotos */}
        <div>
          <h2 className="text-2xl font-medium mb-4">Fotos atualizadas</h2>

          {fotos.length === 0 ? (
            <p className="text-zinc-500">Nenhuma foto cadastrada ainda.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {fotos.map((f: any) => (
                <img
                  key={f.id}
                  src={f.url}
                  alt=""
                  className="rounded-2xl border border-zinc-900 object-cover w-full h-64 bg-zinc-950"
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
