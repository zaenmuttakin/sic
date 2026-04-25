"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  FileSpreadsheet,
  Download,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Database,
  HardDrive,
  Rows3,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useUndo } from "@/context/UndoContext";

const PAGE_SIZE = 1000;

export default function ExportPage() {
  const router = useRouter();
  const { showUndo, showError, showLoading, hideToast } = useUndo();

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [excludeZeroStock, setExcludeZeroStock] = useState(true);
  const [preview, setPreview] = useState(null); // { rowCount, columns, sampleRows, estimatedSize }
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 1: Fetch preview data (count + sample)
  const handlePreview = async () => {
    setIsLoading(true);
    setPreview(null);

    try {
      // Fetch total count using a small query with head:true
      let countQuery = supabase
        .from("full_inv_data")
        .select("*", { count: "exact", head: true });

      if (excludeZeroStock) {
        countQuery = countQuery.neq("total_stock", 0);
      }

      const { count, error: countError } = await countQuery;

      if (countError) throw countError;

      // Fetch a sample of rows
      let sampleQuery = supabase.from("full_inv_data").select("*");

      if (excludeZeroStock) {
        sampleQuery = sampleQuery.neq("total_stock", 0);
      }

      const { data: sample, error: sampleError } = await sampleQuery
        .order("bin_sic", { ascending: true, nullsFirst: true })
        .order("mid", { ascending: true })
        .range(0, 4);

      if (sampleError) throw sampleError;

      const columns = sample && sample.length > 0 ? Object.keys(sample[0]) : [];
      // Rough estimate: ~200 bytes per row per column for Excel with more columns
      const estimatedBytes = (count || 0) * columns.length * 40;

      setPreview({
        rowCount: count || 0,
        columns,
        sampleRows: sample || [],
        estimatedSize: estimatedBytes,
      });
    } catch (err) {
      showError(err.message || "Failed to load preview.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Export full data to Excel
  const handleExport = async () => {
    setShowConfirm(false);
    setIsExporting(true);
    showLoading("Preparing export...");

    try {
      const { utils, writeFile } = await import("xlsx");

      // Fetch all data in pages
      let allData = [];
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase.from("full_inv_data").select("*");

        if (excludeZeroStock) {
          query = query.neq("total_stock", 0);
        }

        const { data, error } = await query
          .order("bin_sic", { ascending: true, nullsFirst: true })
          .order("mid", { ascending: true })
          .range(from, to);

        if (error) throw error;

        if (data && data.length > 0) {
          allData = allData.concat(data);
          if (data.length < PAGE_SIZE) hasMore = false;
        } else {
          hasMore = false;
        }
        page++;
      }

      if (allData.length === 0) {
        hideToast();
        showError("No data to export.");
        setIsExporting(false);
        return;
      }

      // Format column headers nicely
      const headerMap = {
        bin_sic: "BIN SIC",
        bin_sap: "BIN SAP",
        mid: "MATERIAL ID",
        description: "DESCRIPTION",
        uom: "UOM",
        total_stock: "TOTAL STOCK",
        central_stock: "CENTRAL STOCK",
        bin_match: "BIN MATCH?",
        bin_detail: "BIN DETAIL",
        bin_type: "BIN TYPE",
        draft: "DRAFT",
        project: "PROJECT",
        actual: "ACTUAL",
        gt01: "GT01",
        g002: "G002",
        g003: "G003",
        g004: "G004",
        sheets_update_at: "SHEETS UPDATED",
        bins_update_at: "BINS UPDATED",
        bin_updated_by: "UPDATED BY",
        raw_mid_sheets: "MID SHEETS",
        raw_mid_bins: "MID BINS",
      };

      // Remap data with clean headers
      const exportData = allData.map((row) => {
        const mapped = {};
        for (const [key, label] of Object.entries(headerMap)) {
          let val = row[key];
          if (key === "bin_match") val = val ? "MATCH" : "MISMATCH";
          mapped[label] = val ?? "";
        }
        return mapped;
      });

      // Create workbook
      const ws = utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths = Object.values(headerMap).map((header) => {
        const maxLen = Math.max(
          header.length,
          ...exportData.slice(0, 100).map((r) => String(r[header] || "").length)
        );
        return { wch: Math.min(maxLen + 2, 50) };
      });
      ws["!cols"] = colWidths;

      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Inventory Report");

      // Generate filename with date
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const filename = `SIC_FullInventory_${dateStr}${excludeZeroStock ? "_NoZero" : "_All"}.xlsx`;

      writeFile(wb, filename);

      hideToast();
      showUndo(`Exported ${allData.length} rows to ${filename}`);
    } catch (err) {
      hideToast();
      console.error(err);
      showError(err.message || "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-2xl w-full mx-auto px-5 py-6 bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:scale-95"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="space-y-6">
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-500 mb-3">
            <FileSpreadsheet size={18} />
            <span className="text-xs font-bold uppercase ">Export</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Inventory Report
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Generate full report from bins and sheets data.
          </p>
        </header>

        {/* Filters */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Export Options
          </p>
          <div
            onClick={() => {
              setExcludeZeroStock(!excludeZeroStock);
              setPreview(null);
            }}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-700">
                No-Zero Stock Items
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Exclude items with zero or empty total stock
              </p>
            </div>
            <div
              className={`w-12 h-6 rounded-full transition-colors relative ${
                excludeZeroStock ? "bg-indigo-500" : "bg-slate-200"
              }`}
            >
              <motion.div
                animate={{ x: excludeZeroStock ? 26 : 2 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Load Preview Button */}
        {!preview && (
          <button
            onClick={handlePreview}
            disabled={isLoading}
            className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold text-sm uppercase  shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <LoaderCircle size={20} className="animate-spin" />
            ) : (
              <>
                <Database size={20} />
                Load Data Preview
              </>
            )}
          </button>
        )}

        {/* Data Preview Card */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100/60 text-center">
                  <Rows3 size={20} className="mx-auto text-indigo-500 mb-2" />
                  <p className="text-xl font-bold text-indigo-600">
                    {preview.rowCount.toLocaleString()}
                  </p>
                  <p className="text-xs font-bold text-indigo-400 uppercase">
                    Rows
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <Database size={20} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-xl font-bold text-slate-700">
                    {preview.columns.length}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Columns
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <HardDrive
                    size={20}
                    className="mx-auto text-slate-400 mb-2"
                  />
                  <p className="text-xl font-bold text-slate-700">
                    ~{formatBytes(preview.estimatedSize)}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Est. Size
                  </p>
                </div>
              </div>

              {/* Sample Data */}
              {preview.sampleRows.length > 0 && (
                <div className="p-4 bg-white rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase  mb-3">
                    Sample Preview (first {preview.sampleRows.length} rows)
                  </p>
                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {["bin_sic", "mid", "description", "total_stock"].map(
                            (col) => (
                              <th
                                key={col}
                                className="text-left py-2 px-2 font-bold text-slate-400 uppercase whitespace-nowrap"
                              >
                                {col.replace(/_/g, " ")}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.sampleRows.map((row, i) => (
                          <tr
                            key={i}
                            className="border-b border-slate-50 last:border-0"
                          >
                            <td className="py-2 px-2 font-bold text-indigo-600 whitespace-nowrap">
                              {row.bin_sic || "-"}
                            </td>
                            <td className="py-2 px-2 font-semibold text-slate-600 whitespace-nowrap">
                              {row.mid || "-"}
                            </td>
                            <td className="py-2 px-2 text-slate-500 max-w-[160px] truncate">
                              {row.description || "-"}
                            </td>
                            <td className="py-2 px-2 font-black text-slate-800">
                              {row.total_stock || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={() => setShowConfirm(true)}
                disabled={isExporting || preview.rowCount === 0}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-sm uppercase  shadow-2xl shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isExporting ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : (
                  <>
                    <Download size={20} />
                    Export to Excel
                  </>
                )}
              </button>

              {/* Refresh Preview */}
              <button
                onClick={handlePreview}
                disabled={isLoading}
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl text-xs font-bold uppercase active:scale-95 transition-all"
              >
                {isLoading ? (
                  <LoaderCircle size={14} className="animate-spin mx-auto" />
                ) : (
                  "Refresh Preview"
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && preview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="p-4 bg-emerald-50 rounded-full inline-flex mb-5">
                <FileSpreadsheet size={28} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Export to Excel?
              </h3>
              <p className="text-xs text-slate-500  mb-2 leading-relaxed">
                You are about to export{" "}
                <span className="font-black text-indigo-600">
                  {preview.rowCount.toLocaleString()}
                </span>{" "}
                rows of inventory data.
              </p>
              <div className="my-5 p-4 bg-slate-50 rounded-2xl space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Filter
                  </span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {excludeZeroStock ? "No-Zero Stock" : "All Stock"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Est. File Size
                  </span>
                  <span className="text-sm font-black text-slate-700">
                    ~{formatBytes(preview.estimatedSize)}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-2xl text-xs font-bold uppercase active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 py-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-bold uppercase shadow-lg shadow-emerald-100 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Download size={14} />
                      Download
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
