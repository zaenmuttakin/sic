"use client";

import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import GrayBtn from "../../../../components/button/gray-btn";
import { MaterialdataContext } from "@/lib/context/material-data";
import { useContext, useState } from "react";

export default function page() {
  const { materialData, isLoadMaterialData } = useContext(MaterialdataContext);
  const [data, setData] = useState(null);
  const [valueToSrcMaterial, setValueToSrcMaterial] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  return (
    <div className="flex flex-col max-w-4xl mx-auto bg-gradient-to-b from-white from-1% to-transparent">
      <div className="top-0 p-4 py-2 lg:p-6 sticky flex flex-col gap-4 z-2 bg-gradient-to-b from-white from-90% via-50% to-transparent">
        <Topbar />
      </div>
      <div className="px-4 lg:px-6 pb-8 bg-white min-h-[calc(100vh-5rem)]">
        <Content
          itemsPerPage={15}
          params={{
            searchTerm: valueToSrcMaterial,
            data,
            currentPage,
            setCurrentPage,
          }}
        />
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
        <p className=" text-lg font-semibold">
          Belum Ada Mapping
          <span className="ml-2 px-3 py-1 rounded-2xl bg-indigo-50 text-indigo-400 text-sm font-normal">
            G002
          </span>
        </p>
      </div>
    </div>
  );
}

function Content({ params, itemsPerPage = 25 }) {
  if (!params.data || params.data.length === 0) return null;
  const filteredData = params.data.filter((item) => {
    const matchesSearch =
      params.searchTerm === "" ||
      Object.entries(item).some(([key, value]) =>
        String(value).toLowerCase().includes(params.searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (params.currentPage - 1) * itemsPerPage,
    params.currentPage * itemsPerPage
  );

  return (
    <>
      <div className="flex flex-col pb-4 min-h-[calc(100vh-11rem)]">
        {filteredData?.length === 0 && (
          <p className="text-gray-500 text-sm p-24 text-center">
            No data found
          </p>
        )}
        {filteredData?.length != 0 &&
          paginatedData.map((value, index) => (
            <div
              key={index}
              onClick={() => {
                params.setValueToSrc(value.mid);
                params.setSearchOpen(true);
              }}
              className={`group relative grid grid-cols-1 lg:grid-cols-2 items-start lg:items-center gap-2 border-t border-gray-200 bg-white p-4 cursor-pointer hover:bg-gray-50 `}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 aspect-square align-middle">
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-white group-hover:text-gray-300 text-sm"
                />
              </div>
              <div className="flex gap-3 justify-start items-center w-full">
                <div className="flex flex-col flex-1">
                  <div className="flex gap-1 items-center">
                    <p
                      name="mid"
                      className="font-semibold text-sm mr-1 text-gray-700"
                    >
                      {value?.mid}
                    </p>
                    <p
                      name="uom"
                      className="text-xs bg-gray-100 text-gray-500 rounded-bl-xl rounded-r-xl rounded-l-sm  px-3 py-1 font-semibold"
                    >
                      {value?.uom}
                    </p>
                    <div
                      name="stock"
                      className="bg-indigo-50 text-indigo-500 flex flex-nowrap text-nowrap gap-2 text-xs rounded-bl-xl rounded-sm rounded-r-xl rounded-l-sm px-3 py-1 w-fit"
                    >
                      <p>
                        <span className="font-semibold">G002 :</span>{" "}
                        {value?.actualStock.g002}
                      </p>
                      <span className="opacity-20">|</span>
                      <p>
                        <span className="font-semibold">G005 :</span>{" "}
                        {value?.actualStock.g005}
                      </p>
                    </div>
                  </div>
                  <p
                    name="desc"
                    className="text-sm text-gray-700 line-clamp-1 pt-1.5"
                  >
                    {value?.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>
      <Pagination
        setCurrentPage={params.setCurrentPage}
        currentPage={params.currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        filteredData={filteredData}
        setIsScrollingUp={params.setIsScrollingUp}
      />
    </>
  );
}

function Pagination({
  setCurrentPage,
  currentPage,
  totalPages,
  itemsPerPage,
  filteredData,
  setIsScrollingUp,
}) {
  const scrollToTop = () => {
    setIsScrollingUp(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <div className="px-4 lg:px-4 pt-2 flex justify-between items-center ">
      <div className="text-sm text-gray-500 line-clamp-1">
        <span className="font-medium">
          {(currentPage - 1) * itemsPerPage + 1}
        </span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(currentPage * itemsPerPage, filteredData?.length)}
        </span>{" "}
        of <span className="font-medium">{filteredData?.length}</span>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setCurrentPage((p) => Math.max(1, p - 1));
            scrollToTop();
          }}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => {
            setCurrentPage((p) => Math.min(totalPages, p + 1));
            scrollToTop();
          }}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-4 py-2 text-sm font-medium text-indigo-500 bg-indigo-50 rounded-xl hover:bg-indigo-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
