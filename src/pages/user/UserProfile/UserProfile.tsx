/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import "./UserProfile.scss";
import ILocation from "../../../entities/ILocation";
import axiosInstance from "../../../config/axiosConfig";
import ICategory from "../../../entities/ICategory";
import IProvider from "../../../entities/IProvider";
import { useAppSelector } from "../../../hooks/reduxHooks";

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

type OrderCategory = "upcoming" | "completed" | "cancelled";

const UserProfile: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<OrderCategory>("upcoming");
  const { userInfo } = useAppSelector((state) => state.user);
  const userId = userInfo?._id;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await axiosInstance.get(`/order/${userId}`);
      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch orders");
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

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await axiosInstance.put(`/order/update/${orderId}`, {
        status: "CANCELLED",
      });

      if (response.data.success) {
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, status: "CANCELLED" } : order
          )
        );
      } else {
        throw new Error(response.data.message || "Failed to cancel order");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while cancelling the order"
      );
      console.error("Error cancelling order:", err);
    }
  };

  const getFilteredOrders = (): Order[] => {
    switch (activeCategory) {
      case "upcoming":
        return orders
          .filter((order) => order.status === "PENDING")
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
      case "completed":
        return orders.filter((order) => order.status === "COMPLETED");
      case "cancelled":
        return orders.filter((order) => order.status === "CANCELLED");
      default:
        return [];
    }
  };

  const filteredOrders = getFilteredOrders();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="user-orders">
      <div className="sidebar">
        <div
          className={`sidebar-item ${
            activeCategory === "upcoming" ? "active" : ""
          }`}
          onClick={() => setActiveCategory("upcoming")}
        >
          Upcoming Events
        </div>
        <div
          className={`sidebar-item ${
            activeCategory === "completed" ? "active" : ""
          }`}
          onClick={() => setActiveCategory("completed")}
        >
          Completed Events
        </div>
        <div
          className={`sidebar-item ${
            activeCategory === "cancelled" ? "active" : ""
          }`}
          onClick={() => setActiveCategory("cancelled")}
        >
          Cancelled Events
        </div>
      </div>

      <div className="content">
        <h2>
          {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}{" "}
          Events
        </h2>

        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders">No {activeCategory} events found.</div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order._id.substring(0, 8)}</h3>
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-details">
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Amount:</span>
                    <span className="value">${order.amount.toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Address:</span>
                    <span className="value">{order.address}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Items:</span>
                    <span className="value">
                      {order.productIds.length} product(s)
                    </span>
                  </div>
                </div>

                {activeCategory === "upcoming" && (
                  <div className="order-actions">
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancelOrder(order._id)}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
