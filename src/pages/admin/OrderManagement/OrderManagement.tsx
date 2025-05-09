import React, { useState, useEffect } from "react";
import "./OrderManagement.scss";
import ICategory from "../../../entities/ICategory";
import IProvider from "../../../entities/IProvider";
import ILocation from "../../../entities/ILocation";
import axiosInstance from "../../../config/axiosConfig";
import EditIcon from "@mui/icons-material/Edit";
import {
  Modal,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Pagination,
} from "@mui/material";

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
  pagination: {
    totalPages: number;
    currentPage: number;
    totalOrders: number;
    limit: number;
  };
}

type OrderStatus = "ALL" | "PENDING" | "CANCELLED" | "COMPLETED";

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [_totalOrders, setTotalOrders] = useState<number>(0);
  const [status, setStatus] = useState<OrderStatus>("ALL");
  const [itemsPerPage] = useState<number>(6);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<
    "PENDING" | "CANCELLED" | "COMPLETED"
  >("PENDING");
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);

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
        setTotalPages(response.data.pagination.totalPages);
        setTotalOrders(response.data.pagination.totalOrders);
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
    setCurrentPage(1);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleOpenModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      setUpdateLoading(true);
      const response = await axiosInstance.put(
        `/order/update/${selectedOrder._id}`,
        { status: newStatus }
      );

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === selectedOrder._id
              ? { ...order, status: newStatus }
              : order
          )
        );
        handleCloseModal();
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  const modalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#2b2b2b",
    border: "1px solid #444",
    boxShadow: 24,
    p: 4,
    color: "white",
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
                    <th>Actions</th>
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
                      <td>
                        {order.status === "PENDING" && (
                          <IconButton
                            onClick={() => handleOpenModal(order)}
                            sx={{ color: "#3498db" }}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-container">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </div>
          </>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Typography
            id="modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Update Order Status
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="status-select-label" sx={{ color: "#aaa" }}>
              Status
            </InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={newStatus}
              label="Status"
              onChange={(e) =>
                setNewStatus(
                  e.target.value as "PENDING" | "CANCELLED" | "COMPLETED"
                )
              }
              sx={{
                color: "white",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "#444",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#666",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#ff5722",
                },
                ".MuiSvgIcon-root": {
                  color: "white",
                },
              }}
            >
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              sx={{
                color: "#aaa",
                borderColor: "#444",
                "&:hover": {
                  borderColor: "#666",
                  backgroundColor: "rgba(255,255,255,0.05)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              variant="contained"
              disabled={updateLoading}
              sx={{
                backgroundColor: "#ff5722",
                color: "white",
                "&:hover": {
                  backgroundColor: "#e64a19",
                },
                "&.Mui-disabled": {
                  backgroundColor: "rgba(255,87,34,0.5)",
                },
              }}
            >
              {updateLoading ? "Updating..." : "Change"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default OrderManagement;
