import { getSurveyById } from "@/actions/survey"
import { classifySurvey } from "@/lib/classifier"
import { getSatisfactionBadgeClass, SATISFACTION_HEX } from "@/lib/satisfaction"
import Link from "next/link"
import { PrintButton } from "@/components/print-button"

export const dynamic = 'force-dynamic'

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  const survey = id ? await getSurveyById(id) : null

  if (!survey) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 9.879a3 3 0 104.242 4.242M9.88 9.88l4.242 4.242M9.879 9.879L4.93 4.93m4.95 4.95L4.93 4.93m14.142 14.142l-4.243-4.243m4.243 4.243l-4.243-4.243M4.93 19.07l14.14-14.14" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-slate-900 mb-1.5">Data tidak ditemukan</h1>
          <p className="text-sm text-slate-500 mb-6">Survey yang Anda cari mungkin sudah dihapus atau tautannya tidak valid.</p>
          <Link href="/user/survey" className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            Isi survey baru
          </Link>
        </div>
      </main>
    )
  }

  // Hitung ulang klasifikasi untuk mendapatkan skor detail
  const { prediksi, probabilitas, skor } = classifySurvey({
    kualitasPengharum:  survey.kualitasPengharum,
    pelayananService:   survey.pelayananService,
    pelayananComplain:  survey.pelayananComplain,
    kualitasAroma:      survey.kualitasAroma,
    kebersihanAlat:     survey.kebersihanAlat,
    ketepatanWaktu:     survey.ketepatanWaktu,
    kecepatanRespon:    survey.kecepatanRespon,
  })

  const prediksiColor  = SATISFACTION_HEX[prediksi as keyof typeof SATISFACTION_HEX] ?? '#185FA5'
  const circumference  = 2 * Math.PI * 54
  const offset         = circumference - (probabilitas / 100) * circumference

  const ratingItems = [
    { label: "Kualitas aroma",     value: survey.kualitasAroma     },
    { label: "Kebersihan alat",    value: survey.kebersihanAlat    },
    { label: "Ketepatan waktu",    value: survey.ketepatanWaktu    },
    { label: "Kecepatan respon",   value: survey.kecepatanRespon   },
    { label: "Pelayanan service",  value: survey.pelayananService  },
    { label: "Pelayanan komplain", value: survey.pelayananComplain },
  ]

  const THRESHOLDS = [
    { range: '< 40',  label: 'Tidak Puas', prediksi: 'Tidak Puas' },
    { range: '40–69', label: 'Cukup Puas', prediksi: 'Cukup Puas' },
    { range: '≥ 70',  label: 'Puas',       prediksi: 'Puas'        },
  ]

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-16">
        <p className="text-xs font-medium text-blue-600 tracking-wide uppercase mb-2 text-center">Hasil Survey</p>
        <h1 className="text-2xl font-semibold text-slate-900 text-center mb-10">
          Terima kasih, {survey.responden.split('(')[0].split(' ')[0]}
        </h1>

        {/* ── Score ring ───────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-36 h-36">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#EFF6FF" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={prediksiColor}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold text-slate-900">{probabilitas}%</span>
              <span className="text-[11px] text-slate-400 mt-0.5">probabilitas</span>
            </div>
          </div>
          <span
            className={`mt-5 inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium ${getSatisfactionBadgeClass(prediksi)}`}
          >
            {prediksi}
          </span>
        </div>

        {/* ── Skoring dengan threshold bar ─────────────────────────── */}
        <div className="border border-slate-100 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-medium text-slate-900 mb-4">Skoring kepuasan</h2>

          {/* Progress bar dengan marker */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Skor tertimbang</span>
              <span className="font-semibold text-slate-900">{skor} / 100</span>
            </div>
            <div className="relative w-full bg-slate-100 rounded-full h-3">
              {/* Marker 40 */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400 opacity-80 rounded-full" style={{ left: '40%' }} />
              {/* Marker 70 */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-blue-400 opacity-80 rounded-full" style={{ left: '70%' }} />
              {/* Skor bar */}
              <div
                className="h-3 rounded-full transition-all"
                style={{ width: `${skor}%`, backgroundColor: prediksiColor }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-0.5">
              <span>0</span>
              <span className="text-amber-500" style={{ marginLeft: '37%' }}>40</span>
              <span className="text-blue-500" style={{ marginLeft: '10%' }}>70</span>
              <span>100</span>
            </div>
          </div>

          {/* 3 kotak kategori */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {THRESHOLDS.map((t) => {
              const isActive = prediksi === t.prediksi
              const color    = SATISFACTION_HEX[t.label as keyof typeof SATISFACTION_HEX]
              return (
                <div
                  key={t.label}
                  className="p-2.5 rounded-xl border text-center"
                  style={isActive
                    ? { backgroundColor: `${color}12`, borderColor: `${color}40` }
                    : { borderColor: '#f1f5f9' }
                  }
                >
                  <p className="font-mono text-[10px] mb-0.5" style={{ color: isActive ? color : '#94a3b8' }}>
                    {t.range}
                  </p>
                  <p className="text-xs font-medium" style={{ color: isActive ? color : '#94a3b8' }}>
                    {t.label}
                  </p>
                  {isActive && (
                    <p className="text-[9px] mt-0.5" style={{ color }}>← Anda</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Rating breakdown ─────────────────────────────────────── */}
        <div className="border border-slate-100 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-medium text-slate-900 mb-4">Rincian penilaian (rata-rata per kategori)</h2>
          <div className="space-y-3.5">
            {ratingItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: i < (item.value ?? 0)
                          ? item.value === 1 ? '#E24B4A' : item.value === 2 ? '#EF9F27' : '#185FA5'
                          : '#E2E8F0'
                      }}
                    />
                  ))}
                  <span className="text-sm font-medium text-slate-900 ml-1">{item.value}/3</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Info cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="border border-slate-100 rounded-xl p-4">
            <p className="text-[11px] text-slate-400 mb-1">Akan menggunakan lagi</p>
            <p className="text-sm font-medium text-slate-900">{survey.akanMenggunakan}</p>
          </div>
          <div className="border border-slate-100 rounded-xl p-4">
            <p className="text-[11px] text-slate-400 mb-1">Layanan diperpanjang</p>
            <p className="text-sm font-medium text-slate-900">{survey.pelayananDiperpanjang}</p>
          </div>
        </div>

        {survey.saran && (
          <div className="bg-blue-50/60 rounded-xl p-4 mb-6">
            <p className="text-[11px] text-blue-600 font-medium mb-1.5">Saran Anda</p>
            <p className="text-sm text-slate-700 leading-relaxed">{survey.saran}</p>
          </div>
        )}

        {/* ── Tombol ───────────────────────────────────────────────── */}
        <div className="space-y-3">
          <Link
            href={`/report?id=${id}`}
            className="block text-center w-full py-3 rounded-full border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Lihat laporan detail & penjelasan algoritma
          </Link>
          <PrintButton surveyId={survey.id} />
          <Link
            href="/user/survey"
            className="block text-center w-full py-3 rounded-full border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Isi survey lain
          </Link>
        </div>
      </div>
    </main>
  )
}