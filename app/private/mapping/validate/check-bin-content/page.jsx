"use client";

import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import GrayBtn from "../../../../../components/button/gray-btn";

export default function page() {
  return (
    <div className="flex flex-col max-w-4xl mx-auto bg-gradient-to-b from-white from-1% to-transparent">
      <div className="top-0 p-4 py-2 lg:p-6 sticky flex flex-col gap-4 z-2 bg-gradient-to-b from-white from-90% via-50% to-transparent">
        <Topbar />
      </div>
      <div className="px-4 lg:px-6 pb-8 bg-white min-h-[calc(100vh-5rem)]"></div>
    </div>
  );
}

function Topbar() {
  const router = useRouter();
  return (
    <div
      className={`topbar flex items-center justify-between px-0 py-2 gap-2 `}
    >
      <div className="flex-1 flex justify-start items-center relative w-full gap-1">
        <GrayBtn
          label={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => router.back()}
          style="bg-transparent"
        />
        <p className="text-lg font-semibold text-indigo-400">AA-01-01</p>
      </div>
    </div>
  );
}
