import { useState } from "react";

export default function Table() {
  // Sample data for the table
  const [data, setData] = useState([
    {
      id: 1,
      material: 19004457,
      name: "Project Aurora",
      status: "Completed",
      priority: "High",
      completion: 100,
      team: 12,
    },
    {
      id: 2,
      material: 19004457,
      name: "Project Phoenix",
      status: "In Progress",
      priority: "High",
      completion: 75,
      team: 8,
    },
    {
      id: 3,
      material: 19004457,
      name: "Project Nebula",
      status: "In Progress",
      priority: "Medium",
      completion: 45,
      team: 5,
    },
    {
      id: 4,
      material: 19004457,
      name: "Project Genesis",
      status: "Planning",
      priority: "Low",
      completion: 15,
      team: 3,
    },
    {
      id: 5,
      material: 19004457,
      name: "Project Odyssey",
      status: "Completed",
      priority: "Medium",
      completion: 100,
      team: 10,
    },
  ]);

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
      <div className="max-w-6xl text-sm mx-auto bg-white rounded-xl overflow-hidden">
        {/* Table Header */}
        {/* <div className="px-4 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Project Dashboard
          </h2>
          <button className="px-4 py-2 bg-[#7A6DFF] text-white rounded-lg hover:bg-[#6A5BFF] transition-colors">
            New Project
          </button>
        </div> */}

        {/* Table Container */}
        <div className="overflow-x-auto pb-3    ">
          <table className="w-full">
            {/* Table Head */}
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-left">
                <th className="px-6 py-3 font-semibold">Material</th>
                <th className="px-6 py-3 font-semibold">Description</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Priority</th>
                <th className="px-6 py-3 font-semibold">Completion</th>
                <th className="px-6 py-3 font-semibold">Team Size</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-[#7A6DFF] mr-3"></div>
                      <div className="font-medium text-gray-900">
                        {item.material}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className=" text-gray-900">{item.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[item.status]
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`font-medium ${priorityColors[item.priority]}`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-2 rounded-full bg-[#7A6DFF]"
                          style={{ width: `${item.completion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {item.completion}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(item.team, 5))].map((_, i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700"
                        >
                          {i === 4 && item.team > 5
                            ? `+${item.team - 5}`
                            : i + 1}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <button className="text-[#7A6DFF] hover:text-[#6A5BFF] mr-3">
                      Edit
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-0 lg:px-4 pt-6 border-t border-gray-200 flex gap-8 justify-between items-center">
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
      </div>
    </>
  );
}
