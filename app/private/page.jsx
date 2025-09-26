"use client";
import { useContext, useEffect, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SicBtn from "../../components/button/sic-btn";
import DiffSO from "../../components/dash-panel/diff-so";
import Menus from "../../components/dash-panel/menus";
import RekapTabung from "../../components/dash-panel/rekap-tabung";
import { Sheets } from "../../components/dash-panel/sheets";
import { SrcCard } from "../../components/dash-panel/srccard";
import SrcMaterial from "../../components/modal/src-material";
import Topbar from "../../components/topbar/topbar";
import { ColorContext } from "../../lib/context/topbar-color";

export default function Page() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const { setTopbarColor, topColors } = useContext(ColorContext);
  const [valueToSrc, setValueToSrc] = useState("");

  useEffect(() => {
    searchOpen
      ? setTopbarColor(topColors.onmodal)
      : setTopbarColor(topColors.default);
  }, [searchOpen]);
  return (
    <div className="relative page-container">
      <Topbar />
      <div className="hidden lg:block h-20 relative"></div>
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-7 gap-y-4 lg:gap-6">
        <div className="flex flex-col rounded-3xl gap-4 col-span-2 order-last xl:order-first">
          <SrcCard
            isOpen={searchOpen}
            setIsOpen={setSearchOpen}
            valueToSrc={valueToSrc}
            setValueToSrc={setValueToSrc}
          />
          <Sheets />
        </div>
        <div className="lg:col-span-4 xl:col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 rounded-3xl">
          <DiffSO />

          <RekapTabung />
          <Menus />
        </div>
      </div>

      {/* --------------search material modal----------------- */}
      <SrcMaterial
        isOpen={searchOpen}
        setIsOpen={setSearchOpen}
        valueToSrc={valueToSrc}
        setValueToSrc={setValueToSrc}
      />
      {!searchOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ x: 0, scale: 0.7 }}
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
    </div>
  );
}
