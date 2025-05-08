/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ICategory from "../../../entities/ICategory";
import "./CategoryManagement.scss";
import axiosInstance from "../../../config/axiosConfig";
import { AxiosError } from "axios";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../../components/common/CustomSanckbar/CustomSnackbar";

interface IPaginationData {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [categoryName, setCategoryName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<IPaginationData>({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 6,
  });
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  useEffect(() => {
    fetchCategories();
  }, [pagination.currentPage]);

  const fetchCategories = async (
    search: string = searchTerm
  ): Promise<void> => {
    try {
      const response = await axiosInstance.get("/category", {
        params: {
          page: pagination.currentPage,
          limit: pagination.limit,
          search: search,
        },
      });

      const { data, pagination: paginationData } = response.data;
      setCategories(data);
      setPagination(paginationData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showSnackbar(
        "Failed to fetch categories. Please try again later.",
        "error"
      );
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
    fetchCategories(searchTerm);
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

  const checkDuplicateName = (name: string, currentId?: string): boolean => {
    return categories.some(
      (category) =>
        category.name.toLowerCase() === name.toLowerCase() &&
        category._id !== currentId &&
        !category.isDeleted
    );
  };

  const handleAddCategory = async (): Promise<void> => {
    try {
      if (!categoryName.trim()) {
        showSnackbar("Category name cannot be empty!", "error");
        return;
      }

      if (checkDuplicateName(categoryName)) {
        showSnackbar("Category name already exists!", "error");
        return;
      }

      const response = await axiosInstance.post("/category/add", {
        name: categoryName,
      });
      if (response) {
        setIsAddModalOpen(false);
        setCategoryName("");
        fetchCategories();
        showSnackbar("Category added successfully!", "success");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error adding category:", error.response?.data);
        showSnackbar(
          error.response?.data?.message ||
            "Failed to add category. Please try again.",
          "error"
        );
      }
    }
  };

  const handleEditCategory = async (): Promise<void> => {
    if (!categoryName.trim()) {
      showSnackbar("Category name cannot be empty!", "error");
      return;
    }

    if (checkDuplicateName(categoryName, selectedCategory?._id)) {
      showSnackbar("Category name already exists!", "error");
      return;
    }

    try {
      const response = await axiosInstance.put("/category/update", {
        _id: selectedCategory?._id,
        name: categoryName,
      });

      if (response.status === 200) {
        setIsEditModalOpen(false);
        setSelectedCategory(null);
        setCategoryName("");
        fetchCategories();
        showSnackbar("Category updated successfully!", "success");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      showSnackbar("Failed to update category. Please try again.", "error");
    }
  };

  const handleDeleteCategory = async (): Promise<void> => {
    try {
      const response = await axiosInstance.put("/category/update", {
        _id: selectedCategory?._id,
        isDeleted: true,
      });

      if (response.status === 200) {
        setIsDeleteModalOpen(false);
        setSelectedCategory(null);
        fetchCategories();
        showSnackbar("Category deleted successfully!", "success");
      }
    } catch (error) {
      console.log("Error deleting category", error);
      showSnackbar("Failed to delete category. Please try again.", "error");
    }
  };

  const handleToggleListStatus = async (): Promise<void> => {
    try {
      const newActiveStatus =
        selectedCategory?.isActive === true ? false : true;

      const response = await axiosInstance.put("/category/update", {
        _id: selectedCategory?._id,
        isActive: newActiveStatus,
      });

      if (response.status === 200) {
        setIsListModalOpen(false);
        setSelectedCategory(null);
        fetchCategories();
        showSnackbar(
          `Category ${newActiveStatus ? "listed" : "unlisted"} successfully!`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error updating category list status:", error);
      showSnackbar(
        "Failed to update category status. Please try again.",
        "error"
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const openEditModal = (category: ICategory): void => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category: ICategory): void => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const openListModal = (category: ICategory): void => {
    setSelectedCategory(category);
    setIsListModalOpen(true);
  };

  const modalStyle = {
    position: "absolute",
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

  return (
    <>
      <div className="category-management">
        <div className="category-container">
          <div className="header">
            <h1>Category Management</h1>
            <div className="top-controls">
              <div className="search-container">
                <TextField
                  className="search-input"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                onClick={() => {
                  setCategoryName("");
                  setIsAddModalOpen(true);
                }}
              >
                Add Category
              </Button>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="no-data-placeholder">
              <p>No categories found. Add a new category to get started!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="category-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td>{category.name}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            category.isActive === true ? "active" : "inactive"
                          }`}
                        >
                          {category.isActive === true ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {new Date(
                          category.createdAt as Date
                        ).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button edit"
                            onClick={() => openEditModal(category)}
                          >
                            EDIT
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() => openDeleteModal(category)}
                          >
                            DELETE
                          </button>
                          <button
                            className="action-button list"
                            onClick={() => openListModal(category)}
                          >
                            {category.isActive === true ? "UNLIST" : "LIST"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="pagination-container">
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </div>
            </div>
          )}
        </div>

        {/* Add Category Modal */}
        <Modal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          aria-labelledby="add-category-modal"
        >
          <Box sx={modalStyle}>
            <Typography
              id="add-category-modal"
              variant="h6"
              component="h2"
              mb={2}
            >
              Add New Category
            </Typography>
            <TextField
              fullWidth
              label="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              margin="normal"
              InputLabelProps={{
                style: { color: "#aaa" },
              }}
              InputProps={{
                style: { color: "white" },
              }}
            />
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => setIsAddModalOpen(false)}
                sx={{ mr: 1, color: "white" }}
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={handleAddCategory}>
                Add
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Edit Category Modal */}
        <Modal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          aria-labelledby="edit-category-modal"
        >
          <Box sx={modalStyle}>
            <Typography
              id="edit-category-modal"
              variant="h6"
              component="h2"
              mb={2}
            >
              Edit Category
            </Typography>
            <TextField
              fullWidth
              label="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              margin="normal"
              InputLabelProps={{
                style: { color: "#aaa" },
              }}
              InputProps={{
                style: { color: "white" },
              }}
            />
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => setIsEditModalOpen(false)}
                sx={{ mr: 1, color: "white" }}
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={handleEditCategory}>
                Update
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
              Are you sure you want to delete {selectedCategory?.name}?
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
                onClick={handleDeleteCategory}
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
              {selectedCategory?.isActive === true ? "unlist" : "list"}{" "}
              {selectedCategory?.name}?
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

export default CategoryManagement;
