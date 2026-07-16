'use client'

export function PrintActions() {
  return (
    <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
      <button
        onClick={() => window.print()}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow"
      >
        Cetak / Simpan PDF
      </button>
      <button
        onClick={() => window.close()}
        className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 shadow"
      >
        Tutup
      </button>
    </div>
  )
}