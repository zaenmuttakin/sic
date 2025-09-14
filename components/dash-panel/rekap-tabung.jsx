import { faArrowRight, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { getTabungBsg } from "../../lib/gas/sic";
import Table from "../table/table";

export default function RekapTabung() {
  const [dataTabung, setDataTabung] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const handleError = () => {
    console.log("gagal memuat data tabung");
  };
  const handleFetch = async () => {
    console.log("fetch");
    setIsLoading(true);
    const tabung = await getTabungBsg();
    !tabung.success && handleError();
    if (tabung.success) {
      setDataTabung(tabung.response);
      localStorage.setItem("rekap-tabung", JSON.stringify(tabung.response));
      setIsLoading(false);
      console.log(tabung.response);
    }
  };

  useEffect(() => {
    const lsRekapTabung = localStorage.getItem("rekap-tabung");
    lsRekapTabung && setDataTabung(JSON.parse(lsRekapTabung));
    handleFetch();
  }, []);

  return (
    <div className="relative max-h-[30rem] h-full overflow-none p-6 bg-white rounded-3xl w-full flex flex-col justify-start">
      <div className="flex justify-between items-center mb-6">
        <div className="a-middle">
          <p className="text-md lg:text-lg font-bold">Rekap Tabung BSG</p>
          {isLoading && (
            <div className="w-6 h-6 a-middle aspect-square text-xs rounded-full a-middle bg-indigo-50 text-indigo-400 ml-2">
              <FontAwesomeIcon icon={faRefresh} className="animate-spin" />
            </div>
          )}
        </div>
        <button className="a-middle px-4 py-2.5  gap-2 text-sm bg-indigo-50 rounded-xl text-[#7A6DFF] hover:bg-[#7A6DFF] hover:text-white cursor-pointer duration-100">
          <span className="hidden lg:block">Details</span>
          <span className="lg:hidden block text-sm">
            <FontAwesomeIcon icon={faArrowRight} />
          </span>
        </button>
      </div>
      <div className="pb-2">
        {!dataTabung && (
          <p className=" w-full h-full a-middle bg-white p-16 text-sm text-gray-400">
            Loading...
          </p>
        )}
        {dataTabung && (
          <Table
            header={[
              "MID",
              "Deskripsi",
              "Rop",
              "Max",
              "Tabung Isi",
              "Kosong",
              "Dipinjam",
              "Total",
              "Saldo",
              "Different",
            ]}
            data={dataTabung.map((item) => {
              return [
                item.MID,
                item.DESC,
                <span className="a-middle">{item.ROP}</span>,
                <span className="a-middle">{item.MAX}</span>,
                <p className="absolute inset-y-0 a-middle">
                  <span
                    className={`${
                      item["TABUNG ISI"] > item.ROP
                        ? "bg-indigo-50 text-indigo-500"
                        : "bg-red-50 text-red-500"
                    } font-medium p-1 px-2 rounded-xl w-full min-w-[4rem] text-center`}
                  >
                    {item["TABUNG ISI"]}
                  </span>
                </p>,
                <p className="absolute inset-y-0 a-middle">
                  <span className="font-medium p-1 px-3 w-full min-w-[4rem] text-center rounded-xl bg-gray-100 text-gray-700">
                    {item["TABUNG KOSONG"]}
                  </span>
                </p>,
                <span className="a-middle">{item["TABUNG DIPINJAM"]}</span>,
                <span className="a-middle">{item.TOTAL}</span>,
                <span className="a-middle">{item.SALDO}</span>,
                <span className="a-middle">{item.DIFF}</span>,
              ];
            })}
          />
        )}
      </div>
    </div>
  );
}
