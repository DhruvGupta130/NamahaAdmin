import { Navigate, Outlet } from "react-router-dom";

// This is a simple example; replace with your actual auth logic.
const useAuth = () => {
  const token = localStorage.getItem("authToken"); // or context/state
  return !!token;
};

const PrivateRoute = () => {
  const isAuth = useAuth();

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;