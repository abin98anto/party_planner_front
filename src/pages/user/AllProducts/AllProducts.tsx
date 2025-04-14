/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import "./AllProducts.scss";
import ICategory from "../../../entities/ICategory";
import IProvider from "../../../entities/IProvider";
import { axiosInstance } from "../../../config/axiosConfig";
import ILocation from "../../../entities/ILocation";
import CalendarNew from "./calendar-new";

interface IProductNew {
  _id?: string;
  name: string;
  description: string;
  categoryId: ICategory;
  providerId: IProvider;
  images: string[];
  price: number;
  datesAvailable: Date[];
  isActive: boolean;
}

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Changed to single date
  const [showCalendar, setShowCalendar] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const limit = 8;

  const logCurrentFilters = () => {
    console.log("Current Filters:", {
      searchTerm,
      minPrice,
      maxPrice,
      selectedCategory,
      selectedLocation,
      selectedDate,
    });
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);

    try {
      const params: Record<string, any> = {
        page,
        limit,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (selectedLocation) {
        params.location = selectedLocation;
      }

      if (selectedDate) {
        params.date = selectedDate.toISOString().split("T")[0];
      }

      const response = await axiosInstance.get("/product/all-products", {
        params,
      });

      if (response.data.success) {
        setProducts(response.data.data);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalCount: response.data.totalCount,
        });
      } else {
        setError("Failed to fetch products");
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError("Error fetching products: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const categoriesResponse = await axiosInstance.get("/category");
      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.data || []);
      }

      const locationsResponse = await axiosInstance.get("/location");
      if (locationsResponse.data.success) {
        setLocations(locationsResponse.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
  };

  // Handle location selection
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
  };

  useEffect(() => {
    logCurrentFilters();
    fetchProducts(1);
  }, [selectedCategory, selectedLocation]);

  const handlePriceChange = () => {
    fetchProducts(1);
  };

  const handleDateSelection = (dates: Date[]) => {
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    } else {
      setSelectedDate(null);
    }
    setShowCalendar(false);
    fetchProducts(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory("");
    setSelectedLocation("");
    setSelectedDate(null);
    fetchProducts(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProducts(newPage);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const { currentPage, totalPages } = pagination;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "Select date";
    return selectedDate.toLocaleDateString();
  };

  const shouldShowPagination = pagination.totalCount > limit;

  return (
    <div className="all-products-container">
      <h1>All Products</h1>

      {/* Filters section */}
      <div className="filters-container">
        <form onSubmit={handleSearch} className="search-filter-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>

          <div className="filter-group">
            <select value={selectedCategory} onChange={handleCategoryChange}>
              <option value="">All Categories</option>
              {categories.map((category: ICategory) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select value={selectedLocation} onChange={handleLocationChange}>
              <option value="">All Locations</option>
              {locations.map((location: ILocation) => (
                <option key={location._id} value={location._id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group price-filter">
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={handlePriceChange}
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={handlePriceChange}
            />
          </div>

          <div className="filter-group date-filter">
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="date-selector-button"
            >
              {formatSelectedDate()}
            </button>
            {showCalendar && (
              <div className="calendar-dropdown">
                <CalendarNew
                  selectedDates={selectedDate ? [selectedDate] : []}
                  onSelectDates={handleDateSelection}
                />
              </div>
            )}
          </div>

          <button type="button" className="reset-button" onClick={resetFilters}>
            Reset
          </button>
        </form>
      </div>

      {/* Loading and error states */}
      {loading && <div className="loading">Loading products...</div>}
      {error && <div className="error">{error}</div>}

      {/* Products grid */}
      {!loading && !error && (
        <>
          <div className="products-grid">
            {products.length > 0 ? (
              products.map((product: IProductNew) => (
                <div key={product._id} className="product-card">
                  <div className="product-image">
                    <img
                      src={
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : "/placeholder-image.jpg"
                      }
                      alt={product.name}
                    />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="category">
                      {product.categoryId
                        ? product.categoryId.name
                        : "Uncategorized"}
                    </p>
                    <p className="location">
                      <span className="location-icon">📍</span>
                      {product.providerId &&
                      product.providerId.locations &&
                      product.providerId.locations.length > 0
                        ? product.providerId.locations
                            .map((loc: any) => loc.name)
                            .join(", ")
                        : "Unknown location"}
                    </p>
                    <p className="price">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-products">
                No products found matching your criteria.
              </div>
            )}
          </div>

          {/* Pagination - only show if total count is greater than limit */}
          {shouldShowPagination && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="pagination-button"
              >
                &lsaquo;
              </button>

              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`pagination-button ${
                    pagination.currentPage === pageNum ? "active" : ""
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="pagination-button"
              >
                &rsaquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllProducts;
