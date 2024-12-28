import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/sidebar.css';
import { useAuth } from '../../AuthContext';



  const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = ()=>{
        logout(); // Call the logout function from context
        navigate('/'); // Redirect to welcome page
        console.log('Logged out');
    };

    return (
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-fluid">
          <a className="navbar-brand">
            <img src="/static/images/achieve_logo_white.png" alt="Logo" width="150" />
          </a>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {isAuthenticated && user ? (
                <>
                  <li className="nav-item">
                    <span className="navbar-text me-3">
                      Logged in as  {user.first_name} {user.last_name}|
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
