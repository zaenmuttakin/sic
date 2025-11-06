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
import GrayBtn from "../../../components/button/gray-btn";
import SeacrhForm from "../../../components/input/search-form";

export default function Page() {
  return (
    <div className="page-container items-center bg-white lg:bg-[#E8ECF7]">
      <div className="flex flex-col h-[96vh] w-full bg-white p-0 lg:p-6 rounded-3xl max-w-4xl">
        <Topbar />
      </div>
    </div>
  );
}

function Topbar() {
  const router = useRouter();
  const [searchFormOpen, setSearchFormOpen] = useState(false);
  const [valueToSrc, setValueToSrc] = useState("");
  return (
    <div className="flex items-center justify-between pr-2 lg:px-0 mb-4 gap-4">
      <div className="flex-1 flex justify-start items-center relative w-full">
        <GrayBtn
          label={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => router.back()}
          style="bg-white"
        />
        <p className="ml-1 text-lg font-semibold">Stock Opname </p>

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
                valueToSrc={valueToSrc}
                setValueToSrc={setValueToSrc}
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
          setValueToSrc("");
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
