import {
  faChevronLeft,
  faRotate,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";

export default function TopbarMenu() {
  const router = useRouter();
  return (
    <div className="flex items-start justify-center w-full ">
      <div className="flex gap-2 lg:gap-4 justify-start py-1 px-O items-center w-full max-w-4xl rounded-3xl">
        <div className="flex items-center justify-center w-13 lg:w-13 aspect-square rounded-3xl bg-white">
          <FontAwesomeIcon onClick={() => router.back()} icon={faChevronLeft} />
        </div>
        {/* <div className="flex-1"></div> */}
        <p className="order-last py-3 lg:py-3 rounded-3xl text-center px-4 bg-[#7A6DFF] text-white font-medium flex-1 line-clamp-1 truncate">
          25 Aug 2025
        </p>
        {/* <div className="flex-1"></div> */}
        <div className="flex items-center justify-center w-13 lg:w-13 aspect-square rounded-3xl  bg-white ">
          <FontAwesomeIcon icon={faSearch} />
        </div>
        <div className="flex items-center justify-center w-13 lg:w-13 aspect-square rounded-3xl  bg-white ">
          <FontAwesomeIcon icon={faRotate} />
        </div>
      </div>
    </div>
  );
}
