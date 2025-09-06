// "use client";
// import React, { useState } from "react";
// import TopbarMenu from "../../../components/topbar/topbar-menu";

// export default function Page() {
//   const [isOpen, setIsOpen] = useState(false);

//   const handleClose = () => setIsOpen(false);
//   return (
//     <div className="page-container">
//       {/* <TopbarMenu /> */}
//       <div className="flex gap-2 mt-2">
//         <p className="p-2 px-4 rounded-3xl bg-white">List</p>
//         <p className="p-2 px-4 pr-3 rounded-3xl bg-white/30">
//           Difference{" "}
//           <span className="ml-1 p-1 px-2 rounded-full bg-red-200 text-red-400 text-xs lg:text-sm">
//             10
//           </span>
//         </p>
//         <p className="p-2 px-4 pr-3 rounded-3xl bg-white/30 ">
//           Done {""}
//           <span className="ml-1 p-1 px-2 rounded-full bg-blue-100 text-blue-400 text-xs lg:text-sm">
//             10
//           </span>
//         </p>
//       </div>
//       <div className=" rounded-3xl bg-white p-6 h-svh"></div>
//     </div>
//   );
// }
"use client";
import { useState } from "react";
import TopbarMenu from "../../../components/topbar/topbar-menu";

export default function Page() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, title: "List", icon: "" },
    { id: 1, title: "Difference", icon: "10" },
    { id: 2, title: "Balance", icon: "80" },
    // { id: 3, title: "Contact", icon: "📞" },
  ];

  const tabContents = [
    {
      title: "Project Overview",
      description:
        "Get a comprehensive view of your project metrics and performance indicators in one place.",
      stats: [
        { value: "95%", label: "Completion" },
        { value: "24", label: "Tasks" },
        { value: "12", label: "Team" },
      ],
    },
    {
      title: "Key Features",
      description:
        "Explore the powerful features that make our product stand out from the competition.",
      features: [
        "Responsive Design",
        "Dark Mode",
        "Customizable",
        "Accessibility",
      ],
    },
    {
      title: "Pricing Plans",
      description:
        "Choose the plan that works best for your team with our flexible pricing options.",
      plans: [
        { name: "Basic", price: "$9/mo" },
        { name: "Pro", price: "$19/mo" },
        { name: "Enterprise", price: "$49/mo" },
      ],
    },
    {
      title: "Contact Us",
      description:
        "Have questions? Our team is here to help you get started with your project.",
      contact: [
        "Email: support@example.com",
        "Phone: +1 (555) 123-4567",
        "Hours: Mon-Fri 9am-5pm EST",
      ],
    },
  ];

  return (
    <div className="page-container">
      <TopbarMenu />
      <div className="max-w-4xl w-full mx-auto mt-4">
        <div className="bg-white rounded-3xl overflow-hidden ">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-200 gap-4 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center pb-4 px-1 pt-6 text-sm font-medium transition-all duration-300 ease-in-out ${
                  activeTab === tab.id
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.title}
                {tab.icon && (
                  <span className="ml-1 text-xs py-1 px-1.5 text-red-600  bg-red-100 rounded-full">
                    {tab.icon}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="transition-all duration-300 ease-in-out">
              {activeTab === 0 && (
                <div className="animate-fadeIn overflow-x-auto pb-3 rounded-2xl">
                  <table className="w-full text-sm">
                    {/* Table Head */}
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 text-left">
                        <th className="px-6 py-3 font-semibold">Material</th>
                        <th className="px-6 py-3 font-semibold">Description</th>
                        <th className="px-6 py-3 font-semibold">Bin</th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-gray-200">
                      <Tr />
                      <Tr />
                      <Tr />
                      <Tr />
                      <Tr />
                      <Tr />
                      <Tr />
                      <Tr />
                      <Tr />
                      <Tr />
                      <Tr />
                      <Tr />
                      <Tr />
                      <Tr />
                      <Tr />
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 1 && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {tabContents[1].title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {tabContents[1].description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tabContents[1].features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600">✓</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-lg font-medium text-gray-900">
                            {feature}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {tabContents[2].title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {tabContents[2].description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tabContents[2].plans.map((plan, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-6 text-center hover:-md transition-"
                      >
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {plan.name}
                        </h3>
                        <p className="text-3xl font-bold text-indigo-600 mb-4">
                          {plan.price}
                        </p>
                        <button className="w-full py-2 px-4 border border-transparent rounded-md -sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-1000">
                          Select Plan
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 3 && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {tabContents[3].title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {tabContents[3].description}
                  </p>
                  <div className="space-y-4">
                    {tabContents[3].contact.map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-indigo-600">
                          •
                        </div>
                        <div className="ml-3">
                          <p className="text-lg text-gray-900">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md -sm text-white bg-indigo-600 hover:bg-indigo-700">
                      Send Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

const Tr = () => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-[#7A6DFF] mr-3"></div>
          <div className="font-medium text-gray-900">19034270</div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className=" text-gray-900">CONECTOR AIRTAC PC 08-01</div>
        </div>
      </td>
      <td className="px-4 py-4 flex gap-1 whitespace-nowrap">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-[#7A6DFF]`}
        >
          01A1-BB3
        </span>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-[#7A6DFF]`}
        >
          01A1-BB3
        </span>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-[#7A6DFF]`}
        >
          01A1-BB3
        </span>
      </td>
    </tr>
  );
};
