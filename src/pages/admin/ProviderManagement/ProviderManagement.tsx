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
import "./ProviderManagement.scss";
import axiosInstance from "../../../config/axiosConfig";
import IProvider from "../../../entities/IProvider";
import ILocation from "../../../entities/ILocation";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../../components/common/CustomSanckbar/CustomSnackbar";

interface IPaginationData {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

interface FormErrors {
  name: string;
  company: string;
  contact: string;
  locations: string;
}

const ProviderManagement: React.FC = () => {
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [contact, setContact] = useState<number | string>("");
  const [selectedProvider, setSelectedProvider] = useState<IProvider | null>(
    null
  );
  const [availableLocations, setAvailableLocations] = useState<ILocation[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<ILocation[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: "",
    company: "",
    contact: "",
    locations: "",
  });
  const [pagination, setPagination] = useState<IPaginationData>({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 6,
  });
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const fetchLocations = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get("/location");
      const data: ILocation[] = await response.data.data;
      setAvailableLocations(
        data.filter((loc) => loc.isActive && !loc.isDeleted)
      );
    } catch (error) {
      console.error("Error fetching locations:", error);
      showSnackbar(
        "Failed to fetch locations. Please try again later.",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchLocations();
  }, [pagination.currentPage]);

  const fetchProviders = async (search: string = searchTerm): Promise<void> => {
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: search,
      };

      const response = await axiosInstance.get("/provider", { params });
      if (response.data.success) {
        const { data, pagination: paginationData } = response.data;
        setProviders(data);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      showSnackbar(
        "Failed to fetch providers. Please try again later.",
        "error"
      );
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
    fetchProviders(searchTerm);
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

  const handleDeleteProvider = async (): Promise<void> => {
    try {
      const response = await axiosInstance.put("/provider/update", {
        _id: selectedProvider?._id,
        isDeleted: true,
      });

      if (response.status === 200) {
        setIsDeleteModalOpen(false);
        setSelectedProvider(null);
        fetchProviders();
        showSnackbar("Provider deleted successfully!", "success");
      }
    } catch (error) {
      console.log("Error deleting provider", error);
      showSnackbar("Failed to delete provider. Please try again.", "error");
    }
  };

  const handleToggleListStatus = async (): Promise<void> => {
    try {
      const newActiveStatus =
        selectedProvider?.isActive === true ? false : true;

      const response = await axiosInstance.put("/provider/update", {
        _id: selectedProvider?._id,
        isActive: newActiveStatus,
      });

      if (response.status === 200) {
        setIsListModalOpen(false);
        setSelectedProvider(null);
        fetchProviders();
        showSnackbar(
          `Provider ${newActiveStatus ? "listed" : "unlisted"} successfully!`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error updating provider list status:", error);
      showSnackbar(
        "Failed to update provider status. Please try again.",
        "error"
      );
    }
  };

  const resetForm = (): void => {
    setName("");
    setCompany("");
    setContact("");
    setSelectedLocations([]);
    setFormErrors({
      name: "",
      company: "",
      contact: "",
      locations: "",
    });
  };

  const openEditModal = (provider: IProvider): void => {
    setSelectedProvider(provider);
    setName(provider.name);
    setCompany(provider.company);
    setContact(provider.contact);
    setSelectedLocations(provider.locations);
    setFormErrors({
      name: "",
      company: "",
      contact: "",
      locations: "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (provider: IProvider): void => {
    setSelectedProvider(provider);
    setIsDeleteModalOpen(true);
  };

  const openListModal = (provider: IProvider): void => {
    setSelectedProvider(provider);
    setIsListModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {
      name: "",
      company: "",
      contact: "",
      locations: "",
    };
    let isValid = true;

    if (!name.trim()) {
      errors.name = "Provider name is required";
      isValid = false;
    }

    if (!company.trim()) {
      errors.company = "Company name is required";
      isValid = false;
    }

    if (!contact) {
      errors.contact = "Contact number is required";
      isValid = false;
    } else if (!/^\d+$/.test(String(contact))) {
      errors.contact = "Contact must be a valid number";
      isValid = false;
    }

    if (selectedLocations.length === 0) {
      errors.locations = "At least one location is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddProvider = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axiosInstance.post("/provider/add", {
        name,
        company,
        contact: Number(contact),
        locations: selectedLocations,
      });
      if (response) {
        setIsAddModalOpen(false);
        resetForm();
        fetchProviders();
        showSnackbar("Provider added successfully!", "success");
      }
    } catch (error) {
      console.error("Error adding provider:", error);
      showSnackbar("Failed to add provider. Please try again.", "error");
    }
  };

  const handleEditProvider = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axiosInstance.put("/provider/update", {
        _id: selectedProvider?._id,
        name,
        company,
        contact: Number(contact),
        locations: selectedLocations,
      });

      if (response.status === 200) {
        setIsEditModalOpen(false);
        setSelectedProvider(null);
        resetForm();
        fetchProviders();
        showSnackbar("Provider updated successfully!", "success");
      }
    } catch (error) {
      console.error("Error updating provider:", error);
      showSnackbar("Failed to update provider. Please try again.", "error");
    }
  };

  const handleLocationChange = (location: ILocation): void => {
    setSelectedLocations((prevSelected) => {
      const isAlreadySelected = prevSelected.some(
        (loc) => loc._id === location._id
      );

      if (isAlreadySelected) {
        return prevSelected.filter((loc) => loc._id !== location._id);
      } else {
        return [...prevSelected, location];
      }
    });

    if (formErrors.locations && selectedLocations.length > 0) {
      setFormErrors((prev) => ({
        ...prev,
        locations: "",
      }));
    }
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
      <div className="provider-management">
        <div className="provider-container">
          <div className="header">
            <h1>Provider Management</h1>
            <div className="top-controls">
              <div className="search-container">
                <TextField
                  className="search-input"
                  placeholder="Search providers..."
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
                  resetForm();
                  setIsAddModalOpen(true);
                }}
              >
                Add Provider
              </Button>
            </div>
          </div>

          {providers.length === 0 ? (
            <div className="no-data-placeholder">
              <p>No providers found. Add a new provider to get started!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="provider-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Locations</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr key={provider._id}>
                      <td>{provider.name}</td>
                      <td>{provider.company}</td>
                      <td>{provider.contact}</td>
                      <td>
                        {provider.locations && provider.locations.length > 0 ? (
                          <div className="location-tags">
                            {provider.locations.map(
                              (location: ILocation, index) => (
                                <span key={index} className="location-tag">
                                  {location.name}
                                  {index < provider.locations.length - 1
                                    ? ", "
                                    : ""}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          "No locations"
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            provider.isActive === true ? "active" : "inactive"
                          }`}
                        >
                          {provider.isActive === true ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {provider.createdAt &&
                          new Date(
                            provider.createdAt as Date
                          ).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button edit"
                            onClick={() => openEditModal(provider)}
                          >
                            EDIT
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() => openDeleteModal(provider)}
                          >
                            DELETE
                          </button>
                          <button
                            className="action-button list"
                            onClick={() => openListModal(provider)}
                          >
                            {provider.isActive === true ? "UNLIST" : "LIST"}
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

        {/* Add Provider Modal */}
        <Modal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          aria-labelledby="add-provider-modal"
        >
          <Box sx={modalStyle}>
            <Typography
              id="add-provider-modal"
              variant="h6"
              component="h2"
              mb={2}
            >
              Add New Provider
            </Typography>
            <TextField
              fullWidth
              label="Provider Name*"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) {
                  setFormErrors((prev) => ({ ...prev, name: "" }));
                }
              }}
              margin="normal"
              error={!!formErrors.name}
              helperText={formErrors.name}
              InputLabelProps={{
                style: { color: "#aaa" },
              }}
              InputProps={{
                style: { color: "white" },
              }}
              FormHelperTextProps={{
                style: { color: "#f44336" },
              }}
            />
            <TextField
              fullWidth
              label="Company Name*"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                if (e.target.value.trim()) {
                  setFormErrors((prev) => ({ ...prev, company: "" }));
                }
              }}
              margin="normal"
              error={!!formErrors.company}
              helperText={formErrors.company}
              InputLabelProps={{
                style: { color: "#aaa" },
              }}
              InputProps={{
                style: { color: "white" },
              }}
              FormHelperTextProps={{
                style: { color: "#f44336" },
              }}
            />
            <TextField
              fullWidth
              label="Contact Number*"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                if (e.target.value && /^\d+$/.test(e.target.value)) {
                  setFormErrors((prev) => ({ ...prev, contact: "" }));
                }
              }}
              margin="normal"
              type="number"
              error={!!formErrors.contact}
              helperText={formErrors.contact}
              InputLabelProps={{
                style: { color: "#aaa" },
              }}
              InputProps={{
                style: { color: "white" },
              }}
              FormHelperTextProps={{
                style: { color: "#f44336" },
              }}
            />
            <Typography
              variant="subtitle1"
              sx={{ mt: 2, mb: 1, color: "#aaa" }}
            >
              Locations*
            </Typography>
            {formErrors.locations && (
              <Typography color="error" variant="caption">
                {formErrors.locations}
              </Typography>
            )}
            <Box
              sx={{
                maxHeight: "150px",
                overflowY: "auto",
                border: formErrors.locations
                  ? "1px solid #f44336"
                  : "1px solid #555",
                borderRadius: 1,
                p: 1,
              }}
            >
              {availableLocations.length > 0 ? (
                availableLocations.map((location) => (
                  <Box
                    key={location._id}
                    sx={{ display: "flex", alignItems: "center", mb: 1 }}
                  >
                    <input
                      type="checkbox"
                      id={`location-${location._id}`}
                      checked={selectedLocations.some(
                        (loc) => loc._id === location._id
                      )}
                      onChange={() => handleLocationChange(location)}
                      style={{ marginRight: "8px" }}
                    />
                    <label htmlFor={`location-${location._id}`}>
                      {location.name}
                    </label>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "#888" }}>
                  No locations available
                </Typography>
              )}
            </Box>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => setIsAddModalOpen(false)}
                sx={{ mr: 1, color: "white" }}
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={handleAddProvider}>
                Add
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Edit Provider Modal */}
        <Modal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          aria-labelledby="edit-provider-modal"
        >
          <Box sx={modalStyle}>
            <Typography
              id="edit-provider-modal"
              variant="h6"
              component="h2"
              mb={2}
            >
              Edit Provider
            </Typography>
            <TextField
              fullWidth
              label="Provider Name*"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) {
                  setFormErrors((prev) => ({ ...prev, name: "" }));
                }
              }}
              margin="normal"
              error={!!formErrors.name}
              helperText={formErrors.name}
              InputLabelProps={{
                style: { color: "#aaa" },
              }}
              InputProps={{
                style: { color: "white" },
              }}
              FormHelperTextProps={{
                style: { color: "#f44336" },
              }}
            />
            <TextField
              fullWidth
              label="Company Name*"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                if (e.target.value.trim()) {
                  setFormErrors((prev) => ({ ...prev, company: "" }));
                }
              }}
              margin="normal"
              error={!!formErrors.company}
              helperText={formErrors.company}
              InputLabelProps={{
                style: { color: "#aaa" },
              }}
              InputProps={{
                style: { color: "white" },
              }}
              FormHelperTextProps={{
                style: { color: "#f44336" },
              }}
            />
            <TextField
              fullWidth
              label="Contact Number*"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                if (e.target.value && /^\d+$/.test(e.target.value)) {
                  setFormErrors((prev) => ({ ...prev, contact: "" }));
                }
              }}
              margin="normal"
              type="number"
              error={!!formErrors.contact}
              helperText={formErrors.contact}
              InputLabelProps={{
                style: { color: "#aaa" },
              }}
              InputProps={{
                style: { color: "white" },
              }}
              FormHelperTextProps={{
                style: { color: "#f44336" },
              }}
            />
            <Typography
              variant="subtitle1"
              sx={{ mt: 2, mb: 1, color: "#aaa" }}
            >
              Locations*
            </Typography>
            {formErrors.locations && (
              <Typography color="error" variant="caption">
                {formErrors.locations}
              </Typography>
            )}
            <Box
              sx={{
                maxHeight: "150px",
                overflowY: "auto",
                border: formErrors.locations
                  ? "1px solid #f44336"
                  : "1px solid #555",
                borderRadius: 1,
                p: 1,
              }}
            >
              {availableLocations.length > 0 ? (
                availableLocations.map((location) => (
                  <Box
                    key={location._id}
                    sx={{ display: "flex", alignItems: "center", mb: 1 }}
                  >
                    <input
                      type="checkbox"
                      id={`location-edit-${location._id}`}
                      checked={selectedLocations.some(
                        (loc) => loc._id === location._id
                      )}
                      onChange={() => handleLocationChange(location)}
                      style={{ marginRight: "8px" }}
                    />
                    <label htmlFor={`location-edit-${location._id}`}>
                      {location.name}
                    </label>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "#888" }}>
                  No locations available
                </Typography>
              )}
            </Box>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => setIsEditModalOpen(false)}
                sx={{ mr: 1, color: "white" }}
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={handleEditProvider}>
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
              Are you sure you want to delete {selectedProvider?.name}?
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
                onClick={handleDeleteProvider}
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
              {selectedProvider?.isActive === true ? "unlist" : "list"}{" "}
              {selectedProvider?.name}?
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

export default ProviderManagement;
