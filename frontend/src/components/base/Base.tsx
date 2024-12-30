import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../../styles/Base.css'


interface BaseProps {
  children: React.ReactNode;
}


const Base: React.FC<BaseProps> = ({ children }) => {


  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="row">
          <Sidebar />
            {children}
          </div>
        </div>
      </div>
  );
};

export default Base;
