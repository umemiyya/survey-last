'use client'

import { Fragment, useMemo, useState } from 'react'
import { SATISFACTION_HEX } from '@/lib/satisfaction'

export type DatasetRow = {
  id: number
  kualitasPengharum: number
  pelayananService: number
  pelayananComplain: number
  kualitasAroma: number
  kebersihanAlat: number
  ketepatanWaktu: number
  kecepatanRespon: number
  akanMenggunakan: string
  pelayananDiperpanjang: string
  responden: string
  perusahaan: string
  saran: string
  kelas: string
}

const FEATURE_LABELS: Record<string, string> = {
  pelayananService: 'Pelayanan service',
  kecepatanRespon: 'Kecepatan respon',
  kualitasAroma: 'Kualitas aroma',
  kualitasPengharum: 'Kualitas pengharum',
  ketepatanWaktu: 'Ketepatan waktu',
  kebersihanAlat: 'Kebersihan alat',
  pelayananComplain: 'Pelayanan komplain',
}
const FEATURE_KEYS = Object.keys(FEATURE_LABELS) as (keyof DatasetRow)[]

const PAGE_SIZE = 10

function kelasColor(kelas: string) {
  return SATISFACTION_HEX[kelas as keyof typeof SATISFACTION_HEX] ?? '#64748b'
}

function YesNoBadge({ value }: { value: string }) {
  const isYes = value.toLowerCase() === 'yes'
  return (
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
        isYes ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {isYes ? 'Yes' : 'No'}
    </span>
  )
}

export function DatasetTable({ data }: { data: DatasetRow[] }) {
  const [search, setSearch] = useState('')
  const [kelasFilter, setKelasFilter] = useState<string>('Semua')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const kelasOptions = useMemo(
    () => ['Semua', ...Array.from(new Set(data.map((d) => d.kelas)))],
    [data],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return data.filter((row) => {
      const matchKelas = kelasFilter === 'Semua' || row.kelas === kelasFilter
      const matchSearch =
        q === '' ||
        row.responden.toLowerCase().includes(q) ||
        row.perusahaan.toLowerCase().includes(q) ||
        row.saran.toLowerCase().includes(q)
      return matchKelas && matchSearch
    })
  }, [data, search, kelasFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateSearch(value: string) {
    setSearch(value)
    setPage(1)
  }
  function updateKelasFilter(value: string) {
    setKelasFilter(value)
    setPage(1)
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          placeholder="Cari nama responden, perusahaan, atau saran..."
          className="w-full sm:max-w-sm text-sm px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
        />
        <div className="flex flex-wrap gap-2">
          {kelasOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => updateKelasFilter(opt)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                kelasFilter === opt
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide py-2.5 pl-5 pr-3">No</th>
              <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide py-2.5 px-3">Responden</th>
              <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide py-2.5 px-3">Perusahaan</th>
              <th className="text-center font-medium text-slate-400 text-xs uppercase tracking-wide py-2.5 px-3">Akan Pakai Lagi</th>
              <th className="text-center font-medium text-slate-400 text-xs uppercase tracking-wide py-2.5 px-3">Diperpanjang</th>
              <th className="text-center font-medium text-slate-400 text-xs uppercase tracking-wide py-2.5 px-3">Kelas</th>
              <th className="text-right font-medium text-slate-400 text-xs uppercase tracking-wide py-2.5 pr-5 pl-3">Detail</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-slate-400">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            )}
            {paged.map((row, idx) => {
              const isExpanded = expandedId === row.id
              return (
                <Fragment key={row.id}>
                  <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                    <td className="py-3 pl-5 pr-3 text-slate-400">
                      {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{row.responden}</td>
                    <td className="py-3 px-3 text-slate-500">{row.perusahaan}</td>
                    <td className="py-3 px-3 text-center">
                      <YesNoBadge value={row.akanMenggunakan} />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <YesNoBadge value={row.pelayananDiperpanjang} />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                        style={{
                          color: kelasColor(row.kelas),
                          backgroundColor: `${kelasColor(row.kelas)}14`,
                        }}
                      >
                        {row.kelas}
                      </span>
                    </td>
                    <td className="py-3 pr-5 pl-3 text-right">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : row.id)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        {isExpanded ? 'Tutup' : 'Lihat'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-blue-50/30 border-b border-slate-50">
                      <td colSpan={7} className="py-4 px-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-3">
                          {FEATURE_KEYS.map((key) => (
                            <div key={key as string} className="bg-white rounded-lg border border-slate-100 px-3 py-2">
                              <p className="text-[10px] text-slate-400 leading-tight mb-1">
                                {FEATURE_LABELS[key as string]}
                              </p>
                              <p className="text-sm font-semibold text-slate-900">{row[key] as number}</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">
                          <span className="font-medium text-slate-600">Saran: </span>
                          {row.saran}
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Menampilkan {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
          {Math.min(currentPage * PAGE_SIZE, filtered.length)} dari {filtered.length} data
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50"
          >
            Sebelumnya
          </button>
          <span className="text-xs text-slate-400">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  )
}