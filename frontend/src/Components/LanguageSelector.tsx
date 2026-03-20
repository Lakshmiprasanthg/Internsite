import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage, selectLanguage } from "@/Feature/Languageslice";
import { selectuser } from "@/Feature/Userslice";
import axios from "axios";
import { API_BASE_URL } from "@/lib/apiBase";
import { Globe, X } from "lucide-react";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "hi", name: "हिंदी" },
  { code: "pt", name: "Português" },
  { code: "zh", name: "中文" },
  { code: "fr", name: "Français" },
];

const LanguageSelector = () => {
  const dispatch = useDispatch();
  const currentLanguage = useSelector(selectLanguage);
  const user = useSelector(selectuser);
  const [isOpen, setIsOpen] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const currentLangName =
    languages.find((lang) => lang.code === currentLanguage)?.name || "English";

  const handleLanguageSelect = (langCode: string) => {
    if (langCode === currentLanguage) {
      setIsOpen(false);
      return;
    }

    if (!user?.email) {
      alert("Please login first to change language");
      setIsOpen(false);
      return;
    }

    setSelectedLanguage(langCode);
    setShowOtpModal(true);
    setIsOpen(false);
    setError("");
    setOtp("");
    setOtpSent(false);
  };

  const sendOtp = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/otp/send`, {
        email: user.email,
      });

      if (response.data.success) {
        setOtpSent(true);
        setResendTimer(300); // 5 minutes
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!user?.email || !selectedLanguage || !otp) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/otp/verify`, {
        email: user.email,
        otp,
      });

      if (response.data.success) {
        dispatch(setLanguage(selectedLanguage));
        setShowOtpModal(false);
        setOtp("");
        setOtpSent(false);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to verify OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Timer for resend button
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  return (
    <>
      <div className="relative">
        {/* Language Selector Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
          title="Change language"
        >
          <Globe size={18} />
          <span className="text-sm">{currentLangName}</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`w-full text-left px-4 py-2 rounded-md transition ${
                    lang.code === currentLanguage
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && selectedLanguage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                Verify Email for{" "}
                {languages.find((l) => l.code === selectedLanguage)?.name}
              </h2>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                  setError("");
                  setOtpSent(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm">
                A verification code has been sent to:
              </p>
              <p className="font-semibold text-gray-800">{user?.email}</p>

              {!otpSent && (
                <>
                  <p className="text-gray-700 text-sm">
                    Click the button below to receive a verification code.
                  </p>
                  <button
                    onClick={sendOtp}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                  >
                    {isLoading ? "Sending..." : "Send Verification Code"}
                  </button>
                </>
              )}

              {otpSent && (
                <>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Enter Verification Code
                    </label>
                    <input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                      maxLength={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-center text-lg tracking-widest"
                    />
                    <p className="text-xs text-gray-500">
                      Code expires in 10 minutes
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={verifyOtp}
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                  >
                    {isLoading ? "Verifying..." : "Verify and Change Language"}
                  </button>

                  <button
                    onClick={sendOtp}
                    disabled={isLoading || resendTimer > 0}
                    className="w-full text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition text-sm py-2"
                  >
                    {resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : "Resend Code"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LanguageSelector;
