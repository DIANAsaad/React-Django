import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "../../styles/Base.css";
import EditButton from "./EditButton";

interface BaseProps {
  children: React.ReactNode;
  options: { link: string; label: string }[];
  conditions:{isUserStaff:boolean, isUserInstructor:boolean}[];
}

const BaseWrapper: React.FC<BaseProps> = ({ children, options, conditions}) => {
  const { isUserStaff, isUserInstructor } = conditions[0];
  return (
    <div className="base-layout">
      <Navbar />
      <div className="container-base">
        <div className="row">
          <Sidebar options={options} />
          <div className="content-base">
          {(isUserStaff || isUserInstructor) &&<EditButton/>}{children}</div>
        </div>
      </div>
    </div>
  );
};

export default BaseWrapper;
