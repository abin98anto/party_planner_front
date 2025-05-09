import axiosInstance from "../../config/axiosConfig";
import { OrderRequestParams, OrderResponse } from "../types/orderTypes";

export const getAllOrders = async (
  params: OrderRequestParams
): Promise<OrderResponse> => {
  try {
    const response = await axiosInstance.get<OrderResponse>("/order", {
      params,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch orders");
  }
};
