"use client";
import { useEffect, useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useInView } from "react-intersection-observer";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LoaderCircle,
  ArrowDown,
  ArrowUp,
  Ban,
  ArrowUpRight,
  Package,
  ChevronRight,
  X,
  Search,
  ArrowDownUp,
  RotateCcw,
  Archive,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function BinList() {
  const { ref, inView } = useInView();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Helper for localStorage
  const getInitial = (key, defaultValue) => {
    if (typeof window === "undefined") return defaultValue;
    return localStorage.getItem(`bin_${key}`) || defaultValue;
  };

  // State Management
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("q") || getInitial("searchTerm", "")
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || getInitial("searchQuery", "")
  );
  const [sortBy, setSortBy] = useState(() => getInitial("sortBy", "bin"));
  const [sortOrder, setSortOrder] = useState(() =>
    getInitial("sortOrder", "asc")
  );
  const [sortControl, setSortControl] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem("bin_sortBy", sortBy);
    localStorage.setItem("bin_sortOrder", sortOrder);
    localStorage.setItem("bin_searchTerm", searchTerm);
    localStorage.setItem("bin_searchQuery", searchQuery);
  }, [sortBy, sortOrder, searchTerm, searchQuery]);

  // Active filters count
  const activeFiltersCount = useMemo(
    () => [sortBy !== "bin", sortOrder !== "asc"].filter(Boolean).length,
    [sortBy, sortOrder]
  );

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
    setSortBy("bin");
    setSortOrder("asc");
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["bins", searchQuery, sortBy, sortOrder],
      queryFn: async ({ pageParam = 0 }) => {
        if (!searchQuery) return [];

        let query = supabase
          .from("bins")
          .select("*")
          .order(sortBy === "bin" ? "bin" : sortBy, {
            ascending: sortOrder === "asc",
            nullsFirst: true,
          });

        if (searchQuery) {
          query = query.or(
            `bin.ilike.%${searchQuery}%,mid.ilike.%${searchQuery}%,desc.ilike.%${searchQuery}%`
          );
        }

        const { data, error } = await query.range(pageParam, pageParam + 199);
        if (error) throw error;
        return data;
      },
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length < 200 ? undefined : allPages.length * 200,
      initialPageParam: 0,
      staleTime: 1000 * 60 * 5,
      enabled: !!searchQuery,
    });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  // Data processing: Grouping
  const finalBins = useMemo(() => {
    const allItems = data?.pages.flat() || [];
    const grouped = allItems.reduce((acc, item) => {
      let bin = item.bin === null ? "(NULL)" : item.bin;
      if (!acc[bin]) {
        acc[bin] = { bin: bin, items: [], totalItems: 0 };
      }
      if (item.mid && !acc[bin].items.find((i) => i.mid === item.mid)) {
        acc[bin].items.push(item);
        acc[bin].totalItems += 1;
      }
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => {
      if (sortBy !== "bin") return 0; // Let DB handle other sorts
      if (a.bin === "(NULL)" && b.bin !== "(NULL)") return -1;
      if (a.bin !== "(NULL)" && b.bin === "(NULL)") return 1;
      if (a.bin === "" && b.bin !== "") return -1;
      if (a.bin !== "" && b.bin === "") return 1;
      return a.bin.localeCompare(b.bin, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }, [data, sortBy]);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
      <div id="search-bar" className="fixed inset-x-0 top-0 z-50">
        <SearchHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          onClear={handleClear}
          onToggleSort={() => setSortControl(!sortControl)}
          sortControl={sortControl}
          activeFiltersCount={activeFiltersCount}
        />

        <AnimatePresence>
          {sortControl && (
            <SettingsPanel
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              onReset={handleReset}
            />
          )}
        </AnimatePresence>
      </div>

      <div id="data-list" className="space-y-2">
        <p className="text-xs font-bold uppercase text-slate-500 px-1">
          Bin List
        </p>

        {isLoading ? (
          <LoadingState />
        ) : !searchQuery ? (
          <IdleState />
        ) : finalBins.length === 0 ? (
          <NoResults query={searchQuery} />
        ) : (
          <div className="space-y-1">
            {finalBins.map((group) => (
              <BinCard
                key={group.bin}
                group={group}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
              />
            ))}
          </div>
        )}
      </div>

      <FooterPagination
        innerRef={ref}
        isFetching={isFetchingNextPage}
        hasNext={hasNextPage}
        hasResults={finalBins.length > 0}
        searchQuery={searchQuery}
      />
    </div>
  );
}

/**
 * Sub-components
 */

function BackgroundGradients() {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-10 pointer-events-none bg-indigo-100" />
      <div className="fixed inset-x-0 top-4 z-40 h-20 pointer-events-none bg-gradient-to-b from-indigo-100 via-indigo-100 to-transparent" />
    </>
  );
}

function SearchHeader({
  searchTerm,
  setSearchTerm,
  onSearch,
  onClear,
  onToggleSort,
  sortControl,
  activeFiltersCount,
}) {
  return (
    <form
      onSubmit={onSearch}
      className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3 bg-white rounded-b shadow-sm"
    >
      <div className="flex-1 relative group">
        <input
          type="text"
          placeholder="Cari Bin atau Material..."
          className="w-full h-12 rounded-2xl border border-indigo-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={onClear}
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
        onClick={onToggleSort}
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
  );
}

function SettingsPanel({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onReset,
}) {
  const OptionBtn = ({ label, active, onClick, icon: Icon }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-indigo-300 bg-indigo-50 text-indigo-600"
          : "border-slate-200 bg-white text-gray-500 hover:bg-slate-100"
      }`}
    >
      {Icon && <Icon size={18} />}
      {label}
    </button>
  );

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="mx-auto max-w-2xl w-full bg-white border-t border-slate-100 shadow overflow-hidden"
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase text-slate-800">Settings</p>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-600"
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
              { label: "Bin Name", val: "bin" },
              { label: "Material ID", val: "mid" },
              { label: "Description", val: "desc" },
            ].map((o) => (
              <OptionBtn
                key={o.val}
                label={o.label}
                active={sortBy === o.val}
                onClick={() => setSortBy(o.val)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-slate-400 mb-2">
            Order
          </p>
          <div className="flex gap-2">
            {[
              { label: "Ascending", val: "asc", icon: ArrowUp },
              { label: "Descending", val: "desc", icon: ArrowDown },
            ].map((o) => (
              <OptionBtn
                key={o.val}
                label={o.label}
                active={sortOrder === o.val}
                onClick={() => setSortOrder(o.val)}
                icon={o.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function BinCard({ group, expandedId, setExpandedId }) {
  const isExpanded = expandedId === group.bin;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div
        onClick={() => setExpandedId(isExpanded ? null : group.bin)}
        className={`cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 ${
          isExpanded
            ? "border-indigo-200 bg-white shadow-xl shadow-indigo-200/40"
            : "border-slate-200/80 bg-white hover:border-indigo-100 hover:shadow-sm"
        }`}
      >
        <div className="py-5 px-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap gap-1 item-center">
                <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold uppercase bg-indigo-50 text-indigo-500">
                  {group.bin || "(EMPTY)"}
                </span>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase ${group.totalItems > 0 ? "bg-slate-50 text-slate-500" : "bg-red-50 text-red-500"}`}
                >
                  {group.totalItems > 0 ? `${group.totalItems} Item` : "EMPTY"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2 mt-0.5">
              <Link
                href={`/private/bin/detail/${group.bin === "" ? "EMPTY" : group.bin === "(NULL)" ? "NULL" : group.bin}`}
                onClick={(e) => e.stopPropagation()}
                className="flex gap-1 py-1.5 pr-2 pl-3 text-xs bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors active:scale-95"
              >
                Details <ChevronRight size={16} />
              </Link>
            </div>
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
                <div className="pb-1">
                  <p className="text-xs font-bold uppercase text-slate-400 px-1 mb-2">
                    List Material
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {group.items.length > 0 ? (
                      group.items.map((item, idx) => (
                        <Link
                          href={`/private/data/detail/${item.mid}`}
                          onClick={(e) => e.stopPropagation()}
                          key={idx}
                          className="group relative flex flex-col gap-1 p-3 rounded-xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-white hover:shadow-sm hover:border-indigo-100/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Package size={16} className="text-indigo-400" />
                              <span className="text-xs font-bold text-indigo-500">
                                {item.mid}
                              </span>
                            </div>
                            <div className="p-1.5 bg-slate-100 rounded-full text-slate-400 group-hover:text-indigo-50 group-hover:bg-indigo-50 transition-colors">
                              <ArrowUpRight size={16} />
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 font-semibold line-clamp-1">
                            {item.desc}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <div className="py-10 text-center flex flex-col items-center justify-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                        <Ban size={24} className="text-slate-200 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          No Material in this bin
                        </p>
                      </div>
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
}

function LoadingState() {
  return (
    <div className="w-full flex items-center justify-center py-20">
      <LoaderCircle
        className="animate-spin text-indigo-500"
        size={32}
        strokeWidth={2.5}
      />
    </div>
  );
}

function IdleState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-6">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
        <Archive size={40} className="text-indigo-300" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">Mulai Pencarian</h3>
      <p className="text-sm text-slate-500 max-w-xs">
        Masukkan Bin atau material.
      </p>
    </div>
  );
}

function NoResults({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-6">
      <p className="text-indigo-500 font-medium">
        Data tidak ditemukan untuk "{query}".
      </p>
    </div>
  );
}

function FooterPagination({
  innerRef,
  isFetching,
  hasNext,
  hasResults,
  searchQuery,
}) {
  return (
    <div ref={innerRef} className="h-24 flex items-center justify-center mt-4">
      {isFetching ? (
        <LoaderCircle className="animate-spin text-indigo-400" />
      ) : hasNext ? (
        <p className="text-gray-400 text-sm">Scroll untuk muat lebih banyak</p>
      ) : searchQuery && hasResults ? (
        <div className="flex items-center gap-2 text-indigo-400 text-sm">
          <Ban size={18} /> No more data
        </div>
      ) : null}
    </div>
  );
}
