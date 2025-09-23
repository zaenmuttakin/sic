import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
