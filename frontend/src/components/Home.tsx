import React from "react";
import "../styles/Home.css"; // Go up one level, then into 'styles' folder

const Home: React.FC = () => {
  return (
    <div className="col-md-10">
      <h1>Welcome to the Home Page!</h1>
      <p>This is where the main content of the home page will go.</p>
    </div>
  );
};

export default Home;
