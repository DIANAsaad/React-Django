import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome";
import Home from "./components/Home";
import Base from "./components/base/Base";
import CoursePage from "./components/course_components/CoursePage";
import ModulePage from "./components/course_components/Modules/ModulePage"
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext"; 
import { ModuleProvider } from './context/ModuleContext';

const App: React.FC = () => {
  return (
    <Router>
      {/* Routes to handle different pages */}
      <Routes>
        {/* Route for the login/welcome page */}
        <Route path="/" element={<Welcome />} />

        {/* Protected route for the home page and what follows after login */}

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
                <CoursePage />
              </Base>
            </ProtectedRoute>
          }
        />

        <Route
          path="/module_page/:moduleId"
          element={
            <ProtectedRoute>
              <Base>
                <ModulePage />
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
    <CourseProvider>
      <ModuleProvider>
        <App />
      </ModuleProvider>
    </CourseProvider>
  </AuthProvider>
);


export default AppWrapper;
