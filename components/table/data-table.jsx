"use client";
import { useEffect, useState } from "react";

export default function DataTable({
  data,
  excludeKeys = ["mid"],
  itemsPerPage = 15,
  isFetching = false,
  searchTerm = "",
  filterBy = [],
  showPagination = true,
  styleTd = [],
  func = {},
  header = [],
}) {
  if (!data || data.length === 0)
    return <p className="w-full p-6 text-center">No data to display.</p>;

  const [currentPage, setCurrentPage] = useState(15);
  // Generate headers if not provided
  const headers =
    header.length > 0
      ? header
      : Object.keys(data[0]).filter((key) => !excludeKeys.includes(key));

  const filteredData = data?.filter((item) => {
    // Search across all string fields
    const matchesSearch =
      searchTerm === "" ||
      Object.entries(item)
        .filter(([key, value]) => !excludeKeys.includes(key))
        .some(([key, value]) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );

    // Filter by specific key-value pairs
    const matchesFilterBy =
      filterBy.length === 0 ||
      filterBy.every((filter) => {
        if (!filter.key || filter.value === undefined) return true;
        return String(item[filter.key]) === String(filter.value);
      });
    return matchesSearch && matchesFilterBy;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="max-w-6xl flex flex-col justify-between w-full text-sm mx-auto bg-white rounded-t-2xl overflow-hidden">
      <div className="overflow-x-auto c-scrollbar h-full">
        <table className="w-full text-left text-nowrap min-h-full">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-left align-bottom ">
              <th className="pl-5 pr-6 align-bottom relative px-3 py-3 font-semibold">
                No
              </th>
              {headers.map((th, i) => (
                <th
                  key={i}
                  className={`${
                    header.length - 1 == i &&
                    "w-full pr-10 align-bottom relative"
                  } px-3 py-3 font-semibold`}
                >
                  {th}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((row, i) => {
              const absoluteIndex = data.findIndex(
                (item) => JSON.stringify(item) === JSON.stringify(row)
              );
              return (
                <tr
                  key={i}
                  className="hover:bg-gray-100 transition-colors relative cursor-pointer "
                  onClick={() => {
                    func.onClickRow && func.onClickRow(row[0]);
                  }}
                >
                  <td className="pl-5 px-4 py-3 text-gray-500">
                    {absoluteIndex + 1}
                  </td>
                  {Object.entries(row)
                    .filter(([key]) => !excludeKeys.includes(key))
                    .map(([key, value]) => (
                      <td
                        key={key}
                        className={`px-4 py-3 ${
                          styleTd.find((s) => s.key === key)?.style || ""
                        }`}
                      >
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : value}
                      </td>
                    ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showPagination && (
        <Pagination
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          filteredData={filteredData}
        />
      )}
    </div>
  );
}

const Pagination = ({
  setCurrentPage,
  currentPage,
  totalPages,
  itemsPerPage,
  filteredData,
}) => {
  return (
    <div className="px-0 lg:px-4 pt-6 flex gap-8 justify-between items-center">
      <div className="text-sm text-gray-500">
        <span className="font-medium">
          {(currentPage - 1) * itemsPerPage + 1}
        </span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(currentPage * itemsPerPage, filteredData?.length)}
        </span>{" "}
        of <span className="font-medium">{filteredData?.length}</span> results
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setCurrentPage((p) => Math.max(1, p - 1));
          }}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => {
            setCurrentPage((p) => Math.min(totalPages, p + 1));
          }}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-4 py-2 text-sm font-medium text-indigo-500 bg-indigo-50 rounded-xl hover:bg-indigo-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};
