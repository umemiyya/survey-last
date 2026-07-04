'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { surveySchema, type SurveyFormData } from '@/lib/schemas'
import { submitSurvey } from '@/actions/survey'
import { useUser } from '@clerk/nextjs'

const months = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
]

// Opsi skala Likert 3 poin — nilai integer 1/2/3
const LIKERT_OPTIONS = [
  { label: 'Tidak Puas', value: 1 },
  { label: 'Puas',       value: 2 },
  { label: 'Sangat Puas', value: 3 },
]

// Komponen Likert radio inline
function LikertInput({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string
  name: string
  value: number
  onChange: (val: number) => void
  error?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground block">{label}</label>
      <div className="flex gap-3">
        {LIKERT_OPTIONS.map((opt) => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                isSelected
                  ? opt.value === 1
                    ? 'bg-red-50 border-red-400 text-red-700'
                    : opt.value === 2
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default function SurveyPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const ratings = {
    kualitasPengharum:  watch('kualitasPengharum'),
    pelayananService:   watch('pelayananService'),
    pelayananComplain:  watch('pelayananComplain'),
    kualitasAroma:      watch('kualitasAroma'),
    kebersihanAlat:     watch('kebersihanAlat'),
    ketepatanWaktu:     watch('ketepatanWaktu'),
    kecepatanRespon:    watch('kecepatanRespon'),
  }

  const onSubmit = async (data: SurveyFormData) => {
    setIsSubmitting(true)

    const finalData = {
      ...data,
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
        <PageHeader
          title={`Halo, ${user?.fullName || ''}`}
          description="Mohon isi form berikut untuk memberikan feedback Anda"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* ── Nama Responden ─────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">
              Nama Responden *
            </label>
            <input
              {...register('responden')}
              type="text"
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
            {errors.responden && (
              <p className="text-sm text-red-600">{errors.responden.message}</p>
            )}
          </div>

          {/* ── Bulan ──────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">
              Bulan *
            </label>
            <select
              {...register('bulan')}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            >
              <option value="">Pilih bulan</option>
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            {errors.bulan && (
              <p className="text-sm text-red-600">{errors.bulan.message}</p>
            )}
          </div>

          {/* ── Divider: Penilaian Layanan ─────────────────── */}
          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
              Penilaian layanan
            </p>

            <div className="space-y-6">
              <LikertInput
                label="Kualitas Pengharum *"
                name="kualitasPengharum"
                value={ratings.kualitasPengharum}
                onChange={(v) => setValue('kualitasPengharum', v, { shouldValidate: true })}
                error={errors.kualitasPengharum?.message}
              />
              <LikertInput
                label="Pelayanan Service *"
                name="pelayananService"
                value={ratings.pelayananService}
                onChange={(v) => setValue('pelayananService', v, { shouldValidate: true })}
                error={errors.pelayananService?.message}
              />
              <LikertInput
                label="Pelayanan Complain *"
                name="pelayananComplain"
                value={ratings.pelayananComplain}
                onChange={(v) => setValue('pelayananComplain', v, { shouldValidate: true })}
                error={errors.pelayananComplain?.message}
              />
              <LikertInput
                label="Kualitas Aroma *"
                name="kualitasAroma"
                value={ratings.kualitasAroma}
                onChange={(v) => setValue('kualitasAroma', v, { shouldValidate: true })}
                error={errors.kualitasAroma?.message}
              />
              <LikertInput
                label="Kebersihan Alat Pengharum *"
                name="kebersihanAlat"
                value={ratings.kebersihanAlat}
                onChange={(v) => setValue('kebersihanAlat', v, { shouldValidate: true })}
                error={errors.kebersihanAlat?.message}
              />
              <LikertInput
                label="Ketepatan Waktu Perawat *"
                name="ketepatanWaktu"
                value={ratings.ketepatanWaktu}
                onChange={(v) => setValue('ketepatanWaktu', v, { shouldValidate: true })}
                error={errors.ketepatanWaktu?.message}
              />
              <LikertInput
                label="Kecepatan Respon Petugas *"
                name="kecepatanRespon"
                value={ratings.kecepatanRespon}
                onChange={(v) => setValue('kecepatanRespon', v, { shouldValidate: true })}
                error={errors.kecepatanRespon?.message}
              />
            </div>
          </div>

          {/* ── Divider: Pertanyaan Ya/Tidak ───────────────── */}
          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
              Pertanyaan lanjutan
            </p>

            <div className="space-y-6">
              {/* Akan Menggunakan */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Akankah menggunakan layanan kami di masa depan? *
                </label>
                <div className="flex gap-3">
                  {['Ya', 'Tidak'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                        watch('akanMenggunakan') === opt
                          ? opt === 'Ya'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-red-50 border-red-400 text-red-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        {...register('akanMenggunakan')}
                        type="radio"
                        value={opt}
                        className="sr-only"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                {errors.akanMenggunakan && (
                  <p className="text-sm text-red-600">{errors.akanMenggunakan.message}</p>
                )}
              </div>

              {/* Pelayanan Diperpanjang */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Apakah pelayanan service dan jasa pengharum masih dapat diperpanjang? *
                </label>
                <div className="flex gap-3">
                  {['Ya', 'Tidak'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                        watch('pelayananDiperpanjang') === opt
                          ? opt === 'Ya'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-red-50 border-red-400 text-red-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        {...register('pelayananDiperpanjang')}
                        type="radio"
                        value={opt}
                        className="sr-only"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                {errors.pelayananDiperpanjang && (
                  <p className="text-sm text-red-600">{errors.pelayananDiperpanjang.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Saran ──────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">
              Saran dan Masukan
            </label>
            <textarea
              {...register('saran')}
              placeholder="Masukkan saran dan masukan Anda (opsional)"
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
            />
          </div>

          {/* ── Buttons ────────────────────────────────────── */}
          <div className="flex gap-3 pt-2">
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