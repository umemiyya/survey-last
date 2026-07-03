'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { SATISFACTION_LEVELS, SATISFACTION_HEX } from '@/lib/satisfaction'

interface SatisfactionPieChartProps {
  distribusi: Record<string, number>
}

export function SatisfactionPieChart({ distribusi }: SatisfactionPieChartProps) {
  const data = SATISFACTION_LEVELS.map((level) => ({
    name: level,
    value: distribusi[level] ?? 0,
  }))

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center">
        <p className="text-sm text-slate-400">Belum ada data survey</p>
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={SATISFACTION_HEX[entry.name as keyof typeof SATISFACTION_HEX]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-5 mt-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SATISFACTION_HEX[entry.name as keyof typeof SATISFACTION_HEX] }} />
            <span className="text-xs text-slate-500">
              {entry.name} · {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}