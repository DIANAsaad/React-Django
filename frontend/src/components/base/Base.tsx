import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface User {
    isAuthenticated: boolean;
    firstName: string;
  }
  
  interface BaseProps {
    user: User;
    children: React.ReactNode;
  }


  const Base: React.FC<BaseProps> = ({ user,children }) => {

   
  
  return (
    <div>
      <Navbar user={user}/>
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
