import React from "react";

export default function Inputz({ ...props }) {
  return (
    <input
      {...props}
      className="block w-full rounded-xl px-4 py-2 outline-0 border border-gray-300"
    ></input>
  );
}
