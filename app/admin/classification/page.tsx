import { AdminSidebar } from '@/components/admin-sidebar'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { ChartCard } from '@/components/chart-card'
import { getModelStats } from '@/actions/survey'
import { SATISFACTION_LEVELS, SATISFACTION_HEX } from '@/lib/satisfaction'

const FEATURE_LABELS: Record<string, string> = {
  pelayananService:  'Pelayanan service',
  kecepatanRespon:   'Kecepatan respon',
  kualitasAroma:     'Kualitas aroma',
  kualitasPengharum: 'Kualitas pengharum',
  ketepatanWaktu:    'Ketepatan waktu',
  kebersihanAlat:    'Kebersihan alat',
  pelayananComplain: 'Pelayanan komplain',
}

const THRESHOLDS = [
  { range: 'Skor ≥ 70', label: 'Sangat Puas', desc: 'Pelanggan sangat puas dengan layanan secara keseluruhan.' },
  { range: 'Skor 40–69', label: 'Puas',        desc: 'Pelanggan merasa cukup puas, masih ada ruang perbaikan.' },
  { range: 'Skor < 40',  label: 'Tidak Puas',  desc: 'Pelanggan kurang puas, perlu perhatian segera.' },
]

const ALGORITHM_STEPS = [
  {
    no: '01',
    judul: 'Input Rating',
    deskripsi: 'Pelanggan mengisi 18 sub-pernyataan pada skala Likert 3 poin (1 = Tidak Puas, 2 = Cukup Puas, 3 = Puas) yang dikelompokkan ke dalam 6 kategori.',
  },
  {
    no: '02',
    judul: 'Rata-rata Per Kategori',
    deskripsi: 'Setiap 3 sub-pernyataan dalam satu kategori dirata-rata menjadi 1 nilai (1–3). Hasilnya adalah 7 nilai fitur yang mewakili dimensi kepuasan pelanggan.',
  },
  {
    no: '03',
    judul: 'Normalisasi ke Skala 0–1',
    deskripsi: 'Tiap nilai fitur (1–3) dinormalisasi ke rentang 0–1 menggunakan rumus: (nilai − 1) / (3 − 1). Nilai 1 → 0.0, nilai 2 → 0.5, nilai 3 → 1.0.',
  },
  {
    no: '04',
    judul: 'Penerapan Bobot Fitur',
    deskripsi: 'Nilai ternormalisasi dikalikan dengan bobot masing-masing fitur (total bobot = 100). Fitur dengan bobot lebih besar memberi pengaruh lebih besar pada skor akhir.',
  },
  {
    no: '05',
    judul: 'Perhitungan Skor Total',
    deskripsi: 'Semua kontribusi fitur dijumlahkan menghasilkan skor total 0–100. Contoh: fitur bernilai 3 (bobot 35%) → kontribusi = 1.0 × 35 = 35 poin.',
  },
  {
    no: '06',
    judul: 'Klasifikasi & Probabilitas',
    deskripsi: 'Skor total dibandingkan dengan ambang batas (threshold) untuk menentukan kelas kepuasan. Probabilitas dihitung dari seberapa jauh skor berada dari batas terdekat (rentang 65–99%).',
  },
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
          <PageHeader
            title="Model klasifikasi kepuasan"
            description="Cara kerja algoritma dan ringkasan hasil klasifikasi (3 tingkat)"
          />

          {/* ── Status model ─────────────────────────────────────────── */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-700 text-sm font-medium">i</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 mb-1">
                Status model saat ini: Weighted Threshold Classifier
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Klasifikasi menggunakan skor tertimbang dari 7 fitur survey yang dipetakan
                ke 3 tingkat kepuasan. Bukan algoritma machine learning yang dilatih dari
                data — melainkan rule-based dengan bobot per fitur yang dapat dikonfigurasi.
                Begitu tersedia data berlabel yang cukup, sistem dapat di-upgrade ke model{' '}
                <code className="px-1 py-0.5 bg-white rounded text-xs font-mono">ml-random-forest</code>{' '}
                yang sudah disiapkan di{' '}
                <code className="px-1 py-0.5 bg-white rounded text-xs font-mono">lib/random-forest.ts</code>.
              </p>
            </div>
          </div>

          {/* ── Stat cards ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Metode"      value="Weighted Threshold" color="blue" />
            <StatCard title="Total fitur" value={Object.keys(stats.featureWeights).length} color="blue" />
            <StatCard title="Total data"  value={stats.total} color="blue" />
            <StatCard title="Kategori"    value="3 kelas" color="green" />
          </div>

          {/* ── Cara kerja algoritma ─────────────────────────────────── */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-1">Cara kerja algoritma</h3>
            <p className="text-sm text-slate-400 mb-7">
              Alur pemrosesan dari input rating pelanggan hingga hasil klasifikasi kepuasan
            </p>
            <div className="space-y-0">
              {ALGORITHM_STEPS.map((step, idx) => (
                <div key={step.no} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {step.no}
                    </div>
                    {idx < ALGORITHM_STEPS.length - 1 && (
                      <div className="w-px flex-1 bg-blue-100 my-1 min-h-[24px]" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm font-semibold text-slate-900 mb-1 mt-1.5">{step.judul}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Formula ──────────────────────────────────────────────── */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Formula perhitungan</h3>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Langkah 1 — Normalisasi nilai (skala 1–3)
                </p>
                <p className="font-mono text-sm text-blue-700 bg-white rounded-lg px-3 py-2.5 border border-blue-100">
                  nilai_norm = (nilai − 1) / (3 − 1)
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Nilai 3 → 1.0 &nbsp;·&nbsp; Nilai 2 → 0.5 &nbsp;·&nbsp; Nilai 1 → 0.0
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Langkah 2 — Kontribusi per fitur
                </p>
                <p className="font-mono text-sm text-blue-700 bg-white rounded-lg px-3 py-2.5 border border-blue-100">
                  kontribusi_fitur = nilai_norm × bobot_fitur
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Contoh: Pelayanan service nilai 3, bobot 35% → 1.0 × 35 = 35 poin
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Langkah 3 — Skor total (0–100)
                </p>
                <p className="font-mono text-sm text-blue-700 bg-white rounded-lg px-3 py-2.5 border border-blue-100">
                  skor_total = Σ (nilai_norm_i × bobot_i)
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Semua fitur bernilai 3 → skor = 100 &nbsp;·&nbsp; Semua bernilai 1 → skor = 0
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Langkah 4 — Klasifikasi berdasarkan threshold
                </p>
                <div className="space-y-1.5">
                  {THRESHOLDS.map((t) => (
                    <div key={t.label} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-slate-100">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: SATISFACTION_HEX[t.label as keyof typeof SATISFACTION_HEX] }}
                      />
                      <span className="font-mono text-sm text-blue-700 w-28 flex-shrink-0">{t.range}</span>
                      <span className="text-sm font-medium text-slate-700 w-24 flex-shrink-0">{t.label}</span>
                      <span className="text-xs text-slate-400">{t.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bobot fitur ──────────────────────────────────────────── */}
          <ChartCard
            title="Bobot fitur"
            description="Persentase pengaruh tiap fitur terhadap skor klasifikasi (total = 100%)"
          >
            <div className="space-y-4">
              {sortedWeights.map(([key, weight], idx) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {idx === 0 && (
                        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                          Terbesar
                        </span>
                      )}
                      <span className="text-slate-700">{FEATURE_LABELS[key]}</span>
                    </div>
                    <span className="font-medium text-slate-900">{weight}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${weight}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-5 border-t border-slate-50 pt-4">
              Fitur dengan bobot lebih besar berarti kepuasan pelanggan pada dimensi tersebut
              lebih menentukan klasifikasi akhir. Bobot dapat disesuaikan di{' '}
              <code className="px-1 py-0.5 bg-slate-100 rounded text-[11px] font-mono">lib/classifier.ts</code>.
            </p>
          </ChartCard>

          {/* ── Distribusi & rata-rata ───────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Distribusi hasil klasifikasi</h3>
              <p className="text-sm text-slate-400 mb-5">Dari {stats.total} total data survey</p>
              {stats.total === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Belum ada data survey</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {SATISFACTION_LEVELS.map((level) => {
                    const count = stats.distribusi[level] ?? 0
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                    return (
                      <div key={level} className="p-4 rounded-xl text-center" style={{ backgroundColor: `${SATISFACTION_HEX[level]}14` }}>
                        <p className="text-[11px] mb-1 leading-tight font-medium" style={{ color: SATISFACTION_HEX[level] }}>{level}</p>
                        <p className="text-2xl font-semibold text-slate-900">{count}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{pct}%</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Rata-rata rating per fitur</h3>
              <p className="text-sm text-slate-400 mb-5">Skala 1–3, dari semua data</p>
              <div className="space-y-3.5">
                {stats.featureAverages.map((f) => {
                  const pct = f.rataRata > 0 ? ((f.rataRata - 1) / 2) * 100 : 0
                  return (
                    <div key={f.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-500">{FEATURE_LABELS[f.key]}</span>
                        <span className="text-sm font-medium text-slate-900">
                          {f.rataRata > 0 ? f.rataRata.toFixed(1) : '-'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div className="bg-blue-400 h-1 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Contoh perhitungan ───────────────────────────────────── */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-1">Contoh perhitungan</h3>
            <p className="text-sm text-slate-400 mb-5">
              Simulasi: pelanggan memberi semua rating nilai 3 (Puas)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide pb-2 pr-4">Fitur</th>
                    <th className="text-center font-medium text-slate-400 text-xs uppercase tracking-wide pb-2 px-3">Nilai</th>
                    <th className="text-center font-medium text-slate-400 text-xs uppercase tracking-wide pb-2 px-3">Norm.</th>
                    <th className="text-center font-medium text-slate-400 text-xs uppercase tracking-wide pb-2 px-3">Bobot</th>
                    <th className="text-right font-medium text-slate-400 text-xs uppercase tracking-wide pb-2 pl-3">Kontribusi</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWeights.map(([key, weight]) => (
                    <tr key={key} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 pr-4 text-slate-700">{FEATURE_LABELS[key]}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">3</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">1.00</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{weight}%</td>
                      <td className="py-2.5 pl-3 text-right font-medium text-blue-700">{(1.0 * weight).toFixed(1)}</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50/60">
                    <td colSpan={4} className="py-3 pr-4 text-sm font-semibold text-slate-900 pl-0">Skor total</td>
                    <td className="py-3 pl-3 text-right text-lg font-bold text-blue-700">100.0</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-slate-400 mt-3">
                Skor 100 → ≥ 70 → klasifikasi:{' '}
                <strong className="text-blue-700">Sangat Puas</strong>{' '}
                dengan probabilitas 99%
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}