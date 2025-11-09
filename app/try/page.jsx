"use client";
import {
  faArrowLeft,
  faChevronRight,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GrayBtn from "../../components/button/gray-btn";
import SeacrhForm from "../../components/input/search-form";

export default function page() {
  const [viewMode, setViewMode] = useState("grid");

  return (
    <div className="flex flex-col gap-2 max-w-3xl mx-auto bg-gradient-to-b from-white from-1% to-transparent">
      <div className="top-0 p-4 sticky flex flex-col gap-4 z-2 bg-gradient-to-b from-white from-90% via-50% to-transparent">
        <Topbar />
      </div>
      <div className="px-4 pb-8 bg-white">
        <Content params={{ viewMode }} />
      </div>
    </div>
  );
}

function Content({ params }) {
  return (
    <div className="flex flex-col h-full pb-10">
      {Array.from({ length: 20 }).map((_, index) => (
        <div
          key={index}
          className={`relative grid grid-cols-1 lg:grid-cols-2 items-start lg:items-center gap-2 border-t border-gray-200 bg-white p-4 px-5 `}
        >
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 aspect-square a-middle rounded-2xl bg-white/60  ">
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-gray-300 text-sm"
            />
          </div>
          <div className="flex gap-3 justify-start items-center w-full">
            <div className="flex flex-col flex-1">
              <div className="flex gap-1 items-center">
                <p name="mid" className="font-semibold text-sm mr-2">
                  15000133
                </p>
                <p
                  name="uom"
                  className="text-xs bg-gray-100 text-gray-500 rounded-bl-xl rounded-r-xl rounded-l-sm  px-3 py-1 font-semibold"
                >
                  PCS
                </p>
                <div
                  name="stock"
                  className="bg-indigo-50 text-indigo-500 flex flex-nowrap text-nowrap gap-2 text-xs rounded-bl-xl rounded-sm rounded-r-xl rounded-l-sm px-3 py-1 w-fit"
                >
                  <p>
                    <span className="font-semibold">G002 :</span> 100
                  </p>
                  <span className="opacity-20">|</span>
                  <p>
                    <span className="font-semibold">G005 :</span> 1500
                  </p>
                </div>
              </div>
              <p
                name="desc"
                className="text-sm text-gray-700 line-clamp-1 pt-1.5"
              >
                CAT Kansai Paint KF 38 MEDIUM GREY 1KG
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Topbar() {
  const router = useRouter();
  const [searchFormOpen, setSearchFormOpen] = useState(false);
  const [valueToSrcMaterial, setValueToSrcMaterial] = useState("");
  return (
    <div className="flex items-center justify-between lg:px-0 gap-4">
      <div className="flex-1 flex justify-start items-center relative w-full">
        <GrayBtn
          label={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => router.back()}
          style="bg-transparent"
        />
        <p className=" text-lg font-semibold">Material data </p>
        {/* <div className="a-middle gap-2 ml-2">
              <span className="hidden lg:block text-xs font-medium bg-indigo-50 text-indigo-400 px-2 py-1 rounded-2xl">
                {timestampToDateTime(materialData.timestamp)}
              </span>
              <span className="block lg:hidden text-xs font-medium bg-indigo-50 text-indigo-400 px-2 py-1 rounded-2xl">
                {timestampToTime(materialData.timestamp)}
              </span>
            </div> */}
        {/* {isLoadMaterialData && (
              <div className="w-6 h-6 a-middle aspect-square text-xs rounded-full a-middle bg-indigo-50 text-indigo-400 ml-2">
                <FontAwesomeIcon icon={faRefresh} className="animate-spin" />
              </div>
            )} */}
        {searchFormOpen && (
          <AnimatePresence>
            <motion.div
              initial={{ x: 20, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 20, opacity: 0, scale: 0.8 }}
              className="absolute w-full pl-1 lg:pl-0"
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
            <FontAwesomeIcon icon={faChevronRight} className="text-gray-500" />
          ) : (
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-indigo-400"
            />
          )}
        </p>
      </button>
    </div>
  );
}
