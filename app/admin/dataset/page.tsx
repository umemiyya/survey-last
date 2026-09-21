import { AdminSidebar } from '@/components/admin-sidebar'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { DatasetTable, type DatasetRow } from '@/components/dataset-table'
import dataset from '@/data/dataset-survei-1000.json'

export const dynamic = 'force-dynamic'

export default function DatasetPage() {
  const rows = dataset as DatasetRow[]

  const total = rows.length
  const puas = rows.filter((r) => r.kelas === 'Puas').length
  const cukupPuas = rows.filter((r) => r.kelas === 'Cukup Puas').length
  const tidakPuas = rows.filter((r) => r.kelas === 'Tidak Puas').length

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="border-b border-slate-100 p-6 bg-white">
          <h1 className="text-lg font-semibold text-slate-900">Dataset</h1>
        </div>

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <PageHeader
            title="Dataset survei kepuasan"
            description="Data historis hasil survei yang menjadi dasar model klasifikasi kepuasan pelanggan"
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Data" value={total} color="blue" />
            <StatCard title="Puas" value={puas} color="green" />
            <StatCard title="Cukup Puas" value={cukupPuas} color="blue" />
            <StatCard title="Tidak Puas" value={tidakPuas} color="red" />
          </div>

          <DatasetTable data={rows} />
        </div>
      </main>
    </div>
  )
}