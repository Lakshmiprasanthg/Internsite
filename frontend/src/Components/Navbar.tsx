import React from "react";
import logo from "../Assets/67_human_logo.jpg";
import Link from "next/link";
import { auth, provider } from "../firebase/firebase";
import { Search } from "lucide-react";
import { signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout, logout, selectIsAdmin, selectuser } from "@/Feature/Userslice";
interface User {
  name: string;
  email: string;
  photo: string;
}
const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectuser);
  const isAdmin = useSelector(selectIsAdmin);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const handlelogin = async () => {
    if (isGoogleLoading) {
      return;
    }

    try {
      setIsGoogleLoading(true);
      await signInWithPopup(auth, provider);
      toast.success("logged in successfully");
    } catch (error: any) {
      console.error(error);

      const errorCode = error?.code;

      if (errorCode === "auth/cancelled-popup-request") {
        return;
      }

      if (errorCode === "auth/popup-closed-by-user") {
        toast.info("Google sign-in popup was closed");
        return;
      }

      if (errorCode === "auth/popup-blocked") {
        toast.info("Popup blocked. Redirecting to Google sign-in...");
        await signInWithRedirect(auth, provider);
        return;
      }

      toast.error("login failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };
  const handlelogout = async () => {
    try {
      if (isAdmin) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("isAdminLoggedIn");
        }
        dispatch(adminLogout());
      }

      if (user) {
        await signOut(auth);
        dispatch(logout());
        toast.success("logged out successfully");
        return;
      }

      if (isAdmin) {
        toast.success("admin logged out successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("logout failed");
    }
  };
  return (
    <div className="relative">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2 group">
                <img 
                  src={logo.src} 
                  alt="InternSite Logo" 
                  className="w-12 h-12 object-contain transition-all duration-300 group-hover:scale-110"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  InternSite
                </span>
              </Link>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href={"/internship"} className="relative text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 group">
                <span>Internships</span>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href={"/job"} className="relative text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 group">
                <span>Jobs</span>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 hover:border-blue-300 transition-colors duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  className="ml-2 bg-transparent focus:outline-none text-sm w-52 text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link href={"/profile"} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="w-10 h-10 rounded-full ring-2 ring-blue-100 hover:ring-blue-300 transition-all duration-200"
                    />
                  </Link>
                  <button
                    className="px-5 py-2.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all duration-200"
                    onClick={handlelogout}
                  >
                    Logout
                  </button>
                </div>
              ) : isAdmin ? (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/adminpanel"
                    className="px-5 py-2.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl font-medium transition-all duration-200"
                  >
                    Admin Panel
                  </Link>
                  <button
                    className="px-5 py-2.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all duration-200"
                    onClick={handlelogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handlelogin}
                    disabled={isGoogleLoading}
                    className="bg-white border-2 border-gray-200 rounded-xl px-5 py-2.5 flex items-center space-x-2 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md group"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">
                      {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
                    </span>
                  </button>
                  <Link
                    href="/adminlogin"
                    className="px-5 py-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl font-medium transition-all duration-200"
                  >
                    Login as Admin
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
