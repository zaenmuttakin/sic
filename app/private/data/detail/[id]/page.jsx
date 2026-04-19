"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LoaderCircle,
  ArrowRight,
  Image as LucideImage,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function PostDetail() {
  const params = useParams(); // Mengambil ID dari URL
  const router = useRouter();
  const { id } = params;

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("from_sheets")
        .select("*")
        .eq("mid", id)
        .single(); // Mengambil 1 data saja

      if (error) throw error;
      return data;
    },
  });

  const [showModal, setShowModal] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  const images = post?.images || [
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800",
  ];

  const [currentImg, setCurrentImg] = useState(0);

  if (isLoading)
    return (
      <div className="w-full min-h-screen flex items-center justify-center py-10">
        <LoaderCircle className="animate-spin text-indigo-400" />
      </div>
    );
  if (error || !post)
    return (
      <div className="p-10 text-center bg-indigo-50 min-h-screen ">
        Data tidak ditemukan.
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

      <div
        id="detail"
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/30"
      >
        {/* Image Slider Section */}
        <div
          onClick={() => setShowModal(true)}
          className="relative aspect-video bg-slate-50 overflow-hidden group cursor-zoom-in"
        >
          {images.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImg}
                src={images[currentImg]}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <LucideImage size={40} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest">
                No Image Available
              </p>
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Dots Pagination */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImg(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentImg === i
                      ? "w-6 bg-white shadow-sm"
                      : "w-1.5 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Image Tag */}
          {images.length > 0 && (
            <div className="absolute top-4 right-4 z-10">
              <div className="rounded-full bg-black/20 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
                {currentImg + 1} / {images.length}
              </div>
            </div>
          )}

          {/* Click Hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white">
              <Maximize2 size={20} />
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="mb-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              MID {post.mid}
            </span>
            <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {post.uom}
            </span>
          </div>
          <h1 className="mb-6 text-lg font-bold leading-tight text-slate-900">
            {post.desc}
          </h1>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Left Side: Locations */}
            <div className="space-y-3">
              <div className="relative">
                <span className="inline-block rounded-full bg-slate-100/80 px-3 py-1 text-[10px] font-bold text-slate-500 mb-2">
                  G001
                </span>
                <div className="ml-3 relative">
                  <div className="absolute left-0 top-0 bottom-[12px] w-px bg-slate-200" />
                  {[
                    { label: "Draft", value: post.draft },
                    { label: "Project", value: post.project },
                    { label: "Unrest", value: post.actual },
                  ].map((sub) => (
                    <div
                      key={sub.label}
                      className="relative flex items-center justify-between text-xs py-1.5 pl-6"
                    >
                      {/* Horizontal Branch */}
                      <div className="absolute left-0 top-1/2 w-4 h-px bg-slate-200" />
                      <span className="text-slate-500 font-semibold">
                        {sub.label}
                      </span>
                      <div className="mx-3 flex-1 h-px bg-slate-100" />
                      <span className="text-slate-900 font-bold">
                        {sub.value || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Storage Locations */}
              {[
                { label: "G002", value: post.g002 },
                { label: "G003", value: post.g003 },
                { label: "G004", value: post.g004 },
                { label: "GT01", value: post.gt01 },
              ].map((loc) => (
                <div key={loc.label} className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100/80 px-3 py-1 text-[10px] font-bold text-slate-500">
                    {loc.label}
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-xs font-bold text-slate-900">
                    {loc.value || 0}
                  </span>
                </div>
              ))}
            </div>

            {/* Right Side: Storage Bins */}
            <div className="flex flex-col">
              <span className="inline-block rounded-full bg-slate-100/80 px-3 py-1 text-[10px] font-bold text-slate-500 mb-4 w-fit">
                Storage Bins
              </span>
              <div className="flex-1 bg-slate-50/40 rounded-2xl p-4 border border-slate-100">
                <ul className="space-y-2">
                  {(post.bin_sap || "ZONE-B1").split(",").map((bin, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-xs text-slate-600 font-semibold"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      <span className="truncate">{bin.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Last Update
            </div>
            <div className="text-[10px] font-bold text-slate-500">
              {new Date(post.update_at).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
        {/* Modal Overview */}
        <AnimatePresence>
          {showModal && images.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 sm:p-10"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowModal(false);
                  setZoomScale(1);
                }}
                className="absolute top-6 right-6 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/10"
              >
                <X size={24} />
              </button>

              {/* Zoom Controls */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-4 p-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl">
                <button
                  onClick={() =>
                    setZoomScale((prev) => Math.max(prev - 0.5, 1))
                  }
                  className="p-3 rounded-xl hover:bg-white/10 text-white transition-colors"
                >
                  <ZoomOut size={20} />
                </button>
                <div className="w-12 text-center text-xs font-bold text-white tabular-nums">
                  {Math.round(zoomScale * 100)}%
                </div>
                <button
                  onClick={() =>
                    setZoomScale((prev) => Math.min(prev + 0.5, 3))
                  }
                  className="p-3 rounded-xl hover:bg-white/10 text-white transition-colors"
                >
                  <ZoomIn size={20} />
                </button>
              </div>

              {/* Image Container */}
              <motion.div
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <motion.img
                  src={images[currentImg]}
                  animate={{ scale: zoomScale }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="max-w-full max-h-full object-contain"
                  drag={zoomScale > 1}
                  dragConstraints={{
                    left: -500,
                    right: 500,
                    top: -500,
                    bottom: 500,
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
