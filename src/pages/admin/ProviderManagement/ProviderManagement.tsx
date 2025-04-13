import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import "./ProviderManagement.scss";
import { axiosInstance } from "../../../config/axiosConfig";
import IProvider from "../../../entities/IProvider";

const ProviderManagement: React.FC = () => {
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [contact, setContact] = useState<number | string>("");
  const [locations, setLocations] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<IProvider | null>(
    null
  );
  const validateLocations = (): boolean => {
    if (!locations.trim()) {
      setLocationError("At least one location is required");
      return false;
    }
    setLocationError("");
    return true;
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get("/provider");
      const data: IProvider[] = await response.data.data;
      setProviders(data);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const handleAddProvider = async (): Promise<void> => {
    try {
      if (!validateLocations()) {
        return;
      }

      const locationArray = locations
        .split(",")
        .map((loc) => loc.trim())
        .filter((loc) => loc !== "");

      const response = await axiosInstance.post("/provider/add", {
        name,
        company,
        contact: Number(contact),
        locations: locationArray,
      });
      if (response) {
        setIsAddModalOpen(false);
        resetForm();
        fetchProviders();
      }
    } catch (error) {
      console.error("Error adding provider:", error);
    }
  };

  const handleEditProvider = async (): Promise<void> => {
    try {
      if (!validateLocations()) {
        return;
      }

      const locationArray = locations
        .split(",")
        .map((loc) => loc.trim())
        .filter((loc) => loc !== "");

      const response = await axiosInstance.put("/provider/update", {
        _id: selectedProvider?._id,
        name,
        company,
        contact: Number(contact),
        locations: locationArray,
      });

      if (response.status === 200) {
        setIsEditModalOpen(false);
        setSelectedProvider(null);
        resetForm();
        fetchProviders();
      }
    } catch (error) {
      console.error("Error updating provider:", error);
    }
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
      }
    } catch (error) {
      console.log("Error deleting provider", error);
    }
  };

  const handleToggleListStatus = async (): Promise<void> => {
    try {
      // Toggle the isActive status
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
      }
    } catch (error) {
      console.error("Error updating provider list status:", error);
    }
  };

  const resetForm = (): void => {
    setName("");
    setCompany("");
    setContact("");
    setLocations("");
    setLocationError("");
  };

  const openEditModal = (provider: IProvider): void => {
    setSelectedProvider(provider);
    setName(provider.name);
    setCompany(provider.company);
    setContact(provider.contact);
    setLocations(provider.locations.join(","));
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
    <div className="provider-management">
      <div className="provider-container">
        <div className="header">
          <h1>Provider Management</h1>
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
                          {provider.locations.map((location, index) => (
                            <span key={index} className="location-tag">
                              {location}
                              {index < provider.locations.length - 1
                                ? ", "
                                : ""}
                            </span>
                          ))}
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
            label="Provider Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            label="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
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
            label="Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            margin="normal"
            type="number"
            InputLabelProps={{
              style: { color: "#aaa" },
            }}
            InputProps={{
              style: { color: "white" },
            }}
          />
          {/* <LocationInputField /> */}
          <TextField
            fullWidth
            label="Locations (comma separated)*"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            margin="normal"
            error={!!locationError}
            helperText={locationError || "Enter locations separated by commas"}
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
            label="Provider Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            label="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
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
            label="Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            margin="normal"
            type="number"
            InputLabelProps={{
              style: { color: "#aaa" },
            }}
            InputProps={{
              style: { color: "white" },
            }}
          />
          <TextField
            fullWidth
            label="Locations (comma separated)*"
            value={locations.split(",")}
            onChange={(e) => setLocations(e.target.value)}
            margin="normal"
            error={!!locationError}
            helperText={locationError || "Enter locations separated by commas"}
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
  );
};

export default ProviderManagement;
