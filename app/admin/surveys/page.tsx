import { AdminSidebar } from '@/components/admin-sidebar'
import { PageHeader } from '@/components/page-header'
import { SurveysManager } from '@/components/surveys-manager'
import { getAllSurveys } from '@/actions/survey'

export default async function AdminSurveysPage() {
  const surveys = await getAllSurveys()

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="border-b border-slate-100 p-6 bg-white">
          <h1 className="text-lg font-semibold text-slate-900">Data Survey</h1>
        </div>

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <PageHeader
            title="Manajemen survey"
            description="Lihat, cari, unduh laporan, dan kelola semua data survey yang telah dikumpulkan"
          />

          <SurveysManager initialSurveys={surveys} />
        </div>
      </main>
    </div>
  )
}