"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Search,
  LoaderCircle,
  Package,
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useUndo } from "@/context/UndoContext";
import QrScannerModal from "@/components/scanner/QrScannerModal";
import { QrCode } from "lucide-react";

export default function BinAdding() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showUndo, showLoading, showError } = useUndo();

  const mid = params.id;
  const desc = searchParams.get("desc");
  const targetBin = searchParams.get("targetBin");

  const [binSearch, setBinSearch] = useState(targetBin || "");
  const [isSearching, setIsSearching] = useState(false);
  const [binStatus, setBinStatus] = useState(null); // { name, type, materials: [], isEmpty: true }
  const [searchError, setSearchError] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    if (targetBin) {
      handleSearchBin(targetBin);
    }
  }, [targetBin]);

  const handleSearchBin = async (overrideBin) => {
    const searchVal = typeof overrideBin === "string" ? overrideBin : binSearch;
    if (!searchVal.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setBinStatus(null);

    try {
      const { data, error } = await supabase
        .from("bins")
        .select("*")
        .eq("bin", searchVal.trim().toUpperCase());

      if (error) throw error;

      if (!data || data.length === 0) {
        setSearchError(
          `Bin "${searchVal.trim().toUpperCase()}" is not registered.`
        );
        showError(`Bin "${searchVal.trim().toUpperCase()}" not found.`);
        setBinStatus(null);
      } else {
        const activeMaterials = data.filter((m) => m.mid);
        setBinStatus({
          name: data[0].bin,
          type: data[0].type || "Z",
          materials: activeMaterials,
          isEmpty: activeMaterials.length === 0,
          exists: true,
          rawItems: data,
        });
      }
    } catch (err) {
      console.error(err);
      setSearchError("Failed to search bin");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToBin = async () => {
    if (!binStatus) return;

    showLoading(`Adding ${mid} to ${binStatus.name}...`);

    try {
      const savedUser =
        typeof window !== "undefined" ? localStorage.getItem("sic_user") : null;
      const nickname = savedUser ? JSON.parse(savedUser).nickname : null;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userNickname =
        nickname || user?.user_metadata?.nickname || user?.email || "system";
      const updateAt = new Date().toISOString();

      // Rule: If Rack (R) and has empty slot, update that slot
      if (binStatus.type === "R") {
        const emptySlot = binStatus.rawItems?.find((m) => !m.mid);
        if (emptySlot) {
          const { error } = await supabase
            .from("bins")
            .update({
              mid: mid,
              desc: desc,
              user: userNickname,
              update_at: updateAt,
            })
            .eq("id", emptySlot.id);
          if (error) throw error;
        } else {
          // Rack is full (since binStatus.exists is always true here)
          throw new Error("Rack bin is full (1 item only)");
        }
      } else {
        // Zone (Z) - always insert new row for the existing bin
        const { error } = await supabase.from("bins").insert({
          bin: binStatus.name,
          mid: mid,
          desc: desc,
          type: binStatus.type,
          user: userNickname,
          update_at: updateAt,
        });
        if (error) throw error;
      }

      showUndo(`Material ${mid} added to ${binStatus.name}`);
      router.push(`/private/bin/detail/${encodeURIComponent(binStatus.name)}`);
    } catch (err) {
      showError(err.message || "Failed to add material");
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-6 bg-white min-h-screen">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="space-y-6">
        {/* Material Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-indigo-100 p-5 shadow-xl shadow-indigo-200/20"
        >
          <div className="flex items-center gap-6">
            <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-200">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase mb-1.5">
                Target Material
              </p>
              <h1 className=" font-bold text-slate-800 leading-tight mb-1">
                {desc}
              </h1>
              <p className="text-xs font-bold text-slate-400">MID: {mid}</p>
            </div>
          </div>
        </motion.div>

        {/* Bin Search Section */}
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search Bin Name (e.g. AA-01-01-01).."
              value={binSearch}
              onChange={(e) => setBinSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchBin()}
              className="w-full pl-12 pr-14 py-4 bg-white border border-indigo-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 shadow-sm transition-all"
            />

            <button
              onClick={() => handleSearchBin()}
              disabled={isSearching || !binSearch.trim()}
              className="absolute right-16 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase hover:bg-indigo-700 transition-all"
            >
              {isSearching ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                "Check"
              )}
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"
              title="Scan QR Code"
            >
              <QrCode size={20} strokeWidth={2.5} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {searchError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500"
              >
                <AlertCircle size={18} />
                <p className="text-xs font-bold uppercase">{searchError}</p>
              </motion.div>
            )}

            {binStatus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-indigo-100 overflow-hidden shadow-xl shadow-indigo-200/10"
              >
                {/* Header row with name, type badge, status, and CTA */}
                <div
                  className={`p-5 flex items-center justify-between gap-3 ${binStatus.isEmpty ? "bg-emerald-50/50" : "bg-amber-50/50"}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`shrink-0 p-2.5 rounded-xl ${binStatus.isEmpty ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}
                    >
                      {binStatus.isEmpty ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Info size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-slate-800 uppercase">
                          {binStatus.name}
                        </h3>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            binStatus.type === "R"
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}
                        >
                          {binStatus.type === "R" ? "RACK" : "ZONE"}
                        </span>
                      </div>
                      <p
                        className={`text-xs font-black uppercase mt-0.5 ${binStatus.isEmpty ? "text-emerald-500" : "text-amber-500"}`}
                      >
                        {binStatus.isEmpty
                          ? "Available / Empty"
                          : `${binStatus.materials.length} Item${binStatus.materials.length !== 1 ? "s" : ""} Inside`}
                      </p>
                    </div>
                  </div>

                  {/* CTA in header */}
                  {binStatus.type === "R" && !binStatus.isEmpty ? (
                    <button
                      onClick={() =>
                        router.push(
                          `/private/bin/detail/${encodeURIComponent(binStatus.name)}`
                        )
                      }
                      className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-500 text-white text-xs font-black uppercase shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      <ArrowRight size={14} />
                      Edit Bin
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToBin}
                      className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-500 text-white text-xs font-black uppercase shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      <Plus size={14} />
                      Confirm Add
                    </button>
                  )}
                </div>

                {!binStatus.isEmpty && (
                  <div className="p-4 border-t border-indigo-50 space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase px-1">
                      Current Materials
                    </p>
                    <div className="space-y-1.5">
                      {binStatus.materials.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                        >
                          <Package size={14} className="text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {m.desc}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400">
                              MID: {m.mid}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Tips */}
        {!binStatus && (
          <div className="p-6 rounded-3xl border-2 border-dashed border-indigo-100 text-center">
            <Info className="mx-auto text-indigo-200 mb-3" size={32} />
            <h4 className="text-xs font-bold text-indigo-400 uppercase mb-1">
              Select a bin location
            </h4>
            <p className="text-xs font-medium text-slate-400 max-w-xs mx-auto">
              Enter the bin name where you want to store this material. We will
              check if the location is available or if it's already used.
            </p>
          </div>
        )}
      </div>

      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(text) => {
          setBinSearch(text);
          handleSearchBin(text);
        }}
      />
    </div>
  );
}
