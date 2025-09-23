"use client";

import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { convertToTimestamp } from "../func/isoString-toTimestamp";
import { checkUpdateReportSpp, getMonitor } from "../gas/sic";

export const MaterialdataContext = createContext();

export const MaterialDataProvider = ({ children }) => {
  const [materialData, setMaterialData] = useState([]);
  const [filteredData, setFilteredData] = useState(null);
  const [isLoadMaterialData, setIsLoadMaterialData] = useState(true);
  const [cekLs, setcekLs] = useState(false);
  const intervalRef = useRef();
  //-----func------
  const handleError = (err) => {
    setIsLoadMaterialData(false);
    console.log("Material Data Context Error");
    alert(err);
  };
  const handleGetAllData = async (times) => {
    setIsLoadMaterialData(true);
    const getData = await getMonitor({ by: false, value: null });
    !getData.success && handleError(getData.response);
    if (getData.success) {
      const resultData = { timestamp: times, ...getData.response };
      localStorage.setItem("material-data", JSON.stringify(resultData));
      setcekLs(true);
      setMaterialData(resultData);
      setIsLoadMaterialData(false);
      restartInterval();
    }
  };
  const checkForUpdate = async () => {
    console.log("checkForUpdate");
    const check = await checkUpdateReportSpp();
    !check.success && handleError();
    if (check.success) {
      const times = convertToTimestamp(check.response);
      const lsMaterialData = localStorage.getItem("material-data");
      const lsParse = JSON.parse(lsMaterialData);
      !lsParse && handleGetAllData(times);
      if (lsParse) {
        if (times != lsParse.timestamp) {
          console.log("handleGetAllData");
          console.log("times", times);
          console.log("lsTImes", lsParse.timestamp);
          handleGetAllData(times);
        } else {
          console.log("data is update");
        }
      }
    }
  };
  const startInterval = () => {
    if (intervalRef.current) return;
    checkForUpdate();
    console.log("start interval");
    intervalRef.current = setInterval(() => {
      checkForUpdate();
    }, 60000);
  };
  const stopInterval = () => {
    console.log("stop interval");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  const restartInterval = () => {
    console.log("restartInterval");
    stopInterval();
    startInterval();
  };
  //---------------
  useEffect(() => {
    isLoadMaterialData && console.log("loading..");
    !isLoadMaterialData && console.log("end loading");
  }, [isLoadMaterialData]);
  useEffect(() => {
    const ls = localStorage.getItem("material-data");
    ls && setMaterialData(JSON.parse(ls));
    ls && setIsLoadMaterialData(false);
    ls && setcekLs(true);
    restartInterval();
  }, []);
  const dataProviderValue = useMemo(
    () => ({
      materialData,
      setMaterialData,
      isLoadMaterialData,
      filteredData,
      setFilteredData,
      cekLs,
    }),
    [
      materialData,
      setMaterialData,
      isLoadMaterialData,
      filteredData,
      setFilteredData,
      cekLs,
    ]
  );
  return (
    <MaterialdataContext.Provider value={dataProviderValue}>
      {children}
    </MaterialdataContext.Provider>
  );
};
