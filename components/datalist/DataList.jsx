"use client";
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useInView } from "react-intersection-observer";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowDownUp, ArrowUp, LoaderCircle, ChevronDown, ExternalLink, Ban, ArrowLeftToLine, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const calculateTotalStock = (item) => {
  const fields = ["draft", "project", "actual", "gt01", "g001", "g002", "g003"];
  return fields.reduce((sum, field) => sum + (Number(item[field]) || 0), 0);
};

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
  const [expandedId, setExpandedId] = useState(null);

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
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
      {/* Top Vignette/Blur Overlay */}
      <div className="fixed inset-x-0 top-0 z-40 h-10 pointer-events-none bg-indigo-100 border-none"/>
      <div className="fixed inset-x-0 top-6 z-40 h-20 pointer-events-none bg-gradient-to-b from-indigo-100 via-indigo-100 to-transparent " />

      {/* Bottom Vignette/Blur Overlay */}
      <div className="fixed inset-x-0 bottom-0 z-40 h-10 pointer-events-none bg-gradient-to-t from-indigo-100 via-indigo-50/60 to-transparent " />

      <div className="fixed inset-x-0 top-2 z-50 px-2">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-3 py-3 bg-white rounded-2xl ">
          <input
            type="text"
            placeholder="Cari MID atau Deskripsi..."
            className="flex-1 w-full h-12 rounded-xl border border-indigo-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setSortControl((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
              sortControl
                ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                : "border-indigo-50 bg-slate-50 text-gray-500"
            }`}
          >
            <ArrowDownUp size={18} />
            Sort
          </button>
        </div>

        <div
          className={`mx-auto max-w-2xl w-full rounded-2xl mt-1 shadow overflow-hidden transition-all duration-200 ease-out ${
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
                      : "border-slate-200 bg-white text-gray-500 hover:bg-slate-100"
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
                        : "border-slate-200 bg-white text-gray-500 hover:bg-slate-100"
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

      <div className="space-y-1">
        {status === "loading" ? (
          <div className="w-full flex items-center justify-center py-10">
            <LoaderCircle className="animate-spin text-indigo-400" />
          </div>
        ) : data?.pages[0].length === 0 ? (
          <p className="text-center text-gray-500">Data tidak ditemukan.</p>
        ) : (
          data?.pages.map((group, i) => (
            <div key={i} className="flex flex-col gap-1">
              {group.map((item) => {
                const isExpanded = expandedId === item.mid;
                return (
                  <div
                    key={item.mid}
                    onClick={() => setExpandedId(isExpanded ? null : item.mid)}
                    className={`cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 ${
                      isExpanded
                        ? "border-indigo-200 bg-white shadow-xl shadow-indigo-200/40"
                        : "border-slate-200/80 bg-white hover:border-indigo-100 hover:shadow-sm"
                    }`}
                  >
                    <div className="p-4 px-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap gap-1">
                            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                              MID {item.mid}
                            </span>
                            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {item.uom}
                            </span>
                            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {calculateTotalStock(item)}
                            </span>
                          </div>
                          <p className={`font-semibold leading-tight text-slate-800 text-sm transition-all ${isExpanded ? "mb-1" : "line-clamp-1"}`}>
                            {item.desc}
                          </p>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          className="ml-2 mt-1 text-slate-400"
                        >
                          <ChevronDown size={20} />
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <hr className="my-5 border-slate-100/80" />
                            <div id="more-detail" className="pb-2">
                              <div className="grid grid-cols-2 gap-6 sm:flex sm:flex-row sm:gap-8">
                                {/* Left Side: Locations */}
                                <div className="flex-1 space-y-2">
                                  <div className="relative">
                                    <span className="inline-block rounded-full bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500 mb-3">
                                      G001
                                    </span>
                                    <div className="ml-3 relative">
                                      <div className="absolute left-0 top-0 bottom-[14px] w-px bg-slate-200" />
                                      {[
                                        { label: "Draft", value: item.draft },
                                        { label: "Project", value: item.project },
                                        { label: "Unrest", value: item.actual },
                                      ].map((sub, idx, arr) => (
                                        <div key={sub.label} className="relative flex items-center justify-between text-sm py-1.5 pl-6">
                                          {/* Horizontal Branch */}
                                          <div className="absolute left-0 top-1/2 w-4 h-px bg-slate-200" />
                                          <span className="text-slate-500 font-medium">{sub.label}</span>
                                          <div className="mx-3 flex-1 h-px bg-slate-100" />
                                          <span className="text-gray-500 font-medium">
                                            {sub.value}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* G002 Row */}
                                  <div className="flex items-center gap-4">
                                    <span className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500">
                                      G002
                                    </span>
                                    <div className="flex-1 max-w-[120px] h-px bg-slate-100" />
                                    <span className="text-sm text-gray-500">
                                      {item.g002}
                                    </span>
                                  </div>

                                  {/* G003 Row */}
                                  <div className="flex items-center gap-4">
                                    <span className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500">
                                      G003
                                    </span>
                                    <div className="flex-1 max-w-[120px] h-px bg-slate-100" />
                                    <span className="text-sm text-gray-500">
                                      {item.g003}
                                    </span>
                                  </div>

                                   {/* G004 Row */}
                                  <div className="flex items-center gap-4">
                                    <span className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500">
                                      G004
                                    </span>
                                    <div className="flex-1 max-w-[120px] h-px bg-slate-100" />
                                    <span className="text-sm text-gray-500">
                                      {item.g004}
                                    </span>
                                  </div>

                                  {/* Gt01 Row */}
                                  <div className="flex items-center gap-4">
                                    <span className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500">
                                      GT01
                                    </span>
                                    <div className="flex-1 max-w-[120px] h-px bg-slate-100" />
                                    <span className="text-sm text-gray-500">
                                      {item.gt01}
                                    </span>
                                  </div>
                                </div>

                                {/* Right Side: Storage Bins & Action */}
                                <div className="flex flex-col justify-between items-start sm:items-end sm:w-64">
                                  <div className="w-full h-full text-left sm:text-right">
                                    <span className="inline-block rounded-full bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500 mb-5">
                                      Stor. Bin
                                    </span>
                                    <ul className="space-y-3 bg-slate-50 h-[85%] p-4 rounded-xl">
                                      {(item.bin_sap || "ZONE-B1").split(",").map((bin, i) => (
                                        <li key={i} className="flex items-center justify-start sm:justify-end gap-3 text-[12px] text-slate-500 font-medium">
                                          <span className="truncate">{bin.trim()}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <Link 
                                    href={`/private/data/detail/${item.mid}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-10 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500 transition-all hover:bg-slate-50 active:scale-[0.98] w-full sm:w-auto"
                                  >
                                    Full details
                                   <ArrowRight size={14} />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
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
        ) : (
        <div className="flex items-center gap-2 text-indigo-400 text-sm">
          <Ban size={18} />
          No more data
        </div>
        )}
      </div>
    </div>
  );
}
