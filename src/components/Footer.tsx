export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="text-white font-semibold text-lg">Chiado Construtora</div>
          <p className="text-zinc-400 mt-3 text-sm leading-relaxed">
            Construção e incorporação com padrão premium. Acompanhamento de obra e transparência em cada etapa.
          </p>
        </div>

        <div>
          <div className="text-white font-semibold mb-3">Links</div>
          <div className="flex flex-col gap-2 text-sm text-zinc-300">
            <a className="hover:text-white" href="/sobre">A Construtora</a>
            <a className="hover:text-white" href="/tabela">Tabela (PDF)</a>
            <a className="hover:text-white" href="/contato">Contato</a>
          </div>
        </div>

        <div>
          <div className="text-white font-semibold mb-3">Contato</div>
          <div className="text-sm text-zinc-300 space-y-2">
            <div>📞 (coloque seu telefone)</div>
            <div>✉️ (coloque seu e-mail)</div>
            <div>📍 (coloque sua cidade)</div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-zinc-500 py-6">
        © {new Date().getFullYear()} Chiado Construtora. Todos os direitos reservados.
      </div>
    </footer>
  )
}
