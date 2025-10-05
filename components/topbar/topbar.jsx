"use client";

import { faBars, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useEffect, useState } from "react";
import MenuModal from "../modal/menu";
import ProfileModal from "../modal/profile";

export default function Topbar() {
  const [user, setUser] = useState();
  const [profileModal, setProfileModal] = useState(false);
  const [menuModal, setMenuModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  return (
    <div className="lg:fixed relative inset-0 h-fit items-start justify-center w-full top-0 left-0 z-4">
      <div className="hidden lg:block absolute bg-[#E8ECF7] h-18 top-0 w-full"></div>
      <div className="lg:fixed top-6 left-6 right-6 flex w-full lg:w-auto gap-2 justify-between p-4 lg:px-6 items-center bg-white rounded-t-3xl lg:rounded-3xl lg:shadow-md shadow-black/5">
        <div
          onClick={() => setMenuModal(true)}
          className="rounded-2xl p-3 lg:p-4 block lg:hidden cursor-pointer hover:bg-gray-100 duration-150"
        >
          <FontAwesomeIcon icon={faBars} className="text-gray-500" />
        </div>
        <div className="pr-2">
          <Image
            src={"/sic-icon.svg"}
            alt="Logo"
            className="hidden lg:block ml-1"
            width={140}
            height={140}
            priority={true}
          />
          <Image
            src={"/sic-icon.svg"}
            alt="Logo"
            className="block lg:hidden"
            width={120}
            height={120}
            priority={true}
          />
        </div>
        <div className="hidden lg:flex gap-2 rounded-full">
          <p className="py-3 px-4 hover:text-[#7A6DFF] duration-150 cursor-pointer">
            Dashboard
          </p>
          <p className="py-3 px-4 hover:text-[#7A6DFF] duration-150 cursor-pointer">
            Menu
          </p>
          <p className="py-3 px-4 hover:text-[#7A6DFF] duration-150 cursor-pointer">
            About
          </p>
          <p className="py-3 px-4 hover:text-[#7A6DFF] duration-150 cursor-pointer">
            Profile
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden lg:flex gap-2 pl-2 items-end">
            <p className="m-0 text-sm text-gray-500">Hi, {user?.NAME}</p>
          </div>

          <div
            onClick={() => setProfileModal(true)}
            className="w-11 aspect-square bg-indigo-100 text-indigo-300 rounded-full a-middle cursor-pointer hover:bg-indigo-300 hover:text-indigo-100 duration-150"
          >
            <FontAwesomeIcon icon={faUser} className="text-lg" />
          </div>
        </div>
      </div>
      <ProfileModal isOpen={profileModal} setIsOpen={setProfileModal} />
      <MenuModal isOpen={menuModal} setIsOpen={setMenuModal} />
    </div>
  );
}
