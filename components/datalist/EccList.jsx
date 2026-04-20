"use client";
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useInView } from "react-intersection-observer";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LoaderCircle,
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  ChevronDown,
  ExternalLink,
  Ban,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function EccList() {
  const { ref, inView } = useInView();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [sortBy, setSortBy] = useState("old_mat");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortControl, setSortControl] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [onlyMapped, setOnlyMapped] = useState(true);

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
    queryKey: ["old_mid", debouncedSearch, sortBy, sortOrder, onlyMapped],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("old_mid")
        .select("*")
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (onlyMapped) {
        query = query.not("new_mat", "is", null).neq("new_mat", "");
      }

      if (debouncedSearch) {
        const isNumber = /^\d+$/.test(debouncedSearch);
        const filter = isNumber
          ? `old_mat.eq.${debouncedSearch},old_mat.ilike.%${debouncedSearch}%,old_desc.ilike.%${debouncedSearch}%`
          : `old_mat.ilike.%${debouncedSearch}%,old_desc.ilike.%${debouncedSearch}%,new_mat.ilike.%${debouncedSearch}%,new_desc.ilike.%${debouncedSearch}%`;

        query = query.or(filter);
      }

      const { data, error } = await query.range(pageParam, pageParam + 19);
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

  // Flatten all pages and group by old_mat
  const allItems = data?.pages.flat() || [];

  const groupedData = allItems.reduce((acc, item) => {
    const key = item.old_mat;
    if (!acc[key]) {
      acc[key] = {
        old_mat: item.old_mat,
        old_desc: item.old_desc,
        items: [],
        newMats: new Set(),
      };
    }
    acc[key].items.push(item);
    if (item.new_mat && item.new_mat.trim() !== "") {
      acc[key].newMats.add(item.new_mat);
    }
    return acc;
  }, {});

  const groupedArray = Object.values(groupedData).map((group) => ({
    old_mat: group.old_mat,
    old_desc: group.old_desc,
    items: group.items.filter((i) => i.new_mat && i.new_mat.trim() !== ""),
    newCount: group.newMats.size,
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
      {/* Top Vignette/Gradient */}
      <div className="fixed inset-x-0 top-0 z-40 h-10 pointer-events-none bg-indigo-100" />
      <div className="fixed inset-x-0 top-4 z-40 h-20 pointer-events-none bg-gradient-to-b from-indigo-100 via-indigo-100 to-transparent" />

      <div id="search-bar" className="fixed inset-x-0 top-0 z-50 ">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3 bg-white rounded-b ">
          <input
            type="text"
            placeholder="Cari old MID atau Deskripsi..."
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
            <span className="hidden sm:inline">Sort</span>
          </button>
        </div>

        <AnimatePresence>
          {sortControl && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mx-auto max-w-2xl w-full rounded shadow overflow-hidden border-t border-slate-100 bg-white"
            >
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase  text-slate-400 mb-2">
                    Sort By
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Old MID", value: "old_mat" },
                      { label: "Old Desc", value: "old_desc" },
                      { label: "New MID", value: "new_mat" },
                      { label: "New Desc", value: "new_desc" },
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
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold uppercase  text-slate-400 mb-2">
                    Filter
                  </p>
                  <button
                    onClick={() => setOnlyMapped(!onlyMapped)}
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                      onlyMapped
                        ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                        : "border-slate-200 bg-white text-gray-500 hover:bg-slate-100"
                    }`}
                  >
                    Mapped
                  </button>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase  text-slate-400 mb-2">
                    Order
                  </p>
                  <div className="flex gap-2">
                    {[
                      { label: "Ascending", value: "asc", icon: ArrowUp },
                      { label: "Descending", value: "desc", icon: ArrowDown },
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
            </motion.div>
          )}
        </AnimatePresence>
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
        ) : groupedArray.length === 0 ? (
          <p className="text-center text-indigo-500 py-24">
            Data tidak ditemukan.
          </p>
        ) : (
          groupedArray.map((group, idx) => {
            const isExpanded = expandedId === group.old_mat;
            return (
              <motion.div
                key={group.old_mat}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10px" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div
                  onClick={() =>
                    setExpandedId(isExpanded ? null : group.old_mat)
                  }
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
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold uppercase  text-indigo-500">
                            MID {group.old_mat}
                          </span>
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold uppercase  text-slate-500">
                            {group.newCount} MID Baru
                          </span>
                        </div>
                        <p
                          className={`font-semibold leading-tight text-slate-800 text-sm transition-all ${isExpanded ? "mb-1" : "line-clamp-1"}`}
                        >
                          {group.old_desc}
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
                            <div className="flex flex-col gap-4">
                              {/* Overview Button at Top */}
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-semibold uppercase text-slate-400 px-2 py-2">
                                  mid baru
                                </p>
                                <Link
                                  href={`/private/ecc/detail/${group.old_mat}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center justify-between gap-2 rounded-full border border-indigo-200 px-4 py-1.5 text-xs text-indigo-500 transition-all hover:bg-indigo-100 w-fit sm:w-auto"
                                >
                                  Overview
                                  <ChevronRight size={14} />
                                </Link>
                              </div>

                              <div className="space-y-2">
                                {/* Scrollable Container for many items */}
                                <div className="grid grid-cols-1 gap-1.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                                  {group.items.length === 0 ? (
                                    <div className="p-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                                      <p className="text-xs font-medium text-slate-400">
                                        Belum ada mapping untuk MID ini.
                                      </p>
                                    </div>
                                  ) : (
                                    group.items.map((item, idx) => (
                                      <Link
                                        href={`/private/data/detail/${item.new_mat}`}
                                        onClick={(e) => e.stopPropagation()}
                                        key={idx}
                                        className="group relative flex flex-col gap-1 p-3 rounded-xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-white hover:shadow-sm hover:border-indigo-100/50"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="rounded-full bg-indigo-100/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-500">
                                            {item.new_mat}
                                          </span>
                                          <div
                                            className="p-1.5 bg-slate-100 h-full rounded-full text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                                            title="Search in Inventory"
                                          >
                                            <ArrowUpRight size={16} />
                                          </div>
                                        </div>
                                        <p className="text-xs text-slate-600 font-semibold leading-tight">
                                          {item.new_desc}
                                        </p>
                                      </Link>
                                    ))
                                  )}
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
          })
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
          groupedArray.length > 0 && (
            <div className="flex items-center gap-2 text-indigo-400 text-sm">
              <Ban size={18} />
              No more data
            </div>
          )
        )}
      </div>
    </div>
  );
}
