"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  Package,
  ArrowRight,
  Info,
  Search,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  X,
  Edit2,
  RotateCcw,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useUndo } from "@/context/UndoContext";

const calculateTotalStock = (item) => {
  const fields = ["draft", "project", "actual", "gt01", "g002", "g003", "g004"];
  return fields.reduce((sum, field) => sum + (Number(item[field]) || 0), 0);
};

export default function BinDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showUndo, showLoading, showError } = useUndo();
  
  const id = params.id;
  const fromMid = searchParams.get("from");
  const binName = id === "NOBIN" ? "NO BIN" : decodeURIComponent(id);

  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [originalMaterials, setOriginalMaterials] = useState([]);
  
  // Modal states
  const [searchMid, setSearchMid] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);

  const {
    data: items,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bin_detail", id],
    queryFn: async () => {
      let query = supabase.from("from_sheets").select("*");

      if (id === "NOBIN") {
        query = query.or("bin_sap.ilike.NO BIN,bin_sap.ilike.NOBIN");
      } else if (id === "EMPTY") {
        query = query.eq("bin_sap", "");
      } else if (id === "NULL") {
        query = query.is("bin_sap", null);
      } else {
        query = query.eq("bin_sap", binName);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (items) {
      setMaterials(items.map((m) => ({ ...m, isRemoved: false, isNew: false })));
      setOriginalMaterials(items);
    }
  }, [items]);

  // ── Search/Add Logic ───────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchMid.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setShowConfirmAdd(false);
    try {
      const { data, error } = await supabase
        .from("from_sheets")
        .select("*")
        .eq("mid", searchMid.trim())
        .single();

      if (error) {
        setSearchError("Material not found");
        setSearchResult(null);
      } else {
        setSearchResult(data);
      }
    } catch (err) {
      setSearchError("Error searching material");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMaterial = () => {
    if (!searchResult) return;
    if (materials.find((m) => m.mid === searchResult.mid && !m.isRemoved)) {
      setSearchError("Material already in this bin");
      return;
    }

    const currentBins = (searchResult.bin_sap || "").trim();
    if (currentBins && !showConfirmAdd) {
      setShowConfirmAdd(true);
      return;
    }
    
    if (materials.find(m => m.mid === searchResult.mid && m.isRemoved)) {
      setMaterials(materials.map(m => m.mid === searchResult.mid ? { ...m, isRemoved: false } : m));
    } else {
      setMaterials([...materials, { ...searchResult, isNew: true, isRemoved: false }]);
    }
    
    setSearchResult(null);
    setSearchMid("");
    setSearchError(null);
    setShowConfirmAdd(false);
    setIsModalOpen(false);
  };

  const toggleRemove = (mid) => {
    setMaterials(materials.map(m => 
      m.mid === mid ? { ...m, isRemoved: !m.isRemoved } : m
    ));
  };

  // ── Save Logic ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (updatedMaterials) => {
      const finalMaterials = updatedMaterials.filter(m => !m.isRemoved);
      
      const removed = originalMaterials.filter(
        (om) => !finalMaterials.find((um) => um.mid === om.mid)
      );
      for (const item of removed) {
        const newBins = (item.bin_sap || "")
          .split(",")
          .map((b) => b.trim())
          .filter((b) => b.toUpperCase() !== binName.toUpperCase())
          .join(", ");
        await supabase.from("from_sheets").update({ bin_sap: newBins }).eq("mid", item.mid);
      }

      const added = finalMaterials.filter(
        (um) => !originalMaterials.find((om) => om.mid === um.mid)
      );
      for (const item of added) {
        const binList = (item.bin_sap || "").split(",").map((b) => b.trim()).filter((b) => b);
        if (!binList.map((b) => b.toUpperCase()).includes(binName.toUpperCase())) {
          binList.push(binName);
        }
        await supabase.from("from_sheets").update({ bin_sap: binList.join(", ") }).eq("mid", item.mid);
      }
    },
    onMutate: () => showLoading("Updating bin contents..."),
    onError: (err) => {
      showError("Failed to update bin");
      console.error(err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bin_detail", id]);
      showUndo(`Bin ${binName} updated successfully`, () => {
        saveMutation.mutate(originalMaterials);
      });
      setIsEditing(false);
    },
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    let list = [...(materials || [])];
    
    // Sorting logic: Referenced from Detail > New Items > Others
    list.sort((a, b) => {
      if (a.mid === fromMid && b.mid !== fromMid) return -1;
      if (b.mid === fromMid && a.mid !== fromMid) return 1;
      
      if (isEditing) {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
      }
      return 0;
    });

    if (!isEditing) {
      list = list.filter((m) => !m.isRemoved);
    }

    if (!searchTerm.trim()) return list;
    const lowerSearch = searchTerm.toLowerCase();
    return list.filter(
      (item) =>
        item.mid?.toLowerCase().includes(lowerSearch) ||
        item.desc?.toLowerCase().includes(lowerSearch)
    );
  }, [materials, searchTerm, isEditing, fromMid]);

  if (isLoading)
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <LoaderCircle className="animate-spin text-indigo-500" size={32} />
      </div>
    );

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-6 bg-white min-h-screen">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setMaterials(items.map((m) => ({ ...m, isRemoved: false, isNew: false })));
                }}
                title="Cancel"
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                title="Add Material"
                className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                <Plus size={18} />
              </button>
              <button
                disabled
                title="Function on development"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-400 cursor-not-allowed transition-all"
              >
                <Save size={14} />
                SAVE
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              <Edit2 size={14} />
              EDIT BIN
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600"
        >
          <Info size={16} />
          <p className="text-[10px] font-black uppercase tracking-widest">
            edit bin function on develop
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-indigo-100 bg-white shadow-xl shadow-indigo-200/20 overflow-visible"
      >
        {/* Bin Header Card */}
        <div className="bg-indigo-600 p-6 text-white relative rounded-t-[22px] overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                Location
              </span>
              <h1 className="text-2xl font-black tracking-tight mt-2 uppercase">
                {binName}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest opacity-80">
                Materials
              </p>
              <p className="text-2xl font-black leading-none">{materials.filter(m => !m.isRemoved).length}</p>
            </div>
          </div>
        </div>

        {/* STICKY SEARCH BAR */}
        <div className="sticky top-0 z-30 -mt-px">
          <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 shadow-sm transition-shadow duration-300">
            <div className="relative group max-w-lg mx-auto">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"
                size={14}
              />
              <input
                type="text"
                placeholder={`Search ${materials.length} items in ${binName}...`}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-2xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-200/50 text-slate-500 hover:bg-slate-200"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white rounded-b-3xl min-h-[400px]">
          <div className="space-y-2">
            {filteredItems.length === 0 ? (
              <div className="py-20 text-center text-slate-300 flex flex-col items-center">
                <Package size={48} className="opacity-10 mb-3" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  No materials found
                </p>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isNew = item.isNew;
                const isRemoved = item.isRemoved;
                const isFromDetail = !isEditing && item.mid === fromMid;
                
                return (
                  <motion.div
                    key={item.mid}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-stretch gap-2 border transition-all duration-300 rounded-2xl overflow-hidden ${
                      isFromDetail && !isRemoved
                        ? "border-indigo-500 bg-indigo-50/30 ring-2 ring-indigo-500/10"
                        : isRemoved 
                          ? "bg-red-50/30 border-red-100 opacity-60 grayscale-[0.5]" 
                          : isNew 
                            ? "bg-green-50/30 border-green-100" 
                            : "bg-slate-50/50 border-slate-100"
                    }`}
                  >
                    <div className={`w-16 shrink-0 flex items-center justify-center relative ${
                      isFromDetail ? "bg-indigo-100/50" : isRemoved ? "bg-red-100/30" : isNew ? "bg-green-100/30" : "bg-slate-100/50"
                    }`}>
                      <Package size={18} className={isFromDetail ? "text-indigo-500" : isRemoved ? "text-red-300" : isNew ? "text-green-300" : "text-slate-300"} />
                      {isFromDetail && (
                        <div className="absolute top-1 left-1 p-1 rounded-full bg-indigo-500 text-white shadow-sm">
                          <Zap size={8} fill="currentColor" />
                        </div>
                      )}
                      {isNew && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-green-500 text-white text-[7px] font-black uppercase shadow-sm">
                          New
                        </div>
                      )}
                      {isRemoved && (
                        <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                           <div className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[7px] font-black uppercase shadow-sm">
                            Removed
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 py-3 pr-2 flex items-center justify-between gap-3 overflow-hidden">
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-black ${isFromDetail ? "text-indigo-600" : isRemoved ? "text-red-400" : "text-indigo-600"}`}>
                            {item.mid}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            • {calculateTotalStock(item)} Stock
                          </span>
                        </div>
                        <p className={`text-xs font-bold truncate leading-tight pr-4 ${
                          isRemoved ? "text-red-400 line-through" : isFromDetail ? "text-indigo-900" : "text-slate-800"
                        }`}>
                          {item.desc}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {(!isEditing && !isRemoved) && (
                          <Link
                            href={`/private/data/detail/${item.mid}`}
                            className={`p-2 rounded-xl transition-all active:scale-90 ${
                              isFromDetail ? "text-indigo-600 bg-white" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            }`}
                          >
                            <ArrowRight size={16} />
                          </Link>
                        )}
                        {isEditing && (
                          <button
                            onClick={() => toggleRemove(item.mid)}
                            className={`p-2 rounded-xl transition-all active:scale-90 ${
                              isRemoved 
                                ? "text-indigo-500 bg-indigo-50 hover:bg-indigo-100" 
                                : "text-red-300 hover:text-red-500 hover:bg-red-50"
                            }`}
                          >
                            {isRemoved ? <RotateCcw size={16} /> : <Trash2 size={16} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>

      {/* ADD MATERIAL MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
                setSearchMid("");
                setSearchResult(null);
                setSearchError(null);
                setShowConfirmAdd(false);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Plus size={20} strokeWidth={3} />
                    <h2 className="text-lg font-black tracking-tight">Add Material</h2>
                  </div>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setSearchMid("");
                      setSearchResult(null);
                      setSearchError(null);
                      setShowConfirmAdd(false);
                    }}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Enter MID..."
                      value={searchMid}
                      onChange={(e) => {
                        setSearchMid(e.target.value);
                        if (searchResult) setSearchResult(null);
                        if (searchError) setSearchError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all"
                    />
                  </div>

                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSearching ? (
                      <LoaderCircle size={18} className="animate-spin mx-auto" />
                    ) : (
                      "Search MID"
                    )}
                  </button>

                  <div className="min-h-[60px]">
                    <AnimatePresence mode="wait">
                    {searchError ? (
                      <motion.div
                        key="search-error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-500 text-[10px] font-bold"
                      >
                        <AlertCircle size={14} />
                        {searchError}
                      </motion.div>
                    ) : searchResult ? (
                      <motion.div
                        key="search-result"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col gap-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="overflow-hidden">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">
                              Search Result
                            </p>
                            <p className="text-sm font-black text-slate-800 line-clamp-1">
                              {searchResult.desc}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-slate-500">
                                MID: {searchResult.mid}
                              </span>
                              {searchResult.bin_sap && (
                                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-100">
                                  BIN: {searchResult.bin_sap}
                                </span>
                              )}
                            </div>
                          </div>
                          {!showConfirmAdd && (
                            <button
                              onClick={handleAddMaterial}
                              className="shrink-0 p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-90"
                            >
                              <Plus size={20} />
                            </button>
                          )}
                        </div>

                        {showConfirmAdd && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="pt-3 border-t border-indigo-100/50 flex flex-col gap-3"
                          >
                            <p className="text-[10px] font-bold text-slate-600 leading-tight">
                              Material ini sudah ada di bin <span className="font-black text-indigo-600">{searchResult.bin_sap}</span>. Tetap masukkan ke bin ini?
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowConfirmAdd(false)}
                                className="flex-1 py-2 rounded-xl border border-slate-200 text-[10px] font-black text-slate-500 hover:bg-white transition-colors"
                              >
                                BATAL
                              </button>
                              <button
                                onClick={handleAddMaterial}
                                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black shadow-md hover:bg-indigo-700 transition-colors"
                              >
                                KONFIRMASI
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
