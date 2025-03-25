import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  isStaff?:boolean;
  isInstructor?:boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children , isStaff, isInstructor}) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  else if(isStaff===false&&isInstructor===false){
    return <Navigate to="/not-authorized" replace />;
  }else{
  return children;}
};

export default ProtectedRoute; 