"use client";
import { useContext, useEffect, useState } from "react";
import SrcMaterial from "../../../components/modal/src-material";
import Table from "../../../components/table/table";
import { MaterialdataContext } from "../../../lib/context/material-data";
import { ColorContext } from "../../../lib/context/topbar-color";

export default function Page() {
  const { materialData } = useContext(MaterialdataContext);
  const [data, setData] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { setTopbarColor, topColors } = useContext(ColorContext);
  const [valueToSrc, setValueToSrc] = useState("");
  useEffect(() => {
    console.log(materialData);
    setData(materialData.data);
  }, [materialData]);
  useEffect(() => {
    console.log("data", data);
  }, [data]);
  return (
    <div className="page-container items-center bg-white lg:bg-[#E8ECF7]">
      <div className="h-full w-full max-w-4xl bg-white p-0 lg:p-6 rounded-3xl overflow-x-auto">
        {data && (
          <Table
            trClick={(e) => {
              setSearchOpen(true);
              setValueToSrc(e);
            }}
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
              "Bin",
            ]}
            data={data.map((item) => [
              item.mid,
              item.desc,
              item.uom,
              item.drf.espar + item.drf.ewo + item.drf.res,
              item.actualStock.g002,
              item.actualStock.g005,
              item.actualStock.g005,
            ])}
          />
        )}
      </div>

      <SrcMaterial
        isOpen={searchOpen}
        setIsOpen={setSearchOpen}
        valueToSrc={valueToSrc}
        setValueToSrc={setValueToSrc}
      />
    </div>
  );
}
