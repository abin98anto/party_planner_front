import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Container,
  Paper,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import "./AddProduct.scss";
import ICategory from "../../../../entities/ICategory";
import IProvider from "../../../../entities/IProvider";
import IProduct from "../../../../entities/IProduct";
import { axiosInstance } from "../../../../config/axiosConfig";
import handleFileUpload, {
  validateImageFile,
} from "../../../../shared/fileUpload";

const AddProduct: React.FC = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Instead of using a state and setter that we don't use, just use a constant
  const isEditMode = !!productId;

  // Product form state
  const [productForm, setProductForm] = useState<
    IProduct & { providerId?: string }
  >({
    name: "",
    description: "",
    categoryId: "",
    providerId: "",
    images: [],
    price: 0,
    datesAvailable: [],
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchProviders();

    if (productId) {
      fetchProductDetails(productId);
    }
  }, [productId]);

  const fetchProductDetails = async (id: string): Promise<void> => {
    try {
      const response = await axiosInstance.get(`/product/${id}`);
      const productData = response.data.data;
      setProductForm({
        ...productData,
        providerId: productData.providerId || "", // Add provider ID if it exists
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
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

  const fetchProviders = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get("/provider");
      const data: IProvider[] = await response.data.data;
      setProviders(data.filter((provider) => provider.isActive));
    } catch (error) {
      console.error("Error fetching providers:", error);
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

  const handleProviderChange = (e: SelectChangeEvent): void => {
    setProductForm({
      ...productForm,
      providerId: e.target.value as string,
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

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString();
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      // Create a copy of productForm to submit
      const productData = { ...productForm };

      // If we're in edit mode
      if (isEditMode) {
        const response = await axiosInstance.put(
          "/product/update",
          productData
        );
        if (response.status === 200) {
          navigate("/product-management");
        }
      } else {
        // If we're adding a new product
        const response = await axiosInstance.post("/product/add", productData);
        if (response.status === 201) {
          navigate("/product-management");
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  return (
    <div className="add-product">
      <Container maxWidth="lg">
        <Paper className="form-container">
          <Typography variant="h4" component="h1" className="form-title">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </Typography>

          <div className="form-content">
            <div className="form-row full-width">
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={productForm.name}
                onChange={handleInputChange}
                required
                className="form-field"
              />
            </div>

            <div className="form-row full-width">
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={productForm.description}
                onChange={handleInputChange}
                className="form-field"
              />
            </div>

            <div className="form-row two-col">
              <FormControl fullWidth className="form-field">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={productForm.categoryId}
                  onChange={handleCategoryChange}
                  label="Category"
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth className="form-field">
                <InputLabel id="provider-label">Service Provider</InputLabel>
                <Select
                  labelId="provider-label"
                  value={productForm.providerId}
                  onChange={handleProviderChange}
                  label="Service Provider"
                >
                  {providers.map((provider) => (
                    <MenuItem key={provider._id} value={provider._id}>
                      {provider.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="form-row two-col">
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={productForm.price}
                onChange={handleInputChange}
                required
                className="form-field"
              />
              <div></div> {/* Empty div for spacing in the two-column layout */}
            </div>

            <div className="form-row full-width">
              <div className="section-container">
                <Typography variant="h6" className="section-title">
                  Images
                </Typography>

                <Button
                  variant="contained"
                  component="label"
                  disabled={isUploading}
                  className="upload-button"
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
              </div>
            </div>

            <div className="form-row full-width">
              <div className="section-container">
                <Typography variant="h6" className="section-title">
                  Dates Available
                </Typography>

                <div className="date-picker-container">
                  <TextField
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="date-picker"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddDate}
                    disabled={!selectedDate}
                    className="date-add-button"
                  >
                    Add Date
                  </Button>
                </div>

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
              </div>
            </div>

            <div className="form-row full-width">
              <div className="form-actions">
                <Button
                  variant="outlined"
                  onClick={() => navigate("/product-management")}
                  className="cancel-button"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  className="submit-button"
                >
                  {isEditMode ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </div>
          </div>
        </Paper>
      </Container>
    </div>
  );
};

export default AddProduct;
