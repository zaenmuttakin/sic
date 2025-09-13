import { useEffect, useState } from "react";

export default function Table({
  header,
  data,
  itemsPerPage = 20,
  isFeching = false,
  searchTerm = "",
  footer = false,
  trClick = () => {},
}) {
  if (!data || data.length === 0)
    return <p className="w-full p-6 text-center">No data to display.</p>;

  const [currentPage, setCurrentPage] = useState(1);
  // const headers = Object.keys(data[0]).filter(
  //   (key) => !excludeKeys.includes(key)
  // );

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
    // const matchesFilterBy =
    //   filterBy.length === 0 ||
    //   filterBy.every((filter) => {
    //     if (!filter.key || filter.value === undefined) return true;
    //     return String(item[filter.key]) === String(filter.value);
    //   });
    // return matchesSearch && matchesFilterBy;
    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);
  const paginatedData = filteredData?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="max-w-6xl flex flex-col justify-between w-full text-sm mx-auto bg-white rounded-t-2xl overflow-hidden">
      <div className="overflow-x-auto c-scrollbar h-full">
        <table className="w-full text-left text-nowrap min-h-full">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-left align-bottom ">
              {header.map((item, i) => (
                <th
                  key={i}
                  className={`${
                    header.length - 1 == i &&
                    "w-full pr-6 align-bottom relative"
                  } ${i == 0 && "pl-5"} px-3 py-3 font-semibold`}
                >
                  {item}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 transition-colors relative cursor-pointer "
                onClick={() => trClick(row[0])}
              >
                {row.map((col, j) => (
                  <td
                    key={j}
                    className={`${row.length - 1 == j && " w-full pr-6"} ${
                      j == 0 && "pl-5"
                    } px-3 py-3`}
                  >
                    {col}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {footer && (
        <div className=" px-0 lg:px-4 pt-6  flex gap-8 justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{data.length}</span> of{" "}
            <span className="font-medium">{data.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">
              Previous
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-[#7A6DFF] rounded-xl hover:bg-[#6A5BFF]">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
