"use client";
import React from "react";

import { useRouter } from "next/navigation";
import Topbar from "../../components/topbar/topbar";
import MenuItem from "../../components/button/menu-item";
import Table from "../../components/table/table";
import SearchCard from "../../components/srccard";

export default function Page() {
  const router = useRouter();
  return (
    <div className="min-h-screen p-4 lg:p-6 flex flex-col gap-4 lg:gap-6">
      <Topbar />

      <div className="grid  grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-6">
        <div className="order-last lg:order-first">
          <div className="h-full rounded-3xl bg-white p-6">
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

        <div className="col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className=" rounded-3xl bg-white p-6">
            <p className="text-md lg:text-lg font-bold mb-6">
              Selisih SO Internal
            </p>
            <Table />
          </div>
          <div className="hidden lg:block bg-white rounded-3xl">
            <SearchCard />
          </div>

          <div className="order-first lg:order-last lg:col-span-2 rounded-3xl bg-white p-6 pb-8 h-full">
            <p className="text-md lg:text-lg font-bold mb-6">Menu</p>
            <div className="grid lg:flex grid-cols-2 gap-4 lg:gap-6">
              <MenuItem />
              <MenuItem />
              <MenuItem />
              <MenuItem />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
