import { Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/admin/AdminLogin/AdminLogin";
import NotFound from "../components/common/NotFound/NotFound";
import AdminDashboard from "../pages/admin/AdminDashboard/AdminDashboard";
import AdminLayout from "../components/admin/AdminLayout/AdminLayout";
import CategoryManagement from "../pages/admin/CategoryManagement/CategoryManagement";
import ProductManagement from "../pages/admin/ProductManagement/ProductManagement";
import OrderManagement from "../pages/admin/OrderManagement/OrderManagement";
import ProviderManagement from "../pages/admin/ProviderManagement/ProviderManagement";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/category-management" element={<CategoryManagement />} />
        <Route path="/product-management" element={<ProductManagement />} />
        <Route path="/order-management" element={<OrderManagement />} />
        <Route path="/provider-management" element={<ProviderManagement />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
