'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/data-table'
import { Search, Trash2, Eye, FileDown, BarChart2 } from 'lucide-react'
import { deleteSurvey } from '@/actions/survey'
import { getSatisfactionBadgeClass } from '@/lib/satisfaction'

interface Survey {
  id: string
  responden: string
  bulan: string
  pelayananService: number
  kecepatanRespon: number
  prediksi: string | null
}

interface SurveysManagerProps {
  initialSurveys: Survey[]
}

export function SurveysManager({ initialSurveys }: SurveysManagerProps) {
  const router = useRouter()
  const [surveys, setSurveys] = useState(initialSurveys)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredSurveys = useMemo(() => {
    let result = surveys
    if (filter !== 'all') result = result.filter((s) => s.prediksi === filter)
    if (search) result = result.filter((s) =>
      s.responden.toLowerCase().includes(search.toLowerCase())
    )
    return result
  }, [surveys, search, filter])

  const handleDelete = (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus survey ini?')) return
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteSurvey(id)
      if (result.success) {
        setSurveys((prev) => prev.filter((s) => s.id !== id))
      } else {
        alert(result.error || 'Gagal menghapus survey')
      }
      setDeletingId(null)
    })
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama responden..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          >
            <option value="all">Semua status</option>
            <option value="Puas">Puas</option>
            <option value="Cukup Puas">Cukup Puas</option>
            <option value="Tidak Puas">Tidak Puas</option>
          </select>
        </div>
        <p className="text-sm text-slate-400">
          Menampilkan {filteredSurveys.length} dari {surveys.length} survey
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6">
        <DataTable
          columns={[
            { key: 'responden', label: 'Nama responden' },
            { key: 'bulan', label: 'Bulan' },
            {
              key: 'pelayananService',
              label: 'Pelayanan',
              render: (value: number) => `${value}/3`,
            },
            {
              key: 'kecepatanRespon',
              label: 'Respon',
              render: (value: number) => `${value}/3`,
            },
            {
              key: 'prediksi',
              label: 'Prediksi',
              render: (value: string) => (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getSatisfactionBadgeClass(value)}`}>
                  {value}
                </span>
              ),
            },
            {
              key: 'id',
              label: 'Aksi',
              render: (value: string) => (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => router.push(`/user/result?id=${value}`)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
                    title="Lihat hasil"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push(`/report?id=${value}`)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
                    title="Laporan detail"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                  <a
                    href={`/user/result/print/${value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
                    title="Unduh PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(value)}
                    disabled={isPending && deletingId === value}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-600 disabled:opacity-40"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredSurveys}
          itemsPerPage={15}
        />
      </div>
    </>
  )
}