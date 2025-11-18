"use client";

import {
  faArrowLeft,
  faChevronUp,
  faCircleNotch,
  faMagnifyingGlass,
  faQrcode,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import GrayBtn from "../../../../components/button/gray-btn";
import PrimaryBtn from "../../../../components/button/primary-btn";
import Inputz from "../../../../components/input/input";
import ScrollInput from "../../../../components/input/scroll-input";
import ScanQr from "../../../../components/modal/scan-qr";
import { MaterialdataContext } from "../../../../lib/context/material-data";
import filterMaterialdata from "../../../../lib/func/filterMaterialdata";
import { checkBinList } from "../../../../lib/gas/sic";
import {
  colArr,
  floorArr,
  rowArr,
  sisiArr,
  zonaArr,
} from "../update-bin/swipeArr";
import CheckBinCard from "./check-bin-card";
import MaterialCard from "./material-card";

export default function page() {
  const inputRef = useRef(null);
  const [valueToSrc, setValueToSrc] = useState("");
  const [cekvalue, setCekvalue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scanQrOpen, setScanQrOpen] = useState(false);
  const [checkBinOpen, setCheckBinOpen] = useState(false);
  const [checkBinCardOpen, setCheckBinCardOpen] = useState(false);
  const [checkBinResult, setCheckBinResult] = useState();

  const { materialData, filteredData, setFilteredData, isLoadMaterialData } =
    useContext(MaterialdataContext);
  const router = useRouter();
  const [newLoc, setNewLoc] = useState("-");

  const handleSearch = async () => {
    !materialData && alert("Not any data");
    !valueToSrc && setCekvalue(true);
    if (materialData && valueToSrc) {
      setCekvalue(false);
      setIsLoading(true);
      // setFirstOpen(false);
      setSearchOpen(true);
      inputRef.current && inputRef.current.blur();
      const term = valueToSrc;

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
  return (
    <div className="flex flex-col max-w-4xl mx-auto bg-gradient-to-b from-white from-1% to-transparent">
      <div className="top-0 p-4 py-2 lg:p-6 sticky flex flex-col gap-4 z-2 bg-gradient-to-b from-white from-90% via-50% to-transparent">
        <Topbar />
      </div>
      <div className="px-4 lg:px-6 pb-8 bg-white min-h-[calc(100vh-5rem)]">
        <div className="rounded-3xl border border-indigo-200  p-6 py- mb-4">
          <div className="text-sm">
            <p className="font-medium mb-2">How to : </p>
            <ul className="text-gray-700 pl-5 list-disc">
              <li>Cari dengan MID atau scan QR</li>
              <li>Pastikan lokasi aktual & data bin sesuai</li>
              <li>Jika sesuai pilih valid</li>
              <li>Jika tidak sesuai, update bin kemudian pilih valid. Atau,</li>
              <li>Jika bin sudah diisi MID lain, pilih deletion</li>
              <li>Check Bin, Pastikan semua mid dalam bin sudah valid.</li>
            </ul>

            <p className="py-2 pb-8">
              Lihat MID sudah tervalidasi{" "}
              <span
                onClick={() =>
                  router.push("/private/mapping/validate/already-validated")
                }
                className="text-indigo-400 underline cursor-pointer"
              >
                disini
              </span>
            </p>
          </div>
          <form className="flex items-center gap-2">
            <div className="relative flex-1" disabled={isLoading}>
              <Inputz
                type="number"
                ref={inputRef}
                placeholder="Cari dengan MID"
                value={valueToSrc}
                style={cekvalue && "cekval"}
                onChange={(e) => setValueToSrc(e.target.value)}
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
              style="bg-indigo-50"
              label={
                <FontAwesomeIcon icon={faQrcode} className="text-indigo-500" />
              }
              onClick={(e) => {
                e.preventDefault();
                // setIsOpen(false);
                setScanQrOpen(true);
              }}
              disabled={isLoading}
            />
          </form>
        </div>
        {checkBinOpen && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className=""
            >
              <BinForm
                newLoc={newLoc}
                setNewLoc={setNewLoc}
                checkModal={checkBinCardOpen}
                setCheckModal={setCheckBinCardOpen}
                setCheckBinResult={setCheckBinResult}
              />
            </motion.div>
          </AnimatePresence>
        )}
        <div
          onClick={() => setCheckBinOpen(!checkBinOpen)}
          className="text-center text-gray-400 mt-8 cursor-pointer a-middle gap-2 text-sm"
        >
          <p className="">{checkBinOpen ? "Hide" : "Check Bin"}</p>
          <FontAwesomeIcon
            icon={faChevronUp}
            className={checkBinOpen ? "" : "rotate-180"}
          />
        </div>
      </div>
      <MaterialCard
        isOpen={searchOpen}
        setIsOpen={setSearchOpen}
        valueToSrc={valueToSrc}
        setValueToSrc={setValueToSrc}
        setScanQrOpen={setScanQrOpen}
      />
      <CheckBinCard
        isOpen={checkBinCardOpen}
        setIsOpen={setCheckBinCardOpen}
        newLoc={newLoc}
        checkBinResult={checkBinResult}
        valueToSrc={valueToSrc}
        setValueToSrc={setValueToSrc}
        setScanQrOpen={setScanQrOpen}
      />
      <ScanQr
        isOpen={scanQrOpen}
        setIsOpen={setScanQrOpen}
        setValue={setValueToSrc}
        setOpenSrcMaterial={setSearchOpen}
      />
    </div>
  );
}

function Topbar() {
  const router = useRouter();
  return (
    <div
      className={`topbar flex items-center justify-between px-0 py-2 gap-2 `}
    >
      <div className="flex-1 flex justify-start items-center relative w-full gap-1">
        <GrayBtn
          label={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => router.back()}
          style="bg-transparent"
        />
        <p className=" text-lg font-semibold">Validasi Mapping</p>
      </div>
    </div>
  );
}

function BinForm({
  midData,
  addForm,
  setAddForm,
  checkModal,
  setCheckModal,
  newLoc,
  setNewLoc,
  setCheckBinResult,
  // checkModal,
  // setCheckModal,
  // setSameBin,
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
  const router = useRouter();
  function resetdataBin() {
    setFloor("-");
    setZona("-");
    setSisi("-");
    setCol("00");
    setRow("00");
    setSubBin("00");
    setActiveInputSet("input1");
    setIsLoad(false);
    setErrorMsg("");
    setNewLoc("-");
  }

  useEffect(() => {
    !checkModal && resetdataBin();
  }, [checkModal]);

  useEffect(() => {
    resetdataBin();
    setIsLoad(false);
  }, [addForm]);

  useEffect(() => {
    setMergeBin(`${zona}${sisi}-${col}-${row}`);
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
        if (zona === "-" || sisi === "-" || col === "00" || row === "00") {
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
      const check = await checkBinList({
        bin: newLoc,
      });
      if (check.success) {
        setIsLoad(false);
        setCheckModal(true);
        setCheckBinResult(check.response);
        console.log(check.response);
      }
    }
  };
  return (
    <form className="relative bg-white border border-gray-200 w-full rounded-3xl flex flex-col gap-4 p-6 py-8 text mt-2 lg:mt-0">
      <div className="w-full a-middle">
        <p className="text-indigo-500 bg-indigo-50 rounded-2xl py-1 px-5 w-fit">
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
          <div className="input1 flex justify-center gap-1 items-center py-1">
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
          </div>
        ) : activeInputSet === "input2" ? (
          <div className="input2 flex justify-center gap-1 items-center py-1">
            <ScrollInput
              key={`floor-${floor}`}
              value={floor}
              onChange={setFloor}
              type="text"
              width="w-38"
              dataArray={floorArr}
            />
          </div>
        ) : (
          <div className="input3 flex justify-center gap-1 items-center h-34 py-1">
            <input
              type="text"
              value={newLoc}
              onChange={(e) => setNewLoc(e.target.value.toUpperCase())}
              className="w-48 text-2xl border-b border-gray-300 px-4 py-2 text-center focus:outline-none focus:border-indigo-400 uppercase"
            />
          </div>
        )}
        <p className="text-center a-middle h-4 text-sm font-light text-red-500">
          {errorMsg}
        </p>
        <div className="flex items-center gap-0.5 btn-swipe mt-2">
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
            <p>Zone</p>
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
      <div className="flex flex-col gap-2 mt-2">
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
    </form>
  );
}
