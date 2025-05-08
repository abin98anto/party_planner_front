import ICategory from "../../entities/ICategory";

export interface CategoryRequestParams {
  page: number;
  limit: number;
  search?: string;
}

export interface CategoryResponse {
  success: boolean;
  data: ICategory[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface AddCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  _id?: string;
  name?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}
