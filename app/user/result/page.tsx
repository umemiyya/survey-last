import { getSurveyById } from "@/actions/survey"
import { getSatisfactionBadgeClass } from "@/lib/satisfaction"
import Link from "next/link"
import { PrintButton } from "@/components/print-button"

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

  const probabilitas = survey.probabilitas ?? 0
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (probabilitas / 100) * circumference

  const ratingItems = [
    { label: "Kualitas aroma",      value: survey.kualitasAroma },
    { label: "Kebersihan alat",     value: survey.kebersihanAlat },
    { label: "Ketepatan waktu",     value: survey.ketepatanWaktu },
    { label: "Kecepatan respon",    value: survey.kecepatanRespon },
    { label: "Pelayanan service",   value: survey.pelayananService },
    { label: "Pelayanan komplain",  value: survey.pelayananComplain },
  ]

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-16">
        <p className="text-xs font-medium text-blue-600 tracking-wide uppercase mb-2 text-center">Hasil Survey</p>
        <h1 className="text-2xl font-semibold text-slate-900 text-center mb-10">
          Terima kasih, {survey.responden.split(' - ')[0].split(' ')[0]}
        </h1>

        {/* Score ring */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-36 h-36">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#EFF6FF" strokeWidth="10" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="#2563EB" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold text-slate-900">{probabilitas}%</span>
              <span className="text-[11px] text-slate-400 mt-0.5">probabilitas</span>
            </div>
          </div>
          <span className={`mt-5 inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium ${getSatisfactionBadgeClass(survey.prediksi)}`}>
            {survey.prediksi}
          </span>
        </div>

        {/* Rating breakdown */}
        {/* <div className="border border-slate-100 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-medium text-slate-900 mb-4">Rincian penilaian (rata-rata)</h2>
          <div className="space-y-3.5">
            {ratingItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{item.label}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < (item.value ?? 0) ? 'bg-blue-600' : 'bg-slate-200'}`} />
                  ))}
                  <span className="text-sm font-medium text-slate-900 ml-1.5">{item.value}/3</span>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Info cards */}
        {/* <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="border border-slate-100 rounded-xl p-4">
            <p className="text-[11px] text-slate-400 mb-1">Akan menggunakan lagi</p>
            <p className="text-sm font-medium text-slate-900">{survey.akanMenggunakan}</p>
          </div>
          <div className="border border-slate-100 rounded-xl p-4">
            <p className="text-[11px] text-slate-400 mb-1">Layanan diperpanjang</p>
            <p className="text-sm font-medium text-slate-900">{survey.pelayananDiperpanjang}</p>
          </div>
        </div> */}

        {/* {survey.saran && (
          <div className="bg-blue-50/60 rounded-xl p-4 mb-8">
            <p className="text-[11px] text-blue-600 font-medium mb-1.5">Saran Anda</p>
            <p className="text-sm text-slate-700 leading-relaxed">{survey.saran}</p>
          </div>
        )} */}

        {/* Tombol download laporan */}
        <PrintButton surveyId={survey.id} />

        <Link href="/user" className="block text-center w-full py-3 rounded-full border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors mt-3">
          Dashboard
        </Link>
      </div>
    </main>
  )
}