import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import IProduct from "../../../entities/IProduct";
import ICategory from "../../../entities/ICategory";
import "./ProductManagement.scss";
import { axiosInstance } from "../../../config/axiosConfig";
import handleFileUpload, {
  validateImageFile,
} from "../../../shared/fileUpload";

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Product form state
  const [productForm, setProductForm] = useState<IProduct>({
    name: "",
    description: "",
    categoryId: "",
    images: [],
    price: 0,
    datesAvailable: [],
    isActive: true,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async (): Promise<void> => {
    try {
      console.log("fetchingng products");
      const response = await axiosInstance.get("/product");
      console.log("the respones", response);
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
      console.log("the cats", data);
      setCategories(data.filter((category) => category.isActive));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setProductForm({
      ...productForm,
      [name]: name === "price" ? parseFloat(value) : value,
    });
  };

  const handleCategoryChange = (e: SelectChangeEvent): void => {
    setProductForm({
      ...productForm,
      categoryId: e.target.value as string,
    });
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map((file) =>
        handleFileUpload(file, {
          validateFile: validateImageFile,
        })
      );

      const results = await Promise.all(uploadPromises);

      const uploadedUrls = results
        .filter((result) => result.success && result.url)
        .map((result) => result.url as string);

      setProductForm({
        ...productForm,
        images: [...productForm.images, ...uploadedUrls],
      });
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number): void => {
    setProductForm({
      ...productForm,
      images: productForm.images.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedDate(e.target.value);
  };

  const handleAddDate = (): void => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);

      // Check if date is already in the array
      const dateExists = productForm.datesAvailable.some(
        (date) => new Date(date).toDateString() === newDate.toDateString()
      );

      if (!dateExists) {
        setProductForm({
          ...productForm,
          datesAvailable: [...productForm.datesAvailable, newDate],
        });
        setSelectedDate("");
      }
    }
  };

  const handleRemoveDate = (indexToRemove: number): void => {
    setProductForm({
      ...productForm,
      datesAvailable: productForm.datesAvailable.filter(
        (_, index) => index !== indexToRemove
      ),
    });
  };

  const resetForm = (): void => {
    setProductForm({
      name: "",
      description: "",
      categoryId: "",
      images: [],
      price: 0,
      datesAvailable: [],
      isActive: true,
    });
    setSelectedDate("");
  };

  const handleAddProduct = async (): Promise<void> => {
    try {
      const response = await axiosInstance.post("/product/add", productForm);
      console.log("the add respnes", response);
      if (response.status === 201) {
        setIsAddModalOpen(false);
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleEditProduct = async (): Promise<void> => {
    try {
      const response = await axiosInstance.put("/product/update", {
        _id: selectedProduct?._id,
        ...productForm,
      });

      if (response.status === 200) {
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error("Error updating product:", error);
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
    setSelectedProduct(product);

    // Set form with current product data
    setProductForm({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      images: product.images,
      price: product.price,
      datesAvailable: product.datesAvailable,
      isActive: product.isActive,
    });

    setIsEditModalOpen(true);
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

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString();
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
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
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

      {/* Add/Edit Product Modal Content */}
      <Modal
        open={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          if (isAddModalOpen) {
            setIsAddModalOpen(false);
          } else {
            setIsEditModalOpen(false);
          }
          resetForm();
        }}
        aria-labelledby="product-modal"
      >
        <Box sx={modalStyle}>
          <Typography id="product-modal" variant="h6" component="h2" mb={2}>
            {isAddModalOpen ? "Add New Product" : "Edit Product"}
          </Typography>

          <TextField
            fullWidth
            label="Product Name"
            name="name"
            value={productForm.name}
            onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{
              style: { color: "#aaa" },
            }}
            InputProps={{
              style: { color: "white" },
            }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={4}
            value={productForm.description}
            onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{
              style: { color: "#aaa" },
            }}
            InputProps={{
              style: { color: "white" },
            }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label" style={{ color: "#aaa" }}>
              Category
            </InputLabel>
            <Select
              labelId="category-label"
              value={productForm.categoryId}
              onChange={handleCategoryChange}
              label="Category"
              style={{ color: "white" }}
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={productForm.price}
            onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{
              style: { color: "#aaa" },
            }}
            InputProps={{
              style: { color: "white" },
            }}
          />

          {/* Image Upload Section */}
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="subtitle1" mb={1}>
              Images
            </Typography>

            <Button
              variant="contained"
              component="label"
              disabled={isUploading}
              sx={{ mb: 2 }}
            >
              {isUploading ? "Uploading..." : "Upload Images"}
              <input
                type="file"
                multiple
                hidden
                onChange={handleImageUpload}
                accept="image/jpeg,image/png,image/gif"
              />
            </Button>

            {/* Image Preview */}
            <div className="image-preview-container">
              {productForm.images.map((image, index) => (
                <div key={index} className="image-preview-item">
                  <img
                    src={image}
                    alt={`Product ${index}`}
                    className="image-preview"
                  />
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    className="image-remove-btn"
                  >
                    X
                  </Button>
                </div>
              ))}
            </div>
          </Box>

          {/* Date Availability Section */}
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="subtitle1" mb={1}>
              Dates Available
            </Typography>

            <div className="date-picker-container">
              <TextField
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                InputProps={{
                  style: { color: "white" },
                }}
                sx={{ mr: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleAddDate}
                disabled={!selectedDate}
              >
                Add Date
              </Button>
            </div>

            {/* Selected Dates List */}
            <div className="date-chips-container">
              {productForm.datesAvailable.map((date, index) => (
                <div key={index} className="date-chip">
                  {formatDate(date)}
                  <Button
                    color="error"
                    size="small"
                    onClick={() => handleRemoveDate(index)}
                    className="date-remove-btn"
                  >
                    X
                  </Button>
                </div>
              ))}
            </div>
          </Box>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => {
                if (isAddModalOpen) {
                  setIsAddModalOpen(false);
                } else {
                  setIsEditModalOpen(false);
                }
                resetForm();
              }}
              sx={{ mr: 1, color: "white" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={isAddModalOpen ? handleAddProduct : handleEditProduct}
            >
              {isAddModalOpen ? "Add" : "Update"}
            </Button>
          </Box>
        </Box>
      </Modal>

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
