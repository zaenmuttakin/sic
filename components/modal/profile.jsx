import {
  faCircleNotch,
  faTimes,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { AuthContext } from "../../lib/context/auth";
import GrayBtn from "../button/gray-btn";
import Skeleton from "../skeleton/skeleton";
import ContainerModal from "./container";

export default function ProfileModal({ isOpen, setIsOpen }) {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [isload, setIsLoad] = useState(false);

  return (
    <ContainerModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      align="top"
      maxWidth="max-w-lg"
      overlayToClose={true}
    >
      <div className="flex items-center justify-between pt-6 px-6">
        <p className="font-semibold">Profile</p>
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
      <div className="flex item-center justify-center py-4 pb-0">
        <div className="w-20 aspect-square a-middle bg-indigo-100 rounded-full">
          <FontAwesomeIcon icon={faUser} className="text-3xl text-indigo-300" />
        </div>
      </div>
      <div className="p-6 pt-0 text-center ">
        {user ? (
          <div className="mb-6 p-4 text-gray-600">
            <p className="rounded-full bg-indigo-100 text-indigo-400 px-4 w-fit mx-auto mb-4">
              {user?.NICKNAME}
            </p>
            <p className="">{user?.NIK}</p>
            <p className="">{user?.NAME}</p>
            <p className="">{user?.DEPT}</p>
          </div>
        ) : (
          <div className="a-middle">
            <Skeleton
              height="h-4"
              width="w-36"
              className="mb-6 mt-4 inset-x-0 rounded-2xl"
            />
          </div>
        )}
        <GrayBtn label="Edit Profile" style="w-full mb-4" disabled={isload} />
        <GrayBtn
          label={
            isload ? (
              <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
            ) : (
              "Logout"
            )
          }
          disabled={isload}
          onClick={() => {
            setIsLoad(true);
            logout().then(() => {
              localStorage.removeItem("user");
              const queryParams = new URLSearchParams({
                alert: JSON.stringify("Logged out successfully"),
                type: JSON.stringify("info"),
              }).toString();
              router.push("/?" + queryParams);
            });
          }}
          style="bg-red-400 w-full text-white hover:bg-red-500 duration-150"
        />
      </div>
    </ContainerModal>
  );
}
