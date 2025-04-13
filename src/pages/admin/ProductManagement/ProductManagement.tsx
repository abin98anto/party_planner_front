import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Modal } from "@mui/material";
import { useNavigate } from "react-router-dom";
import IProduct from "../../../entities/IProduct";
import ICategory from "../../../entities/ICategory";
import "./ProductManagement.scss";
import { axiosInstance } from "../../../config/axiosConfig";

const ProductManagement: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get("/product");
      const data: IProduct[] = await response.data.data;
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get("/category");
      const data: ICategory[] = await response.data.data;
      setCategories(data.filter((category) => category.isActive));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDeleteProduct = async (): Promise<void> => {
    try {
      const response = await axiosInstance.delete(
        `/product/${selectedProduct?._id}`
      );

      if (response.status === 200) {
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleToggleListStatus = async (): Promise<void> => {
    try {
      const newActiveStatus = selectedProduct?.isActive === true ? false : true;

      const response = await axiosInstance.put("/product/update", {
        _id: selectedProduct?._id,
        isActive: newActiveStatus,
      });

      if (response.status === 200) {
        setIsListModalOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (error) {
      console.error("Error updating product list status:", error);
    }
  };

  const openEditModal = (product: IProduct): void => {
    navigate(`/add-product/${product._id}`);
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
    width: 600,
    maxHeight: "90vh",
    overflow: "auto",
    bgcolor: "#333",
    color: "white",
    boxShadow: 24,
    p: 4,
    borderRadius: 1,
  };

  return (
    <div className="product-management">
      <div className="product-container">
        <div className="header">
          <h1>Product Management</h1>
          <Button
            variant="contained"
            className="add-button"
            onClick={() => navigate("/admin/add-product")}
          >
            Add Product
          </Button>
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
                          product.isActive === true ? "active" : "inactive"
                        }`}
                      >
                        {product.isActive === true ? "Active" : "Inactive"}
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
                          {product.isActive === true ? "UNLIST" : "LIST"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            {selectedProduct?.isActive === true ? "unlist" : "list"}{" "}
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
  );
};

export default ProductManagement;
