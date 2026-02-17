import {
  faCircleNotch,
  faCodeCommit,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { AuthContext } from "../../lib/context/auth";
import { MaterialdataContext } from "../../lib/context/material-data";
import { formatDateIsoToDate } from "../../lib/utils/isoString-toDate";
import { deleteBin, getAddBin } from "../../lib/gas/sic";
import GrayBtn from "../button/gray-btn";
import PrimaryBtn from "../button/primary-btn";
import Table from "../table/table";
import { addBinSpBase, deleteBinSpBase } from "@/app/api/bin/action";
import { ToastContext } from "@/lib/context/toast";

export default function CheckBinModal({
  isOpen,
  setIsOpen,
  binData,
  extractedData,
  setExtractedData,
  sameBin,
}) {
  const [maximize, setMaximize] = useState(false);
  const [isLoad, setIsLoad] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [replaceLabel, setReplaceLabel] = useState("Replace");
  const { materialData } = useContext(MaterialdataContext);
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { setToast, closeToast } = useContext(ToastContext);


  const handleGetStock = (sloc, mid) => {
    if (!materialData) return null;
    const srcMid = materialData.data.find((item) => item.mid == mid);
    let stock = null;
    sloc == "G002" && (stock = srcMid?.actualStock.g002);
    sloc == "G005" && (stock = srcMid?.actualStock.g005);
    return stock;
  };

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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        {isLoad && (
          <div className="absolute w-full h-full a-middle bg-white z-30">
            <p className="text-gray-500 text-">Loading...</p>
          </div>
        )}
        <div className="px-6 py-4 flex flex-col">
          <div className="text-gray-500 text-sm">
            <p className="text-gray-600 font-semibold mr-2 mb-4 uppercase">
              {binData.sloc}
              <FontAwesomeIcon
                icon={faCodeCommit}
                className="mx-2 text-md text-gray-500"
              />
              <span className="text-sm px-3 py-1 bg-indigo-50 text-indigo-400 rounded-2xl">
                {binData.bin}
              </span>
            </p>
            {sameBin?.length > 0 ? (
              <span>
                Bin sudah terisi, cek data berikut sebelum melanjutkan proses.
              </span>
            ) : (
              <span>
                Bin belum terisi, bisa digunakan. Pastikan data sudah sesuai.
              </span>
            )}
          </div>
        </div>
        {sameBin?.length > 0 && (
          <div className="px-6">
            <div className="relative max-h-[45vh] border border-gray-200 rounded-2xl overflow-auto c-scrollbar">
              <div className="absolute w-5 h-5 right-0 bg-gray-100" />
              <Table
                header={["MID", "Desc", "Qty", "Validasi", "PIC"]}
                data={
                  !sameBin
                    ? [[]]
                    : sameBin.map((item) => [
                      item.mid,
                      item.desc,
                      handleGetStock(binData.sloc, item.mid) || 0,
                      formatDateIsoToDate(item.valid_at),
                      item.pic || "-",
                    ])
                }
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* --------------button------------- */}
      <div className="flex flex-col lg:flex-row gap-4 p-6">
        <PrimaryBtn
          label={
            <span className="a-middle gap-2 text-white group-hover:text-indigo-400 duration-150">
              {isSubmit && (
                <FontAwesomeIcon
                  icon={faCircleNotch}
                  className="animate-spin"
                />
              )}
              Tambahkan
            </span>
          }
          onClick={async () => {
            setIsSubmit(true);
            const add = await addBinSpBase(
              binData.sloc,
              {
                bin: binData.bin.toUpperCase(),
                mid: binData.mid,
                desc: binData.desc,
                uom: binData.uom,
                valid_at: new Date(),
                pic: user?.NICKNAME.toUpperCase(),
              });
            add && setIsSubmit(false);
            add && setIsOpen(false);
            add && window.location.reload();
          }}
          style="flex-1 bg-indigo-400 hover:bg-indigo-50 hover:outline-2 outline-indigo-200 group duration-150 cursor-pointer lg:order-last"
          disabled={isLoad || isSubmit}
        />
        <PrimaryBtn
          label={
            <span className="a-middle gap-2 text-white group-hover:text-indigo-400 duration-150">
              {replaceLabel}
            </span>
          }
          onClick={async () => {
            setIsLoad(true);
            setReplaceLabel("Replacing...");
            const del = await deleteBinSpBase(binData.sloc, sameBin[0].id);
            if (del) {
              const add = await addBinSpBase(binData.sloc, {
                bin: binData.bin.toUpperCase(),
                mid: binData.mid,
                desc: binData.desc,
                uom: binData.uom,
                valid_at: new Date(),
                pic: user?.NICKNAME.toUpperCase(),
              });
              if (add) {
                setIsLoad(false);
                setIsOpen(false);
                window.location.reload();
              } else {
                alert("Gagal menambahkan bin baru. Silakan coba lagi.");
                setIsLoad(false);
                setReplaceLabel("Replace");
              }
            } else {
              alert("Gagal menghapus bin lama. Silakan coba lagi.");
              setIsLoad(false);
              setReplaceLabel("Replace");
            }
          }}
          style="flex-1 bg-indigo-400 hover:bg-indigo-50 hover:outline-2 outline-indigo-200 group duration-150 cursor-pointer"
          disabled={sameBin?.length == 1 ? false : isLoad || true || isLoad}
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
