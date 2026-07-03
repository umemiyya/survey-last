import { AdminSidebar } from '@/components/admin-sidebar'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { ChartCard } from '@/components/chart-card'
import { getModelStats } from '@/actions/survey'
import { SATISFACTION_LEVELS, SATISFACTION_HEX } from '@/lib/satisfaction'

const FEATURE_LABELS: Record<string, string> = {
  pelayananService: 'Pelayanan service',
  kecepatanRespon: 'Kecepatan respon',
  kualitasAroma: 'Kualitas aroma',
  kualitasPengharum: 'Kualitas pengharum',
  ketepatanWaktu: 'Ketepatan waktu',
  kebersihanAlat: 'Kebersihan alat',
  pelayananComplain: 'Pelayanan komplain',
}

const THRESHOLDS = [
  { range: 'Skor ≥ 80', label: 'Sangat Puas' },
  { range: 'Skor 55-79', label: 'Puas' },
  { range: 'Skor < 55', label: 'Tidak Puas' },
]

export default async function ClassificationPage() {
  const stats = await getModelStats()
  const sortedWeights = Object.entries(stats.featureWeights).sort((a, b) => b[1] - a[1])

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-slate-100 p-6 bg-white">
          <h1 className="text-lg font-semibold text-slate-900">Klasifikasi</h1>
        </div>
        <div className="p-6 max-w-7xl mx-auto space-y-8">
          <PageHeader title="Model klasifikasi kepuasan" description="Informasi metode dan ringkasan hasil klasifikasi (3 tingkat)" />

          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-700 text-sm">i</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 mb-1">Status model saat ini: rule-based, bukan Random Forest terlatih</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Klasifikasi menggunakan skor tertimbang dari 7 fitur survey yang dipetakan ke 3 tingkat kepuasan. Begitu tersedia data survey berlabel yang dikonfirmasi manusia, sistem ini dapat di-upgrade ke model Random Forest menggunakan library{' '}
                <code className="px-1 py-0.5 bg-white rounded text-xs">ml-random-forest</code> yang sudah disiapkan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Metode" value="Weighted Threshold" color="blue" />
            <StatCard title="Total fitur" value={Object.keys(stats.featureWeights).length} color="blue" />
            <StatCard title="Total data" value={stats.total} color="blue" />
            <StatCard title="Kategori" value="3 kelas" color="green" />
          </div>

          <ChartCard title="Bobot fitur" description="Persentase pengaruh tiap fitur terhadap skor klasifikasi">
            <div className="space-y-4">
              {sortedWeights.map(([key, weight]) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">{FEATURE_LABELS[key]}</span>
                    <span className="font-medium text-slate-900">{weight}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${weight}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Distribusi hasil klasifikasi</h3>
              <p className="text-sm text-slate-400 mb-5">Dari {stats.total} total data survey</p>
              <div className="grid grid-cols-3 gap-3">
                {SATISFACTION_LEVELS.map((level) => (
                  <div key={level} className="p-4 rounded-xl text-center" style={{ backgroundColor: `${SATISFACTION_HEX[level]}14` }}>
                    <p className="text-[11px] mb-1 leading-tight" style={{ color: SATISFACTION_HEX[level] }}>{level}</p>
                    <p className="text-2xl font-semibold text-slate-900">{stats.distribusi[level] ?? 0}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Rata-rata rating per fitur</h3>
              <p className="text-sm text-slate-400 mb-5">Skala 1-5, dari semua data</p>
              <div className="space-y-3">
                {stats.featureAverages.map((f) => (
                  <div key={f.key} className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{FEATURE_LABELS[f.key]}</span>
                    <span className="text-sm font-medium text-slate-900">{f.rataRata > 0 ? f.rataRata.toFixed(1) : '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Ambang batas klasifikasi</h3>
            <div className="space-y-3">
              {THRESHOLDS.map((t, i) => (
                <div key={t.label} className={`flex justify-between py-2.5 ${i < THRESHOLDS.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <span className="text-slate-500">{t.range}</span>
                  <span className="font-medium" style={{ color: SATISFACTION_HEX[t.label as keyof typeof SATISFACTION_HEX] }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}