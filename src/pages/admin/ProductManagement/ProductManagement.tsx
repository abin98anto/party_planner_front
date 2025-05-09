import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  InputAdornment,
  IconButton,
  Pagination,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import IProduct from "../../../entities/IProduct";
import ICategory from "../../../entities/ICategory";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../../components/common/CustomSanckbar/CustomSnackbar";
import {
  getAllProducts,
  deleteProduct,
  updateProduct,
  fetchCategories,
} from "../../../api/services/productService";
import "./ProductManagement.scss";

interface IPaginationData {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

const ProductManagement: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<IPaginationData>({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 6,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchProductsData(), fetchCategoriesData()]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load data";
        setError(message);
        showSnackbar(message, "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [searchTerm, pagination.currentPage]);

  const fetchProductsData = async (): Promise<void> => {
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm || undefined,
      };
      const response = await getAllProducts(params);

      if (response.success) {
        const productsData = response.data || [];
        setProducts(productsData);

        if (response.pagination) {
          setPagination({
            totalCount: response.pagination.totalCount || 0,
            totalPages: response.pagination.totalPages || 1,
            currentPage: response.pagination.currentPage || 1,
            limit: response.pagination.limit || 6,
          });
        } else {
          setPagination({
            totalCount: productsData.length,
            totalPages: Math.ceil(productsData.length / pagination.limit) || 1,
            currentPage: pagination.currentPage,
            limit: pagination.limit,
          });
        }
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      throw new Error(error.message || "Failed to fetch products");
    }
  };

  const fetchCategoriesData = async (): Promise<void> => {
    try {
      const response = await fetchCategories();
      if (response.success) {
        setCategories(response.data.filter((category) => category.isActive));
      } else {
        throw new Error("Failed to fetch categories");
      }
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      throw new Error(error.message || "Failed to fetch categories");
    }
  };

  const handleDeleteProduct = async (): Promise<void> => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct._id as string);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      await fetchProductsData();
      showSnackbar("Product deleted successfully!", "success");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      showSnackbar(error.message || "Failed to delete product.", "error");
    }
  };

  const handleToggleListStatus = async (): Promise<void> => {
    if (!selectedProduct) return;
    try {
      const newActiveStatus = !selectedProduct.isActive;
      await updateProduct({
        _id: selectedProduct._id,
        isActive: newActiveStatus,
      });
      setIsListModalOpen(false);
      setSelectedProduct(null);
      await fetchProductsData();
      showSnackbar(
        `Product ${newActiveStatus ? "listed" : "unlisted"} successfully!`,
        "success"
      );
    } catch (error: any) {
      console.error("Error updating product list status:", error);
      showSnackbar(
        error.message || "Failed to update product status.",
        "error"
      );
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput.trim());
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: value,
    }));
  };

  const openEditModal = (product: IProduct): void => {
    navigate(`/admin/edit-product/${product._id}`);
  };

  const openDeleteModal = (product: IProduct): void => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const openListModal = (product: IProduct): void => {
    setSelectedProduct(product);
    setIsListModalOpen(true);
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#333",
    color: "white",
    boxShadow: 24,
    p: 4,
    borderRadius: 1,
  };

  if (loading) {
    return (
      <div className="product-management">
        <div className="product-container">
          <div className="no-data-placeholder">
            <CircularProgress color="inherit" />
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-management">
        <div className="product-container">
          <div className="no-data-placeholder">
            <p>Error: {error}</p>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setLoading(true);
                setError(null);
                Promise.all([fetchProductsData(), fetchCategoriesData()])
                  .then(() => setLoading(false))
                  .catch((err) => {
                    setError(err.message || "Failed to load data");
                    showSnackbar(err.message || "Failed to load data", "error");
                    setLoading(false);
                  });
              }}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="product-management">
        <div className="product-container">
          <div className="header">
            <h1>Product Management</h1>
            <div className="top-controls">
              <div className="search-container">
                <TextField
                  className="search-input"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleSearch}
                          edge="end"
                          className="search-button"
                        >
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <Button
                variant="contained"
                className="add-button"
                onClick={() => navigate("/admin/add-product")}
              >
                Add Product
              </Button>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="no-data-placeholder">
              <p>No products found. Add a new product to get started!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="product-thumbnail"
                          />
                        ) : (
                          <div className="no-image-placeholder">No image</div>
                        )}
                      </td>
                      <td>{product.name}</td>
                      <td>{getCategoryName(product.categoryId)}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            product.isActive ? "active" : "inactive"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button edit"
                            onClick={() => openEditModal(product)}
                          >
                            EDIT
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() => openDeleteModal(product)}
                          >
                            DELETE
                          </button>
                          <button
                            className="action-button list"
                            onClick={() => openListModal(product)}
                          >
                            {product.isActive ? "UNLIST" : "LIST"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pagination.totalPages > 1 && (
                <div className="pagination-container">
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          aria-labelledby="delete-modal"
        >
          <Box sx={modalStyle}>
            <Typography id="delete-modal" variant="h6" component="h2" mb={2}>
              Are you sure you want to delete {selectedProduct?.name}?
            </Typography>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                sx={{ mr: 1, color: "white" }}
              >
                No
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteProduct}
              >
                Yes
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* List/Unlist Confirmation Modal */}
        <Modal
          open={isListModalOpen}
          onClose={() => setIsListModalOpen(false)}
          aria-labelledby="list-modal"
        >
          <Box sx={modalStyle}>
            <Typography id="list-modal" variant="h6" component="h2" mb={2}>
              Are you sure you want to{" "}
              {selectedProduct?.isActive ? "unlist" : "list"}{" "}
              {selectedProduct?.name}?
            </Typography>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => setIsListModalOpen(false)}
                sx={{ mr: 1, color: "white" }}
              >
                No
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleToggleListStatus}
              >
                Yes
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </>
  );
};

export default ProductManagement;
