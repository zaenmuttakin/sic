"use client"
import Link from 'next/link'
import { Archive, ArrowLeft } from 'lucide-react'

export default function Page() {
  const bins = [
    { id: 'A1', title: 'Bin A1', description: 'Area penyimpanan utama untuk komponen A.' },
    { id: 'B2', title: 'Bin B2', description: 'Lokasi cadangan dengan stok stabil.' },
    { id: 'C3', title: 'Bin C3', description: 'Bin khusus untuk material berlabel merah.' },
  ]

  return (
    <main className="min-h-screen bg-indigo-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/private"
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <ArrowLeft size={16} />
          Kembali ke menu
        </Link>

        <div className="space-y-2">
          {bins.map((bin) => (
            <Link
              key={bin.id}
              href={`/private/bin/${bin.id}`}
              className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 transition hover:shadow-lg/10 block"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bin Lokasi</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900 truncate">{bin.title}</div>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{bin.description}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {bin.id}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
