'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SATISFACTION_LEVELS, SATISFACTION_HEX } from '@/lib/satisfaction'

interface MonthlyDataPoint {
  name: string
  [key: string]: string | number
}

export function MonthlyBarChart({ data }: { data: MonthlyDataPoint[] }) {
  const hasData = data.some((d) => SATISFACTION_LEVELS.some((level) => (d[level] as number) > 0))

  if (!hasData) {
    return (
      <div className="h-[280px] flex items-center justify-center">
        <p className="text-sm text-slate-400">Belum ada data survey tahun ini</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap={12}>
        <CartesianGrid vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 13 }} cursor={{ fill: '#f8fafc' }} />
        {SATISFACTION_LEVELS.map((level, i) => (
          <Bar
            key={level}
            dataKey={level}
            stackId="a"
            fill={SATISFACTION_HEX[level]}
            radius={i === SATISFACTION_LEVELS.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}