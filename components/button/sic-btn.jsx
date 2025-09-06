import Image from "next/image";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SicBtn({
  label,
  style,

  ...props
}) {
  return (
    <button
      {...props}
      className={`${style} aspect-square a-middle w-12 font-medium text-white bg-[#7A6DFF]  rounded-full hover:bg-[#6A5BFF] cursor-pointer shadow-lg`}
    >
      {label}
    </button>
  );
}
