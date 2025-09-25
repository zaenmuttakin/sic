"use client";
import PrimaryBtn from "@/components/button/primary-btn";
import Inputz from "@/components/input/input";
import { MaterialdataContext } from "@/lib/context/material-data";
import { ColorContext } from "@/lib/context/topbar-color";
import {
  faArrowsUpDown,
  faCircleNotch,
  faMagnifyingGlass,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

export function SrcCard({ isOpen, setIsOpen, valueToSrc, setValueToSrc }) {
  const [maximize, setMaximize] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cekvalue, setCekvalue] = useState(false);
  const [firstOpen, setFirstOpen] = useState(true);
  const inputRef = useRef(null);
  const router = useRouter();
  const { materialData, filteredData, setFilteredData } =
    useContext(MaterialdataContext);
  const { setTopbarColor, topColors } = useContext(ColorContext);

  useEffect(() => {
    maximize && isOpen && setTopbarColor(topColors.white);
    !maximize && isOpen && setTopbarColor(topColors.onmodal);
  }, [maximize]);

  const handleSearch = async () => {
    !materialData && alert("Not any data");
    !valueToSrc && setCekvalue(true);
    if (materialData && valueToSrc) {
      setCekvalue(false);

      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
      setValueToSrc("");
      setFilteredData(null);
      setMaximize(false);
      setIsLoading(false);
      setCekvalue(false);
      setFirstOpen(true);
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  return (
    <div className="order-first hidden relative max-h-[30rem] overflow-none p-6 bg-white rounded-3xl w-full lg:flex flex-col justify-start gap-4">
      {isOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="absolute rounded-3xl h-full w-full bg-white left-0 bottom-0 z-3 a-middle"
          >
            <p className="text-gray-400">
              <FontAwesomeIcon
                icon={faArrowsUpDown}
                className="rotate-45 mr-2"
              />{" "}
              Maximize
            </p>
          </motion.div>
        </AnimatePresence>
      )}
      <form className="flex gap-3 justify-between">
        <div className="relative flex-1" disabled={isLoading}>
          <Inputz
            type="number"
            ref={inputRef}
            placeholder="Search material here.."
            value={valueToSrc}
            style={cekvalue && "cekval"}
            onChange={(e) => setValueToSrc(e.target.value)}
            autoFocus={!isLoading}
            disabled={isLoading}
          />
          {valueToSrc && !isLoading && (
            <FontAwesomeIcon
              icon={faTimes}
              onClick={() => {
                setValueToSrc("");
              }}
              className="absolute right-4 z-2 top-1/2 -translate-y-1/2 text-gray-300 text-sm cursor-pointer bg-white p-2 hover:text-gray-400"
            />
          )}
        </div>
        <PrimaryBtn
          type="submit"
          name="maximize"
          label={
            isLoading ? (
              <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            )
          }
          onClick={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          disabled={isLoading}
        />
        {/* <GrayBtn
          type="submit"
          name="maximize"
          label={
            <FontAwesomeIcon
              icon={faArrowsUpDown}
              className="rotate-45 text-gray-500"
            />
          }
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(true);
          }}
          disabled={isLoading}
        /> */}
      </form>
    </div>
  );
}
