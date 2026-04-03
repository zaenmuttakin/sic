import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import Inputz from "./input";

export default function SeacrhForm({
  isOpen,
  setIsOpen,
  valueToSrc,
  setValueToSrc,
  cekvalue,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        inputRef.current && inputRef.current.blur();
      }}
      className="flex gap-3 justify-between bg-white w-full rounded-2xl "
    >
      <div className="relative flex-1" disabled={isLoading}>
        <Inputz
          type="text"
          ref={inputRef}
          placeholder="Cari dengan MID / Description"
          value={valueToSrc}
          style={`${cekvalue && "cekval"}  focus:border-indigo-400/80 `}
          onChange={(e) => setValueToSrc(e.target.value)}
          autoFocus={true}
          disabled={isLoading}
        />
        {valueToSrc && !isLoading && (
          <FontAwesomeIcon
            icon={faTimes}
            onClick={() => {
              setValueToSrc("");
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm cursor-pointer bg-white p-2 hover:text-indigo-400"
          />
        )}
      </div>
    </form>
  );
}
