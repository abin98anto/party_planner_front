import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Layers, Map, SquareStack, Users } from "lucide-react";

import "./AdminSidebar.scss";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { logout } from "../../../redux/thunks/UserAuthServices";

const menuItems = [
  {
    title: "Category Management",
    icon: SquareStack,
    path: "/admin/category-management",
  },
  {
    title: "Location Management",
    icon: Map,
    path: "/admin/location-management",
  },
  {
    title: "Provider Management",
    icon: Users,
    path: "/admin/provider-management",
  },
  {
    title: "Product Management",
    icon: BookOpen,
    path: "/admin/product-management",
  },
  {
    title: "Order Management",
    icon: Layers,
    path: "/admin/order-management",
  },
];

const AdminSidebar = () => {
  const dispatch = useAppDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? "admin-collapsed" : ""}`}>
      <div className="admin-sidebar-header">
        <h1 className="admin-logo" onClick={toggleSidebar}>
          Party Planner
        </h1>
      </div>

      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`admin-nav-item ${isActive ? "admin-active" : ""}`}
            >
              <item.icon className="admin-nav-icon" />
              <span className="admin-nav-text">{item.title}</span>
            </button>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <button
          className="admin-sign-out-button"
          onClick={async () => {
            await dispatch(logout()).unwrap();
            navigate("/admin/");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
