'use client'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LoaderCircle } from 'lucide-react'

export default function EccList() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      const params = new URLSearchParams(searchParams)
      if (searchTerm) params.set('q', searchTerm)
      else params.delete('q')
      replace(`${pathname}?${params.toString()}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, pathname, replace, searchParams])

  const { data, status } = useQuery({
    queryKey: ['old_mid', debouncedSearch],
    queryFn: async () => {
      let query = supabase
        .from('old_mid')
        .select('*')
        .order('old_mat', { ascending: true })

      if (debouncedSearch) {
        const isNumber = /^\d+$/.test(debouncedSearch)
        const filter = isNumber
          ? `old_mat.eq.${debouncedSearch},old_mat.ilike.%${debouncedSearch}%,old_desc.ilike.%${debouncedSearch}%`
          : `old_mat.ilike.%${debouncedSearch}%,old_desc.ilike.%${debouncedSearch}%,new_mat.ilike.%${debouncedSearch}%,new_desc.ilike.%${debouncedSearch}%`

        query = query.or(filter)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5,
  })

  const groupedData = data
    ? data.reduce((acc, item) => {
        const key = item.old_mat
        if (!acc[key]) {
          acc[key] = { old_mat: item.old_mat, items: [], newMats: new Set() }
        }
        acc[key].items.push(item)
        acc[key].newMats.add(item.new_mat)
        return acc
      }, {})
    : {}

  const groupedArray = Object.values(groupedData).map((group) => ({
    old_mat: group.old_mat,
    items: group.items,
    newCount: group.newMats.size,
  }))

  return (
    <div className="max-w-2xl mx-auto px-4 pt-28">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center px-4 py-3">
          <input
            type="text"
            placeholder="Cari old MID..."
            className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {status === 'loading' ? (
          <div className="w-full flex items-center justify-center py-10">
            <LoaderCircle className="animate-spin text-indigo-400" />
          </div>
        ) : groupedArray.length === 0 ? (
          <p className="text-center text-gray-500">Data tidak ditemukan.</p>
        ) : (
          groupedArray.map((group) => (
            <Link href={`/detailsecc/${group.old_mat}`} key={group.old_mat}>
              <div className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 transition hover:shadow-lg/10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Old MID</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900 truncate">{group.old_mat}</div>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{group.items[0]?.old_desc}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {group.newCount} MID Baru
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
