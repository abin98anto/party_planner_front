import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";
import {
  Button,
  Stack,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { useState } from "react";
import { logout } from "../../../redux/thunks/UserAuthServices";

const Header: React.FC = () => {
  const { userInfo } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const goToLogin = () => {
    navigate("/login");
  };

  const goToProducts = () => {
    navigate("/products");
  };

  const goToCart = () => {
    navigate("/cart");
  };

  const goToProfile = () => {
    navigate("/profile");
    handleMenuClose();
  };

  const handleLogout = async () => {
    await dispatch(logout()).unwrap();
    handleMenuClose();
  };

  return (
    <header className="user-header">
      <div className="user-container">
        <Link to="/" className="user-logo">
          Party Planner
        </Link>
        <div className="user-header-links">
          <div>
            <Stack spacing={2} direction="row" alignItems="center">
              <Button variant="text">Home</Button>
              <Button variant="text" onClick={goToProducts}>
                Products
              </Button>
              <Button variant="text" onClick={goToCart}>
                Cart
              </Button>

              {userInfo ? (
                <>
                  <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                    aria-controls={open ? "account-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    className="profile-button"
                  >
                    <Avatar
                      src={userInfo.picture || undefined}
                      alt={userInfo.name || "User"}
                      sx={{ width: 40, height: 40 }}
                    />
                  </IconButton>
                  <Menu
                    id="account-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    MenuListProps={{
                      "aria-labelledby": "profile-button",
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem onClick={goToProfile}>Profile</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button variant="outlined" onClick={goToLogin}>
                  Login
                </Button>
              )}
            </Stack>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
