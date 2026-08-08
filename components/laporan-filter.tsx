'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Calendar } from 'lucide-react'

interface LaporanFilterProps {
  months: string[]
  monthsId: Record<string, string>
  tahunOptions: number[]
  currentYear: number
}

export function LaporanFilter({ months, monthsId, tahunOptions, currentYear }: LaporanFilterProps) {
  const router = useRouter()
  const [jenis, setJenis]   = useState<'bulanan' | 'tahunan'>('bulanan')
  const [bulan, setBulan]   = useState(months[new Date().getMonth()])
  const [tahun, setTahun]   = useState(currentYear)

  const handleBuat = () => {
    if (jenis === 'bulanan') {
      router.push(`/admin/laporan/view?jenis=bulanan&bulan=${bulan}&tahun=${tahun}`)
    } else {
      router.push(`/admin/laporan/view?jenis=tahunan&tahun=${tahun}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Pilih jenis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setJenis('bulanan')}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${
            jenis === 'bulanan'
              ? 'border-blue-600 bg-blue-50'
              : 'border-slate-100 bg-white hover:border-slate-200'
          }`}
        >
          <Calendar className={`w-6 h-6 mb-3 ${jenis === 'bulanan' ? 'text-blue-600' : 'text-slate-400'}`} />
          <p className={`font-semibold mb-1 ${jenis === 'bulanan' ? 'text-blue-700' : 'text-slate-900'}`}>
            Laporan Bulanan
          </p>
          <p className="text-sm text-slate-400">
            Data survey dalam satu bulan tertentu, lengkap dengan statistik dan daftar responden.
          </p>
        </button>

        <button
          onClick={() => setJenis('tahunan')}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${
            jenis === 'tahunan'
              ? 'border-blue-600 bg-blue-50'
              : 'border-slate-100 bg-white hover:border-slate-200'
          }`}
        >
          <FileText className={`w-6 h-6 mb-3 ${jenis === 'tahunan' ? 'text-blue-600' : 'text-slate-400'}`} />
          <p className={`font-semibold mb-1 ${jenis === 'tahunan' ? 'text-blue-700' : 'text-slate-900'}`}>
            Laporan Tahunan
          </p>
          <p className="text-sm text-slate-400">
            Rekap data survey sepanjang tahun, termasuk tren per bulan dan rata-rata keseluruhan.
          </p>
        </button>
      </div>

      {/* Parameter */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-medium text-slate-700">Parameter laporan</p>

        <div className="flex flex-col sm:flex-row gap-4">
          {jenis === 'bulanan' && (
            <div className="flex-1 space-y-1.5">
              <label className="text-xs text-slate-400 block">Bulan</label>
              <select
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {months.map((m) => (
                  <option key={m} value={m}>{monthsId[m]}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-slate-400 block">Tahun</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {tahunOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleBuat}
          className="w-full py-3 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Buat laporan
        </button>
      </div>
    </div>
  )
}