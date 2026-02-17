import { AnimatePresence, motion } from "motion/react";
import GrayBtn from "../button/gray-btn";
import PrimaryBtn from "../button/primary-btn";

export default function UpdateBinModal({
  data,
  isOpen,
  setIsOpen,
  maximize,
  to = () => { },
}) {

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${maximize && "p-6 rounded-none"
            } absolute rounded-3xl h-full z-11 w-full bg-black/30 top-0 left-0 a-middle`}
        >
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="bg-white rounded-3xl z-12 w-full max-w-lg flex flex-col justify-start p-6 pt-8"
          >
            <p className="text-center font-medium mb-8 a-middle">
              <span className="text-xs text-center py-1 px-3 rounded-2xl text-indigo-400 bg-indigo-50 mr-2">
                {data?.sloc}
              </span>
              <span>Update Bin {data?.mid} ?</span>
            </p>
            <div className="gap-2 a-middle">
              <GrayBtn
                label="Batal"
                style="flex-1"
                onClick={() => setIsOpen(false)}
              />
              <PrimaryBtn
                label="Ya, Lanjutkan"
                style="flex-1 text-nowrap"
                onClick={to}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
