import { createSlice } from "@reduxjs/toolkit";

interface LanguageState {
  currentLanguage: string;
  isOtpVerified: boolean;
}

const initialState: LanguageState = {
  currentLanguage: "en",
  isOtpVerified: false,
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("preferredLanguage", action.payload);
      }
    },
    setOtpVerified: (state, action) => {
      state.isOtpVerified = action.payload;
    },
    loadLanguageFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("preferredLanguage");
        if (saved) {
          state.currentLanguage = saved;
        }
      }
    },
  },
});

export const { setLanguage, setOtpVerified, loadLanguageFromStorage } =
  languageSlice.actions;
export const selectLanguage = (state: any) => state.language.currentLanguage;
export const selectOtpVerified = (state: any) =>
  state.language.isOtpVerified;

export default languageSlice.reducer;
