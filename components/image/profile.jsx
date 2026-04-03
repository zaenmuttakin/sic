import Image from "next/image";
import React from "react";

export default function ProfileImg({ ...props }) {
  return <Image {...props} className="rounded-full aspect-square" />;
}
