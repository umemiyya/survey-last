import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username required'),
  password: z.string().min(1, 'Password required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

const likert = (label: string) =>
  // @ts-ignore
  z.number({ required_error: `${label} harus diisi` }).min(1, `${label} harus diisi`).max(3)

export const surveySchema = z.object({
  // Bagian A
  responden:              z.string().min(1, 'Nama responden harus diisi'),
  bulan:                  z.string().min(1, 'Bulan harus dipilih'),
  namaPerusahaan:         z.string().optional(),
  jabatan:                z.string().optional(),
  periodeLayanan:         z.string().optional(),

  // Bagian B — 18 sub-pernyataan individual
  b1_kualitasAroma_1:     likert('B1.1'),
  b1_kualitasAroma_2:     likert('B1.2'),
  b1_kualitasAroma_3:     likert('B1.3'),

  b2_kebersihanAlat_1:    likert('B2.1'),
  b2_kebersihanAlat_2:    likert('B2.2'),
  b2_kebersihanAlat_3:    likert('B2.3'),

  b3_ketepatanWaktu_1:    likert('B3.1'),
  b3_ketepatanWaktu_2:    likert('B3.2'),
  b3_ketepatanWaktu_3:    likert('B3.3'),

  b4_kecepatanRespon_1:   likert('B4.1'),
  b4_kecepatanRespon_2:   likert('B4.2'),
  b4_kecepatanRespon_3:   likert('B4.3'),

  b5_pelayananService_1:  likert('B5.1'),
  b5_pelayananService_2:  likert('B5.2'),
  b5_pelayananService_3:  likert('B5.3'),

  b6_pelayananComplain_1: likert('B6.1'),
  b6_pelayananComplain_2: likert('B6.2'),
  b6_pelayananComplain_3: likert('B6.3'),

  // Bagian C
  akanMenggunakan:        z.string().min(1, 'Pilihan harus dipilih'),
  pelayananDiperpanjang:  z.string().min(1, 'Pilihan harus dipilih'),
  bersediaRekomendasikan: z.string().optional(),
  tertarikLayananLain:    z.string().optional(),
  tetapMemilih:           z.string().optional(),

  // Bagian D
  saran:                  z.string().optional(),
})

export type SurveyFormData = z.infer<typeof surveySchema>