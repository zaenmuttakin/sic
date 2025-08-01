import React from "react";

export default function PrimaryBtn({ label, style, ...props }) {
  return (
    <button
      {...props}
      className={`${style} block w-full rounded-xl px-4 py-2 outline-0 border border-gray-300 cursor-pointer hover:bg-gray-200`}
    >
      {label}
    </button>
  );
}
