'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function Admin() {
  const [obras, setObras] = useState<any[]>([])
  const [selected, setSelected] = useState<string>('')

  const [file, setFile] = useState<File | null>(null)
  const [etapas, setEtapas] = useState<any[]>([])
  const [fotos, setFotos] = useState<any[]>([])
  const [deletingPhotoId, setDeletingPhotoId] = useState<string>('')

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Diferenciais
  const [diferenciais, setDiferenciais] = useState<any[]>([])
  const [novoDiferencial, setNovoDiferencial] = useState('')
  const [savingDif, setSavingDif] = useState(false)

  // Banner
  const [banner3dFile, setBanner3dFile] = useState<File | null>(null)
  const [bannerRealFile, setBannerRealFile] = useState<File | null>(null)
  const [savingBanner, setSavingBanner] = useState(false)
  const [concluida, setConcluida] = useState(false)

  // Páginas do site (ex: /sobre)
  const [paginas, setPaginas] = useState<any[]>([])
  const [selectedPaginaSlug, setSelectedPaginaSlug] = useState<string>('sobre')
  const [paginaTitulo, setPaginaTitulo] = useState<string>('')
  const [paginaConteudo, setPaginaConteudo] = useState<string>('')
  const [savingPagina, setSavingPagina] = useState(false)

  const obraSelecionada = useMemo(
    () => obras.find((o) => o.id === selected),
    [obras, selected]
  )

  async function loadObras() {
    const { data, error } = await supabase.from('obras').select('*')
    if (error) {
      alert(error.message)
      return
    }
    setObras(data || [])
  }

  async function loadEtapas(obraId: string) {
    const { data, error } = await supabase
      .from('etapas')
      .select('*')
      .eq('obra_id', obraId)

    if (error) {
      alert(error.message)
      return
    }
    setEtapas(data || [])
  }

  async function loadFotos(obraId: string) {
    const { data, error } = await supabase
      .from('fotos')
      .select('*')
      .eq('obra_id', obraId)
      .order('id', { ascending: false }) // ou simplesmente REMOVA o order

    if (error) {
      alert(error.message)
      return
    }

    setFotos(data || [])
  }

  async function loadDiferenciais(obraId: string) {
    const { data, error } = await supabase
      .from('diferenciais')
      .select('*')
      .eq('obra_id', obraId)

    if (error) {
      alert(error.message)
      return
    }

    setDiferenciais(data || [])
  }

  async function addDiferencial() {
    if (!selected) {
      alert('Selecione uma obra')
      return
    }
    if (!novoDiferencial.trim()) return

    setSavingDif(true)

    const { error } = await supabase.from('diferenciais').insert({
      obra_id: selected,
      titulo: novoDiferencial.trim(),
    })

    setSavingDif(false)

    if (error) {
      alert(error.message)
      return
    }

    setNovoDiferencial('')
    loadDiferenciais(selected)
  }

  async function removeDiferencial(id: string) {
    if (!selected) return

    const { error } = await supabase.from('diferenciais').delete().eq('id', id)
    if (error) {
      alert(error.message)
      return
    }

    loadDiferenciais(selected)
  }

  async function uploadFoto() {
    if (!file || !selected) {
      alert('Selecione uma obra e uma imagem')
      return
    }

    setUploading(true)

    const path = `${selected}/${Date.now()}-${file.name}`

    const { error: upErr } = await supabase.storage.from('obras').upload(path, file)
    if (upErr) {
      setUploading(false)
      alert(upErr.message)
      return
    }

    const { data: pub } = supabase.storage.from('obras').getPublicUrl(path)

    const { error: insErr } = await supabase.from('fotos').insert({
      obra_id: selected,
      url: pub.publicUrl,
      path: path, // pode manter — mesmo deletando só banco, isso ajuda para futuro
    })

    setUploading(false)

    if (insErr) {
      alert(insErr.message)
      return
    }

    alert('Foto enviada com sucesso!')
    setFile(null)
    loadFotos(selected)
  }

  // ✅ DELETAR SOMENTE DO BANCO
  async function deleteFoto(foto: any) {
    if (!selected) return

    const ok = confirm('Excluir esta foto? Essa ação não pode ser desfeita.')
    if (!ok) return

    setDeletingPhotoId(foto.id)

    const { error: dbErr } = await supabase.from('fotos').delete().eq('id', foto.id)

    setDeletingPhotoId('')

    if (dbErr) {
      alert('Erro ao apagar do banco: ' + dbErr.message)
      return
    }

    loadFotos(selected)
  }

  function atualizarPercentual(etapaId: string, valor: number) {
    const v = Number.isFinite(valor) ? Math.max(0, Math.min(100, valor)) : 0
    setEtapas((prev) =>
      prev.map((e) => (e.id === etapaId ? { ...e, percentual: v } : e))
    )
  }

  async function salvarEtapas() {
    if (!selected) {
      alert('Selecione uma obra')
      return
    }

    setSaving(true)

    for (const e of etapas) {
      const { error } = await supabase
        .from('etapas')
        .update({ percentual: e.percentual ?? 0 })
        .eq('id', e.id)

      if (error) {
        setSaving(false)
        alert(error.message)
        return
      }
    }

    setSaving(false)
    alert('Etapas salvas!')
  }

  async function salvarConcluida() {
    if (!selected) return
    const { error } = await supabase.from('obras').update({ concluida }).eq('id', selected)
    if (error) {
      alert(error.message)
      return
    }
    alert('Status atualizado!')
    loadObras()
  }

  async function uploadBanner(tipo: '3d' | 'real') {
    if (!selected) {
      alert('Selecione uma obra')
      return
    }

    const fileToSend = tipo === '3d' ? banner3dFile : bannerRealFile
    if (!fileToSend) {
      alert('Selecione um arquivo')
      return
    }

    setSavingBanner(true)

    const path = `${selected}/${tipo}-${Date.now()}-${fileToSend.name}`

    const { error: upErr } = await supabase.storage.from('banners').upload(path, fileToSend)
    if (upErr) {
      setSavingBanner(false)
      alert(upErr.message)
      return
    }

    const { data: pub } = supabase.storage.from('banners').getPublicUrl(path)

    const payload = tipo === '3d' ? { banner: pub.publicUrl } : { banner_real: pub.publicUrl }

    const { error: dbErr } = await supabase.from('obras').update(payload).eq('id', selected)

    setSavingBanner(false)

    if (dbErr) {
      alert(dbErr.message)
      return
    }

    alert('Banner atualizado!')
    setBanner3dFile(null)
    setBannerRealFile(null)
    loadObras()
  }

  async function loadPaginas() {
    const { data, error } = await supabase.from('paginas').select('*').order('slug', { ascending: true })
    if (error) {
      alert(error.message)
      return
    }
    setPaginas(data || [])
  }

  async function loadPaginaBySlug(slug: string) {
    const { data, error } = await supabase
      .from('paginas')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      alert(error.message)
      return
    }

    setPaginaTitulo(data?.titulo || '')
    setPaginaConteudo(data?.conteudo || '')
  }

  async function salvarPagina() {
    if (!selectedPaginaSlug) return

    setSavingPagina(true)

    const { error } = await supabase
      .from('paginas')
      .update({
        titulo: paginaTitulo,
        conteudo: paginaConteudo,
      })
      .eq('slug', selectedPaginaSlug)

    setSavingPagina(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Página salva!')
    loadPaginas()
  }

  useEffect(() => {
    loadObras()
    loadPaginas()
  }, [])

  useEffect(() => {
    if (selected) {
      loadEtapas(selected)
      loadDiferenciais(selected)
      loadFotos(selected)

      const o = obras.find((x) => x.id === selected)
      setConcluida(Boolean(o?.concluida))
    } else {
      setEtapas([])
      setDiferenciais([])
      setFotos([])
      setConcluida(false)
    }
  }, [selected, obras])

  useEffect(() => {
    if (selectedPaginaSlug) {
      loadPaginaBySlug(selectedPaginaSlug)
    }
  }, [selectedPaginaSlug])

  const progressoGeral =
    etapas.length > 0
      ? Math.round(etapas.reduce((sum, e) => sum + (e.percentual || 0), 0) / etapas.length)
      : 0

  return (
    <main className="bg-black min-h-screen text-white p-10">
      <h1 className="text-3xl mb-6">Administração de Obras</h1>

      {/* Seleção da obra */}
      <div className="mb-8">
        <label className="block text-zinc-400 mb-2">Selecionar obra</label>
        <select
          className="bg-zinc-900 p-3 rounded border border-zinc-800 w-full max-w-xl"
          onChange={(e) => setSelected(e.target.value)}
          value={selected}
        >
          <option value="">Selecione a obra</option>
          {obras.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Banner / Status */}
      <div className="mb-10 p-6 bg-zinc-950 border border-zinc-800 rounded-xl max-w-3xl">
        <div className="text-xl mb-4">🖼️ Banner da obra</div>

        {!selected ? (
          <p className="text-zinc-500">Selecione uma obra para configurar banners.</p>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                checked={concluida}
                onChange={(e) => setConcluida(e.target.checked)}
              />
              <span className="text-zinc-300">Obra concluída</span>

              <button onClick={salvarConcluida} className="ml-3 bg-blue-600 px-4 py-2 rounded">
                Salvar status
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Banner 3D */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-zinc-300 font-medium mb-3">Banner principal (Render 3D)</div>

                {obraSelecionada?.banner && (
                  <img
                    src={obraSelecionada.banner}
                    className="w-full h-40 object-cover rounded-lg border border-zinc-800 mb-3"
                    alt=""
                  />
                )}

                <label className="inline-flex items-center gap-3 bg-zinc-800 px-5 py-2 rounded cursor-pointer hover:bg-zinc-700 transition">
                  Escolher arquivo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setBanner3dFile(e.target.files?.[0] || null)}
                  />
                </label>

                {banner3dFile && <p className="text-xs text-zinc-400 mt-2">{banner3dFile.name}</p>}

                <div className="mt-3">
                  <button
                    onClick={() => uploadBanner('3d')}
                    disabled={savingBanner}
                    className="bg-green-600 px-5 py-2 rounded disabled:opacity-60"
                  >
                    {savingBanner ? 'Salvando...' : 'Salvar banner 3D'}
                  </button>
                </div>
              </div>

              {/* Banner real */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-zinc-300 font-medium mb-3">Banner (Foto real – quando concluída)</div>

                {obraSelecionada?.banner_real && (
                  <img
                    src={obraSelecionada.banner_real}
                    className="w-full h-40 object-cover rounded-lg border border-zinc-800 mb-3"
                    alt=""
                  />
                )}

                <label className="inline-flex items-center gap-3 bg-zinc-800 px-5 py-2 rounded cursor-pointer hover:bg-zinc-700 transition">
                  Escolher arquivo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setBannerRealFile(e.target.files?.[0] || null)}
                  />
                </label>

                {bannerRealFile && <p className="text-xs text-zinc-400 mt-2">{bannerRealFile.name}</p>}

                <div className="mt-3">
                  <button
                    onClick={() => uploadBanner('real')}
                    disabled={savingBanner}
                    className="bg-green-600 px-5 py-2 rounded disabled:opacity-60"
                  >
                    {savingBanner ? 'Salvando...' : 'Salvar foto real'}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mt-4">
              Quando “Obra concluída” estiver marcado, o site usa a Foto Real. Caso contrário, usa o Render 3D.
            </p>
          </>
        )}
      </div>

      {/* Upload fotos */}
      <div className="mb-6 p-6 bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl">
        <div className="text-xl mb-4">📸 Upload de fotos</div>

        <label className="inline-flex items-center gap-3 bg-zinc-800 px-5 py-2 rounded cursor-pointer hover:bg-zinc-700 transition">
          Escolher arquivo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        {file && <p className="text-sm text-zinc-400 mt-2">{file.name}</p>}

        <div className="mt-4">
          <button
            onClick={uploadFoto}
            disabled={uploading}
            className="bg-green-600 px-6 py-2 rounded disabled:opacity-60"
          >
            {uploading ? 'Enviando...' : 'Enviar FOTO'}
          </button>
        </div>
      </div>

      {/* Fotos cadastradas */}
      <div className="mb-10 p-6 bg-zinc-950 border border-zinc-800 rounded-xl max-w-5xl">
        <div className="text-xl mb-4">🗂️ Fotos cadastradas desta obra</div>

        {!selected ? (
          <p className="text-zinc-500">Selecione uma obra para ver as fotos.</p>
        ) : fotos.length === 0 ? (
          <p className="text-zinc-500">Nenhuma foto cadastrada ainda.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {fotos.map((f) => (
              <div
                key={f.id}
                className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900"
              >
                <img src={f.url} className="w-full h-40 object-cover" alt="" />

                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="text-xs text-zinc-400 truncate">{f.path || 'foto'}</div>

                  <button
                    onClick={() => deleteFoto(f)}
                    disabled={deletingPhotoId === f.id}
                    className="text-red-400 hover:text-red-300 text-sm disabled:opacity-60"
                    title="Excluir"
                  >
                    {deletingPhotoId === f.id ? '...' : 'Excluir'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Páginas do site */}
      <div className="mt-10 p-6 bg-zinc-950 border border-zinc-800 rounded-xl max-w-3xl">
        <div className="text-xl mb-4">📝 Páginas do site</div>

        {paginas.length === 0 ? (
          <p className="text-zinc-500">Nenhuma página cadastrada.</p>
        ) : (
          <>
            <label className="block text-zinc-400 mb-2">Selecionar página</label>
            <select
              className="bg-zinc-900 p-3 rounded border border-zinc-800 w-full"
              value={selectedPaginaSlug}
              onChange={(e) => setSelectedPaginaSlug(e.target.value)}
            >
              {paginas.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.slug}
                </option>
              ))}
            </select>

            <div className="mt-4">
              <label className="block text-zinc-400 mb-2">Título</label>
              <input
                value={paginaTitulo}
                onChange={(e) => setPaginaTitulo(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2"
                placeholder="Ex: Sobre nós"
              />
            </div>

            <div className="mt-4">
              <label className="block text-zinc-400 mb-2">Conteúdo</label>
              <textarea
                value={paginaConteudo}
                onChange={(e) => setPaginaConteudo(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 min-h-[160px]"
                placeholder="Escreva o texto da página..."
              />
              <p className="text-xs text-zinc-500 mt-2">
                Dica: você pode usar quebras de linha normalmente.
              </p>
            </div>

            <button
              onClick={salvarPagina}
              disabled={savingPagina}
              className="mt-4 bg-blue-600 px-6 py-2 rounded disabled:opacity-60"
            >
              {savingPagina ? 'Salvando...' : 'Salvar página'}
            </button>
          </>
        )}
      </div>

      {/* Etapas */}
      <div className="mt-10 p-6 bg-zinc-950 border border-zinc-800 rounded-xl max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xl">📊 Etapas da obra</div>
            <div className="text-sm text-zinc-400 mt-1">
              Progresso geral estimado: <strong>{progressoGeral}%</strong>
            </div>
          </div>

          <button
            onClick={salvarEtapas}
            disabled={saving || !selected}
            className="bg-blue-600 px-6 py-2 rounded disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar etapas'}
          </button>
        </div>

        {!selected ? (
          <p className="text-zinc-500 mt-4">Selecione uma obra para editar as etapas.</p>
        ) : etapas.length === 0 ? (
          <p className="text-zinc-500 mt-4">Nenhuma etapa encontrada para esta obra.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {etapas.map((e) => (
              <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{e.nome}</div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={e.percentual ?? 0}
                      onChange={(ev) => atualizarPercentual(e.id, Number(ev.target.value))}
                      className="w-20 bg-black border border-zinc-700 rounded px-2 py-1 text-right"
                    />
                    <span className="text-zinc-400">%</span>
                  </div>
                </div>

                <div className="mt-3 w-full bg-zinc-800 h-2 rounded">
                  <div
                    className="bg-green-500 h-2 rounded"
                    style={{ width: `${Math.max(0, Math.min(100, e.percentual ?? 0))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diferenciais */}
      <div className="mt-10 p-6 bg-zinc-950 border border-zinc-800 rounded-xl max-w-3xl">
        <div className="text-xl mb-4">✨ Diferenciais da obra</div>

        {!selected ? (
          <p className="text-zinc-500">Selecione uma obra para gerenciar os diferenciais.</p>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <input
                value={novoDiferencial}
                onChange={(e) => setNovoDiferencial(e.target.value)}
                placeholder="Ex: Fechadura eletrônica em todas as unidades"
                className="flex-1 bg-black border border-zinc-800 rounded px-3 py-2"
              />
              <button
                onClick={addDiferencial}
                disabled={savingDif}
                className="bg-blue-600 px-5 py-2 rounded disabled:opacity-60"
              >
                {savingDif ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>

            {diferenciais.length === 0 ? (
              <p className="text-zinc-500">Nenhum diferencial cadastrado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {diferenciais.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-zinc-200">{d.titulo}</span>
                    </div>

                    <button
                      onClick={() => removeDiferencial(d.id)}
                      className="text-red-400 hover:text-red-300"
                      title="Remover"
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
