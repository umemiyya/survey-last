/**
 * Weighted threshold classifier — skala Likert 3 poin
 * 1=Tidak Puas, 2=Cukup Puas, 3=Puas
 *
 * Kategori hasil:
 * Skor ≥ 70 → Puas
 * Skor 40-69 → Cukup Puas
 * Skor < 40  → Tidak Puas
 */

export interface SurveyRatings {
  kualitasPengharum: number
  pelayananService:  number
  pelayananComplain: number
  kualitasAroma:     number
  kebersihanAlat:    number
  ketepatanWaktu:    number
  kecepatanRespon:   number
}

export interface ClassificationResult {
  prediksi:    'Tidak Puas' | 'Cukup Puas' | 'Puas'
  probabilitas: number
  skor:         number
  kontribusi:  { fitur: string; bobot: number; nilai: number; kontribusi: number }[]
}

export const FEATURE_WEIGHTS = {
  pelayananService:  35,
  kecepatanRespon:   22,
  kualitasAroma:     18,
  kualitasPengharum: 10,
  ketepatanWaktu:     8,
  kebersihanAlat:     5,
  pelayananComplain:  2,
} as const

const FEATURE_LABELS: Record<keyof typeof FEATURE_WEIGHTS, string> = {
  pelayananService:  'Pelayanan service',
  kecepatanRespon:   'Kecepatan respon',
  kualitasAroma:     'Kualitas aroma',
  kualitasPengharum: 'Kualitas pengharum',
  ketepatanWaktu:    'Ketepatan waktu',
  kebersihanAlat:    'Kebersihan alat',
  pelayananComplain: 'Pelayanan komplain',
}

export function classifySurvey(ratings: SurveyRatings): ClassificationResult {
  const kontribusi = (Object.keys(FEATURE_WEIGHTS) as Array<keyof typeof FEATURE_WEIGHTS>).map(
    (key) => {
      const bobot = FEATURE_WEIGHTS[key]
      const nilai = ratings[key]
      const kontribusiPoin = ((nilai - 1) / 2) * bobot
      return {
        fitur: FEATURE_LABELS[key],
        bobot,
        nilai,
        kontribusi: Math.round(kontribusiPoin * 10) / 10,
      }
    }
  )

  const skor = Math.round(kontribusi.reduce((sum, k) => sum + k.kontribusi, 0))

  let prediksi: ClassificationResult['prediksi']
  if (skor >= 70) {
    prediksi = 'Puas'
  } else if (skor >= 40) {
    prediksi = 'Cukup Puas'
  } else {
    prediksi = 'Tidak Puas'
  }

  const jarakKeBatas =
    prediksi === 'Puas'
      ? skor - 70
      : prediksi === 'Cukup Puas'
        ? Math.min(skor - 40, 70 - skor)
        : 40 - skor

  const probabilitas = Math.min(99, Math.max(65, 70 + jarakKeBatas))

  return { prediksi, probabilitas: Math.round(probabilitas), skor, kontribusi }
}