"use client";

import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { MaterialdataContext } from "../../lib/context/material-data";

export default function SicBtn({
  label,
  style,

  ...props
}) {
  const { isLoadMaterialData } = useContext(MaterialdataContext);
  return (
    <button
      {...props}
      className={`${style} ${
        isLoadMaterialData && "opacity-70"
      } aspect-square a-middle w-14 font-medium text-white bg-[#7A6DFF] rounded-full hover:bg-[#6A5BFF] cursor-pointer shadow-lg`}
    >
      {isLoadMaterialData ? (
        <FontAwesomeIcon
          icon={faCircleNotch}
          className="animate-spin text-2xl"
        />
      ) : (
        label
      )}
    </button>
  );
}
