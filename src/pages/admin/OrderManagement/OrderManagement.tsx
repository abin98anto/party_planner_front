/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import "./OrderManagement.scss";
import ICategory from "../../../entities/ICategory";
import IProvider from "../../../entities/IProvider";
import ILocation from "../../../entities/ILocation";
import axiosInstance from "../../../config/axiosConfig";

interface Product {
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
interface SelectedProduct {
  productId: Product;
  selectedDates: Date[];
  locationId: ILocation;
}

interface Order {
  _id: string;
  userId: string;
  productIds: SelectedProduct[];
  providerIds: string[];
  amount: number;
  address: string;
  status: "PENDING" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
  totalPages: number;
  currentPage: number;
  totalOrders: number;
}

type OrderStatus = "ALL" | "PENDING" | "CANCELLED" | "COMPLETED";

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [status, setStatus] = useState<OrderStatus>("ALL");
  const [itemsPerPage] = useState<number>(8);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, status, itemsPerPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (status !== "ALL") {
        queryParams.append("status", status);
      }

      const response = await axiosInstance.get<OrdersResponse>(
        `/order?${queryParams}`
      );

      if (response.data.success) {
        setOrders(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalOrders(response.data.totalOrders);
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching orders"
      );
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    setStatus(newStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Format date to be more readable
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Generate pagination array
  const generatePaginationArray = (): number[] => {
    const delta = 2; // Number of pages to show before and after current page
    const range: number[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Add first and last page
    if (currentPage - delta > 2) {
      range.unshift(-1); // Ellipsis indicator
    }
    if (totalPages > 1) {
      range.unshift(1);
    }

    if (currentPage + delta < totalPages - 1) {
      range.push(-1); // Ellipsis indicator
    }
    if (totalPages > 1 && !range.includes(totalPages)) {
      range.push(totalPages);
    }

    return range;
  };

  return (
    <div className="order-management">
      <div className="order-container">
        <div className="header">
          <h1>Order Management</h1>

          <div className="filter-buttons">
            <button
              className={`filter-button ${status === "ALL" ? "active" : ""}`}
              onClick={() => handleStatusChange("ALL")}
            >
              All Orders
            </button>
            <button
              className={`filter-button ${
                status === "PENDING" ? "active" : ""
              }`}
              onClick={() => handleStatusChange("PENDING")}
            >
              Pending
            </button>
            <button
              className={`filter-button ${
                status === "COMPLETED" ? "active" : ""
              }`}
              onClick={() => handleStatusChange("COMPLETED")}
            >
              Completed
            </button>
            <button
              className={`filter-button ${
                status === "CANCELLED" ? "active" : ""
              }`}
              onClick={() => handleStatusChange("CANCELLED")}
            >
              Cancelled
            </button>
          </div>
        </div>

        {loading ? (
          <div className="no-data-placeholder">
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="no-data-placeholder">
            <p>Error: {error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="no-data-placeholder">
            <p>No orders found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order._id.substring(0, 8)}</td>
                      <td>{order.userId.substring(0, 8)}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>${order.amount.toFixed(2)}</td>
                      <td>{order.productIds.length}</td>
                      <td>
                        <span
                          className={`status-badge ${order.status.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="address-cell">{order.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>

                {generatePaginationArray().map((page, index) =>
                  page === -1 ? (
                    <span key={`ellipsis-${index}`} className="ellipsis">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`pagination-btn ${
                        currentPage === page ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}

            <div className="order-count">
              Showing {orders.length} of {totalOrders} orders
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
