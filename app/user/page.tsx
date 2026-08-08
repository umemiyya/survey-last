import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { DashboardCard } from '@/components/dashboard-card'
import { SurveyTable } from '@/components/survey-table'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Clock, CheckCircle, TrendingUp } from 'lucide-react'
import { getAllSurveys } from '@/actions/survey'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

// Paksa selalu fetch fresh — tidak pakai cache di production
export const dynamic = 'force-dynamic'

export default async function UserDashboard() {
  const session = await getSession()

  if (!session) redirect('/login')
  if (session.role === 'admin') redirect('/admin')

  const surveys = await getAllSurveys()

  // Hanya cek survey yang respondennya mengandung username user ini
  // Format responden: "Nama Lengkap (username)" — cek bagian dalam kurung
  // untuk memastikan exact match username, bukan substring kebetulan cocok
  const sudahIsi = surveys.some((survey) => {
    const responden = survey.responden?.toLowerCase() ?? ''
    const username = session.username.toLowerCase()
    // Cek format "(username)" di akhir string
    return responden.includes(`(${username})`)
  })

  const completedCount = surveys.length
  const lastSurvey = surveys[0]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar showAuth={true} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <PageHeader
          title={`Halo, ${session.username}`}
          description="Dashboard untuk mengelola survey kepuasan pelanggan"
        />

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <DashboardCard
            title="Survey sudah diisi"
            value={completedCount}
            icon={<CheckCircle className="w-full h-full" />}
          />
          <DashboardCard
            title="Status"
            value="Aktif"
            subtitle="Siap untuk mengisi survey baru"
            icon={<Clock className="w-full h-full" />}
          />
          {/* <DashboardCard
            title="Hasil terakhir"
            value={lastSurvey ? lastSurvey.prediksi ?? '-' : '-'}
            subtitle={
              lastSurvey
                ? `${lastSurvey.probabilitas}% probabilitas`
                : 'Belum ada data'
            }
            icon={<TrendingUp className="w-full h-full" />}
          /> */}
        </div>

        {/* Call to Action */}
        <div className="mb-10 flex flex-col items-start gap-2">
          <Link href={sudahIsi ? '#' : '/user/survey'}>
            <Button
              size="lg"
              disabled={sudahIsi}
              className="rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sudahIsi ? 'Survey sudah diisi' : 'Isi survey baru'}
            </Button>
          </Link>
          {sudahIsi && (
            <p className="text-sm text-slate-500">
              Anda sudah mengisi survey. Terima kasih atas partisipasi Anda!
            </p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-6">
            Riwayat survey terbaru
          </h2>
          <SurveyTable data={surveys.slice(0, 10)} />
        </div>
      </main>

      <Footer />
    </div>
  )
}