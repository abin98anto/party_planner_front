import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../../config/axiosConfig";
import handleFileUpload, {
  validateImageFile,
} from "../../../../shared/fileUpload";
import type ICategory from "../../../../entities/ICategory";
import type IProvider from "../../../../entities/IProvider";
import type IProduct from "../../../../entities/IProduct";
import Calendar from "./calender";
import "./AddProduct.scss";
import useSnackbar from "../../../../hooks/useSnackbar";
import CustomSnackbar from "../../../../components/common/CustomSanckbar/CustomSnackbar";

interface ValidationErrors {
  name?: string;
  description?: string;
  categoryId?: string;
  providerId?: string;
  price?: string;
  images?: string;
  datesAvailable?: string;
}

const AddProduct: React.FC = () => {
  const { state } = useLocation();
  const productId = state?.productId;
  const navigate = useNavigate();
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const isEditMode = !!productId;

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
    if (productId) fetchProductDetails(productId);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [productId]);

  const fetchProductDetails = async (id: string): Promise<void> => {
    try {
      const response = await axiosInstance.get(`/product/${id}`);
      const productData = response.data.data;
      const categoryId = productData.categoryId?._id || productData.categoryId;
      const providerId = productData.providerId?._id || productData.providerId;
      setProductForm({ ...productData, categoryId, providerId });
    } catch (error) {
      showSnackbar("Error fetching product details", "error");
    }
  };

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get("/category");
      setCategories(
        response.data.data.filter((category: ICategory) => category.isActive)
      );
    } catch (error) {
      showSnackbar("Error fetching categories", "error");
    }
  };

  const fetchProviders = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get("/provider");
      setProviders(
        response.data.data.filter((provider: IProvider) => provider.isActive)
      );
    } catch (error) {
      showSnackbar("Error fetching providers", "error");
    }
  };

  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Product name is required";
        if (value.trim().length < 3)
          return "Name must be at least 3 characters";
        if (value.trim().length > 100)
          return "Name must be less than 100 characters";
        return undefined;
      case "description":
        if (!value.trim()) return "Description is required";
        if (value.length > 1000)
          return "Description must be less than 1000 characters";
        return undefined;
      case "categoryId":
        if (!value) return "Category is required";
        return undefined;
      case "providerId":
        if (!value) return "Service provider is required";
        return undefined;
      case "price":
        if (value === undefined || value === null || value === "")
          return "Price is required";
        if (isNaN(Number(value)) || Number(value) <= 0)
          return "Price must be a positive number";
        return undefined;
      case "images":
        if (value.length === 0) return "At least one image is required";
        return undefined;
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    Object.entries(productForm).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key as keyof ValidationErrors] = error;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showSnackbar(
        newErrors.name ||
          newErrors.description ||
          newErrors.categoryId ||
          newErrors.providerId ||
          newErrors.price ||
          newErrors.images ||
          "Please fix the errors",
        "error"
      );
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (name: string): void => {
    setTouched({ ...touched, [name]: true });
    const error = validateField(
      name,
      productForm[name as keyof typeof productForm]
    );
    setErrors({ ...errors, [name]: error });
    if (error) showSnackbar(error, "error");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    const newValue =
      name === "price" ? (value === "" ? "" : Number.parseFloat(value)) : value;
    setProductForm({ ...productForm, [name]: newValue });
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors({ ...errors, [name]: error });
      if (error) showSnackbar(error, "error");
    }
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value });
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
      if (error) showSnackbar(error, "error");
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validateImageFile(file)) {
        showSnackbar(
          "Invalid image file. Only JPEG, PNG, and GIF are supported.",
          "error"
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar("Image size must be less than 5MB", "error");
        return;
      }
    }
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) =>
        handleFileUpload(file, { validateFile: validateImageFile })
      );
      const results = await Promise.all(uploadPromises);
      const uploadedUrls = results
        .filter((result) => result.success && result.url)
        .map((result) => result.url as string);
      const newImages = [...productForm.images, ...uploadedUrls];
      setProductForm({ ...productForm, images: newImages });
      if (newImages.length > 0 && errors.images) {
        setErrors({ ...errors, images: undefined });
      }
    } catch (error) {
      showSnackbar("Failed to upload images. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number): void => {
    const newImages = productForm.images.filter(
      (_, index) => index !== indexToRemove
    );
    setProductForm({ ...productForm, images: newImages });
    if (newImages.length === 0) {
      showSnackbar("At least one image is required", "error");
      setErrors({ ...errors, images: "At least one image is required" });
    }
  };

  const handleDateSelection = (selectedDates: Date[]): void => {
    setProductForm({ ...productForm, datesAvailable: selectedDates });
    setShowCalendar(false);
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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const allTouched: Record<string, boolean> = {};
    Object.keys(productForm).forEach((key) => (allTouched[key] = true));
    setTouched(allTouched);
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const productData = { ...productForm };
      if (isEditMode) {
        const response = await axiosInstance.put(
          "/product/update",
          productData
        );
        if (response.status === 200) navigate("/admin/product-management");
      } else {
        const response = await axiosInstance.post("/product/add", productData);
        if (response.status === 201) navigate("/admin/product-management");
      }
    } catch (error) {
      showSnackbar("Failed to save product. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasError = (fieldName: string): boolean => {
    return !!(
      touched[fieldName] && errors[fieldName as keyof ValidationErrors]
    );
  };

  return (
    <div className="prod-mgmt-add-product">
      <div className="prod-mgmt-container">
        <div className="prod-mgmt-form-container">
          <h1 className="prod-mgmt-form-title prod-mgmt-centered">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <form className="prod-mgmt-form-content" onSubmit={handleSubmit}>
            <div className="prod-mgmt-form-row prod-mgmt-full-width">
              <div className="prod-mgmt-form-field">
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("name")}
                  className={hasError("name") ? "prod-mgmt-invalid" : ""}
                  placeholder=" "
                />
                <label
                  htmlFor="name"
                  className={productForm.name ? "prod-mgmt-label-filled" : ""}
                >
                  Product Name*
                </label>
              </div>
            </div>
            <div className="prod-mgmt-form-row prod-mgmt-full-width">
              <div className="prod-mgmt-form-field">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={productForm.description}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("description")}
                  className={hasError("description") ? "prod-mgmt-invalid" : ""}
                  placeholder=" "
                />
                <label
                  htmlFor="description"
                  className={
                    productForm.description ? "prod-mgmt-label-filled" : ""
                  }
                >
                  Description*
                </label>
              </div>
            </div>
            <div className="prod-mgmt-form-row prod-mgmt-three-col">
              <div className="prod-mgmt-form-field">
                <select
                  id="categoryId"
                  name="categoryId"
                  value={productForm.categoryId}
                  onChange={handleSelectChange}
                  onBlur={() => handleBlur("categoryId")}
                  className={hasError("categoryId") ? "prod-mgmt-invalid" : ""}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <label
                  htmlFor="categoryId"
                  className={
                    productForm.categoryId ? "prod-mgmt-label-filled" : ""
                  }
                >
                  Category*
                </label>
              </div>
              <div className="prod-mgmt-form-field">
                <select
                  id="providerId"
                  name="providerId"
                  value={productForm.providerId}
                  onChange={handleSelectChange}
                  onBlur={() => handleBlur("providerId")}
                  className={hasError("providerId") ? "prod-mgmt-invalid" : ""}
                >
                  <option value="">Select a provider</option>
                  {providers.map((provider) => (
                    <option key={provider._id} value={provider._id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                <label
                  htmlFor="providerId"
                  className={
                    productForm.providerId ? "prod-mgmt-label-filled" : ""
                  }
                >
                  Service Provider*
                </label>
              </div>
              <div className="prod-mgmt-form-field">
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={productForm.price}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("price")}
                  className={hasError("price") ? "prod-mgmt-invalid" : ""}
                  min="0"
                  step="0.01"
                  placeholder=" "
                />
                <label
                  htmlFor="price"
                  className={productForm.price ? "prod-mgmt-label-filled" : ""}
                >
                  Price*
                </label>
              </div>
            </div>
            <div className="prod-mgmt-form-row prod-mgmt-full-width">
              <div className="prod-mgmt-section-container">
                <h2 className="prod-mgmt-section-title">Images*</h2>
                <button
                  type="button"
                  className="prod-mgmt-upload-button"
                  disabled={isUploading}
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  {isUploading ? (
                    <span className="prod-mgmt-spinner"></span>
                  ) : (
                    "Upload Images"
                  )}
                </button>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  hidden
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/png,image/gif"
                />
                <div className="prod-mgmt-image-preview-container">
                  {productForm.images.map((image, index) => (
                    <div key={index} className="prod-mgmt-image-preview-item">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Product ${index}`}
                        className="prod-mgmt-image-preview"
                      />
                      <button
                        type="button"
                        className="prod-mgmt-image-remove-btn"
                        onClick={() => handleRemoveImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="prod-mgmt-form-row prod-mgmt-full-width">
              <div className="prod-mgmt-section-container">
                <h2 className="prod-mgmt-section-title">Dates Available</h2>
                <div className="prod-mgmt-date-picker-container">
                  <button
                    type="button"
                    className="prod-mgmt-calendar-toggle-button"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    Select Dates
                  </button>
                  {showCalendar && (
                    <>
                      <div
                        className="prod-mgmt-calendar-overlay"
                        onClick={() => setShowCalendar(false)}
                      ></div>
                      <div
                        className="prod-mgmt-calendar-modal-container"
                        ref={calendarRef}
                      >
                        <Calendar
                          selectedDates={productForm.datesAvailable}
                          onSelectDates={handleDateSelection}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="prod-mgmt-date-chips-container">
                  {productForm.datesAvailable.map((date, index) => (
                    <div key={index} className="prod-mgmt-date-chip">
                      {formatDate(date)}
                      <button
                        type="button"
                        className="prod-mgmt-date-remove-btn"
                        onClick={() => handleRemoveDate(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="prod-mgmt-form-row prod-mgmt-full-width">
              <div className="prod-mgmt-form-actions">
                <button
                  type="button"
                  className="prod-mgmt-cancel-button"
                  onClick={() => navigate("/admin/product-management")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="prod-mgmt-submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="prod-mgmt-spinner"></span>
                  ) : isEditMode ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default AddProduct;
