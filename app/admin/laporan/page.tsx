import { AdminSidebar } from '@/components/admin-sidebar'
import { PageHeader } from '@/components/page-header'
import { LaporanFilter } from '@/components/laporan-filter'

export const dynamic = 'force-dynamic'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const MONTHS_ID: Record<string, string> = {
  January: 'Januari', February: 'Februari', March: 'Maret',
  April: 'April', May: 'Mei', June: 'Juni',
  July: 'Juli', August: 'Agustus', September: 'September',
  October: 'Oktober', November: 'November', December: 'Desember',
}

const currentYear  = new Date().getFullYear()
const tahunOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

export default function LaporanPage() {
  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-slate-100 p-6 bg-white">
          <h1 className="text-lg font-semibold text-slate-900">Laporan</h1>
        </div>

        <div className="p-6 max-w-5xl mx-auto space-y-8">
          <PageHeader
            title="Laporan kepuasan pelanggan"
            description="Pilih jenis laporan yang ingin dicetak atau diunduh"
          />

          <LaporanFilter
            months={MONTHS}
            monthsId={MONTHS_ID}
            tahunOptions={tahunOptions}
            currentYear={currentYear}
          />
        </div>
      </main>
    </div>
  )
}