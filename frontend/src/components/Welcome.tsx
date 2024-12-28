// src/WelcomePage.tsx
import React, { useState } from 'react';
import '../styles/Welcome.css';  // Link to your CSS file
import 'font-awesome/css/font-awesome.min.css';
import axios from 'axios';

const Welcome: React.FC = () => {
    // State to manage form data and error messages
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Handle login form submission
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000',  // Django JWT endpoint
                { email, password },
                {
                    headers: {
                        'Content-Type': 'application/json', // Set correct content type
                    },
                }
            );

            // On success, store JWT tokens in localStorage
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);


            console.log('Login successful');

        } catch (error) {
            setErrorMessage('Invalid username or password. Please try again.');
            console.error('Error during login: User not found', error);
        }
    };

    return (
        <div>
            <header>
                <div className="header-bottom">
                    <nav>
                        <ul>
                            <li className="header-bottom-brand">
                                <img src="/achieve_logo_color.png" alt="Achieve Logo" />
                            </li>
                        </ul>
                    </nav>
                    <div className="social-icons">
                        <a href="https://x.com/achievetestprep?lang=en" className="social-btn" aria-label="Twitter">
                            <i className="fa-brands fa-twitter"></i>
                        </a>

                        <a href="https://www.facebook.com/AchieveTestPrep/" className="social-btn" aria-label="Facebook">
                            <i className="fa-brands fa-facebook"></i>
                        </a>

                        <a href="https://www.achievetestprep.com/" className="social-btn" aria-label="Website">
                            <i className="fa fa-globe"></i>
                        </a>

                        <button className="social-btn" aria-label="User Account">
                            <i className="fa fa-user"></i>
                        </button>
                    </div>
                </div>
            </header>

            <div className="image-wrapper">
                <img src="/lms_background.png" alt="LMS Background" />
                <div className="content">
                    <p>
                        Achieve's Learning Management System empowers you to take control of your studies with ease. Access a
                        vast library of courses, track your progress, and engage in interactive learning—all designed to help
                        you reach your academic goals and beyond.
                    </p>

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
                            {errorMessage && <div className="error-message">{errorMessage}</div>}
                            <button type="submit" className="btn btn-primary">Login</button>
                        </form>
                    </div>

                </div>
            </div>

            <footer>
                &copy; 2024 Achieve's LMS. All rights reserved.
            </footer>
        </div>
    );
};

export default Welcome;
