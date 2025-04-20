import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "../../styles/Base.css";
import EditButton from "./EditButton";
import NotificationPanel from "./NotificationPanel";
import { useAuth } from "../../context/AuthContext";

interface BaseProps {
  children: React.ReactNode;
  options: { link: string; label: string }[];
}

const BaseWrapper: React.FC<BaseProps> = ({ children, options }) => {
  const { user } = useAuth();

  return (
    <div className="base-layout">
      <Navbar />
      <div className="container-base">
        <div className="row">
          <Sidebar options={options} />
          <div className="content-base">
            <div className="content-header d-flex">
              {(user?.is_staff || user?.is_instructor) && <EditButton />}
              <div className="notification-container"style={{ marginLeft: "0.6em" }}>
                <NotificationPanel />
              </div>
            </div>
            <div className="content-children">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseWrapper;
