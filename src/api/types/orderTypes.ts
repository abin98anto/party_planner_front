import ICategory from "../../entities/ICategory";
import ILocation from "../../entities/ILocation";
import IProvider from "../../entities/IProvider";
import IUser from "../../entities/IUser";

export interface Product {
  _id: string;
  name: string;
  description: string;
  categoryId: ICategory;
  providerId: IProvider;
  images: string[];
  price: number;
  datesAvailable: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SelectedProduct {
  productId: Product;
  selectedDates: Date[];
  locationId: ILocation;
}

export interface Order {
  _id: string;
  userId: IUser;
  productIds: SelectedProduct[];
  providerIds: string[];
  amount: number;
  address: string;
  status: "PENDING" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface OrderRequestParams {
  page: number;
  limit: number;
  status?: "PENDING" | "CANCELLED" | "COMPLETED";
  search?: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order[];
  pagination: {
    totalOrders: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface OrderError {
  message: string;
}
