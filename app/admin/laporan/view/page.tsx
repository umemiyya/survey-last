import { AdminSidebar } from '@/components/admin-sidebar'
import { getLaporanBulanan, getLaporanTahunan } from '@/actions/survey'
import { SATISFACTION_HEX } from '@/lib/satisfaction'
import Link from 'next/link'
import { ArrowLeft, Printer, FileDown } from 'lucide-react'

export const dynamic = 'force-dynamic'

const MONTHS_ID: Record<string, string> = {
  January: 'Januari', February: 'Februari', March: 'Maret',
  April: 'April', May: 'Mei', June: 'Juni',
  July: 'Juli', August: 'Agustus', September: 'September',
  October: 'Oktober', November: 'November', December: 'Desember',
}

const FEATURE_LABELS: Record<string, string> = {
  kualitasAroma:     'Kualitas Aroma',
  kebersihanAlat:    'Kebersihan Alat',
  ketepatanWaktu:    'Ketepatan Waktu',
  kecepatanRespon:   'Kecepatan Respon',
  pelayananService:  'Pelayanan Service',
  pelayananComplain: 'Pelayanan Komplain',
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-100 bg-white text-center">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
    </div>
  )
}

export default async function LaporanViewPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string; bulan?: string; tahun?: string }>
}) {
  const params = await searchParams
  const jenis  = params.jenis ?? 'bulanan'
  const tahun  = Number(params.tahun ?? new Date().getFullYear())
  const bulan  = params.bulan ?? 'January'

  const data = jenis === 'tahunan'
    ? await getLaporanTahunan(tahun)
    : await getLaporanBulanan(tahun, bulan)

  const printUrl = jenis === 'tahunan'
    ? `/admin/laporan/print?jenis=tahunan&tahun=${tahun}`
    : `/admin/laporan/print?jenis=bulanan&bulan=${bulan}&tahun=${tahun}`

  const judulLaporan = jenis === 'tahunan'
    ? `Laporan Tahunan ${tahun}`
    : `Laporan Bulanan ${MONTHS_ID[bulan]} ${tahun}`

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-slate-100 p-6 bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/laporan" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">{judulLaporan}</h1>
          </div>
          <div className="flex gap-2">
            <a
              href={printUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Cetak
            </a>
            <a
              href={printUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Unduh PDF
            </a>
          </div>
        </div>

        <div className="p-6 max-w-6xl mx-auto space-y-8">

          {/* Statistik ringkasan */}
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-4">Statistik ringkasan</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatBox label="Total survey"  value={data.total}                    color="#185FA5" />
              <StatBox label="Puas"          value={data.distribusi['Puas']}       color={SATISFACTION_HEX['Puas']} />
              <StatBox label="Cukup Puas"    value={data.distribusi['Cukup Puas']} color={SATISFACTION_HEX['Cukup Puas']} />
              <StatBox label="Tidak Puas"    value={data.distribusi['Tidak Puas']} color={SATISFACTION_HEX['Tidak Puas']} />
            </div>
          </div>

          {/* Rata-rata rating */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Rata-rata rating per dimensi (skala 1–3)</h2>
            <div className="space-y-4">
              {Object.entries(data.rataRata).map(([key, val]) => {
                const pct = val > 0 ? ((val - 1) / 2) * 100 : 0
                const color = val >= 2.5 ? '#185FA5' : val >= 1.5 ? '#EF9F27' : '#E24B4A'
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600">{FEATURE_LABELS[key]}</span>
                      <span className="font-medium text-slate-900">{val > 0 ? val.toFixed(1) : '–'} / 3</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tren per bulan (khusus tahunan) */}
          {'perBulan' in data && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-5">Tren per bulan</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Bulan', 'Total', 'Puas', 'Cukup Puas', 'Tidak Puas'].map((h) => (
                        <th key={h} className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide py-2 px-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data as any).perBulan.map((row: any) => (
                      <tr key={row.bulan} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-700">{MONTHS_ID[row.bulan]}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.total}</td>
                        <td className="py-2.5 px-3"><span className="text-blue-700 font-medium">{row.puas}</span></td>
                        <td className="py-2.5 px-3"><span className="text-amber-600 font-medium">{row.cukupPuas}</span></td>
                        <td className="py-2.5 px-3"><span className="text-red-600 font-medium">{row.tidakPuas}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Daftar survey */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">
              Daftar survey ({data.total} data)
            </h2>
            {data.total === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Tidak ada data survey pada periode ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['No', 'Responden', 'Perusahaan', 'Bulan', 'Pelayanan', 'Aroma', 'Respon', 'Hasil'].map((h) => (
                        <th key={h} className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide py-2 px-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.surveys.map((s, i) => (
                      <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-400 text-xs">{i + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                          {s.responden?.split('(')[0].trim()}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{s.namaPerusahaan || '–'}</td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{MONTHS_ID[s.bulan] ?? s.bulan}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{s.pelayananService}/3</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{s.kualitasAroma}/3</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{s.kecepatanRespon}/3</td>
                        <td className="py-2.5 px-3">
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{
                              backgroundColor: `${SATISFACTION_HEX[s.prediksi as keyof typeof SATISFACTION_HEX] ?? '#94a3b8'}18`,
                              color: SATISFACTION_HEX[s.prediksi as keyof typeof SATISFACTION_HEX] ?? '#94a3b8',
                            }}
                          >
                            {s.prediksi ?? '–'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}