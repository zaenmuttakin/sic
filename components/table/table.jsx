import { useState } from "react";

export default function Table({ header, data, footer = false }) {
  // Status color mapping
  const statusColors = {
    Completed: "bg-green-100 text-green-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Planning: "bg-yellow-100 text-yellow-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  // Priority color mapping
  const priorityColors = {
    High: "text-red-600",
    Medium: "text-yellow-600",
    Low: "text-green-600",
  };

  return (
    <>
      <div className="max-w-6xl text-sm mx-auto bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-left">
                {header.map((item, i) => (
                  <th
                    key={i}
                    className={`${header.length - 1 == i && "w-full pr-6"} ${
                      i == 0 && "pl-6"
                    } px-4 py-3 font-semibold`}
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  {row.map((col, j) => (
                    <td
                      key={j}
                      className={`${row.length - 1 == j && "w-full pr-6"} ${
                        j == 0 && "pl-6"
                      } px-4 py-3`}
                    >
                      {col}
                    </td>
                  ))}
                </tr>
              ))}
              {/*
                // <tr key={i} className="hover:bg-gray-50 transition-colors">
                //   <td className="px-4 py-4 whitespace-nowrap">
                //     <div className="flex items-center">
                //       <div className="h-3 w-3 rounded-full bg-[#7A6DFF] mr-3"></div>
                //       <div className="font-medium text-gray-900">
                //         {item.material}
                //       </div>
                //     </div>
                //   </td>
                //   <td className="px-4 py-4 whitespace-nowrap">
                //     <div className="flex items-center">
                //       <div className=" text-gray-900">G002</div>
                //     </div>
                //   </td>
                //   <td className="px-4 py-4 whitespace-nowrap">
                //     <div className="flex items-center">
                //       <div className=" text-gray-900">{item.material}</div>
                //     </div>
                //   </td>
                //   <td className="px-4 py-4 whitespace-nowrap">
                //     <div className="flex items-center">
                //       <div className=" text-gray-900">{item.name}</div>
                //     </div>
                //   </td>
                //   <td className="px-4 py-4 whitespace-nowrap">
                //     <span
                //       className={`px-2 py-1 text-xs font-medium rounded-full ${
                //         statusColors[item.status]
                //       }`}
                //     >
                //       {item.status}
                //     </span>
                //   </td>
                //   <td className="px-4 py-4 whitespace-nowrap">
                //     <span
                //       className={`font-medium ${priorityColors[item.priority]}`}
                //     >
                //       {item.priority}
                //     </span>
                //   </td>
                //   <td className="px-4 py-4 whitespace-nowrap">
                //     <div className="flex items-center">
                //       <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                //         <div
                //           className="h-2 rounded-full bg-[#7A6DFF]"
                //           style={{ width: `${item.completion}%` }}
                //         ></div>
                //       </div>
                //       <span className="text-sm text-gray-500">
                //         {item.completion}%
                //       </span>
                //     </div>
                //   </td>
                //   <td className="px-6 py-2 whitespace-nowrap">
                //     <div className="flex -space-x-2">
                //       {[...Array(Math.min(item.team, 5))].map((_, i) => (
                //         <div
                //           key={i}
                //           className="h-8 w-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700"
                //         >
                //           {i === 4 && item.team > 5
                //             ? `+${item.team - 5}`
                //             : i + 1}
                //         </div>
                //       ))}
                //     </div>
                //   </td>
                //   <td className="px-4 py-4 whitespace-nowrap text-right">
                //     <button className="text-[#7A6DFF] hover:text-[#6A5BFF] mr-3">
                //       Edit
                //     </button>
                //     <button className="text-red-500 hover:text-red-700">
                //       Delete
                //     </button>
                //   </td>
                // </tr> */}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {footer && (
          <div className="px-0 lg:px-4 pt-6 border-t border-gray-100 flex gap-8 justify-between items-center">
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
    </>
  );
}
