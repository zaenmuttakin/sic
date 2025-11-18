"use client";
import GrayBtn from "@/components/button/gray-btn";
import Table from "@/components/table/table";
import { faArrowLeft, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDateIsoToDate } from "../../../../../lib/func/isoString-toDate";
import { getValidate } from "../../../../../lib/gas/sic";

export default function Page() {
  const [header, setHeader] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const res = await getValidate();
      if (res.success) {
        setHeader(res.response[0]);
        setData(res.response.slice(1));
      } else {
        console.log(res.response);
      }
    };
    getData();
  }, []);

  return (
    <div className="flex flex-col max-w-4xl mx-auto bg-gradient-to-b from-white from-1% to-transparent">
      <div className="top-0 p-4 py-2 lg:p-6 sticky flex flex-col gap-4 z-2 bg-gradient-to-b from-white from-90% via-50% to-transparent">
        <Topbar />
      </div>
      <div className="px-6 lg:px-6 pb-8 bg-white min-h-[calc(100vh-5rem)] text-sm">
        {data ? <Content header={header} data={data} /> : <Load />}
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
        <p className=" text-lg font-semibold">Already Validated</p>
      </div>
    </div>
  );
}

function Content({ header, data }) {
  return (
    <Table
      header={header}
      footer={true}
      data={data.map((item) => [
        ...item.slice(0, 6),
        formatDateIsoToDate(new Date(item[6])),
        ...item.slice(7, item.length),
      ])}
    />
  );
}

function Load() {
  return (
    <div className="w-full h-full flex justify-center items-center py-24">
      <FontAwesomeIcon
        icon={faCircleNotch}
        className="text-4xl animate-spin text-indigo-400"
      />
    </div>
  );
}
