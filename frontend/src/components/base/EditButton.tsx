import React from "react";
import { useEditButtonContext } from "../../context/EditButtonContext";
import "../../styles/EditButton.css";
const EditButton: React.FC = () => {
  const { editButton, setEditButton } = useEditButtonContext();
  return (
    <div className="switch-container">
      <label className="switch">
        <input
          type="checkbox"
          checked={editButton}
          onChange={() => setEditButton(!editButton)}
        />
        <span className="slider round"></span>
      </label>
      <span className="edit-mode-text">
        {editButton ? "Edit Mode" : "Edit Mode"}
      </span>
    </div>
  );
};

export default EditButton;
