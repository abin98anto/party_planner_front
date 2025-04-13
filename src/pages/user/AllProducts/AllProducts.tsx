import { useState, useEffect } from "react";
import "./AllProducts.scss";
import ICategory from "../../../entities/ICategory";
import IProvider from "../../../entities/IProvider";
import { axiosInstance } from "../../../config/axiosConfig";
import ILocation from "../../../entities/ILocation";

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [limit, setLimit] = useState(10);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedLocation && { location: selectedLocation }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };

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
    } catch (err) {
      setError("Error fetching products: " + (err || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const categoriesResponse = await axiosInstance.get("/category");
      setCategories(categoriesResponse.data.data || []);

      const locationsResponse = await axiosInstance.get("/location");
      setLocations(locationsResponse.data.data || []);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, []);

  const handleSearch = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handleFilterChange = () => {
    fetchProducts(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory("");
    setSelectedLocation("");
    setStartDate("");
    setEndDate("");
    fetchProducts(1);
  };

  const handlePageChange = (newPage: number | undefined) => {
    if (newPage! >= 1 && newPage! <= pagination.totalPages) {
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
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All Categories</option>
              {categories.map((category: ICategory) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                handleFilterChange();
              }}
            >
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
              onBlur={handleFilterChange}
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={handleFilterChange}
            />
          </div>

          <div className="filter-group date-filter">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                handleFilterChange();
              }}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                handleFilterChange();
              }}
            />
          </div>

          <button type="button" className="reset-button" onClick={resetFilters}>
            Reset
          </button>
        </form>
      </div>

      {/* Results count and items per page */}
      <div className="results-info">
        <p>
          Showing {products.length} of {pagination.totalCount} products
        </p>
        <div className="items-per-page">
          <label>Items per page:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              fetchProducts(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Loading and error states */}
      {loading && <div className="loading">Loading products...</div>}
      {error && <div className="error">{error}</div>}

      {/* Products grid */}
      {!loading && !error && (
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
                    {product.providerId
                      ? product.providerId.locations.join(",")
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
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination.currentPage === 1}
            className="pagination-button"
          >
            &laquo;
          </button>
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
          <button
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="pagination-button"
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
