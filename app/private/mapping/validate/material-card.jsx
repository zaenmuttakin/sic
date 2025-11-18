"use client";
import { MaterialdataContext } from "@/lib/context/material-data";
import { ColorContext } from "@/lib/context/topbar-color";
import filterMaterialdata from "@/lib/func/filterMaterialdata";
import { timestampToTime } from "@/lib/func/timestampToTime";
import {
  faArrowsUpDown,
  faCircleNotch,
  faMinus,
  faPencil,
  faPlus,
  faRefresh,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import GrayBtn from "../../../../components/button/gray-btn";
import PrimaryBtn from "../../../../components/button/primary-btn";
import UpdateBinModal from "../../../../components/modal/update-bin";
import Table from "../../../../components/table/table";
import { AuthContext } from "../../../../lib/context/auth";
import { ToastContext } from "../../../../lib/context/toast";
import { formatToDDMMYYYY } from "../../../../lib/func/formatToDDMMYYYY";
import { addValidate } from "../../../../lib/gas/sic";

export default function MaterialCard({
  isOpen,
  setIsOpen,
  valueToSrc,
  setValueToSrc,
  setScanQrOpen,
  autoFocus = true,
  loadtime = 500,
}) {
  const [maximize, setMaximize] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [cekvalue, setCekvalue] = useState(false);
  const [firstOpen, setFirstOpen] = useState(true);
  const [opnAddMap, setOpnAddMap] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isLgScreen, setIsLgScreen] = useState(false);
  const [selectedBin, setSelectedBin] = useState({
    // typeAction: "add /edit"
    // sloc: "",
    // mid: "",
    // uom: "",
  });
  const { materialData, filteredData, setFilteredData, isLoadMaterialData } =
    useContext(MaterialdataContext);
  const { setTopbarColor, topColors } = useContext(ColorContext);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [validateBin, setValidateBin] = useState([]);
  const { user } = useContext(AuthContext);
  const { setToast } = useContext(ToastContext);

  useEffect(() => {
    const filterValidate = Object.values(selectedStatus).filter(
      (item) => item !== null
    );
    setValidateBin(filterValidate);
  }, [selectedStatus]);
  const handleCheckboxChange = (index, type) => {
    setSelectedStatus((prev) => ({
      ...prev,
      [index]: type,
    }));
  };
  useEffect(() => {
    switch (pathname) {
      case "/private":
        maximize && isOpen && opnAddMap && setTopbarColor(topColors.onmodal2);
        maximize && isOpen && !opnAddMap && setTopbarColor(topColors.white);
        !maximize && !isOpen && !opnAddMap && setTopbarColor(topColors.default);
        !maximize && isOpen && opnAddMap && setTopbarColor(topColors.onmodal);
        !maximize && isOpen && !opnAddMap && setTopbarColor(topColors.onmodal);
        break;
      case "/private/material-data":
        maximize && isOpen && opnAddMap && setTopbarColor(topColors.onmodal2);
        maximize && isOpen && !opnAddMap && setTopbarColor(topColors.white);
        !maximize && !isOpen && !opnAddMap && setTopbarColor(topColors.default);
        !maximize && isOpen && opnAddMap && setTopbarColor(topColors.onmodal);
        !maximize && isOpen && !opnAddMap && setTopbarColor(topColors.onmodal);
        break;

      default:
        break;
    }
  }, [maximize, isOpen, opnAddMap]);

  // handle screen size
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

  // handle back button
  useEffect(() => {
    const handlePopState = (event) => {
      if (window.location.hash === "#srcmaterial") {
        // We're still in the modal's history entry, so we do nothing.
        // This is a failsafe to prevent unexpected behavior.
      } else {
        setIsOpen(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
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

      const dataFiltered = filterMaterialdata("equal", materialData.data, term);
      if (dataFiltered) {
        setTimeout(() => {
          setFilteredData(dataFiltered[0]);

          setIsLoading(false);
        }, loadtime);
      } else {
        alert("gagal");
        setIsLoading(false);
      }
    }
  };

  // handle modal open and close
  const handleOpenModal = () => {
    window.history.pushState({ srcmaterial: true }, null, "#srcmaterial");
  };

  const handleCloseModal = (bintoedit) => {
    setValueToSrc("");
    setFilteredData(null);
    setMaximize(false);
    setCekvalue(false);
    setFirstOpen(true);
    setIsOpen(false);
    setOpnAddMap(false);
    window.history.back();
    bintoedit &&
      setTimeout(() => {
        localStorage.setItem("bintoedit", JSON.stringify(bintoedit));
        router.push("/private/mapping/update-bin");
      }, 50);
  };

  useEffect(() => {
    if (isOpen) {
      valueToSrc && handleSearch();
      handleOpenModal();
      // document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
      setValueToSrc("");
      setFilteredData(null);
      setMaximize(false);
      setCekvalue(false);
      setFirstOpen(true);
      setOpnAddMap(false);
      setSelectedStatus({});
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
            zIndex: 30,
            padding: 0,
          }}
          exit={{ opacity: 0 }}
          name="backdrop"
          className="fixed justify-end items-end lg:justify-center lg:items-center w-full min-h-svh top-0 left-0 flex flex-col "
        >
          <div
            onClick={() => {
              // setIsOpen(false);
              handleCloseModal();
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
              borderRadius: "0rem",
              width: "100%",
              minHeight: "100vh",
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
            transition={{ duration: 0.2 }}
            name="modal"
            className="relative max-w-3xl bg-white rounded-3xl z-12 w-full flex flex-col justify-start"
          >
            <UpdateBinModal
              data={selectedBin}
              isOpen={opnAddMap}
              setIsOpen={setOpnAddMap}
              maximize={maximize}
              to={() => {
                handleCloseModal(selectedBin);
              }}
            />
            {/* ---------------------------------------------------- */}
            <div className="flex items-center justify-between pt-6 px-6">
              <p className="font-semibold">Material Data</p>
              <div className="flex-1 flex flex-nowrap items-center">
                <div className="text-xs w-fit ml-2 p-1 text-indigo-400 rounded-full bg-indigo-50">
                  {!isLoadMaterialData ? (
                    <span className="px-1">
                      {timestampToTime(materialData?.timestamp)}
                    </span>
                  ) : (
                    <FontAwesomeIcon
                      icon={faRefresh}
                      className="text-xs animate-spin"
                    />
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
                  // setIsOpen(false);
                  handleCloseModal();
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
                  className="flex-1 flex flex-col gap-4 min-h-24 overflow-y-auto rounded-3xl py-4 lg:pb-6 c-scrollbar px-6"
                >
                  <div className="p-6 bg-[#7A6DFF] text-white shadow-lg rounded-2xl relative">
                    <Image
                      src="/logo-icon-white.svg"
                      alt="Logo"
                      width={30}
                      height={30}
                      className="mb-4 absolute top-5 right-6 text-white/20 cursor-none opacity-[0.1]"
                    />
                    <p className="font-semibold">{filteredData.mid}</p>
                    <p>{filteredData.desc}</p>
                  </div>
                  <div className="relative">
                    {isSubmit && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute a-middle top-0 left-0 w-full h-full bg-indigo-50 z-10 rounded-xl"
                      >
                        <FontAwesomeIcon
                          icon={faCircleNotch}
                          className="text-indigo-400 animate-spin text-4xl"
                        />
                      </motion.div>
                    )}
                    <div className="flex flex-col gap-3 mt-2">
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
                      <p className="font-medium text-gray-400 w-full">
                        Validate Bin
                      </p>
                      <Table
                        header={["G002", ""]}
                        data={[
                          ...filteredData.bin.g002.map((bin, i) => {
                            return [
                              <button
                                key={`button-${i}`}
                                className="px-2 py-1 bg-indigo-50 text-[#7A6DFF] rounded-lg"
                              >
                                {bin}
                              </button>,
                              <div
                                key={`checkbox-${i}`}
                                className="flex items-start gap-4 font-light w-full justify-end"
                              >
                                <div className="a-middle text-sm gap-1.5 text-gray-500">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-indigo-400"
                                    checked={
                                      selectedStatus[`G002-${i}`]?.validate ===
                                      "valid"
                                    }
                                    onChange={() =>
                                      selectedStatus[`G002-${i}`]?.validate ===
                                      "valid"
                                        ? handleCheckboxChange(
                                            `G002-${i}`,
                                            null
                                          )
                                        : handleCheckboxChange(`G002-${i}`, {
                                            validate: "valid",
                                            sloc: "G002",
                                            mid: filteredData.mid,
                                            desc: filteredData.desc,
                                            uom: filteredData.uom,
                                            rak: "",
                                            bin: bin,
                                            date: formatToDDMMYYYY(),
                                            pic: user?.NICKNAME.toUpperCase(),
                                          })
                                    }
                                  />
                                  <span>Valid</span>
                                </div>
                                <div className="a-middle text-sm gap-1.5 text-gray-500">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-red-500/80"
                                    checked={
                                      selectedStatus[`G002-${i}`]?.validate ===
                                      "deletion"
                                    }
                                    onChange={() =>
                                      selectedStatus[`G002-${i}`]?.validate ===
                                      "deletion"
                                        ? handleCheckboxChange(
                                            `G002-${i}`,
                                            null
                                          )
                                        : handleCheckboxChange(`G002-${i}`, {
                                            validate: "deletion",
                                            sloc: "G002",
                                            mid: filteredData.mid,
                                            desc: filteredData.desc,
                                            uom: filteredData.uom,
                                            rak: "",
                                            bin: bin,
                                            date: formatToDDMMYYYY(),
                                            pic: user?.NICKNAME.toUpperCase(),
                                          })
                                    }
                                  />
                                  <span>Deletion</span>
                                </div>
                              </div>,
                            ];
                          }),
                          [
                            <button
                              onClick={() => {
                                setSelectedBin({
                                  sloc: "G002",
                                  mid: filteredData.mid,
                                });
                                setOpnAddMap(true);
                              }}
                              className="p-2 py-2 bg-gray-100 hover:bg-gray-300 text-gray-400 rounded-xl cursor-pointer duration-200"
                            >
                              {filteredData.bin.g002.length === 0 ? (
                                <p className="a-middle gap-1">
                                  <FontAwesomeIcon icon={faPlus} />
                                  <span className="text-xs">tambah</span>
                                </p>
                              ) : (
                                <p className="a-middle gap-1">
                                  <FontAwesomeIcon icon={faPencil} />
                                  <span className="text-xs">update</span>
                                </p>
                              )}
                            </button>,
                          ],
                        ]}
                      />
                      <Table
                        header={["G005", ""]}
                        data={[
                          ...filteredData.bin.g005.map((bin, i) => {
                            return [
                              <button
                                key={`button-${i}`}
                                className="px-2 py-1 bg-indigo-50 text-[#7A6DFF] rounded-lg"
                              >
                                {bin}
                              </button>,
                              <div
                                key={`checkbox-${i}`}
                                className="flex items-start gap-4 font-light w-full justify-end"
                              >
                                <div className="a-middle text-sm gap-1.5 text-gray-500">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-indigo-400"
                                    checked={
                                      selectedStatus[`G005-${i}`]?.validate ===
                                      "valid"
                                    }
                                    onChange={() =>
                                      selectedStatus[`G005-${i}`]?.validate ===
                                      "valid"
                                        ? handleCheckboxChange(
                                            `G005-${i}`,
                                            null
                                          )
                                        : handleCheckboxChange(`G005-${i}`, {
                                            validate: "valid",
                                            sloc: "G005",
                                            mid: filteredData.mid,
                                            desc: filteredData.desc,
                                            uom: filteredData.uom,
                                            rak: "",
                                            bin: bin,
                                            date: formatToDDMMYYYY(),
                                            pic: user?.NICKNAME.toUpperCase(),
                                          })
                                    }
                                  />
                                  <span>Valid</span>
                                </div>
                                <div className="a-middle text-sm gap-1.5 text-gray-500">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-red-500/80"
                                    checked={
                                      selectedStatus[`G005-${i}`]?.validate ===
                                      "deletion"
                                    }
                                    onChange={() =>
                                      selectedStatus[`G005-${i}`]?.validate ===
                                      "deletion"
                                        ? handleCheckboxChange(
                                            `G005-${i}`,
                                            null
                                          )
                                        : handleCheckboxChange(`G005-${i}`, {
                                            validate: "deletion",
                                            sloc: "G005",
                                            mid: filteredData.mid,
                                            desc: filteredData.desc,
                                            uom: filteredData.uom,
                                            rak: "",
                                            bin: bin,
                                            date: formatToDDMMYYYY(),
                                            pic: user?.NICKNAME.toUpperCase(),
                                          })
                                    }
                                  />
                                  <span>Deletion</span>
                                </div>
                              </div>,
                            ];
                          }),
                          [
                            <button
                              onClick={() => {
                                setSelectedBin({
                                  sloc: "G005",
                                  mid: filteredData.mid,
                                });
                                setOpnAddMap(true);
                              }}
                              className="p-2 py-2 bg-gray-100 hover:bg-gray-300 text-gray-400 rounded-xl cursor-pointer duration-200"
                            >
                              {filteredData.bin.g005.length === 0 ? (
                                <p className="a-middle gap-1">
                                  <FontAwesomeIcon icon={faPlus} />
                                  <span className="text-xs">tambah</span>
                                </p>
                              ) : (
                                <p className="a-middle gap-1">
                                  <FontAwesomeIcon icon={faPencil} />
                                  <span className="text-xs">update</span>
                                </p>
                              )}
                            </button>,
                          ],
                        ]}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-6">
                    <PrimaryBtn
                      type="submit"
                      label={
                        <span className="a-middle gap-2 text-white group-hover:text-indigo-400 duration-150">
                          Validate
                        </span>
                      }
                      onClick={async (e) => {
                        e.preventDefault();
                        setIsSubmit(true);
                        const res = await addValidate(validateBin);
                        if (res.success) {
                          setIsOpen(false);
                          setIsSubmit(false);

                          setToast({
                            open: true,
                            text: "Success validated",
                            autoHide: true,
                          });
                        } else {
                          setIsOpen(false);
                          setIsSubmit(false);
                          setToast({
                            open: true,
                            text: "Something went wrong",
                            type: "error",
                            autoHide: true,
                          });
                        }
                      }}
                      style="flex-1 bg-indigo-400 hover:bg-indigo-50 hover:outline-2 outline-indigo-200 group duration-150 lg:mt-0 cursor-pointer"
                      disabled={isSubmit || validateBin.length === 0}
                    />
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
