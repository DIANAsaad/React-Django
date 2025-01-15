import React from "react";
import "./../styles/DropdownMenu.css";

interface DropdownMenuProps {

  options: {
    label: string;
    action?: (() => void) | null;
    className?: string;
  }[]; 
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options }) => {
  return (
    <div className="dropdown">
      {/* Trigger Button */}
      <button
        className="ellipsis-cstm-btn btn  p-0"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        ⋮
      </button>

      {/* Dropdown Menu */}
      <ul
        className="dropdown-menu dropdown-menu-end"
    
      >
        {options.map((option, index) => (
          <li key={index}>
            <button
              className={`dropdown-item ${option.className || ""}`}
              onClick={option.action || undefined}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DropdownMenu;
