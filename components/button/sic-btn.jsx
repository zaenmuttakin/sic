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
  const { cekLs } = useContext(MaterialdataContext);
  return (
    <button
      {...props}
      disabled={!cekLs}
      className={`${style} aspect-square a-middle w-14 font-medium text-white bg-[#7A6DFF] rounded-full hover:bg-[#6A5BFF] cursor-pointer shadow-lg disabled:opacity-75`}
    >
      {!cekLs ? (
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
