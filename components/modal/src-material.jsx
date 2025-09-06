"use client";
import React, { useEffect, useState } from "react";
import GrayBtn from "../button/gray-btn";
import Inputz from "../input/input";
import PrimaryBtn from "../button/primary-btn";
import {
  faArrowsUpDown,
  faBoxesPacking,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { delay } from "motion";
import Table from "../table/table";
import Image from "next/image";

export default function SrcMaterial({ isOpen }) {
  const [maximize, setMaximize] = useState(false);
  const [oo, setOo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 0,
            padding: "1rem",
            paddingBottom: "5rem",
            zIndex: 10,
          }}
          animate={{
            opacity: 1,
            padding: maximize ? "0rem" : "1rem",
            paddingBottom: maximize ? "0rem" : "5rem",
            zIndex: maximize ? 30 : 10,
          }}
          exit={{ opacity: 0 }}
          transition={{
            ease: "easeInOut",
            exit: { duration: 0.1, delay: 0.2 },
          }}
          name="backdrop"
          className="fixed w-full min-h-screen bg-black/30 top-0 left-0 flex items-end"
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 80,
              x: 10,
              borderRadius: "1.5rem",
              width: "100%",
              minHeight: "30vh",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: 0,
              borderRadius: maximize ? "0rem" : "1.5rem",
              width: "100%",
              minHeight: maximize ? "100svh" : "30vh",
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 80,
              x: 10,
              borderRadius: "1.5rem",
              width: "100%",
              minHeight: "30vh",
            }}
            transition={{
              delay: 0.1,
              duration: 0.2,
              ease: "easeInOut",
              minHeight: { duration: 0.5 },
            }}
            name="modal"
            className="h-full p-6 bg-white rounded-3xl w-full flex flex-col justify-start gap-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">Search Material</p>
              <GrayBtn
                type="submit"
                onClick={() => setMaximize(!maximize)}
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
                name="maximize"
                label={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                onClick={(e) => {
                  e.preventDefault();
                  setOo(!oo);
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
                  initial={{ opacity: 0, y: 10, maxHeight: "55vh" }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    maxHeight: maximize ? "75vh" : "55vh",
                  }}
                  exit={{ opacity: 0, y: 10, maxHeight: "55vh" }}
                  className=" flex flex-col gap-6 min-h-24 overflow-y-auto rounded-xl pt-4 pb-6"
                >
                  <div className="p-6 bg-[#7A6DFF] text-white shadow-lg rounded-2xl relative">
                    <Image
                      src="/logo-icon-white.svg"
                      alt="Logo"
                      width={35}
                      height={35}
                      className="mb-4 absolute top-6 right-6 text-white/20 cursor-none opacity-[0.1]"
                    />
                    {/* <FontAwesomeIcon
                      icon={faBoxesPacking}
                      className="text-5xl mb-4 absolute top-6 right-6 text-white/20 cursor-none"
                    /> */}
                    <p className="font-semibold">19000374</p>
                    <p>BALL VALVE SS FLANGE 3"</p>
                    <p>PCS</p>
                  </div>
                  <div className="">
                    <p className="mb-2 font-medium text-gray-400">Draft</p>
                    <Table
                      header={["Ewo", "Espar/WO", "Reservasi"]}
                      data={[[10, 0, 5]]}
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
