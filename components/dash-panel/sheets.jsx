import { faSortUp, faTable } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { openInNewWindow } from "../../lib/utils/openInNewWindow";

export function Sheets() {
  return (
    <div className="order-last lg:order-first h-full">
      <div className="h-full rounded-3xl bg-white p-6 flex flex-col gap-4">
        <p className="text-md lg:text-lg font-bold mb-2">Sheets</p>
        <Buttons
          label="Report Spp Central"
          to="https://docs.google.com/spreadsheets/d/1E4n8mtQo0_cFrWv9V6jJjt7fg6neO4UvU0XniEI2XhA/edit?gid=464926018#gid=464926018"
        />
        <Buttons
          label="Rekap Inbound"
          to="https://docs.google.com/spreadsheets/d/1cPFz9LoQDJJ12hWHJEl8mN9Ww4YRkiWSHFTiYmdZAW8/edit?gid=268613110#gid=268613110"
        />
        <Buttons
          label="Rekap Outbound"
          to="https://docs.google.com/spreadsheets/d/1cPFz9LoQDJJ12hWHJEl8mN9Ww4YRkiWSHFTiYmdZAW8/edit?gid=268613110#gid=268613110"
        />
        <Buttons
          label="Mapping"
          to="https://docs.google.com/spreadsheets/d/1RokvemuMjoBo5AmGXPgU1HalnXpew69NS3pILzGTGbc/edit?gid=1099114273#gid=1099114273"
        />
        <Buttons
          label="Rekap Tabung BGS"
          to="https://docs.google.com/spreadsheets/d/1BL8uKssA8HhFn7Oj136bz2Uj0g1hCx5JQT2retl_eYU/edit?usp=drive_link"
        />
      </div>
    </div>
  );
}

const Buttons = ({ label, to }) => {
  return (
    <button
      onClick={() => openInNewWindow(to)}
      className="flex gap-4 items-center group relative rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 p-4 w-full duration-150 cursor-pointer"
    >
      <FontAwesomeIcon
        icon={faSortUp}
        className="absolute text-3xl rotate-45 top-8 right-8 opacity-0 group-hover:opacity-100 group-hover:top-4 group-hover:right-3 text-gray-100 group-hover:text-[#7A6DFF] duration-150"
      />
      <div className="flex items-center justify-center text-white p-3 rounded-full aspect-square bg-[#7A6DFF] ">
        <FontAwesomeIcon icon={faTable} className="" />
      </div>
      <p className="text-sm font-medium lg:text-md text-left text-black group-hover:text-[#7A6DFF] duration-150 line-clamp-1 truncate pr-3">
        {label}
      </p>
    </button>
  );
};
