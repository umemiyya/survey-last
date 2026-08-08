'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { surveySchema, type SurveyFormData } from '@/lib/schemas'
import { submitSurvey } from '@/actions/survey'

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const LIKERT_OPTIONS = [
  { label: 'Pilih penilaian...', value: '' },
  { label: '1 - Tidak Puas',    value: 1  },
  { label: '2 - Cukup Puas',    value: 2  },
  { label: '3 - Puas',          value: 3  },
]

const BAGIAN_B = [
  {
    nomor: 'B1',
    judul: 'Kualitas Aroma',
    fields: [
      { name: 'b1_kualitasAroma_1' as const, teks: 'Aroma pengharum ruangan memberikan kesan yang nyaman.' },
      { name: 'b1_kualitasAroma_2' as const, teks: 'Aroma pengharum sesuai dengan kebutuhan ruangan.' },
      { name: 'b1_kualitasAroma_3' as const, teks: 'Aroma pengharum bertahan sesuai harapan.' },
    ],
  },
  {
    nomor: 'B2',
    judul: 'Ketahanan & Kebersihan Alat',
    fields: [
      { name: 'b2_kebersihanAlat_1' as const, teks: 'Alat pengharum berfungsi dengan baik selama digunakan.' },
      { name: 'b2_kebersihanAlat_2' as const, teks: 'Alat jarang mengalami gangguan atau kerusakan.' },
      { name: 'b2_kebersihanAlat_3' as const, teks: 'Kondisi alat pengharum selalu bersih dan terawat.' },
    ],
  },
  {
    nomor: 'B3',
    judul: 'Ketepatan Waktu Perawatan',
    fields: [
      { name: 'b3_ketepatanWaktu_1' as const, teks: 'Petugas melakukan perawatan sesuai jadwal.' },
      { name: 'b3_ketepatanWaktu_2' as const, teks: 'Penggantian isi pengharum dilakukan tepat waktu.' },
      { name: 'b3_ketepatanWaktu_3' as const, teks: 'Perawatan dilakukan secara rutin dan konsisten.' },
    ],
  },
  {
    nomor: 'B4',
    judul: 'Responsivitas Layanan',
    fields: [
      { name: 'b4_kecepatanRespon_1' as const, teks: 'Petugas merespons keluhan dengan cepat.' },
      { name: 'b4_kecepatanRespon_2' as const, teks: 'Petugas memberikan solusi yang sesuai.' },
      { name: 'b4_kecepatanRespon_3' as const, teks: 'Keluhan pelanggan ditindaklanjuti dengan baik.' },
    ],
  },
  {
    nomor: 'B5',
    judul: 'Kualitas Pengharum & Pelayanan Service',
    fields: [
      { name: 'b5_pelayananService_1' as const, teks: 'Kualitas pengharum sesuai standar yang dijanjikan.' },
      { name: 'b5_pelayananService_2' as const, teks: 'Pelayanan service dilakukan secara profesional.' },
      { name: 'b5_pelayananService_3' as const, teks: 'Petugas bersikap ramah dan membantu.' },
    ],
  },
  {
    nomor: 'B6',
    judul: 'Kepuasan Keseluruhan & Penanganan Keluhan',
    fields: [
      { name: 'b6_pelayananComplain_1' as const, teks: 'Secara keseluruhan saya puas terhadap layanan PT Pink Service Indonesia.' },
      { name: 'b6_pelayananComplain_2' as const, teks: 'Penanganan komplain dilakukan dengan cepat dan tepat.' },
      { name: 'b6_pelayananComplain_3' as const, teks: 'Saya merasa layanan yang diberikan sesuai dengan nilai yang dibayarkan.' },
    ],
  },
]

const BAGIAN_C = [
  { name: 'akanMenggunakan'        as const, teks: 'Saya bersedia menggunakan kembali layanan PT Pink Service Indonesia.', wajib: true },
  { name: 'pelayananDiperpanjang'  as const, teks: 'Saya bersedia memperpanjang kontrak layanan.', wajib: true },
  { name: 'bersediaRekomendasikan' as const, teks: 'Saya bersedia merekomendasikan layanan PT Pink Service Indonesia kepada pihak lain.', wajib: false },
  { name: 'tertarikLayananLain'    as const, teks: 'Saya tertarik menggunakan layanan lain yang ditawarkan perusahaan.', wajib: false },
  { name: 'tetapMemilih'           as const, teks: 'Saya tetap memilih PT Pink Service Indonesia sebagai penyedia layanan hygiene.', wajib: false },
]

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
  hasError,
}: {
  value: number | undefined
  onChange: (val: number) => void
  hasError?: boolean
}) {
  const colorClass =
    value === 1 ? 'border-red-300 text-red-700 bg-red-50'
    : value === 2 ? 'border-amber-300 text-amber-700 bg-amber-50'
    : value === 3 ? 'border-blue-400 text-blue-700 bg-blue-50'
    : hasError ? 'border-red-300 text-slate-400 bg-white'
    : 'border-slate-200 text-slate-400 bg-white'

  return (
    <select
      value={value ?? ''}
      onChange={(e) => { if (e.target.value) onChange(Number(e.target.value)) }}
      className={`w-full px-3 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors ${colorClass}`}
    >
      {LIKERT_OPTIONS.map((opt) => (
        <option key={String(opt.value)} value={opt.value} disabled={opt.value === ''}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export default function SurveyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [periodeLayanan, setPeriodeLayanan] = useState('')
  const [username, setUsername] = useState('')

  // Ambil username dari session custom (bukan Clerk)
  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => { if (d.username) setUsername(d.username) })
      .catch(() => {})
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
  })

  const onSubmit = async (data: SurveyFormData) => {
    setIsSubmitting(true)
    const finalData = {
      ...data,
      periodeLayanan,
      responden: `${data.responden} (${username})`,
    }
    const result = await submitSurvey(finalData)
    setIsSubmitting(false)
    if (!result.success) {
      alert(result.error || 'Terjadi kesalahan saat mengirim survey.')
      return
    }
    router.push(`/report?id=${result.id}`)
    // router.push(`/user/result?id=${result.id}`)
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12">
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
            Halo, {username || 'Pelanggan'}. Berikan penilaian Anda pada setiap pernyataan berikut.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit, () => {
            alert('Mohon lengkapi semua field yang wajib diisi (*)')
          })}
          className="space-y-6"
        >

          {/* ══ A. IDENTITAS ════════════════════════════════════════ */}
          <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5">
            <SectionHeader label="A. Identitas Responden" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Nama Perusahaan</label>
                <input
                  {...register('namaPerusahaan')}
                  type="text"
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
                  {...register('jabatan')}
                  type="text"
                  placeholder="Manajer / Supervisor / ..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Bulan Survey *</label>
                <select
                  {...register('bulan')}
                  defaultValue={months[new Date().getMonth()]}
                  className="w-full px-4 disabled py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
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
                {['< 6 Bulan', '6 Bulan – 1 Tahun', '> 1 Tahun'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setPeriodeLayanan(opt)
                      setValue('periodeLayanan', opt)
                    }}
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

          {/* ══ B. PENILAIAN ════════════════════════════════════════ */}
          <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-8">
            <div>
              <SectionHeader label="B. Penilaian Kepuasan Pelanggan" />
              <p className="text-xs text-slate-400 -mt-3">
                1 = Tidak Puas &nbsp;·&nbsp; 2 = Cukup Puas &nbsp;·&nbsp; 3 = Puas
              </p>
            </div>

            {BAGIAN_B.map((kat) => (
              <div key={kat.nomor}>
                <p className="text-sm font-semibold text-slate-900 mb-3">
                  {kat.nomor}. {kat.judul}
                </p>
                <div className="space-y-3">
                  {kat.fields.map((field, idx) => {
                    const val = watch(field.name) as number | undefined
                    const err = errors[field.name]
                    return (
                      <div key={field.name} className="bg-slate-50 rounded-xl p-3.5">
                        <p className="text-sm text-slate-600 mb-2.5 leading-snug">
                          {kat.nomor}.{idx + 1}. {field.teks}
                        </p>
                        <LikertSelect
                          value={val}
                          onChange={(v) => setValue(field.name, v, { shouldValidate: true })}
                          hasError={!!err}
                        />
                        {err && <p className="text-xs text-red-600 mt-1">Pertanyaan ini harus diisi</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </section>

          {/* ══ C. KESEDIAAN ════════════════════════════════════════ */}
          <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
            <SectionHeader label="C. Kesediaan Menggunakan Layanan" />

            {BAGIAN_C.map((p, i) => {
              const val = watch(p.name)
              const err = errors[p.name]
              return (
                <div key={p.name} className="bg-slate-50 rounded-xl p-3.5">
                  <p className="text-sm text-slate-600 mb-3 leading-snug">
                    C.{i + 1}. {p.teks} {p.wajib && <span className="text-red-500">*</span>}
                  </p>
                  <div className="flex gap-2">
                    {['Ya', 'Tidak'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setValue(p.name, opt, { shouldValidate: p.wajib })}
                        className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                          val === opt
                            ? opt === 'Ya'
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-red-50 border-red-400 text-red-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {err && <p className="text-xs text-red-600 mt-1.5">Pilihan harus dipilih</p>}
                </div>
              )
            })}
          </section>

          {/* ══ D. SARAN ════════════════════════════════════════════ */}
          <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-3">
            <SectionHeader label="D. Kritik dan Saran" /> 
            <textarea
              required
              {...register('saran')}
              placeholder="Tuliskan kritik dan saran Anda"
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
            />
          </section>

          {/* ══ TOMBOL ══════════════════════════════════════════════ */}
          <div className="flex gap-3 pb-8">
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