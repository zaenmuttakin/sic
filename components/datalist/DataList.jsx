"use client";
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useInView } from "react-intersection-observer";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowDownUp, ArrowUp, LoaderCircle } from "lucide-react";

export default function DataList() {
  const { ref, inView } = useInView();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [sortBy, setSortBy] = useState("update_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortControl, setSortControl] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      const params = new URLSearchParams(searchParams);
      if (searchTerm) params.set("q", searchTerm);
      else params.delete("q");
      replace(`${pathname}?${params.toString()}`);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, pathname, replace, searchParams]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["from_sheets", debouncedSearch, sortBy, sortOrder],
      queryFn: async ({ pageParam = 0 }) => {
        let query = supabase.from("from_sheets").select("*");

        if (debouncedSearch) {
          const isNumber = /^\d+$/.test(debouncedSearch);
          if (isNumber) {
            query = query.or(
              `mid.eq.${debouncedSearch},"desc".ilike.%${debouncedSearch}%`
            );
          } else {
            query = query.ilike("desc", `%${debouncedSearch}%`);
          }
        }

        const { data, error } = await query
          .range(pageParam, pageParam + 19)
          .order(sortBy, { ascending: sortOrder === "asc" });

        if (error) throw error;
        return data;
      },
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < 20) return undefined;
        return allPages.length * 20;
      },
      initialPageParam: 0,
      staleTime: 1000 * 60 * 5,
    });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
          <input
            type="text"
            placeholder="Cari MID atau Deskripsi..."
            className="flex-1 h-12 rounded-2xl border border-indigo-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setSortControl((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              sortControl
                ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                : "border-indigo-50 bg-slate-50 text-slate-700"
            }`}
          >
            <ArrowDownUp size={18} />
            Sort
          </button>
        </div>

        <div
          className={`mx-auto w-full overflow-hidden transition-all duration-200 ease-out ${
            sortControl ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-2xl space-y-4 border-t border-slate-200/70 bg-slate-50/95 px-4 py-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { value: "update_at", label: "Date" },
                { value: "mid", label: "MID" },
                { value: "desc", label: "Desc" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                    sortBy === option.value
                      ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { value: "asc", label: "Ascending", icon: ArrowUp },
                { value: "desc", label: "Descending", icon: ArrowDown },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSortOrder(option.value)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                      sortOrder === option.value
                        ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={18} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {status === "loading" ? (
          <div className="w-full flex items-center justify-center py-10">
            <LoaderCircle className="animate-spin text-indigo-400" />
          </div>
        ) : data?.pages[0].length === 0 ? (
          <p className="text-center text-gray-500">Data tidak ditemukan.</p>
        ) : (
          data?.pages.map((group, i) => (
            <div key={i} className="flex flex-col gap-2">
              {group.map((item) => (
                <Link href={`/private/data/detail/${item.mid}`} key={item.mid}>
                  <div className="group grid grid-cols-3 gap-4 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 transition hover:shadow-lg/10">
                    <div className="col-span-2">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600">
                          MID {item.mid}
                        </span>
                        <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-600">
                          {item.uom}
                        </span>
                      </div>
                      <p className="text-sm font-semibold leading-6 text-slate-800 line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 text-[11px] justify-center">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-400">
                          G001
                        </span>
                        <span className="text-slate-700">
                          {item.actual}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-400">
                          G002
                        </span>
                        <span className="text-slate-700">
                          {item.g002}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-400">
                          G003
                        </span>
                        <span className="text-slate-700">
                          {item.g003}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))
        )}
      </div>

      <div ref={ref} className="h-24 flex items-center justify-center mt-4">
        {isFetchingNextPage ? (
          <LoaderCircle className="animate-spin text-indigo-400" />
        ) : hasNextPage ? (
          <p className="text-gray-400 text-sm">
            Scroll untuk muat lebih banyak
          </p>
        ) : null}
      </div>
    </div>
  );
}
