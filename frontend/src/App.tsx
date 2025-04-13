import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome";
import Home from "./components/Home";
import CoursePage from "./components/course/CoursePage";
import ModulePage from "./components/course/modules/ModulePage";
import FlashcardPage from "./components/course/modules/flashcard/FlashcardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import { CourseProvider } from "./context/CourseContext";
import { ModuleProvider } from "./context/ModuleContext";
import { FlashcardProvider } from "./context/FlashcardContext";
import { ExternalLinkProvider } from "./context/ExternalLinkContext";
import { EditButtonProvider } from "./context/EditButtonContext";
import AddFlashcard from "./components/course/modules/flashcard/AddFlashcard";
import AddExtrenalLink from "./components/course/modules/externalLinks/AddExternalLink";
import EditExtrenalLink from "./components/course/modules/externalLinks/EditExternalLink";
import AddQuiz from "./components/course/modules/quiz/AddQuiz";
import { QuizProvider } from "./context/QuizContext";
import { CommentProvider } from "./context/CommentContext";
import { NotificationProvider } from "./context/NotificafionsContext";
import QuizPage from "./components/course/modules/quiz/QuizPage";
import ResultsPage from "./components/course/modules/quiz/ResultsPage";
import CommentPage from "./components/course/modules/comment/CommentPage";
import EnrolledUser from "./components/course/EnrolledUsers";
import NotAuthorized from "./components/NotAuthorized";

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
          path="/course/:courseId/enrolledUsers"
          element={
            <ProtectedRoute instructorOrStaff={true}>
              <EnrolledUser />
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
            <ProtectedRoute instructorOrStaff={true}>
              <AddFlashcard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId/module/:moduleId/add-external-link"
          element={
            <ProtectedRoute instructorOrStaff={true}>
              <AddExtrenalLink />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/:courseId/module/:moduleId/add-quiz"
          element={
            <ProtectedRoute instructorOrStaff={true}>
              <AddQuiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId/module/:moduleId/external-link/:linkId/edit"
          element={
            <ProtectedRoute instructorOrStaff={true}>
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
        <Route
          path="/course/:courseId/module/:moduleId/add-comment"
          element={
            <ProtectedRoute>
              <CommentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notAuthorized"
          element={
            <ProtectedRoute>
              <NotAuthorized />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

const AppWrapper: React.FC = () => (
  <AuthProvider>
    <NotificationProvider>
      <EditButtonProvider>
        <CourseProvider>
          <ModuleProvider>
            <FlashcardProvider>
              <ExternalLinkProvider>
                <QuizProvider>
                  <CommentProvider>
                    <App />
                  </CommentProvider>
                </QuizProvider>
              </ExternalLinkProvider>
            </FlashcardProvider>
          </ModuleProvider>
        </CourseProvider>
      </EditButtonProvider>
    </NotificationProvider>
  </AuthProvider>
);

export default AppWrapper;
