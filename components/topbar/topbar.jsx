import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import ProfileImg from "../../components/image/profile";

export default function Topbar() {
  return (
    <div className="flex items-start justify-center w-full ">
      <div className="flex gap-2 justify-between p-4 lg:px-6 items-center w-full bg-white rounded-t-3xl lg:rounded-3xl ">
        <div className="rounded-2xl p-3 lg:p-4 block lg:hidden cursor-pointer hover:bg-gray-100 duration-100">
          <FontAwesomeIcon icon={faBars} className="" />
        </div>
        <div className="pr-2">
          <Image
            src={"/sic-icon.svg"}
            alt="Logo"
            className="hidden lg:block ml-1"
            width={140}
            height={140}
          />
          <Image
            src={"/sic-icon.svg"}
            alt="Logo"
            className="block lg:hidden"
            width={120}
            height={120}
          />
        </div>
        <div className="hidden lg:flex gap-2 rounded-full">
          <p className="py-3 px-4 rounded-full text-[#7A6DFF] font-medium">
            Dashboard
          </p>
          <p className="py-3 px-4">Menu</p>
          <p className="py-3 px-4">Sheets</p>
          <p className="py-3 px-4">About</p>
          <p className="py-3 px-4">Profile</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden lg:flex gap-2 pl-2 items-end">
            <p className="m-0 text-sm text-gray-500">Hi, Difa Egi Listianto</p>
          </div>
          <div className="hidden lg:block">
            <ProfileImg
              src="https://i.pinimg.com/736x/99/73/63/997363c033991ca3fe13c8f554e88289.jpg"
              alt="Profile Image"
              width={50}
              height={50}
            />
          </div>
          <div className="block lg:hidden">
            <ProfileImg
              src="https://i.pinimg.com/736x/99/73/63/997363c033991ca3fe13c8f554e88289.jpg"
              alt="Profile Image"
              width={48}
              height={48}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
