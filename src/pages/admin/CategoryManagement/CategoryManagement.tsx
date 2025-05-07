import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import ICategory from "../../../entities/ICategory";
import "./CategoryManagement.scss";
import axiosInstance from "../../../config/axiosConfig";
import { AxiosError } from "axios";

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get("/category");
      const data: ICategory[] = await response.data.data;
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddCategory = async (): Promise<void> => {
    try {
      const response = await axiosInstance.post("/category/add", {
        name: categoryName,
      });
      if (response) {
        setIsAddModalOpen(false);
        setCategoryName("");
        fetchCategories();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error adding category:", error.response?.data);
      }
    }
  };

  const handleEditCategory = async (): Promise<void> => {
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
      }
    } catch (error) {
      console.error("Error updating category:", error);
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
      }
    } catch (error) {
      console.log("Error deleting category", error);
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
      }
    } catch (error) {
      console.error("Error updating category list status:", error);
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
    <div className="category-management">
      <div className="category-container">
        <div className="header">
          <h1>Category Management</h1>
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
  );
};

export default CategoryManagement;
