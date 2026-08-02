export const SATISFACTION_LEVELS = [
  'Tidak Puas',
  'Cukup Puas',
  'Puas',
] as const

export type SatisfactionLevel = (typeof SATISFACTION_LEVELS)[number]

export const SATISFACTION_BADGE_CLASS: Record<SatisfactionLevel, string> = {
  'Tidak Puas': 'bg-red-50 text-red-600',
  'Cukup Puas': 'bg-amber-50 text-amber-600',
  'Puas':       'bg-blue-50 text-blue-700',
}

export const SATISFACTION_HEX: Record<SatisfactionLevel, string> = {
  'Tidak Puas': '#E24B4A',
  'Cukup Puas': '#EF9F27',
  'Puas':       '#185FA5',
}

export function getSatisfactionBadgeClass(value: string | null | undefined): string {
  if (!value || !(value in SATISFACTION_BADGE_CLASS)) {
    return 'bg-slate-100 text-slate-500'
  }
  return SATISFACTION_BADGE_CLASS[value as SatisfactionLevel]
}

export function getSatisfactionHex(value: string | null | undefined): string {
  if (!value || !(value in SATISFACTION_HEX)) {
    return '#94A3B8'
  }
  return SATISFACTION_HEX[value as SatisfactionLevel]
}