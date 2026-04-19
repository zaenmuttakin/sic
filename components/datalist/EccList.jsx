"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LoaderCircle,
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function EccList() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [sortBy, setSortBy] = useState("old_mat");
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

  const { data, status } = useQuery({
    queryKey: ["old_mid", debouncedSearch, sortBy, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from("old_mid")
        .select("*")
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (debouncedSearch) {
        const isNumber = /^\d+$/.test(debouncedSearch);
        const filter = isNumber
          ? `old_mat.eq.${debouncedSearch},old_mat.ilike.%${debouncedSearch}%,old_desc.ilike.%${debouncedSearch}%`
          : `old_mat.ilike.%${debouncedSearch}%,old_desc.ilike.%${debouncedSearch}%,new_mat.ilike.%${debouncedSearch}%,new_desc.ilike.%${debouncedSearch}%`;

        query = query.or(filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const groupedData = data
    ? data.reduce((acc, item) => {
        const key = item.old_mat;
        if (!acc[key]) {
          acc[key] = { old_mat: item.old_mat, items: [], newMats: new Set() };
        }
        acc[key].items.push(item);
        acc[key].newMats.add(item.new_mat);
        return acc;
      }, {})
    : {};

  const groupedArray = Object.values(groupedData).map((group) => ({
    old_mat: group.old_mat,
    items: group.items,
    newCount: group.newMats.size,
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
      <div id="search-bar" className="fixed inset-x-0 top-0 z-50 ">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3 bg-white rounded-b ">
          <input
            type="text"
            placeholder="Cari old MID atau Deskripsi..."
            className="flex-1 w-full h-12 rounded-2xl border border-blue-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setSortControl((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              sortControl
                ? "border-blue-300 bg-blue-50 text-blue-600"
                : "border-blue-50 bg-slate-50 text-gray-500"
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
              className="mx-auto max-w-2xl w-full rounded shadow overflow-hidden border-t border-slate-100 bg-white"
            >
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
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
                            ? "border-blue-300 bg-blue-50 text-blue-600"
                            : "border-slate-200 bg-white text-gray-500 hover:bg-slate-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
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
                              ? "border-blue-300 bg-blue-50 text-blue-600"
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
        {status === "loading" ? (
          <div className="w-full flex items-center justify-center py-10">
            <LoaderCircle className="animate-spin text-blue-400" />
          </div>
        ) : groupedArray.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-sm font-medium">
            Data tidak ditemukan.
          </p>
        ) : (
          groupedArray.map((group, idx) => {
            const isExpanded = expandedId === group.old_mat;
            return (
              <motion.div
                key={group.old_mat}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
              >
                <div
                  onClick={() =>
                    setExpandedId(isExpanded ? null : group.old_mat)
                  }
                  className={`cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 ${
                    isExpanded
                      ? "border-blue-200 bg-white shadow-xl shadow-blue-200/40"
                      : "border-slate-200/80 bg-white hover:border-blue-100 hover:shadow-sm"
                  }`}
                >
                  <div className="p-4 px-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap gap-1">
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                            OLD MID {group.old_mat}
                          </span>
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {group.newCount} Mapping
                          </span>
                        </div>
                        <p
                          className={`font-semibold leading-tight text-slate-800 text-sm transition-all ${isExpanded ? "mb-1" : "line-clamp-1"}`}
                        >
                          {group.items[0]?.old_desc ||
                            "No Description Available"}
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
                            <div className="space-y-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
                                Mapped to New MID
                              </p>
                              <div className="grid grid-cols-1 gap-2">
                                {group.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="group relative flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-white hover:shadow-sm hover:border-blue-100/50"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="rounded-full bg-blue-100/40 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                                        {item.new_mat}
                                      </span>
                                      <Link
                                        href={`/private/data?q=${item.new_mat}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                        title="Search in Inventory"
                                      >
                                        <ExternalLink size={14} />
                                      </Link>
                                    </div>
                                    <p className="text-[13px] text-slate-600 font-semibold leading-snug">
                                      {item.new_desc}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-6 flex justify-end">
                                <Link
                                  href={`/detailsecc/${group.old_mat}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-500 transition-all hover:bg-slate-50 active:scale-[0.98]"
                                >
                                  View Mapping History
                                  <ChevronDown
                                    size={14}
                                    className="-rotate-90"
                                  />
                                </Link>
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
    </div>
  );
}
