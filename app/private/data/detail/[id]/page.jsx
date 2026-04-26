"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
  History,
  Zap,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Copy,
  FileText,
  Edit,
  Box,
  Archive,
  CheckCircle2,
  AlertCircle,
  ImageOff,
  Plus,
  ImagePlus,
  Files,
  ScanText,
  ArrowRightLeft,
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
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: oldMidData } = useQuery({
    queryKey: ["old_mid_lookup", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("old_mid")
        .select("*")
        .eq("new_mat", id);

      if (error) return null;
      return data;
    },
    enabled: !!post,
  });

  const { data: binSicData, isLoading: isLoadingBinSic } = useQuery({
    queryKey: ["bin_sic", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bins")
        .select("*")
        .eq("mid", id);

      if (error) throw error;
      return data;
    },
    enabled: !!post,
  });

  const { data: driveImages, isLoading: isLoadingImages } = useQuery({
    queryKey: ["drive_images", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .eq("mid", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!post,
  });

  const [showModal, setShowModal] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [startDistance, setStartDistance] = useState(0);
  const [startScale, setStartScale] = useState(1);
  const lastTap = useRef(0);

  const closeModal = () => {
    setShowModal(false);
    setZoomScale(1);
    if (
      typeof window !== "undefined" &&
      window.history.state?.modal === "overview"
    ) {
      window.history.back();
    }
  };

  // Handle back button to close modal
  useEffect(() => {
    if (showModal) {
      window.history.pushState({ modal: "overview" }, "");
      const handlePopState = () => {
        setShowModal(false);
        setZoomScale(1);
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [showModal]);

  let images = post?.images || [];

  if (driveImages) {
    const driveUrls = [driveImages.img1, driveImages.img2, driveImages.img3]
      .filter(Boolean)
      .map((fileId) => `https://lh3.googleusercontent.com/d/${fileId}`);
    if (driveUrls.length > 0) {
      images = driveUrls;
    }
  }

  const [currentImg, setCurrentImg] = useState(0);

  const nextImg = () => {
    if (images.length > 1) {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }
  };

  const prevImg = () => {
    if (images.length > 1) {
      setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const [copiedState, setCopiedState] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("sic_user");
    if (savedUser) {
      setUserRole(JSON.parse(savedUser).role);
    }
  }, []);
  const handleBinClick = () => {
    if (!post) return;

    if (binSicData && binSicData.length > 0) {
      // If already in SIC, go to the first bin's detail
      router.push(
        `/private/bin/detail/${encodeURIComponent(binSicData[0].bin)}?from=${post.mid}`
      );
    } else {
      // If not in SIC, go to adding page
      const firstBin = (post.bin_sap || "-").split(",")[0].trim();
      const isPlaceholder =
        !firstBin ||
        firstBin === "-" ||
        firstBin.toLowerCase() === "n/a" ||
        firstBin.toLowerCase() === "none";

      let url = `/private/bin/adding/${post.mid}?desc=${encodeURIComponent(
        post.desc
      )}`;
      if (!isPlaceholder) {
        url += `&targetBin=${encodeURIComponent(firstBin.toUpperCase())}`;
      }
      router.push(url);
    }
  };

  const calculateTotalStock = (p) => {
    return (
      (p.draft || 0) +
      (p.project || 0) +
      (p.actual || 0) +
      (p.g002 || 0) +
      (p.g003 || 0) +
      (p.g004 || 0) +
      (p.gt01 || 0)
    );
  };

  const handleCopy = (type) => {
    let text = "";
    if (type === "basic") {
      text = `${post.mid}\n${post.desc}\n${post.uom}`;
    } else if (type === "all") {
      const total = calculateTotalStock(post);
      const bins = (post.bin_sap || "")
        .split(",")
        .filter((b) => b.trim())
        .map((b) => `- ${b.trim()}`)
        .join("\n");
      const oldMids = (oldMidData || [])
        .map((m) => `- ${m.old_mat} ${m.old_desc}`)
        .join("\n");

      text = `${post.mid}
${post.desc}
${post.uom}

Stock :
Total [ ${total} ]
- G001
   |- Draft [ ${post.draft || 0} ]
   |- Unrest [ ${post.actual || 0} ]
   |- Project [ ${post.project || 0} ]

- G002 [ ${post.g002 || 0} ]
- G003 [ ${post.g003 || 0} ]
- G004 [ ${post.g004 || 0} ]
- GT01 [ ${post.gt01 || 0} ]

Bin :
${bins || "- (No Bin Location)"}

Old MID :
${oldMids || "- (No Old MID Mapping)"}`;
    }

    navigator.clipboard.writeText(text);
    setCopiedState(type);
    setTimeout(() => setCopiedState(null), 2000);
  };

  if (isLoading)
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center py-10">
        <LoaderCircle size={40} className="animate-spin text-indigo-400" />
      </div>
    );
  if (error || !post)
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center p-6 text-center">
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
            Data Tidak Ditemukan
          </h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed px-2">
            Maaf, kami tidak dapat menemukan data untuk MID{" "}
            <span className="font-bold text-indigo-600">#{id}</span>. Pastikan
            nomor MID sudah benar.
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

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-6 bg-white min-h-screen">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <motion.div
        id="detail"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-xl shadow-indigo-200/20"
      >
        {/* Image Slider Section */}
        <div className="relative aspect-video bg-slate-50 overflow-hidden group">
          {images.length > 0 ? (
            <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
              <motion.div
                className="flex h-full"
                style={{ width: `${images.length * 100}%` }}
                animate={{ x: `-${(currentImg * 100) / images.length}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(e, { offset }) => {
                  const swipe = offset.x;
                  if (swipe < -50) {
                    nextImg();
                  } else if (swipe > 50) {
                    prevImg();
                  }
                }}
              >
                {images.map((src, i) => (
                  <motion.div
                    key={i}
                    className="relative h-full flex-1 cursor-zoom-in"
                    onTap={() => setShowModal(true)}
                  >
                    <Image
                      src={src}
                      alt={`Slide ${i}`}
                      fill
                      unoptimized
                      className="object-cover touch-none"
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/40">
              <Link
                href={`/private/data/image/${id}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-[40px] transition-all hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 active:scale-95"
              >
                <div className="rounded-full flex items-center justify-center">
                  <ImagePlus
                    size={50}
                    className="text-slate-300 group-hover:text-indigo-400 transition-colors"
                  />
                </div>
              </Link>
            </div>
          )}

          {/* Overlay Gradient */}
          {images.length > 1 && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          )}

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImg();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImg();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

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
              <div className="rounded-full bg-black/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white uppercase  border border-white/20">
                {currentImg + 1} / {images.length}
              </div>
            </div>
          )}

          {/* Click Hint / Maximize Button */}
          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <button
                onClick={() => setShowModal(true)}
                className="pointer-events-auto bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white hover:bg-white/40 transition-colors"
              >
                <Maximize2 size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Tools Toolbar */}
        <div className="border-b border-slate-100 bg-white px-4 py-2.5 flex items-center justify-end gap-1.5">
          {/* Nav tools */}
          <Link
            href={`/private/data/image/${id}`}
            title="Edit Image"
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95"
          >
            <LucideImage size={18} />
          </Link>

          {userRole === "superuser" && (
            <Link
              href={`/private/bintobin?mids=${id}`}
              title="Bin Transfer"
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95"
            >
              <ArrowRightLeft size={18} />
            </Link>
          )}

          <button
            onClick={handleBinClick}
            title={
              binSicData && binSicData.length > 0 ? "View Bin" : "Add to Bin"
            }
            disabled={isLoadingBinSic}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95 disabled:opacity-50"
          >
            {isLoadingBinSic ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Archive size={18} />
            )}
          </button>

          {/* Divider */}
          <div className="mx-1 h-4 w-px bg-slate-200" />

          {/* Copy tools */}
          <button
            onClick={() => handleCopy("all")}
            title="Copy Full Details"
            className={`p-2 rounded-xl transition-colors active:scale-95 ${
              copiedState === "all"
                ? "text-indigo-600 bg-indigo-50"
                : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            {copiedState === "all" ? (
              <ClipboardCheck size={18} />
            ) : (
              <FileText size={18} />
            )}
          </button>
          <button
            onClick={() => handleCopy("basic")}
            title="Copy Basic"
            className={`p-2 rounded-xl transition-colors active:scale-95 ${
              copiedState === "basic"
                ? "text-green-600 bg-green-50"
                : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            {copiedState === "basic" ? (
              <ClipboardCheck size={18} />
            ) : (
              <Copy size={18} />
            )}
          </button>
        </div>

        <div className="p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold uppercase text-indigo-500">
                MID {post.mid}
              </span>
              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold uppercase text-slate-500">
                {post.uom}
              </span>
              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold uppercase text-slate-600">
                {calculateTotalStock(post)}
              </span>
            </div>
          </div>
          <h1 className="mb-6 text-lg font-bold leading-tight text-slate-900">
            {post.desc}
          </h1>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Left Side: Locations */}
            <div className="space-y-3">
              <div className="relative">
                <span className="inline-block rounded-full bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500 mb-2">
                  G001
                </span>
                <div className="ml-3 relative">
                  <div className="absolute left-0 top-0 bottom-[12px] w-px bg-slate-200" />
                  {[
                    { label: "Draft", value: post.draft },
                    { label: "Unrest", value: post.actual },
                    { label: "Project", value: post.project },
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
                  <span className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500">
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
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-block rounded-full bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500 w-fit">
                  Storage Bin
                </span>
                {post && binSicData && (
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const sapBins = (post.bin_sap || "")
                        .split(",")
                        .map((b) => b.trim().toUpperCase())
                        .filter(
                          (b) => b && b !== "-" && b !== "NONE" && b !== "N/A"
                        );
                      const sicBins = (binSicData || []).map((b) =>
                        b.bin.trim().toUpperCase()
                      );

                      const isMatch =
                        sapBins.length === sicBins.length &&
                        sapBins.every((b) => sicBins.includes(b)) &&
                        sicBins.every((b) => sapBins.includes(b));

                      return isMatch ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} />
                          <span>Match</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                          <AlertCircle size={12} />
                          <span>Different </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Bin SAP */}
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase  mb-3">
                    Bin SAP
                  </p>
                  <ul className="space-y-2">
                    {(post.bin_sap || "-").split(",").map((bin, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-xs text-slate-600 font-semibold"
                      >
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="truncate">{bin.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bin SIC */}
                <div className="order-first bg-indigo-50/30 rounded-2xl p-4 border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-400 uppercase  mb-3">
                    Bin SIC
                  </p>
                  <ul className="space-y-2">
                    {isLoadingBinSic ? (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <LoaderCircle size={12} className="animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : binSicData && binSicData.length > 0 ? (
                      binSicData.map((bin, i) => (
                        <li
                          key={i}
                          onClick={() =>
                            router.push(
                              `/private/bin/detail/${encodeURIComponent(
                                bin.bin
                              )}`
                            )
                          }
                          className="flex items-start gap-2 text-xs text-indigo-600 font-bold cursor-pointer group/bin"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1" />
                          <div className="flex flex-col min-w-0">
                            <span className="group-hover:underline truncate">
                              {bin.bin}
                            </span>
                            {bin.detail && (
                              <span className="text-[10px] font-medium text-slate-400 line-clamp-1 italic leading-tight">
                                {bin.detail}
                              </span>
                            )}
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-400 font-medium italic">
                        No Bin in SIC
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Old MID Mapping Section */}
          {oldMidData && oldMidData.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500">
                  <History size={16} />
                </div>
                <h2 className="text-xs font-bold text-slate-800 uppercase ">
                  ECC Data
                </h2>
              </div>

              <div className="space-y-3">
                {oldMidData.map((mapping, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold  text-indigo-500 uppercase ">
                        {mapping.old_mat}
                      </span>
                      <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs text-gray-500">
                        Old MID
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                      {mapping.old_desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[9px] font-bold text-slate-400 uppercase">
              Last Update
            </div>
            <div className="text-xs font-bold text-slate-500">
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
      </motion.div>
      <AnimatePresence>
        {showModal && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 sm:p-10"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/10"
            >
              <X size={18} />
            </button>

            {/* Zoom Controls (Moved to Top) */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-4 p-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl">
              <button
                onClick={() => setZoomScale((prev) => Math.max(prev - 0.5, 1))}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <ZoomOut size={16} />
              </button>
              <div className="w-10 text-center text-xs font-bold text-white tabular-nums">
                {Math.round(zoomScale * 100)}%
              </div>
              <button
                onClick={() => setZoomScale((prev) => Math.min(prev + 0.5, 3))}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Image Container */}
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
              <motion.div
                className="flex h-full w-full"
                animate={{
                  x: zoomScale > 1 ? 0 : `-${currentImg * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag={zoomScale > 1 ? true : "x"}
                dragConstraints={
                  zoomScale > 1
                    ? { left: -1000, right: 1000, top: -1000, bottom: 1000 }
                    : { left: 0, right: 0 }
                }
                onDragEnd={(e, { offset }) => {
                  if (zoomScale === 1) {
                    const swipe = offset.x;
                    if (swipe < -50) nextImg();
                    else if (swipe > 50) prevImg();
                  }
                }}
              >
                {images.map((src, i) => (
                  <div
                    key={i}
                    style={{
                      display:
                        zoomScale > 1 && i !== currentImg ? "none" : "flex",
                      minWidth: "100%",
                    }}
                    className="h-full flex items-center justify-center"
                  >
                    <motion.img
                      src={src}
                      initial={false}
                      animate={{ scale: zoomScale }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25,
                      }}
                      className="max-w-full max-h-full object-contain touch-none select-none"
                      onTouchStart={(e) => {
                        if (e.touches.length === 2) {
                          const dist = Math.hypot(
                            e.touches[0].pageX - e.touches[1].pageX,
                            e.touches[0].pageY - e.touches[1].pageY
                          );
                          setStartDistance(dist);
                          setStartScale(zoomScale);
                        }
                      }}
                      onTouchMove={(e) => {
                        if (e.touches.length === 2 && startDistance > 0) {
                          const dist = Math.hypot(
                            e.touches[0].pageX - e.touches[1].pageX,
                            e.touches[0].pageY - e.touches[1].pageY
                          );
                          const delta = dist / startDistance;
                          setZoomScale(
                            Math.min(Math.max(startScale * delta, 1), 4)
                          );
                        }
                      }}
                      onTouchEnd={() => setStartDistance(0)}
                      onClick={(e) => {
                        e.stopPropagation();
                        const now = Date.now();
                        if (now - lastTap.current < 300) {
                          setZoomScale(zoomScale > 1 ? 1 : 2.5);
                        }
                        lastTap.current = now;
                      }}
                    />
                  </div>
                ))}
              </motion.div>

              {/* Modal Navigation Buttons (Moved to Bottom) */}
              {images.length > 1 && zoomScale === 1 && (
                <div className="absolute bottom-10 left-0 right-0 z-[110] flex items-center justify-center gap-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImg();
                    }}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/10"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="rounded-full bg-white/10 backdrop-blur-md px-4 py-1 text-xs font-bold text-white tabular-nums border border-white/10">
                    {currentImg + 1} / {images.length}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImg();
                    }}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/10"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
