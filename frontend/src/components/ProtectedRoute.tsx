import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
  onlyStaff?: boolean;
  instructorOrStaff?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  instructorOrStaff,
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  } 
  else if (instructorOrStaff && !(user?.is_instructor===instructorOrStaff || user?.is_staff===instructorOrStaff)) {
    return <Navigate to="/notAuthorized"/>;
  } 
  else {return children;}
  
};

export default ProtectedRoute;
