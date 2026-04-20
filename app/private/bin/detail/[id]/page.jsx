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
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState, useMemo } from "react";

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

  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!searchTerm.trim()) return items;

    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.mid?.toLowerCase().includes(lowerSearch) ||
        item.desc?.toLowerCase().includes(lowerSearch)
    );
  }, [items, searchTerm]);

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
        className="rounded-3xl border border-indigo-100 bg-white shadow-xl shadow-indigo-200/20"
      >
        <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 p-8 text-white relative overflow-hidden rounded-t-3xl">
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold uppercase">
                Bin Details
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mt-3 mb-1 uppercase">
              {binName}
            </h1>
            <p className="text-indigo-100 text-sm font-medium">
              Total {items.length} material dalam bin ini
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Material List Title (scrolls away) */}
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500">
              <Package size={18} />
            </div>
            <h2 className="text-sm font-bold text-slate-800 uppercase">
              Material List
            </h2>
          </div>

          {/* Sticky Search Input */}
          <div className="sticky top-0 left-0 z-20 -mx-6 sm:-mx-8 px-6 sm:px-8 py-3 mb-6 bg-white/95 border-b border-slate-100 border-r border-indigo-100 border-l-1 border-indigo-200">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search material in this bin..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-medium">
                  Tidak ada material yang sesuai.
                </p>
              </div>
            ) : (
              filteredItems.map((item, idx) => (
                <motion.div
                  key={item.mid}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={`/private/data/detail/${item.mid}`}
                    className="group relative flex flex-col gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:border-indigo-200/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-xs">
                          {idx + 1}
                        </div>
                        <span className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                          {item.mid}
                        </span>
                      </div>
                      <div className="p-2 rounded-full bg-white border border-slate-200 text-slate-400">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 font-bold  mb-3">
                        {item.desc}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-400 uppercase">
                        <span className="font-semibold text-slate-500">
                          Stock: {calculateTotalStock(item)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

          {/* Info Section */}
          <section className="mt-10 pt-6 border-t border-slate-100">
            <div className="rounded-2xl bg-slate-50 p-5 flex gap-4">
              <div className="mt-0.5 text-indigo-500">
                <Info size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 mb-1">
                  Information
                </p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Halaman ini menampilkan daftar material yang tersimpan dalam
                  lokasi Bin ini. Pastikan untuk melakukan verifikasi fisik
                  secara berkala untuk menjaga akurasi stok pada sistem Spare
                  Part Inventory Control.
                </p>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
