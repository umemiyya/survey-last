'use server'

import { prisma } from '@/lib/prisma'
import { surveySchema, type SurveyFormData } from '@/lib/schemas'
import { classifySurvey, FEATURE_WEIGHTS } from '@/lib/classifier'
import { SATISFACTION_LEVELS } from '@/lib/satisfaction'

function avg(...vals: number[]): number {
  return Math.min(3, Math.max(1, Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)))
}

export async function submitSurvey(data: SurveyFormData) {
  const parsed = surveySchema.safeParse(data)
  if (!parsed.success) {
    console.error('Validasi gagal:', parsed.error.flatten())
    return { success: false, error: 'Data tidak valid' }
  }

  const d = parsed.data

  // Hitung rata-rata per kategori untuk classifier
  const kualitasAroma     = avg(d.b1_kualitasAroma_1,     d.b1_kualitasAroma_2,     d.b1_kualitasAroma_3)
  const kebersihanAlat    = avg(d.b2_kebersihanAlat_1,    d.b2_kebersihanAlat_2,    d.b2_kebersihanAlat_3)
  const ketepatanWaktu    = avg(d.b3_ketepatanWaktu_1,    d.b3_ketepatanWaktu_2,    d.b3_ketepatanWaktu_3)
  const kecepatanRespon   = avg(d.b4_kecepatanRespon_1,   d.b4_kecepatanRespon_2,   d.b4_kecepatanRespon_3)
  const pelayananService  = avg(d.b5_pelayananService_1,  d.b5_pelayananService_2,  d.b5_pelayananService_3)
  const pelayananComplain = avg(d.b6_pelayananComplain_1, d.b6_pelayananComplain_2, d.b6_pelayananComplain_3)
  const kualitasPengharum = pelayananService // proxy

  const { prediksi, probabilitas } = classifySurvey({
    kualitasPengharum,
    pelayananService,
    pelayananComplain,
    kualitasAroma,
    kebersihanAlat,
    ketepatanWaktu,
    kecepatanRespon,
  })

  try {
    const survey = await prisma.survey.create({
      data: {
        // Bagian A
        responden:              d.responden,
        bulan:                  d.bulan,
        namaPerusahaan:         d.namaPerusahaan || null,
        jabatan:                d.jabatan || null,
        periodeLayanan:         d.periodeLayanan || null,

        // Bagian B — sub-pernyataan individual
        b1_kualitasAroma_1:     d.b1_kualitasAroma_1,
        b1_kualitasAroma_2:     d.b1_kualitasAroma_2,
        b1_kualitasAroma_3:     d.b1_kualitasAroma_3,
        b2_kebersihanAlat_1:    d.b2_kebersihanAlat_1,
        b2_kebersihanAlat_2:    d.b2_kebersihanAlat_2,
        b2_kebersihanAlat_3:    d.b2_kebersihanAlat_3,
        b3_ketepatanWaktu_1:    d.b3_ketepatanWaktu_1,
        b3_ketepatanWaktu_2:    d.b3_ketepatanWaktu_2,
        b3_ketepatanWaktu_3:    d.b3_ketepatanWaktu_3,
        b4_kecepatanRespon_1:   d.b4_kecepatanRespon_1,
        b4_kecepatanRespon_2:   d.b4_kecepatanRespon_2,
        b4_kecepatanRespon_3:   d.b4_kecepatanRespon_3,
        b5_pelayananService_1:  d.b5_pelayananService_1,
        b5_pelayananService_2:  d.b5_pelayananService_2,
        b5_pelayananService_3:  d.b5_pelayananService_3,
        b6_pelayananComplain_1: d.b6_pelayananComplain_1,
        b6_pelayananComplain_2: d.b6_pelayananComplain_2,
        b6_pelayananComplain_3: d.b6_pelayananComplain_3,

        // Rata-rata per kategori
        kualitasPengharum,
        pelayananService,
        pelayananComplain,
        kualitasAroma,
        kebersihanAlat,
        ketepatanWaktu,
        kecepatanRespon,

        // Bagian C
        akanMenggunakan:        d.akanMenggunakan,
        pelayananDiperpanjang:  d.pelayananDiperpanjang,
        bersediaRekomendasikan: d.bersediaRekomendasikan || null,
        tertarikLayananLain:    d.tertarikLayananLain || null,
        tetapMemilih:           d.tetapMemilih || null,

        // Bagian D
        saran: d.saran || null,

        // Hasil klasifikasi
        prediksi,
        probabilitas,
      },
    })

    return { success: true, id: survey.id }
  } catch (err) {
    console.error('Gagal menyimpan survey:', err)
    return { success: false, error: 'Gagal menyimpan ke database' }
  }
}

export async function getSurveyById(id: string) {
  return prisma.survey.findUnique({ where: { id } })
}

export async function getAllSurveys() {
  return prisma.survey.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function deleteSurvey(id: string) {
  try {
    await prisma.survey.delete({ where: { id } })
    return { success: true }
  } catch (err) {
    console.error('Gagal menghapus survey:', err)
    return { success: false, error: 'Gagal menghapus survey' }
  }
}

export async function getSurveysForLabeling() {
  const [unlabeled, labeled] = await Promise.all([
    prisma.survey.findMany({ where: { labelManual: null }, orderBy: { createdAt: 'desc' } }),
    prisma.survey.count({ where: { labelManual: { not: null } } }),
  ])
  return { unlabeled, labeledCount: labeled }
}

export async function setSurveyLabel(id: string, label: string) {
  if (!SATISFACTION_LEVELS.includes(label as any))
    return { success: false, error: 'Label tidak valid' }
  try {
    await prisma.survey.update({ where: { id }, data: { labelManual: label } })
    return { success: true }
  } catch (err) {
    console.error('Gagal menyimpan label:', err)
    return { success: false, error: 'Gagal menyimpan label' }
  }
}

export async function exportLabeledDataAsCsv() {
  const surveys = await prisma.survey.findMany({
    where: { labelManual: { not: null } },
    orderBy: { createdAt: 'asc' },
  })
  const header = [
    'pelayananService','kecepatanRespon','kualitasAroma',
    'kualitasPengharum','ketepatanWaktu','kebersihanAlat',
    'pelayananComplain','label',
  ]
  const rows = surveys.map((s) => {
    const labelIndex = SATISFACTION_LEVELS.indexOf(s.labelManual as any)
    return [
      s.pelayananService, s.kecepatanRespon, s.kualitasAroma,
      s.kualitasPengharum, s.ketepatanWaktu, s.kebersihanAlat,
      s.pelayananComplain, labelIndex,
    ].join(',')
  })
  return [header.join(','), ...rows].join('\n')
}

export async function getModelStats() {
  const surveys = await prisma.survey.findMany()
  const total = surveys.length
  const distribusi = SATISFACTION_LEVELS.reduce((acc, level) => {
    acc[level] = surveys.filter((s) => s.prediksi === level).length
    return acc
  }, {} as Record<string, number>)
  const avgOf = (key: keyof typeof FEATURE_WEIGHTS) =>
    total > 0
      ? Math.round((surveys.reduce((sum, s) => sum + (s[key] as number), 0) / total) * 10) / 10
      : 0
  const featureAverages = (Object.keys(FEATURE_WEIGHTS) as Array<keyof typeof FEATURE_WEIGHTS>).map(
    (key) => ({ key, bobot: FEATURE_WEIGHTS[key], rataRata: avgOf(key) })
  )
  return { total, distribusi, featureWeights: FEATURE_WEIGHTS, featureAverages }
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export async function getSurveyStats() {
  const currentYear = new Date().getFullYear()
  const surveys = await prisma.survey.findMany({
    where: {
      createdAt: {
        gte: new Date(`${currentYear}-01-01T00:00:00Z`),
        lt:  new Date(`${currentYear + 1}-01-01T00:00:00Z`),
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  const total = surveys.length
  const distribusi = SATISFACTION_LEVELS.reduce((acc, level) => {
    acc[level] = surveys.filter((s) => s.prediksi === level).length
    return acc
  }, {} as Record<string, number>)
  const monthlyData = MONTHS.map((month) => {
    const ms = surveys.filter((s) => s.bulan === month)
    const row: Record<string, number | string> = { name: month.substring(0, 3) }
    for (const level of SATISFACTION_LEVELS) {
      row[level] = ms.filter((s) => s.prediksi === level).length
    }
    return row
  })
  const latest = await prisma.survey.findMany({ orderBy: { createdAt: 'desc' }, take: 20 })
  return { total, distribusi, monthlyData, latest, year: currentYear }
}

// ── Laporan bulanan & tahunan ─────────────────────────────────────────────

export async function getLaporanBulanan(tahun: number, bulan: string) {
  const surveys = await prisma.survey.findMany({
    where: { bulan },
    orderBy: { createdAt: 'desc' },
  })

  const total = surveys.length
  const distribusi = {
    'Puas':       surveys.filter((s) => s.prediksi === 'Puas').length,
    'Cukup Puas': surveys.filter((s) => s.prediksi === 'Cukup Puas').length,
    'Tidak Puas': surveys.filter((s) => s.prediksi === 'Tidak Puas').length,
  }

  const avgRating = (key: string) =>
    total > 0
      ? Math.round((surveys.reduce((sum, s) => sum + ((s as any)[key] as number || 0), 0) / total) * 10) / 10
      : 0

  const rataRata = {
    kualitasAroma:     avgRating('kualitasAroma'),
    kebersihanAlat:    avgRating('kebersihanAlat'),
    ketepatanWaktu:    avgRating('ketepatanWaktu'),
    kecepatanRespon:   avgRating('kecepatanRespon'),
    pelayananService:  avgRating('pelayananService'),
    pelayananComplain: avgRating('pelayananComplain'),
  }

  return { surveys, total, distribusi, rataRata, bulan, tahun }
}

export async function getLaporanTahunan(tahun: number) {
  const surveys = await prisma.survey.findMany({
    where: {
      createdAt: {
        gte: new Date(`${tahun}-01-01T00:00:00Z`),
        lt:  new Date(`${tahun + 1}-01-01T00:00:00Z`),
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const total = surveys.length
  const distribusi = {
    'Puas':       surveys.filter((s) => s.prediksi === 'Puas').length,
    'Cukup Puas': surveys.filter((s) => s.prediksi === 'Cukup Puas').length,
    'Tidak Puas': surveys.filter((s) => s.prediksi === 'Tidak Puas').length,
  }

  const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ]

  const perBulan = MONTHS.map((bulan) => {
    const ms = surveys.filter((s) => s.bulan === bulan)
    return {
      bulan,
      total:       ms.length,
      puas:        ms.filter((s) => s.prediksi === 'Puas').length,
      cukupPuas:   ms.filter((s) => s.prediksi === 'Cukup Puas').length,
      tidakPuas:   ms.filter((s) => s.prediksi === 'Tidak Puas').length,
    }
  })

  const avgRating = (key: string) =>
    total > 0
      ? Math.round((surveys.reduce((sum, s) => sum + ((s as any)[key] as number || 0), 0) / total) * 10) / 10
      : 0

  const rataRata = {
    kualitasAroma:     avgRating('kualitasAroma'),
    kebersihanAlat:    avgRating('kebersihanAlat'),
    ketepatanWaktu:    avgRating('ketepatanWaktu'),
    kecepatanRespon:   avgRating('kecepatanRespon'),
    pelayananService:  avgRating('pelayananService'),
    pelayananComplain: avgRating('pelayananComplain'),
  }

  return { surveys, total, distribusi, rataRata, perBulan, tahun }
}