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
  const [isSaving, setIsSaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Staged changes
  const [stagedFiles, setStagedFiles] = useState({}); // { img1: File }
  const [stagedDeletes, setStagedDeletes] = useState(new Set()); // Set { 'img1' }

  const isDirty = Object.keys(stagedFiles).length > 0 || stagedDeletes.size > 0;

  // Prevent accidental leave
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

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

      // Set local preview instantly
      const objectUrl = URL.createObjectURL(readyFile);
      setLocalPreviews((prev) => ({ ...prev, [slot]: objectUrl }));

      // Stage for upload
      setStagedFiles((prev) => ({ ...prev, [slot]: readyFile }));
      setStagedDeletes((prev) => {
        const next = new Set(prev);
        next.delete(slot);
        return next;
      });
    } catch (err) {
      console.error(err);
      showError(err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    showLoading("Saving changes...");

    try {
      // 1. Handle Deletes
      for (const slot of stagedDeletes) {
        const fileId = driveImages[slot];
        if (fileId) {
          const res = await fetch(
            `/api/image?fileId=${fileId}&mid=${id}&slot=${slot}&user=${getUserNickname()}`,
            { method: "DELETE" }
          );
          if (!res.ok) {
            const err = await res.json();
            throw new Error(`Delete failed for ${slot}: ${err.error}`);
          }
        }
      }

      // 2. Handle Uploads
      for (const [slot, file] of Object.entries(stagedFiles)) {
        const formData = new FormData();
        formData.append("file", file);
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

        if (!res.ok) {
          const err = await res.json();
          throw new Error(`Upload failed for ${slot}: ${err.error}`);
        }
      }

      await queryClient.invalidateQueries(["drive_images", id]);
      await queryClient.invalidateQueries(["post", id]);

      setStagedFiles({});
      setStagedDeletes(new Set());
      setLocalPreviews({});

      // Update active slots based on what's actually there now
      const { data: newData } = await queryClient.fetchQuery({
        queryKey: ["drive_images", id],
      });
      if (newData) {
        const slots = [];
        if (newData.img1) slots.push("img1");
        if (newData.img2) slots.push("img2");
        if (newData.img3) slots.push("img3");
        if (slots.length === 0) slots.push("img1");
        setActiveSlots([...new Set(slots)]);
      }

      showUndo("All changes saved successfully");
    } catch (err) {
      console.error(err);
      showError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      setShowLeaveConfirm(true);
    } else {
      router.back();
    }
  };

  const handleRemove = (slot, fileId) => {
    // If slot is completely empty (no staged, no existing), just remove it from activeSlots
    if (!fileId && !stagedFiles[slot]) {
      setActiveSlots((prev) =>
        prev.filter((s) => s !== slot || prev.length === 1)
      );
      return;
    }
    setConfirmDelete({ slot, fileId });
  };

  const executeRemove = () => {
    const { slot } = confirmDelete;
    setConfirmDelete(null);

    let removedSomething = false;

    // 1. If it was a staged upload, unstage it
    if (stagedFiles[slot]) {
      setStagedFiles((prev) => {
        const next = { ...prev };
        delete next[slot];
        return next;
      });
      setLocalPreviews((prev) => {
        const next = { ...prev };
        delete next[slot];
        return next;
      });
      removedSomething = true;
    }

    // 2. If it is an existing image, stage for delete
    if (driveImages[slot]) {
      setStagedDeletes((prev) => new Set(prev).add(slot));
      removedSomething = true;
    }

    // 3. If slot is now effectively empty and not an existing slot being deleted,
    // we can consider removing it from activeSlots if the user wants,
    // but usually, it's better to keep the slot visible but empty.
    // Let's just show the undo message.
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
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:scale-95"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-all active:scale-95 shadow-lg ${
              isDirty
                ? "bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-100"
                : "bg-slate-100 text-slate-400 shadow-transparent cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save
          </button>
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
                    {localPreviews[slot] ||
                    (fileId && !stagedDeletes.has(slot)) ? (
                      <>
                        <Image
                          src={
                            localPreviews[slot] ||
                            `https://lh3.googleusercontent.com/d/${fileId}`
                          }
                          alt={slot}
                          fill
                          unoptimized
                          className={`object-cover transition-opacity duration-500 ${isSaving && (stagedFiles[slot] || stagedDeletes.has(slot)) ? "opacity-40" : "opacity-100"}`}
                        />
                        {isSaving &&
                          (stagedFiles[slot] || stagedDeletes.has(slot)) && (
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
                        {stagedDeletes.has(slot) && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/40 backdrop-blur-[1px]">
                            <Trash2 size={24} className="text-red-500 mb-1" />
                            <span className="text-[10px] font-black text-red-500 uppercase">
                              Delete
                            </span>
                          </div>
                        )}
                        {stagedFiles[slot] && (
                          <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm border border-white">
                            <Plus size={10} strokeWidth={4} />
                          </div>
                        )}
                      </>
                    ) : isSaving && stagedDeletes.has(slot) ? (
                      <div className="flex flex-col items-center gap-2">
                        <LoaderCircle
                          size={24}
                          className="animate-spin text-red-400"
                        />
                        <span className="text-xs font-bold text-red-400">
                          Removing
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
                        disabled={!!uploading || isSaving}
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
                        disabled={!!uploading || isSaving}
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
                        disabled={isSaving}
                        className={`flex-1 flex items-center justify-center py-3.5 rounded-2xl transition-all active:scale-90 disabled:opacity-50 ${
                          stagedDeletes.has(slot)
                            ? "bg-red-50 text-red-500"
                            : "hover:bg-red-50 text-slate-400 hover:text-red-500"
                        }`}
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

        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                <AlertCircle size={16} className="text-slate-400 shrink-0" />
                <p className="text-xs text-slate-400 leading-tight">
                  Images are compressed on our server before being sent to
                  Google Drive to ensure high speed and quality. Maximum file
                  size is 10MB.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Leave Confirmation Modal */}
      <AnimatePresence>
        {showLeaveConfirm && (
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
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} className="text-amber-500" />
              </div>

              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                Unsaved Changes
              </h3>
              <p className="text-sm text-slate-500 text-center mb-8">
                You have unsaved changes. Are you sure you want to leave this
                page? All progress will be lost.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.back()}
                  className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all active:scale-[0.98]"
                >
                  Discard and Leave
                </button>
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="w-full py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-all active:scale-[0.98]"
                >
                  Stay and Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
