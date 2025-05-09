import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import IAddress from "../../../entities/IAddress";
import "./AddressModal.scss";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: IAddress) => void;
  address: IAddress | null;
}

interface ValidationErrors {
  venue?: string;
  place?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  phone?: string;
}

const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  address,
}) => {
  const [formData, setFormData] = useState({
    venue: "",
    place: "",
    landmark: "",
    city: "",
    district: "",
    state: "",
    pincode: 0,
    phone: 0,
    isDeleted: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (address) {
      setFormData({
        ...address,
        pincode: address.pincode || 0,
        phone: address.phone || 0,
      });
    }
  }, [address]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.venue || formData.venue.trim() === "") {
      newErrors.venue = "Venue is required";
    }

    if (!formData.place || formData.place.trim() === "") {
      newErrors.place = "Place is required";
    }

    if (!formData.city || formData.city.trim() === "") {
      newErrors.city = "City is required";
    }

    if (!formData.district || formData.district.trim() === "") {
      newErrors.district = "District is required";
    }

    if (!formData.state || formData.state.trim() === "") {
      newErrors.state = "State is required";
    }

    if (!formData.pincode || formData.pincode.toString().length !== 6) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }

    if (!formData.phone || formData.phone.toString().length !== 10) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "pincode" || name === "phone") {
      setFormData({ ...formData, [name]: value ? parseInt(value) : 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData as IAddress);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-mod-overlay">
      <div className="add-mod-container">
        <div className="add-mod-header">
          <h2>{address ? "Edit Address" : "Add New Address"}</h2>
          <button className="add-mod-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-mod-address-form">
          <div className="add-mod-form-group">
            <label htmlFor="venue">Venue/House Name/Number *</label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Enter venue or house name/number"
            />
            {errors.venue && (
              <span className="add-mod-error-msg">{errors.venue}</span>
            )}
          </div>

          <div className="add-mod-form-group">
            <label htmlFor="place">Place/Street *</label>
            <input
              type="text"
              id="place"
              name="place"
              value={formData.place}
              onChange={handleChange}
              placeholder="Enter place or street"
            />
            {errors.place && (
              <span className="add-mod-error-msg">{errors.place}</span>
            )}
          </div>

          <div className="add-mod-form-group">
            <label htmlFor="landmark">Landmark (Optional)</label>
            <input
              type="text"
              id="landmark"
              name="landmark"
              value={formData.landmark || ""}
              onChange={handleChange}
              placeholder="Enter a nearby landmark"
            />
          </div>

          <div className="add-mod-form-row">
            <div className="add-mod-form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
              {errors.city && (
                <span className="add-mod-error-msg">{errors.city}</span>
              )}
            </div>

            <div className="add-mod-form-group">
              <label htmlFor="district">District *</label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter district"
              />
              {errors.district && (
                <span className="add-mod-error-msg">{errors.district}</span>
              )}
            </div>
          </div>

          <div className="add-mod-form-row">
            <div className="add-mod-form-group">
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
              {errors.state && (
                <span className="add-mod-error-msg">{errors.state}</span>
              )}
            </div>

            <div className="add-mod-form-group">
              <label htmlFor="pincode">PIN Code *</label>
              <input
                type="number"
                id="pincode"
                name="pincode"
                value={formData.pincode || ""}
                onChange={handleChange}
                placeholder="Enter 6-digit PIN code"
                maxLength={6}
              />
              {errors.pincode && (
                <span className="add-mod-error-msg">{errors.pincode}</span>
              )}
            </div>
          </div>

          <div className="add-mod-form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="number"
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
            />
            {errors.phone && (
              <span className="add-mod-error-msg">{errors.phone}</span>
            )}
          </div>

          <div className="add-mod-actions">
            <button
              type="button"
              className="add-mod-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="add-mod-save-btn">
              {address ? "Update" : "Add"} Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
