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
import ILocation from "../../../entities/ILocation";
import { AxiosError } from "axios";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../../components/common/CustomSanckbar/CustomSnackbar";
import {
  addLocation,
  updateLocation,
  getAllLocations,
} from "../../../api/services/locationService";
import "./LocationManagement.scss";
import { LocationRequestParams } from "../../../api/types/locationTypes";

interface IPaginationData {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<IPaginationData>({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 6,
  });
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  useEffect(() => {
    fetchLocations();
  }, [pagination.currentPage]);

  const fetchLocations = async (search: string = searchTerm): Promise<void> => {
    try {
      const params: LocationRequestParams = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: search,
      };

      const response = await getAllLocations(params);
      if (response.success) {
        const { data, pagination } = response;
        setLocations(data);
        setPagination(pagination);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      showSnackbar(
        "Failed to fetch locations. Please try again later.",
        "error"
      );
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
    fetchLocations(searchTerm);
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
    return locations.some(
      (location) =>
        location.name.toLowerCase() === name.toLowerCase() &&
        location._id !== currentId &&
        !location.isDeleted
    );
  };

  const handleAddLocation = async (): Promise<void> => {
    try {
      if (!locationName.trim()) {
        showSnackbar("Location name cannot be empty!", "error");
        return;
      }

      if (checkDuplicateName(locationName)) {
        showSnackbar("Location name already exists!", "error");
        return;
      }

      await addLocation({ name: locationName });
      setIsAddModalOpen(false);
      setLocationName("");
      fetchLocations();
      showSnackbar("Location added successfully!", "success");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error adding location:", error.response?.data);
        showSnackbar(
          error.response?.data?.message ||
            "Failed to add location. Please try again.",
          "error"
        );
      }
    }
  };

  const handleEditLocation = async (): Promise<void> => {
    if (!locationName.trim()) {
      showSnackbar("Location name cannot be empty!", "error");
      return;
    }

    if (checkDuplicateName(locationName, selectedLocation?._id)) {
      showSnackbar("Location name already exists!", "error");
      return;
    }

    try {
      await updateLocation({
        _id: selectedLocation?._id,
        name: locationName,
      });
      setIsEditModalOpen(false);
      setSelectedLocation(null);
      setLocationName("");
      fetchLocations();
      showSnackbar("Location updated successfully!", "success");
    } catch (error) {
      console.error("Error updating location:", error);
      showSnackbar("Failed to update location. Please try again.", "error");
    }
  };

  const handleDeleteLocation = async (): Promise<void> => {
    try {
      await updateLocation({
        _id: selectedLocation?._id,
        isDeleted: true,
      });
      setIsDeleteModalOpen(false);
      setSelectedLocation(null);
      fetchLocations();
      showSnackbar("Location deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting location:", error);
      showSnackbar("Failed to delete location. Please try again.", "error");
    }
  };

  const handleToggleListStatus = async (): Promise<void> => {
    try {
      const newActiveStatus =
        selectedLocation?.isActive === true ? false : true;
      await updateLocation({
        _id: selectedLocation?._id,
        isActive: newActiveStatus,
      });
      setIsListModalOpen(false);
      setSelectedLocation(null);
      fetchLocations();
      showSnackbar(
        `Location ${newActiveStatus ? "listed" : "unlisted"} successfully!`,
        "success"
      );
    } catch (error) {
      console.error("Error updating location list status:", error);
      showSnackbar(
        "Failed to update location status. Please try again.",
        "error"
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
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
    <>
      <div className="location-management">
        <div className="location-container">
          <div className="header">
            <h1>Location Management</h1>
            <div className="top-controls">
              <div className="search-container">
                <TextField
                  className="search-input"
                  placeholder="Search locations..."
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
                  setLocationName("");
                  setIsAddModalOpen(true);
                }}
              >
                Add Location
              </Button>
            </div>
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
                            location.isActive ? "active" : "inactive"
                          }`}
                        >
                          {location.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {new Date(location.createdAt).toLocaleDateString()}
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
                            {location.isActive ? "UNLIST" : "LIST"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
              InputLabelProps={{ style: { color: "#aaa" } }}
              InputProps={{ style: { color: "white" } }}
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
              InputLabelProps={{ style: { color: "#aaa" } }}
              InputProps={{ style: { color: "white" } }}
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
              {selectedLocation?.isActive ? "unlist" : "list"}{" "}
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
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </>
  );
};

export default LocationManagement;
