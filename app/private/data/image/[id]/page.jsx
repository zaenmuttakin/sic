"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  Trash2,
  Image as LucideImage,
  Save,
  Camera,
  FolderOpen,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useUndo } from "@/context/UndoContext";

export default function EditImage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const queryClient = useQueryClient();
  const { showUndo, showLoading, showError } = useUndo();

  // Per-slot refs for gallery and camera hidden inputs
  const galleryRefs = useRef([]);
  const cameraRefs = useRef([]);
  const [uploading, setUploading] = useState(null); // slot index being uploaded

  const { data: post, isLoading } = useQuery({
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

  const [images, setImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);

  useEffect(() => {
    if (post) {
      const initial = post.images || [];
      setImages(initial);
      setOriginalImages(initial);
    }
  }, [post]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const undoMutation = useMutation({
    mutationFn: async (prev) => {
      const { error } = await supabase
        .from("from_sheets")
        .update({ images: prev })
        .eq("mid", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(["post", id]),
  });

  const saveMutation = useMutation({
    mutationFn: async (next) => {
      const { error } = await supabase
        .from("from_sheets")
        .update({ images: next })
        .eq("mid", id);
      if (error) throw error;
    },
    onMutate: () => {
      showLoading("Saving changes...");
    },
    onError: (err) => {
      showError("Failed to save images");
      console.error(err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["post", id]);
      showUndo("Images updated successfully", () => undoMutation.mutate(originalImages));
      router.back();
    },
  });

  // ── Image helpers ──────────────────────────────────────────────────────────
  const handleRemove = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const handleAdd = () => {
    if (images.length < 3) setImages((prev) => [...prev, ""]);
  };

  const handleUrlChange = (index, value) =>
    setImages((prev) => prev.map((img, i) => (i === index ? value : img)));

  const handleSave = () => {
    const filtered = images.filter((img) => img.trim() !== "");
    saveMutation.mutate(filtered);
  };

  // ── File upload (gallery or camera) ───────────────────────────────────────
  // Converts the file to a base64 data URL and stores it directly in the DB.
  // No Supabase Storage bucket required.
  const handleFileSelect = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be reselected

    setUploading(index);
    try {
      // Resize + compress before encoding to keep DB row size manageable
      const dataUrl = await resizeAndEncode(file, 1200, 0.82);
      handleUrlChange(index, dataUrl);
    } catch (err) {
      console.error("Image processing failed:", err);
    } finally {
      setUploading(null);
    }
  };

  // Resize image to maxWidth and encode as JPEG base64 data URL
  const resizeAndEncode = (file, maxWidth, quality) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <LoaderCircle size={36} className="animate-spin text-indigo-400" />
      </div>
    );

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {saveMutation.isPending ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save
        </button>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-xl shadow-indigo-200/20"
      >
        {/* Material info */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-500 uppercase">
              MID {id}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
              Edit Images
            </span>
          </div>
          <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">
            {post?.desc}
          </p>
        </div>

        {/* Image slots */}
        <div className="p-4 space-y-3">
          {/* Slot count + Add */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Images ({images.length}/3)
            </span>
            {images.length < 3 && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                <Plus size={14} />
                Add Slot
              </button>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {images.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-stretch gap-3 bg-slate-50/60 border border-slate-100 rounded-2xl overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative w-20 shrink-0 bg-slate-100 flex items-center justify-center">
                  {uploading === index ? (
                    <LoaderCircle
                      size={20}
                      className="animate-spin text-indigo-400"
                    />
                  ) : img ? (
                    <img
                      src={img}
                      alt={`Slot ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <LucideImage size={20} className="text-slate-300" />
                  )}

                  {/* Slot number badge */}
                  <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-[9px] font-black text-slate-500">
                      {index + 1}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex-1 py-3 pr-3 flex flex-col justify-between gap-2">
                  {/* URL input */}
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="Paste URL or upload below…"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                  />

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Gallery picker — no capture attr, opens photo library */}
                    <button
                      onClick={() => galleryRefs.current[index]?.click()}
                      disabled={uploading !== null}
                      title="Upload from gallery"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-500 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-40"
                    >
                      <FolderOpen size={13} />
                      Gallery
                    </button>
                    <input
                      ref={(el) => (galleryRefs.current[index] = el)}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, index)}
                    />

                    {/* Camera — capture="environment" opens rear camera on mobile */}
                    <button
                      onClick={() => cameraRefs.current[index]?.click()}
                      disabled={uploading !== null}
                      title="Take photo"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-500 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-40"
                    >
                      <Camera size={13} />
                      Camera
                    </button>
                    <input
                      ref={(el) => (cameraRefs.current[index] = el)}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, index)}
                    />

                    {/* Delete slot */}
                    <button
                      onClick={() => handleRemove(index)}
                      title="Remove"
                      className="p-1.5 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty state */}
          {images.length === 0 && (
            <button
              onClick={handleAdd}
              className="w-full py-10 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-400 transition-colors gap-2"
            >
              <LucideImage size={28} className="opacity-40" />
              <span className="text-xs font-bold">Tap to add an image slot</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
