"use client";
import {
  faArrowLeft,
  faArrowRightLong,
  faCheckDouble,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import GrayBtn from "../../../components/button/gray-btn";

export default function Page() {
  const router = useRouter();
  return (
    <div className="flex flex-col max-w-4xl mx-auto bg-gradient-to-b from-white from-1% to-transparent">
      <div className="top-0 p-4 py-2 lg:p-6 sticky flex flex-col gap-4 z-2 bg-gradient-to-b from-white from-90% via-50% to-transparent">
        <Topbar />
      </div>
      <div className="px-4 lg:px-6 pb-8 bg-white min-h-[calc(100vh-5rem)] text-sm">
        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/private/mapping/validate")}
            className="relative flex group p-4 border border-indigo-50/50 bg-indigo-50 rounded-3xl items-center gap-4 cursor-pointer hover:bg-indigo-100/80 hover:border-indigo-200 duration-200"
          >
            <div className="w-10 aspect-square a-middle rounded-full bg-indigo-400 text-white">
              <FontAwesomeIcon icon={faCheckDouble} className="" />
            </div>
            <p className=" font-medium">Validasi Mapping</p>
            <FontAwesomeIcon
              icon={faArrowRightLong}
              className="absolute text-indigo-400 opacity-0 transform top-1/2 -translate-y-1/2 right-12 group-hover:right-8 group-hover:opacity-100 duration-200"
            />
          </button>
          <button
            onClick={() => router.push("/private/mapping/null-bin-g002")}
            className="relative flex group p-4 border border-indigo-50/50 bg-indigo-50 rounded-3xl items-center gap-4 cursor-pointer hover:bg-indigo-100/80 hover:border-indigo-200 duration-200"
          >
            <div className="w-10 aspect-square a-middle rounded-full bg-indigo-400 text-white">
              <FontAwesomeIcon icon={faSquareXmark} className="" />
            </div>
            <p className=" font-medium">
              Belum Ada BIN{" "}
              <span className="ml-1 px-2.5 py-1 rounded-2xl bg-indigo-400 text-white text-xs font-normal">
                G002
              </span>
            </p>
            <FontAwesomeIcon
              icon={faArrowRightLong}
              className="absolute text-indigo-400 opacity-0 transform top-1/2 -translate-y-1/2 right-12 group-hover:right-8 group-hover:opacity-100 duration-200"
            />
          </button>
          <button
            onClick={() => router.push("/private/mapping/null-bin-g005")}
            className="relative flex group p-4 border border-indigo-50/50 bg-indigo-50 rounded-3xl items-center gap-4 cursor-pointer hover:bg-indigo-100/80 hover:border-indigo-200 duration-200"
          >
            <div className="w-10 aspect-square a-middle rounded-full bg-indigo-400 text-white">
              <FontAwesomeIcon icon={faSquareXmark} className="" />
            </div>
            <p className=" font-medium">
              Belum Ada BIN{" "}
              <span className="ml-1 px-2.5 py-1 rounded-2xl bg-indigo-400 text-white text-xs font-normal">
                G005
              </span>
            </p>
            <FontAwesomeIcon
              icon={faArrowRightLong}
              className="absolute text-indigo-400 opacity-0 transform top-1/2 -translate-y-1/2 right-12 group-hover:right-8 group-hover:opacity-100 duration-200"
            />
          </button>
        </div>
      </div>
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
        <p className=" text-lg font-semibold">Mapping</p>
      </div>
    </div>
  );
}
