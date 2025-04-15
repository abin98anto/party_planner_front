/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import "./ProductDetails.scss";
import { axiosInstance } from "../../../config/axiosConfig";
import { useParams } from "react-router-dom";
import ILocation from "../../../entities/ILocation";
import ICategory from "../../../entities/ICategory";
import IProvider from "../../../entities/IProvider";
import { ISelectedProducts } from "../../../entities/ICart";
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

interface SelectedProducts {
  productId: Product;
  selectedDates: Date[];
  locationId: ILocation;
}

const ProductDetails: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ILocation | null>(
    null
  );
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isInCart, setIsInCart] = useState<boolean>(false);
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [cartProduct, setCartProduct] = useState<SelectedProducts | null>(null);
  const { productId } = useParams<{ productId: string }>();

  const { userInfo } = useAppSelector((state) => state.user);
  const userId = userInfo?._id;

  useEffect(() => {
    if (productId && userId) {
      fetchProductData();
      checkIfInCart();
    }
  }, [productId, userId]);

  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  useEffect(() => {
    if (cartProduct) {
      const dates = Array.isArray(cartProduct.selectedDates)
        ? cartProduct.selectedDates.map((date) =>
            date instanceof Date ? date : new Date(date)
          )
        : [];

      setSelectedDates(dates);

      if (
        typeof cartProduct.productId !== "string" &&
        cartProduct.productId.providerId
      ) {
        const provider = cartProduct.productId.providerId;
        if (provider.locations && provider.locations.length > 0) {
          const cartLocation = provider.locations.find(
            (loc: ILocation) =>
              String(loc._id) === String(cartProduct.locationId._id)
          );
          setSelectedLocation(cartLocation || provider.locations[0]);
        }
      }
    }
  }, [cartProduct]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const productResponse = await axiosInstance.get(`/product/${productId}`);
      const productData = productResponse.data.data;
      setProduct(productData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setFetchError("An error occurred while fetching product data");
    } finally {
      setLoading(false);
    }
  };

  const checkIfInCart = async () => {
    try {
      if (!userId) return;

      const response = await axiosInstance.get(`/cart/user/${userId}`);
      const cart = response.data.data;
      if (cart && cart.products && cart.products.length > 0) {
        const foundProduct = cart.products.find((item: SelectedProducts) => {
          return item.productId._id === productId;
        });

        if (foundProduct) {
          setIsInCart(true);
          setCartProduct(foundProduct as SelectedProducts);
        } else {
          setIsInCart(false);
          setCartProduct(null);
        }
      } else {
        setIsInCart(false);
        setCartProduct(null);
      }
    } catch (err) {
      console.error("Error checking cart:", err);
      setIsInCart(false);
      setCartProduct(null);
    }
  };

  const formatPrice = (price: number): string => {
    return `$${price}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const datesClassName = (dateString: string) => {
    return `date-option ${
      selectedDates.some((d) => d.getTime() === new Date(dateString).getTime())
        ? "active"
        : ""
    }`;
  };

  const locationClassName = (location: ILocation) => {
    return `location-option ${
      selectedLocation && selectedLocation._id === location._id ? "active" : ""
    }`;
  };

  const selectDates = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);

      const exists = selectedDates.some(
        (d) => d.getTime() === dateObj.getTime()
      );
      const newDates = exists
        ? selectedDates.filter((d) => d.getTime() !== dateObj.getTime())
        : [...selectedDates, dateObj];

      setSelectedDates(newDates);

      if (isInCart) {
        updateCartItem(newDates);
      }
    } catch (error) {
      console.log("error selecting dates", error);
    }
  };

  const selectLocation = (location: ILocation) => {
    setSelectedLocation(location);
    if (isInCart) {
      updateCartItem(undefined, location);
    }
  };

  const updateCartItem = async (
    dates = selectedDates,
    location = selectedLocation
  ) => {
    try {
      if (!location) {
        setError("Please select a location");
        return;
      }

      setCartLoading(true);

      await axiosInstance.put(`/cart/remove/${userId}`, {
        productId: productId,
      });

      if (product) {
        const cartItem: ISelectedProducts = {
          productId: product._id,
          selectedDates: dates,
          locationId: location._id as string,
        };

        await axiosInstance.post(`/cart/add/${userId}`, cartItem);
      }

      await checkIfInCart();
    } catch (err) {
      console.error("Error updating cart:", err);
      setError("Failed to update cart");
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      if (!product) return;

      if (selectedDates.length === 0) {
        setError("Please select at least one date");
        return;
      }

      if (!selectedLocation) {
        setError("Please select a location");
        return;
      }

      setError("");
      setCartLoading(true);

      const cartItem: ISelectedProducts = {
        productId: product._id,
        selectedDates: selectedDates,
        locationId: selectedLocation._id as string,
      };

      console.log("cart itemee to add ", cartItem);

      await axiosInstance.post(`/cart/add/${userId}`, cartItem);
      await checkIfInCart();
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add product to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async () => {
    try {
      setCartLoading(true);
      await axiosInstance.put(`/cart/remove/${userId}`, {
        productId: productId,
      });
      setIsInCart(false);
      setCartProduct(null);
      setSelectedDates([]);
    } catch (err) {
      console.error("Error removing from cart:", err);
      setError("Failed to remove product from cart");
    } finally {
      setCartLoading(false);
    }
  };

  const isFutureDate = (dateString: string): boolean => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateToCheck = new Date(dateString);
    dateToCheck.setHours(0, 0, 0, 0);

    return dateToCheck >= tomorrow;
  };

  const getAvailableDates = (): string[] => {
    if (!product || !product.datesAvailable) return [];
    return product.datesAvailable.filter((date) => isFutureDate(date));
  };

  if (loading) {
    return (
      <div className="product-details__loading">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

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

        {isInCart && (
          <div className="product-details__cart-notice">
            <p>This product is in your cart</p>
            {cartLoading && <span>Updating cart...</span>}
          </div>
        )}

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
          <h3>Select Date{selectedDates.length > 1 ? "s" : ""}</h3>
          <div className="date-selector">
            {getAvailableDates().length > 0 ? (
              getAvailableDates().map((date, index) => (
                <div
                  key={index}
                  className={datesClassName(date)}
                  onClick={() => selectDates(date)}
                >
                  {formatDate(date)}
                </div>
              ))
            ) : (
              <p>No future dates available</p>
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
                    className={locationClassName(location)}
                    onClick={() => selectLocation(location)}
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
          className={`product-details__checkout-btn ${
            isInCart ? "remove" : ""
          }`}
          onClick={isInCart ? removeFromCart : addToCart}
          disabled={!product.isActive || cartLoading}
        >
          {cartLoading
            ? "Processing..."
            : isInCart
            ? "Remove from Cart"
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
