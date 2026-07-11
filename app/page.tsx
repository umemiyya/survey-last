import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import {
  ClipboardList,
  GitBranch,
  LineChart,
  Droplets,
  Wind,
  Sparkles,
  Building2,
  Hotel,
  Hospital,
  ShoppingBag,
  Landmark,
  Plane,
  Users2,
  BadgeCheck,
  Wrench,
  CalendarClock,
  SlidersHorizontal,
  Network,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-4">
              PT Pink Service Indonesia
            </p>
            <h1 className="text-4xl lg:text-5xl font-semibold text-slate-900 mb-6 leading-tight">
              Menjaga Kebersihan, Kesehatan, dan Kenyamanan Setiap Ruang
            </h1>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              Sejak 1996, kami menghadirkan solusi Washroom Hygiene Services,
              Air Sanitation, dan Aroma Scent Marketing untuk menciptakan
              lingkungan yang lebih sehat, nyaman, dan berkesan bagi berbagai
              perusahaan di Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/user">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-blue-600 hover:bg-blue-700"
                >
                  Konsultasi Gratis
                </Button>
              </Link>
              <a href="#services">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full"
                >
                  Pelajari Layanan Kami
                </Button>
              </a>
            </div>
          </div>

          {/* Signature visual: decision tree, literal nod to Random Forest */}
          <div className="hidden lg:flex bg-blue-50/60 rounded-2xl p-10 h-80 items-center justify-center">
            <svg viewBox="0 0 280 180" className="w-full h-full max-w-sm">
              <line x1="140" y1="26" x2="80" y2="76" stroke="#85B7EB" strokeWidth="2" />
              <line x1="140" y1="26" x2="200" y2="76" stroke="#85B7EB" strokeWidth="2" />
              <line x1="80" y1="76" x2="44" y2="130" stroke="#85B7EB" strokeWidth="2" />
              <line x1="80" y1="76" x2="116" y2="130" stroke="#85B7EB" strokeWidth="2" />
              <line x1="200" y1="76" x2="166" y2="130" stroke="#85B7EB" strokeWidth="2" />
              <line x1="200" y1="76" x2="236" y2="130" stroke="#85B7EB" strokeWidth="2" />

              <circle cx="140" cy="26" r="11" fill="#0C447C" />
              <circle cx="80" cy="76" r="9" fill="#185FA5" />
              <circle cx="200" cy="76" r="9" fill="#185FA5" />
              <circle cx="44" cy="130" r="7" fill="#378ADD" />
              <circle cx="116" cy="130" r="7" fill="#378ADD" />
              <circle cx="166" cy="130" r="7" fill="#378ADD" />
              <circle cx="236" cy="130" r="7" fill="#378ADD" />

              <circle cx="44" cy="130" r="7" fill="#1D9E75" opacity="0.9" />
              <circle cx="236" cy="130" r="7" fill="#D85A30" opacity="0.85" />

              <text x="140" y="160" textAnchor="middle" fontSize="11" fill="#185FA5">
                pohon keputusan
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* Statistik Perusahaan */}
      <section className="bg-slate-50/60 border-y border-slate-100 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            <div>
              <p className="text-3xl font-semibold text-blue-600">29+</p>
              <p className="text-sm text-slate-500 mt-1">Tahun Pengalaman</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-blue-600">200+</p>
              <p className="text-sm text-slate-500 mt-1">Gedung Komersial</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-blue-600">1.000+</p>
              <p className="text-sm text-slate-500 mt-1">Titik Instalasi</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-blue-600">50+</p>
              <p className="text-sm text-slate-500 mt-1">Varian Aroma Premium</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-blue-600">8+</p>
              <p className="text-sm text-slate-500 mt-1">Kota Operasional</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Kami */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-3">Tentang Kami</p>
            <h2 className="text-3xl font-semibold text-slate-900 mb-6">
              Mengenal PT Pink Service Indonesia
            </h2>
            <p className="text-lg text-slate-500 mb-4 leading-relaxed">
              Didirikan pada tahun 1996, PT Pink Service Indonesia berkomitmen
              menghadirkan solusi kebersihan dan kesehatan lingkungan untuk
              berbagai sektor industri di Indonesia.
            </p>
            <p className="text-lg text-slate-500 mb-4 leading-relaxed">
              Perjalanan kami dimulai melalui Habitat Healthcare, yang
              menyediakan berbagai sistem kebersihan toilet (washroom
              hygiene). Seiring berkembangnya kebutuhan pelanggan, kami
              memperluas layanan melalui Aroma Delivery System (ADS) yang
              menghadirkan teknologi scent marketing untuk menciptakan
              pengalaman ruang yang lebih nyaman dan meningkatkan citra
              sebuah merek.
            </p>
            <p className="text-lg text-slate-500 leading-relaxed">
              Hingga saat ini, kami terus berinovasi dalam menyediakan produk
              berkualitas tinggi, layanan profesional, dan program perawatan
              berkala untuk membantu pelanggan menciptakan lingkungan yang
              bersih, sehat, dan nyaman.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-blue-50/60 rounded-2xl p-8">
              <p className="text-sm font-medium text-blue-600 mb-2">Visi</p>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Menjadi Mitra Hygiene dan Scent Marketing Terpercaya di Indonesia
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Menjadi perusahaan terdepan dalam penyediaan solusi hygiene
                dan aroma profesional yang memberikan nilai tambah bagi
                setiap lingkungan bisnis melalui inovasi, kualitas layanan,
                dan kepuasan pelanggan.
              </p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-8">
              <p className="text-sm font-medium text-blue-600 mb-2">Misi</p>
              <ul className="space-y-2 text-slate-500 leading-relaxed list-disc list-inside">
                <li>Memberikan layanan hygiene yang profesional dan berkualitas.</li>
                <li>Meningkatkan standar kebersihan dan kesehatan lingkungan.</li>
                <li>Menghadirkan pengalaman ruang yang nyaman melalui teknologi aroma.</li>
                <li>Menjalin hubungan jangka panjang dengan pelanggan.</li>
                <li>Terus berinovasi mengikuti perkembangan teknologi dan kebutuhan pasar.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Kami */}
      <section id="services" className="bg-slate-50/60 border-y border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-blue-600 mb-2">Layanan Kami</p>
            <h2 className="text-3xl font-semibold text-slate-900 mb-3">
              Solusi Kebersihan dan Aroma Profesional
            </h2>
            <p className="text-lg text-slate-500">
              Tiga pilar layanan yang kami tawarkan untuk berbagai jenis bisnis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-8">
              <div className="bg-blue-50 w-11 h-11 rounded-xl flex items-center justify-center mb-5">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2.5">
                Washroom Hygiene Services
              </h3>
              <p className="text-slate-500 leading-relaxed mb-4">
                Solusi kebersihan toilet komersial untuk menjaga kebersihan,
                kesehatan, dan kenyamanan fasilitas publik.
              </p>
              <ul className="text-sm text-slate-500 space-y-1.5">
                <li>Air Freshener</li>
                <li>Hand Soap Dispenser</li>
                <li>Hand Dryer</li>
                <li>Toilet Seat Sanitizer</li>
                <li>Sanitary Bin</li>
                <li>Toilet Sanitizer</li>
                <li>Tissue Dispenser</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-8">
              <div className="bg-blue-50 w-11 h-11 rounded-xl flex items-center justify-center mb-5">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2.5">
                Aroma Delivery System (ADS)
              </h3>
              <p className="text-slate-500 leading-relaxed mb-4">
                Teknologi penyebaran aroma profesional yang membantu
                menciptakan identitas aroma (signature scent) untuk berbagai
                jenis bisnis.
              </p>
              <p className="text-sm text-slate-500 mb-2">Cocok untuk:</p>
              <ul className="text-sm text-slate-500 space-y-1.5">
                <li>Hotel, Mall, Perkantoran</li>
                <li>Rumah Sakit, Retail</li>
                <li>Apartemen, Bandara</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-8">
              <div className="bg-blue-50 w-11 h-11 rounded-xl flex items-center justify-center mb-5">
                <Wind className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2.5">
                Air Sanitizing Solution
              </h3>
              <p className="text-slate-500 leading-relaxed mb-4">
                Solusi sanitasi udara untuk membantu menjaga kualitas udara
                dalam ruangan.
              </p>
              <ul className="text-sm text-slate-500 space-y-1.5">
                <li>Penghilang bau</li>
                <li>Sanitasi udara</li>
                <li>Pengendalian bakteri</li>
                <li>Penyegar udara profesional</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Sistem Survey (dipertahankan dari halaman sebelumnya) */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-semibold text-slate-900 mb-3">
            Sistem Survey Kepuasan Pelanggan
          </h2>
          <p className="text-lg text-slate-500">
            Ukur kepuasan pelanggan secara digital dengan klasifikasi otomatis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-8">
            <div className="bg-blue-50 w-11 h-11 rounded-xl flex items-center justify-center mb-5">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2.5">
              Survey digital
            </h3>
            <p className="text-slate-500 leading-relaxed">
              Formulir survey yang mudah diisi dengan validasi real-time
              untuk pengumpulan data yang akurat.
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-8">
            <div className="bg-blue-50 w-11 h-11 rounded-xl flex items-center justify-center mb-5">
              <GitBranch className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2.5">
              Klasifikasi Random Forest
            </h3>
            <p className="text-slate-500 leading-relaxed">
              Algoritma machine learning yang menggabungkan banyak pohon
              keputusan untuk klasifikasi kepuasan dengan akurasi tinggi.
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-8">
            <div className="bg-blue-50 w-11 h-11 rounded-xl flex items-center justify-center mb-5">
              <LineChart className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2.5">
              Dashboard monitoring
            </h3>
            <p className="text-slate-500 leading-relaxed">
              Dashboard real-time untuk memantau tren kepuasan pelanggan dan
              membuat keputusan berdasarkan data.
            </p>
          </div>
        </div>
      </section>

      {/* Industri yang Kami Layani */}
      <section className="bg-slate-50/60 border-y border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-blue-600 mb-2">Industri</p>
            <h2 className="text-3xl font-semibold text-slate-900 mb-3">
              Industri yang Kami Layani
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {[
              { icon: Hotel, label: 'Hotel' },
              { icon: Building2, label: 'Gedung Perkantoran' },
              { icon: Hospital, label: 'Rumah Sakit' },
              { icon: ShoppingBag, label: 'Pusat Perbelanjaan' },
              { icon: Landmark, label: 'Institusi Pendidikan' },
              { icon: Building2, label: 'Apartemen' },
              { icon: ShoppingBag, label: 'Retail' },
              { icon: Plane, label: 'Bandara' },
              { icon: Building2, label: 'Kawasan Industri' },
              { icon: Users2, label: 'Fasilitas Umum' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center gap-3"
              >
                <Icon className="w-6 h-6 text-blue-600" />
                <p className="text-sm text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mengapa Memilih Kami */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-blue-600 mb-2">Keunggulan</p>
          <h2 className="text-3xl font-semibold text-slate-900 mb-3">
            Mengapa Memilih PT Pink Service Indonesia?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: BadgeCheck,
              title: 'Berpengalaman',
              desc: 'Lebih dari dua dekade melayani berbagai perusahaan di Indonesia.',
            },
            {
              icon: Sparkles,
              title: 'Produk Berkualitas',
              desc: 'Menggunakan produk dan sistem hygiene yang telah teruji.',
            },
            {
              icon: Wrench,
              title: 'Teknisi Profesional',
              desc: 'Didukung oleh tenaga teknis yang berpengalaman dan terlatih.',
            },
            {
              icon: CalendarClock,
              title: 'Perawatan Berkala',
              desc: 'Layanan maintenance rutin untuk memastikan seluruh perangkat tetap berfungsi optimal.',
            },
            {
              icon: SlidersHorizontal,
              title: 'Solusi yang Fleksibel',
              desc: 'Setiap pelanggan mendapatkan solusi yang disesuaikan dengan kebutuhan bisnisnya.',
            },
            {
              icon: Network,
              title: 'Jaringan Nasional',
              desc: 'Melayani pelanggan di berbagai kota besar di Indonesia.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-slate-100 rounded-2xl p-8">
              <div className="bg-blue-50 w-11 h-11 rounded-xl flex items-center justify-center mb-5">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2.5">{title}</h3>
              <p className="text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Proses Pelayanan */}
      <section className="bg-slate-50/60 border-y border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-blue-600 mb-2">Cara Kami Bekerja</p>
            <h2 className="text-3xl font-semibold text-slate-900 mb-3">
              Proses Pelayanan
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              'Konsultasi kebutuhan pelanggan',
              'Survey lokasi',
              'Analisis kebutuhan',
              'Penyusunan solusi',
              'Instalasi perangkat',
              'Perawatan dan monitoring berkala',
              'Dukungan layanan purna jual',
            ].map((step, i) => (
              <div key={step} className="bg-white border border-slate-100 rounded-2xl p-6">
                <p className="text-blue-600 text-sm font-semibold mb-2">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nilai-Nilai Perusahaan */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-blue-600 mb-2">Komitmen Kami</p>
          <h2 className="text-3xl font-semibold text-slate-900 mb-3">
            Nilai-Nilai Perusahaan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Profesionalisme', desc: 'Memberikan pelayanan terbaik dengan standar kerja yang tinggi.' },
            { title: 'Integritas', desc: 'Menjalankan bisnis secara jujur, transparan, dan bertanggung jawab.' },
            { title: 'Inovasi', desc: 'Terus menghadirkan solusi baru sesuai perkembangan teknologi.' },
            { title: 'Kepuasan Pelanggan', desc: 'Menjadikan kepuasan pelanggan sebagai prioritas utama dalam setiap layanan.' },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-blue-50/60 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wilayah Operasional & Kontak */}
      <section className="bg-slate-50/60 border-y border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-2">Wilayah Operasional</p>
              <h2 className="text-3xl font-semibold text-slate-900 mb-6">
                Melayani Berbagai Kota di Indonesia
              </h2>
              <p className="text-lg text-slate-500 mb-6 leading-relaxed">
                Kantor pusat kami berada di Jakarta Barat, dengan jaringan
                operasional di berbagai kota besar, seperti:
              </p>
              <div className="flex flex-wrap gap-2">
                {['Bandung', 'Surabaya', 'Bali', 'Medan', 'Makassar', 'Batam', 'Semarang', 'Pekanbaru'].map(
                  (city) => (
                    <span
                      key={city}
                      className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-600"
                    >
                      {city}
                    </span>
                  )
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-blue-600 mb-2">Hubungi Kami</p>
              <h2 className="text-3xl font-semibold text-slate-900 mb-6">
                Mari Berdiskusi Mengenai Kebutuhan Bisnis Anda
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-500">
                    Kompleks Kedoya Center Blok C8–9, Jl. Raya Perjuangan No.1,
                    Kebon Jeruk, Jakarta Barat 11530
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-slate-500">(021) 5333405</p>
                </div>
                <div className="flex gap-4 items-center">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-slate-500">sales@adsscent.com</p>
                </div>
              </div>
              <Link href="/user">
                <Button size="lg" className="mt-8 rounded-full bg-blue-600 hover:bg-blue-700">
                  Konsultasi Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}