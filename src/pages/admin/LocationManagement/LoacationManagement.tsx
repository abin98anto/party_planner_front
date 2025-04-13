import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import ILocation from "../../../entities/ILocation";
import "./LocationManagement.scss";
import { axiosInstance } from "../../../config/axiosConfig";

const LocationManagement: React.FC = () => {
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<ILocation | null>(
    null
  );

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get("/location");
      const data: ILocation[] = await response.data.data;
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleAddLocation = async (): Promise<void> => {
    try {
      const response = await axiosInstance.post("/location/add", {
        name: locationName,
      });
      if (response) {
        setIsAddModalOpen(false);
        setLocationName("");
        fetchLocations();
      }
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };

  const handleEditLocation = async (): Promise<void> => {
    try {
      const response = await axiosInstance.put("/location/update", {
        _id: selectedLocation?._id,
        name: locationName,
      });

      if (response.status === 200) {
        setIsEditModalOpen(false);
        setSelectedLocation(null);
        setLocationName("");
        fetchLocations();
      }
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const handleDeleteLocation = async (): Promise<void> => {
    try {
      const response = await axiosInstance.put("/location/update", {
        _id: selectedLocation?._id,
        isDeleted: true,
      });

      if (response.status === 200) {
        setIsDeleteModalOpen(false);
        setSelectedLocation(null);
        fetchLocations();
      }
    } catch (error) {
      console.log("Error deleting location", error);
    }
  };

  const handleToggleListStatus = async (): Promise<void> => {
    try {
      // Toggle the isActive status
      const newActiveStatus =
        selectedLocation?.isActive === true ? false : true;

      const response = await axiosInstance.put("/location/update", {
        _id: selectedLocation?._id,
        isActive: newActiveStatus,
      });

      if (response.status === 200) {
        setIsListModalOpen(false);
        setSelectedLocation(null);
        fetchLocations();
      }
    } catch (error) {
      console.error("Error updating location list status:", error);
    }
  };

  const openEditModal = (location: ILocation): void => {
    setSelectedLocation(location);
    setLocationName(location.name);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (location: ILocation): void => {
    setSelectedLocation(location);
    setIsDeleteModalOpen(true);
  };

  const openListModal = (location: ILocation): void => {
    setSelectedLocation(location);
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
    <div className="location-management">
      <div className="location-container">
        <div className="header">
          <h1>Location Management</h1>
          <Button
            variant="contained"
            className="add-button"
            onClick={() => {
              setLocationName("");
              setIsAddModalOpen(true);
            }}
          >
            Add Location
          </Button>
        </div>

        {locations.length === 0 ? (
          <div className="no-data-placeholder">
            <p>No locations found. Add a new location to get started!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="location-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location._id}>
                    <td>{location.name}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          location.isActive === true ? "active" : "inactive"
                        }`}
                      >
                        {location.isActive === true ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {new Date(
                        location.createdAt as Date
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-button edit"
                          onClick={() => openEditModal(location)}
                        >
                          EDIT
                        </button>
                        <button
                          className="action-button delete"
                          onClick={() => openDeleteModal(location)}
                        >
                          DELETE
                        </button>
                        <button
                          className="action-button list"
                          onClick={() => openListModal(location)}
                        >
                          {location.isActive === true ? "UNLIST" : "LIST"}
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

      {/* Add Location Modal */}
      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        aria-labelledby="add-location-modal"
      >
        <Box sx={modalStyle}>
          <Typography
            id="add-location-modal"
            variant="h6"
            component="h2"
            mb={2}
          >
            Add New Location
          </Typography>
          <TextField
            fullWidth
            label="Location Name"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
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
            <Button variant="contained" onClick={handleAddLocation}>
              Add
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Edit Location Modal */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        aria-labelledby="edit-location-modal"
      >
        <Box sx={modalStyle}>
          <Typography
            id="edit-location-modal"
            variant="h6"
            component="h2"
            mb={2}
          >
            Edit Location
          </Typography>
          <TextField
            fullWidth
            label="Location Name"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
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
            <Button variant="contained" onClick={handleEditLocation}>
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
            Are you sure you want to delete {selectedLocation?.name}?
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
              onClick={handleDeleteLocation}
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
            {selectedLocation?.isActive === true ? "unlist" : "list"}{" "}
            {selectedLocation?.name}?
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

export default LocationManagement;
