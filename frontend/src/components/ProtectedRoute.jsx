import { Navigate } from "react-router";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    // If no token, kick them back to login
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;