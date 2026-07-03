import { AdminSidebar } from '@/components/admin-sidebar'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { ChartCard } from '@/components/chart-card'
import { SatisfactionPieChart } from '@/components/satisfaction-pie-chart'
import { MonthlyBarChart } from '@/components/monthly-bar-chart'
import { AdminSurveyTable } from '@/components/admin-survey-table'
import { Bell } from 'lucide-react'
import { getSurveyStats } from '@/actions/survey'

export default async function AdminDashboard() {
  const stats = await getSurveyStats()

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-slate-100 p-6 flex items-center justify-between bg-white">
          <h1 className="text-lg font-semibold text-slate-900">Admin dashboard</h1>
          <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-6 max-w-7xl mx-auto space-y-8">
          <PageHeader title="Dashboard" description={`Ringkasan data kepuasan pelanggan tahun ${stats.year}`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total survey" value={stats.total} color="blue" />
            <StatCard title="Sangat puas" value={stats.distribusi['Sangat Puas']} color="green" />
            <StatCard title="Puas" value={stats.distribusi['Puas']} color="blue" />
            <StatCard title="Tidak puas" value={stats.distribusi['Tidak Puas']} color="red" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Distribusi kepuasan" description="Persentase kepuasan pelanggan tahun ini">
              <SatisfactionPieChart distribusi={stats.distribusi} />
            </ChartCard>
            <ChartCard title="Survey bulanan" description={`Jumlah survey per bulan, ${stats.year}`}>
              {/* @ts-ignore */}
              <MonthlyBarChart data={stats.monthlyData} />
            </ChartCard>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-6">Survey terbaru</h3>
            <AdminSurveyTable data={stats.latest} />
          </div>
        </div>
      </main>
    </div>
  )
}