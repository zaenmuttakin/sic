"use client";
import {
  faArrowLeft,
  faRefresh,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import GrayBtn from "../../../components/button/gray-btn";
import Inputz from "../../../components/input/input";
import SrcMaterial from "../../../components/modal/src-material";
import DataTable from "../../../components/table/data-table";
import { MaterialdataContext } from "../../../lib/context/material-data";
import { ColorContext } from "../../../lib/context/topbar-color";
import { timestampToDateTime } from "../../../lib/func/timestampToDateTime";

export default function Page() {
  const { materialData, isLoadMaterialData } = useContext(MaterialdataContext);
  const [data, setData] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFormOpen, setSearchFormOpen] = useState(false);
  const { setTopbarColor, topColors } = useContext(ColorContext);
  const [valueToSrc, setValueToSrc] = useState("");
  const [valueToSrcMaterial, setValueToSrcMaterial] = useState("");
  const router = useRouter();
  useEffect(() => {
    setData(materialData.data);
  }, [materialData]);
  return (
    <div className="page-container items-center bg-white lg:bg-[#E8ECF7]">
      <div className="flex flex-col h-full w-full bg-white p-0 lg:p-6 rounded-3xl max-w-4xl">
        <div className="flex justify-start items-center mb-4 lg:mb-6">
          <GrayBtn
            label={<FontAwesomeIcon icon={faArrowLeft} />}
            onClick={() => router.back()}
            style="bg-white"
          />
          <p className="ml-2 text-lg font-semibold">Material data </p>
          <div className="a-middle gap-2 ml-2">
            <span className="text-xs font-medium bg-indigo-50 text-indigo-400 px-2 py-1 rounded-2xl">
              {timestampToDateTime(materialData.timestamp)}
            </span>
          </div>
          <div className="flex-1 flex justify-end pr-2">
            {isLoadMaterialData && (
              <div className="w-6 a-middle aspect-square text-xs rounded-full a-middle bg-indigo-50 text-indigo-400">
                <FontAwesomeIcon icon={faRefresh} className=" animate-spin" />
              </div>
            )}
          </div>
        </div>
        <div className="min-h-[90vh] h-full w-full rounded-t-3xl overflow-x-auto px-2 lg:px-0 pb-20 lg:pb-18">
          {data && (
            <DataTable
              itemsPerPage={15}
              header={[
                <p className="pt-8">MID</p>,
                "Deskripsi",
                "Uom",
                "Draft",
                <div className="relative">
                  <p className="absolute -top-8 -left-2  pl-2 pr-8 py-1 bg-indigo-100 text-indigo-400 rounded-2xl  text-xs">
                    Actual Stock
                  </p>
                  <p>G002</p>
                </div>,
                "G005",
              ]} // Exclude mid from display if needed
              data={data.map((item) => [
                item.mid,
                item.desc,
                item.uom,
                item.drf.espar + item.drf.ewo + item.drf.res,
                item.actualStock.g002,
                item.actualStock.g005,
              ])}
              searchTerm={valueToSrcMaterial}
              func={{
                onClickRow: (e) => {
                  setSearchOpen(true);
                  setValueToSrc(e);
                },
                setIdToEdit: (id) => console.log("Edit ID:", id),
              }}
            />
          )}
        </div>
      </div>
      <SeacrhForm
        isOpen={searchFormOpen}
        setIsOpen={setSearchFormOpen}
        valueToSrc={valueToSrcMaterial}
        setValueToSrc={setValueToSrcMaterial}
      />
      <SrcMaterial
        isOpen={searchOpen}
        setIsOpen={setSearchOpen}
        valueToSrc={valueToSrc}
        setValueToSrc={setValueToSrc}
        loadtime={0}
      />
    </div>
  );
}

const SeacrhForm = ({
  isOpen,
  setIsOpen,
  valueToSrc,
  setValueToSrc,
  cekvalue,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  return (
    <form className="fixed flex gap-3 justify-between px-6 py-4 bg-white w-full max-w-4xl rounded-t-2xl bottom-0">
      <div className="relative flex-1" disabled={isLoading}>
        <Inputz
          type="text"
          ref={inputRef}
          placeholder="Cari dengan MID / Description"
          value={valueToSrc}
          style={`${cekvalue && "cekval"}  focus:border-indigo-400/80 `}
          onChange={(e) => setValueToSrc(e.target.value)}
          disabled={isLoading}
        />
        {valueToSrc && !isLoading && (
          <FontAwesomeIcon
            icon={faTimes}
            onClick={() => {
              setValueToSrc("");
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm cursor-pointer bg-white p-2 hover:text-indigo-400"
          />
        )}
      </div>
      {/* <PrimaryBtn
        type="submit"
        name="maximize"
        label={
          isLoading ? (
            <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
          ) : (
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          )
        }
        onClick={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        disabled={isLoading}
      /> */}
    </form>
  );
};
