import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';


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
          <div className="col-md-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Base;
