"use client";

import {
  faArrowLeft,
  faCircleNotch,
  faLocationDot,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import GrayBtn from "../../../../components/button/gray-btn";
import PrimaryBtn from "../../../../components/button/primary-btn";
import ScrollInput from "../../../../components/input/scroll-input";
import CheckBinModal from "../../../../components/modal/check-bin";
import ContainerModal from "../../../../components/modal/container";
import Skeleton from "../../../../components/skeleton/skeleton";
import { MaterialdataContext } from "../../../../lib/context/material-data";
import { deleteBin, getBin, getCheckBin } from "../../../../lib/gas/sic";
import {
  colArr,
  floorArr,
  rowArr,
  sisiArr,
  subbinArr,
  zonaArr,
} from "./swipeArr";

export default function page() {
  const [addForm, setAddForm] = useState(false);
  const [checkModal, setCheckModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [newLoc, setNewLoc] = useState("");
  const [binToDel, setBinToDel] = useState("");
  const [existingBin, setExistingBin] = useState(null);
  const [midData, setMidData] = useState(null);
  const { materialData } = useContext(MaterialdataContext);
  const [sameBin, setSameBin] = useState([]);
  const [loadBin, setLoadBin] = useState(true);

  useEffect(() => {
    const bintoedit = localStorage.getItem("bintoedit");
    const handleGetMaterialData = (sloc, mid) => {
      const filteredData = materialData.data.find((item) => item.mid === mid);
      setMidData({ ...filteredData, sloc });
    };
    const handleGetBin = async (sloc, mid) => {
      const res = await getBin({ sloc, mid });
      res.success && res.response.length > 0 && setExistingBin(res.response);
      res.success && res.response.length < 1 && console.log("No ");
      !res.success && console.log("Error fetching bin data");
      setLoadBin(false);
    };
    if (bintoedit && materialData.data) {
      setLoadBin(true);
      const parsedData = JSON.parse(bintoedit);
      handleGetMaterialData(parsedData.sloc, parsedData.mid);
      handleGetBin(parsedData.sloc, parsedData.mid);
    }
  }, [materialData]);

  return (
    <div className="page-container items-center bg-white lg:bg-[#E8ECF7]">
      <div className="flex flex-col h-full w-full bg-white p-0 lg:p-6 rounded-3xl max-w-4xl">
        <Topbar />
        <div className="h-full w-full rounded-t-3xl overflow-x-auto px-2 lg:px-0 pb-4 flex flex-col gap-6">
          {midData ? (
            <TopCard midData={midData} />
          ) : (
            <Skeleton height="h-42" width="w-full" className=" rounded-3xl" />
          )}
          {!loadBin ? (
            <BinCard
              existingBin={existingBin}
              setAddForm={setAddForm}
              setDeleteModal={setDeleteModal}
              setBinToDel={setBinToDel}
            />
          ) : (
            <Skeleton height="h-8" width="w-full" className=" rounded-2xl" />
          )}
        </div>
      </div>

      <AddBinForm
        midData={midData}
        addForm={addForm}
        setAddForm={setAddForm}
        newLoc={newLoc}
        setNewLoc={setNewLoc}
        checkModal={checkModal}
        setCheckModal={setCheckModal}
        setSameBin={setSameBin}
      />
      <CheckBinModal
        isOpen={checkModal}
        setIsOpen={setCheckModal}
        sameBin={sameBin}
        binData={{
          ...midData,
          bin: newLoc,
        }}
      />

      <DeleteCard
        isOpen={deleteModal}
        setIsOpen={setDeleteModal}
        binToDel={binToDel}
        midData={midData}
      />
    </div>
  );
}

function Topbar() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between pr-2 lg:px-0 mb-4 gap-4">
      <div className="flex-1 flex justify-start items-center relative w-full">
        <GrayBtn
          label={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => router.back()}
          style="bg-white"
        />
        <p className="ml-1 text-lg font-semibold">Update Bin</p>
      </div>
    </div>
  );
}

function TopCard({ midData }) {
  return (
    <div className="relative bg-[#7a6dff] p-6 rounded-3xl text-white">
      <FontAwesomeIcon
        icon={faLocationDot}
        className="text-5xl mb-4 absolute top-6 right-4 text-white/20 cursor-none"
      />
      <p className="text-sm p-1.5 px-4 font-semibold rounded-2xl bg-white text-indigo-400 w-fit mb-4">
        {midData?.sloc}
      </p>
      <p className="font-semibold">{midData?.mid}</p>
      <p className="">{midData?.desc}</p>
      <p className="">{midData?.uom}</p>
    </div>
  );
}

function BinCard({ existingBin, setAddForm, setDeleteModal, setBinToDel }) {
  return (
    <div className="grid lg:grid-cols-2 gap-3 p-0 lg:p-2 ">
      {existingBin?.map((item, i) => (
        <div
          key={i}
          className="p-4 h-fit px-6 bg-indigo-50 rounded-2xl flex items-center justify-between text-indigo-400 relative"
        >
          <p className="font-medium">{item.BIN}</p>
          <button
            onClick={() => {
              setBinToDel(item.BIN);
              setDeleteModal(true);
            }}
            className="group: absolute p-1.5 px-2.5 hover:bg-indigo-100 rounded-xl right-4 duration-150 cursor-pointer"
          >
            <FontAwesomeIcon
              icon={faTimes}
              className="text-indigo-300 text-sm group-hover:text-indigo-400 duration-150"
            />
          </button>
        </div>
      ))}
      <PrimaryBtn
        style="w-full lg:h-full bg-indigo-400 hover:bg-indigo-50 hover:outline-2 outline-indigo-200 group duration-150 mt-2 lg:mt-0"
        onClick={() => setAddForm(true)}
        label={
          <span className="a-middle gap-2 text-white group-hover:text-indigo-400 duration-150">
            <FontAwesomeIcon icon={faPlus} />
            Tambah
          </span>
        }
      />
    </div>
  );
}

function AddBinForm({
  midData,
  addForm,
  setAddForm,
  newLoc,
  setNewLoc,
  checkModal,
  setCheckModal,
  setSameBin,
}) {
  const [isLoad, setIsLoad] = useState(false);
  const [floor, setFloor] = useState("-");
  const [zona, setZona] = useState("-");
  const [sisi, setSisi] = useState("-");
  const [col, setCol] = useState("00");
  const [row, setRow] = useState("00");
  const [subBin, setSubBin] = useState("00");
  const [mergeBin, setMergeBin] = useState("");
  const [errorMsg, setErrorMsg] = useState(" ");
  const swipeRef = useRef(null);
  const swipeStartX = useRef(0);
  const [activeInputSet, setActiveInputSet] = useState("input1");

  useEffect(() => {
    if (!checkModal) {
      setFloor("-");
      setZona("-");
      setSisi("-");
      setCol("00");
      setRow("00");
      setSubBin("00");
      setActiveInputSet("input1");
      setSameBin([]);
    }
    setIsLoad(false);
    setErrorMsg("");
  }, [addForm]);

  useEffect(() => {
    setMergeBin(`${zona}${sisi}-${col}-${row}-${subBin}`);
  }, [zona, sisi, col, row, subBin]);

  useEffect(() => {
    setErrorMsg(" ");
    setNewLoc("-");
    if (activeInputSet == "input1") {
      setNewLoc(mergeBin);
    } else if (activeInputSet == "input2") {
      setNewLoc(floor);
    }
  }, [activeInputSet, mergeBin, floor]);

  const handleSwipeStart = (e) => {
    if (isLoad) return;
    swipeStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };
  const inputSets = ["input1", "input2", "input3"];
  const handleSwipeEnd = (e) => {
    if (isLoad) return;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = endX - swipeStartX.current;
    if (Math.abs(deltaX) > 50) {
      const currentIdx = inputSets.indexOf(activeInputSet);
      let nextIdx;
      if (deltaX < 0) {
        nextIdx = (currentIdx + 1) % inputSets.length;
      } else {
        nextIdx = (currentIdx - 1 + inputSets.length) % inputSets.length;
      }
      setActiveInputSet(inputSets[nextIdx]);
    }
  };

  const handleSubmitNewLoc = async (e) => {
    e.preventDefault();
    setIsLoad(true);
    const checkVal = () => {
      if (activeInputSet === "input1") {
        if (
          zona === "-" ||
          sisi === "-" ||
          col === "00" ||
          row === "00" ||
          subBin === "00"
        ) {
          return false;
        } else {
          return true;
        }
      } else if (activeInputSet === "input2") {
        if (floor === "-") {
          return false;
        } else {
          return true;
        }
      } else {
        if (newLoc.trim() === "-") {
          return false;
        } else {
          return true;
        }
      }
    };

    if (!checkVal()) {
      setIsLoad(false);
      setErrorMsg("Please complete the location input.");
      return;
    } else {
      const check = await getCheckBin({
        sloc: midData.sloc,
        bin: newLoc,
      });
      setSameBin(check.success ? check.response : null);
      setIsLoad(false);
      setCheckModal(true);
      setAddForm(false);
    }
  };
  return (
    <AnimatePresence>
      {addForm && (
        <div className="fixed w-full h-full flex justify-center items-start pt-16 top-0 right-0 px-6 bg-black/30">
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative bg-white border border-gray-200 w-full max-w-xl rounded-3xl flex flex-col gap-4 p-6 py-8 text mt-2 lg:mt-0"
          >
            <GrayBtn
              type="button"
              label={
                <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
              }
              disabled={isLoad}
              style="absolute bg-white flex-1 cursor-pointer py-3 top-4 right-3"
              onClick={(e) => {
                e.preventDefault();
                setAddForm(false);
              }}
            />
            <p className="text-center text-sm mt-4 mb-2 text-gray-400 font-light">
              swipe to change
            </p>
            <div className="w-full a-middle">
              <p className="text-indigo-500 bg-indigo-50 rounded-2xl py-1 px-5 w-fit mb-2">
                {newLoc}
              </p>
            </div>
            <div
              className="form-input relative"
              ref={swipeRef}
              onTouchStart={handleSwipeStart}
              onTouchEnd={handleSwipeEnd}
              onMouseDown={handleSwipeStart}
              onMouseUp={handleSwipeEnd}
            >
              {isLoad && (
                <div className="absolute a-middle flex-col w-full h-full bg-white z-4">
                  <FontAwesomeIcon
                    icon={faCircleNotch}
                    className="animate-spin text-indigo-400 text-4xl"
                  />
                  <p className="text-gray-500 text-sm mt-4">Checking...</p>
                </div>
              )}
              {activeInputSet === "input1" ? (
                <div className="input1 flex justify-center gap-1 items-center py-6">
                  <ScrollInput
                    key={`zona-${zona}`}
                    value={zona}
                    onChange={setZona}
                    type="text"
                    width="w-10"
                    dataArray={zonaArr}
                  />
                  <ScrollInput
                    key={`sisi-${sisi}`}
                    value={sisi}
                    onChange={setSisi}
                    type="text"
                    width="w-10"
                    dataArray={sisiArr}
                  />
                  <p className="text-xs a-midlle text-gray-300">-</p>
                  <ScrollInput
                    key={`col-${col}`}
                    value={col}
                    onChange={setCol}
                    type="number"
                    dataArray={colArr}
                  />
                  <p className="text-xs a-midlle text-gray-300">-</p>

                  <ScrollInput
                    key={`row-${row}`}
                    value={row}
                    onChange={setRow}
                    type="number"
                    dataArray={rowArr}
                  />
                  <p className="text-xs a-midlle text-gray-300">-</p>

                  <ScrollInput
                    key={`subbin-${subBin}`}
                    value={subBin}
                    onChange={setSubBin}
                    type="number"
                    dataArray={subbinArr}
                  />
                </div>
              ) : activeInputSet === "input2" ? (
                <div className="input2 flex justify-center gap-1 items-center py-6">
                  <ScrollInput
                    key={`floor-${floor}`}
                    value={floor}
                    onChange={setFloor}
                    type="text"
                    width="w-24"
                    dataArray={floorArr}
                  />
                </div>
              ) : (
                <div className="input3 flex justify-center gap-1 items-center h-44 py-6">
                  <input
                    type="text"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value.toUpperCase())}
                    className="w-48 text-2xl border-b border-gray-300 px-4 py-2 text-center focus:outline-none focus:border-indigo-400 uppercase"
                  />
                </div>
              )}
              <p className="text-center a-middle h-6 text-sm font-light text-red-500">
                {errorMsg}
              </p>
              <div className="flex items-center gap-0.5 btn-swipe mt-4">
                <div
                  onClick={() => setActiveInputSet("input1")}
                  className={`px-4 py-2 rounded-2xl flex items-center justify-center cursor-pointer ${
                    activeInputSet === "input1"
                      ? "bg-gray-100 active"
                      : "text-gray-400 disactive"
                  }`}
                >
                  <p>Rack</p>
                </div>
                <div
                  onClick={() => setActiveInputSet("input2")}
                  className={`px-3 py-2 rounded-2xl flex items-center justify-center cursor-pointer ${
                    activeInputSet === "input2"
                      ? "bg-gray-100 active"
                      : "text-gray-400  disactive"
                  }`}
                >
                  <p>Floor</p>
                </div>
                <div
                  onClick={() => setActiveInputSet("input3")}
                  className={`px-3 py-2 rounded-2xl flex items-center justify-center cursor-pointer ${
                    activeInputSet === "input3"
                      ? "bg-gray-100 active"
                      : "text-gray-400  disactive"
                  }`}
                >
                  <p>Custom </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <PrimaryBtn
                type="submit"
                label={
                  <span className="a-middle gap-2 text-white group-hover:text-indigo-400 duration-150">
                    Check
                  </span>
                }
                onClick={handleSubmitNewLoc}
                style="flex-1 bg-indigo-400 hover:bg-indigo-50 hover:outline-2 outline-indigo-200 group duration-150 lg:mt-0 cursor-pointer"
                disabled={isLoad}
              />
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}

function DeleteCard({ isOpen, setIsOpen, binToDel, midData }) {
  const [isLoad, setIsLoad] = useState(false);
  const handleDeleteBin = async (sloc, mid, bin) => {
    setIsLoad(true);
    const res = await deleteBin({ sloc, mid, bin });
    if (res.success) {
      setIsLoad(false);
      setIsOpen(false);
      window.location.reload();
    } else {
      setIsLoad(false);
      setIsOpen(false);
      alert("Failed to delete bin. Please try again.");
    }
  };
  return (
    <ContainerModal isOpen={isOpen} setIsOpen={setIsOpen} align="center">
      <div className="flex items-center justify-between pt-6 px-6">
        <p className="font-semibold">Delete Bin</p>
        <GrayBtn
          type="submit"
          style="bg-white w-10"
          onClick={() => {
            setIsOpen(false);
          }}
          disabled={isLoad}
          label={
            <FontAwesomeIcon icon={faTimes} className="text-lg text-gray-500" />
          }
        />
      </div>
      <div className="px-6 pb-6 pt-4">
        <p className="text-center">
          Yakin hapus
          <span className="text-sm px-2 py-1.5 mx-2 bg-indigo-50 text-indigo-400 rounded-2xl">
            {binToDel}
          </span>
          ?
        </p>
        <PrimaryBtn
          label={isLoad ? "Deleting..." : "Ya, Hapus"}
          style="w-full mt-8 bg-red-400 hover:bg-red-50 hover:outline-2 outline-red-200 group duration-150"
          onClick={() => handleDeleteBin(midData.sloc, midData.mid, binToDel)}
          disabled={isLoad}
        />
      </div>
    </ContainerModal>
  );
}
