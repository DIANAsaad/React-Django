import React from "react";
import "./../styles/DropdownMenu.css";

interface DropdownMenuProps {
  id: string; // Unique identifier for the dropdown
  options: {
    label: string;
    action?: (() => void) | null;
    className?: string;
  }[]; 
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ id, options }) => {
  return (
    <div className="dropdown">
      {/* Trigger Button */}
      <button
        className="ellipsis-btn btn btn-link p-0"
        id={`dropdownMenuButton-${id}`}
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        ⋮
      </button>

      {/* Dropdown Menu */}
      <ul
        className="dropdown-menu dropdown-menu-end"
        aria-labelledby={`dropdownMenuButton-${id}`}
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
