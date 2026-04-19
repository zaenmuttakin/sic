"use client";

import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-2xl border border-white rounded-[32px] p-10 shadow-2xl shadow-slate-200/50 max-w-sm w-full"
      >
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <SearchX size={40} className="text-indigo-400" />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed px-2">
          Maaf, halaman yang Anda cari tidak ada atau mungkin telah dipindahkan.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-600 active:scale-[0.98]"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            Kembali
          </button>
          
          <Link
            href="/private"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
          >
            Ke Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
