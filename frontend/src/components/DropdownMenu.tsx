import React from "react";
import "../styles/DropdownMenu.css"; 

interface DropdownMenuProps {
  buttonContent: React.ReactNode;
  options: { label: string; action: () => void; className?: string }[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ buttonContent, options }) => {
  return (
    <div className="dropdown">
      {/* Trigger Button */}
      <button
        className="ellipsis-cstm-btn btn p-0"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {buttonContent}
      </button>

      {/* Dropdown Menu */}
      <ul className="dropdown-menu dropdown-menu-end">
        {options.map((option, index) => (
          <li key={index} className="dropdown-item-container">
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