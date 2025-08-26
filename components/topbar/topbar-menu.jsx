import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faPlus,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

export default function TopbarMenu() {
  const router = useRouter();
  return (
    <div className="flex items-start justify-center w-full ">
      <div className="flex gap-2 lg:gap-4 justify-start py-1 px-O items-center w-full rounded-3xl">
        <div className="flex items-center justify-center w-11 lg:w-13 aspect-square rounded-3xl bg-white">
          <FontAwesomeIcon onClick={() => router.back()} icon={faChevronLeft} />
        </div>
        {/* <div className="flex-1"></div> */}
        <p className="py-2.5 lg:py-3 rounded-3xl text-center px-4 bg-white  flex-1">
          Stock Opname
        </p>
        {/* <div className="flex-1"></div> */}
        <div className="flex items-center justify-center w-11 lg:w-13 aspect-square rounded-3xl  bg-white">
          <FontAwesomeIcon icon={faSearch} />
        </div>
        <div className="flex items-center justify-center w-11 lg:w-13 aspect-square rounded-3xl  bg-white">
          <FontAwesomeIcon icon={faPlus} />
        </div>
      </div>
    </div>
  );
}
