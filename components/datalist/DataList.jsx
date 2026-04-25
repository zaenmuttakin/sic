"use client";
import {
  LoaderCircle,
  ChevronDown,
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  X,
  Copy,
  Archive,
  ClipboardCheck,
  ChevronRight,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  useDataList,
  calculateTotalStock,
  calculateOtherStock,
} from "@/lib/useDataList";

export default function DataList() {
  const {
    ref,
    searchTerm,
    setSearchTerm,
    sortControl,
    setSortControl,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    expandedId,
    binCache,
    copiedId,
    isLoading,
    data,
    hasNextPage,
    isFetchingNextPage,
    handleBinClick,
    handleCopy,
    toggleExpand,
    push,
  } = useDataList();

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
      {/* Top Vignette/Gradient */}
      <div className="fixed inset-x-0 top-0 z-40 h-10 pointer-events-none bg-indigo-100" />
      <div className="fixed inset-x-0 top-4 z-40 h-20 pointer-events-none bg-gradient-to-b from-indigo-100 via-indigo-100 to-transparent" />

      <div id="search-bar" className="fixed inset-x-0 top-0 z-50 ">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3 bg-white rounded-b ">
          <div className="flex-1 relative group">
            <input
              type="text"
              placeholder="Cari MID atau Deskripsi..."
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

      <div id="data-list" className="space-y-2">
        <p className="text-xs font-bold uppercase text-slate-500 px-1">
          Material Data
        </p>
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
                return (
                  <motion.div
                    key={item.mid}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10px" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div
                      onClick={() => toggleExpand(item.mid)}
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
                              <span className="flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold uppercase text-indigo-500">
                                <Package size={14} /> {item.mid}
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
                          <div className="flex items-center gap-1 ml-2 mt-0.5">
                            <Link
                              href={`/private/data/detail/${item.mid}`}
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
                                        ].map((sub) => (
                                          <div
                                            key={sub.label}
                                            className="relative flex items-center justify-between text-sm py-1.5 pl-6"
                                          >
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

                                    <div className="flex items-center gap-4">
                                      <span className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500">
                                        Other
                                      </span>
                                      <div className="flex-1 h-px bg-slate-100" />
                                      <span className="text-xs text-slate-700">
                                        {calculateOtherStock(item)}
                                      </span>
                                    </div>
                                  </div>
                                  {/* Right Side: Storage Bins */}
                                  <div className="flex flex-col justify-start items-start gap-4 pr-3">
                                    <div className="w-full flex-1 flex flex-col gap-2 h-full">
                                      <span className="w-fit rounded-full bg-slate-100/80 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                                        Stor. Bin
                                      </span>
                                      <div className="bg-slate-50/50 p-3 h-full border border-slate-100 rounded-xl space-y-2">
                                        {binCache[item.mid]?.loading ? (
                                          <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <LoaderCircle
                                              size={12}
                                              className="animate-spin"
                                            />
                                            <span>Loading...</span>
                                          </div>
                                        ) : binCache[item.mid]?.items?.length >
                                          0 ? (
                                          binCache[item.mid].items.map(
                                            (b, idx) => (
                                              <div
                                                key={idx}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleBinClick(
                                                    b.bin,
                                                    item.mid,
                                                    item.desc
                                                  );
                                                }}
                                                className="cursor-pointer group"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <span
                                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                      b.type === "R"
                                                        ? "bg-amber-400"
                                                        : "bg-emerald-400"
                                                    }`}
                                                  />
                                                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 group-hover:underline transition-colors truncate">
                                                    {b.bin}
                                                  </span>
                                                </div>
                                                {b.detail && (
                                                  <p className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded mt-1 ml-3.5 uppercase tracking-tight">
                                                    {b.detail}
                                                  </p>
                                                )}
                                              </div>
                                            )
                                          )
                                        ) : (
                                          <div
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              push(
                                                `/private/bin/adding/${item.mid}?desc=${encodeURIComponent(item.desc)}`
                                              );
                                            }}
                                            className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors"
                                          >
                                            <span className="text-slate-300">
                                              —
                                            </span>
                                            <span className="hover:underline">
                                              No bin · Assign one
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex w-full justify-end items-center gap-2 ml-2 mt-0.5">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const firstBin = (item.bin_sap || "")
                                            .split(",")[0]
                                            .trim();
                                          handleBinClick(
                                            firstBin,
                                            item.mid,
                                            item.desc
                                          );
                                        }}
                                        className="flex items-center text-xs gap-2 px-3 py-1.5 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 bg-slate-50 transition-colors active:scale-95"
                                      >
                                        <Archive size={16} />
                                        <span>Bin</span>
                                      </button>
                                      <div className="mx-1 h-4 w-px bg-slate-200" />
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopy(item);
                                        }}
                                        className={`text-xs gap-2 px-2 py-1.5 rounded-full transition-colors bg-slate-50 active:scale-95 ${
                                          copiedId === item.mid
                                            ? "text-emerald-600 bg-emerald-50"
                                            : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                        }`}
                                      >
                                        {copiedId === item.mid ? (
                                          <ClipboardCheck size={16} />
                                        ) : (
                                          <Copy size={16} />
                                        )}
                                      </button>
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
