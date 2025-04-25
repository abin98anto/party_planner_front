import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import "./ProviderManagement.scss";
import axiosInstance from "../../../config/axiosConfig";
import IProvider from "../../../entities/IProvider";
import ILocation from "../../../entities/ILocation";

const ProviderManagement: React.FC = () => {
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [contact, setContact] = useState<number | string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<IProvider | null>(
    null
  );
  const [availableLocations, setAvailableLocations] = useState<ILocation[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<ILocation[]>([]);

  const fetchLocations = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get("/location");
      const data: ILocation[] = await response.data.data;
      setAvailableLocations(
        data.filter((loc) => loc.isActive && !loc.isDeleted)
      );
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchLocations();
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
    setSelectedLocations([]);
    setLocationError("");
  };

  const openEditModal = (provider: IProvider): void => {
    setSelectedProvider(provider);
    setName(provider.name);
    setCompany(provider.company);
    setContact(provider.contact);
    setSelectedLocations(provider.locations);
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

  const handleAddProvider = async (): Promise<void> => {
    try {
      if (selectedLocations.length === 0) {
        setLocationError("At least one location is required");
        return;
      }

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
      }
    } catch (error) {
      console.error("Error adding provider:", error);
    }
  };

  const handleEditProvider = async (): Promise<void> => {
    try {
      if (selectedLocations.length === 0) {
        setLocationError("At least one location is required");
        return;
      }

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
      }
    } catch (error) {
      console.error("Error updating provider:", error);
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

    if (locationError && selectedLocations.length > 0) {
      setLocationError("");
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
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: "#aaa" }}>
            Locations*
          </Typography>
          {locationError && (
            <Typography color="error" variant="caption">
              {locationError}
            </Typography>
          )}
          <Box
            sx={{
              maxHeight: "150px",
              overflowY: "auto",
              border: locationError ? "1px solid #f44336" : "1px solid #555",
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
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: "#aaa" }}>
            Locations*
          </Typography>
          {locationError && (
            <Typography color="error" variant="caption">
              {locationError}
            </Typography>
          )}
          <Box
            sx={{
              maxHeight: "150px",
              overflowY: "auto",
              border: locationError ? "1px solid #f44336" : "1px solid #555",
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
