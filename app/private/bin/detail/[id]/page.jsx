"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  Package,
  ArrowRight,
  Info,
  Archive,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const calculateTotalStock = (item) => {
  const fields = ["draft", "project", "actual", "gt01", "g002", "g003", "g004"];
  return fields.reduce((sum, field) => sum + (Number(item[field]) || 0), 0);
};

export default function BinDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const binName = id === "NOBIN" ? "NO BIN" : decodeURIComponent(id);

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

  if (isLoading)
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-indigo-50/30">
        <LoaderCircle className="animate-spin text-indigo-500" size={32} />
      </div>
    );

  if (error || !items)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400">
          <Info size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">
          Bin Tidak Ditemukan
        </h2>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-100"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>
    );

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
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Archive size={120} />
          </div>
          <div className="relative z-10">
            <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-white/20">
              Bin Location Details
            </span>
            <h1 className="text-3xl font-black tracking-tight mt-3 mb-1 uppercase">
              {binName}
            </h1>
            <p className="text-indigo-100 text-sm font-medium">
              Total {items.length} material dalam bin ini
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500">
              <Package size={18} />
            </div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Material List
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {items.map((item, idx) => (
              <motion.div
                key={item.mid}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  href={`/private/data/detail/${item.mid}`}
                  className="group flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:border-indigo-200/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-indigo-500 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                      MID {item.mid}
                    </span>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[13px] text-slate-700 font-bold leading-tight line-clamp-2">
                    {item.desc}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <span className="bg-white px-2 py-0.5 rounded-md border border-slate-100">
                      UOM: {item.uom}
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-slate-100">
                      Stock: {calculateTotalStock(item)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
