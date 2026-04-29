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
  Image as LucideImage,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  History,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Copy,
  FileText,
  Archive,
  CheckCircle2,
  AlertCircle,
  ImagePlus,
  ArrowRightLeft,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  // Data Fetching
  const {
    data: combinedData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["material_detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_master_view")
        .select("*")
        .eq("mid", id);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const first = data[0];
      const post = {
        ...first,
        desc: first.material_name,
        update_at: first.last_sheet_update,
      };

      const binSicData = data
        .filter((row) => row.bin_location)
        .map((row) => ({
          bin: row.bin_location,
          type: row.bin_type,
          detail: row.bin_detail,
          update_at: row.last_bin_update,
        }));

      const driveImages =
        first.img1 || first.img2 || first.img3
          ? {
              img1: first.img1,
              img2: first.img2,
              img3: first.img3,
              detail_change: first.image_notes,
              update_at: first.last_image_update,
            }
          : null;

      return { post, binSicData, driveImages };
    },
  });

  const { data: oldMidData } = useQuery({
    queryKey: ["old_mid_lookup", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("old_mid")
        .select("*")
        .eq("new_mat", id);
      return error ? null : data;
    },
    enabled: !!combinedData?.post,
  });

  const post = combinedData?.post;
  const binSicData = combinedData?.binSicData;
  const driveImages = combinedData?.driveImages;

  // State
  const [showModal, setShowModal] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [copiedState, setCopiedState] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("sic_user");
    if (savedUser) setUserRole(JSON.parse(savedUser).role);
  }, []);

  // Image Processing
  let images = post?.images || [];
  if (driveImages) {
    const driveUrls = [driveImages.img1, driveImages.img2, driveImages.img3]
      .filter(Boolean)
      .map((fileId) => `https://lh3.googleusercontent.com/d/${fileId}`);
    if (driveUrls.length > 0) images = driveUrls;
  }

  // Handlers
  const nextImg = () =>
    images.length > 1 && setCurrentImg((prev) => (prev + 1) % images.length);
  const prevImg = () =>
    images.length > 1 &&
    setCurrentImg((prev) => (prev - 1 + images.length) % images.length);

  const calculateTotalStock = (p) => {
    const fields = ["actual", "gt01", "g002", "g003", "g004"];
    return fields.reduce((sum, field) => sum + (Number(p[field]) || 0), 0);
  };

  const handleCopy = (type) => {
    let text = "";
    if (type === "basic") {
      text = `${post.mid}\n${post.desc}\n${post.uom}`;
    } else if (type === "all") {
      const total = calculateTotalStock(post);
      const sapBins = (post.bin_sap || "")
        .split(",")
        .filter((b) => b.trim())
        .map((b) => `- ${b.trim()}`)
        .join("\n");
      const oldMids = (oldMidData || [])
        .map((m) => `- ${m.old_mat} ${m.old_desc}`)
        .join("\n");

      text = `${post.mid}\n${post.desc}\n${post.uom}\n\nStock :\nTotal [ ${total} ]\n- G001\n   |- Draft [ ${post.draft || 0} ]\n   |- Unrest [ ${post.actual - (post.project || 0) - (post.draft || 0)} ]\n   |- Project [ ${post.project || 0} ]\n\n- G002 [ ${post.g002 || 0} ]\n- G003 [ ${post.g003 || 0} ]\n- G004 [ ${post.g004 || 0} ]\n- GT01 [ ${post.gt01 || 0} ]\n\nBin :\n${sapBins || "- (No Bin Location)"}\n\nOld MID :\n${oldMids || "- (No Old MID Mapping)"}`;
    }
    navigator.clipboard.writeText(text);
    setCopiedState(type);
    setTimeout(() => setCopiedState(null), 2000);
  };

  const handleBinClick = () => {
    if (!post) return;
    if (binSicData?.length > 0) {
      router.push(
        `/private/bin/detail/${encodeURIComponent(binSicData[0].bin)}?from=${post.mid}`
      );
    } else {
      const firstBin = (post.bin_sap || "-").split(",")[0].trim();
      const isPlaceholder =
        !firstBin || ["-", "n/a", "none"].includes(firstBin.toLowerCase());
      let url = `/private/bin/adding/${post.mid}?desc=${encodeURIComponent(post.desc)}`;
      if (!isPlaceholder)
        url += `&targetBin=${encodeURIComponent(firstBin.toUpperCase())}`;
      router.push(url);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error || !post)
    return <ErrorState id={id} onBack={() => router.back()} />;

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-6 bg-white min-h-screen">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-xl shadow-indigo-200/20"
      >
        <ImageGallery
          images={images}
          currentImg={currentImg}
          setCurrentImg={setCurrentImg}
          onNext={nextImg}
          onPrev={prevImg}
          onMaximize={() => setShowModal(true)}
          mid={id}
        />

        <ActionToolbar
          id={id}
          userRole={userRole}
          isLoadingBin={isLoading}
          binCount={binSicData?.length}
          copiedState={copiedState}
          onBinClick={handleBinClick}
          onCopy={handleCopy}
        />

        <div className="p-6">
          <HeaderInfo post={post} totalStock={calculateTotalStock(post)} />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <StockSection post={post} />
            <BinSection
              post={post}
              binSicData={binSicData}
              onBinDetail={(bin) =>
                router.push(`/private/bin/detail/${encodeURIComponent(bin)}`)
              }
            />
          </div>

          <OldMidSection data={oldMidData} />

          <FooterUpdate date={post.update_at} />
        </div>
      </motion.div>

      <ImageModal
        show={showModal}
        images={images}
        currentImg={currentImg}
        onClose={() => setShowModal(false)}
        onNext={nextImg}
        onPrev={prevImg}
      />
    </div>
  );
}

/**
 * Sub-components
 */

function ImageGallery({
  images,
  currentImg,
  setCurrentImg,
  onNext,
  onPrev,
  onMaximize,
  mid,
}) {
  return (
    <div className="relative aspect-video bg-slate-50 overflow-hidden group">
      {images.length > 0 ? (
        <>
          <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
            <motion.div
              className="flex h-full"
              style={{ width: `${images.length * 100}%` }}
              animate={{ x: `-${(currentImg * 100) / images.length}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, { offset }) => {
                if (offset.x < -50) onNext();
                else if (offset.x > 50) onPrev();
              }}
            >
              {images.map((src, i) => (
                <div
                  key={i}
                  className="relative h-full flex-1 cursor-zoom-in"
                  onClick={onMaximize}
                >
                  <Image
                    src={src}
                    alt={`Slide ${i}`}
                    fill
                    unoptimized
                    className="object-cover touch-none"
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {images.length > 1 && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <button
                onClick={onPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImg(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${currentImg === i ? "w-6 bg-white shadow-sm" : "w-1.5 bg-white/40 hover:bg-white/60"}`}
                  />
                ))}
              </div>
              <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-xs font-bold text-white border border-white/20">
                {currentImg + 1} / {images.length}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button
                  onClick={onMaximize}
                  className="pointer-events-auto bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white hover:bg-white/40 transition-colors"
                >
                  <Maximize2 size={20} />
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/40">
          <Link
            href={`/private/data/image/${mid}`}
            className="group flex flex-col items-center gap-3 p-5 rounded-[40px] transition-all hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 active:scale-95"
          >
            <ImagePlus
              size={50}
              className="text-slate-300 group-hover:text-indigo-400 transition-colors"
            />
          </Link>
        </div>
      )}
    </div>
  );
}

function ActionToolbar({
  id,
  userRole,
  isLoadingBin,
  binCount,
  copiedState,
  onBinClick,
  onCopy,
}) {
  return (
    <div className="border-b border-slate-100 bg-white px-4 py-2.5 flex items-center justify-end gap-1.5">
      {userRole === "superuser" && (
        <Link
          href={`/private/bintobin?mids=${id}`}
          title="Bin Transfer"
          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95"
        >
          <ArrowRightLeft size={18} />
        </Link>
      )}
      <Link
        href={`/private/data/image/${id}`}
        title="Edit Image"
        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95"
      >
        <LucideImage size={18} />
      </Link>
      <button
        onClick={onBinClick}
        title={binCount > 0 ? "View Bin" : "Add to Bin"}
        disabled={isLoadingBin}
        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95 disabled:opacity-50"
      >
        {isLoadingBin ? (
          <LoaderCircle size={18} className="animate-spin" />
        ) : (
          <Archive size={18} />
        )}
      </button>
      <div className="mx-1 h-4 w-px bg-slate-200" />
      <ToolbarButton
        onClick={() => onCopy("all")}
        active={copiedState === "all"}
        icon={
          copiedState === "all" ? (
            <ClipboardCheck size={18} />
          ) : (
            <FileText size={18} />
          )
        }
      />
      <ToolbarButton
        onClick={() => onCopy("basic")}
        active={copiedState === "basic"}
        activeClass="text-emerald-600 bg-emerald-50"
        icon={
          copiedState === "basic" ? (
            <ClipboardCheck size={18} />
          ) : (
            <Copy size={18} />
          )
        }
      />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  icon,
  activeClass = "text-indigo-600 bg-indigo-50",
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition-colors active:scale-95 ${active ? activeClass : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"}`}
    >
      {icon}
    </button>
  );
}

function HeaderInfo({ post, totalStock }) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-1.5">
        <Badge icon={<Package size={14} />} label={`MID ${post.mid}`} primary />
        <Badge label={post.uom} />
        <Badge label={totalStock} />
      </div>
      <h1 className="text-xl font-bold leading-tight text-slate-900">
        {post.desc}
      </h1>
    </div>
  );
}

function StockSection({ post }) {
  const g001Items = [
    { label: "Draft", value: post.draft },
    {
      label: "Unrest",
      value: (post.actual || 0) - (post.project || 0) - (post.draft || 0),
    },
    { label: "Project", value: post.project },
  ];

  const others = [
    { label: "G002", value: post.g002 },
    { label: "G003", value: post.g003 },
    { label: "G004", value: post.g004 },
    { label: "GT01", value: post.gt01 },
  ];

  return (
    <div className="space-y-3">
      <SectionBadge label="G001" />
      <div className="ml-3 relative pl-6 py-1 space-y-3">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" />
        {g001Items.map((item) => (
          <div
            key={item.label}
            className="relative flex items-center justify-between text-xs"
          >
            <div className="absolute -left-6 top-1/2 w-4 h-px bg-slate-200" />
            <span className="text-slate-500 font-semibold">{item.label}</span>
            <div className="mx-3 flex-1 h-px bg-slate-100" />
            <span className="text-slate-900 font-bold">{item.value || 0}</span>
          </div>
        ))}
      </div>
      {others.map((loc) => (
        <div key={loc.label} className="flex items-center gap-3">
          <SectionBadge label={loc.label} />
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs font-bold text-slate-900">
            {loc.value || 0}
          </span>
        </div>
      ))}
    </div>
  );
}

function BinSection({ post, binSicData, onBinDetail }) {
  const sapBins = (post.bin_sap || "")
    .split(",")
    .map((b) => b.trim().toUpperCase())
    .filter((b) => b && !["-", "NONE", "N/A"].includes(b));
  const sicBins = (binSicData || []).map((b) => b.bin.trim().toUpperCase());
  const isMatch =
    sapBins.length === sicBins.length &&
    sapBins.every((b) => sicBins.includes(b)) &&
    sicBins.every((b) => sapBins.includes(b));

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <SectionBadge label="Storage Bin" />
        {isMatch ? (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full uppercase">
            <CheckCircle2 size={12} /> Match
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase">
            <AlertCircle size={12} /> Diff
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BinList
          title="Bin SIC"
          items={binSicData?.length > 0 ? binSicData : null}
          colorClass="bg-indigo-50/30 border-indigo-100"
          textClass="text-indigo-600"
          dotClass="bg-indigo-400"
          onItemClick={onBinDetail}
        />
        <BinList
          title="Bin SAP"
          items={post.bin_sap?.split(",") || ["-"]}
          colorClass="bg-slate-50/50 border-slate-100"
          textClass="text-slate-600"
          dotClass="bg-slate-300"
        />
      </div>
    </div>
  );
}

function BinList({
  title,
  items,
  colorClass,
  textClass,
  dotClass,
  onItemClick,
}) {
  return (
    <div className={`rounded-2xl p-4 border ${colorClass}`}>
      <p className={`text-xs font-bold uppercase mb-3 ${textClass}`}>{title}</p>
      <ul className="space-y-2">
        {items ? (
          items.map((item, i) => {
            const isObject = typeof item === "object";
            const label = isObject ? item.bin : item.trim();
            return (
              <li
                key={i}
                onClick={() => isObject && onItemClick(label)}
                className={`flex items-start gap-2 text-xs font-bold ${isObject ? "cursor-pointer group" : ""} ${textClass}`}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${dotClass}`}
                />
                <div className="flex flex-col min-w-0">
                  <span
                    className={
                      isObject ? "group-hover:underline truncate" : "truncate"
                    }
                  >
                    {label}
                  </span>
                  {isObject && item.detail && (
                    <span className="text-xs font-medium text-slate-400 italic leading-tight">
                      {item.detail}
                    </span>
                  )}
                </div>
              </li>
            );
          })
        ) : (
          <li className="text-xs text-slate-400 font-medium italic">No Data</li>
        )}
      </ul>
    </div>
  );
}

function OldMidSection({ data }) {
  if (!data?.length) return null;
  return (
    <div className="mt-8 pt-6 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500">
          <History size={16} />
        </div>
        <h2 className="text-xs font-bold text-slate-800 uppercase">
          ECC Data Mapping
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.map((m, idx) => (
          <div
            key={idx}
            className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-indigo-500">
                {m.old_mat}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">
                Old MID
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 leading-relaxed line-clamp-2">
              {m.old_desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageModal({ show, images, currentImg, onClose, onNext, onPrev }) {
  const [zoom, setZoom] = useState(1);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/10"
          >
            <X size={18} />
          </button>

          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-4 p-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl">
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
              className="p-2 text-white hover:bg-white/10 rounded-full"
            >
              <ZoomOut size={16} />
            </button>
            <span className="w-12 text-center text-xs font-bold text-white tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
              className="p-2 text-white hover:bg-white/10 rounded-full"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          <div className="w-full h-full flex items-center justify-center p-4">
            <motion.div
              drag={zoom > 1}
              style={{ scale: zoom }}
              className="relative max-w-4xl max-h-full aspect-auto"
            >
              <img
                src={images[currentImg]}
                alt="Zoomed"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>

          {images.length > 1 && zoom === 1 && (
            <>
              <button
                onClick={onPrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors"
              >
                <ChevronLeft size={48} />
              </button>
              <button
                onClick={onNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors"
              >
                <ChevronRight size={48} />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionBadge({ label }) {
  return (
    <span className="inline-block rounded-full bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
      {label}
    </span>
  );
}

function Badge({ icon, label, primary }) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase ${primary ? "bg-indigo-50 text-indigo-500" : "bg-slate-50 text-slate-500"}`}
    >
      {icon} {label}
    </span>
  );
}

function FooterUpdate({ date }) {
  return (
    <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        Last Update
      </div>
      <div className="text-xs font-bold text-slate-500">
        {new Date(date).toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="w-full bg-white min-h-screen flex items-center justify-center">
      <LoaderCircle size={40} className="animate-spin text-indigo-400" />
    </div>
  );
}

function ErrorState({ id, onBack }) {
  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center p-6 text-center">
      <div className="max-w-sm w-full space-y-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <X size={40} className="text-red-400" />
        </div>
        <h2 className="text-xl font-black text-slate-800">
          Data Tidak Ditemukan
        </h2>
        <p className="text-sm text-slate-500">
          Maaf, kami tidak dapat menemukan data untuk MID{" "}
          <span className="font-bold text-indigo-600">#{id}</span>.
        </p>
        <button
          onClick={onBack}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-600 active:scale-95"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>
    </div>
  );
}
