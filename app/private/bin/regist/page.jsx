"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  LayoutGrid,
  Plus,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Box,
  PackagePlus,
  GalleryHorizontal,
  ShelvingUnit,
  Brackets,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useUndo } from "@/context/UndoContext";

export default function BinRegist() {
  const router = useRouter();
  const { showUndo, showError } = useUndo();

  const [binName, setBinName] = useState("");
  const [binType, setBinType] = useState("Z"); // Default to Zone
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    if (!binName.trim()) return;
    setShowConfirm(true);
  };

  const handleRegister = async () => {
    setShowConfirm(false);
    if (!binName.trim()) return;

    setIsSubmitting(true);
    setStatus(null);
    const upperBin = binName.trim().toUpperCase();

    try {
      // 1. Check if bin already exists
      const { data: existing, error: checkError } = await supabase
        .from("bins")
        .select("bin")
        .eq("bin", upperBin)
        .limit(1);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        setStatus({
          type: "error",
          message: `Bin "${upperBin}" already exists.`,
        });
        showError(`Bin "${upperBin}" already registered.`);
        setIsSubmitting(false);
        return;
      }

      // 2. Insert new bin
      const savedUser =
        typeof window !== "undefined" ? localStorage.getItem("sic_user") : null;
      const userNickname = savedUser
        ? JSON.parse(savedUser).nickname
        : "system";

      const { error: insertError } = await supabase.from("bins").insert({
        bin: upperBin,
        type: binType,
        user: userNickname,
        update_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      setStatus({
        type: "success",
        message: `Bin "${upperBin}" successfully registered.`,
      });
      setBinName("");
      showUndo(`Bin ${upperBin} registered.`);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.message || "Failed to register bin.",
      });
      showError(err.message || "Failed to register bin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto px-5 py-6 bg-white min-h-screen">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:scale-95"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="space-y-8">
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-50 text-indigo-500 mb-3">
            <PackagePlus size={18} />
            <span className="text-xs font-bold ">Registration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            New Fixed Bin
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Create a new fixed bin location.
          </p>
        </header>

        <form onSubmit={handleOpenConfirm} className="space-y-8">
          <div className="space-y-6">
            {/* Bin Name */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase ml-1">
                Bin Name
              </label>
              <div className="relative group mt-2">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                  <Box size={20} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. AA-01-01-01"
                  value={binName}
                  onChange={(e) => setBinName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[24px] text-base font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            {/* Bin Type */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase ml-1 ">
                BIN Type
              </label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setBinType("R")}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    binType === "R"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-600 shadow-xl shadow-indigo-100"
                      : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200"
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl ${
                      binType === "R"
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-50"
                    }`}
                  >
                    <ShelvingUnit size={24} />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-bold uppercase">
                      Rack
                    </span>
                    <span className="text-xs font-medium opacity-60">
                      Single Material
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setBinType("Z")}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    binType === "Z"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-600 shadow-xl shadow-indigo-100"
                      : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200"
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl ${
                      binType === "Z"
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-50"
                    }`}
                  >
                    <Brackets size={24} />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-bold uppercase">
                      Zone
                    </span>
                    <span className="text-xs font-medium opacity-60">
                      Multiple Material
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-3 p-4 rounded-2xl border ${
                  status.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                    : "bg-red-50 border-red-100 text-red-600"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <p className="text-xs font-bold uppercase">{status.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isSubmitting || !binName.trim()}
            className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold text-sm uppercase  shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <LoaderCircle size={20} className="animate-spin" />
            ) : (
              <>
                <Plus size={20} strokeWidth={3} />
                Create Bin
              </>
            )}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="p-4 bg-indigo-50 rounded-full inline-flex mb-5">
                <Box size={28} className="text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Create New Bin?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-2">
                You are about to register a new storage location:
              </p>
              <div className="my-5 p-4 bg-slate-50 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Bin
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
                    {binName.trim().toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Type
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {binType === "R" ? "Rack" : "Zone"}
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
                  onClick={handleRegister}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-indigo-500 text-white rounded-2xl text-xs font-bold uppercase shadow-lg shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    "Confirm"
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
