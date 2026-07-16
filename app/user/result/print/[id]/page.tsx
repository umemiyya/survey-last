import { getSurveyById } from "@/actions/survey"
import { notFound } from "next/navigation"
import { PrintActions } from "@/components/print-actions"

const LIKERT_LABEL: Record<number, string> = {
  1: 'Tidak Puas',
  2: 'Cukup Puas',
  3: 'Puas',
}

const BAGIAN_B_PRINT = [
  {
    nomor: 'B1', judul: 'Kualitas Aroma',
    items: [
      { label: 'B1.1. Aroma pengharum memberikan kesan nyaman.',        key: 'b1_kualitasAroma_1'     },
      { label: 'B1.2. Aroma pengharum sesuai kebutuhan ruangan.',       key: 'b1_kualitasAroma_2'     },
      { label: 'B1.3. Aroma pengharum bertahan sesuai harapan.',        key: 'b1_kualitasAroma_3'     },
    ],
  },
  {
    nomor: 'B2', judul: 'Ketahanan & Kebersihan Alat',
    items: [
      { label: 'B2.1. Alat pengharum berfungsi dengan baik.',           key: 'b2_kebersihanAlat_1'    },
      { label: 'B2.2. Alat jarang mengalami gangguan atau kerusakan.',  key: 'b2_kebersihanAlat_2'    },
      { label: 'B2.3. Kondisi alat pengharum selalu bersih dan terawat.', key: 'b2_kebersihanAlat_3'  },
    ],
  },
  {
    nomor: 'B3', judul: 'Ketepatan Waktu Perawatan',
    items: [
      { label: 'B3.1. Petugas melakukan perawatan sesuai jadwal.',      key: 'b3_ketepatanWaktu_1'    },
      { label: 'B3.2. Penggantian isi pengharum dilakukan tepat waktu.',key: 'b3_ketepatanWaktu_2'    },
      { label: 'B3.3. Perawatan dilakukan secara rutin dan konsisten.', key: 'b3_ketepatanWaktu_3'    },
    ],
  },
  {
    nomor: 'B4', judul: 'Responsivitas Layanan',
    items: [
      { label: 'B4.1. Petugas merespons keluhan dengan cepat.',         key: 'b4_kecepatanRespon_1'   },
      { label: 'B4.2. Petugas memberikan solusi yang sesuai.',          key: 'b4_kecepatanRespon_2'   },
      { label: 'B4.3. Keluhan ditindaklanjuti dengan baik.',            key: 'b4_kecepatanRespon_3'   },
    ],
  },
  {
    nomor: 'B5', judul: 'Kualitas Pengharum & Pelayanan Service',
    items: [
      { label: 'B5.1. Kualitas pengharum sesuai standar yang dijanjikan.', key: 'b5_pelayananService_1' },
      { label: 'B5.2. Pelayanan service dilakukan secara profesional.',     key: 'b5_pelayananService_2' },
      { label: 'B5.3. Petugas bersikap ramah dan membantu.',               key: 'b5_pelayananService_3' },
    ],
  },
  {
    nomor: 'B6', judul: 'Kepuasan Keseluruhan & Penanganan Keluhan',
    items: [
      { label: 'B6.1. Secara keseluruhan saya puas terhadap layanan.',     key: 'b6_pelayananComplain_1' },
      { label: 'B6.2. Penanganan komplain dilakukan dengan cepat dan tepat.', key: 'b6_pelayananComplain_2' },
      { label: 'B6.3. Layanan sesuai dengan nilai yang dibayarkan.',        key: 'b6_pelayananComplain_3' },
    ],
  },
]

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const survey = await getSurveyById(id)
  if (!survey) notFound()

  const tanggal = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(survey.createdAt))

  return (
    <>
      <style>{`
        @page { size: A4; margin: 20mm; }
        @media print { .no-print { display: none !important; } }
        body { font-family: 'Times New Roman', serif; color: #000; }
      `}</style>

      <PrintActions />

      <div className="max-w-2xl mx-auto p-8 text-[13px] leading-relaxed">

        {/* Kop laporan */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-lg font-bold uppercase tracking-wide">PT Pink Service Indonesia</h1>
          <h2 className="text-base font-semibold mt-1">Laporan Hasil Survey Kepuasan Pelanggan</h2>
          <p className="text-sm text-gray-600 mt-1">Tanggal: {tanggal} &nbsp;|&nbsp; Bulan Survey: {survey.bulan}</p>
        </div>

        {/* A. Identitas */}
        <section className="mb-6">
          <h3 className="font-bold text-sm border-b border-gray-300 pb-1 mb-3">A. Identitas Responden</h3>
          <table className="w-full text-[13px]">
            <tbody>
              {[
                ['Nama Responden',            survey.responden.split(' - ')[0]],
                ['Nama Perusahaan',           survey.namaPerusahaan || '-'],
                ['Jabatan',                   survey.jabatan || '-'],
                ['Periode Menggunakan Layanan', survey.periodeLayanan || '-'],
                ['Bulan Survey',              survey.bulan],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className="py-0.5 w-56">{label}</td>
                  <td className="py-0.5 w-4">:</td>
                  <td className="py-0.5 font-medium">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* B. Penilaian */}
        <section className="mb-6">
          <h3 className="font-bold text-sm border-b border-gray-300 pb-1 mb-3">
            B. Penilaian Kepuasan Pelanggan
            <span className="text-[11px] font-normal text-gray-500 ml-2">(1=Tidak Puas, 2=Cukup Puas, 3=Puas)</span>
          </h3>

          {BAGIAN_B_PRINT.map((kat) => (
            <div key={kat.nomor} className="mb-4">
              <p className="font-semibold mb-1.5">{kat.nomor}. {kat.judul}</p>
              <table className="w-full text-[13px] border border-gray-200 rounded">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-1 px-2 font-medium text-gray-600 border-b border-gray-200">Pernyataan</th>
                    <th className="text-center py-1 px-2 font-medium text-gray-600 border-b border-gray-200 w-28">Nilai</th>
                    <th className="text-left py-1 px-2 font-medium text-gray-600 border-b border-gray-200 w-32">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {kat.items.map((item, idx) => {
                    const raw = (survey as any)[item.key] as number | null
                    return (
                      <tr key={item.key} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                        <td className="py-1.5 px-2 border-b border-gray-100">{item.label}</td>
                        <td className="py-1.5 px-2 text-center border-b border-gray-100 font-semibold">{raw ?? '-'}</td>
                        <td className="py-1.5 px-2 border-b border-gray-100">{raw ? LIKERT_LABEL[raw] : '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </section>

        {/* C. Kesediaan */}
        <section className="mb-6">
          <h3 className="font-bold text-sm border-b border-gray-300 pb-1 mb-3">C. Kesediaan Menggunakan Layanan</h3>
          <table className="w-full text-[13px] border border-gray-200 rounded">
            <tbody>
              {[
                { teks: 'C.1. Bersedia menggunakan kembali layanan PT Pink Service Indonesia.', val: survey.akanMenggunakan },
                { teks: 'C.2. Bersedia memperpanjang kontrak layanan.', val: survey.pelayananDiperpanjang },
                { teks: 'C.3. Bersedia merekomendasikan kepada pihak lain.', val: survey.bersediaRekomendasikan },
                { teks: 'C.4. Tertarik menggunakan layanan lain yang ditawarkan.', val: survey.tertarikLayananLain },
                { teks: 'C.5. Tetap memilih PT Pink Service Indonesia sebagai penyedia layanan hygiene.', val: survey.tetapMemilih },
              ].map((item, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                  <td className="py-1.5 px-2 border-b border-gray-100">{item.teks}</td>
                  <td className="py-1.5 px-2 text-center border-b border-gray-100 font-semibold w-16">{item.val || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* D. Saran */}
        <section className="mb-8">
          <h3 className="font-bold text-sm border-b border-gray-300 pb-1 mb-3">D. Kritik dan Saran</h3>
          <div className="border border-gray-200 rounded p-3 min-h-[60px] text-[13px] text-gray-700">
            {survey.saran || <span className="text-gray-400 italic">Tidak ada saran yang diberikan.</span>}
          </div>
        </section>

        {/* Hasil Klasifikasi */}
        <section className="border-2 border-blue-600 rounded-lg p-5 mb-8">
          <h3 className="font-bold text-sm text-blue-700 mb-4 text-center uppercase tracking-wide">
            Hasil Klasifikasi Kepuasan
          </h3>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Klasifikasi</p>
              <p className="text-2xl font-bold text-blue-700">{survey.prediksi}</p>
            </div>
            <div className="border-l border-gray-200" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Probabilitas</p>
              <p className="text-2xl font-bold text-blue-700">{survey.probabilitas}%</p>
            </div>
            <div className="border-l border-gray-200" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Metode</p>
              <p className="text-base font-semibold text-gray-700">Weighted<br/>Threshold</p>
            </div>
          </div>
        </section>

        {/* Tanda tangan */}
        <div className="flex justify-between mt-12 text-[13px]">
          <div className="text-center">
            <p className="mb-16">Responden,</p>
            <p className="border-t border-black pt-1 px-6">{survey.responden.split(' - ')[0]}</p>
          </div>
          <div className="text-center">
            <p className="mb-16">Petugas PT Pink Service,</p>
            <p className="border-t border-black pt-1 px-6">( __________________ )</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 mt-8 pt-4 text-center text-[11px] text-gray-400">
          PT Pink Service Indonesia &nbsp;·&nbsp; Laporan ini digenerate otomatis oleh sistem &nbsp;·&nbsp; {tanggal}
        </div>
      </div>
    </>
  )
}