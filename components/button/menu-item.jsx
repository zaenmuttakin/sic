import { faSortUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";

export default function MenuItem({ to, title, icon }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(to)}
      className="group relative rounded-2xl bg-indigo-50/50 hover:bg-[#7A6DFF20] p-4 lg:p-6 pt-6 lg:pt-10 lg:w-42 max-w-42 duration-100 cursor-pointer"
    >
      <FontAwesomeIcon
        icon={faSortUp}
        className="absolute text-3xl rotate-45 top-8 right-8 group-hover:top-4 group-hover:right-3 text-gray-100 group-hover:text-[#7A6DFF] duration-100"
      />
      <div className="flex items-center justify-center text-white mb-4 p-3 rounded-full aspect-square bg-[#7A6DFF] w-12 lg:w-14">
        <FontAwesomeIcon icon={icon} className="text-xl lg:text-2xl" />
      </div>
      <p className="text-sm font-medium lg:text-md text-left text-black group-hover:text-[#7A6DFF] duration-100">
        {title}
      </p>
    </button>
  );
}
