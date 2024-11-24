//protectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // If no token is found, redirect to the sign-in page
    return <Navigate to="/" />;
  }

  return children; // If token exists, render the child components
};

export default ProtectedRoute;