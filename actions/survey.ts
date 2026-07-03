'use server'

import { prisma } from '@/lib/prisma'
import { surveySchema, type SurveyFormData } from '@/lib/schemas'
import { classifySurvey, FEATURE_WEIGHTS } from '@/lib/classifier'
import { SATISFACTION_LEVELS } from '@/lib/satisfaction'

export async function submitSurvey(data: SurveyFormData) {
  const parsed = surveySchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Data tidak valid' }

  const { prediksi, probabilitas } = classifySurvey({
    kualitasPengharum: parsed.data.kualitasPengharum,
    pelayananService: parsed.data.pelayananService,
    pelayananComplain: parsed.data.pelayananComplain,
    kualitasAroma: parsed.data.kualitasAroma,
    kebersihanAlat: parsed.data.kebersihanAlat,
    ketepatanWaktu: parsed.data.ketepatanWaktu,
    kecepatanRespon: parsed.data.kecepatanRespon,
  })

  try {
    const survey = await prisma.survey.create({
      data: {
        responden: parsed.data.responden,
        bulan: parsed.data.bulan,
        kualitasPengharum: parsed.data.kualitasPengharum,
        pelayananService: parsed.data.pelayananService,
        pelayananComplain: parsed.data.pelayananComplain,
        akanMenggunakan: parsed.data.akanMenggunakan,
        pelayananDiperpanjang: parsed.data.pelayananDiperpanjang,
        kualitasAroma: parsed.data.kualitasAroma,
        kebersihanAlat: parsed.data.kebersihanAlat,
        ketepatanWaktu: parsed.data.ketepatanWaktu,
        kecepatanRespon: parsed.data.kecepatanRespon,
        saran: parsed.data.saran || null,
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
    prisma.survey.findMany({
      where: { labelManual: null },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.survey.count({ where: { labelManual: { not: null } } }),
  ])
  return { unlabeled, labeledCount: labeled }
}

export async function setSurveyLabel(id: string, label: string) {
  if (!SATISFACTION_LEVELS.includes(label as any)) {
    return { success: false, error: 'Label tidak valid' }
  }
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
    'pelayananService', 'kecepatanRespon', 'kualitasAroma',
    'kualitasPengharum', 'ketepatanWaktu', 'kebersihanAlat',
    'pelayananComplain', 'label',
  ]

  // label: 0 = Tidak Puas, 1 = Puas, 2 = Sangat Puas
  // @ts-ignore
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
  // @ts-ignore
    acc[level] = surveys.filter((s) => s.prediksi === level).length
    return acc
  }, {} as Record<string, number>)

  const avgOf = (key: keyof typeof FEATURE_WEIGHTS) =>
    total > 0
  // @ts-ignore
      ? Math.round((surveys.reduce((sum, s) => sum + (s[key] as number), 0) / total) * 10) / 10
      : 0

  const featureAverages = (Object.keys(FEATURE_WEIGHTS) as Array<keyof typeof FEATURE_WEIGHTS>).map(
    (key) => ({ key, bobot: FEATURE_WEIGHTS[key], rataRata: avgOf(key) })
  )

  return { total, distribusi, featureWeights: FEATURE_WEIGHTS, featureAverages }
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export async function getSurveyStats() {
  const currentYear = new Date().getFullYear()

  const surveys = await prisma.survey.findMany({
    where: {
      createdAt: {
        gte: new Date(`${currentYear}-01-01T00:00:00Z`),
        lt: new Date(`${currentYear + 1}-01-01T00:00:00Z`),
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const total = surveys.length

  const distribusi = SATISFACTION_LEVELS.reduce((acc, level) => {
  // @ts-ignore

    acc[level] = surveys.filter((s) => s.prediksi === level).length
    return acc
  }, {} as Record<string, number>)

  const monthlyData = MONTHS.map((month) => {
  // @ts-ignore

    const monthSurveys = surveys.filter((s) => s.bulan === month)
    const row: Record<string, number | string> = { name: month.substring(0, 3) }
    for (const level of SATISFACTION_LEVELS) {
  // @ts-ignore

      row[level] = monthSurveys.filter((s) => s.prediksi === level).length
    }
    return row
  })

  const latest = await prisma.survey.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return { total, distribusi, monthlyData, latest, year: currentYear }
}