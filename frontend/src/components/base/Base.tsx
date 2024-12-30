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
      <div className="container-base">
      <div className="row">
          <Sidebar />
          <div className="content-base">
            {children}
          </div>
          </div>
        </div>
      </div>
  );
};

export default Base;
