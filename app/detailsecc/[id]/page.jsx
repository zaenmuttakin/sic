'use client'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, LoaderCircle } from 'lucide-react'

export default function DetailEcc() {
  const params = useParams() // Mengambil old_mat dari URL
  const { id: oldMat } = params

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', oldMat],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('old_mid')
        .select('*')
        .eq('old_mat', oldMat)
        .order('new_mat', { ascending: true })

      if (error) throw error
      return data
    },
  })

  if (isLoading)
    return (
      <div className="w-full min-h-screen flex items-center justify-center py-10 bg-indigo-50">
        <LoaderCircle className="animate-spin text-indigo-400" />
      </div>
    )
  if (error || !posts || posts.length === 0)
    return (
      <div className="p-10 text-center bg-indigo-50 min-h-screen">
        Data tidak ditemukan.
      </div>
    )

  const uniqueNewCount = new Set(posts.map((post) => post.new_mat)).size

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 bg-indigo-50 min-h-screen">
      <Link
        href="/private/ecc"
        className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <ArrowLeft size={16} />
        Kembali ke daftar
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-sm backdrop-blur-sm transition hover:shadow-lg/10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Old MID Overview</h1>
          <p className="text-slate-600">Old MID: <span className="font-semibold text-slate-900">{oldMat}</span></p>
          <p className="text-sm text-slate-500 mt-1">{uniqueNewCount} MID Baru mapped from this old MID</p>
          <p className="text-sm text-slate-500 mt-2">{posts[0]?.old_desc}</p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <Link href={`/private/data/detail/${post.new_mat}`} key={post.id}>
              <div className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50 p-4 transition hover:shadow-lg/10">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">New MID</div>
                <div className="mt-3">
                  <div className="text-lg font-semibold text-indigo-800">{post.new_mat}</div>
                  <p className="text-sm text-indigo-600 mt-1">{post.new_desc || post.new_mat}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
