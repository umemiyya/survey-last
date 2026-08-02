import { RandomForestClassifier } from 'ml-random-forest'
import type { SurveyRatings } from '@/lib/classifier'

// 0 = Tidak Puas, 1 = Cukup Puas, 2 = Puas
export const LABEL_MAP = ['Tidak Puas', 'Cukup Puas', 'Puas'] as const

const FEATURE_ORDER: (keyof SurveyRatings)[] = [
  'pelayananService', 'kecepatanRespon', 'kualitasAroma',
  'kualitasPengharum', 'ketepatanWaktu', 'kebersihanAlat', 'pelayananComplain',
]

export function ratingsToFeatureVector(ratings: SurveyRatings): number[] {
  return FEATURE_ORDER.map((key) => ratings[key])
}

export function trainModel(features: number[][], labels: number[], options: { nEstimators?: number; seed?: number } = {}) {
  const classifier = new RandomForestClassifier({
    seed: options.seed ?? 42,
    maxFeatures: 0.8,
    replacement: true,
    nEstimators: options.nEstimators ?? 100,
  })
  classifier.train(features, labels)
  return classifier
}

export function loadModel(json: object) {
  // @ts-ignore
  return RandomForestClassifier.load(json)
}

export function serializeModel(classifier: RandomForestClassifier) {
  return classifier.toJSON()
}

export function predictWithModel(classifier: RandomForestClassifier, ratings: SurveyRatings) {
  const vector = ratingsToFeatureVector(ratings)
  const [labelIndex] = classifier.predict([vector])
  return { prediksi: LABEL_MAP[labelIndex], labelIndex }
}