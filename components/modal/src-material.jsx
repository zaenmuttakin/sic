"use client";
import React, { useEffect, useState } from "react";
import GrayBtn from "../button/gray-btn";
import Inputz from "../input/input";
import PrimaryBtn from "../button/primary-btn";
import {
  faArrowsUpDown,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import Table from "../table/table";
import Image from "next/image";
import { getMonitor } from "../../lib/gas/report-spp-central";

export default function SrcMaterial({ isOpen }) {
  const [maximize, setMaximize] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [valueToScr, setValueToSrc] = useState("");
  const [data, setData] = useState(null);
  const [updateAt, setUpdateAt] = useState("");

  const handleSearch = async () => {
    setIsLoading(true);
    const getData = await getMonitor({ by: "mid", value: Number(valueToScr) });

    if (getData.success) {
      getData.response.data.length > 0
        ? setData(getData.response.data[0])
        : setData(null);
      getData.response.stockUpdated &&
        setUpdateAt(getData.response.stockUpdated);
      setIsLoading(false);
    } else {
      alert("gagal");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
      setValueToSrc("");
      setData(null);
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
            paddingBottom: "5.5rem",
            zIndex: 10,
          }}
          animate={{
            opacity: 1,
            padding: maximize ? "0rem" : "1rem",
            paddingBottom: maximize ? "0rem" : "5.5rem",
            zIndex: maximize ? 30 : 10,
          }}
          exit={{ opacity: 0 }}
          transition={{
            ease: "easeInOut",
            exit: { duration: 0.1, delay: 0.2 },
          }}
          name="backdrop"
          className="fixed w-full min-h-svh bg-black/30 top-0 left-0 flex items-end"
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
              maxHeight: "80svh",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: 0,
              borderRadius: maximize ? "0rem" : "1.5rem",
              width: "100%",
              minHeight: maximize ? "100svh" : "30vh",
              maxHeight: maximize ? "100svh" : "80vh",
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
              minHeight: { duration: 0.5, ease: "easeInOut" },
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
              <Inputz
                type="number"
                placeholder="Cari dengan MID"
                value={valueToScr}
                onChange={(e) => setValueToSrc(e.target.value)}
                autoFocus={!isLoading}
              />
              <PrimaryBtn
                type="submit"
                name="maximize"
                label={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                onClick={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
              />
            </form>
            {isLoading && (
              <p className="w-full text-center py-6 text-sm text-gray-400">
                Loading...
              </p>
            )}
            {!data && !isLoading && (
              <p className="w-full text-center py-6 text-sm text-gray-400">
                Masukan mid untuk melihat data stock
              </p>
            )}
            {data && !isLoading && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    height: "100%",
                  }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.1,
                    height: { delay: 0.3 },
                  }}
                  className="flex-1 flex flex-col gap-6 min-h-24 overflow-y-auto rounded-xl pt-4"
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
                    <p className="font-semibold">{data.mid}</p>
                    <p>{data.desc}</p>
                    <p>{data.uom}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-medium text-gray-400">Draft</p>
                    <Table
                      header={["Ewo", "Espar/WO", "Reservasi"]}
                      data={[[data.drf.ewo, data.drf.espar, data.drf.res]]}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-medium text-gray-400">Actual Stock</p>
                    <Table
                      header={["G002", "G005"]}
                      data={[[data.actualStock.g002, data.actualStock.g005]]}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-medium text-gray-400">
                      SAP Stock
                      <span className="text-xs px-2 py-0.5 bg-indigo-50 text-[#7A6DFF] rounded-full ml-2 font-normal">
                        {updateAt}
                      </span>
                    </p>
                    <Table
                      header={["G002", "G003", "G004", "G005", "Total"]}
                      data={[
                        [
                          data.sapStock.g002,
                          data.sapStock.g003,
                          data.sapStock.g004,
                          data.sapStock.g005,
                          data.sapStock.total,
                        ],
                      ]}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-medium text-gray-400 w-full">Bin</p>
                    <Table header={["G002"]} data={[data.bin.g002]} />
                    <Table header={["G005"]} data={[data.bin.g005]} />
                  </div>
                  {/* <div className="py-4 flex justify-end">
                    <a
                      href=""
                      className="flex items-center gap-2 text-gray-500"
                    >
                      <p>Material Movement</p>
                      <FontAwesomeIcon icon={faArrowRightLong} className="" />
                    </a>
                  </div> */}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
