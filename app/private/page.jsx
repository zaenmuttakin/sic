"use client";
import React from "react";

import { useRouter } from "next/navigation";
import ProfileImg from "../../components/image/profile";

export default function Page() {
  const router = useRouter();
  return (
    <div className="flex h-screen items-start justify-center w-full p-6">
      {/* Topbar */}

      <div className="flex gap-2 justify-between p-4 px-10 items-center w-full bg-white rounded-3xl">
        <div className="">
          <p>SIC-Central</p>
        </div>
        <div className="flex gap-2 rounded-full bg-[#eeeff4] border px-4 py-2">
          <p className="">Dashboard</p>
          <p>Menu</p>
          <p>Sheets</p>
          <p>Profile</p>
        </div>
        <div className="flex items-center gap-3">
          <ProfileImg
            src="https://i.pinimg.com/736x/99/73/63/997363c033991ca3fe13c8f554e88289.jpg"
            alt="Profile Image"
            width={50}
            height={50}
          />
          <div className="hidden lg:flex flex-col gap-0 pl-2">
            <p className="m-0 text-sm">Difa Egi Listianto</p>
            <span className="m-0 text-xs text-gray-500 mt-1">
              Technical Store Central
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
