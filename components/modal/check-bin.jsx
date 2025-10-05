import { faRefresh, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../lib/context/auth";
import { MaterialdataContext } from "../../lib/context/material-data";
import { formatDateIsoToDate } from "../../lib/func/isoString-toDate";
import { getAddBin, getCheckBin } from "../../lib/gas/sic";
import GrayBtn from "../button/gray-btn";
import PrimaryBtn from "../button/primary-btn";
import Table from "../table/table";

export default function CheckBinModal({
  isOpen,
  setIsOpen,
  binData,
  extractedData,
  setExtractedData,
}) {
  const [maximize, setMaximize] = useState(false);
  const [sameBin, setSameBin] = useState(null);
  const [isLoad, setIsLoad] = useState(false);
  const { materialData } = useContext(MaterialdataContext);
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const handleGetStock = (sloc, mid) => {
    if (!materialData) return null;
    const srcMid = materialData.data.find((item) => item.mid == mid);
    let stock = null;
    sloc == "G002" && (stock = srcMid?.actualStock.g002);
    sloc == "G005" && (stock = srcMid?.actualStock.g005);
    return stock;
  };

  const handleCheckBin = async () => {
    setIsLoad(true);
    const check = await getCheckBin({ sloc: binData.sloc, bin: binData.bin });
    setSameBin(check.success ? check.response : null);
    setIsLoad(false);
    console.log("materialData");
    console.log(materialData.data.filter((item) => item.mid == binData.mid));
  };

  useEffect(() => {
    setSameBin(null);
    console.log(binData);

    isOpen && handleCheckBin();
  }, [isOpen]);
  return (
    <ContainerModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      maximize={maximize}
      setMaximize={setMaximize}
    >
      {/* --------------top---------------- */}
      <div className="flex items-center justify-between pt-6 px-6">
        <p className="font-semibold">Check Bin</p>
        {isLoad && (
          <div className="flex-1 flex flex-nowrap items-center">
            <div className="text-xs w-fit ml-2 p-1 text-indigo-400 rounded-full bg-indigo-50">
              <FontAwesomeIcon
                icon={faRefresh}
                className="text-xs animate-spin"
              />
            </div>
          </div>
        )}
        <GrayBtn
          type="submit"
          style="bg-white w-10"
          onClick={() => {
            setIsOpen(false);
          }}
          label={
            <FontAwesomeIcon icon={faTimes} className="text-lg text-gray-500" />
          }
        />
      </div>

      {isLoad ? (
        <div className="p-10 text-center">
          <p className="text-gray-500 text-">Loading...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div className="px-6 py-4 flex flex-col">
            <p className="text-gray-500 text-sm">
              <span className="text-gray-600 font-semibold mr-2 uppercase">
                {binData.sloc} \ {binData.rak} \ {binData.bin}
              </span>
              <br />
              {sameBin?.length > 0 ? (
                <span>
                  Bin sudah terisi, cek data berikut sebelum melanjutkan proses.
                </span>
              ) : (
                <span>
                  Bin belum terisi, bisa digunakan. Pastikan data sudah sesuai.
                </span>
              )}
            </p>
          </div>
          {sameBin?.length > 0 && (
            <div className="px-6">
              <div className="relative max-h-[30vh] border border-gray-200 rounded-2xl overflow-auto c-scrollbar">
                <div className="absolute w-5 h-5 right-0 bg-gray-100" />
                <Table
                  header={["MID", "Desc", "Qty", "Validasi", "PIC"]}
                  data={
                    !sameBin
                      ? [[]]
                      : sameBin.map((item) => [
                          item.MID,
                          item.DESKRIPSI,
                          handleGetStock(binData.sloc, item.MID) || 0,
                          formatDateIsoToDate(item.Validasi),
                          item.PIC || "-",
                        ])
                  }
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
      {/* --------------button------------- */}
      <div className="flex flex-col lg:flex-row gap-4 p-6">
        <PrimaryBtn
          label={
            <span className="a-middle gap-2 text-white group-hover:text-indigo-400 duration-150">
              Tambahkan
            </span>
          }
          onClick={async () => {
            const add = await getAddBin({
              sloc: binData.sloc,
              mid: binData.mid,
              desc: binData.desc,
              uom: binData.uom,
              rak: binData.rak.toUpperCase(),
              bin: binData.bin.toUpperCase(),
              pic: user?.NAME,
            });

            add && console.log(add);
            add && setExtractedData((extractedData.bin = ["xx", "xx"]));
            add && setIsOpen(false);
            add && router.back();
          }}
          style="flex-1 bg-indigo-400 hover:bg-indigo-50 hover:outline-2 outline-indigo-200 group duration-150 cursor-pointer lg:order-last"
          disabled={isLoad}
        />
        <PrimaryBtn
          label={
            <span className="a-middle gap-2 text-white group-hover:text-indigo-400 duration-150">
              Replace
            </span>
          }
          onClick={() => setCheckModal(true)}
          style="flex-1 bg-indigo-400 hover:bg-indigo-50 hover:outline-2 outline-indigo-200 group duration-150 cursor-pointer"
          disabled={sameBin?.length == 1 ? false : isLoad || true}
        />
        <GrayBtn
          label={<span className="a-middle">Cancel</span>}
          style="flex-1 cursor-pointer lg:order-first"
          onClick={() => setIsOpen(false)}
        />
      </div>
    </ContainerModal>
  );
}

function ContainerModal({
  isOpen,
  setIsOpen,
  maximize,
  setMaximize,
  children,
}) {
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
            zIndex: maximize ? 30 : 10,
            padding: maximize ? 0 : "1rem",
          }}
          exit={{ opacity: 0 }}
          name="backdrop"
          className="fixed justify-center items-center w-full min-h-svh top-0 left-0 flex flex-col"
        >
          <div className="absolute h-full z-10 w-full bg-black/30 top-0 left-0" />
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.2,
              y: 60,
              x: 120,
              borderRadius: "5rem",
              width: "100%",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: 0,
              borderRadius: maximize ? "0rem" : "1.5rem",
              width: "100%",
            }}
            exit={{
              opacity: 0,
              scale: 0.2,
              y: 60,
              x: 120,
              borderRadius: "1.5rem",
              width: "100%",
            }}
            name="modal"
            className="relative max-w-3xl bg-white rounded-3xl z-12 w-full flex flex-col justify-start"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
