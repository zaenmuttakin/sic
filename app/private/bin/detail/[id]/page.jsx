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
  RefreshCw,
  Zap,
  FileText,
  PencilLine,
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
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [originalMaterials, setOriginalMaterials] = useState([]);

  // Modal states
  const [searchMid, setSearchMid] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const {
    data: items,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bin_detail", id],
    queryFn: async () => {
      let binQuery = supabase.from("bins").select("*");

      if (id === "NOBIN") {
        binQuery = binQuery.or("bin.ilike.NO BIN,bin.ilike.NOBIN");
      } else if (id === "EMPTY") {
        binQuery = binQuery.eq("bin", "");
      } else if (id === "NULL") {
        binQuery = binQuery.is("bin", null);
      } else {
        binQuery = binQuery.eq("bin", binName);
      }

      const { data: binItems, error: binError } = await binQuery;
      if (binError) throw binError;

      if (binItems.length === 0) return [];

      // Fetch stock data from from_sheets for all MIDs in this bin
      const mids = binItems.map((item) => item.mid).filter((mid) => mid);

      let stockData = [];
      if (mids.length > 0) {
        const { data, error: stockError } = await supabase
          .from("from_sheets")
          .select("*")
          .in("mid", mids);
        if (stockError) throw stockError;
        stockData = data || [];
      }

      // Merge stock data into bin items
      return binItems.map((binItem) => {
        const stockInfo = binItem.mid
          ? stockData.find((s) => s.mid === binItem.mid)
          : null;
        return {
          ...binItem,
          ...stockInfo, // This keeps the stock fields (actual, draft, etc.)
        };
      });
    },
  });

  useEffect(() => {
    if (items) {
      setMaterials(
        items.map((m) => ({ ...m, isRemoved: false, isNew: false }))
      );
      setOriginalMaterials(items);
    }
  }, [items]);

  const hasChanges = useMemo(() => {
    // Check for additions or removals
    if (materials.some((m) => m.isNew || m.isRemoved)) return true;

    // Check for detail updates in existing items
    return materials.some((m) => {
      const original = originalMaterials.find((om) => om.id === m.id);
      return original && original.detail !== m.detail;
    });
  }, [materials, originalMaterials]);

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
        // Also check if this material is already in another bin in the 'bins' table
        const { data: existingBin } = await supabase
          .from("bins")
          .select("id, bin, type")
          .eq("mid", data.mid)
          .maybeSingle();

        const isAlreadyInBin = materials.some(
          (m) => m.mid === data.mid && !m.isRemoved
        );

        setSearchResult({
          ...data,
          current_bin: existingBin?.bin,
          isAlreadyInBin,
          oldBinData: existingBin
            ? {
                id: existingBin.id,
                type: existingBin.type,
                bin: existingBin.bin,
              }
            : null,
        });
      }
    } catch (err) {
      setSearchError("Error searching material");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMaterial = () => {
    if (!searchResult) return;

    const activeMaterials = materials.filter((m) => !m.isRemoved && m.mid);
    const emptySlot = materials.find((m) => !m.mid && !m.isRemoved);
    // Determine bin type: if current items exist, use their type, else default to Z
    const binType = materials[0]?.type || "Z";
    const isRack = binType === "R";

    if (materials.find((m) => m.mid === searchResult.mid && !m.isRemoved)) {
      setSearchError("Material already in this bin");
      return;
    }

    // Rule: Rack (R) only allows one active material. Zone (Z) allows multi-item.
    if (isRack && activeMaterials.length > 0) {
      setSearchError(
        "Rack (R) only allows one material. Please delete the existing one first."
      );
      return;
    }

    const currentBin = searchResult.current_bin;
    if (currentBin && !showConfirmAdd) {
      setShowConfirmAdd(true);
      return;
    }

    if (materials.find((m) => m.mid === searchResult.mid && m.isRemoved)) {
      setMaterials(
        materials.map((m) =>
          m.mid === searchResult.mid ? { ...m, isRemoved: false } : m
        )
      );
    } else if (isRack && (emptySlot || materials.find((m) => m.isRemoved))) {
      // Rule: For Rack (R), fill the existing empty slot OR the slot marked for removal
      const slotToFill = emptySlot || materials.find((m) => m.isRemoved);
      setMaterials(
        materials.map((m) =>
          m.id === slotToFill.id
            ? {
                ...m,
                ...searchResult,
                isNew: true,
                isRemoved: false,
                isFillingSlot: true,
              }
            : m
        )
      );
    } else {
      // Rule: For Zone (Z) or if no Rack slot available, add a new row
      setMaterials([
        ...materials,
        {
          ...searchResult,
          id: `new-${Date.now()}`,
          isNew: true,
          isRemoved: false,
          type: binType,
        },
      ]);
    }

    setSearchResult(null);
    setSearchMid("");
    setSearchError(null);
    setShowConfirmAdd(false);
    setIsModalOpen(false);
  };

  const handleUpdateDetail = (id, newDetail) => {
    setMaterials(
      materials.map((m) => (m.id === id ? { ...m, detail: newDetail } : m))
    );
  };

  const toggleRemove = (id) => {
    setMaterials(
      materials.map((m) =>
        m.id === id ? { ...m, isRemoved: !m.isRemoved } : m
      )
    );
  };

  // ── Save Logic ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (updatedMaterials) => {
      const savedUser =
        typeof window !== "undefined" ? localStorage.getItem("sic_user") : null;
      const nickname = savedUser ? JSON.parse(savedUser).nickname : null;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userNickname =
        nickname || user?.user_metadata?.nickname || user?.email || "system";
      const updateAt = new Date().toISOString();
      const binType = materials[0]?.type || "Z";

      // 1. Handle Removals
      const removed = originalMaterials.filter(
        (om) => !updatedMaterials.find((um) => um.id === om.id && !um.isRemoved)
      );
      for (const item of removed) {
        if (item.type === "R") {
          await supabase
            .from("bins")
            .update({
              mid: null,
              desc: null,
              detail: null,
              user: userNickname,
              update_at: updateAt,
            })
            .eq("id", item.id);
        } else {
          await supabase.from("bins").delete().eq("id", item.id);
        }
      }

      // 2. Handle Updates for existing materials (detail changes)
      const existingToUpdate = updatedMaterials.filter(
        (um) => !um.isNew && !um.isRemoved
      );
      for (const item of existingToUpdate) {
        const original = originalMaterials.find((om) => om.id === item.id);
        if (original && original.detail !== item.detail) {
          await supabase
            .from("bins")
            .update({
              detail: item.detail,
              user: userNickname,
              update_at: updateAt,
            })
            .eq("id", item.id);
        }
      }

      // 3. Handle Additions
      const added = updatedMaterials.filter((um) => um.isNew && !um.isRemoved);
      if (added.length > 0) {
        // Handle removals from old bins for replaced items
        for (const item of added) {
          if (item.oldBinData) {
            if (item.oldBinData.type === "R") {
              await supabase
                .from("bins")
                .update({
                  mid: null,
                  desc: null,
                  detail: null,
                  user: userNickname,
                  update_at: updateAt,
                })
                .eq("id", item.oldBinData.id);
            } else {
              await supabase.from("bins").delete().eq("id", item.oldBinData.id);
            }
          }
        }

        // Perform slot filling updates (Rule: R uses update)
        const toUpdateSlots = added.filter((m) => m.isFillingSlot);
        for (const item of toUpdateSlots) {
          await supabase
            .from("bins")
            .update({
              mid: item.mid,
              desc: item.desc,
              detail: item.detail,
              user: userNickname,
              update_at: updateAt,
            })
            .eq("id", item.id);
        }

        // Perform new additions (Rule: Z or new R slot uses insert)
        const toInsert = added
          .filter((m) => !m.isFillingSlot)
          .map((m) => ({
            bin: binName,
            mid: m.mid,
            desc: m.desc,
            detail: m.detail,
            type: binType,
            user: userNickname,
            update_at: updateAt,
          }));

        if (toInsert.length > 0) {
          await supabase.from("bins").insert(toInsert);
        }
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

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setMaterials(originalMaterials);
                }}
                className="px-2 py-2 text-sm font-medium text-slate-400 hover:text-red-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all active:scale-95"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span className="text-sm font-medium">Add</span>
              </button>
              <button
                onClick={() => setShowSaveConfirm(true)}
                disabled={!hasChanges}
                className={`flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-medium text-white shadow-xl transition-all active:scale-95 ${
                  hasChanges
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200/50"
                    : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                }`}
              >
                <Save size={14} />
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm"
            >
              <PencilLine size={14} />
              Edit Bin
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600"
        >
          <Info size={16} />
          <p className="text-xs font-bold uppercase tracking-widest">
            Editing Bin Contents
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-indigo-100 bg-white shadow-xl shadow-indigo-200/20 overflow-visible"
      >
        {/* Bin Header Card */}
        <div className="bg-indigo-500 p-6 text-white relative rounded-t-3xl overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="w-fit px-3 pr-4 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold border border-white/20 shadow-2xl flex items-center gap-1.5 ring-1 ring-white/10">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${materials[0]?.type === "R" ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"}`}
                />
                {materials[0]?.type === "R" ? "RACK" : "ZONE"}
              </span>
              <h1 className="text-2xl font-black tracking-tight mt-2 uppercase flex items-center gap-3">
                {binName}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-indigo-100 text-xs font-bold uppercase opacity-80">
                Materials
              </p>
              <p className="text-2xl font-black ">
                {materials.filter((m) => !m.isRemoved).length}
              </p>
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
                <p className="text-xs font-bold uppercase text-slate-400">
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
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-stretch gap-2 border transition-all duration-300 rounded-2xl overflow-hidden ${
                      isFromDetail && !isRemoved
                        ? "border-indigo-500 bg-indigo-50/30 ring-2 ring-indigo-500/10"
                        : isRemoved
                          ? "bg-red-50/30 border-red-100 opacity-60 grayscale-[0.5]"
                          : isNew
                            ? "bg-green-50/30 border-green-100"
                            : item.mid
                              ? "bg-slate-50/50 border-slate-100"
                              : "bg-amber-50/20 border-dashed border-slate-200"
                    }`}
                  >
                    <div
                      className={`w-16 shrink-0 flex items-center justify-center relative ${
                        isFromDetail
                          ? "bg-indigo-100/50"
                          : isRemoved
                            ? "bg-red-100/30"
                            : isNew
                              ? "bg-green-100/30"
                              : "bg-slate-100/50"
                      }`}
                    >
                      <Package
                        size={18}
                        className={
                          isFromDetail
                            ? "text-indigo-500"
                            : isRemoved
                              ? "text-red-300"
                              : isNew
                                ? "text-green-300"
                                : "text-slate-300"
                        }
                      />
                      {isFromDetail && (
                        <div className="absolute top-1 left-1 p-1 rounded-full bg-indigo-500 text-white shadow-sm">
                          <Zap size={8} fill="currentColor" />
                        </div>
                      )}
                      {isNew && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-green-500 text-white text-[7px] font-bold uppercase shadow-sm">
                          New
                        </div>
                      )}
                      {isRemoved && (
                        <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                          <div className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[7px] font-bold uppercase shadow-sm">
                            Removed
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 py-3 pr-2 flex items-center justify-between gap-3 overflow-hidden">
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-xs font-bold ${isFromDetail ? "text-indigo-600" : isRemoved ? "text-red-400" : "text-indigo-600"}`}
                          >
                            {item.mid || "(EMPTY SLOT)"}
                          </span>
                          {item.mid && (
                            <span className="text-xs font-bold text-slate-400">
                              • {calculateTotalStock(item)} Stock
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs font-bold truncate leading-tight pr-4 ${
                            isRemoved
                              ? "text-red-400 line-through"
                              : isFromDetail
                                ? "text-indigo-900"
                                : item.mid
                                  ? "text-slate-800"
                                  : "text-slate-400 italic"
                          }`}
                        >
                          {item.desc || "Ready for new material"}
                        </p>
                        {item.detail && !isRemoved && (
                          <p className="mt-1 text-xs font-bold text-indigo-500 uppercase tracking-tight bg-indigo-50 w-fit px-1.5 py-0.5 rounded border border-indigo-100">
                            {item.detail}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!isEditing && !isRemoved && item.mid && (
                          <Link
                            href={`/private/data/detail/${item.mid}`}
                            className={`p-2 rounded-xl transition-all active:scale-90 ${
                              isFromDetail
                                ? "text-indigo-600 bg-white"
                                : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                            }`}
                          >
                            <ArrowRight size={18} />
                          </Link>
                        )}
                        {isEditing && !isRemoved && item.mid && (
                          <button
                            onClick={() => setDetailModalItem(item)}
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 transition-all active:scale-90"
                            title="Edit Details"
                          >
                            <FileText size={18} />
                          </button>
                        )}
                        {isEditing && (
                          <button
                            onClick={() => toggleRemove(item.id)}
                            className={`p-2 rounded-xl transition-all active:scale-90 ${
                              isRemoved
                                ? "text-indigo-500 bg-indigo-50 hover:bg-indigo-100"
                                : "text-red-400 hover:text-red-500 hover:bg-red-50"
                            }`}
                          >
                            {isRemoved ? (
                              <RotateCcw size={18} />
                            ) : (
                              <Trash2 size={18} />
                            )}
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
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <Plus size={20} strokeWidth={3} />
                    <h2 className="text-lg font-bold tracking-tight">
                      Add Material
                    </h2>
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
                    className="w-full py-3.5 bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSearching ? (
                      <LoaderCircle
                        size={18}
                        className="animate-spin mx-auto"
                      />
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
                          className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-500 text-xs font-bold"
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
                            <div className="overflow-hidden w-full">
                              <p className="text-xs font-bold text-indigo-500 uppercase mb-2">
                                Search Result
                              </p>
                              <p className="text-sm font-bold text-slate-800 line-clamp-1">
                                {searchResult.desc}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-slate-500 uppercase py-0.5 rounded-lg">
                                  MID: {searchResult.mid}
                                </span>
                                {searchResult.current_bin && (
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-600">
                                    <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                                    <span className="text-xs font-medium ">
                                      Located in: {searchResult.current_bin}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {searchResult.isAlreadyInBin && (
                                <p className="mt-4 text-xs font-bold text-red-500 flex items-center gap-1.5 bg-red-50 p-2 rounded-xl border border-red-100 justify-center">
                                  <AlertCircle size={14} />
                                  Material already in this bin
                                </p>
                              )}
                            </div>
                            {!showConfirmAdd &&
                              !searchResult.isAlreadyInBin && (
                                <button
                                  onClick={handleAddMaterial}
                                  title={
                                    searchResult.current_bin
                                      ? "Replace Bin"
                                      : "Add to Bin"
                                  }
                                  className={`shrink-0 p-3 rounded-xl text-white transition-all active:scale-90 ${
                                    searchResult.current_bin
                                      ? "bg-amber-500 hover:bg-amber-600"
                                      : "bg-indigo-500 hover:bg-indigo-600"
                                  }`}
                                >
                                  {searchResult.current_bin ? (
                                    <RefreshCw size={20} />
                                  ) : (
                                    <Plus size={20} />
                                  )}
                                </button>
                              )}
                          </div>

                          {showConfirmAdd && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="pt-3 border-t border-indigo-100/50 flex flex-col gap-3"
                            >
                              <p className="text-xs font-bold text-slate-600 leading-tight">
                                Material ini sudah ada di bin{" "}
                                <span className="font-bold text-indigo-600">
                                  {searchResult.current_bin}
                                </span>
                                . Pindahkan ke bin ini? (Bin lama akan
                                dikosongkan)
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setShowConfirmAdd(false)}
                                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-white transition-colors"
                                >
                                  CANCEL
                                </button>
                                <button
                                  onClick={handleAddMaterial}
                                  className={`flex-1 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-colors ${
                                    searchResult.current_bin
                                      ? "bg-amber-500 hover:bg-amber-600"
                                      : "bg-indigo-600 hover:bg-indigo-700"
                                  }`}
                                >
                                  {searchResult.current_bin
                                    ? "REPLACE"
                                    : "CONFIRM"}
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
      {/* DETAIL EDIT MODAL */}
      <AnimatePresence>
        {detailModalItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailModalItem(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                        Bin Detail
                      </h3>
                      <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                        MID: {detailModalItem.mid}
                        <span className="text-indigo-500 font-bold tracking-normal">
                          • {binName}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetailModalItem(null)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1.5">
                      Description
                    </p>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed">
                      {detailModalItem.desc}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1.5 px-1">
                      Edit Detail
                    </p>
                    <textarea
                      autoFocus
                      rows={4}
                      value={detailModalItem.detail || ""}
                      onChange={(e) => {
                        const newDetail = e.target.value;
                        setDetailModalItem({
                          ...detailModalItem,
                          detail: newDetail,
                        });
                        handleUpdateDetail(detailModalItem.id, newDetail);
                      }}
                      placeholder="Add specific location details, notes, etc..."
                      className="w-full px-4 py-3 text-xs font-bold bg-white border-2 border-indigo-100 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 text-slate-800 shadow-inner transition-all resize-none"
                    />
                  </div>

                  <button
                    onClick={() => setDetailModalItem(null)}
                    className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-xs font-bold uppercase shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] mt-2"
                  >
                    DONE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {/* Save Confirmation Modal */}
        {showSaveConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Save size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Save Changes?
                </h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Apakah yakin ingin menyimpan perubahan ini? Data bin akan
                  diperbarui.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSaveConfirm(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveConfirm(false);
                      saveMutation.mutate(materials);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
