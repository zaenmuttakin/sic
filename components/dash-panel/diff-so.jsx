import { faArrowUpLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { formatDateIsoToDate } from "../../lib/func/isoString-toDate";
import numberToRp from "../../lib/func/numberToRp";
import { openInNewWindow } from "../../lib/func/openInNewWindow";
import { getPendingDiffSo } from "../../lib/gas/sic";
import Table from "../table/table";

export default function DiffSO() {
  const [diffData, setDiffData] = useState(null);
  const [isLoadDiffData, setIsLoadDiffData] = useState(true);

  const handleError = () => {
    console.log("error");
    setDiffData("gagal");
  };

  const getDiffData = async () => {
    const diff = await getPendingDiffSo();
    !diff.success && handleError();
    if (diff.success) {
      setDiffData(diff.response);
      localStorage.setItem("diff-so", JSON.stringify(diff.response));
      setIsLoadDiffData(false);
    }
  };

  useEffect(() => {
    const diffLs = localStorage.getItem("diff-so");
    diffLs && setDiffData(JSON.parse(diffLs));
    diffLs && setIsLoadDiffData(false);
    !diffLs && setIsLoadDiffData(true);
    getDiffData();
  }, []);
  return (
    <div className="relative flex flex-col rounded-3xl bg-white p-6 h-full">
      <p className="text-md lg:text-lg font-bold mb-6">Selisih SO Internal</p>
      <div className="relative">
        {isLoadDiffData && (
          <p className=" w-full h-full a-middle bg-white p-24 text-sm text-gray-400">
            Loading...
          </p>
        )}
        {diffData == "gagal" && (
          <p className="  w-full h-full a-middle bg-white p-24 text-sm text-gray-400">
            Gagal memuat data
          </p>
        )}
        {diffData && diffData != "gagal" && (
          <Table
            header={[
              "Tanggal",
              "Sloc",
              "MID",
              "Deskripsi",
              "Uom",
              "Value",
              "Sap",
              <span className="text-nowrap">Qty Actual</span>,
              "Different",
              "Status",
              "Note",
            ]}
            data={diffData.slice(0, 5).map((item, i) => {
              return [
                <div className="flex gap-3 items-center">
                  {item.Diff > 0 ? (
                    <div className="w-2.5 aspect-square rounded-full bg-orange-400"></div>
                  ) : (
                    <div className="w-2.5 aspect-square rounded-full bg-red-400"></div>
                  )}
                  <p>{formatDateIsoToDate(item.Date)}</p>
                </div>,
                item.Sloc,
                item.MID,
                item.Desc,
                item.Uom,
                numberToRp(item.Value),
                item["Unrst."],
                item["Qty Actual"],
                <p
                  className={`px-3 w-fit py-.5 rounded-full ${
                    item.Diff > 0
                      ? "bg-orange-50 text-orange-400"
                      : "bg-red-100 text-red-400"
                  }`}
                >
                  {item.Diff}
                </p>,
                <p className="">{item.Status}</p>,
                item.Note,
              ];
            })}
          />
        )}
      </div>
      <div className="flex-1 h-full flex gap-6 justify-between items-end pt-4">
        {diffData && (
          <div className="text-xs text-gray-400 py-2.5 ">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">
              {diffData?.length > 6 ? 6 : diffData?.length}
            </span>{" "}
            of <span className="font-medium">{diffData?.length}</span> results
          </div>
        )}
        <button
          onClick={() =>
            openInNewWindow(
              "https://docs.google.com/spreadsheets/d/1E4n8mtQo0_cFrWv9V6jJjt7fg6neO4UvU0XniEI2XhA/edit?gid=1220006404#gid=1220006404"
            )
          }
          className="a-middle px-4 py-2.5  gap-2 text-sm bg-indigo-50 rounded-xl text-[#7A6DFF] hover:bg-[#7A6DFF] hover:text-white cursor-pointer duration-100"
        >
          <p className="text-nowrap">Buka sheet</p>
          <FontAwesomeIcon icon={faArrowUpLong} className="rotate-45" />
        </button>
      </div>
    </div>
  );
}
