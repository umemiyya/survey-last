'use client'

import { useState, useTransition } from 'react'
import { setSurveyLabel, exportLabeledDataAsCsv } from '@/actions/survey'
import { SATISFACTION_LEVELS } from '@/lib/satisfaction'
import { Download, Check } from 'lucide-react'

interface Survey {
  id: string
  responden: string
  bulan: string
  pelayananService: number
  kecepatanRespon: number
  kualitasAroma: number
  kualitasPengharum: number
  ketepatanWaktu: number
  kebersihanAlat: number
  pelayananComplain: number
  saran: string | null
  prediksi: string | null
}

const LABEL_SHORT: Record<string, string> = {
  'Tidak Puas': 'TP',
  'Puas': 'P',
  'Sangat Puas': 'SP',
}

const LABEL_BUTTON_CLASS: Record<string, { idle: string }> = {
  'Tidak Puas': { idle: 'border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200' },
  'Puas': { idle: 'border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200' },
  'Sangat Puas': { idle: 'border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200' },
}

export function LabelingManager({ initialSurveys, initialLabeledCount }: { initialSurveys: Survey[]; initialLabeledCount: number }) {
  const [surveys, setSurveys] = useState(initialSurveys)
  const [labeledCount, setLabeledCount] = useState(initialLabeledCount)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleLabel = (id: string, label: string) => {
    setPendingId(id)
    startTransition(async () => {
      const result = await setSurveyLabel(id, label)
      if (result.success) {
        setSurveys((prev) => prev.filter((s) => s.id !== id))
        setLabeledCount((prev) => prev + 1)
      } else {
        alert(result.error || 'Gagal menyimpan label')
      }
      setPendingId(null)
    })
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const csv = await exportLabeledDataAsCsv()
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `survey-training-data-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Gagal mengekspor data') }
    finally { setIsExporting(false) }
  }

  return (
    <>
      <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm font-medium text-slate-900">{labeledCount} data sudah dilabel</p>
          <p className="text-sm text-slate-500">{surveys.length} data tersisa belum dilabel</p>
        </div>
        <button onClick={handleExport} disabled={isExporting || labeledCount === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <Download className="w-4 h-4" />
          {isExporting ? 'Mengekspor...' : 'Ekspor CSV untuk training'}
        </button>
      </div>

      {surveys.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-slate-900 mb-1">Semua data sudah dilabel</p>
          <p className="text-sm text-slate-400">Anda bisa mengekspor data ini untuk melatih model Random Forest.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Responden', 'Rating', 'Saran', 'Prediksi sistem', 'Label sebenarnya'].map((h) => (
                    <th key={h} className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {surveys.map((s) => {
                  const ratings = [s.pelayananService, s.kecepatanRespon, s.kualitasAroma, s.kualitasPengharum, s.ketepatanWaktu, s.kebersihanAlat, s.pelayananComplain]
                  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
                  const isRowPending = isPending && pendingId === s.id
                  return (
                    <tr key={s.id} className={`border-b border-slate-50 last:border-0 transition-opacity ${isRowPending ? 'opacity-40' : ''}`}>
                      <td className="px-4 py-3.5 align-top">
                        <p className="font-medium text-slate-900">{s.responden}</p>
                        <p className="text-xs text-slate-400">{s.bulan}</p>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5">
                            {ratings.map((r, i) => (
                              <span key={i} className={`w-1.5 h-4 rounded-sm ${r >= 4 ? 'bg-blue-600' : r === 3 ? 'bg-blue-300' : 'bg-red-300'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-slate-400 ml-1">avg {avg.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-top max-w-[220px]">
                        <p className="text-slate-600 text-sm leading-snug">
                          {s.saran || <span className="text-slate-300 italic">Tidak ada saran</span>}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="text-xs text-slate-400">{s.prediksi}</span>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex gap-1.5">
                          {SATISFACTION_LEVELS.map((level) => (
                            <button key={level} disabled={isRowPending} onClick={() => handleLabel(s.id, level)} title={level}
                              className={`w-9 h-8 rounded-lg border text-xs font-medium transition-colors disabled:cursor-not-allowed ${LABEL_BUTTON_CLASS[level].idle}`}>
                              {LABEL_SHORT[level]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}