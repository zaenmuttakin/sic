"use client";
import Cookies from "js-cookie";
import { createContext, useEffect, useMemo, useState } from "react";
import { getUser, UseLogin, verifySession } from "../gas/sic";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [isload, setIsLoad] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    text: "",
    type: "info",
  });

  const login = async (nik, pass) => {
    setIsLoad(true);
    const loginData = await UseLogin({ nik, pass });
    if (loginData.success) {
      localStorage.setItem("nik", nik);
      Cookies.set("nik", nik);
      if (loginData.response.token) {
        Cookies.set("token", loginData.response.token);
      }
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
    setIsLoad(false);
    return loginData;
  };

  const logout = async (text) => {
    let nik = Cookies.get("nik") || localStorage.getItem("nik");
    let token = Cookies.get("token");
    console.log("logout");

    const logoutData = await UseLogout({ nik: new Number(nik), token });
    if (logoutData.success) {
      localStorage.removeItem("nik");
      localStorage.removeItem("user");
      Cookies.remove("nik");
      Cookies.remove("token");
      setUser(undefined);
      setIsAuth(false);
      window.location.href = "/";
      text && setAlert({ open: true, text, type: "info" });
    }
    return logoutData;
  };

  const checkSession = async () => {
    console.log("Checking session...");
    setIsLoad(true);
    let nik = Cookies.get("nik") || localStorage.getItem("nik");
    let token = Cookies.get("token");
    if (!nik) {
      setIsAuth(false);
      setIsLoad(false);
      return false;
    }
    const response = await verifySession({ nik: new Number(nik), token });
    console.log(response);
    !response.success && logout(response.response || "Session expired");
    setIsAuth(response.success);
    setIsLoad(false);
    return response.success;
  };

  useEffect(() => {
    checkSession();
    const interval = setInterval(checkSession, 0.5 * 60 * 1000); // Check session every 30 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const nik = localStorage.getItem("nik");
    if (isAuth) {
      async function fetchUser() {
        const userData = await getUser({ nik: new Number(nik) });
        if (userData.success) {
          localStorage.setItem("user", JSON.stringify(userData.response[0]));
          setUser(userData.response[0]);
        }
      }
      fetchUser();
    }
  }, [isAuth]);

  const authProviderValue = useMemo(
    () => ({
      user,
      login,
      logout,
      isload,
      isAuth,
      alert,
    }),
    [user, isAuth, isload, alert]
  );

  return (
    <AuthContext.Provider value={authProviderValue}>
      {children}
    </AuthContext.Provider>
  );
};
