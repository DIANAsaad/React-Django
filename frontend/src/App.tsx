import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Welcome from "./components/Welcome";
import Home from "./components/Home";
import Base from "./components/base/Base";
import CoursePage from "./components/course_page/CoursePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import "./context/CourseContext";




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
        
        <Route
          path="/course_page/:courseId"
          element={
            <ProtectedRoute>
              <Base>
                <CoursePage/>
              </Base>
            </ProtectedRoute>
          }
        />

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
