'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function GraficoPizza({ etapas }: { etapas: any[] }) {
  // Mostra a etapa com percentual e o restante (não concluído)
  const total = etapas.reduce((sum, e) => sum + (e.percentual || 0), 0)
  const restante = Math.max(0, 100 - Math.round(total / (etapas.length || 1)))

  const data = [
    ...etapas.map(e => ({ name: e.nome, value: e.percentual || 0 })),
    { name: 'Restante', value: restante }
  ]

  const COLORS = [
    '#22c55e', '#3b82f6', '#a855f7', '#f59e0b',
    '#ef4444', '#14b8a6', '#eab308', '#6366f1',
    '#27272a'
  ]

  return (
    <div className="w-full h-72 bg-zinc-950 border border-zinc-800 rounded-xl p-4">
      <div className="text-sm text-zinc-400 mb-2">Evolução por etapa</div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={110}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
