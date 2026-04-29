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
  ChevronRight,
  X,
  History,
  Search,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function EccList() {
  const { ref, inView } = useInView();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Helper to get initial state from localStorage
  const getInitial = (key, defaultValue) => {
    if (typeof window === "undefined") return defaultValue;
    return localStorage.getItem(`ecc_${key}`) || defaultValue;
  };

  // State Management
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("q") || getInitial("searchTerm", "")
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || getInitial("searchQuery", "")
  );
  const [sortBy, setSortBy] = useState(() => getInitial("sortBy", "old_mat"));
  const [sortOrder, setSortOrder] = useState(() =>
    getInitial("sortOrder", "asc")
  );
  const [onlyMapped, setOnlyMapped] = useState(
    () => getInitial("onlyMapped", "true") === "true"
  );
  const [sortControl, setSortControl] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem("ecc_sortBy", sortBy);
    localStorage.setItem("ecc_sortOrder", sortOrder);
    localStorage.setItem("ecc_onlyMapped", onlyMapped.toString());
    localStorage.setItem("ecc_searchTerm", searchTerm);
    localStorage.setItem("ecc_searchQuery", searchQuery);
  }, [sortBy, sortOrder, onlyMapped, searchTerm, searchQuery]);

  // Active filters count
  const activeFiltersCount = [
    sortBy !== "old_mat",
    sortOrder !== "asc",
    onlyMapped !== true,
  ].filter(Boolean).length;

  // Sync URL with searchQuery
  const updateUrl = (query) => {
    const params = new URLSearchParams(searchParams);
    if (query) params.set("q", query);
    else params.delete("q");
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setSearchQuery(searchTerm);
    updateUrl(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    setSearchQuery("");
    updateUrl("");
  };

  const handleReset = () => {
    setSortBy("old_mat");
    setSortOrder("asc");
    setOnlyMapped(true);
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["old_mid", searchQuery, sortBy, sortOrder, onlyMapped],
      queryFn: async ({ pageParam = 0 }) => {
        if (!searchQuery) return [];

        let query = supabase
          .from("old_mid")
          .select("*")
          .order(sortBy, { ascending: sortOrder === "asc" });

        if (onlyMapped) {
          query = query.not("new_mat", "is", null).neq("new_mat", "");
        }

        if (searchQuery) {
          const isNumber = /^\d+$/.test(searchQuery);
          const filter = isNumber
            ? `old_mat.eq.${searchQuery},old_mat.ilike.%${searchQuery}%,old_desc.ilike.%${searchQuery}%`
            : `old_mat.ilike.%${searchQuery}%,old_desc.ilike.%${searchQuery}%,new_mat.ilike.%${searchQuery}%,new_desc.ilike.%${searchQuery}%`;
          query = query.or(filter);
        }

        const { data, error } = await query.range(pageParam, pageParam + 19);
        if (error) throw error;
        return data;
      },
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length < 20 ? undefined : allPages.length * 20,
      initialPageParam: 0,
      staleTime: 1000 * 60 * 5,
      enabled: !!searchQuery,
    });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  // Data processing
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
      <div className="fixed inset-x-0 top-0 z-40 h-10 pointer-events-none bg-indigo-100" />
      <div className="fixed inset-x-0 top-4 z-40 h-20 pointer-events-none bg-gradient-to-b from-indigo-100 via-indigo-100 to-transparent" />

      <div id="search-bar" className="fixed inset-x-0 top-0 z-50">
        <form
          onSubmit={handleSearch}
          className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3 bg-white rounded-b shadow-sm"
        >
          <div className="flex-1 relative group">
            <input
              type="text"
              placeholder="Cari Old MID atau Deskripsi..."
              className="w-full h-12 rounded-2xl border border-indigo-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-12 px-4 rounded-2xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-200"
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            onClick={() => setSortControl((prev) => !prev)}
            className={`relative inline-flex items-center gap-2 rounded-2xl border px-4 h-12 text-sm font-medium transition ${
              sortControl
                ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                : "border-indigo-50 bg-slate-50 text-gray-500"
            }`}
          >
            <SlidersHorizontal size={18} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-lg shadow-indigo-200">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </form>

        <AnimatePresence>
          {sortControl && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mx-auto max-w-2xl w-full rounded shadow overflow-hidden border-t border-slate-100 bg-white"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-800">
                    Settings
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                  >
                    <RotateCcw size={14} /> Default
                  </button>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">
                    Sort By
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Old MID", value: "old_mat" },
                      { label: "Old Desc", value: "old_desc" },
                      { label: "New MID", value: "new_mat" },
                      { label: "New Desc", value: "new_desc" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSortBy(opt.value)}
                        className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${sortBy === opt.value ? "border-indigo-300 bg-indigo-50 text-indigo-600 shadow-sm" : "border-slate-200 bg-white text-gray-500 hover:bg-slate-100"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">
                    Filter
                  </p>
                  <button
                    onClick={() => setOnlyMapped(!onlyMapped)}
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${onlyMapped ? "border-indigo-300 bg-indigo-50 text-indigo-600 shadow-sm" : "border-slate-200 bg-white text-gray-500 hover:bg-slate-100"}`}
                  >
                    Mapped Only
                  </button>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">
                    Order
                  </p>
                  <div className="flex gap-2">
                    {[
                      { label: "Ascending", value: "asc", icon: ArrowUp },
                      { label: "Descending", value: "desc", icon: ArrowDown },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSortOrder(opt.value)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${sortOrder === opt.value ? "border-indigo-300 bg-indigo-50 text-indigo-600 shadow-sm" : "border-slate-200 bg-white text-gray-500 hover:bg-slate-100"}`}
                      >
                        <opt.icon size={18} /> {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div id="data-list" className="space-y-2">
        <p className="text-xs font-bold uppercase text-slate-500 px-1">
          ECC DATA
        </p>

        {isLoading ? (
          <div className="w-full flex items-center justify-center py-20">
            <LoaderCircle
              className="animate-spin text-indigo-500"
              size={32}
              strokeWidth={2.5}
            />
          </div>
        ) : !searchQuery ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-6">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <History size={40} className="text-indigo-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Mulai Pencarian
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Masukkan Old MID atau deskripsi.
            </p>
          </div>
        ) : groupedArray.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-6">
            <p className="text-indigo-500 font-medium">
              Data tidak ditemukan untuk "{searchQuery}".
            </p>
          </div>
        ) : (
          groupedArray.map((group) => {
            const isExpanded = expandedId === group.old_mat;
            return (
              <motion.div
                key={group.old_mat}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10px" }}
                transition={{ duration: 0.3 }}
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
                          <span className="flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase text-blue-600">
                            <History size={14} /> {group.old_mat}
                          </span>
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase text-slate-500">
                            {group.newCount} MID Baru
                          </span>
                        </div>
                        <p
                          className={`font-semibold leading-tight text-slate-800 text-sm transition-all ${isExpanded ? "mb-1" : "line-clamp-1"}`}
                        >
                          {group.old_desc}
                        </p>
                      </div>
                      <Link
                        href={`/private/ecc/detail/${group.old_mat}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex gap-1 py-1.5 pr-2 pl-3 text-xs bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors active:scale-95"
                      >
                        Details <ChevronRight size={16} />
                      </Link>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <hr className="my-4 border-slate-100/80" />
                          <div className="pb-1">
                            <p className="text-[10px] font-bold uppercase text-slate-400 px-2 mb-2">
                              MID Baru
                            </p>
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
                                      <div className="p-1.5 bg-slate-100 rounded-full text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
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
        ) : searchQuery && groupedArray.length > 0 ? (
          <div className="text-gray-400 text-sm flex items-center gap-2">
            No more data
          </div>
        ) : null}
      </div>
    </div>
  );
}
