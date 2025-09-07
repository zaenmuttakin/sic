import Image from "next/image";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function PrimaryBtn({
  label,
  style,
  image = false,
  icon = false,
  imgsrc,
  ...props
}) {
  return (
    <button
      {...props}
      className={`${style} a-middle px-4 py-2.5 font-medium text-white bg-[#7A6DFF] rounded-xl hover:bg-[#6A5BFF] disabled:opacity-90 cursor-pointer`}
    >
      {image && (
        <Image
          src={imgsrc}
          alt="icon"
          width={20}
          height={20}
          className="inline mr-2.5"
        />
      )}
      {icon && <FontAwesomeIcon icon={imgsrc} className="inline mr-2.5" />}
      {label}
    </button>
  );
}
