/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import "./CartPage.scss";
import { axiosInstance } from "../../../config/axiosConfig";
import { useAppSelector } from "../../../hooks/reduxHooks";

interface Location {
  _id: string;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Provider {
  _id: string;
  name: string;
  company: string;
  contact: number;
  isActive: boolean;
  isDeleted: boolean;
  locations: Location[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  datesAvailable: string[];
  isActive: boolean;
  categoryId: string;
  providerId: Provider;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CartProduct {
  _id: string;
  productId: Product;
  selectedDates: string[];
  locationId: Location;
}

interface Cart {
  _id: string;
  userId: string;
  products: CartProduct[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CartResponse {
  success: boolean;
  data: Cart;
}

interface OrderData {
  userId: string;
  productIds: CartProduct[];
  providerIds: string[];
  amount: number;
  address: string;
}

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { userInfo } = useAppSelector((state) => state.user);
  const userId = userInfo?._id;

  useEffect(() => {
    if (userId) {
      fetchCart();
    }
  }, [userId]);

  const fetchCart = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<CartResponse>(
        `/cart/user/${userId}`
      );
      setCart(response.data.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch cart items");
      setLoading(false);
      console.error("Error fetching cart:", err);
    }
  };

  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const calculateTotalDays = (selectedDates: string[] | undefined): number => {
    return selectedDates ? selectedDates.length : 0;
  };

  const calculateItemTotal = (product: CartProduct): number => {
    const pricePerDay = product.productId?.price || 0;
    const totalDays = calculateTotalDays(product.selectedDates);
    return pricePerDay * totalDays;
  };

  const calculateGrandTotal = (): number => {
    if (!cart || !cart.products || cart.products.length === 0) return 0;

    return cart.products.reduce((sum, product) => {
      return sum + calculateItemTotal(product);
    }, 0);
  };

  const handlePlaceOrder = async (): Promise<void> => {
    try {
      if (!address.trim()) {
        alert("Please enter your address");
        return;
      }

      if (!userId) {
        alert("login first");
        return;
      }

      setIsSubmitting(true);
      const providerIds = [
        ...new Set(
          cart!.products
            .filter((product) => product.productId?.providerId?._id)
            .map((product) => product.productId.providerId._id)
        ),
      ];

      const orderData: OrderData = {
        userId,
        productIds: cart!.products,
        providerIds,
        amount: calculateGrandTotal(),
        address,
      };

      console.log("Sending order data:", orderData);
      const response = await axiosInstance.post("/order/add", orderData);

      if (response.data.success) {
        alert("Order placed successfully!");
        // You can redirect or perform additional actions here
      }
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="cart-loading">Loading cart...</div>;
  if (error) return <div className="cart-error">{error}</div>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <div className="cart-empty">Your cart is empty</div>;
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">CART</h1>

      <div className="cart-table-container">
        <table className="cart-table">
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>Product Name</th>
              <th>Dates Selected</th>
              <th>Price per Day</th>
              <th>Total Days</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {cart.products.map((product, index) => {
              const pricePerDay = product.productId?.price || 0;
              const totalDays = calculateTotalDays(product.selectedDates);
              const itemTotal = calculateItemTotal(product);

              return (
                <tr key={product._id || index}>
                  <td>{index + 1}</td>
                  <td>{product.productId?.name || "Unknown Product"}</td>
                  <td>
                    {product.selectedDates &&
                    product.selectedDates.length > 0 ? (
                      <div className="dates-list">
                        {product.selectedDates.map((date, idx) => (
                          <span key={idx}>{formatDate(date)}</span>
                        ))}
                      </div>
                    ) : (
                      "No dates selected"
                    )}
                  </td>
                  <td>₹{pricePerDay.toLocaleString()}</td>
                  <td>{totalDays}</td>
                  <td>₹{itemTotal.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="grand-total-label">
                Grand Total
              </td>
              <td className="grand-total-value">
                ₹{calculateGrandTotal().toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="order-section">
        <div className="address-input">
          <label htmlFor="address">Delivery Address:</label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
            required
          />
        </div>

        <button
          className="place-order-btn"
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default CartPage;
