import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome";
import Home from "./components/Home";
import CoursePage from "./components/coursePages/CoursePage";
import ModulePage from "./components/coursePages/modules/ModulePage";
import FlashcardPage from "./components/coursePages/modules/flashcard/FlashcardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { ModuleProvider } from "./context/ModuleContext";
import { FlashcardProvider } from "./context/FlashcardContext";
import AddFlashcard from "./components/coursePages/modules/flashcard/AddFlashcard";

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
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coursePage/:courseId/"
          element={
            <ProtectedRoute>
              <CoursePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/:courseId/modulePage/:moduleId"
          element={
            <ProtectedRoute>
              <ModulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="modulePage/:moduleId"
          element={
            <ProtectedRoute>
              <ModulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcardPage/:moduleId"
          element={
            <ProtectedRoute>
              <FlashcardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/addFlashcard/:moduleId"
          element={
            <ProtectedRoute>
              <AddFlashcard />
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
        <FlashcardProvider>
          <App />
        </FlashcardProvider>
      </ModuleProvider>
    </CourseProvider>
  </AuthProvider>
);

export default AppWrapper;
