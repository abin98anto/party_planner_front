import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import "./CartPage.scss";
import axiosInstance from "../../../config/axiosConfig";
import { useAppSelector } from "../../../hooks/reduxHooks";
import IAddress from "../../../entities/IAddress";
import { Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react";
import AddressModal from "./AddressModal";
import { Link, useNavigate } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../../components/common/CustomSanckbar/CustomSnackbar";

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

  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  useEffect(() => {
    if (userId) {
      fetchAddresses();
      fetchCart();
    }
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/address/${userId}`);
      if (response.data.success) {
        setAddresses(response.data.data);

        if (response.data.data.length > 0) {
          setSelectedAddressId(response.data.data[0]._id);

          const addr = response.data.data[0];
          const formattedAddress = `${addr.venue}, ${addr.place}${
            addr.landmark ? `, ${addr.landmark}` : ""
          }, ${addr.city}, ${addr.district}, ${addr.state} - ${
            addr.pincode
          }, Phone: ${addr.phone}`;
          setAddress(formattedAddress);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses", error);
      showSnackbar("Failed to load addresses", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setIsModalOpen(true);
  };

  const handleEditAddress = (address: IAddress) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      setIsLoading(true);
      const response = await axiosInstance.delete(`/address/${addressId}`);
      if (response.status === 204) {
        showSnackbar("Address deleted successfully", "success");
        setAddresses(addresses.filter((addr) => addr._id !== addressId));

        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
          setAddress("");
        }
      }
    } catch (error) {
      console.error("Error deleting address", error);
      showSnackbar("Failed to delete address", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async (addressData: IAddress) => {
    try {
      setIsLoading(true);
      if (selectedAddress && selectedAddress._id) {
        const response = await axiosInstance.put("/address/update", {
          ...addressData,
          _id: selectedAddress._id,
        });

        if (response.data.success) {
          showSnackbar("Address updated successfully", "success");
          const updatedAddresses = addresses.map((addr) =>
            addr._id === selectedAddress._id
              ? { ...addressData, _id: selectedAddress._id }
              : addr
          );
          setAddresses(updatedAddresses);

          if (selectedAddressId === selectedAddress._id) {
            const formattedAddress = `${addressData.venue}, ${
              addressData.place
            }${addressData.landmark ? `, ${addressData.landmark}` : ""}, ${
              addressData.city
            }, ${addressData.district}, ${addressData.state} - ${
              addressData.pincode
            }, Phone: ${addressData.phone}`;
            setAddress(formattedAddress);
          }
        }
      } else {
        const response = await axiosInstance.post("/address/add", {
          ...addressData,
          userId,
          isDeleted: false,
        });

        if (response.data.success) {
          showSnackbar("Address added successfully", "success");
          const newAddress = response.data.data;
          setAddresses([...addresses, newAddress]);

          if (addresses.length === 0) {
            setSelectedAddressId(newAddress._id);
            const formattedAddress = `${newAddress.venue}, ${newAddress.place}${
              newAddress.landmark ? `, ${newAddress.landmark}` : ""
            }, ${newAddress.city}, ${newAddress.district}, ${
              newAddress.state
            } - ${newAddress.pincode}, Phone: ${newAddress.phone}`;
            setAddress(formattedAddress);
          }
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving address", error);
      showSnackbar("Failed to save address", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAddress = (addr: IAddress) => {
    if (addr._id) {
      setSelectedAddressId(addr._id);
      const formattedAddress = `${addr.venue}, ${addr.place}${
        addr.landmark ? `, ${addr.landmark}` : ""
      }, ${addr.city}, ${addr.district}, ${addr.state} - ${
        addr.pincode
      }, Phone: ${addr.phone}`;
      setAddress(formattedAddress);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAddress(null);
  };

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
        showSnackbar("Please select a shipping address", "error");
        return;
      }

      if (!userId) {
        showSnackbar("Please login first", "error");
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

      const response = await axiosInstance.post("/order/add", orderData);

      if (response.data.success) {
        setOrderSuccess(true);
        setTimeout(async () => {
          await axiosInstance.delete(`/cart/${cart?._id}`);
          navigate("/profile");
        }, 3000);
      }
    } catch (err) {
      console.error("Error placing order:", err);
      showSnackbar("Failed to place order. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const EmptyCart = () => {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-icon">
          <ShoppingCart size={64} />
        </div>
        <h2 className="empty-cart-title">Your Cart is Empty</h2>
        <p className="empty-cart-message">
          Looks like you haven't added any services to your cart yet.
        </p>
        <Link to="/products" className="browse-services-btn">
          Browse Services
        </Link>
      </div>
    );
  };

  if (loading) return <div className="cart-loading">Loading cart...</div>;
  if (error) return <div className="cart-error">{error}</div>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <EmptyCart />;
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
                <tr
                  key={product._id || index}
                  onClick={() => navigate(`/product/${product.productId?._id}`)}
                  style={{ cursor: "pointer" }}
                >
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
        <div className="address-section">
          <div className="address-header">
            <h3 className="address-title">Shipping Address</h3>
            <button
              onClick={handleAddAddress}
              className="add-address-btn"
              disabled={isLoading}
            >
              <Plus size={18} className="add-icon" />
              Add Address
            </button>
          </div>

          {isLoading && <p className="loading-text">Loading addresses...</p>}

          {!isLoading && addresses.length === 0 && (
            <div className="no-address">
              <p>No addresses found. Please add an address.</p>
            </div>
          )}

          <div className="address-grid">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`address-card ${
                  selectedAddressId === addr._id ? "selected" : ""
                }`}
                onClick={() => handleSelectAddress(addr)}
              >
                <div className="address-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAddress(addr);
                    }}
                    className="edit-btn"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addr._id && handleDeleteAddress(addr._id);
                    }}
                    className="delete-btn"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="address-details">
                  <p className="address-venue">{addr.venue}</p>
                  <p className="address-place">{addr.place}</p>
                  {addr.landmark && (
                    <p className="address-landmark">
                      Landmark: {addr.landmark}
                    </p>
                  )}
                  <p className="address-city-district">
                    {addr.city}, {addr.district}
                  </p>
                  <p className="address-state-pin">
                    {addr.state} - {addr.pincode}
                  </p>
                  <p className="address-phone">Phone: {addr.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="place-order-btn"
          onClick={handlePlaceOrder}
          disabled={isSubmitting || addresses.length === 0}
        >
          {isSubmitting ? "Processing..." : "Book Service"}
        </button>
      </div>

      {isModalOpen && (
        <AddressModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveAddress}
          address={selectedAddress}
        />
      )}

      {orderSuccess && (
        <div className="order-success-overlay">
          <div className="order-success-message">
            <h2>Order Placed Successfully!</h2>
          </div>
        </div>
      )}

      {/* Add CustomSnackbar */}
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default CartPage;
