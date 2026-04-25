"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  Trash2,
  Image as LucideImage,
  Camera,
  FolderOpen,
  Plus,
  AlertCircle,
  CheckCircle2,
  Save,
  ImageUp,
  Cloud,
  CloudUpload,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useUndo } from "@/context/UndoContext";

export default function EditImage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const queryClient = useQueryClient();
  const { showUndo, showLoading, showError } = useUndo();

  const galleryRefs = useRef([]);
  const cameraRefs = useRef([]);
  const [uploading, setUploading] = useState(null); // slot key: 'img1', 'img2', 'img3'
  const [localPreviews, setLocalPreviews] = useState({}); // { img1: 'blob:...' }
  const [confirmDelete, setConfirmDelete] = useState(null); // { slot, fileId }

  // Fetch basic material info
  const { data: post, isLoading: isLoadingPost } = useQuery({
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

  // Fetch current images from the new system
  const { data: driveImages, isLoading: isLoadingImages } = useQuery({
    queryKey: ["drive_images", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .eq("mid", id)
        .maybeSingle();
      if (error) throw error;
      return data || { img1: null, img2: null, img3: null };
    },
  });

  const [activeSlots, setActiveSlots] = useState(["img1"]); // Show at least one slot

  useEffect(() => {
    if (driveImages) {
      const slots = [];
      if (driveImages.img1 || driveImages.img2 || driveImages.img3) {
        if (driveImages.img1) slots.push("img1");
        if (driveImages.img2) slots.push("img2");
        if (driveImages.img3) slots.push("img3");
      } else {
        slots.push("img1");
      }
      setActiveSlots([...new Set(slots)]);
    }
  }, [driveImages]);

  const getUserNickname = () => {
    const savedUser =
      typeof window !== "undefined" ? localStorage.getItem("sic_user") : null;
    return savedUser ? JSON.parse(savedUser).nickname : "system";
  };

  const handleFileSelect = async (e, slot) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size check (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      showError("File too large. Max 10MB allowed.");
      return;
    }

    e.target.value = ""; // reset
    setUploading(slot);

    // Client-side Compression
    const compressFile = async (originalFile) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(originalFile);
        reader.onload = (event) => {
          const img = new window.Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 1600;
            const MAX_HEIGHT = 1600;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                resolve(
                  new File([blob], originalFile.name, { type: "image/jpeg" })
                );
              },
              "image/jpeg",
              0.85
            );
          };
        };
      });
    };

    try {
      const readyFile = await compressFile(file);

      // Set local preview instantly for Optimistic UI
      const objectUrl = URL.createObjectURL(readyFile);
      setLocalPreviews((prev) => ({ ...prev, [slot]: objectUrl }));

      const formData = new FormData();
      formData.append("file", readyFile);
      formData.append("mid", id);
      formData.append("slot", slot);
      formData.append("user", getUserNickname());

      const oldFileId = driveImages?.[slot];
      if (oldFileId) {
        formData.append("oldFileId", oldFileId);
      }

      const res = await fetch("/api/image", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      queryClient.invalidateQueries(["drive_images", id]);
      queryClient.invalidateQueries(["post", id]);
      showUndo(`Image uploaded to ${slot.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      showError(err.message);
      // Remove failed preview
      setLocalPreviews((prev) => {
        const next = { ...prev };
        delete next[slot];
        return next;
      });
    } finally {
      setUploading(null);
    }
  };

  const handleRemove = (slot, fileId) => {
    if (!fileId) {
      // Just removing an empty slot
      setActiveSlots((prev) =>
        prev.filter((s) => s !== slot || prev.length === 1)
      );
      return;
    }
    setConfirmDelete({ slot, fileId });
  };

  const executeRemove = async () => {
    const { slot, fileId } = confirmDelete;
    setConfirmDelete(null);
    setUploading(slot);
    try {
      const res = await fetch(
        `/api/image?fileId=${fileId}&mid=${id}&slot=${slot}&user=${getUserNickname()}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Delete failed");

      // Clear local preview if any
      setLocalPreviews((prev) => {
        const next = { ...prev };
        delete next[slot];
        return next;
      });

      queryClient.invalidateQueries(["drive_images", id]);
      queryClient.invalidateQueries(["post", id]);
      showUndo(`Image deleted from ${slot.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      showError(err.message);
    } finally {
      setUploading(null);
    }
  };

  const addSlot = () => {
    const all = ["img1", "img2", "img3"];
    const next = all.find((s) => !activeSlots.includes(s));
    if (next) setActiveSlots([...activeSlots, next]);
  };

  if (isLoadingPost || isLoadingImages)
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
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:scale-95"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center font-bold gap-1.5 text-xs text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
          <ImageUp size={14} />
          Auto
        </div>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[32px] border border-indigo-100 bg-white shadow-xl shadow-indigo-200/20"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-500 uppercase tracking-tight">
              MID {id}
            </span>
            <div className="flex gap-1 items-center">
              <CloudUpload size={16} className="text-slate-400" />
              <span className="text-xs font-bold  text-slate-400">Gdrive</span>
            </div>
          </div>
          <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">
            {post?.desc}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 px-1">
              Image ({activeSlots.length}/3)
            </span>
            {activeSlots.length < 3 && (
              <button
                onClick={addSlot}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-2 rounded-full"
              >
                <Plus size={14} />
                Add
              </button>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {activeSlots.sort().map((slot, index) => {
              const fileId = driveImages?.[slot];
              const isSlotUploading = uploading === slot;

              return (
                <motion.div
                  key={slot}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-stretch gap-4 bg-slate-50/50 border border-slate-100 rounded-[24px] p-3 transition-all hover:border-indigo-100"
                >
                  {/* Thumbnail */}
                  <div className="relative w-28 h-28 shrink-0 bg-white rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center shadow-sm">
                    {localPreviews[slot] || fileId ? (
                      <>
                        <Image
                          src={
                            localPreviews[slot] ||
                            `https://lh3.googleusercontent.com/d/${fileId}`
                          }
                          alt={slot}
                          fill
                          unoptimized
                          className={`object-cover transition-opacity duration-500 ${isSlotUploading ? "opacity-40" : "opacity-100"}`}
                        />
                        {isSlotUploading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-50/20 backdrop-blur-[2px]">
                            <LoaderCircle
                              size={24}
                              className="animate-spin text-indigo-500 mb-1"
                            />
                            <span className="text-xs font-bold text-indigo-500 tracking-tighter">
                              Sync
                            </span>
                          </div>
                        )}
                      </>
                    ) : isSlotUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <LoaderCircle
                          size={24}
                          className="animate-spin text-indigo-400"
                        />
                        <span className="text-xs font-bold text-indigo-400">
                          Upload
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <LucideImage size={28} className="text-slate-400" />
                      </div>
                    )}

                    <div className="flex h-5 w-5 items-center justify-center absolute top-2 left-2 rounded-full bg-indigo-500/80 backdrop-blur-md text-[10px] text-white font-bold">
                      {slot.slice(-1)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-1 flex flex-col justify-center gap-3">
                    <div className="flex items-center justify-between bg-slate-100/50 rounded-3xl p-1 border border-slate-200/40">
                      <button
                        onClick={() => galleryRefs.current[index]?.click()}
                        disabled={!!uploading}
                        className="flex-1 flex items-center justify-center py-3.5 rounded-2xl hover:bg-white hover:shadow-sm text-slate-500 hover:text-indigo-500 transition-all active:scale-90 disabled:opacity-50"
                        title="Gallery"
                      >
                        <FolderOpen size={20} />
                      </button>
                      <input
                        ref={(el) => (galleryRefs.current[index] = el)}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, slot)}
                      />

                      <button
                        onClick={() => cameraRefs.current[index]?.click()}
                        disabled={!!uploading}
                        className="flex-1 flex items-center justify-center py-3.5 rounded-2xl hover:bg-white hover:shadow-sm text-slate-500 hover:text-indigo-500 transition-all active:scale-90 disabled:opacity-50"
                        title="Camera"
                      >
                        <Camera size={20} />
                      </button>
                      <input
                        ref={(el) => (cameraRefs.current[index] = el)}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, slot)}
                      />

                      <div className="w-px h-6 bg-slate-200/60 mx-1" />

                      <button
                        onClick={() => handleRemove(slot, fileId)}
                        disabled={!!uploading}
                        className="flex-1 flex items-center justify-center py-3.5 rounded-2xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all active:scale-90 disabled:opacity-50"
                        title={fileId ? "Delete Image" : "Remove Slot"}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <AlertCircle size={16} className="text-slate-400 shrink-0" />
          <p className="text-xs text-slate-400 leading-tight">
            Images are compressed on our server before being sent to Google
            Drive to ensure high speed and quality. Maximum file size is 10MB.
          </p>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} className="text-red-500" />
              </div>

              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                Delete Image?
              </h3>
              <p className="text-sm text-slate-500 text-center mb-8">
                This will permanently remove the image from Google Drive. This
                action cannot be undone.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={executeRemove}
                  className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-100 hover:bg-red-600 transition-all active:scale-[0.98]"
                >
                  Yes, Delete Image
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="w-full py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
