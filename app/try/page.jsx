// "use client";
// import { useState } from "react";

import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// export default function AwesomeListCard() {
//   const [selectedItem, setSelectedItem] = useState(null);

//   // Sample data - in a real app this would come from props or API
//   const items = [
//     {
//       id: 1,
//       mid: "15000137",
//       description: "CAT Kansai Paint KF 38 MEDIUM GREY 1KG",
//       locations: ["01A1-AI1", "01A1-AI2", "01A1-AI3"],
//       date: "2 hours ago",
//       status: "In Stock",
//       statusColor: "bg-green-100 text-green-800",
//     },
//     {
//       id: 2,
//       mid: "15000138",
//       description: "CAT Kansai Paint KF 39 LIGHT GREY 1KG",
//       locations: ["01A1-BI1", "01A1-BI2"],
//       date: "5 hours ago",
//       status: "Low Stock",
//       statusColor: "bg-yellow-100 text-yellow-800",
//     },
//     {
//       id: 3,
//       mid: "15000139",
//       description: "CAT Kansai Paint KF 40 DARK GREY 1KG",
//       locations: ["01A1-CI1", "01A1-CI2", "01A1-CI3", "01A1-CI4"],
//       date: "Yesterday",
//       status: "Out of Stock",
//       statusColor: "bg-red-100 text-red-800",
//     },
//     {
//       id: 4,
//       mid: "15000140",
//       description: "CAT Kansai Paint KF 41 WHITE 1KG",
//       locations: ["01A1-DI1"],
//       date: "2 days ago",
//       status: "On Order",
//       statusColor: "bg-blue-100 text-blue-800",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-8">
//           <h1 className="text-2xl font-bold text-gray-900">
//             Material Inventory
//           </h1>
//           <p className="text-gray-600 mt-2">
//             Browse your materials and their locations
//           </p>
//         </div>

//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           {/* Header */}
//           <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//               />
//               <div className="ml-4 flex space-x-2">
//                 <button className="p-2 rounded hover:bg-gray-200">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5 text-gray-500"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//             <div className="flex space-x-2">
//               <button className="p-2 rounded hover:bg-gray-200">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5 text-gray-500"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//                   />
//                 </svg>
//               </button>
//               <button className="p-2 rounded hover:bg-gray-200">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5 text-gray-500"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* List Items */}
//           <div className="divide-y divide-gray-200">
//             {items.map((item) => (
//               <div
//                 key={item.id}
//                 className={`px-6 py-4 transition-colors duration-200 ${
//                   selectedItem === item.id ? "bg-indigo-50" : "hover:bg-gray-50"
//                 }`}
//                 onClick={() =>
//                   setSelectedItem(item.id === selectedItem ? null : item.id)
//                 }
//               >
//                 <div className="flex items-start">
//                   <input
//                     type="checkbox"
//                     className="h-4 w-4 mt-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                   />

//                   <div className="ml-4 flex-1">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center">
//                         <span className="text-sm font-medium text-gray-900">
//                           MID: {item.mid}
//                         </span>
//                         <span
//                           className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.statusColor}`}
//                         >
//                           {item.status}
//                         </span>
//                       </div>
//                       <span className="text-xs text-gray-500">{item.date}</span>
//                     </div>

//                     <h3 className="mt-1 text-lg font-semibold text-gray-900">
//                       {item.description}
//                     </h3>

//                     <div className="mt-2 flex flex-wrap items-center">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-4 w-4 text-gray-400 mr-1"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                         />
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                         />
//                       </svg>
//                       <span className="text-sm text-gray-600 mr-2">
//                         Locations:
//                       </span>
//                       {item.locations.map((location, index) => (
//                         <span
//                           key={index}
//                           className="text-sm font-medium text-[#7A6DFF] bg-indigo-100 px-2 py-0.5 rounded mr-2 mb-1"
//                         >
//                           {location}
//                         </span>
//                       ))}
//                     </div>

//                     {selectedItem === item.id && (
//                       <div className="mt-4 pt-4 border-t border-gray-200">
//                         <div className="flex space-x-4">
//                           <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-4 w-4 mr-1"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                               />
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M2 15.5v-11a2 2 0 012-2h16a2 2 0 012 2v11a2 2 0 01-2 2h-6.5l-3 3-3-3H4a2 2 0 01-2-2z"
//                               />
//                             </svg>
//                             View Details
//                           </button>
//                           <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-4 w-4 mr-1"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                               />
//                             </svg>
//                             Edit
//                           </button>
//                           <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-4 w-4 mr-1"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
//                               />
//                             </svg>
//                             Copy
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <div className="ml-4 flex items-start">
//                     <button className="p-1 text-gray-400 hover:text-gray-600">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-5 w-5"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
//                         />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Mobile Floating Button */}
//         <div className="md:hidden fixed bottom-6 right-6">
//           <button className="p-4 rounded-full bg-[#7A6DFF] shadow-lg text-white">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-6 w-6"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//               />
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function page() {
  return (
    <div className="h-svh w-full a-middle">
      <FontAwesomeIcon
        icon={faCircleNotch}
        className="text-indigo-400 text-4xl animate-spin"
      />
    </div>
  );
}
