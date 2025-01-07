import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Welcome from "./components/Welcome";
import Home from "./components/Home";
import Base from "./components/base/Base";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
const App: React.FC = () => {
  return (
    <Router>
      {/* Routes to handle different pages */}
      <Routes>
        {/* Route for the login/welcome page */}
        <Route path="/" element={<Welcome />} />

        {/* Protected route for the home page after login */}

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Base>
                <Home />
              </Base>
            </ProtectedRoute>
          }
        />

        {/* Redirect all other routes to the welcome page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const AppWrapper: React.FC = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWrapper;
