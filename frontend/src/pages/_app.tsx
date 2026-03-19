import Footer from "@/Components/Fotter";
import Navbar from "@/Components/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "../store/store";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { auth } from "@/firebase/firebase";
import {
  adminLogin,
  adminLogout,
  login,
  logout,
  selectIsAdmin,
  selectuser,
} from "@/Feature/Userslice";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/router";

const ADMIN_ONLY_ROUTES = [
  "/adminpanel",
  "/applications",
  "/postJob",
  "/postInternship",
  "/users",
  "/analytics",
  "/settings",
  "/detailapplication/[id]",
];

function RouteAccessGuard() {
  const router = useRouter();
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectuser);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.includes(router.pathname);

    if (isAdminOnlyRoute && !isAdmin) {
      if (user) {
        router.replace("/");
      } else {
        router.replace("/adminlogin");
      }
      return;
    }

    if (router.pathname === "/adminlogin" && user && !isAdmin) {
      router.replace("/");
    }
  }, [router, isAdmin, user]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  function AuthListener() {
    const dispatch = useDispatch();
    useEffect(() => {
      if (typeof window !== "undefined") {
        const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
        if (isAdminLoggedIn) {
          dispatch(adminLogin({ role: "admin" }));
        } else {
          dispatch(adminLogout());
        }
      }

      const unsubscribe = auth.onAuthStateChanged((authuser) => {
        if (authuser) {
          dispatch(
            login({
              uid: authuser.uid,
              photo: authuser.photoURL,
              name: authuser.displayName,
              email: authuser.email,
              phoneNumber: authuser.phoneNumber,
            })
          );
        } else {
          dispatch(logout());
        }
      });

      return () => unsubscribe();
    }, [dispatch]);
    return null;
  }

  return (
    <Provider store={store}>
      <AuthListener />
      <RouteAccessGuard />
      <div className="bg-white">
        <ToastContainer/>
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </div>
    </Provider>
  );
}
