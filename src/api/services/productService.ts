import axiosInstance from "../../config/axiosConfig";
import {
  ProductRequestParams,
  ProductResponse,
  DeleteProductResponse,
  UpdateProductRequest,
  CategoryResponse,
} from "../types/productTypes";

export const getAllProducts = async (
  params: ProductRequestParams
): Promise<ProductResponse> => {
  try {
    const response = await axiosInstance.get<ProductResponse>("/product", {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch products"
    );
  }
};

export const deleteProduct = async (
  productId: string
): Promise<DeleteProductResponse> => {
  try {
    const response = await axiosInstance.delete<DeleteProductResponse>(
      `/product/${productId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete product"
    );
  }
};

export const updateProduct = async (
  data: UpdateProductRequest
): Promise<void> => {
  try {
    await axiosInstance.put("/product/update", data, { withCredentials: true });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update product"
    );
  }
};

export const fetchCategories = async (): Promise<CategoryResponse> => {
  try {
    const response = await axiosInstance.get<CategoryResponse>("/category", {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch categories"
    );
  }
};
