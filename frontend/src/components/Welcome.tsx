// src/WelcomePage.tsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Welcome.css"; // Link to your CSS file
import "font-awesome/css/font-awesome.min.css";
import { useAuth } from "../context/AuthContext";

const Welcome: React.FC = () => {
  // State to manage form data and error messages
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Handle login form submission
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      navigate("/courses");
    } catch (error) {
      setErrorMessage("Invalid username or password.)");
    }
  },[email, password, login, navigate ]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/courses');
    }
  }, [isAuthenticated, navigate]);


  return (
    <div>
      <header>
        <div className="header-bottom">
          <nav>
            <ul>
              <li className="header-bottom-brand">
                <img src="/logo.png" alt="Achieve Logo" className="logo-size"/>
              </li>
            </ul>
          </nav>
          <div className="social-icons">
            <a
              href="https://x.com/achievetestprep?lang=en"
              className="social-btn"
              aria-label="Twitter"
            >
              <i className="fa-brands fa-twitter"></i>
            </a>

            <a
              href="https://www.facebook.com/AchieveTestPrep/"
              className="social-btn"
              aria-label="Facebook"
            >
              <i className="fa-brands fa-facebook"></i>
            </a>

            <a
              href="https://www.achievetestprep.com/"
              className="social-btn"
              aria-label="Website"
            >
              <i className="fa fa-globe"></i>
            </a>

            <button className="social-btn" aria-label="User Account">
              <i className="fa fa-user"></i>
            </button>
          </div>
        </div>
      </header>

  
        <div className="content">
       

          {/* Login Form */}
          <div className="container">
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
              <button type="submit" className="container-button">
                Login
              </button>
            </form>
          </div>
        </div>
      


    </div>
  );
};

export default Welcome;
