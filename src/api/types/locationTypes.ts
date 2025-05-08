import ILocation from "../../entities/ILocation";

export interface LocationRequestParams {
  page: number;
  limit: number;
  search?: string;
}

export interface LocationResponse {
  success: boolean;
  data: ILocation[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface AddLocationRequest {
  name: string;
}

export interface UpdateLocationRequest {
  _id?: string;
  name?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface LocationError {
  message: string;
}
