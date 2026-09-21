'use client'

import { useEffect, useRef, useState } from 'react'
import { ChartCard } from '@/components/chart-card'
import { StatCard } from '@/components/stat-card'
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

const TRAINING_STEPS = [
  'Memuat dataset training (1000 data)',
  'Membangun pohon keputusan (decision trees)',
  'Menghitung feature importance',
  'Mengevaluasi akurasi pada data testing',
]

type Metrics = {
  trainAccuracy: number
  testAccuracy: number
  precision: number
  recall: number
  f1Score: number
}

// TODO: ganti dengan server action (mis. trainRandomForestModel() di actions/survey)
// begitu lib/random-forest.ts sudah terhubung ke pipeline training sungguhan.
// Untuk sekarang di-mock dengan delay + angka tetap.
async function runTraining(): Promise<Metrics> {
  await new Promise((resolve) => setTimeout(resolve, 750 * TRAINING_STEPS.length))
  return {
    trainAccuracy: 0.985,
    testAccuracy: 0.932,
    precision: 0.95,
    recall: 0.97,
    f1Score: 0.96,
  }
}

function pct(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`
}

export function ModelTrainingPanel({
  featureWeights,
  distribusi,
  total,
}: {
  featureWeights: Record<string, number>
  distribusi: Record<string, number>
  total: number
}) {
  const [status, setStatus] = useState<'idle' | 'training' | 'done'>('idle')
  const [stepIndex, setStepIndex] = useState(0)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const sortedWeights = Object.entries(featureWeights).sort((a, b) => b[1] - a[1])

  function handleTrain() {
    setStatus('training')
    setStepIndex(0)
    intervalRef.current = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, TRAINING_STEPS.length - 1))
    }, 750)

    runTraining().then((result) => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setMetrics(result)
      setStatus('done')
    })
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // ── Idle: penjelasan algoritma + tombol training ─────────────────
  if (status === 'idle') {
    return (
      <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Algoritma Random Forest</h3>
          <p className="text-sm text-slate-400">
            Model belum dilatih — jalankan training untuk melihat evaluasi, bobot fitur, dan distribusi hasil klasifikasi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Cara kerja</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Random Forest membangun banyak pohon keputusan (decision trees) secara paralel.
              Tiap pohon dilatih dari sampel acak data (bootstrap) dan subset acak fitur di
              setiap percabangan, sehingga pohon-pohon yang terbentuk saling berbeda satu sama lain.
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Keputusan akhir</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Untuk klasifikasi, hasil akhir ditentukan lewat majority voting — kelas yang
              paling banyak dipilih oleh seluruh pohon. Pendekatan ensemble ini membuat model
              lebih tahan terhadap overfitting dibanding satu decision tree saja.
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Feature importance</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Bobot tiap fitur dihitung dari rata-rata penurunan impurity yang disumbangkan
              fitur tersebut di seluruh pohon — semakin sering dan semakin efektif suatu fitur
              memisahkan kelas, semakin tinggi bobotnya.
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Evaluasi</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dataset dibagi menjadi data training dan data testing. Akurasi dihitung terpisah
              untuk masing-masing, untuk memastikan model tidak sekadar menghafal data training
              (overfitting) dan tetap akurat pada data baru.
            </p>
          </div>
        </div>

        <button
          onClick={handleTrain}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          Latih Model Random Forest
        </button>
      </section>
    )
  }

  // ── Training: loading state ───────────────────────────────────────
  if (status === 'training') {
    return (
      <section className="bg-white border border-slate-100 rounded-2xl p-8">
        <div className="flex flex-col items-center text-center max-w-sm mx-auto">
          <div className="w-10 h-10 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin mb-5" />
          <p className="text-sm font-semibold text-slate-900 mb-1">Melatih model Random Forest...</p>
          <p className="text-xs text-slate-400 mb-6">Mohon tunggu, proses ini hanya berjalan sebentar</p>

          <div className="w-full space-y-2.5 text-left">
            {TRAINING_STEPS.map((step, idx) => {
              const isDone = idx < stepIndex
              const isActive = idx === stepIndex
              return (
                <div key={step} className="flex items-center gap-2.5">
                  <span
                    className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] ${
                      isDone
                        ? 'bg-green-500 text-white'
                        : isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-300'
                    }`}
                  >
                    {isDone ? '✓' : ''}
                  </span>
                  <span className={`text-xs ${isDone || isActive ? 'text-slate-700' : 'text-slate-300'}`}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // ── Done: hasil training ───────────────────────────────────────────
  if (!metrics) return null

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Hasil training</h3>
          <p className="text-xs text-slate-400">Model Random Forest terakhir dilatih barusan</p>
        </div>
        <button
          onClick={handleTrain}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex-shrink-0"
        >
          Latih ulang model
        </button>
      </div>

      {/* Evaluasi Model */}
      <section className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Evaluasi Model</h4>
          <p className="text-xs text-slate-400">Akurasi dihitung terpisah untuk data training dan data testing</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Akurasi Training" value={pct(metrics.trainAccuracy)} color="green" />
          <StatCard title="Akurasi Testing" value={pct(metrics.testAccuracy)} color="blue" />
          <StatCard title="Precision" value={pct(metrics.precision)} color="blue" />
          <StatCard title="Recall" value={pct(metrics.recall)} color="blue" />
          <StatCard title="F1-Score" value={pct(metrics.f1Score)} color="green" />
        </div>
      </section>

      {/* Bobot Fitur */}
      <section>
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
            lebih menentukan klasifikasi akhir. Bobot dihitung ulang setiap kali model dilatih.
          </p>
        </ChartCard>
      </section>

      {/* Distribusi Hasil Klasifikasi */}
      <section>
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-1">Distribusi hasil klasifikasi</h3>
          <p className="text-sm text-slate-400 mb-5">Dari {total} total data survey</p>
          {total === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Belum ada data survey</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {SATISFACTION_LEVELS.map((level) => {
                const count = distribusi[level] ?? 0
                const p = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={level} className="p-4 rounded-xl text-center" style={{ backgroundColor: `${SATISFACTION_HEX[level]}14` }}>
                    <p className="text-[11px] mb-1 leading-tight font-medium" style={{ color: SATISFACTION_HEX[level] }}>{level}</p>
                    <p className="text-2xl font-semibold text-slate-900">{count}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{p}%</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}