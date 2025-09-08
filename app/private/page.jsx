"use client";
import { useContext, useEffect, useState } from "react";

import {
  faBoxesPacking,
  faClipboardList,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MenuItem from "../../components/button/menu-item";
import SicBtn from "../../components/button/sic-btn";
import SrcMaterial from "../../components/modal/src-material";
import SearchCard from "../../components/srccard";
import Table from "../../components/table/table";
import Topbar from "../../components/topbar/topbar";
import { ColorContext } from "../../lib/context/topbar-color";

export default function Page() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const { setTopbarColor, topColors } = useContext(ColorContext);
  useEffect(() => {
    searchOpen
      ? setTopbarColor(topColors.onmodal)
      : setTopbarColor(topColors.default);
  }, [searchOpen]);
  return (
    <div className="relative page-container">
      <SrcMaterial isOpen={searchOpen} setIsOpen={setSearchOpen} />
      {!searchOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ x: 0, scale: 0.5 }}
            animate={{ x: 0, scale: 1 }}
            exit={{ x: 20, scale: 0.6 }}
            className="fixed lg:hidden bottom-4 right-4 z-20"
          >
            <SicBtn
              type="submit"
              onClick={() => {
                setSearchOpen(!searchOpen);
              }}
              label={
                <Image
                  src="/logo-icon-white.svg"
                  alt="icon"
                  width={16}
                  height={16}
                />
              }
            />
          </motion.div>
        </AnimatePresence>
      )}
      <Topbar />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-6">
        <div className="order-last lg:order-first">
          <div className="h-full rounded-3xl bg-white p-6 ">
            <p className="mb-6 text-md lg:text-lg font-bold">Daily Report</p>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-6"></div>
            <div className="h-2 bg-gray-200 rounded-full mb-2">
              <div className="h-2 bg-[#7A6DFF] rounded-full w-3/4"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-6"></div>
            <div className="h-2 bg-gray-200 rounded-full mb-2">
              <div className="h-2 bg-[#7A6DFF] rounded-full w-3/4"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-6"></div>
            <div className="h-2 bg-gray-200 rounded-full mb-2">
              <div className="h-2 bg-[#7A6DFF] rounded-full w-3/4"></div>
            </div>
          </div>
        </div>

        <div className="col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 ">
          <div className="relative flex flex-col rounded-3xl bg-white p-6 h-full">
            <p className="text-md lg:text-lg font-bold mb-6">
              Selisih SO Internal
            </p>
            <Table
              header={[
                "Tanggal",
                "Sloc",
                "MID",
                "Deskripsi",
                "value",
                <span className="text-nowrap">Qty Actual</span>,
                "Different",
                "Status",
                "Note",
              ]}
              footer={true}
              data={[
                [
                  "25/08/2025",
                  "G002",
                  19000793,
                  "BAUT MUR 8X20MM",
                  "Rp565",
                  746,
                  -12,
                  "Belum trace",
                  "Ada dijelibox atasnya",
                ],
                [
                  "25/08/2025",
                  "G002",
                  19000838,
                  "BAUT MUR SS 16X50MM",
                  "Rp13.675",
                  48,
                  72,
                  "Belum trace",
                  "",
                ],
                [
                  "25/08/2025",
                  "G002",
                  19003833,
                  'PIPA SS 304 SCH10 2.5"',
                  "Rp1.339.002",
                  30600,
                  600,
                  "Belum trace",
                  "",
                ],
                [
                  "25/08/2025",
                  "G002",
                  19003839,
                  'PIPA SS 304 SCH10 6"',
                  "Rp3.564.990",
                  8400,
                  -13800,
                  "Belum trace",
                  "Salah hitung",
                ],
                [
                  "25/08/2025",
                  "G002",
                  19002091,
                  'FLANGE SS304 JIS10K 4"',
                  "Rp219.637",
                  6,
                  -47,
                  "Belum trace",
                  "",
                ],
                [
                  "25/08/2025",
                  "G002",
                  19002091,
                  'FLANGE SS304 JIS10K 4"',
                  "Rp219.637",
                  6,
                  -47,
                  "Belum trace",
                  "",
                ],
              ]}
            />
          </div>
          <div className="hidden lg:flex flex-col bg-white rounded-3xl">
            <SearchCard isOpen={searchOpen} setIsOpen={setSearchOpen} />
          </div>

          <div className="order-first lg:order-last lg:col-span-2 rounded-b-3xl lg:rounded-3xl bg-white pt-4 lg:pt-6 p-6 pb-8 h-full lg:min-h-[30vh]">
            <p className="text-md hidden lg:block lg:text-lg font-bold mb-6">
              Menu
            </p>
            <p className="text-sm text-gray-500 mb-6 lg:hidden">
              <span className="font-medium">Tetap fokus!</span> <br /> Akurasi
              adalah tujuan utama 🔥
            </p>
            {/* <p className="text-left text-sm text-gray-500 mb-6 lg:mb-8 lg:hidden">
              <span className="font-medium">Let's rock!</span> <br />
              Every challenge is an opportunity to grow 🔥
            </p> */}
            <div className="grid lg:flex flex-wrap   grid-cols-2 gap-4 lg:gap-6">
              <MenuItem
                to="/private/so"
                icon={faClipboardList}
                title="Stock Opname"
              />
              <MenuItem
                to="/private/monitor-g002"
                icon={faBoxesPacking}
                title="Material Data"
              />
              <MenuItem to="/not-available" icon={faQuestion} title="Try" />
              <MenuItem to="/try" icon={faQuestion} title="Try" />
              <MenuItem to="/try" icon={faQuestion} title="Try" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
