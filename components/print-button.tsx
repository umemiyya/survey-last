'use client'

import { FileDown } from 'lucide-react'

export function PrintButton({ surveyId }: { surveyId: string }) {
  return (
    <a
      href={`/user/result/print/${surveyId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <FileDown className="w-4 h-4" />
      Unduh Laporan PDF
    </a>
  )
}