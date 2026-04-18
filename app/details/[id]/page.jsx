'use client'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PostDetail() {
  const params = useParams() // Mengambil ID dari URL
  const router = useRouter()
  const { id } = params

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('from_sheets')
        .select('*')
        .eq('mid', id)
        .single() // Mengambil 1 data saja

      if (error) throw error
      return data
    },
  })

  if (isLoading) return <div className="p-10 text-center bg-indigo-50 min-h-screen">Loading..</div>
  if (error || !post) return <div className="p-10 text-center bg-indigo-50 min-h-screen ">Data tidak ditemukan.</div>

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-10 bg-indigo-50 min-h-screen">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <ArrowLeft size={16} />
         Kembali
      </button>

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-sm backdrop-blur-sm transition hover:shadow-lg/10">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">
            MID {post.mid}
          </span>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-600">
            {post.uom}
          </span>
        </div>
        <h1 className="mb-6 text-2xl font-bold leading-8 text-slate-800">
          {post.desc}
        </h1>
        <hr className="mb-6 border-slate-200/70" />
        <p className="text-slate-700 leading-relaxed">
          {post.bin_sap || 'Tidak ada deskripsi untuk item ini.'}
        </p>
        
        <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/70 text-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 font-medium">G001</span>
            <span className="font-semibold text-slate-700">{post.actual}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 font-medium">G002</span>
            <span className="font-semibold text-slate-700">{post.g002}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 font-medium">G003</span>
            <span className="font-semibold text-slate-700">{post.g003}</span>
          </div>
        </div>
        
        <div className="mt-6 text-xs text-slate-500">
          Dibuat pada: {new Date(post.update_at).toLocaleDateString('id-ID')}
        </div>
      </div>
    </div>
  )
}
