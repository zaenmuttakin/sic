"use client";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { useContext } from "react";
import { ToastContext } from "../../lib/context/toast";
import GrayBtn from "../button/gray-btn";

export default function Toast() {
  const { toastData, closeToast } = useContext(ToastContext);
  return (
    <AnimatePresence>
      {toastData.open && (
        <div className="fixed justify-start items-center p-4 lg:p-6 flex flex-col left-1/2 transform -translate-x-1/2 w-full z-50">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.2,
              y: -100,
              widths: "10rem",
              borderRadius: "5rem",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              borderRadius: "1.5rem",
            }}
            exit={{
              opacity: 0,
              scale: 0.2,
              y: -100,
              borderRadius: "1.5rem",
            }}
            name="modal"
            className="relative max-w-md bg-white border border-gray-100 drop-shadow-2xl drop-shadow-black/10 rounded-3xl z-12 w-full flex flex-col justify-start"
          >
            <div className="flex items-center justify-between py-6 px-6">
              <div
                className={`w-1.5 min-h-9 h-full max-h-20 rounded mr-4 ${
                  toastData.type == "error"
                    ? "bg-red-400/90"
                    : toastData.type == "warning"
                    ? "bg-yellow-400"
                    : "bg-indigo-400/90"
                }`}
              />
              <div className="flex-1 text-gray-600">{toastData.text}</div>
              <GrayBtn
                type="submit"
                style="bg-white w-10"
                onClick={() => closeToast()}
                label={
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="text-lg text-gray-500"
                  />
                }
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
