import Welcome from "./components/Welcome";
import Home from "./components/Home";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Base from "./components/base/Base";
import "bootstrap/dist/css/bootstrap.min.css";
import { CourseProvider } from './context/CourseContext';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth(); // State to store user data

  return (
    <Router>
      {/* Routes to handle different pages */}
      <Routes>
        {/* Route for the login/welcome page */}
        <Route path="/" element={<Welcome />} />

        {/* Route for the home page after login */}
        
        {isAuthenticated && (
          <Route
            path="/home"
            element={
              <Base>
                <Home />
              </Base>
            }
          />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const AppWrapper: React.FC = () => (
  <AuthProvider>
    <CourseProvider>
    <App />
    </CourseProvider>
  </AuthProvider>
);

export default AppWrapper;
