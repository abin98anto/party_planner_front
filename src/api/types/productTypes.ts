import ICategory from "../../entities/ICategory";
import IProduct from "../../entities/IProduct";

export interface ProductRequestParams {
  page: number;
  limit: number;
  search?: string;
}

export interface ProductResponse {
  success: boolean;
  data: IProduct[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface DeleteProductResponse {
  success: boolean;
  message: string;
}

export interface UpdateProductRequest {
  _id?: string;
  isActive?: boolean;
}

export interface CategoryResponse {
  success: boolean;
  data: ICategory[];
}

export interface ProductError {
  message: string;
}
