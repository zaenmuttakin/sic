"use client";

import Cookies from "js-cookie";
import { createContext, useEffect, useMemo, useState } from "react";
import { getUser, UseLogin, verifySession } from "../gas/sic";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [isload, setIsLoad] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const login = async (nik, pass) => {
    try {
      const loginData = await UseLogin({ nik, pass });
      if (loginData.success) {
        setIsAuth(true);
        Cookies.set("nik", nik);
        Cookies.set("token", loginData.response.token);
        return loginData;
      } else {
        return loginData;
      }
    } catch (err) {
      console.log("login error", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("nik", { path: "/" });
    Cookies.remove("token", { path: "/" });
    Cookies.remove("user", { path: "/" });
    setIsAuth(false);
  };

  useEffect(() => {
    const checkSession = async () => {
      const nik = Cookies.get("nik");
      const token = Cookies.get("token");
      console.log("[checkSession] nik:", nik, "token:", token);
      if (nik && token) {
        try {
          const res = await verifySession({ nik, token });
          console.log("[checkSession] verifySession result:", res);
          if (res && res.success) {
            setIsAuth(true);
          } else if (res && res.success === false) {
            // Only logout if backend says session is invalid
            logout();
          } else {
            // Do not logout on error or unexpected response
            console.warn("[checkSession] Unexpected response, not logging out");
          }
        } catch (err) {
          console.error("[checkSession] verifySession error:", err);
          // Do not logout on error
        }
      } else {
        setIsAuth(false);
        setUser(null);
      }
      setIsLoad(false);
    };

    // Get user from cookies
    const userCookies = Cookies.get("user");
    if (userCookies) setUser(JSON.parse(userCookies));

    checkSession();
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const nik = Cookies.get("nik");
    if (isAuth) {
      async function fetchUser() {
        const userData = await getUser({ nik: new Number(nik) });
        if (userData.success) {
          Cookies.set("user", JSON.stringify(userData.response[0]));
          setUser(userData.response[0]);
        }
      }
      fetchUser();
    }
  }, [isAuth]);

  const authProviderValue = useMemo(() => ({
    user,
    login,
    logout,
    isload,
    isAuth,
  }));

  return (
    <AuthContext.Provider value={authProviderValue}>
      {children}
    </AuthContext.Provider>
  );
};
