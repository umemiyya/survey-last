import { getLaporanBulanan, getLaporanTahunan } from '@/actions/survey'
import { SATISFACTION_HEX } from '@/lib/satisfaction'
import { PrintActions } from '@/components/print-actions'

export const dynamic = 'force-dynamic'

const MONTHS_ID: Record<string, string> = {
  January: 'Januari', February: 'Februari', March: 'Maret',
  April: 'April', May: 'Mei', June: 'Juni',
  July: 'Juli', August: 'Agustus', September: 'September',
  October: 'Oktober', November: 'November', December: 'Desember',
}

const FEATURE_LABELS: Record<string, string> = {
  kualitasAroma:     'Kualitas Aroma',
  kebersihanAlat:    'Kebersihan Alat',
  ketepatanWaktu:    'Ketepatan Waktu',
  kecepatanRespon:   'Kecepatan Respon',
  pelayananService:  'Pelayanan Service',
  pelayananComplain: 'Pelayanan Komplain',
}

export default async function PrintLaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string; bulan?: string; tahun?: string }>
}) {
  const params = await searchParams
  const jenis  = params.jenis ?? 'bulanan'
  const tahun  = Number(params.tahun ?? new Date().getFullYear())
  const bulan  = params.bulan ?? 'January'

  const data = jenis === 'tahunan'
    ? await getLaporanTahunan(tahun)
    : await getLaporanBulanan(tahun, bulan)

  const judulLaporan = jenis === 'tahunan'
    ? `Laporan Tahunan ${tahun}`
    : `Laporan Bulanan ${MONTHS_ID[bulan]} ${tahun}`

  const tanggalCetak = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())

  const pctPuas      = data.total > 0 ? Math.round((data.distribusi['Puas'] / data.total) * 100) : 0
  const pctCukupPuas = data.total > 0 ? Math.round((data.distribusi['Cukup Puas'] / data.total) * 100) : 0
  const pctTidakPuas = data.total > 0 ? Math.round((data.distribusi['Tidak Puas'] / data.total) * 100) : 0

  return (
    <>
      <style>{`
        @page { size: A4; margin: 18mm; }
        @media print { .no-print { display: none !important; } }
        body { font-family: 'Times New Roman', serif; color: #000; background: white; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #e2e8f0; padding: 6px 10px; font-size: 12px; }
        thead th { background: #f8fafc; font-weight: 600; }
      `}</style>

      <PrintActions />

      <div className="max-w-3xl mx-auto p-8 text-[13px]">

        {/* Kop surat */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wide">PT Pink Service Indonesia</h1>
          <h2 className="text-base font-semibold mt-1">{judulLaporan}</h2>
          <p className="text-sm text-gray-600 mt-1">Dicetak pada: {tanggalCetak}</p>
        </div>

        {/* Statistik ringkasan */}
        <section className="mb-6">
          <h3 className="font-bold text-sm border-b border-gray-300 pb-1 mb-3">A. Statistik Ringkasan</h3>
          <table>
            <tbody>
              <tr>
                <td className="font-medium w-48">Total Survey</td>
                <td className="font-bold text-center w-16">{data.total}</td>
                <td className="text-gray-500">responden</td>
              </tr>
              <tr>
                <td className="font-medium">Puas</td>
                <td className="font-bold text-center" style={{ color: SATISFACTION_HEX['Puas'] }}>
                  {data.distribusi['Puas']}
                </td>
                <td className="text-gray-500">{pctPuas}% dari total</td>
              </tr>
              <tr>
                <td className="font-medium">Cukup Puas</td>
                <td className="font-bold text-center" style={{ color: SATISFACTION_HEX['Cukup Puas'] }}>
                  {data.distribusi['Cukup Puas']}
                </td>
                <td className="text-gray-500">{pctCukupPuas}% dari total</td>
              </tr>
              <tr>
                <td className="font-medium">Tidak Puas</td>
                <td className="font-bold text-center" style={{ color: SATISFACTION_HEX['Tidak Puas'] }}>
                  {data.distribusi['Tidak Puas']}
                </td>
                <td className="text-gray-500">{pctTidakPuas}% dari total</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Rata-rata rating */}
        <section className="mb-6">
          <h3 className="font-bold text-sm border-b border-gray-300 pb-1 mb-3">
            B. Rata-rata Rating Per Dimensi (Skala 1–3)
          </h3>
          <table>
            <thead>
              <tr>
                <th className="text-left">Dimensi Layanan</th>
                <th className="text-center w-24">Rata-rata</th>
                <th className="text-center w-28">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.rataRata).map(([key, val]) => (
                <tr key={key}>
                  <td>{FEATURE_LABELS[key]}</td>
                  <td className="text-center font-semibold">{val > 0 ? val.toFixed(1) : '–'}</td>
                  <td className="text-center text-xs">
                    {val >= 2.5 ? 'Baik' : val >= 1.5 ? 'Cukup' : val > 0 ? 'Perlu Perhatian' : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Tren per bulan — hanya laporan tahunan */}
        {'perBulan' in data && (
          <section className="mb-6">
            <h3 className="font-bold text-sm border-b border-gray-300 pb-1 mb-3">
              C. Tren Survey Per Bulan
            </h3>
            <table>
              <thead>
                <tr>
                  <th className="text-left">Bulan</th>
                  <th className="text-center">Total</th>
                  <th className="text-center">Puas</th>
                  <th className="text-center">Cukup Puas</th>
                  <th className="text-center">Tidak Puas</th>
                </tr>
              </thead>
              <tbody>
                {(data as any).perBulan.map((row: any) => (
                  <tr key={row.bulan}>
                    <td>{MONTHS_ID[row.bulan]}</td>
                    <td className="text-center font-semibold">{row.total}</td>
                    <td className="text-center" style={{ color: row.puas > 0 ? SATISFACTION_HEX['Puas'] : '#94a3b8' }}>
                      {row.puas}
                    </td>
                    <td className="text-center" style={{ color: row.cukupPuas > 0 ? SATISFACTION_HEX['Cukup Puas'] : '#94a3b8' }}>
                      {row.cukupPuas}
                    </td>
                    <td className="text-center" style={{ color: row.tidakPuas > 0 ? SATISFACTION_HEX['Tidak Puas'] : '#94a3b8' }}>
                      {row.tidakPuas}
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <td className="font-bold">Total</td>
                  <td className="text-center font-bold">{data.total}</td>
                  <td className="text-center font-bold">{data.distribusi['Puas']}</td>
                  <td className="text-center font-bold">{data.distribusi['Cukup Puas']}</td>
                  <td className="text-center font-bold">{data.distribusi['Tidak Puas']}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* Daftar survey */}
        <section className="mb-8">
          <h3 className="font-bold text-sm border-b border-gray-300 pb-1 mb-3">
            {('perBulan' in data) ? 'D' : 'C'}. Daftar Responden Survey
          </h3>
          {data.total === 0 ? (
            <p className="text-gray-400 italic text-center py-4">Tidak ada data survey pada periode ini.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th className="text-center w-8">No</th>
                  <th className="text-left">Nama Responden</th>
                  <th className="text-left">Perusahaan</th>
                  <th className="text-center">Bulan</th>
                  <th className="text-center">Pelayanan</th>
                  <th className="text-center">Aroma</th>
                  <th className="text-center">Respon</th>
                  <th className="text-center">Hasil</th>
                </tr>
              </thead>
              <tbody>
                {data.surveys.map((s, i) => (
                  <tr key={s.id}>
                    <td className="text-center text-gray-400">{i + 1}</td>
                    <td>{s.responden?.split('(')[0].trim()}</td>
                    <td>{s.namaPerusahaan || '–'}</td>
                    <td className="text-center">{MONTHS_ID[s.bulan] ?? s.bulan}</td>
                    <td className="text-center">{s.pelayananService}/3</td>
                    <td className="text-center">{s.kualitasAroma}/3</td>
                    <td className="text-center">{s.kecepatanRespon}/3</td>
                    <td className="text-center font-semibold text-xs"
                      style={{ color: SATISFACTION_HEX[s.prediksi as keyof typeof SATISFACTION_HEX] ?? '#94a3b8' }}>
                      {s.prediksi ?? '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Tanda tangan */}
        <div className="flex justify-between mt-12 text-[13px]">
          <div className="text-center">
            <p className="mb-16">Dibuat oleh,</p>
            <p className="border-t border-black pt-1 px-8">Admin</p>
          </div>
          <div className="text-center">
            <p className="mb-16">Mengetahui,</p>
            <p className="border-t border-black pt-1 px-8">( __________________ )</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 mt-8 pt-4 text-center text-[11px] text-gray-400">
          PT Pink Service Indonesia &nbsp;·&nbsp; {judulLaporan} &nbsp;·&nbsp; Dicetak: {tanggalCetak}
        </div>

      </div>
    </>
  )
}