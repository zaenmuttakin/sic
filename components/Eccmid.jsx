'use client'
import { useEffect, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useInView } from 'react-intersection-observer'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Eccmid() {
  const { ref, inView } = useInView()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  // 1. Ambil nilai pencarian dari URL awal (jika ada)ss
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

  // 2. Update URL saat user mengetik (Debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      
      const params = new URLSearchParams(searchParams)
      if (searchTerm) {
        params.set('q', searchTerm)
      } else {
        params.delete('q')
      }
      // Update URL tanpa reload halaman
      replace(`${pathname}?${params.toString()}`)
    }, 500)

    return () => clearTimeout(handler)
  }, [searchTerm, pathname, replace, searchParams])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['old_mid', debouncedSearch], // Cache tersimpan berdasarkan keyword
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('old_mid')
        .select('*')
        .range(pageParam, pageParam + 19)
        .order('new_mat', { ascending: true })

      if (debouncedSearch) {
        const isNumber = /^\d+$/.test(debouncedSearch)
        if (isNumber) {
          query = query.or(`old_mat.eq.${debouncedSearch},old_desc.ilike.%${debouncedSearch}%`)
        } else {
          query = query.ilike('old_desc', `%${debouncedSearch}%`)
        }
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined
      return allPages.length * 20
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // Simpan cache selama 5 menit agar tidak fetch ulang saat kembali
  })

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage()
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <input
        type="text"
        placeholder="Cari ID atau Judul..."
        className="w-full p-2 border rounded-lg mb-6 text-black"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <div className="space-y-4">
        {status === 'pending' ? (
          <p>Memuat...</p>
        ) : (
          data?.pages.map((group, i) => (
            <div key={i} className="contents">
              {group.map((list) => (
                <Link href={`/detailsecc/${list.id}`} key={list.id}>
                  <div className="p-4 border rounded-lg  hover:bg-gray-50 cursor-pointer">
                    <p className="text-xs text-blue-600 font-mono">ID: {list.old_mat}</p>
                    <p className="font-semibold">{list.old_desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          ))
        )}
      </div>

      <div ref={ref} className="h-10" />
    </div>
  )
}
