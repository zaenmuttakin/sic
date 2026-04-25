"use client";
import { useEffect, useState } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
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
  Ban,
  ArrowUpRight,
  Package,
  ChevronRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase ${
                    group.totalItems > 0
                      ? "bg-slate-50 text-slate-500"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {group.totalItems > 0 ? `${group.totalItems} Item` : "EMPTY"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2 mt-0.5">
              <Link
                href={`/private/bin/detail/${
                  group.bin === ""
                    ? "EMPTY"
                    : group.bin === "(NULL)"
                      ? "NULL"
                      : group.bin
                }`}
                onClick={(e) => e.stopPropagation()}
                className="flex gap-1 py-1.5 pr-2 pl-3 text-xs bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors active:scale-95"
              >
                Details
                <ChevronRight size={16} />
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
                <div id="more-detail" className="pb-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase   text-slate-400 px-1">
                      List Material
                    </p>
                  </div>

                  <div className="space-y-2">
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
                                <Package
                                  size={16}
                                  className="text-indigo-400"
                                />
                                <span className="text-xs font-bold text-indigo-500">
                                  {item.mid}
                                </span>
                              </div>
                              <div className="p-1.5 bg-slate-100 rounded-full text-slate-400">
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function BinList() {
  const { ref, inView } = useInView();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [sortBy, setSortBy] = useState("bin");
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
    queryKey: ["bins", debouncedSearch, sortBy, sortOrder],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("bins")
        .select("*")
        .order("bin", { ascending: true, nullsFirst: true });

      if (debouncedSearch) {
        query = query.or(
          `bin.ilike.%${debouncedSearch}%,mid.ilike.%${debouncedSearch}%,desc.ilike.%${debouncedSearch}%`
        );
      }

      const { data, error } = await query.range(pageParam, pageParam + 199);
      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 200) return undefined;
      return allPages.length * 200;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  // Flatten and group bins

  // Flatten and group other bins
  const allOtherItems = data?.pages.flat() || [];
  const groupedOtherData = allOtherItems.reduce((acc, item) => {
    let bin = item.bin;
    if (bin === null) bin = "(NULL)";
    else if (bin === "") bin = "";

    if (!acc[bin]) {
      acc[bin] = {
        bin: bin,
        items: [],
        totalItems: 0,
      };
    }

    // Avoid adding the same item multiple times to the same bin
    if (item.mid && !acc[bin].items.find((i) => i.mid === item.mid)) {
      acc[bin].items.push(item);
      acc[bin].totalItems += 1;
    }
    return acc;
  }, {});

  const otherBins = Object.values(groupedOtherData).sort((a, b) => {
    // Priority sorting for special bins
    if (a.bin === "(NULL)" && b.bin !== "(NULL)") return -1;
    if (a.bin !== "(NULL)" && b.bin === "(NULL)") return 1;
    if (a.bin === "" && b.bin !== "") return -1;
    if (a.bin !== "" && b.bin === "") return 1;
    if (a.bin === "-" && b.bin !== "-") return -1;
    if (a.bin !== "-" && b.bin === "-") return 1;
    return a.bin.localeCompare(b.bin, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  const finalBins = otherBins;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
      <div id="search-bar" className="fixed inset-x-0 top-0 z-50 ">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3 bg-white rounded-b ">
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
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
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
                  <p className="text-xs font-bold uppercase   text-slate-400 mb-2">
                    Sort By
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Bin Name", value: "bin" },
                      { label: "Material ID", value: "mid" },
                      { label: "Description", value: "desc" },
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

                <div>
                  <p className="text-xs font-bold uppercase   text-slate-400 mb-2">
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
        ) : finalBins.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-sm font-medium">
            Data tidak ditemukan.
          </p>
        ) : (
          <div className="space-y-6">
            {otherBins.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-slate-500 px-1">
                  Bin List
                </p>
                <div className="space-y-1">
                  {otherBins.map((group) => (
                    <BinCard
                      key={group.bin}
                      group={group}
                      expandedId={expandedId}
                      setExpandedId={setExpandedId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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
          finalBins.length > 0 && (
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
