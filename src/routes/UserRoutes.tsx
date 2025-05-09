import { Route, Routes } from "react-router-dom";
import UserLayout from "../components/user/UserLayout/UserLayout";
import HomePage from "../pages/user/HomePage/HomePage";
import NotFound from "../components/common/NotFound/NotFound";
import UserLogin from "../pages/user/UserLogin/UserLogin";
import UserSignup from "../pages/user/UserSignup/UserSignup";
import AllProducts from "../pages/user/AllProducts/AllProducts";
import ProductDetails from "../pages/user/ProductDetails/ProductDetails";
import CartPage from "../pages/user/CartPage/CartPage";
import UserProfile from "../pages/user/UserProfile/UserProfile";
import ProtectedRoute from "../components/common/ProtectedRoutes/ProtectedRoutes";
import UnProtectedRoute from "../components/common/ProtectedRoutes/UnProtectedRoute";

const UserRoutes = () => {
  return (
    <>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<NotFound />} />

          <Route element={<UnProtectedRoute />}>
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignup />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<UserProfile />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default UserRoutes;
