"use client";
import {
  faArrowLeft,
  faLocationDot,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import GrayBtn from "../../../../components/button/gray-btn";
import PrimaryBtn from "../../../../components/button/primary-btn";
import Inputz from "../../../../components/input/input";
import SeacrhForm from "../../../../components/input/search-form";
import CheckBinModal from "../../../../components/modal/check-bin";

export function UpdateBin() {
  const [searchFormOpen, setSearchFormOpen] = useState(false);
  const [addForm, setAddForm] = useState(false);
  const [checkModal, setCheckModal] = useState(false);
  const [valueToSrcMaterial, setValueToSrcMaterial] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [newRak, setNewRak] = useState("");
  const [newBin, setNewBin] = useState("");
  const [cekval, setCekval] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  useEffect(() => {
    try {
      const dataParam = searchParams.get("data");
      if (dataParam) {
        const decodedData = decodeURIComponent(dataParam);
        const parsedData = JSON.parse(decodedData);
        setExtractedData(parsedData);
      } else {
        setError("No data parameter found in URL");
      }
    } catch (err) {
      setError("Error parsing data: " + err.message);
    }
  }, [searchParams]);

  useEffect(() => {
    setNewRak("");
    setNewBin("");
    setCekval(false);
  }, [addForm]);
  return (
    <div className="page-container items-center bg-white lg:bg-[#E8ECF7]">
      <div className="flex flex-col h-full w-full bg-white p-0 lg:p-6 rounded-3xl max-w-4xl">
        {/* topbar */}
        <div className="flex items-center justify-between pr-2 lg:px-0 mb-6 gap-4">
          <div className="flex-1 flex justify-start items-center relative w-full">
            <GrayBtn
              label={<FontAwesomeIcon icon={faArrowLeft} />}
              onClick={() => router.back()}
              style="bg-white"
            />
            <p className="ml-1 text-lg font-semibold">Update Bin</p>

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
          {/* <button
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
          </button> */}
        </div>

        {/* content */}
        <div className="h-full w-full rounded-t-3xl overflow-x-auto px-2 lg:px-0 pb-4 flex flex-col gap-8">
          {extractedData && (
            <div className="relative bg-[#7a6dff] p-6 rounded-3xl text-white">
              {/* className="mb-4 absolute top-6 right-6 text-white/20 cursor-none opacity-[0.1]" */}
              <FontAwesomeIcon
                icon={faLocationDot}
                className="text-5xl mb-4 absolute top-6 right-4 text-white/20 cursor-none"
              />
              <p className="text-sm p-1.5 px-4 font-semibold rounded-2xl bg-white text-indigo-400 w-fit mb-4">
                {extractedData.sloc}
              </p>
              <p className="font-semibold">{extractedData.mid}</p>
              <p className="">{extractedData.desc}</p>
              <p className="">{extractedData.uom}</p>
            </div>
          )}
          <div className="grid lg:grid-cols-2 gap-4 p-0 lg:p-2 ">
            {extractedData &&
              extractedData.bin.map((item, i) => (
                <p
                  key={i}
                  className="p-4 h-fit px-6 bg-indigo-50 rounded-2xl flex items-center justify-between text-indigo-400 relative"
                >
                  <span className="font-medium">{item}</span>
                  <span className="group: absolute p-1.5 px-2.5 hover:bg-indigo-100 rounded-xl right-4 duration-150 cursor-pointer">
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="text-indigo-300 text-sm group-hover:text-indigo-400 duration-150"
                    />
                  </span>
                </p>
              ))}

            {addForm && (
              <AnimatePresence>
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className=" border border-gray-200  rounded-3xl flex flex-col gap-4 p-6 py-8 text mt-2 lg:mt-0"
                >
                  <div className="flex gap-4">
                    <div className="">
                      <p className="mb-2 text-gray-500">Rak</p>
                      <Inputz
                        type="text"
                        autoFocus={true}
                        value={newRak}
                        style={`${cekval && !newRak && "cekval"} uppercase`}
                        onChange={(e) => setNewRak(e.target.value)}
                      />
                    </div>
                    <div className="">
                      <p className="mb-2 text-gray-500">Bin</p>
                      <Inputz
                        type="text"
                        value={newBin}
                        style={`${cekval && !newBin && "cekval"} uppercase`}
                        onChange={(e) => setNewBin(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mt-2">
                    <PrimaryBtn
                      type="submit"
                      label={
                        <span className="a-middle gap-2 text-white group-hover:text-indigo-400 duration-150">
                          Check
                        </span>
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setCekval(true);
                        newRak && newBin && setCheckModal(true);
                      }}
                      style="flex-1 bg-indigo-400 hover:bg-indigo-50 hover:outline-2 outline-indigo-200 group duration-150 mt-4 lg:mt-0 cursor-pointer"
                    />
                    <GrayBtn
                      label={<span className="a-middle">Cancel</span>}
                      style="flex-1 cursor-pointer"
                      onClick={() => setAddForm(false)}
                    />
                  </div>
                </motion.form>
              </AnimatePresence>
            )}
            {!addForm && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <PrimaryBtn
                    onClick={() => setAddForm(true)}
                    label={
                      <span className="a-middle gap-2 text-white group-hover:text-indigo-400 duration-150">
                        <FontAwesomeIcon icon={faPlus} />
                        Tambah
                      </span>
                    }
                    style="w-full lg:h-full bg-indigo-400 hover:bg-indigo-50 hover:outline-2 outline-indigo-200 group duration-150 mt-4 lg:mt-0"
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* modal */}
        <CheckBinModal
          isOpen={checkModal}
          setIsOpen={setCheckModal}
          binData={{
            sloc: extractedData ? extractedData.sloc : "",
            mid: extractedData ? extractedData.mid : "",
            rak: newRak ? newRak : "",
            bin: newBin ? newBin : "",
            uom: extractedData ? extractedData.uom : "",
            desc: extractedData ? extractedData.desc : "",
          }}
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <UpdateBin />
    </Suspense>
  );
}
