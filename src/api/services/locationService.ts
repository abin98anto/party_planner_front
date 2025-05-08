import axiosInstance from "../../config/axiosConfig";
import {
  AddLocationRequest,
  LocationRequestParams,
  LocationResponse,
  UpdateLocationRequest,
} from "../types/locationTypes";

export const getAllLocations = async (
  params: LocationRequestParams
): Promise<LocationResponse> => {
  try {
    const response = await axiosInstance.get<LocationResponse>("/location", {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch locations"
    );
  }
};

export const addLocation = async (data: AddLocationRequest): Promise<void> => {
  try {
    await axiosInstance.post("/location/add", data, { withCredentials: true });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to add location");
  }
};

export const updateLocation = async (
  data: UpdateLocationRequest
): Promise<void> => {
  try {
    await axiosInstance.put("/location/update", data, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update location"
    );
  }
};
