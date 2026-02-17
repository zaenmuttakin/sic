"use client";
import GrayBtn from "@/components/button/gray-btn";
import UpdateBinModal from "@/components/modal/update-bin";
import { AuthContext } from "@/lib/context/auth";
import { MaterialdataContext } from "@/lib/context/material-data";
import { ToastContext } from "@/lib/context/toast";
import { ColorContext } from "@/lib/context/topbar-color";
import filterMaterialdata from "@/lib/utils/filterMaterialdata";
import { faCheckCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

export default function CheckBinCard({
  isOpen,
  setIsOpen,
  newLoc,
  checkBinResult,
  valueToSrc,
  setValueToSrc,
  setSearchOpen,
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
  const [currentPage, setCurrentPage] = useState(1);

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
        window.location.reload();
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
              <p className="font-semibold">{newLoc}</p>

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
            <div className="p-6 pt-2 overflow-auto 2">
              <Content
                itemsPerPage={15}
                params={{
                  setIsOpen,
                  setSearchOpen,
                  setValueToSrc,
                  data: checkBinResult,
                  newLoc,
                  currentPage,
                  setCurrentPage,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Content({ params, itemsPerPage = 25 }) {
  if (!params.data || params.data.length === 0) return null;
  const filteredData = params.data;
  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (params.currentPage - 1) * itemsPerPage,
    params.currentPage * itemsPerPage
  );

  return (
    <>
      <div className="flex flex-col pb-4 min-h-[calc(100vh-11rem)]">
        {filteredData?.length === 0 && (
          <p className="text-gray-500 text-sm p-24 text-center">
            No data found
          </p>
        )}
        {filteredData?.length != 0 &&
          paginatedData.map((value, index) => (
            <div
              key={index}
              onClick={() => {
                params.setIsOpen(false);
                params.setValueToSrc(value?.MID);
                params.setSearchOpen(true);
              }}
              className={`group relative grid grid-cols-1 lg:grid-cols-2 items-start lg:items-center gap-2 border-t border-gray-200 bg-white p-4 cursor-pointer hover:bg-gray-50 `}
            >
              {value?.VALID && (
                <div className="absolute a-middle text-xs top-4 right-0 border border-indigo-300 text-indigo-400 rounded-3xl px-1.5 pr-2 py-1">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mr-1 text-sm"
                  />
                  valid
                </div>
              )}

              <div className="flex gap-3 justify-start items-center w-full">
                <div className="flex flex-col flex-1">
                  <div className="flex gap-1 items-center">
                    <p
                      name="mid"
                      className="font-semibold text-sm mr-1 text-gray-700"
                    >
                      {value?.MID}
                    </p>
                    <p
                      name="sloc"
                      className={`flex flex-nowrap text-nowrap gap-2 text-xs rounded-bl-xl rounded-sm rounded-r-xl rounded-l-sm px-3 py-1 w-fit ${value?.SLOC == "G002"
                          ? "bg-indigo-50 text-indigo-500"
                          : "bg-red-50 text-red-500"
                        }`}
                    >
                      {value?.SLOC}
                    </p>
                    <p
                      name="bin"
                      className={`flex flex-nowrap text-nowrap gap-2 text-xs rounded-bl-xl rounded-sm rounded-r-xl rounded-l-sm px-3 py-1 w-fit ${value?.SLOC == "G002"
                          ? "bg-indigo-50 text-indigo-500"
                          : "bg-red-50 text-red-500"
                        }`}
                    >
                      {value?.BIN}
                    </p>
                  </div>
                  <p
                    name="desc"
                    className="text-sm text-gray-700 line-clamp-1 pt-1.5"
                  >
                    {value?.DESKRIPSI}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>
      <Pagination
        setCurrentPage={params.setCurrentPage}
        currentPage={params.currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        filteredData={filteredData}
      />
    </>
  );
}

function Pagination({
  setCurrentPage,
  currentPage,
  totalPages,
  itemsPerPage,
  filteredData,
  setIsScrollingUp,
}) {
  const scrollToTop = () => {
    // setIsScrollingUp(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <div className="px-4 lg:px-4 pt-2 flex justify-between items-center ">
      <div className="text-sm text-gray-500 line-clamp-1">
        <span className="font-medium">
          {(currentPage - 1) * itemsPerPage + 1}
        </span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(currentPage * itemsPerPage, filteredData?.length)}
        </span>{" "}
        of <span className="font-medium">{filteredData?.length}</span>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setCurrentPage((p) => Math.max(1, p - 1));
            scrollToTop();
          }}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => {
            setCurrentPage((p) => Math.min(totalPages, p + 1));
            scrollToTop();
          }}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-4 py-2 text-sm font-medium text-indigo-500 bg-indigo-50 rounded-xl hover:bg-indigo-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
