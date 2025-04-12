import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../config/axiosConfig";
import { AxiosError } from "axios";

export interface LoginData {
  email: string;
  password: string;
  role: string;
}

export const login = createAsyncThunk(
  "user/login",
  async (userData: LoginData, { rejectWithValue }) => {
    try {
      const result = await axiosInstance.post("/login", { userData });
      return result.data;
    } catch (error) {
      console.log("error in user login thunk", error);
      if (error instanceof AxiosError) {
        return rejectWithValue(error?.response?.data?.message);
      }
      return rejectWithValue("error in user login thunk");
    }
  }
);

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      const result = await axiosInstance.post("/logout");
      const { persistor } = await import("../store");
      persistor.purge();
      return result.data;
    } catch (error) {
      console.log("error in logout thunk", error);
      if (error instanceof AxiosError) {
        return rejectWithValue(error?.response?.data?.message);
      }
      return rejectWithValue("error in logout thunk");
    }
  }
);
