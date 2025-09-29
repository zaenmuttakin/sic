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
    Cookies.remove("nik");
    Cookies.remove("token");
    Cookies.remove("user");
    setIsAuth(false);
    window.location.reload();
  };

  useEffect(() => {
    const checkSession = async () => {
      const nik = Cookies.get("nik");
      const token = Cookies.get("token");
      if (nik && token) {
        try {
          const verify = await verifySession({ nik, token });
          verify.success && setIsAuth(true);
          !verify.success && logout();
        } catch (err) {
          console.log(err);
          logout();
        }
      }
      setIsLoad(false);
    };
    //------------ get user from cookies -----------
    const userCookies = Cookies.get("user");
    userCookies && setUser(JSON.parse(userCookies));
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
