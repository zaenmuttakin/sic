"use client";
import {
  faArrowsUpDown,
  faChevronRight,
  faCircleNotch,
  faMagnifyingGlass,
  faMinus,
  faQrcode,
  faRefresh,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { MaterialdataContext } from "../../lib/context/material-data";
import { ColorContext } from "../../lib/context/topbar-color";
import filterMaterialdata from "../../lib/func/filterMaterialdata";
import { formatDateToDDMMMYYMMHH } from "../../lib/func/isoString-toDateTime";
import { timestampToTime } from "../../lib/func/timestampToTime";
import GrayBtn from "../button/gray-btn";
import PrimaryBtn from "../button/primary-btn";
import Inputz from "../input/input";
import Table from "../table/table";

export default function SrcMaterial({
  isOpen,
  setIsOpen,
  valueToSrc,
  setValueToSrc,
}) {
  const [maximize, setMaximize] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cekvalue, setCekvalue] = useState(false);
  const [firstOpen, setFirstOpen] = useState(true);
  const inputRef = useRef(null);
  const router = useRouter();
  const [isLgScreen, setIsLgScreen] = useState(false);
  const { materialData, filteredData, setFilteredData, isLoadMaterialData } =
    useContext(MaterialdataContext);
  const { setTopbarColor, topColors } = useContext(ColorContext);

  useEffect(() => {
    maximize && isOpen && setTopbarColor(topColors.white);
    !maximize && isOpen && setTopbarColor(topColors.onmodal);
  }, [maximize]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkScreenSize = () => {
        setIsLgScreen(window.innerWidth >= 1024);
      };
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
      return () => window.removeEventListener("resize", checkScreenSize);
    }
  }, []);

  const handleSearch = async () => {
    !materialData && alert("Not any data");
    !valueToSrc && setCekvalue(true);
    if (materialData && valueToSrc) {
      setCekvalue(false);
      setIsLoading(true);
      setFirstOpen(false);
      inputRef.current && inputRef.current.blur();
      const term = valueToSrc;
      console.log(materialData);

      const dataFiltered = filterMaterialdata("equal", materialData.data, term);
      if (dataFiltered) {
        setTimeout(() => {
          setFilteredData(dataFiltered[0]);
          setIsLoading(false);
        }, 500);
      } else {
        alert("gagal");
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      valueToSrc && handleSearch();
      // document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
      setValueToSrc("");
      setFilteredData(null);
      setMaximize(false);
      setCekvalue(false);
      setFirstOpen(true);
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
          className="fixed justify-end items-end lg:justify-center lg:items-center w-full min-h-svh top-0 left-0 flex flex-col "
        >
          <div
            onClick={() => {
              setIsOpen(false);
              setFilteredData(null);
            }}
            className="absolute h-full z-10 w-full bg-black/30 top-0 left-0"
          ></div>

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.2,
              y: 60,
              x: 120,
              widths: "10rem",
              height: "10rem",
              borderRadius: "5rem",
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
              minHeight: maximize
                ? "100svh"
                : isLgScreen
                ? "95vh"
                : filteredData
                ? "60vh"
                : "15rem",
            }}
            exit={{
              opacity: 0,
              scale: 0.2,
              y: 60,
              x: 120,
              borderRadius: "1.5rem",
              width: "100%",
              minHeight: "30vh",
            }}
            name="modal"
            className="max-w-3xl bg-white rounded-3xl z-12 w-full flex flex-col justify-start"
          >
            <div className="flex items-center justify-between pt-6 px-6">
              <p className="font-semibold">Search Material</p>
              <div className="flex-1 flex flex-nowrap items-center">
                <div className="text-xs w-fit ml-2 p-1 text-indigo-400 rounded-full bg-indigo-50">
                  <FontAwesomeIcon
                    icon={faRefresh}
                    className={`${
                      isLoadMaterialData ? "animate-spin" : " pr-0.5"
                    } text-xs`}
                  />
                  {!isLoadMaterialData && (
                    <span className="pr-0.5">
                      {timestampToTime(materialData?.timestamp)}
                    </span>
                  )}
                </div>
              </div>
              <div className="lg:hidden">
                <GrayBtn
                  type="submit"
                  onClick={() => setMaximize(!maximize)}
                  style="bg-white w-10 mr-2"
                  label={
                    maximize ? (
                      <FontAwesomeIcon
                        icon={faMinus}
                        className=" text-gray-500 "
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faArrowsUpDown}
                        className="rotate-45 text-gray-500 "
                      />
                    )
                  }
                />
              </div>
              <GrayBtn
                type="submit"
                style="bg-white w-10"
                onClick={() => {
                  setIsOpen(false);
                  setFilteredData(null);
                }}
                label={
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="text-lg text-gray-500"
                  />
                }
              />
            </div>
            <form className="flex gap-3 justify-between px-6 py-4">
              <div className="relative flex-1" disabled={isLoading}>
                <Inputz
                  type="number"
                  ref={inputRef}
                  placeholder="Cari dengan MID"
                  value={valueToSrc}
                  style={cekvalue && "cekval"}
                  onChange={(e) => setValueToSrc(e.target.value)}
                  autoFocus={!isLoading}
                  disabled={isLoading}
                />
                {valueToSrc && !isLoading && (
                  <FontAwesomeIcon
                    icon={faTimes}
                    onClick={() => {
                      setValueToSrc("");
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm cursor-pointer bg-white p-2 hover:text-gray-400"
                  />
                )}
              </div>
              <PrimaryBtn
                type="submit"
                name="maximize"
                label={
                  isLoading ? (
                    <FontAwesomeIcon
                      icon={faCircleNotch}
                      className="animate-spin"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  )
                }
                onClick={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                disabled={isLoading}
              />
              <GrayBtn
                type="submit"
                name="maximize"
                label={
                  <FontAwesomeIcon icon={faQrcode} className="text-gray-500" />
                }
                onClick={(e) => {
                  e.preventDefault();
                }}
                disabled={isLoading}
              />
            </form>
            {filteredData && !isLoading && (
              <div className="lg:flex gap-3 hidden px-6 pb-4">
                <p className="text-sm text-gray-400 font-medium">
                  Search result
                </p>
                <p className="text-sm text-gray-200 cursor-pointer">|</p>
                <p
                  onClick={() => {
                    setFilteredData(null);
                    setFirstOpen(true);
                    setValueToSrc("");
                  }}
                  className="text-sm text-gray-400 hover:text-[#7A6DFF] cursor-pointer"
                >
                  clear
                </p>
              </div>
            )}
            {isLoading && (
              <p className="lg:min-h-svh w-full text-center py-6 lg:py-16 text-sm text-gray-400">
                Loading...
              </p>
            )}
            {!firstOpen && !filteredData && !isLoading && (
              <p className="lg:min-h-svh w-full text-center py-6  lg:py-16 text-sm text-gray-400">
                Data tidak ditemukan
              </p>
            )}
            {firstOpen && !filteredData && !isLoading && (
              <p className="lg:min-h-svh w-full text-center py-6 lg:py-16 text-sm text-gray-400">
                Masukan mid untuk melihat data stock
              </p>
            )}
            {filteredData && !isLoading && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex-1 flex flex-col gap-4 min-h-24 overflow-y-auto rounded-3xl py-4 lg:py-0 lg:pb-6 c-scrollbar px-6"
                >
                  <div className="p-6 bg-[#7A6DFF] text-white shadow-lg rounded-2xl relative">
                    <Image
                      src="/logo-icon-white.svg"
                      alt="Logo"
                      width={35}
                      height={35}
                      className="mb-4 absolute top-6 right-6 text-white/20 cursor-none opacity-[0.1]"
                    />
                    <p className="font-semibold">{filteredData.mid}</p>
                    <p>{filteredData.desc}</p>
                    <p>{filteredData.uom}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-medium text-gray-400">Draft</p>
                    <Table
                      header={["Ewo", "Espar/WO", "Reservasi"]}
                      data={[
                        [
                          filteredData.drf.ewo,
                          filteredData.drf.espar,
                          filteredData.drf.res,
                        ],
                      ]}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-medium text-gray-400">Actual Stock</p>
                    <Table
                      header={["G002", "G005"]}
                      data={[
                        [
                          filteredData.actualStock.g002,
                          filteredData.actualStock.g005,
                        ],
                      ]}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-medium text-gray-400">
                      SAP Stock
                      <span className="text-xs px-2 py-0.5 bg-indigo-50 text-[#7A6DFF] rounded-full ml-2 font-normal">
                        {formatDateToDDMMMYYMMHH(materialData.stockUpdated)}
                      </span>
                    </p>
                    <Table
                      header={["G002", "G003", "G004", "G005", "Total"]}
                      data={[
                        [
                          filteredData.sapStock.g002,
                          filteredData.sapStock.g003,
                          filteredData.sapStock.g004,
                          filteredData.sapStock.g005,
                          filteredData.sapStock.total,
                        ],
                      ]}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-medium text-gray-400 w-full">Bin</p>
                    <Table
                      header={["G002"]}
                      data={[
                        [
                          <div className="flex flex-wrap gap-2">
                            {filteredData.bin.g002.map((bin, i) => (
                              <p
                                key={i}
                                className="px-2 py-1 bg-indigo-50 text-[#7A6DFF] rounded-lg"
                              >
                                {bin}
                              </p>
                            ))}
                          </div>,
                        ],
                      ]}
                    />
                    <Table
                      header={["G005"]}
                      data={[
                        [
                          <div className="flex flex-wrap gap-2">
                            {filteredData.bin.g005.map((bin, i) => (
                              <p
                                key={i}
                                className="px-2 py-1 bg-indigo-50 text-[#7A6DFF] rounded-lg"
                              >
                                {bin}
                              </p>
                            ))}
                          </div>,
                        ],
                      ]}
                    />
                  </div>
                  <hr className="border-gray-200" />
                  <div className="py-2 flex flex-col gap-2 w-full items-end justify-end text-sm lg:text-md">
                    <p
                      onClick={() => router.push("/not-available")}
                      className="text-gray-400 hover:text-[#7A6DFF] cursor-pointer"
                    >
                      Material Movement
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-xs ml-2"
                      />
                    </p>
                    <p
                      onClick={() => router.push("/not-available")}
                      className="text-gray-400 hover:text-[#7A6DFF] cursor-pointer"
                    >
                      Outbound History
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-xs ml-2"
                      />
                    </p>
                    <p
                      onClick={() => router.push("/not-available")}
                      className="text-gray-400 hover:text-[#7A6DFF] cursor-pointer"
                    >
                      Inbound History
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-xs ml-2"
                      />
                    </p>
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
