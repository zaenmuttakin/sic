"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Search,
  Box,
  Trash2,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRightLeft,
  Plus,
  Info,
  X,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useUndo } from "@/context/UndoContext";

export default function BinToBin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showUndo, showError, showLoading } = useUndo();

  const [searchInput, setSearchInput] = useState("");
  const [items, setItems] = useState([]); // { mid, desc, currentBins, targetBin, status: { type, message } }
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auth check
  useEffect(() => {
    const savedUser = localStorage.getItem("sic_user");
    if (!savedUser || JSON.parse(savedUser).role !== "superuser") {
      router.push("/private");
    }
  }, [router]);

  // Load MIDs from URL if present
  useEffect(() => {
    const midsParam = searchParams.get("mids");
    if (midsParam) {
      const midList = midsParam.split(",").map((m) => m.trim());
      midList.forEach((mid) => fetchAndAddItem(mid));
    }
  }, [searchParams]);

  const fetchAndAddItem = async (mid) => {
    if (!mid) return;
    const cleanMid = mid.trim().toUpperCase();
    if (items.some((item) => item.mid === cleanMid)) {
      showError(`MID ${cleanMid} already in list.`);
      return;
    }

    setIsSearching(true);
    try {
      const { data: material, error: matError } = await supabase
        .from("from_sheets")
        .select("mid, desc")
        .eq("mid", cleanMid)
        .single();

      if (matError) throw new Error("Material not found.");

      const { data: currentBins, error: binError } = await supabase
        .from("bins")
        .select("bin, type")
        .eq("mid", cleanMid);

      if (binError) throw binError;

      setItems((prev) => [
        {
          mid: material.mid,
          desc: material.desc,
          currentBins: currentBins || [],
          targetBin: "",
          status: null,
        },
        ...prev,
      ]);
      setSearchInput("");
    } catch (err) {
      console.error(err);
      showError(err.message || "Failed to add material.");
    } finally {
      setIsSearching(false);
    }
  };

  const removeItem = (mid) => {
    setItems((prev) => prev.filter((item) => item.mid !== mid));
  };

  const validationTimeout = useRef({});

  const validateBin = (mid, binName) => {
    const upperBin = binName.trim().toUpperCase();

    // Clear previous timeout for this MID
    if (validationTimeout.current[mid]) {
      clearTimeout(validationTimeout.current[mid]);
    }

    if (!binName.trim()) {
      updateItemStatus(mid, binName, null);
      return;
    }

    // Debounce validation
    validationTimeout.current[mid] = setTimeout(async () => {
      try {
        const { data: binDef, error: binError } = await supabase
          .from("bins")
          .select("bin, type, mid")
          .eq("bin", upperBin);

        if (binError) throw binError;

        let status = null;
        if (!binDef || binDef.length === 0) {
          status = { type: "info", message: "Not Regist." };
        } else {
          const type = binDef[0].type;
          const assignedMids = binDef.map((b) => b.mid).filter(Boolean);
          const isAlreadyThere = assignedMids.includes(mid);

          if (type === "R") {
            if (assignedMids.length === 0) {
              status = { type: "success", message: "OK - Is empty" };
            } else if (isAlreadyThere) {
              status = { type: "warning", message: "Exist" };
            } else {
              status = { type: "error", message: "Bin sudah terisi" };
            }
          } else {
            // Zone (Z)
            if (isAlreadyThere) {
              status = { type: "warning", message: "Exist" };
            } else {
              status = { type: "success", message: "OK" };
            }
          }
        }

        // Only update if the targetBin hasn't changed since we started
        setItems((prev) =>
          prev.map((item) =>
            item.mid === mid && item.targetBin.toUpperCase() === upperBin
              ? { ...item, status }
              : item
          )
        );
      } catch (err) {
        console.error(err);
      }
    }, 400); // 400ms debounce
  };

  const updateItemStatus = (mid, targetBin, status) => {
    setItems((prev) =>
      prev.map((item) =>
        item.mid === mid ? { ...item, targetBin, status } : item
      )
    );
  };

  const handleSave = async () => {
    const validItems = items.filter(
      (item) => item.targetBin && item.status?.type !== "error"
    );

    if (validItems.length === 0) return;

    setIsSaving(true);
    showLoading(`Processing...`);

    const savedUser = localStorage.getItem("sic_user");
    const userNickname = savedUser ? JSON.parse(savedUser).nickname : "system";

    try {
      for (const item of validItems) {
        const upperBin = item.targetBin.trim().toUpperCase();
        const { error: upsertError } = await supabase.from("bins").upsert(
          {
            mid: item.mid,
            bin: upperBin,
            type: "Z",
            user: userNickname,
            update_at: new Date().toISOString(),
            detail_change: `Transfer from ${item.currentBins.map((b) => b.bin).join(", ")}`,
          },
          { onConflict: "mid, bin" }
        );

        if (upsertError) throw upsertError;
      }

      showUndo(`Transferred ${validItems.length} items.`);
      setItems([]);
    } catch (err) {
      console.error(err);
      showError(err.message || "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const canSave =
    items.length > 0 &&
    items.some((i) => i.targetBin && i.status?.type !== "error");

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-6 bg-white min-h-screen">
      {/* Header matching EditImage */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:scale-95"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-all active:scale-95 shadow-lg ${
            canSave
              ? "bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-100"
              : "bg-slate-100 text-slate-400 shadow-transparent cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save (
          {
            items.filter((i) => i.targetBin && i.status?.type !== "error")
              .length
          }
          )
        </button>
      </div>

      {/* Main Card matching EditImage */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-xl shadow-indigo-200/20"
      >
        <div className="p-4 pt-6 space-y-4">
          {/* Search Box inside Card Content */}
          <div className="relative group flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="ADD MID (E.G. 1000...)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && fetchAndAddItem(searchInput)
                }
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all placeholder:text-slate-300 uppercase"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <LoaderCircle
                    size={16}
                    className="animate-spin text-indigo-500"
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => fetchAndAddItem(searchInput)}
              disabled={isSearching || !searchInput}
              className="px-4 rounded-2xl bg-indigo-500 text-white font-bold text-xs uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-80 flex items-center gap-2"
            >
              <Plus size={16} strokeWidth={3} />
              Add
            </button>
          </div>

          {/* List of Items */}
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.mid}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col gap-3 bg-slate-50/30 border border-slate-100 rounded-2xl p-4 transition-all hover:border-indigo-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1.5">
                        <span className="text-xs font-bold text-indigo-500">
                          {item.mid}
                        </span>
                        <div className="flex gap-1">
                          {item.currentBins.map((b) => (
                            <span
                              key={b.bin}
                              className="px-2 py-[2px] bg-indigo-500 text-white rounded-full text-[9px] font-bold bg-indigo-500"
                            >
                              {b.bin}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs font-bold text-slate-500 truncate uppercase">
                        {item.desc}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.mid)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Target Bin Input Area */}
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 relative pb-3">
                      <input
                        type="text"
                        placeholder="TARGET BIN"
                        value={item.targetBin}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateItemStatus(item.mid, val, null);
                          validateBin(item.mid, val);
                        }}
                        className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs font-bold uppercase focus:outline-none transition-all ${
                          item.status?.type === "error"
                            ? "border-red-200 text-red-600 ring-2 ring-red-500/5"
                            : item.status?.type === "success"
                              ? "border-emerald-200 text-emerald-600 ring-2 ring-emerald-500/5"
                              : "border-slate-100 focus:border-indigo-400 ring-2 ring-indigo-500/5"
                        }`}
                      />
                      {item.status && (
                        <div
                          className={`absolute -bottom-2 right-1 mt-0 text-[8px] font-medium px-2 py-.5 rounded-md border ${
                            item.status.type === "error"
                              ? "text-red-500 bg-red-50 border-red-50"
                              : item.status.type === "warning"
                                ? "text-amber-500 bg-amber-50 border-amber-50"
                                : item.status.type === "info"
                                  ? "text-blue-500 bg-blue-50 border-blue-50"
                                  : "text-emerald-500 bg-emerald-50 border-emerald-50"
                          }`}
                        >
                          {item.status.message}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {items.length === 0 && !isSearching && (
              <div className="py-12 flex flex-col items-center justify-center opacity-20 text-slate-400 space-y-2">
                <Box size={40} />
                <p className="text-[10px] font-black uppercase">
                  No items in queue
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info matching EditImage */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center gap-3">
          <AlertCircle size={16} className="text-slate-400 shrink-0" />
          <p className="text-[10px] text-slate-400 leading-tight">
            Transfers are performed as Zone updates. Rack locations are
            disallowed to ensure single-material integrity.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
