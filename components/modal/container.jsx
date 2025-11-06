"use client";
import { AnimatePresence, motion } from "motion/react";
export default function ContainerModal({
  isOpen,
  setIsOpen,
  maximize = false,
  setMaximize = () => {},
  align = "center",
  maxWidth = "max-w-3xl",
  overlayToClose = false,
  children,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 0,
            zIndex: 10,
            padding: "1rem",
          }}
          animate={{
            opacity: 1,
            zIndex: maximize ? 30 : 10,
            padding: maximize ? 0 : "1rem",
          }}
          exit={{ opacity: 0 }}
          name="backdrop"
          className={`
            fixed items-center w-full h-full top-0 left-0 flex flex-col 
            ${align === "center" && "justify-center "}
            ${align === "top" && "justify-start "}
            ${align === "end" && "justify-end "}
            `}
        >
          <div
            className="absolute h-full z-10 w-full bg-black/30 top-0 left-0"
            onClick={() => overlayToClose && setIsOpen(false)}
          />
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.2,
              y: align == "top" ? -120 : 60,
              borderRadius: "5rem",
              width: "100%",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              borderRadius: maximize ? "0rem" : "1.5rem",
              width: "100%",
            }}
            exit={{
              opacity: 0,
              scale: 0.2,
              y: align == "top" ? -120 : 60,
              borderRadius: "1.5rem",
              width: "100%",
            }}
            name="modal"
            className={
              maxWidth +
              " relative bg-white rounded-3xl z-12 w-full max-h-[90vh] flex flex-col justify-start overflow-y-auto"
            }
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
