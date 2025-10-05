"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useEffect, useMemo, useState } from "react";

const protectedRoutes = ["private", "try"];
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const pathname = usePathname();
  const basePath = pathname.split("/")[1];
  const isProtectedRoute = protectedRoutes.includes(basePath);
  const router = useRouter();
  const [user, setUser] = useState();
  const [isload, setIsLoad] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    text: "",
    type: "info",
  });

  const login = async (nik, pass) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nik, pass }),
    });
    return await response.json();
  };

  const logout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });
    return await response.json();
  };
  // const logout = async (text) => {
  //   let nik = Cookies.get("nik") || localStorage.getItem("nik");
  //   let token = Cookies.get("token");
  //   console.log("logout");

  //   const logoutData = await UseLogout({ nik: new Number(nik), token });
  //   if (logoutData.success) {
  //     localStorage.removeItem("nik");
  //     localStorage.removeItem("user");
  //     Cookies.remove("nik");
  //     Cookies.remove("token");
  //     setUser(undefined);
  //     setIsAuth(false);
  //     window.location.href = "/";
  //     text && setAlert({ open: true, text, type: "info" });
  //   }
  //   return logoutData;
  // };

  // const checkSession = async () => {
  //   console.log("Checking session...");
  //   setIsLoad(true);
  //   let nik = Cookies.get("nik") || localStorage.getItem("nik");
  //   let token = Cookies.get("token");
  //   if (!nik) {
  //     setIsAuth(false);
  //     setIsLoad(false);
  //     return false;
  //   }
  //   const response = await verifySession({ nik: new Number(nik), token });
  //   console.log(response);
  //   !response.success && logout(response.response || "Session expired");
  //   setIsAuth(response.success);
  //   setIsLoad(false);
  //   return response.success;
  // };

  const checkSession = async () => {
    const response = await fetch("/api/auth/session");
    return await response.json();
  };

  const getUserData = async () => {
    const response = await fetch("/api/auth/user");
    return await response.json();
  };

  useEffect(() => {
    checkSession().then((res) => {
      console.log("Session check:", res);
      setIsAuth(res.authenticated);
      !res.authenticated &&
        isProtectedRoute &&
        logout().then(() => {
          localStorage.removeItem("user");
          const queryParams = new URLSearchParams({
            alert: JSON.stringify("Invalid or expired session"),
            type: JSON.stringify("error"),
          }).toString();
          router.push("/?" + queryParams);
        });
    });
    const interval = setInterval(checkSession, 0.2 * 60 * 1000); // Check session every 30 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      setUser(JSON.parse(localUser));
      setIsLoad(false);
    }
    isAuth &&
      getUserData().then((res) => {
        console.log("User data:", res);
        setUser(res.user[0]);
        localStorage.setItem("user", JSON.stringify(res.user[0]));
        setIsLoad(false);
      });
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
