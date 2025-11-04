"use client";
import {
  faArrowLeft,
  faChevronRight,
  faMagnifyingGlass,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import GrayBtn from "../../../components/button/gray-btn";
import SeacrhForm from "../../../components/input/search-form";
import SrcMaterial from "../../../components/modal/src-material";
import DataTable from "../../../components/table/data-table";
import { MaterialdataContext } from "../../../lib/context/material-data";
import { ColorContext } from "../../../lib/context/topbar-color";
import { timestampToDateTime } from "../../../lib/func/timestampToDateTime";
import { timestampToTime } from "../../../lib/func/timestampToTime";

export default function Page() {
  const { materialData, isLoadMaterialData } = useContext(MaterialdataContext);
  const [data, setData] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFormOpen, setSearchFormOpen] = useState(false);
  const { setTopbarColor, topColors } = useContext(ColorContext);
  const [valueToSrc, setValueToSrc] = useState("");
  const [valueToSrcMaterial, setValueToSrcMaterial] = useState("");

  const router = useRouter();
  useEffect(() => {
    setData(materialData.data);
  }, [materialData]);
  useEffect(() => {
    setTopbarColor(topColors.white);
    localStorage.removeItem("bintoedit");
  }, []);
  useEffect(() => {
    searchOpen && setTopbarColor("#b3b3b3");
    !searchOpen && setTopbarColor(topColors.white);
  }, [searchOpen]);
  return (
    <div className="page-container items-center bg-white lg:bg-[#E8ECF7]">
      <div className="flex flex-col h-[96vh] w-full bg-white p-0 lg:p-6 rounded-3xl max-w-4xl">
        {/* topbar */}
        <div className="flex items-center justify-between pr-2 lg:px-0 mb-4 gap-4">
          <div className="flex-1 flex justify-start items-center relative w-full">
            <GrayBtn
              label={<FontAwesomeIcon icon={faArrowLeft} />}
              onClick={() => router.back()}
              style="bg-white"
            />
            <p className="ml-1 text-lg font-semibold">Material data </p>
            <div className="a-middle gap-2 ml-2">
              <span className="hidden lg:block text-xs font-medium bg-indigo-50 text-indigo-400 px-2 py-1 rounded-2xl">
                {timestampToDateTime(materialData.timestamp)}
              </span>
              <span className="block lg:hidden text-xs font-medium bg-indigo-50 text-indigo-400 px-2 py-1 rounded-2xl">
                {timestampToTime(materialData.timestamp)}
              </span>
            </div>
            {isLoadMaterialData && (
              <div className="w-6 h-6 a-middle aspect-square text-xs rounded-full a-middle bg-indigo-50 text-indigo-400 ml-2">
                <FontAwesomeIcon icon={faRefresh} className="animate-spin" />
              </div>
            )}
            {searchFormOpen && (
              <AnimatePresence>
                <motion.div
                  initial={{ x: 20, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: 20, opacity: 0, scale: 0.8 }}
                  className="absolute w-full pl-2 lg:pl-0"
                >
                  <SeacrhForm
                    isOpen={searchFormOpen}
                    setIsOpen={setSearchFormOpen}
                    valueToSrc={valueToSrcMaterial}
                    setValueToSrc={setValueToSrcMaterial}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          <button
            className={`${
              searchFormOpen
                ? "bg-gray-100 order-last border-1 border-gray-50"
                : "bg-indigo-50 order-last border-1 border-indigo-50"
            } group a-middle px-4 py-2.5 h-full font-medium rounded-2xl cursor-pointer`}
            onClick={() => {
              setSearchFormOpen(!searchFormOpen);
              setValueToSrcMaterial("");
            }}
          >
            <p>
              {searchFormOpen ? (
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-gray-500"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="text-indigo-400"
                />
              )}
            </p>
          </button>
        </div>

        {/* content */}
        <div className="flex-1 w-full rounded-t-3xl overflow-hidden px-2 lg:px-0">
          {data && (
            <DataTable
              itemsPerPage={25}
              header={[
                <p className="pt-5">MID</p>,
                "Deskripsi",
                "Uom",
                <p className="text-gray-300">|</p>,
                <div className="relative">
                  <p className="absolute -top-5 -left-2  pl-1.5 pr-12  bg-indigo-100 text-indigo-400 rounded-2xl  text-xs">
                    Actual Stock
                  </p>
                  <p>G002</p>
                </div>,
                "G005",
                <p className="text-gray-300">|</p>,
                <div className="relative">
                  <p className="absolute -top-5 -left-2  pl-1.5 pr-12  bg-red-100 text-red-400 rounded-2xl  text-xs">
                    SAP Stock
                  </p>
                  <p>G003</p>
                </div>,
                "G004",
              ]} // Exclude mid from display if needed
              data={data.map((item) => [
                item.mid,
                item.desc,
                item.uom,
                "",
                item.actualStock.g002,
                item.actualStock.g005,
                "",
                item.sapStock.g003,
                item.sapStock.g004,
              ])}
              searchTerm={valueToSrcMaterial}
              func={{
                onClickRow: (e) => {
                  setSearchOpen(true);
                  setValueToSrc(e);
                },
                setIdToEdit: (id) => console.log("Edit ID:", id),
              }}
            />
          )}
        </div>
      </div>

      <SrcMaterial
        isOpen={searchOpen}
        setIsOpen={setSearchOpen}
        valueToSrc={valueToSrc}
        setValueToSrc={setValueToSrc}
        hiddenSrcBtn={true}
        loadtime={300}
      />
    </div>
  );
}
