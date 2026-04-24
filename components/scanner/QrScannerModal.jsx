"use client";
import { useEffect } from "react";
import { X, Camera, CameraOff, ShieldAlert, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useQrScanner } from "@/lib/qr";

/**
 * Categorize error messages for appropriate icon and tone
 */
function getErrorContext(errorMsg) {
  if (!errorMsg) return null;
  const msg = errorMsg.toLowerCase();

  if (msg.includes("no camera") || msg.includes("not found"))
    return {
      icon: CameraOff,
      title: "No Camera Available",
      color: "slate",
      canRetry: false,
    };
  if (msg.includes("secure") || msg.includes("https"))
    return {
      icon: ShieldAlert,
      title: "Secure Connection Required",
      color: "amber",
      canRetry: false,
    };
  if (msg.includes("module") || msg.includes("internet"))
    return {
      icon: Wifi,
      title: "Connection Issue",
      color: "amber",
      canRetry: true,
    };
  // Default: permission or generic issue
  return {
    icon: Camera,
    title: "Camera Access Needed",
    color: "indigo",
    canRetry: true,
  };
}

export default function QrScannerModal({ isOpen, onClose, onScan }) {
  const { startScanner, stopScanner, isScanning, isInitializing, error } =
    useQrScanner();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startScanner("qr-reader", (text) => {
          onScan(text);
          onClose();
        });
      }, 500);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
  }, [isOpen]);

  const errCtx = getErrorContext(error);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5 text-indigo-600">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <Camera
                      size={20}
                      strokeWidth={2.5}
                      className="text-indigo-500"
                    />
                  </div>
                  <h2 className="text-lg font-black tracking-tight">
                    Scan QR
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scanner Area */}
              <div className="relative aspect-square w-full bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner">
                <div id="qr-reader" className="w-full h-full" />

                {/* Initializing State */}
                {isInitializing && !error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-20">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-4" />
                    <p className="text-xs font-medium text-slate-400">
                      Starting camera...
                    </p>
                  </div>
                )}

                {/* Active Scanning Overlay */}
                {isScanning && !error && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div
                      className="absolute inset-x-8 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] z-10"
                      style={{
                        animation: "scan-line 3s ease-in-out infinite",
                        top: "50%",
                      }}
                    />
                    <div className="absolute inset-12 border-2 border-white/20 rounded-2xl">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg" />
                    </div>
                    <div className="absolute inset-0 border-[60px] border-black/40" />
                  </div>
                )}

                {/* Error / Notice State */}
                {error && errCtx && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white z-20">
                    <div
                      className={`p-5 rounded-full mb-5 ${
                        errCtx.color === "slate"
                          ? "bg-slate-100"
                          : errCtx.color === "amber"
                            ? "bg-amber-50"
                            : "bg-indigo-50"
                      }`}
                    >
                      <errCtx.icon
                        size={36}
                        className={
                          errCtx.color === "slate"
                            ? "text-slate-400"
                            : errCtx.color === "amber"
                              ? "text-amber-500"
                              : "text-indigo-500"
                        }
                      />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 mb-2 uppercase tracking-tight">
                      {errCtx.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-8 max-w-[240px] mx-auto font-medium">
                      {error}
                    </p>
                    <div className="flex flex-col gap-2.5 w-full max-w-[200px]">
                      {errCtx.canRetry && (
                        <button
                          onClick={() => {
                            startScanner("qr-reader", (text) => {
                              onScan(text);
                              onClose();
                            });
                          }}
                          className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold uppercase shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                        >
                          Try Again
                        </button>
                      )}
                      <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-slate-100 text-slate-500 rounded-2xl text-xs font-bold uppercase active:scale-95 transition-all"
                      >
                        {errCtx.canRetry ? "Cancel" : "Got it"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom hint — only show when actively scanning */}
              {isScanning && !error && (
                <div className="mt-5 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    Align QR code within the frame
                  </p>
                </div>
              )}

              {/* Bottom hint — when error, show manual input suggestion */}
              {error && !errCtx?.canRetry && (
                <div className="mt-5 text-center">
                  <p className="text-[11px] font-medium text-slate-400">
                    You can type the bin name manually in the search field
                  </p>
                </div>
              )}
            </div>

            <style jsx global>{`
              @keyframes scan-line {
                0%,
                100% {
                  transform: translateY(-100px);
                  opacity: 0;
                }
                10%,
                90% {
                  opacity: 1;
                }
                50% {
                  transform: translateY(100px);
                }
              }
              #qr-reader video {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
              }
              #qr-reader {
                border: none !important;
              }
            `}</style>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
