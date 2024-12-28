import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/sidebar.css';


const Sidebar: React.FC = () => {
          return (
            <div className="col-md-2 sidebar">
              <h4 className="text-center mb-4">Menu</h4>
              <ul className="list-unstyled">
                {/* Sidebar dynamic content can be passed as props */}
                <li>
                  {/* Use Link here */}
                  <Link to="/#" className="sidebar-link">Go to My Portal</Link>
                </li>
                <li>
                  {/* Use Link here instead of <a> */}
                  <Link to="/#" className="sidebar-link">Contact for Help</Link>
                </li>
              </ul>
            </div>
          );
        };
        

export default Sidebar;















