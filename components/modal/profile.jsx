import { faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { AuthContext } from "../../lib/context/auth";
import GrayBtn from "../button/gray-btn";
import ContainerModal from "./container";

export default function ProfileModal({ isOpen, setIsOpen }) {
  const { user, logout } = useContext(AuthContext);
  return (
    <ContainerModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      align="top"
      maxWidth="max-w-lg"
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
      <div className="flex item-center justify-center py-4">
        <div className="w-20 aspect-square a-middle bg-indigo-100 rounded-full">
          <FontAwesomeIcon icon={faUser} className="text-3xl text-indigo-300" />
        </div>
      </div>
      <div className="p-6 pt-0 text-center">
        <div className="mb-6 p-4 text-gray-600">
          <p className="">{user?.NIK}</p>
          <p className="">{user?.NAME}</p>
          <p className="">{user?.DEPT}</p>
        </div>
        <GrayBtn label="Edit Profile" style="w-full mb-4" />
        <GrayBtn
          label="Logout"
          onClick={logout}
          style="bg-red-400 w-full text-white hover:bg-red-500 duration-150"
        />
      </div>
    </ContainerModal>
  );
}
