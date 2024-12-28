import React from 'react';
import { Link, useNavigate  } from 'react-router-dom';
import '../styles/Navbar.css'
import axios from 'axios';

interface User {
  isAuthenticated: boolean;
  firstName: string;
}

interface NavbarProps {
  user: User;
}

const Navbar: React.FC<NavbarProps> = ({ user}) => {
  const navigate = useNavigate();

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form behavior if any
    try {
      await axios.post('http://127.0.0.1:8000/logout');
      
      // Assuming logout is successful and no data is sent back
      localStorage.removeItem('access_token'); // Clear JWT token
      localStorage.removeItem('refresh_token'); // Clear refresh token (if any)
      
      navigate('/'); // Redirect to welcome page
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally show an error message to the user
    }
  };
  
  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <div className="container-fluid">
        <a className="navbar-brand">
          <img src="/static/images/achieve_logo_white.png" alt="Logo" width="150" />
        </a>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user.isAuthenticated ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text me-3">
                    Logged in as {user.firstName} |
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="logout-button btn btn-link"
                    onClick={handleLogout} // Trigger handleLogout
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link to="/login" className="nav-link">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
