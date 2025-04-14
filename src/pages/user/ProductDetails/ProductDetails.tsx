import React, { useState, useEffect } from "react";
import "./ProductDetails.scss";
import { axiosInstance } from "../../../config/axiosConfig";
import { useParams } from "react-router-dom";

// Updated type definitions to match actual API response
interface Category {
  _id: string;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LocationData {
  _id: string;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProviderData {
  _id: string;
  name: string;
  company: string;
  contact: number;
  locations: LocationData[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Updated Product interface to match the nested structure
interface Product {
  _id: string;
  name: string;
  description: string;
  categoryId: Category;
  providerId: ProviderData;
  images: string[];
  price: number;
  datesAvailable: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// interface Location {
//   id: string;
//   name: string;
//   address?: string;
// }

const ProductDetails: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { productId } = useParams<{ productId: string }>();

  // Fetch product data when component mounts or productId changes
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        // Fetch product data using axios
        const productResponse = await axiosInstance.get(
          `/product/${productId}`
        );
        console.log("the prod res", productResponse.data.data);

        // Use the data property from the response
        const productData = productResponse.data.data;
        setProduct(productData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setFetchError("An error occurred while fetching product data");
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  // Format the price with currency symbol
  const formatPrice = (price: number): string => {
    return `$${price}`;
  };

  // Format the date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // Handle the checkout process
  const handleCheckout = (): void => {
    if (!product) return;

    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    if (!selectedLocation) {
      setError("Please select a location");
      return;
    }

    setError("");
    console.log("go to checkout page");
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-details__loading">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  // Error state
  if (fetchError || !product) {
    return (
      <div className="product-details__error-container">
        <h2>Error Loading Product</h2>
        <p>{fetchError || "Product not found"}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="product-details">
      <div className="product-details__gallery">
        <div className="product-details__main-image">
          {selectedImage && <img src={selectedImage} alt={product.name} />}
        </div>
        <div className="product-details__thumbnails">
          {product.images && product.images.length > 0 ? (
            product.images.map((image, index) => (
              <div
                key={index}
                className={`product-details__thumbnail ${
                  selectedImage === image ? "active" : ""
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                />
              </div>
            ))
          ) : (
            <div className="product-details__no-images">
              No images available
            </div>
          )}
        </div>
      </div>

      <div className="product-details__info">
        <h1 className="product-details__title">{product.name}</h1>
        <div className="product-details__price">
          {formatPrice(product.price)}
        </div>

        <div className="product-details__description">
          <h3>Description</h3>
          <p>{product.description}</p>
        </div>

        {product.providerId && (
          <div className="product-details__provider">
            <h3>Provider</h3>
            <div className="provider-card">
              <div className="provider-info">
                <h4>{product.providerId.name}</h4>
                <p>Company: {product.providerId.company}</p>
                <p>Contact: {product.providerId.contact}</p>
              </div>
            </div>
          </div>
        )}

        <div className="product-details__category">
          <h3>Category</h3>
          <p>{product.categoryId.name}</p>
        </div>

        <div className="product-details__dates">
          <h3>Select Date</h3>
          <div className="date-selector">
            {product.datesAvailable && product.datesAvailable.length > 0 ? (
              product.datesAvailable.map((date, index) => (
                <div
                  key={index}
                  className={`date-option ${
                    selectedDate &&
                    selectedDate.getTime() === new Date(date).getTime()
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setSelectedDate(new Date(date))}
                >
                  {formatDate(date)}
                </div>
              ))
            ) : (
              <p>No dates available</p>
            )}
          </div>
        </div>

        {product.providerId && product.providerId.locations && (
          <div className="product-details__locations">
            <h3>Select Location</h3>
            <div className="location-selector">
              {product.providerId.locations.length > 0 ? (
                product.providerId.locations.map((location) => (
                  <div
                    key={location._id}
                    className={`location-option ${
                      selectedLocation && selectedLocation._id === location._id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <h4>{location.name}</h4>
                  </div>
                ))
              ) : (
                <p>No locations available</p>
              )}
            </div>
          </div>
        )}

        {error && <div className="product-details__error">{error}</div>}

        <button
          className="product-details__checkout-btn"
          onClick={handleCheckout}
          disabled={!product.isActive}
        >
          {product.isActive ? "Proceed to Checkout" : "Currently Unavailable"}
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
