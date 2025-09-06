"use client";
import React, { useState } from "react";
import GrayBtn from "../button/gray-btn";
import Inputz from "../input/input";
import PrimaryBtn from "../button/primary-btn";
import {
  faArrowsUpDown,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { delay } from "motion";
import Table from "../table/table";

export default function SrcMaterial({ isOpen }) {
  const [oo, setOo] = useState(false);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            ease: "easeInOut",
            exit: { duration: 0.2, delay: 0.2 },
          }}
          className="fixed w-full min-h-screen bg-black/30 top-0 left-0 z-10 pb-20 p-4 flex items-end"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 80, x: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 80, x: 10 }}
            transition={{ delay: 0.1, duration: 0.1, ease: "easeInOut" }}
            className="h-full p-6 bg-white rounded-3xl w-full flex flex-col justify-center gap-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">Search Material</p>
              <GrayBtn
                type="submit"
                label={
                  <FontAwesomeIcon
                    icon={faArrowsUpDown}
                    className="rotate-45 text-gray-500"
                  />
                }
              />
            </div>
            <form className="flex gap-3 mt-4">
              <Inputz type="number" placeholder="Cari dengan MID" />
              <PrimaryBtn
                type="submit"
                label={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                onClick={(e) => {
                  e.preventDefault();
                  setOo(!oo);
                  // router.push("/private"); // Uncomment if router is available
                }}
              />
            </form>
            {!oo && (
              <p className="w-full text-center py-6 text-sm text-gray-400">
                Masukan mid untuk melihat data stock
              </p>
            )}
            {oo && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-col gap-6 min-h-24 max-h-[55vh] overflow-y-auto rounded-xl pt-4 pb-6"
                >
                  <div className="">
                    <p className="font-medium">19000374</p>
                    <p className="">BALL VALVE SS FLANGE 3"</p>
                    <p className="">PCS</p>
                  </div>
                  <div className="">
                    <p className="mb-2 font-medium text-gray-400">Draft</p>
                    <Table
                      header={["Ewo", "Espar/WO", "Reservasi"]}
                      data={[
                        [10, 0, 5],
                        [10, 0, 5],
                      ]}
                    />
                  </div>
                  <div className="">
                    <p className="mb-2 font-medium text-gray-400">
                      Actual Stock
                    </p>
                    <Table header={["G002", "G005"]} data={[[102, 0]]} />
                  </div>
                  <div className="">
                    <p className="mb-2 font-medium text-gray-400">SAP Stock</p>
                    <Table
                      header={["G002", "G003", "G004", "G005", "Total"]}
                      data={[[102, 0, 5, 0, 107]]}
                    />
                  </div>
                  <div className="">
                    <p className="mb-2 font-medium text-gray-400">Bin</p>
                    <Table header={["G002"]} data={[[102]]} />
                    <Table header={["G005"]} data={[[102]]} />
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
