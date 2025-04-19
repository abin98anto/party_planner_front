import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppRootState } from "../../../redux/store";

const UnProtectedRoute = () => {
  const userInfo = useSelector((state: AppRootState) => state.user.userInfo);

  return !userInfo ? <Outlet /> : <Navigate to={`/`} />;
};

export default UnProtectedRoute;
