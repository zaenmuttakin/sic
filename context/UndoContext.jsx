"use client";
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { Undo2, X, LoaderCircle, CheckCircle2, AlertCircle } from "lucide-react";

const DURATION = 5000; // ms

const UndoContext = createContext();

export function UndoProvider({ children }) {
  const [toastState, setToastState] = useState(null); // { message, type, onUndo, id }
  const timeoutRef = useRef(null);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToastState(null);
  }, []);

  const showToast = useCallback((message, type = "success", onUndo = null) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // new unique id forces motion.div to re-mount and re-animate
    setToastState({ message, type, onUndo, id: Date.now() });

    // Loading toasts stay until explicitly closed or overwritten
    if (type !== "loading") {
      timeoutRef.current = setTimeout(() => {
        setToastState(null);
        timeoutRef.current = null;
      }, DURATION);
    }
  }, []);

  const showUndo = useCallback(
    (message, onUndo) => showToast(message, "success", onUndo),
    [showToast]
  );
  
  const showLoading = useCallback(
    (message) => showToast(message, "loading"),
    [showToast]
  );
  
  const showError = useCallback(
    (message) => showToast(message, "error"),
    [showToast]
  );

  const handleUndo = useCallback(() => {
    if (toastState?.onUndo) toastState.onUndo();
    hideToast();
  }, [toastState, hideToast]);

  return (
    <UndoContext.Provider value={{ showUndo, showLoading, showError, hideToast }}>
      {children}
      <AnimatePresence>
        {toastState && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4">
            <motion.div
              key={toastState.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative overflow-hidden bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10"
            >
              {/* Progress bar — shrinks over DURATION ms for non-loading toasts */}
              {toastState.type !== "loading" && (
                <motion.div
                  key={`bar-${toastState.id}`}
                  className={`absolute top-0 left-0 h-0.5 rounded-full ${
                    toastState.type === "error" ? "bg-red-400" : "bg-indigo-400"
                  }`}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: DURATION / 1000, ease: "linear" }}
                />
              )}

              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center ${
                      toastState.type === "loading"
                        ? "bg-blue-500/20 text-blue-400"
                        : toastState.type === "error"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-indigo-500/20 text-indigo-400"
                    }`}
                  >
                    {toastState.type === "loading" && (
                      <LoaderCircle size={15} className="animate-spin" />
                    )}
                    {toastState.type === "error" && <AlertCircle size={15} />}
                    {toastState.type === "success" &&
                      (toastState.onUndo ? (
                        <Undo2 size={15} />
                      ) : (
                        <CheckCircle2 size={15} />
                      ))}
                  </div>
                  <p className="text-sm font-medium leading-tight">
                    {toastState.message}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {toastState.onUndo && (
                    <button
                      onClick={handleUndo}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition-colors active:scale-95"
                    >
                      Undo
                    </button>
                  )}
                  {toastState.type !== "loading" && (
                    <button
                      onClick={hideToast}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </UndoContext.Provider>
  );
}

export const useUndo = () => useContext(UndoContext);
