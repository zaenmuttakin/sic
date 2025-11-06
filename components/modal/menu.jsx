import {
  faChevronDown,
  faChevronUp,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GrayBtn from "../button/gray-btn";
import ContainerModal from "./container";

const listContent = [
  { label: "Dashboard", link: "/private" },
  {
    label: "Menu",
    link: "",
    submenu: [
      { sublabel: "Stock Opname", sublink: "/private/so", newtab: false },
      {
        sublabel: "Material Data",
        sublink: "/private/material-data",
        newtab: false,
      },
      { sublabel: "Mapping", sublink: "/private/mapping", newtab: false },
      { sublabel: "Report", sublink: "/not-available", newtab: false },
      {
        sublabel: "Selisih SO Internal",
        sublink: "/not-available",
        newtab: false,
      },
      {
        sublabel: "Rekap Tabung BSG",
        sublink: "/not-available",
        newtab: false,
      },
    ],
  },
  {
    label: "Sheets",
    link: "",
    submenu: [
      {
        sublabel: "Report Spp Central",
        sublink:
          "https://docs.google.com/spreadsheets/d/1E4n8mtQo0_cFrWv9V6jJjt7fg6neO4UvU0XniEI2XhA/",
        newtab: true,
      },
      {
        sublabel: "Rekap Inbound",
        sublink:
          "https://docs.google.com/spreadsheets/d/1cPFz9LoQDJJ12hWHJEl8mN9Ww4YRkiWSHFTiYmdZAW8/edit?gid=268613110#gid=268613110",
        newtab: true,
      },
      {
        sublabel: "Rekap Outbound",
        sublink:
          "https://docs.google.com/spreadsheets/d/1Z6H087xIGJ5yEES0LCvpDREXKnMeP0U_0XU5l3CNe5o/edit?gid=0#gid=0",
        newtab: true,
      },
      {
        sublabel: "Mapping",
        sublink:
          "https://docs.google.com/spreadsheets/d/1RokvemuMjoBo5AmGXPgU1HalnXpew69NS3pILzGTGbc/edit?gid=1099114273#gid=1099114273",
        newtab: true,
      },
      {
        sublabel: "Rekap Tabung BSG",
        sublink:
          "https://docs.google.com/spreadsheets/d/1BL8uKssA8HhFn7Oj136bz2Uj0g1hCx5JQT2retl_eYU/edit?gid=436421903#gid=436421903",
        newtab: true,
      },
      {
        sublabel: "Consumable",
        sublink:
          "https://docs.google.com/spreadsheets/d/1kPPrL23cp_HLV0MQgiJyF4jiS7KEC3er1EThIrMPLqo/edit?gid=0#gid=0",
        newtab: true,
      },
    ],
  },
  { label: "About", link: "/not-available" },
  { label: "Profile", link: "/not-available" },
];

export default function MenuModal({ isOpen, setIsOpen }) {
  const [openIndex, setOpenIndex] = useState(null);
  const router = useRouter();
  const handleToggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <ContainerModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      align="top"
      overlayToClose={true}
    >
      <div className="flex items-center justify-between pt-6 px-6">
        <p className="font-semibold">List Of Content</p>
        <GrayBtn
          type="submit"
          style="bg-white w-10"
          onClick={() => {
            setIsOpen(false);
          }}
          label={
            <FontAwesomeIcon icon={faTimes} className="text-lg text-gray-500" />
          }
        />
      </div>

      <div className="p-6 flex flex-col">
        <AnimatePresence>
          {listContent.map((item, i) => (
            <div key={i}>
              <button
                type="button"
                className="w-full py-1 flex justify-between items-center mb-1 focus:outline-none"
                onClick={() =>
                  item.submenu ? handleToggle(i) : router.push(item.link)
                }
              >
                <span>{item.label}</span>
                {item.submenu && (
                  <FontAwesomeIcon
                    icon={openIndex === i ? faChevronUp : faChevronDown}
                    className="text-sm text-gray-400"
                  />
                )}
              </button>
              {item.submenu && openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -10 }}
                  animate={{ height: "100%", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -10 }}
                  className="p-6 bg-gray-100 rounded-2xl mb-3"
                >
                  {item.submenu.map((subitem, j) => (
                    <p
                      key={j}
                      onClick={() =>
                        subitem.newtab
                          ? window.open(subitem.sublink, "_blank")
                          : router.push(subitem.sublink)
                      }
                      className="text-gray-500 py-1"
                    >
                      {subitem.sublabel}
                    </p>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ContainerModal>
  );
}
