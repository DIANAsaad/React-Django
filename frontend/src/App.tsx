import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome";
import Home from "./components/Home";
import Base from "./components/base/Base";
import CoursePage from "./components/coursePages/CoursePage";
import ModulePage from "./components/coursePages/modules/ModulePage"
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext"; 
import { ModuleProvider } from './context/ModuleContext';
import {FlashcardProvider} from './context/FlashcardContext'

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
          path="/coursePage/:courseId"
          element={
            <ProtectedRoute>
              <Base>
                <CoursePage />
              </Base>
            </ProtectedRoute>
          }
        />

        <Route
          path="/modulePage/:moduleId"
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
      <ModuleProvider >
        <FlashcardProvider>
        <App />
        </FlashcardProvider>
      </ModuleProvider>
    </CourseProvider>
  </AuthProvider>
);


export default AppWrapper;
