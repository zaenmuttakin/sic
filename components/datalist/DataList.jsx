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
  Search,
  SlidersHorizontal,
  RotateCcw,
  Image as ImageIcon,
  Check,
  BadgeCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  useDataList,
  calculateTotalStock,
  calculateOtherStock,
} from "@/lib/useDataList";

export default function DataList() {
  const list = useDataList();
  const { isLoading, data, searchQuery, ref, isFetchingNextPage, hasNextPage } =
    list;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
      <SearchHeader list={list} />

      <div id="data-list" className="space-y-2">
        <p className="text-xs font-bold uppercase text-slate-500 px-1">
          Material Data
        </p>

        {isLoading ? (
          <LoadingState />
        ) : !searchQuery ? (
          <EmptyState />
        ) : data?.pages[0].length === 0 ? (
          <NoResults query={searchQuery} />
        ) : (
          <div className="space-y-2">
            {data?.pages.map((group, i) => (
              <div key={i} className="flex flex-col gap-1">
                {group.map((item) => (
                  <MaterialCard key={item.mid} item={item} list={list} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <FooterPagination
        innerRef={ref}
        isFetching={isFetchingNextPage}
        hasNext={hasNextPage}
        hasResults={data?.pages[0]?.length > 0}
        searchQuery={searchQuery}
      />
    </div>
  );
}

/**
 * Sub-components for cleaner structure
 */

function SearchHeader({ list }) {
  const {
    searchTerm,
    setSearchTerm,
    handleSearch,
    handleClear,
    sortControl,
    setSortControl,
    activeFiltersCount,
  } = list;

  return (
    <div id="search-bar" className="fixed inset-x-0 top-0 z-50">
      <form
        onSubmit={handleSearch}
        className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3 bg-white rounded-b shadow-sm"
      >
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

      <SettingsPanel list={list} />
    </div>
  );
}

function SettingsPanel({ list }) {
  const {
    sortControl,
    handleReset,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    onlyOnStock,
    setOnlyOnStock,
  } = list;

  return (
    <AnimatePresence>
      {sortControl && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mx-auto max-w-2xl w-full rounded shadow overflow-hidden border-t border-slate-100 bg-white"
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800">Settings</span>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                <RotateCcw size={14} />
                Default
              </button>
            </div>

            <Section title="Sort By">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "last_sheet_update", label: "Date" },
                  { value: "mid", label: "MID" },
                  { value: "material_name", label: "Desc" },
                ].map((opt) => (
                  <FilterButton
                    key={opt.value}
                    active={sortBy === opt.value}
                    onClick={() => setSortBy(opt.value)}
                    label={opt.label}
                  />
                ))}
              </div>
            </Section>

            <Section title="Filter">
              <FilterButton
                active={onlyOnStock}
                onClick={() => setOnlyOnStock(!onlyOnStock)}
                icon={<Package size={16} />}
                label="On Stock"
              />
            </Section>

            <Section title="Order">
              <div className="flex gap-2">
                {[
                  { value: "asc", label: "Ascending", icon: ArrowUp },
                  { value: "desc", label: "Descending", icon: ArrowDown },
                ].map((opt) => (
                  <FilterButton
                    key={opt.value}
                    active={sortOrder === opt.value}
                    onClick={() => setSortOrder(opt.value)}
                    label={opt.label}
                    icon={<opt.icon size={18} />}
                    className="flex-1"
                  />
                ))}
              </div>
            </Section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MaterialCard({ item, list }) {
  const {
    expandedId,
    toggleExpand,
    handleBinClick,
    handleCopy,
    copiedId,
    push,
  } = list;
  const isExpanded = expandedId === item.mid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px" }}
      transition={{ duration: 0.3 }}
    >
      <div
        onClick={() => toggleExpand(item.mid)}
        className={`cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${
          isExpanded
            ? "border-indigo-200 bg-white shadow-xl shadow-indigo-200/30"
            : "border-slate-200/80 bg-white hover:border-indigo-100 hover:shadow-md hover:bg-slate-50/50"
        }`}
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-1">
                <Badge icon={<Package size={14} />} label={item.mid} primary />
                <Badge label={item.uom} />
                <Badge label={calculateTotalStock(item)} />
                {(item.img1 || item.img2 || item.img3) && (
                  <div className="relative flex items-center ml-3">
                    <ImageIcon size={14} className="text-slate-400" />
                  </div>
                )}
              </div>
              <p
                className={`font-semibold leading-tight text-slate-800 text-sm transition-all ${isExpanded ? "mb-1" : "line-clamp-1"}`}
              >
                {item.desc}
              </p>
            </div>
            <Link
              href={`/private/data/detail/${item.mid}`}
              onClick={(e) => e.stopPropagation()}
              className="flex gap-1 py-1.5 pr-2 pl-3 text-xs bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors active:scale-95"
            >
              Details
              <ChevronRight size={16} />
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
                <div className="grid grid-cols-2 gap-6 sm:flex sm:flex-row sm:gap-6">
                  {/* Stock Details */}
                  <div className="flex-1 space-y-2">
                    <LocationGroup
                      title="G001"
                      items={[
                        { label: "Draft", value: item.draft },
                        {
                          label: "Unrest",
                          value: item.actual - item.project - item.draft,
                        },
                        { label: "Project", value: item.project },
                      ]}
                    />
                    <div className="flex items-center gap-4">
                      <span className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500">
                        Other
                      </span>
                      <div className="flex-1 h-px bg-slate-100" />
                      <span className="text-xs text-slate-700 font-bold">
                        {calculateOtherStock(item)}
                      </span>
                    </div>
                  </div>

                  {/* Bin Details */}
                  <div className="flex-1 flex flex-col gap-2">
                    <span className="w-fit rounded-full bg-slate-100/80 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                      Stor. Bin
                    </span>
                    <div className="bg-slate-50/50 p-3 h-full border border-slate-100 rounded-xl space-y-2 min-h-[80px]">
                      {item.bins?.length > 0 ? (
                        item.bins.map((b, idx) => (
                          <BinItem
                            key={idx}
                            bin={b}
                            onClick={() =>
                              handleBinClick(b.bin, item.mid, item.desc)
                            }
                          />
                        ))
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
                          <span className="text-slate-300">—</span>
                          <span className="hover:underline">
                            No bin · Assign one
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex w-full justify-end items-center gap-2 mt-2">
                      <ActionButton
                        icon={<Archive size={16} />}
                        label="Bin"
                        onClick={() => {
                          const firstBin = (item.bin_sap || "")
                            .split(",")[0]
                            .trim();
                          handleBinClick(firstBin, item.mid, item.desc);
                        }}
                      />
                      <div className="h-4 w-px bg-slate-200" />
                      <ActionButton
                        icon={
                          copiedId === item.mid ? (
                            <ClipboardCheck size={16} />
                          ) : (
                            <Copy size={16} />
                          )
                        }
                        onClick={() => handleCopy(item)}
                        active={copiedId === item.mid}
                        activeClass="text-emerald-600 bg-emerald-50"
                      />
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

/**
 * Utility UI Components
 */

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-400 mb-2">{title}</p>
      {children}
    </div>
  );
}

function FilterButton({ active, onClick, label, icon, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-indigo-300 bg-indigo-50 text-indigo-600 shadow-sm"
          : "border-slate-200 bg-white text-gray-500 hover:bg-slate-100"
      } ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

function Badge({ icon, label, primary, className = "" }) {
  return (
    <span
      className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
        primary ? "bg-indigo-50 text-indigo-500" : "bg-slate-50 text-slate-500"
      } ${className}`}
    >
      {icon} {label}
    </span>
  );
}

function BinItem({ bin, onClick }) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="cursor-pointer group"
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${bin.type === "R" ? "bg-amber-400" : "bg-emerald-400"}`}
        />
        <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 group-hover:underline transition-colors truncate">
          {bin.bin}
        </span>
      </div>
      {bin.detail && (
        <p className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded mt-1 ml-3.5 uppercase tracking-tight">
          {bin.detail}
        </p>
      )}
    </div>
  );
}

function ActionButton({ icon, label, onClick, active, activeClass }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex items-center text-xs gap-2 px-3 py-1.5 rounded-full transition-colors active:scale-95 ${
        active
          ? activeClass
          : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 bg-slate-50"
      }`}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
}

function LocationGroup({ title, items }) {
  return (
    <div className="relative">
      <span className="inline-block rounded-full bg-slate-100/80 px-2.5 py-0.5 text-xs font-bold text-slate-500 mb-2">
        {title}
      </span>
      <div className="ml-3 relative">
        <div className="absolute left-0 top-0 bottom-[14px] w-px bg-slate-200" />
        {items.map((sub) => (
          <div
            key={sub.label}
            className="relative flex items-center justify-between text-sm py-1.5 pl-6"
          >
            <div className="absolute left-0 top-1/2 w-4 h-px bg-slate-200" />
            <span className="text-slate-500 text-xs">{sub.label}</span>
            <div className="mx-3 flex-1 h-px bg-slate-100" />
            <span className="text-slate-700 text-xs font-bold">
              {sub.value}
            </span>
          </div>
        ))}
      </div>
    </div>
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-6">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
        <Package size={40} className="text-indigo-300" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">Mulai Pencarian</h3>
      <p className="text-sm text-slate-500 max-w-xs">
        Masukkan MID atau deskripsi.
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
        <div className="text-gray-400 text-sm flex items-center gap-2">
          No more data
        </div>
      ) : null}
    </div>
  );
}
