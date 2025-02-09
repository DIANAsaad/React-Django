import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome";
import Home from "./components/Home";
import CoursePage from "./components/coursePage/CoursePage";
import ModulePage from "./components/coursePage/modules/ModulePage";
import FlashcardPage from "./components/coursePage/modules/flashcard/FlashcardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { ModuleProvider } from "./context/ModuleContext";
import { FlashcardProvider } from "./context/FlashcardContext";
import { ExternalLinkProvider } from "./context/ExternalLinkContext";
import AddFlashcard from "./components/coursePage/modules/flashcard/AddFlashcard";
import AddExtrenalLink from "./components/coursePage/modules/externalLinks/AddExternalLink";
import EditExtrenalLink from "./components/coursePage/modules/externalLinks/EditExternalLink";
import AddQuiz from "./components/coursePage/modules/quiz/AddQuiz";
import { QuizProvider } from "./context/QuizContext";
import QuizPage from "./components/coursePage/modules/quiz/QuizPage";
import ResultsPage from "./components/coursePage/modules/quiz/ResultsPage";

const App: React.FC = () => {
  return (
    <Router>
      {/* Routes to handle different pages */}
      <Routes>
        {/* Route for the login/welcome page */}
        <Route path="/" element={<Welcome />} />

        {/* Protected route for the home page and what follows after login */}

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId/"
          element={
            <ProtectedRoute>
              <CoursePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId/module/:moduleId"
          element={
            <ProtectedRoute>
              <ModulePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId/module/:moduleId/flashcards"
          element={
            <ProtectedRoute>
              <FlashcardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId/module/:moduleId/add-flashcard"
          element={
            <ProtectedRoute>
              <AddFlashcard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId/module/:moduleId/add-external-link"
          element={
            <ProtectedRoute>
              <AddExtrenalLink />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/:courseId/module/:moduleId/add-quiz"
          element={
            <ProtectedRoute>
              <AddQuiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId/module/:moduleId/external-link/:linkId/edit"
          element={
            <ProtectedRoute>
              <EditExtrenalLink />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/:courseId/module/:moduleId/quiz/:quizId"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/:courseId/module/:moduleId/quiz/:quizId/results/:attemptId"
          element={
            <ProtectedRoute>
              <ResultsPage />
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
          <ExternalLinkProvider>
            <QuizProvider>
              <App />
            </QuizProvider>
          </ExternalLinkProvider>
        </FlashcardProvider>
      </ModuleProvider>
    </CourseProvider>
  </AuthProvider>
);

export default AppWrapper;
