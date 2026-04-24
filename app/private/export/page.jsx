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
  const [preview, setPreview] = useState(null); // { rowCount, columns, sampleRows, estimatedSize }
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 1: Fetch preview data (count + sample)
  const handlePreview = async () => {
    setIsLoading(true);
    setPreview(null);

    try {
      // Fetch total count using a small query with head:true
      const { count, error: countError } = await supabase
        .from("export_bin")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      // Fetch a sample of rows
      const { data: sample, error: sampleError } = await supabase
        .from("export_bin")
        .select("*")
        .range(0, 4);

      if (sampleError) throw sampleError;

      const columns = sample && sample.length > 0 ? Object.keys(sample[0]) : [];
      // Rough estimate: ~150 bytes per row per column for Excel
      const estimatedBytes = (count || 0) * columns.length * 30;

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

        const { data, error } = await supabase
          .from("export_bin")
          .select("*")
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
        bin_type: "TYPE",
        material_id: "MATERIAL ID",
        description: "DESCRIPTION",
        uom: "UOM",
        bin_sap: "BIN SAP",
        stock_actual: "ACTUAL",
        stock_draft: "DRAFT",
        stock_project: "PROJECT",
        stock_gt01: "GT01",
        stock_g002: "G002",
        stock_g003: "G003",
        stock_g004: "G004",
        bin_detail: "DETAIL",
        updated_by: "UPDATED BY",
        updated_at: "UPDATED AT",
      };

      // Remap data with clean headers
      const exportData = allData.map((row) => {
        const mapped = {};
        for (const [key, label] of Object.entries(headerMap)) {
          mapped[label] = row[key] ?? "";
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
        return { wch: Math.min(maxLen + 2, 40) };
      });
      ws["!cols"] = colWidths;

      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Bin Inventory");

      // Generate filename with date
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const filename = `SIC_BinExport_${dateStr}.xlsx`;

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
    <div className="max-w-2xl w-full mx-auto px-5 py-6 bg-white min-h-screen">
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
          <h1 className="text-3xl font-extrabold text-slate-800 ">
            Bin Inventory
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Export merged bin + material data to Excel.
          </p>
        </header>

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

              {/* Columns List */}
              <div className="p-4 bg-white rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase  mb-3">
                  Columns Included
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {preview.columns.map((col) => (
                    <span
                      key={col}
                      className="px-2.5 py-1 bg-slate-50 rounded-lg text-[11px] font-bold text-slate-500 uppercase"
                    >
                      {col.replace(/_/g, " ")}
                    </span>
                  ))}
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
                          {[
                            "bin_sic",
                            "material_id",
                            "description",
                            "bin_type",
                          ].map((col) => (
                            <th
                              key={col}
                              className="text-left py-2 px-2 font-bold text-slate-400 uppercase whitespace-nowrap"
                            >
                              {col.replace(/_/g, " ")}
                            </th>
                          ))}
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
                              {row.material_id || "-"}
                            </td>
                            <td className="py-2 px-2 text-slate-500 max-w-[160px] truncate">
                              {row.description || "-"}
                            </td>
                            <td className="py-2 px-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${
                                  row.bin_type === "R"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-indigo-50 text-indigo-600"
                                }`}
                              >
                                {row.bin_type || "-"}
                              </span>
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
              <p className="text-xs text-slate-500  mb-2">
                This will download the full bin inventory data.
              </p>
              <div className="my-5 p-4 bg-slate-50 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Total Rows
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {preview.rowCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Columns
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {preview.columns.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Est. File Size
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
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
