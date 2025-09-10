"use client";
import { useContext, useEffect, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SicBtn from "../../components/button/sic-btn";
import DiffSO from "../../components/dash-panel/diff-so";
import Menus from "../../components/dash-panel/menus";
import { Sheets } from "../../components/dash-panel/sheets";
import { SrcCard } from "../../components/dash-panel/srccard";
import SrcMaterial from "../../components/modal/src-material";
import Topbar from "../../components/topbar/topbar";
import { MaterialdataContext } from "../../lib/context/material-data";
import { ColorContext } from "../../lib/context/topbar-color";

export default function Page() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const { setTopbarColor, topColors } = useContext(ColorContext);
  const { isLoadMaterialData } = useContext(MaterialdataContext);

  useEffect(() => {
    searchOpen
      ? setTopbarColor(topColors.onmodal)
      : setTopbarColor(topColors.default);
  }, [searchOpen]);
  return (
    <div className="relative page-container">
      <Topbar />
      <div className="hidden lg:block h-20 relative"></div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-4 lg:gap-6">
        <Sheets />
        <div className="col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 ">
          <DiffSO />
          <SrcCard isOpen={searchOpen} setIsOpen={setSearchOpen} />
          <Menus />
        </div>
      </div>

      {/* --------------search material modal----------------- */}
      <SrcMaterial isOpen={searchOpen} setIsOpen={setSearchOpen} />
      {!searchOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ x: 0, scale: 0.7 }}
            animate={{ x: 0, scale: isLoadMaterialData ? 0.7 : 1 }}
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
