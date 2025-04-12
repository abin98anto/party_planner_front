import { createSlice } from "@reduxjs/toolkit";
import IUser from "../../entities/IUser";
import { login, logout } from "../thunks/UserAuthServices";

interface IUserState {
  loading: boolean;
  message: string;
  error: string;
  userInfo: IUser | null;
  isAuthenticated?: boolean;
}

const initialState: IUserState = {
  loading: false,
  message: "",
  error: "",
  userInfo: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    resetUserInfo: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder

      // User/Tutor Login.
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userInfo = action.payload.data;
        state.error = "";
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // User Logout.
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.message = "";
        state.error = "";
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setUserInfo, resetUserInfo } = userSlice.actions;
export default userSlice.reducer;
