import { faSortUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "../../lib/context/auth";
import Skeleton from "../skeleton/skeleton";

export default function MenuItem({ to, title, icon }) {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  return (
    <button
      onClick={() => router.push(to)}
      disabled={user ? false : true}
      className="group relative rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 p-4 lg:p-6 pt-6 lg:pt-10 lg:w-42 max-w-42 duration-150 cursor-pointer disabled:cursor-not-allowed "
    >
      <FontAwesomeIcon
        icon={faSortUp}
        className="absolute text-3xl rotate-45 top-8 right-8 group-hover:top-4 group-hover:right-3 text-indigo-50/10 group-hover:text-[#7A6DFF] duration-150 "
        disabled={user ? false : true}
      />
      {user ? (
        <div className="flex items-center justify-center text-white mb-4 p-3 rounded-full aspect-square bg-[#7A6DFF] w-12 lg:w-14">
          <FontAwesomeIcon icon={icon} className="text-xl lg:text-2xl" />
        </div>
      ) : (
        <Skeleton
          width="w-12"
          height="h-12"
          className="lg:w-14 lg:h-14 rounded-full mb-4"
        />
      )}
      <div className="text-sm font-medium lg:text-md text-left text-black group-hover:text-[#7A6DFF] duration-150">
        {user ? (
          <span>{title}</span>
        ) : (
          <Skeleton width="w-24" height="h-4" className="lg:w-32 rounded-2xl" />
        )}
      </div>
    </button>
  );
}
