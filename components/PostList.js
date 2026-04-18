'use client'
import { useEffect, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useInView } from 'react-intersection-observer'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function PostList() {
  const { ref, inView } = useInView()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  // State pencarian & urutan
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)
  const [sortBy, setSortBy] = useState('update_at')
  const [sortOrder, setSortOrder] = useState('desc')

  // Debounce Search & Update URL
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      const params = new URLSearchParams(searchParams)
      if (searchTerm) params.set('q', searchTerm)
      else params.delete('q')
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
    queryKey: ['from_sheets', debouncedSearch, sortBy, sortOrder],
    queryFn: async ({ pageParam = 0 }) => {
      // Query standar Supabase
      let query = supabase
        .from('from_sheets')
        .select('*')

      // Fitur Pencarian (Tanpa mengabaikan spasi)
      if (debouncedSearch) {
        const isNumber = /^\d+$/.test(debouncedSearch);
        if (isNumber) {
          // Cari berdasarkan mid yang pas ATAU desc yang mirip
          query = query.or(`mid.eq.${debouncedSearch},"desc".ilike.%${debouncedSearch}%`);
        } else {
          // Cari desc yang mirip (case-insensitive)
          query = query.ilike('desc', `%${debouncedSearch}%`);
        }
      }

      // Pagination dan Sorting
      const { data, error } = await query
        .range(pageParam, pageParam + 19)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined;
      return allPages.length * 20;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage()
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Search & Sort Controls */}
      <div className="flex flex-col gap-4 mb-8">
        <input
          type="text"
          placeholder="Cari MID atau Deskripsi..."
          className="w-full p-3 border rounded-xl shadow-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <span className="text-gray-500 font-medium">Urutkan:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg p-2 bg-white"
          >
            <option value="update_at">Waktu Update</option>
            <option value="mid">MID</option>
            <option value="desc">desc</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            {sortOrder === 'asc' ? 'Terlama/Kecil ↑' : 'Terbaru/Besar ↓'}
          </button>
        </div>
      </div>

      {/* Render Data */}
      <div className="space-y-4">
        {status === 'pending' ? (
          <p className="text-center">Memuat...</p>
        ) : data?.pages[0].length === 0 ? (
          <p className="text-center text-gray-500">Data tidak ditemukan.</p>
        ) : (
          data?.pages.map((group, i) => (
            <div key={i} className="contents">
              {group.map((item) => (
                <Link href={`/details/${item.mid}`} key={item.mid}>
                  <div className="p-5 border rounded-xl shadow-sm hover:border-blue-400 transition bg-white">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">MID: {item.mid}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(item.update_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Trigger Infinite Scroll */}
      <div ref={ref} className="h-24 flex items-center justify-center mt-4">
        {isFetchingNextPage ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        ) : hasNextPage ? (
          <p className="text-gray-400 text-sm">Scroll untuk muat lebih banyak</p>
        ) : (
          <p className="text-gray-400 text-sm">Selesai</p>
        )}
      </div>
    </div>
  )
}
