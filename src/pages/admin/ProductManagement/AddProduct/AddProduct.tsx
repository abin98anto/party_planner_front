import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../../config/axiosConfig";
import handleFileUpload, {
  validateImageFile,
} from "../../../../shared/fileUpload";
import type ICategory from "../../../../entities/ICategory";
import type IProvider from "../../../../entities/IProvider";
import type IProduct from "../../../../entities/IProduct";
import Calendar from "./calender";
import "./AddProduct.scss";

const AddProduct: React.FC = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const calendarRef = useRef<HTMLDivElement>(null);
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

    // Close calendar when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
      [name]: name === "price" ? Number.parseFloat(value) : value,
    });
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setProductForm({
      ...productForm,
      [name]: value,
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

  const handleDateSelection = (selectedDates: Date[]): void => {
    setProductForm({
      ...productForm,
      datesAvailable: selectedDates,
    });
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
          navigate("/admin/product-management");
        }
      } else {
        const response = await axiosInstance.post("/product/add", productData);
        if (response.status === 201) {
          navigate("/admin/product-management");
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  return (
    <div className="add-product">
      <div className="container">
        <div className="form-container">
          <h1 className="form-title centered">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>

          <form className="form-content" onSubmit={handleSubmit}>
            <div className="form-row full-width">
              <div className="form-field">
                <label htmlFor="name">Product Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row full-width">
              <div className="form-field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={productForm.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row three-col">
              <div className="form-field">
                <label htmlFor="categoryId">Category</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={productForm.categoryId}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="providerId">Service Provider</label>
                <select
                  id="providerId"
                  name="providerId"
                  value={productForm.providerId}
                  onChange={handleSelectChange}
                >
                  <option value="">Select a provider</option>
                  {providers.map((provider) => (
                    <option key={provider._id} value={provider._id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="price">Price</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={productForm.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row full-width">
              <div className="section-container">
                <h2 className="section-title">Images</h2>

                <button
                  type="button"
                  className="upload-button"
                  disabled={isUploading}
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  {isUploading ? "Uploading..." : "Upload Images"}
                </button>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  hidden
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/png,image/gif"
                />

                <div className="image-preview-container">
                  {productForm.images.map((image, index) => (
                    <div key={index} className="image-preview-item">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Product ${index}`}
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="image-remove-btn"
                        onClick={() => handleRemoveImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-row full-width">
              <div className="section-container">
                <h2 className="section-title">Dates Available</h2>

                <div className="date-picker-container">
                  <button
                    type="button"
                    className="calendar-toggle-button"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    Select Dates
                  </button>

                  {showCalendar && (
                    <>
                      <div
                        className="calendar-overlay"
                        onClick={() => setShowCalendar(false)}
                      ></div>
                      <div
                        className="calendar-modal-container"
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

                <div className="date-chips-container">
                  {productForm.datesAvailable.map((date, index) => (
                    <div key={index} className="date-chip">
                      {formatDate(date)}
                      <button
                        type="button"
                        className="date-remove-btn"
                        onClick={() => handleRemoveDate(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-row full-width">
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => navigate("/admin/product-management")}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {isEditMode ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
