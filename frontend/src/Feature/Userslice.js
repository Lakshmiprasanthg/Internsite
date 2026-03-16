import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  admin: null,
};

export const userslice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
    adminLogin: (state, action) => {
      state.admin = action.payload || { role: "admin" };
    },
    adminLogout: (state) => {
      state.admin = null;
    },
  },
});
export const { login, logout, adminLogin, adminLogout } = userslice.actions;
export const selectuser = (state) => state.user.user;
export const selectIsAdmin = (state) => Boolean(state.user.admin);
export const selectAdmin = (state) => state.user.admin;
export default userslice.reducer;
