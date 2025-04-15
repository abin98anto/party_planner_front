import { Route, Routes } from "react-router-dom";
import UserLayout from "../components/user/UserLayout/UserLayout";
import HomePage from "../pages/user/HomePage/HomePage";
import NotFound from "../components/common/NotFound/NotFound";
import UserLogin from "../pages/user/UserLogin/UserLogin";
import UserSignup from "../pages/user/UserSignup/UserSignup";
import AllProducts from "../pages/user/AllProducts/AllProducts";
import ProductDetails from "../pages/user/ProductDetails/ProductDetails";
import CartPage from "../pages/user/CartPage/CartPage";
import Checkout from "../pages/user/Checkout/Checkout";

const UserRoutes = () => {
  return (
    <>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
};

export default UserRoutes;
