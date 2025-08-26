"use client";
import React, { useState } from "react";
import TopbarMenu from "../../../components/topbar/topbar-menu";

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);
  return (
    <div className="page-container">
      {/* <TopbarMenu /> */}
      <div className="flex gap-2 mt-2">
        <p className="p-2 px-4 rounded-3xl bg-white">List</p>
        <p className="p-2 px-4 rounded-3xl bg-white">
          Difference{" "}
          <span className="ml-1 p-.5 px-1 rounded-full bg-red-100 text-red-400 text-xs lg:text-sm">
            10
          </span>
        </p>
        <p className="p-2 px-4 rounded-3xl bg-white">Balance</p>
      </div>
      <div className=" rounded-3xl bg-white p-6 h-svh"></div>
    </div>
  );
}
