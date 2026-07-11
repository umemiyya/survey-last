'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { surveySchema, type SurveyFormData } from '@/lib/schemas'
import { submitSurvey } from '@/actions/survey'
import { useUser } from '@clerk/nextjs'

const months = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
]

const LIKERT = [
  { label: 'Tidak Puas', value: 1 },
  { label: 'Cukup Puas', value: 2 },
  { label: 'Puas',       value: 3 },
]

// ── Sub-pernyataan per kategori ──────────────────────────────────────────────
// Tiap kategori punya 3 sub-pernyataan yang dinilai, hasilnya dirata-rata
// menjadi 1 nilai integer (1-3) yang dikirim ke database.

const KATEGORI = [
  {
    key: 'kualitasAroma' as const,
    judul: 'Kualitas Aroma',
    pernyataan: [
      'Aroma pengharum ruangan memberikan kesan yang nyaman.',
      'Aroma pengharum sesuai dengan kebutuhan ruangan.',
      'Aroma pengharum bertahan sesuai harapan.',
    ],
  },
  {
    key: 'kebersihanAlat' as const,
    judul: 'Ketahanan & Kebersihan Alat',
    pernyataan: [
      'Alat pengharum berfungsi dengan baik selama digunakan.',
      'Alat jarang mengalami gangguan atau kerusakan.',
      'Kondisi alat pengharum selalu bersih dan terawat.',
    ],
  },
  {
    key: 'ketepatanWaktu' as const,
    judul: 'Ketepatan Waktu Perawatan',
    pernyataan: [
      'Petugas melakukan perawatan sesuai jadwal.',
      'Penggantian isi pengharum dilakukan tepat waktu.',
      'Perawatan dilakukan secara rutin dan konsisten.',
    ],
  },
  {
    key: 'kecepatanRespon' as const,
    judul: 'Responsivitas Layanan',
    pernyataan: [
      'Petugas merespons keluhan dengan cepat.',
      'Petugas memberikan solusi yang sesuai.',
      'Keluhan pelanggan ditindaklanjuti dengan baik.',
    ],
  },
  {
    key: 'pelayananService' as const,
    judul: 'Kualitas Pengharum & Pelayanan Service',
    pernyataan: [
      'Kualitas pengharum sesuai standar yang dijanjikan.',
      'Pelayanan service dilakukan secara profesional.',
      'Petugas bersikap ramah dan membantu.',
    ],
  },
  {
    key: 'pelayananComplain' as const,
    judul: 'Kepuasan Keseluruhan & Penanganan Keluhan',
    pernyataan: [
      'Secara keseluruhan saya puas terhadap layanan PT Pink Service Indonesia.',
      'Penanganan komplain dilakukan dengan cepat dan tepat.',
      'Saya merasa layanan yang diberikan sesuai dengan nilai yang dibayarkan.',
    ],
  },
]

// 5 pertanyaan Ya/Tidak dari Bagian C kuesioner
// Hanya 2 yang masuk ke DB (akanMenggunakan & pelayananDiperpanjang),
// sisanya hanya ditampilkan di UI tanpa disimpan ke database.
const PERTANYAAN_YN = [
  {
    id: 'akanMenggunakan',
    teks: 'Saya bersedia menggunakan kembali layanan PT Pink Service Indonesia.',
    keDb: true,
  },
  {
    id: 'pelayananDiperpanjang',
    teks: 'Saya bersedia memperpanjang kontrak layanan.',
    keDb: true,
  },
  {
    id: 'rekomendasikan',
    teks: 'Saya bersedia merekomendasikan layanan PT Pink Service Indonesia kepada pihak lain.',
    keDb: false,
  },
  {
    id: 'layananLain',
    teks: 'Saya tertarik menggunakan layanan lain yang ditawarkan perusahaan.',
    keDb: false,
  },
  {
    id: 'tetapMemilih',
    teks: 'Saya tetap memilih PT Pink Service Indonesia sebagai penyedia layanan hygiene.',
    keDb: false,
  },
]

// ── Helper components ────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-5">
      {label}
    </p>
  )
}

function LikertSelect({
  value,
  onChange,
}: {
  value: number | null
  onChange: (val: number) => void
}) {
  const colorClass =
    value === 1
      ? 'border-red-300 text-red-700 bg-red-50'
      : value === 2
        ? 'border-amber-300 text-amber-700 bg-amber-50'
        : value === 3
          ? 'border-blue-400 text-blue-700 bg-blue-50'
          : 'border-slate-200 text-slate-400 bg-white'

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full px-3 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors ${colorClass}`}
    >
      <option value="" disabled>Pilih penilaian...</option>
      {LIKERT.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// Rata-rata 3 nilai Likert, dibulatkan ke integer 1-3
function avgLikert(vals: (number | null)[]): number {
  const valid = vals.filter((v): v is number => v !== null && v > 0)
  if (valid.length === 0) return 0
  return Math.min(3, Math.max(1, Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)))
}

// ── Main component ───────────────────────────────────────────────────────────

export default function SurveyPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State sub-pernyataan: key = `${kategoriKey}_${index}`, value = 1|2|3|null
  const [subRatings, setSubRatings] = useState<Record<string, number | null>>({})

  // State Ya/Tidak untuk semua 5 pertanyaan (termasuk yang tidak ke DB)
  const [ynAnswers, setYnAnswers] = useState<Record<string, string>>({})

  // Identitas tambahan (tidak masuk DB)
  const [namaPerusahaan, setNamaPerusahaan] = useState('')
  const [jabatan, setJabatan] = useState('')
  const [periodeLayanan, setPeriodeLayanan] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      responden: '',
      bulan: '',
      kualitasPengharum: 0,
      pelayananService: 0,
      pelayananComplain: 0,
      akanMenggunakan: '',
      pelayananDiperpanjang: '',
      kualitasAroma: 0,
      kebersihanAlat: 0,
      ketepatanWaktu: 0,
      kecepatanRespon: 0,
      saran: '',
    },
  })

  const setSubRating = (key: string, idx: number, val: number) => {
    const fieldKey = `${key}_${idx}`
    setSubRatings((prev) => {
      const next = { ...prev, [fieldKey]: val }
      // Hitung rata-rata 3 sub-pernyataan kategori ini → set ke form
      const vals = [0, 1, 2].map((i) => next[`${key}_${i}`] ?? null)
      const avg = avgLikert(vals)
      if (avg > 0) setValue(key as any, avg, { shouldValidate: true })
      return next
    })
  }

  const onSubmit = async (data: SurveyFormData) => {
    setIsSubmitting(true)

    // kualitasPengharum = rata-rata dari pelayananService (keduanya tidak punya
    // kategori terpisah di kuesioner baru, mapping ke field DB yang tersedia)
    const finalData = {
      ...data,
      kualitasPengharum: data.pelayananService, // proxy
      akanMenggunakan: ynAnswers['akanMenggunakan'] || '',
      pelayananDiperpanjang: ynAnswers['pelayananDiperpanjang'] || '',
      responden: `${data.responden} - ${
        user?.fullName ?? user?.emailAddresses[0].emailAddress ?? ''
      }`,
    }

    const result = await submitSurvey(finalData)
    setIsSubmitting(false)

    if (!result.success) {
      alert(result.error || 'Terjadi kesalahan saat mengirim survey.')
      return
    }

    router.push(`/user/result?id=${result.id}`)
  }

  if (!isLoaded) return <p>Loading...</p>

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-2xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
            PT Pink Service Indonesia
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 mb-1">
            Kuesioner Kepuasan Pelanggan
          </h1>
          <p className="text-sm text-slate-400">
            Halo, {user?.fullName || ''}. Berikan tanda pilihan pada setiap pernyataan berikut.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

          {/* ══ A. IDENTITAS RESPONDEN ═══════════════════════════════════ */}
          <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5">
            <SectionHeader label="A. Identitas Responden" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Nama Perusahaan</label>
                <input
                  type="text"
                  value={namaPerusahaan}
                  onChange={(e) => setNamaPerusahaan(e.target.value)}
                  placeholder="PT / CV ..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Nama Responden *</label>
                <input
                  {...register('responden')}
                  type="text"
                  placeholder="Nama lengkap"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
                {errors.responden && <p className="text-xs text-red-600">{errors.responden.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Jabatan</label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Manajer / Supervisor / ..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Bulan Survey *</label>
                <select
                  {...register('bulan')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                >
                  <option value="">Pilih bulan</option>
                  {months.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.bulan && <p className="text-xs text-red-600">{errors.bulan.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 block">Periode Menggunakan Layanan</label>
              <div className="flex flex-wrap gap-2">
                {['<6 Bulan', '6 Bulan – 1 Tahun', '>1 Tahun'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPeriodeLayanan(opt)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      periodeLayanan === opt
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ══ B. PENILAIAN KEPUASAN ════════════════════════════════════ */}
          <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-8">
            <div>
              <SectionHeader label="B. Penilaian Kepuasan Pelanggan" />
              <p className="text-xs text-slate-400 -mt-3 mb-0">
                Skala: 1 = Tidak Puas &nbsp;·&nbsp; 2 = Cukup Puas &nbsp;·&nbsp; 3 = Puas
              </p>
            </div>

            {KATEGORI.map((kat) => {
              const fieldError = errors[kat.key]
              return (
                <div key={kat.key}>
                  <p className="text-sm font-semibold text-slate-900 mb-3">{kat.judul}</p>
                  <div className="space-y-3">
                    {kat.pernyataan.map((teks, idx) => {
                      const currentVal = subRatings[`${kat.key}_${idx}`] ?? null
                      return (
                        <div key={idx} className="bg-slate-50/60 rounded-xl p-3.5">
                          <p className="text-sm text-slate-600 mb-2.5 leading-snug">{idx + 1}. {teks}</p>
                          <LikertSelect
                            value={currentVal}
                            onChange={(val) => setSubRating(kat.key, idx, val)}
                          />
                        </div>
                      )
                    })}
                  </div>
                  {fieldError && (
                    <p className="text-xs text-red-600 mt-2">
                      Semua pernyataan di bagian ini harus diisi
                    </p>
                  )}
                </div>
              )
            })}
          </section>

          {/* ══ C. KESEDIAAN MENGGUNAKAN LAYANAN ════════════════════════ */}
          <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
            <SectionHeader label="C. Kesediaan Menggunakan Layanan" />

            {PERTANYAAN_YN.map((p, i) => (
              <div key={p.id} className="bg-slate-50/60 rounded-xl p-3.5">
                <p className="text-sm text-slate-600 mb-3 leading-snug">{i + 1}. {p.teks}</p>
                <div className="flex gap-2">
                  {['Ya', 'Tidak'].map((opt) => {
                    const isSelected = ynAnswers[p.id] === opt
                    const activeClass = opt === 'Ya'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-red-50 border-red-400 text-red-700'
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setYnAnswers((prev) => ({ ...prev, [p.id]: opt }))}
                        className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                          isSelected ? activeClass : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
                {p.keDb && errors[p.id as keyof SurveyFormData] && (
                  <p className="text-xs text-red-600 mt-1.5">Pilihan harus dipilih</p>
                )}
              </div>
            ))}
          </section>

          {/* ══ D. KRITIK DAN SARAN ══════════════════════════════════════ */}
          <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-3">
            <SectionHeader label="D. Kritik dan Saran" />
            <textarea
              {...register('saran')}
              placeholder="Tuliskan kritik dan saran Anda untuk PT Pink Service Indonesia (opsional)"
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
            />
          </section>

          {/* ══ TOMBOL ═══════════════════════════════════════════════════ */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 rounded-full border-slate-200"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Survey'}
            </Button>
          </div>

        </form>
      </div>
    </main>
  )
}