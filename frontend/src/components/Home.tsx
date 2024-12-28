import React from 'react';
import '../styles/Home.css';  // Go up one level, then into 'styles' folder
import Base from './base/Base';  // Correct path to Base.tsx from src/



const Home: React.FC = () => {
  return (
    <Base > {/* Pass the user prop to Base */}
      <h1>Welcome to the Home Page!</h1>
      <p>This is where the main content of the home page will go.</p>
    </Base>
  );
};

export default Home;
