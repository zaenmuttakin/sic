import React from "react";
import ProfileImg from "../../components/image/profile";
import Image from "next/image";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Topbar() {
  return (
    <div className="flex items-start justify-center w-full ">
      <div className="flex gap-2 justify-between p-4 px-6 lg:px-8 items-center w-full bg-white rounded-3xl">
        <div className="block lg:hidden">
          <FontAwesomeIcon icon={faBars} className="p-2 rounded-2xl" />
        </div>
        <div className="pr-2">
          <Image
            src={"/sic-icon.svg"}
            alt="Logo"
            className="hidden lg:block"
            width={150}
            height={150}
          />
          <Image
            src={"/sic-icon.svg"}
            alt="Logo"
            className="block lg:hidden"
            width={110}
            height={110}
          />
        </div>
        <div className="hidden lg:flex gap-1 rounded-full bg-[#eeeff4] ml-8">
          <p className="py-4 px-6 bg-black rounded-full text-white">
            Dashboard
          </p>
          <p className="py-4 px-6">Menu</p>
          <p className="py-4 px-6">Sheets</p>
          <p className="py-4 px-6">About</p>
          <p className="py-4 px-6">Profile</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden lg:flex gap-2 pl-2 items-end">
            <p className="m-0 font-medium">Hi, Difa Egi Listianto</p>
          </div>
          <ProfileImg
            src="https://i.pinimg.com/736x/99/73/63/997363c033991ca3fe13c8f554e88289.jpg"
            alt="Profile Image"
            width={50}
            height={50}
          />
        </div>
      </div>
    </div>
  );
}
