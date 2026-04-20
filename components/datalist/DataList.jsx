"use client";
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useInView } from "react-intersection-observer";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  LoaderCircle,
  ChevronDown,
  Ban,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const calculateTotalStock = (item) => {
  const fields = ["draft", "project", "actual", "gt01", "g002", "g003", "g004"];
  return fields.reduce((sum, field) => sum + (Number(item[field]) || 0), 0);
};

const calculateOtherStock = (item) => {
  const fields = ["g002", "g003", "g004", "gt01"];
  return fields.reduce((sum, field) => sum + (Number(item[field]) || 0), 0);
};

export default function DataList() {
  const { ref, inView } = useInView();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [sortBy, setSortBy] = useState("desc");
  const [sortOrder, setSortOrder] = useState("asc");
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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
  } = useInfiniteQuery({
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
      {/* Top Vignette/Gradient */}
      <div className="fixed inset-x-0 top-0 z-40 h-10 pointer-events-none bg-indigo-100" />
      <div className="fixed inset-x-0 top-4 z-40 h-20 pointer-events-none bg-gradient-to-b from-indigo-100 via-indigo-100 to-transparent" />

      <div id="search-bar" className="fixed inset-x-0 top-0 z-50 ">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3 bg-white rounded-b ">
          <input
            type="text"
            placeholder="Cari MID atau Deskripsi..."
            className="flex-1 w-full h-12 rounded-2xl border border-indigo-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setSortControl((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
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
          className={`mx-auto max-w-2xl w-full rounded shadow overflow-hidden transition-all duration-200 ease-out ${
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

      <div id="data-list" className="space-y-1">
        {isLoading ? (
          <div className="w-full flex items-center justify-center py-20">
            <LoaderCircle
              className="animate-spin text-indigo-500"
              size={32}
              strokeWidth={2.5}
            />
          </div>
        ) : data?.pages[0].length === 0 ? (
          <p className="text-center text-indigo-500 py-24">
            Data tidak ditemukan.
          </p>
        ) : (
          data?.pages.map((group, i) => (
            <div key={i} className="flex flex-col gap-1">
              {group.map((item, j) => {
                const isExpanded = expandedId === item.mid;
                const globalIdx = i * 20 + j;
                return (
                  <motion.div
                    key={item.mid}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10px" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div
                      onClick={() =>
                        setExpandedId(isExpanded ? null : item.mid)
                      }
                      className={`cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${
                        isExpanded
                          ? "border-indigo-200 bg-white shadow-xl shadow-indigo-200/30 "
                          : "border-slate-200/80 bg-white hover:border-indigo-100 hover:shadow-md hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex flex-wrap gap-1">
                              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold uppercase text-indigo-500">
                                MID {item.mid}
                              </span>
                              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold uppercase text-slate-500">
                                {item.uom}
                              </span>
                              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold uppercase text-slate-500">
                                {calculateTotalStock(item)}
                              </span>
                            </div>
                            <p
                              className={`font-semibold leading-tight text-slate-800 text-sm transition-all ${isExpanded ? "mb-1" : "line-clamp-1"}`}
                            >
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
                              <hr className="my-4 border-slate-100/80" />
                              <div id="more-detail" className="pb-1">
                                <div className="grid grid-cols-2 gap-6 sm:flex sm:flex-row sm:gap-6">
                                  {/* Left Side: Locations */}
                                  <div className="flex-1 space-y-2">
                                    <div className="relative">
                                      <span className="inline-block rounded-full bg-slate-100/80 px-2.5 py-0.5 text-xs font-bold text-slate-500 mb-2">
                                        G001
                                      </span>
                                      <div className="ml-3 relative">
                                        <div className="absolute left-0 top-0 bottom-[14px] w-px bg-slate-200" />
                                        {[
                                          { label: "Draft", value: item.draft },

                                          {
                                            label: "Unrest",
                                            value: item.actual,
                                          },
                                          {
                                            label: "Project",
                                            value: item.project,
                                          },
                                        ].map((sub, idx, arr) => (
                                          <div
                                            key={sub.label}
                                            className="relative flex items-center justify-between text-sm py-1.5 pl-6"
                                          >
                                            {/* Horizontal Branch */}
                                            <div className="absolute left-0 top-1/2 w-4 h-px bg-slate-200" />
                                            <span className="text-slate-500 text-xs">
                                              {sub.label}
                                            </span>
                                            <div className="mx-3 flex-1 h-px bg-slate-100" />
                                            <span className="text-slate-700 text-xs">
                                              {sub.value}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Other Row */}
                                    <div className="flex items-center gap-4">
                                      <span className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500">
                                        Other
                                      </span>
                                      <div className="flex-1 max-w-[120px] h-px bg-slate-100" />
                                      <span className="text-xs text-slate-700">
                                        {calculateOtherStock(item)}
                                      </span>
                                    </div>
                                  </div>
                                  {/* Right Side: Storage Bins & Action */}
                                  <div className="flex flex-col justify-start items-start gap-4">
                                    <div className="w-full flex-1 flex flex-col gap-2 h-full text-left sm:text-right">
                                      <span className="w-fit rounded-full bg-slate-100/80 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                                        Stor. Bin
                                      </span>
                                      <ul className="space-y-1.5 bg-slate-50/50 p-3 h-full border border-slate-100 rounded-xl">
                                        {(item.bin_sap || "ZONE-B1")
                                          .split(",")
                                          .map((bin, i) => (
                                            <li
                                              key={i}
                                              className="flex items-center justify-start sm:justify-end gap-3 text-xs text-slate-700 font-medium"
                                            >
                                              <span className="truncate">
                                                {bin.trim()}
                                              </span>
                                            </li>
                                          ))}
                                      </ul>
                                    </div>

                                    <div className="w-full text-right">
                                      <Link
                                        href={`/private/data/detail/${item.mid}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center justify-between gap-2 rounded-full border border-indigo-200 px-4 py-1.5 text-xs text-indigo-500 transition-all hover:bg-indigo-100 w-fit sm:w-auto"
                                      >
                                        Details
                                        <ArrowRight size={14} />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
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
        ) : null}
      </div>
    </div>
  );
}
