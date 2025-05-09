import React, { useState } from "react";
import "./AdminLogin.scss";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { useNavigate } from "react-router-dom";
import { login } from "../../../redux/thunks/UserAuthServices";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../../components/common/CustomSanckbar/CustomSnackbar";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be 6+ characters";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorMessage = newErrors.email || newErrors.password;
      showSnackbar(errorMessage as string, "error");
    }

    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await dispatch(
          login({ email, password, role: "admin" })
        ).unwrap();
        if (response.success) {
          navigate("/admin/location-management");
          resetForm();
        }
      } catch (error: any) {
        showSnackbar(error.message || "Invalid credentials", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Admin Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "input-error" : ""}
              placeholder=" "
            />
            <label htmlFor="email" className={email ? "label-filled" : ""}>
              Email
            </label>
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? "input-error" : ""}
              placeholder=" "
            />
            <label
              htmlFor="password"
              className={password ? "label-filled" : ""}
            >
              Password
            </label>
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>
      </div>
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default AdminLogin;
