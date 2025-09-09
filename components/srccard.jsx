"use client";
import {
  faArrowsUpDown,
  faChevronRight,
  faCircleNotch,
  faMagnifyingGlass,
  faMinus,
  faQrcode,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { MaterialdataContext } from "../lib/context/material-data";
import { ColorContext } from "../lib/context/topbar-color";
import filterMaterialdata from "../lib/func/filterMaterialdata";
import { formatDateToDDMMMYYMMHH } from "../lib/func/isoString-toDateTime";
import GrayBtn from "./button/gray-btn";
import PrimaryBtn from "./button/primary-btn";
import Inputz from "./input/input";
import Table from "./table/table";

export default function SrcCard({ isOpen, setIsOpen }) {
  const [maximize, setMaximize] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [valueToSrc, setValueToSrc] = useState("");
  const [cekvalue, setCekvalue] = useState(false);
  const [updateAt, setUpdateAt] = useState("");
  const [firstOpen, setFirstOpen] = useState(true);
  const inputRef = useRef(null);
  const router = useRouter();
  const { materialData, filteredData, setFilteredData } =
    useContext(MaterialdataContext);
  const { setTopbarColor, topColors } = useContext(ColorContext);

  useEffect(() => {
    maximize && isOpen && setTopbarColor(topColors.white);
    !maximize && isOpen && setTopbarColor(topColors.onmodal);
  }, [maximize]);

  const handleSearch = async () => {
    !materialData && alert("Not any data");
    !valueToSrc && setCekvalue(true);
    if (materialData && valueToSrc) {
      setCekvalue(false);
      setIsLoading(true);
      setFirstOpen(false);
      inputRef.current && inputRef.current.blur();
      const term = valueToSrc.toLowerCase().trim();
      console.log(materialData);

      const dataFiltered = filterMaterialdata("equal", materialData.data, term);
      if (dataFiltered) {
        setTimeout(() => {
          setFilteredData(dataFiltered[0]);
          setUpdateAt(materialData.stockUpdated);
          setIsLoading(false);
        }, 1000);
      } else {
        alert("gagal");
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
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
    <div className="relative max-h-[30rem] overflow-none p-6 bg-white rounded-3xl w-full flex flex-col justify-start gap-4">
      {isOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="absolute rounded-3xl h-full w-full bg-white left-0 bottom-0 z-3 a-middle"
          >
            <p className="text-gray-400">
              <FontAwesomeIcon
                icon={faArrowsUpDown}
                className="rotate-45 mr-2"
              />{" "}
              Maximize
            </p>
          </motion.div>
        </AnimatePresence>
      )}
      <div className="flex items-center justify-between">
        <p className="text-md hidden lg:block lg:text-lg font-bold mb-4">
          Search Material
        </p>
        <GrayBtn
          type="submit"
          onClick={() => setIsOpen(true)}
          style="bg-white w-10 mr-2"
          label={
            maximize ? (
              <FontAwesomeIcon icon={faMinus} className=" text-gray-500 " />
            ) : (
              <FontAwesomeIcon
                icon={faArrowsUpDown}
                className="rotate-45 text-gray-500 "
              />
            )
          }
        />
      </div>
      <form className="flex gap-3 justify-between">
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
              onClick={() => setValueToSrc("")}
              className="absolute right-4 z-2 top-1/2 -translate-y-1/2 text-gray-300 text-sm cursor-pointer bg-white p-2 hover:text-gray-400"
            />
          )}
        </div>
        <PrimaryBtn
          type="submit"
          name="maximize"
          label={
            isLoading ? (
              <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
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
          label={<FontAwesomeIcon icon={faQrcode} className="text-gray-500" />}
          onClick={(e) => {
            e.preventDefault();
          }}
          disabled={isLoading}
        />
      </form>
      {filteredData && !isLoading && (
        <div className="flex gap-3">
          <p className="text-sm text-gray-400 font-medium">Search result</p>
          <p className="text-sm text-gray-200 cursor-pointer">|</p>
          <p
            onClick={() => {
              setFilteredData("");
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
        <p className="min-h-[18rem] w-full a-middle py-12 text-gray-400">
          Loading...
        </p>
      )}
      {!firstOpen && !filteredData && !isLoading && (
        <p className="min-h-[18rem] w-full a-middle py-12 text-gray-400">
          Data tidak ditemukan
        </p>
      )}
      {firstOpen && !filteredData && !isLoading && (
        <p className="min-h-[18rem] w-full a-middle text-gray-400">
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
              height: "100%",
            }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.3,
              delay: 0.1,
              height: { delay: 0.3 },
            }}
            className="flex-1 flex flex-col gap-6 min-h-24 overflow-y-auto rounded-xl c-scrollbar pr-2"
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
              <p className="font-medium text-gray-400">
                Actual Stock
                <span className="text-xs px-2 py-0.5 bg-indigo-50 text-[#7A6DFF] rounded-full ml-2 font-normal">
                  G005 belum update
                </span>
              </p>
              <Table
                header={["G002"]}
                data={[[filteredData.actualStock.g002]]}
              />
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium text-gray-400">
                SAP Stock
                <span className="text-xs px-2 py-0.5 bg-indigo-50 text-[#7A6DFF] rounded-full ml-2 font-normal">
                  {formatDateToDDMMMYYMMHH(updateAt)}
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
            <div className="py-2 flex flex-col gap-2 w-full items-end justify-end text-sm">
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
    </div>
  );
}
