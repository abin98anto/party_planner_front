import axios, { AxiosInstance } from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: "https://party-planner-nodejs.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
