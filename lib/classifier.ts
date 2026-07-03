/**
 * Weighted threshold classifier untuk prediksi kepuasan pelanggan.
 * 3 kelas: Tidak Puas | Puas | Sangat Puas
 */

export interface SurveyRatings {
  kualitasPengharum: number
  pelayananService: number
  pelayananComplain: number
  kualitasAroma: number
  kebersihanAlat: number
  ketepatanWaktu: number
  kecepatanRespon: number
}

export interface ClassificationResult {
  prediksi: 'Tidak Puas' | 'Puas' | 'Sangat Puas'
  probabilitas: number
  skor: number
  kontribusi: { fitur: string; bobot: number; nilai: number; kontribusi: number }[]
}

export const FEATURE_WEIGHTS = {
  pelayananService: 35,
  kecepatanRespon: 22,
  kualitasAroma: 18,
  kualitasPengharum: 10,
  ketepatanWaktu: 8,
  kebersihanAlat: 5,
  pelayananComplain: 2,
} as const

const FEATURE_LABELS: Record<keyof typeof FEATURE_WEIGHTS, string> = {
  pelayananService: 'Pelayanan service',
  kecepatanRespon: 'Kecepatan respon',
  kualitasAroma: 'Kualitas aroma',
  kualitasPengharum: 'Kualitas pengharum',
  ketepatanWaktu: 'Ketepatan waktu',
  kebersihanAlat: 'Kebersihan alat',
  pelayananComplain: 'Pelayanan komplain',
}

export function classifySurvey(ratings: SurveyRatings): ClassificationResult {
  const kontribusi = (Object.keys(FEATURE_WEIGHTS) as Array<keyof typeof FEATURE_WEIGHTS>).map(
    (key) => {
      const bobot = FEATURE_WEIGHTS[key]
      const nilai = ratings[key]
      const kontribusiPoin = ((nilai - 1) / 4) * bobot
      return {
        fitur: FEATURE_LABELS[key],
        bobot,
        nilai,
        kontribusi: Math.round(kontribusiPoin * 10) / 10,
      }
    }
  )

  const skorMentah = kontribusi.reduce((sum, k) => sum + k.kontribusi, 0)
  const skor = Math.round(skorMentah)

  // Threshold: 0-54 = Tidak Puas, 55-79 = Puas, 80-100 = Sangat Puas
  let prediksi: ClassificationResult['prediksi']
  if (skor >= 80) {
    prediksi = 'Sangat Puas'
  } else if (skor >= 55) {
    prediksi = 'Puas'
  } else {
    prediksi = 'Tidak Puas'
  }

  const jarakKeBatas =
    prediksi === 'Sangat Puas'
      ? skor - 80
      : prediksi === 'Puas'
        ? Math.min(skor - 55, 80 - skor)
        : 55 - skor

  const probabilitas = Math.min(99, Math.max(65, 70 + jarakKeBatas))

  return {
    prediksi,
    probabilitas: Math.round(probabilitas),
    skor,
    kontribusi,
  }
}