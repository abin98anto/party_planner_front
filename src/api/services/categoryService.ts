import axiosInstance from "../../config/axiosConfig";
import {
  AddCategoryRequest,
  CategoryRequestParams,
  CategoryResponse,
  UpdateCategoryRequest,
} from "../types/categoryTypes";

export const getAllCategories = async (
  params: CategoryRequestParams
): Promise<CategoryResponse | null> => {
  try {
    const response = await axiosInstance.get("/category", {
      params,
    });
    return response.data;
  } catch (error) {
    console.log("error fetching categories", error);
    return null;
  }
};

export const addCategory = async (
  data: AddCategoryRequest
): Promise<boolean | void> => {
  try {
    const response = await axiosInstance.post("/category/add", data, {
      withCredentials: true,
    });
    return response.status === 200;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to add category");
  }
};

export const updateCategory = async (
  data: UpdateCategoryRequest
): Promise<boolean | void> => {
  try {
    const response = await axiosInstance.put("/category/update", data, {
      withCredentials: true,
    });

    return response.status === 200;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update category"
    );
  }
};
