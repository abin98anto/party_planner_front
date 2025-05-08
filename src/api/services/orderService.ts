import axiosInstance from "../../config/axiosConfig";
import { OrderRequestParams, OrderResponse } from "../types/orderTypes";

export const fetchOrders = async (
  params: OrderRequestParams
): Promise<OrderResponse> => {
  try {
    const response = await axiosInstance.get<OrderResponse>("/order", {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch orders");
  }
};
