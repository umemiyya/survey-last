import { AdminSidebar } from '@/components/admin-sidebar'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { getModelStats } from '@/actions/survey'
import { ModelTrainingPanel } from '@/components/model-training-panel'

export const dynamic = 'force-dynamic'

export default async function ClassificationPage() {
  const stats = await getModelStats()

  const dataTraining = 1000 // dataset historis (xlsx) yang dipakai untuk training
  const totalData = stats.total + dataTraining

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-slate-100 p-6 bg-white">
          <h1 className="text-lg font-semibold text-slate-900">Klasifikasi</h1>
        </div>

        <div className="p-6 max-w-7xl mx-auto space-y-8">
          <PageHeader
            title="Model klasifikasi kepuasan"
            description="Ringkasan dataset, training model, bobot fitur, dan hasil klasifikasi"
          />

          {/* ── Section 1: Dataset ───────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Dataset</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Total Data" value={totalData} color="blue" />
              <StatCard title="Data Training" value={dataTraining} color="green" />
              <StatCard title="Data Survey" value={stats.total} color="blue" />
            </div>
          </section>

          {/* ── Section 2-4: penjelasan algoritma → training → hasil ─── */}
          <ModelTrainingPanel
            featureWeights={stats.featureWeights}
            distribusi={stats.distribusi}
            total={stats.total}
          />
        </div>
      </main>
    </div>
  )
}