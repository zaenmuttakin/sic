"use client";
import React, { useState } from "react";

import { useRouter } from "next/navigation";
import Topbar from "../../components/topbar/topbar";
import MenuItem from "../../components/button/menu-item";
import Table from "../../components/table/table";
import SearchCard from "../../components/srccard";
import {
  faArrowsUpDown,
  faBolt,
  faBoxesPacking,
  faCaretDown,
  faChevronDown,
  faClipboardCheck,
  faClipboardList,
  faCoins,
  faCubesStacked,
  faDatabase,
  faEye,
  faLayerGroup,
  faList,
  faListOl,
  faListUl,
  faMagnifyingGlass,
  faMagnifyingGlassChart,
  faQuestion,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import PrimaryBtn from "../../components/button/primary-btn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import SicBtn from "../../components/button/sic-btn";
import GrayBtn from "../../components/button/gray-btn";
import Inputz from "../../components/input/input";

export default function Page() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <div className="relative page-container">
      {searchOpen && (
        <div className="fixed w-full min-h-screen bg-black/30 top-0 left-0 z-10 pb-20 p-4 flex items-end">
          <div className="h-full max-h-[85vh] p-6 bg-white rounded-3xl w-full flex flex-col justify-center gap-4 ">
            <div className="flex items-center justify-between">
              <p className="font-medium">Search Material</p>
              <GrayBtn
                type="submit"
                label={
                  <FontAwesomeIcon
                    icon={faArrowsUpDown}
                    className=" rotate-45 text-gray-500"
                  />
                }
              />
            </div>
            <form className="flex gap-3 mt-4">
              <Inputz type="text" placeholder="Cari dengan MID" />
              <PrimaryBtn
                type="submit"
                label={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/private");
                }}
              />
            </form>
            <div className="a-middle min-h-24">
              <p className="text-sm text-gray-400">
                Masukan mid untuk melihat data stock
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="fixed bottom-4 right-4 z-20">
        <SicBtn
          type="submit"
          style={`duration-100`}
          onClick={() => setSearchOpen(!searchOpen)}
          label={
            !searchOpen ? (
              <Image
                src="/logo-icon-white.svg"
                alt="icon"
                width={14}
                height={14}
              />
            ) : (
              <FontAwesomeIcon
                icon={faChevronDown}
                className="text-lg text-white"
              />
            )
          }
        />
      </div>
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
          <div className=" rounded-3xl bg-white p-6">
            <p className="text-md lg:text-lg font-bold mb-6">
              Selisih SO Internal
            </p>
            <Table />
          </div>
          <div className="hidden lg:block bg-white rounded-3xl">
            <SearchCard />
          </div>

          <div className="order-first lg:order-last lg:col-span-2 rounded-b-3xl lg:rounded-3xl bg-white pt-4 lg:pt-6 p-6 pb-8 h-full ">
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
              <MenuItem to="/try" icon={faQuestion} title="Try" />
              <MenuItem to="/try" icon={faQuestion} title="Try" />
              <MenuItem to="/try" icon={faQuestion} title="Try" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
