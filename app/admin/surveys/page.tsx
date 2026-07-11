import { AdminSidebar } from '@/components/admin-sidebar'
import { PageHeader } from '@/components/page-header'
import { SurveysManager } from '@/components/surveys-manager'
import { getAllSurveys } from '@/actions/survey'

// FIX: prisma.findMany() di getAllSurveys() bukan panggilan fetch(), jadi
// Next.js App Router tidak otomatis menandai halaman ini sebagai dynamic.
// Tanpa baris ini, halaman bisa di-cache secara statis (Full Route Cache)
// sehingga survey yang baru dihapus/ditambah tidak langsung terlihat di
// sini walau sudah berubah di database — harus di-redeploy dulu baru
// ke-refresh. force-dynamic memastikan data selalu diambil ulang tiap request.
export const dynamic = 'force-dynamic'

export default async function SurveysPage() {
  const surveys = await getAllSurveys()

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="border-b border-slate-100 p-6 bg-white">
          <h1 className="text-lg font-semibold text-slate-900">Survey</h1>
        </div>

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <PageHeader
            title="Manajemen survey"
            description="Lihat dan kelola semua data survey yang telah dikumpulkan"
          />

          <SurveysManager initialSurveys={surveys} />
        </div>
      </main>
    </div>
  )
}