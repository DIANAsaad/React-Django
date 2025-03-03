import React, {useEffect} from "react";
import { useEditButtonContext } from "../../context/EditButtonContext";
import{useAuth} from "../../context/AuthContext";
import "../../styles/EditButton.css";


const EditButton: React.FC = () => {
  const {user, accessToken}=useAuth();
  const { editButton, setEditButton } = useEditButtonContext();
  useEffect(()=>{
    setEditButton(false)

  },[user, accessToken])
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