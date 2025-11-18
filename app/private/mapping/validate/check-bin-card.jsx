"use client";
import GrayBtn from "@/components/button/gray-btn";
import UpdateBinModal from "@/components/modal/update-bin";
import { AuthContext } from "@/lib/context/auth";
import { MaterialdataContext } from "@/lib/context/material-data";
import { ToastContext } from "@/lib/context/toast";
import { ColorContext } from "@/lib/context/topbar-color";
import filterMaterialdata from "@/lib/func/filterMaterialdata";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import Table from "../../../../components/table/table";

export default function CheckBinCard({
  isOpen,
  setIsOpen,
  newLoc,
  checkBinResult,
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
              <Table
                header={["Sloc", "MID", "Description", "Bin"]}
                data={checkBinResult.map((item) => [
                  item.SLOC,
                  item.MID,
                  item.DESKRIPSI,
                  item.BIN,
                ])}
                footer={true}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
