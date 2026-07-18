import { AdminSidebar } from '@/components/admin-sidebar'
import { PageHeader } from '@/components/page-header'
import { LabelingManager } from '@/components/labeling-manager'
import { getSurveysForLabeling } from '@/actions/survey'

export const dynamic = 'force-dynamic' // ← tambahkan ini

export default async function LabelingPage() {
  const { unlabeled, labeledCount } = await getSurveysForLabeling()

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="border-b border-slate-100 p-6 bg-white">
          <h1 className="text-lg font-semibold text-slate-900">Labeling data</h1>
        </div>

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <PageHeader
            title="Beri label data survey"
            description="Tentukan label kepuasan sebenarnya untuk setiap survey, sebagai data latih model Random Forest"
          />

          <LabelingManager
            initialSurveys={unlabeled}
            initialLabeledCount={labeledCount}
          />
        </div>
      </main>
    </div>
  )
}