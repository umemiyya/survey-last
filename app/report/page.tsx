import { getSurveyById } from '@/actions/survey'
import { getSession } from '@/lib/session'
import { classifySurvey, FEATURE_WEIGHTS } from '@/lib/classifier'
import { SATISFACTION_HEX } from '@/lib/satisfaction'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { FileDown, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

const FEATURE_LABELS: Record<string, string> = {
  pelayananService:  'Pelayanan Service',
  kecepatanRespon:   'Kecepatan Respon',
  kualitasAroma:     'Kualitas Aroma',
  kualitasPengharum: 'Kualitas Pengharum',
  ketepatanWaktu:    'Ketepatan Waktu',
  kebersihanAlat:    'Kebersihan Alat',
  pelayananComplain: 'Pelayanan Komplain',
}

const LIKERT_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: 'Tidak Puas', color: 'text-red-600 bg-red-50 border-red-200'       },
  2: { label: 'Cukup Puas', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  3: { label: 'Puas',       color: 'text-blue-700 bg-blue-50 border-blue-200'    },
}

const THRESHOLDS = [
  { range: '< 40',  label: 'Tidak Puas', prediksi: 'Tidak Puas' },
  { range: '40–69', label: 'Cukup Puas', prediksi: 'Cukup Puas' },
  { range: '≥ 70',  label: 'Puas',       prediksi: 'Puas'       },
]

const BAGIAN_B_DETAIL = [
  {
    featureKey: 'kualitasAroma' as const,
    nomor: 'B1', judul: 'Kualitas Aroma',
    items: [
      { key: 'b1_kualitasAroma_1', teks: 'Aroma pengharum ruangan memberikan kesan yang nyaman.' },
      { key: 'b1_kualitasAroma_2', teks: 'Aroma pengharum sesuai dengan kebutuhan ruangan.' },
      { key: 'b1_kualitasAroma_3', teks: 'Aroma pengharum bertahan sesuai harapan.' },
    ],
  },
  {
    featureKey: 'kebersihanAlat' as const,
    nomor: 'B2', judul: 'Ketahanan & Kebersihan Alat',
    items: [
      { key: 'b2_kebersihanAlat_1', teks: 'Alat pengharum berfungsi dengan baik selama digunakan.' },
      { key: 'b2_kebersihanAlat_2', teks: 'Alat jarang mengalami gangguan atau kerusakan.' },
      { key: 'b2_kebersihanAlat_3', teks: 'Kondisi alat pengharum selalu bersih dan terawat.' },
    ],
  },
  {
    featureKey: 'ketepatanWaktu' as const,
    nomor: 'B3', judul: 'Ketepatan Waktu Perawatan',
    items: [
      { key: 'b3_ketepatanWaktu_1', teks: 'Petugas melakukan perawatan sesuai jadwal.' },
      { key: 'b3_ketepatanWaktu_2', teks: 'Penggantian isi pengharum dilakukan tepat waktu.' },
      { key: 'b3_ketepatanWaktu_3', teks: 'Perawatan dilakukan secara rutin dan konsisten.' },
    ],
  },
  {
    featureKey: 'kecepatanRespon' as const,
    nomor: 'B4', judul: 'Responsivitas Layanan',
    items: [
      { key: 'b4_kecepatanRespon_1', teks: 'Petugas merespons keluhan dengan cepat.' },
      { key: 'b4_kecepatanRespon_2', teks: 'Petugas memberikan solusi yang sesuai.' },
      { key: 'b4_kecepatanRespon_3', teks: 'Keluhan pelanggan ditindaklanjuti dengan baik.' },
    ],
  },
  {
    featureKey: 'pelayananService' as const,
    nomor: 'B5', judul: 'Kualitas Pengharum & Pelayanan Service',
    items: [
      { key: 'b5_pelayananService_1', teks: 'Kualitas pengharum sesuai standar yang dijanjikan.' },
      { key: 'b5_pelayananService_2', teks: 'Pelayanan service dilakukan secara profesional.' },
      { key: 'b5_pelayananService_3', teks: 'Petugas bersikap ramah dan membantu.' },
    ],
  },
  {
    featureKey: 'pelayananComplain' as const,
    nomor: 'B6', judul: 'Kepuasan Keseluruhan & Penanganan Keluhan',
    items: [
      { key: 'b6_pelayananComplain_1', teks: 'Secara keseluruhan saya puas terhadap layanan PT Pink Service Indonesia.' },
      { key: 'b6_pelayananComplain_2', teks: 'Penanganan komplain dilakukan dengan cepat dan tepat.' },
      { key: 'b6_pelayananComplain_3', teks: 'Saya merasa layanan yang diberikan sesuai dengan nilai yang dibayarkan.' },
    ],
  },
]

function buildNarasi(
  kontribusi: { fitur: string; bobot: number; nilai: number; kontribusi: number }[],
  skor: number,
  prediksi: string
): string {
  const sorted    = [...kontribusi].sort((a, b) => b.kontribusi - a.kontribusi)
  const tertinggi = sorted[0]
  const terendah  = sorted[sorted.length - 1]
  const fiturLemah = kontribusi.filter((k) => k.nilai === 1)
  const fiturKuat  = kontribusi.filter((k) => k.nilai === 3)

  const nilaiLabel = (n: number) =>
    n === 3 ? 'baik (Puas)' : n === 2 ? 'cukup (Cukup Puas)' : 'kurang (Tidak Puas)'

  let narasi = `Berdasarkan analisis terhadap 7 dimensi layanan, total skor tertimbang yang diperoleh adalah ${skor} dari 100. `

  if (prediksi === 'Puas') {
    narasi += `Skor ini menempatkan responden pada kategori Puas (≥ 70). `
  } else if (prediksi === 'Cukup Puas') {
    narasi += `Skor ini menempatkan responden pada kategori Cukup Puas (40–69). `
  } else {
    narasi += `Skor ini menempatkan responden pada kategori Tidak Puas (< 40). `
  }

  narasi += `\n\nDimensi yang paling berkontribusi adalah ${tertinggi.fitur} dengan bobot ${tertinggi.bobot}% dan penilaian ${nilaiLabel(tertinggi.nilai)}, menyumbang ${tertinggi.kontribusi.toFixed(1)} poin ke skor akhir. `

  if (fiturKuat.length === kontribusi.length) {
    narasi += `Seluruh dimensi layanan mendapat penilaian tertinggi (Puas), menunjukkan kepuasan yang menyeluruh. `
  } else if (fiturKuat.length > 0) {
    narasi += `Dimensi yang dinilai baik: ${fiturKuat.map((k) => k.fitur).join(', ')}. `
  }

  if (fiturLemah.length > 0) {
    narasi += `\n\nPerlu mendapat perhatian: dimensi ${fiturLemah.map((k) => k.fitur).join(', ')} mendapat penilaian Tidak Puas. `
    if (fiturLemah.some((k) => k.bobot >= 20)) {
      narasi += `Karena dimensi ini memiliki bobot signifikan (≥ 20%), perbaikan di area ini dapat berdampak besar pada kepuasan keseluruhan. `
    }
  }

  if (prediksi === 'Cukup Puas') {
    narasi += `\n\nUntuk mencapai kategori Puas, dibutuhkan peningkatan skor sebesar ${70 - skor} poin. Fokus pada ${sorted[0].fitur} dan ${sorted[1].fitur} akan memberikan dampak paling efisien karena bobot terbesar. `
  } else if (prediksi === 'Tidak Puas') {
    narasi += `\n\nKondisi ini memerlukan perhatian segera. Prioritas perbaikan sebaiknya dimulai dari ${terendah.fitur} yang mendapat nilai terendah, diikuti dimensi berbobot besar lainnya. `
  }

  return narasi
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await searchParams
  if (!id) notFound()

  const survey = await getSurveyById(id)
  if (!survey) notFound()

  if (session.role !== 'admin') {
    const isOwner = survey.responden
      ?.toLowerCase()
      .includes(`(${session.username.toLowerCase()})`)
    if (!isOwner) redirect('/user/dashboard')
  }

  const ratings = {
    kualitasPengharum:  survey.kualitasPengharum,
    pelayananService:   survey.pelayananService,
    pelayananComplain:  survey.pelayananComplain,
    kualitasAroma:      survey.kualitasAroma,
    kebersihanAlat:     survey.kebersihanAlat,
    ketepatanWaktu:     survey.ketepatanWaktu,
    kecepatanRespon:    survey.kecepatanRespon,
  }

  const { prediksi, probabilitas, skor, kontribusi } = classifySurvey(ratings)
  const sortedKontribusi = [...kontribusi].sort((a, b) => b.kontribusi - a.kontribusi)
  const narasi = buildNarasi(kontribusi, skor, prediksi)

  const circumference  = 2 * Math.PI * 54
  const offset         = circumference - (probabilitas / 100) * circumference
  const prediksiColor  = SATISFACTION_HEX[prediksi as keyof typeof SATISFACTION_HEX] ?? '#185FA5'

  const tanggal = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(survey.createdAt))

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-6 space-y-6">

        {/* ── Navigasi ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <Link
            href={session.role === 'admin' ? '/admin/surveys' : '/user/dashboard'}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          {session.role === 'admin' && (
            <a
              href={`/user/result/print/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Unduh PDF
            </a>
          )}
        </div>

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">
            Laporan Hasil Survey
          </p>
          <h1 className="text-xl font-semibold text-slate-900 mb-4">
            {survey.responden?.split('(')[0].trim()}
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ['Perusahaan', survey.namaPerusahaan || '-'],
              ['Jabatan',    survey.jabatan || '-'],
              ['Bulan',      survey.bulan],
              ['Tanggal',    tanggal],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[11px] text-slate-400 mb-0.5">{label}</p>
                <p className="font-medium text-slate-900 text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Hasil klasifikasi ─────────────────────────────────────── */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-6">Hasil klasifikasi</h2>
          <div className="flex flex-col sm:flex-row items-center gap-8">

            {/* Donut */}
            <div className="flex flex-col items-center flex-shrink-0">
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
                className="mt-4 inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${prediksiColor}18`, color: prediksiColor }}
              >
                {prediksi}
              </span>
            </div>

            {/* Skor + threshold */}
            <div className="flex-1 space-y-4 w-full">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500">Skor tertimbang</span>
                  <span className="text-2xl font-semibold text-slate-900">{skor} / 100</span>
                </div>
                <div className="relative w-full bg-slate-200 rounded-full h-3">
                  {/* Marker threshold 40 */}
                  <div className="absolute top-0 bottom-0 w-px bg-amber-400 opacity-70" style={{ left: '40%' }} />
                  {/* Marker threshold 70 */}
                  <div className="absolute top-0 bottom-0 w-px bg-blue-500 opacity-70" style={{ left: '70%' }} />
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${skor}%`, backgroundColor: prediksiColor }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 px-0.5">
                  <span>0</span>
                  <span className="text-amber-500">40</span>
                  <span className="text-blue-500">70</span>
                  <span>100</span>
                </div>
              </div>

              {/* 3 kotak threshold */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {THRESHOLDS.map((t) => {
                  const active = prediksi === t.prediksi
                  const color  = SATISFACTION_HEX[t.label as keyof typeof SATISFACTION_HEX]
                  return (
                    <div
                      key={t.label}
                      className={`p-2.5 rounded-xl border ${active ? 'border-current' : 'border-slate-100 bg-white'}`}
                      style={active ? { backgroundColor: `${color}12`, borderColor: `${color}40` } : {}}
                    >
                      <p className="font-mono text-[11px] mb-0.5" style={{ color: active ? color : '#94a3b8' }}>
                        {t.range}
                      </p>
                      <p className="font-medium" style={{ color: active ? color : '#94a3b8' }}>
                        {t.label}
                      </p>
                      {active && (
                        <p className="text-[10px] mt-0.5" style={{ color }}>← hasil Anda</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Kontribusi tiap fitur ─────────────────────────────────── */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Kontribusi tiap dimensi ke skor akhir
          </h2>
          <p className="text-sm text-slate-400 mb-5">
            Formula: kontribusi = ((nilai − 1) / 2) × bobot
          </p>

          <div className="space-y-4">
            {sortedKontribusi.map((k, idx) => {
              const pctOfMax = (k.kontribusi / k.bobot) * 100
              const isLemah  = k.nilai === 1
              const isTerkuat = idx === 0
              return (
                <div key={k.fitur} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 w-5">{idx + 1}.</span>
                      <span className="text-sm font-medium text-slate-700">{k.fitur}</span>
                      {isLemah && (
                        <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                          Perlu perhatian
                        </span>
                      )}
                      {isTerkuat && !isLemah && (
                        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                          Terkuat
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-400 text-xs">
                        {((k.nilai - 1) / 2).toFixed(2)} × {k.bobot}
                      </span>
                      <span className="font-semibold text-slate-900 w-10 text-right">
                        {k.kontribusi.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${pctOfMax}%`,
                          backgroundColor: isLemah ? '#E24B4A' : k.nilai === 2 ? '#EF9F27' : '#185FA5',
                        }}
                      />
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${LIKERT_LABEL[k.nilai]?.color}`}>
                      {LIKERT_LABEL[k.nilai]?.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">
                    Bobot: {k.bobot}% &nbsp;·&nbsp;
                    Nilai ternormalisasi: {((k.nilai - 1) / 2).toFixed(2)} &nbsp;·&nbsp;
                    Potensi maksimal: {k.bobot.toFixed(0)} poin
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-5 pt-4 border-t hidden border-slate-100 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Total skor</span>
            <span className="text-xl font-bold text-slate-900">{skor} / 100</span>
          </div>
        </div>

        {/* ── Jawaban per pernyataan ────────────────────────────────── */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Jawaban lengkap per pernyataan
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Bagian B — 1 = Tidak Puas · 2 = Cukup Puas · 3 = Puas
          </p>
          <div className="space-y-6">
            {BAGIAN_B_DETAIL.map((kat) => {
              const featureAvg = (survey as any)[kat.featureKey] as number
              return (
                <div key={kat.nomor}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {kat.nomor}. {kat.judul}
                    </p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${LIKERT_LABEL[featureAvg]?.color ?? 'text-slate-400 bg-slate-50 border-slate-200'}`}>
                      Rata-rata: {featureAvg}/3
                    </span>
                  </div>
                  <div className="space-y-2">
                    {kat.items.map((item, idx) => {
                      const val  = (survey as any)[item.key] as number | null
                      const info = val ? LIKERT_LABEL[val] : null
                      return (
                        <div key={item.key} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                          <span className="text-[11px] text-slate-400 font-mono mt-0.5 w-12 flex-shrink-0">
                            {kat.nomor}.{idx + 1}
                          </span>
                          <p className="text-sm text-slate-600 flex-1 leading-snug">{item.teks}</p>
                          {info ? (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full border flex-shrink-0 ${info.color}`}>
                              {val} — {info.label}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 flex-shrink-0">–</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Bagian C ─────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-5">
            Bagian C — Kesediaan menggunakan layanan
          </h2>
          <div className="space-y-2">
            {[
              { teks: 'Bersedia menggunakan kembali layanan.',              val: survey.akanMenggunakan        },
              { teks: 'Bersedia memperpanjang kontrak layanan.',            val: survey.pelayananDiperpanjang  },
              { teks: 'Bersedia merekomendasikan kepada pihak lain.',       val: survey.bersediaRekomendasikan },
              { teks: 'Tertarik menggunakan layanan lain yang ditawarkan.', val: survey.tertarikLayananLain    },
              { teks: 'Tetap memilih PT Pink Service Indonesia.',           val: survey.tetapMemilih           },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-sm text-slate-600 flex-1">C.{i + 1}. {item.teks}</p>
                <span className={`ml-4 text-sm font-semibold flex-shrink-0 ${
                  item.val === 'Ya' ? 'text-blue-700' : item.val === 'Tidak' ? 'text-red-600' : 'text-slate-400'
                }`}>
                  {item.val || '–'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Narasi penjelasan ─────────────────────────────────────── */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Penjelasan hasil</h2>
          <p className="text-sm text-slate-400 mb-5">
            Analisis otomatis berdasarkan algoritma weighted threshold classifier
          </p>
          <div className="space-y-3">
            {narasi.split('\n\n').filter(Boolean).map((p, i) => (
              <p key={i} className="text-sm text-slate-700 leading-relaxed">{p.trim()}</p>
            ))}
          </div>
          <div className="mt-6 bg-blue-50/60 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 mb-2">Cara membaca hasil ini</p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• <strong>Skor tertimbang</strong> dihitung dari nilai tiap dimensi (1–3) yang dinormalisasi dan dikalikan bobotnya. Total semua bobot = 100.</li>
              <li>• <strong>Skoring</strong>: skor &lt; 40 = Tidak Puas · skor 40–69 = Cukup Puas · skor ≥ 70 = Puas.</li>
              <li>• <strong>Probabilitas</strong> menunjukkan keyakinan klasifikasi — semakin jauh skor dari batas threshold, semakin tinggi probabilitasnya.</li>
              <li>• <strong>Dimensi berbobot besar</strong> (seperti Pelayanan Service 35%) lebih menentukan hasil akhir dibanding dimensi berbobot kecil.</li>
            </ul>
          </div>
        </div>

        {/* ── Saran ─────────────────────────────────────────────────── */}
        {survey.saran && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-3">
              Bagian D — Kritik dan saran
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4">
              {survey.saran}
            </p>
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="flex gap-3 pb-6">
          <Link
            href={session.role === 'admin' ? '/admin/surveys' : '/user'}
            className="flex-1 text-center py-3 rounded-full border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Kembali
          </Link>
          {session.role === 'admin' && (
            <a
              href={`/user/result/print/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Unduh PDF
            </a>
          )}
        </div>

      </div>
    </main>
  )
}