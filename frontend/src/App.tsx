import React, { useState } from 'react';
import Welcome from './components/Welcome';  // Assuming this is your login or welcome page
import Home from './components/Home';  // Assuming you have the Home component
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // For routing

interface User {
  isAuthenticated: boolean;
  firstName: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);  // State to store user data

  const handleLogin = (userData: User) => {
    setUser(userData);  // Simulate login by setting the user data
    localStorage.setItem('user', JSON.stringify(userData));  // Store user data in localStorage
  };

  const handleLogout = () => {
    setUser(null);  // Clear user data on logout
    localStorage.removeItem('user');  // Remove user data from localStorage
  };

  return (
    <Router>
      <div>
        {/* Routes to handle different pages */}
        <Routes>
          {/* Route for the login/welcome page */}
          <Route path="/" element={<Welcome onLogin={handleLogin} />} />

          {/* Route for the home page after login */}
          {user && <Route path="/home" element={<Home user={user} onLogout={handleLogout} />} />}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
