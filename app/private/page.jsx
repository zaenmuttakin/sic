"use client";
import React from "react";

import { useRouter } from "next/navigation";
import ProfileImg from "../../components/image/profile";

export default function Page() {
  const router = useRouter();
  return (
    <div className="flex h-screen items-start justify-center w-full">
      {/* Topbar */}
      <div className="flex gap-2 justify-between items-center w-full max-w-4xl p-6 ">
        <div className="">
          <p className=" font-bold">Hi, Difa Ikhsan Egistiyo</p>
          <p className="text-xs text-gray-500 mt-1">Welcome back 🔥</p>
        </div>
        <ProfileImg
          src="https://i.pinimg.com/736x/99/73/63/997363c033991ca3fe13c8f554e88289.jpg"
          alt="Profile Image"
          width={50}
          height={50}
        />
      </div>
    </div>
  );
}
