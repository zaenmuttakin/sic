"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  ExternalLink,
  Zap,
  History,
  Info,
  ArrowUpRight,
  X,
  CheckCircle,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export default function EccDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const {
    data: mappings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ecc_mapping", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("old_mid")
        .select("*")
        .eq("old_mat", id);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading)
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-indigo-50/30">
        <LoaderCircle className="animate-spin text-indigo-500" size={32} />
      </div>
    );

  if (error || !mappings || mappings.length === 0)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-2xl border border-white rounded-[32px] p-10 shadow-2xl shadow-slate-200/50 max-w-sm w-full"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <X size={40} className="text-red-400" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">
            Mapping Tidak Ditemukan
          </h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed px-2">
            Maaf, kami tidak dapat menemukan data mapping untuk MID{" "}
            <span className="font-bold text-indigo-600">#{id}</span>.
          </p>
          <button
            onClick={() => router.back()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-600 active:scale-[0.98]"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back
          </button>
        </motion.div>
      </div>
    );

  const mainData = mappings[0];

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-8 bg-white min-h-screen">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-xl shadow-indigo-200/20"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 -right-5 p-8 opacity-5">
            <Zap size={120} />
          </div>
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold uppercase">
                ECC Mapping Overview
              </span>
            </div>
            <h1 className="text-2xl font-black mb-1">{mainData.old_mat}</h1>
            <p className="text-indigo-100 font-medium max-w-md">
              {mainData.old_desc}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Mapping List */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500">
                <History size={18} />
              </div>
              <h2 className="text-sm font-bold text-slate-800 uppercase ">
                Mapping Result
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {mappings.map((item, idx) => (
                <Link
                  href={`/private/data/detail/${item.new_mat}`}
                  key={idx}
                  className="group relative flex flex-col gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:border-indigo-200/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <span className="rounded-full bg-indigo-500 px-3 py-1  text-xs font-bold text-white shadow-sm">
                        {item.new_mat}
                      </span>
                    </div>
                    <div className="p-2 rounded-full bg-white border border-slate-200 text-slate-400">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                  <div>
                    <p className=" text-sm text-slate-700 font-bold leading-snug">
                      {item.new_desc}
                    </p>
                    <div className="mt-3 flex items-center gap-4  text-xs text-slate-400  uppercase ">
                      <span className="flex items-center gap-2">
                        <CheckCircle size={14} /> Mapped
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Info Section */}
          <section className="pt-6 border-t border-slate-100">
            <div className="rounded-2xl bg-slate-50 p-5 flex gap-4">
              <div className="mt-0.5 text-indigo-500">
                <Info size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 mb-1">
                  Information
                </p>
                <p className=" text-xs text-slate-500 leading-relaxed font-medium">
                  Dokumentasi ini memetakan perubahan Material dari SAP ECC ke
                  S/4HANA. Setiap entitas pemetaan mencerminkan transisi data
                  yang valid pada sistem Spare Part Inventory Control.
                </p>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
