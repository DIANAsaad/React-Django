import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Sidebar.css";

interface SidebarProps {

  options?: {link:string; label:string}[];
}

const Sidebar: React.FC<SidebarProps> = ({ options }) => {
  return (
    <div className="col-md-2 sidebar">
      <h4 className="text-center mb-4">Menu</h4>
      <ul className="list-unstyled">
        {options&&options.map((option, index) => (
          <li
            key={index}
            className="sidebar-link"
          >
              <Link to={option.link} className="sidebar-link">
                {option.label}
              </Link>
            
          </li>
        ))}

        <li>
          {/* Use Link here */}
          <Link to="/#" className="sidebar-link">
            Go to My Portal
          </Link>
        </li>
        <li>
          {/* Use Link here instead of <a> */}
          <Link to="/#" className="sidebar-link">
            Contact for Help
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
