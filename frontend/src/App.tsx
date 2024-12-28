import Welcome from './components/Welcome';  // Assuming this is your login or welcome page
import Home from './components/Home';  // Assuming you have the Home component
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // For routing
import { useAuth } from './AuthContext';

const App: React.FC = () => {
  const {isAuthenticated}=useAuth();// State to store user data


  return (
    <Router>
      <div>
        {/* Routes to handle different pages */}
        <Routes>
          {/* Route for the login/welcome page */}
          <Route path="/" element={<Welcome />} />

          {/* Route for the home page after login */}
          {isAuthenticated && <Route path="/home" element={<Home />} />}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
