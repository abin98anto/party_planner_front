import type React from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Header.scss";
import { Button, Stack } from "@mui/material";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const goToLogin = () => {
    navigate("/login");
  };
  const goToProducts = () => {
    navigate("/products");
  };
  const goToCart = () => {
    navigate("/cart");
  };

  return (
    <header className="user-header">
      <div className="user-container">
        <Link to="/" className="user-logo">
          Party Planner
        </Link>

        <div className="user-header-links">
          <div>
            <Stack spacing={2} direction="row">
              <Button variant="text">Home</Button>
              <Button variant="text" onClick={goToProducts}>
                Products
              </Button>
              <Button variant="text" onClick={goToCart}>
                Cart
              </Button>
              <Button variant="outlined" onClick={goToLogin}>
                Login
              </Button>
            </Stack>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
