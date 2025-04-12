import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import ICategory from "../../../entities/ICategory";
import "./CategoryManagement.scss";
import { axiosInstance } from "../../../config/axiosConfig";

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  );
  const [actionType, setActionType] = useState<string>("");

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
      const response = await axiosInstance.post("/category/add", {name:newCategoryName});
      console.log("the respnes", response);
      if (response) {
        setIsAddModalOpen(false);
        setNewCategoryName("");
        fetchCategories();
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleAction = async (): Promise<void> => {
    try {
      const endpoint =
        actionType === "delete"
          ? `/api/categories/${selectedCategory?._id}/delete`
          : `/api/categories/${selectedCategory?._id}/unlist`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isDeleted:
            actionType === "delete" ? "true" : selectedCategory?.isDeleted,
          isActive:
            actionType === "unlist"
              ? selectedCategory?.isActive === "true"
                ? "false"
                : "true"
              : selectedCategory?.isActive,
        }),
      });
      if (response.ok) {
        setIsActionModalOpen(false);
        setSelectedCategory(null);
        fetchCategories();
      }
    } catch (error) {
      console.error(`Error ${actionType} category:`, error);
    }
  };

  const openActionModal = (category: ICategory, type: string): void => {
    setSelectedCategory(category);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  // Modal style
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 1,
  };

  return (
    <div className="category-management">
      <h1>Category Management</h1>
      <Button
        variant="contained"
        className="add-button"
        onClick={() => setIsAddModalOpen(true)}
      >
        Add Category
      </Button>

      {categories.length === 0 ? (
        <div className="no-data-placeholder">
          <p>No categories found. Add a new category to get started!</p>
        </div>
      ) : (
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
                <td>{category.isActive === "true" ? "Active" : "Inactive"}</td>
                <td>
                  {new Date(category.createdAt as Date).toLocaleDateString()}
                </td>
                <td>
                  <Button
                    variant="outlined"
                    color="error"
                    className="delete-button"
                    onClick={() => openActionModal(category, "delete")}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outlined"
                    className="list-button"
                    sx={{ ml: 1 }}
                    onClick={() => openActionModal(category, "unlist")}
                  >
                    {category.isActive === "true" ? "Unlist" : "List"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            margin="normal"
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setIsAddModalOpen(false)} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddCategory}>
              Add
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal
        open={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        aria-labelledby="action-modal"
      >
        <Box sx={modalStyle}>
          <Typography id="action-modal" variant="h6" component="h2" mb={2}>
            {actionType === "delete"
              ? `Are you sure you want to delete ${selectedCategory?.name}?`
              : `Are you sure you want to ${
                  selectedCategory?.isActive === "true" ? "unlist" : "list"
                } ${selectedCategory?.name}?`}
          </Typography>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setIsActionModalOpen(false)} sx={{ mr: 1 }}>
              No
            </Button>
            <Button
              variant="contained"
              color={actionType === "delete" ? "error" : "primary"}
              onClick={handleAction}
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
