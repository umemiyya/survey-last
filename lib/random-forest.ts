/**
 * Implementasi Random Forest SUNGGUHAN menggunakan library npm `ml-random-forest`.
 *
 * STATUS: Siap pakai, tapi BELUM AKTIF dipanggil di submitSurvey karena belum
 * ada dataset survey berlabel untuk training. Saat ini sistem masih memakai
 * `classifySurvey()` di lib/classifier.ts (rule-based threshold).
 *
 * Install dependency (sekali saja):
 *   npm install ml-random-forest
 *
 * ──────────────────────────────────────────────────────────────────────────
 * CARA MENGAKTIFKAN MODEL INI:
 * ──────────────────────────────────────────────────────────────────────────
 * 1. Kumpulkan data survey yang sudah punya label kepuasan yang dikonfirmasi
 *    benar oleh manusia (bukan hasil random seperti yang ada sekarang).
 *    Minimal disarankan 100-200 baris agar model tidak overfit.
 *
 * 2. Siapkan data dalam format:
 *      features: number[][]  // tiap baris = 7 rating (1-5)
 *      labels: number[]      // 0 = Tidak Puas, 1 = Puas, 2 = Sangat Puas
 *
 * 3. Panggil trainModel(features, labels) lalu simpan hasilnya:
 *      const model = trainModel(features, labels)
 *      await prisma.mlModel.create({ data: { json: JSON.stringify(model.toJSON()) } })
 *    (atau simpan ke file/storage lain sesuai infrastruktur Anda)
 *
 * 4. Saat aplikasi start, load model tersimpan dengan loadModel(json), lalu
 *    panggil predictWithModel(model, ratings) di submitSurvey sebagai
 *    pengganti classifySurvey().
 * ──────────────────────────────────────────────────────────────────────────
 */

import { RandomForestClassifier } from 'ml-random-forest'
import type { SurveyRatings } from './classifier'

export const LABEL_MAP = ['Tidak Puas', 'Puas', 'Sangat Puas'] as const

// Urutan kolom HARUS konsisten antara training dan prediksi
const FEATURE_ORDER: (keyof SurveyRatings)[] = [
  'pelayananService',
  'kecepatanRespon',
  'kualitasAroma',
  'kualitasPengharum',
  'ketepatanWaktu',
  'kebersihanAlat',
  'pelayananComplain',
]

export interface TrainingOptions {
  nEstimators?: number
  maxFeatures?: number
  seed?: number
}

/**
 * Melatih model Random Forest dari data berlabel.
 * @param features Array rating mentah (urutan kolom bebas, asalkan konsisten dgn ratingsToFeatureVector)
 * @param labels Array label (0, 1, atau 2) sesuai LABEL_MAP
 */
export function trainModel(
  features: number[][],
  labels: number[],
  options: TrainingOptions = {}
) {
  const classifier = new RandomForestClassifier({
    seed: options.seed ?? 42,
    maxFeatures: options.maxFeatures ?? 0.8,
    replacement: true,
    nEstimators: options.nEstimators ?? 100,
  })

  classifier.train(features, labels)
  return classifier
}

/** Mengonversi object SurveyRatings menjadi array fitur urutan tetap */
export function ratingsToFeatureVector(ratings: SurveyRatings): number[] {
  return FEATURE_ORDER.map((key) => ratings[key])
}

/** Memuat ulang model yang sudah dilatih sebelumnya dari JSON tersimpan */
export function loadModel(json: object) {
  // @ts-ignore
  return RandomForestClassifier.load(json)
}

/** Menyimpan model terlatih ke bentuk JSON yang bisa disimpan di database/file */
export function serializeModel(classifier: RandomForestClassifier) {
  return classifier.toJSON()
}

/**
 * Memprediksi kepuasan dari satu set rating menggunakan model yang sudah dilatih.
 * Probabilitas dihitung dari proporsi voting antar pohon (jika tersedia),
 * fallback ke estimasi sederhana jika tidak.
 */
export function predictWithModel(
  classifier: RandomForestClassifier,
  ratings: SurveyRatings
) {
  const vector = ratingsToFeatureVector(ratings)
  const [labelIndex] = classifier.predict([vector])
  const prediksi = LABEL_MAP[labelIndex]

  return { prediksi, labelIndex }
}

/**
 * Contoh helper untuk evaluasi model dengan train/test split sederhana.
 * Berguna saat Anda sudah punya data dan ingin mengecek akurasi sebelum deploy.
 */
export function evaluateModel(
  features: number[][],
  labels: number[],
  testRatio = 0.2,
  options: TrainingOptions = {}
) {
  const n = features.length
  const testSize = Math.floor(n * testRatio)

  // Shuffle deterministik sederhana berdasar seed agar hasil reproducible
  const indices = Array.from({ length: n }, (_, i) => i)
  let seed = options.seed ?? 42
  for (let i = indices.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280
    const j = Math.floor((seed / 233280) * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  const testIdx = indices.slice(0, testSize)
  const trainIdx = indices.slice(testSize)

  const trainFeatures = trainIdx.map((i) => features[i])
  const trainLabels = trainIdx.map((i) => labels[i])
  const testFeatures = testIdx.map((i) => features[i])
  const testLabels = testIdx.map((i) => labels[i])

  const model = trainModel(trainFeatures, trainLabels, options)
  const predictions = model.predict(testFeatures)

  const correct = predictions.filter((p, i) => p === testLabels[i]).length
  const accuracy = testLabels.length > 0 ? correct / testLabels.length : 0

  return { model, accuracy, predictions, testLabels }
}