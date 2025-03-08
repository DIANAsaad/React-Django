import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Navbar.css";
import { useAuth } from "../../context/AuthContext";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
 
  return (

    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <a className="navbar-brand">
        <img src="/logo.png" alt="Logo" className="logo-size" />
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isAuthenticated && user ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text me-3">
                    Logged in as {user.first_name} {user.last_name} |
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="logout-button "
                    onClick={handleLogout} // Trigger handleLogout
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : null}
          </ul>
        </div>
      </div>
    </nav>
 
  );
};

export default Navbar;
