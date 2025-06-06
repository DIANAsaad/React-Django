import React, { useState, createContext, ReactNode, useContext, useEffect,} from "react";
import {useAuth} from "./AuthContext";


// Define the context type
interface EditButtonContextType {
  editButton: boolean;
  setEditButton: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with a default value
const EditButtonContext = createContext<EditButtonContextType | undefined>(
  undefined
);

export const EditButtonProvider = ({ children }: { children: ReactNode }) => {
  const [editButton, setEditButton] = useState<boolean>(false);
  const {user}=useAuth();



  useEffect(() => {
      setEditButton(false);
  }, [user]);

  return (
    <EditButtonContext.Provider value={{ editButton, setEditButton}}>
      {children}
    </EditButtonContext.Provider>
  );
};

export const useEditButtonContext = () => {
  const context = useContext(EditButtonContext);
  if (!context) {
    throw new Error("useEditButton must be used within an EditButtonProvider");
  }
  return context;
};
