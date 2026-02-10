export default function TabelaPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="text-3xl font-semibold mb-3">Tabela</h1>
        <p className="text-zinc-400 mb-8">
          Faça o download da tabela em PDF.
        </p>

        <a
          href="/arquivos/tabela.pdf"
          download
          className="inline-flex items-center justify-center bg-white text-black px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
        >
          Baixar PDF
        </a>

        <div className="mt-6 text-sm text-zinc-500">
          Caso queira trocar o arquivo, basta substituir o PDF em <strong>public/arquivos/tabela.pdf</strong>.
        </div>
      </div>
    </main>
  )
}
