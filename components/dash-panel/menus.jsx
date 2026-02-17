"use client";
import {
  faBoxesPacking,
  faChartSimple,
  faClipboardList,
  faLocationDot,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import { AuthContext } from "../../lib/context/auth";
import MenuItem from "../button/menu-item";

export default function Menus() {
  const { user } = useContext(AuthContext);

  return (
    <div className="order-first lg:order-last lg:col-span-2 rounded-b-3xl lg:rounded-3xl bg-white pt-4 lg:pt-6 p-6 pb-8 h-full lg:min-h-[30vh]">
      <p className="text-md hidden lg:block lg:text-lg font-bold mb-6">Menu</p>
      <div className="text-sm text-gray-500 mb-6 lg:hidden">
        <span className="font-medium">Tetap fokus!</span> <br />
        <span>Akurasi adalah tujuan utama 🔥</span>
      </div>
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
          to="/private/material-data"
          icon={faBoxesPacking}
          title="Material Data"
        />
        <MenuItem to="/not-available" icon={faChartSimple} title="Report" />
        <MenuItem to="/private/mapping" icon={faLocationDot} title="Mapping" />
        <MenuItem to="/try" icon={faQuestion} title="About" />
      </div>
    </div>
  );
}
