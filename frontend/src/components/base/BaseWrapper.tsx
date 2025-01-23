import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "../../styles/Base.css";

interface BaseProps {
  children: React.ReactNode;
  options: { link: string; label: string }[];
}

const BaseWrapper: React.FC<BaseProps> = ({ children, options }) => {
  return (
    <div className="base-layout">
      <Navbar />
      <div className="container-base">
        <div className="row">
          <Sidebar options={options} />
          <div className="content-base">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default BaseWrapper;
