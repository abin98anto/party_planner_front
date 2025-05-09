import { Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/admin/AdminLogin/AdminLogin";
import NotFound from "../components/common/NotFound/NotFound";
import AdminLayout from "../components/admin/AdminLayout/AdminLayout";
import CategoryManagement from "../pages/admin/CategoryManagement/CategoryManagement";
import ProductManagement from "../pages/admin/ProductManagement/ProductManagement";
import OrderManagement from "../pages/admin/OrderManagement/OrderManagement";
import ProviderManagement from "../pages/admin/ProviderManagement/ProviderManagement";
import AddProduct from "../pages/admin/ProductManagement/AddProduct/AddProduct";
import LocationManagement from "../pages/admin/LocationManagement/LoacationManagement";
import UnProtectedRoute from "../components/common/ProtectedRoutes/UnProtectedRoute";
import ProtectedRoute from "../components/common/ProtectedRoutes/ProtectedRoutes";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<UnProtectedRoute />}>
        <Route path="/" element={<AdminLogin />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/category-management" element={<CategoryManagement />} />
          <Route path="/location-management" element={<LocationManagement />} />
          <Route path="/product-management" element={<ProductManagement />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/edit-product" element={<AddProduct />} />
          <Route path="/order-management" element={<OrderManagement />} />
          <Route path="/provider-management" element={<ProviderManagement />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
