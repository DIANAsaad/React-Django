import React from "react";
import { useNotificationContext } from "../../context/NotificafionsContext";
import "../../styles/Notifications.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

const NotificationPanel: React.FC = () => {
  const { notifications, isOpen, setIsOpen, isNotRead, setIsNotRead } =
    useNotificationContext();

  const { user } = useAuth();

  if (!user) {
    return;
  }

  return (
    <>
      <div className="notification-container">
        {/* Bell Icon */}
        <div className="notification-bell">
          <FontAwesomeIcon
            icon={faBell}
            className="bell-icon"
            onClick={() => {
              setIsOpen(true);
              setIsNotRead(0); // Reset for new notifications
            }}
          />
          {notifications.length > 0 && isOpen === false && (
            <span className="notification-count">{isNotRead}</span>
          )}
        </div>
        <div className="notification-panel">
          <h2> Your Notifications</h2>
          <div className="notifications-list">
            {notifications?.map((notification) => {
              if (notification.created_at>user?.last_seen_notifications){
                setIsNotRead((prev)=>prev? prev+1:1);
                setIsOpen(false);
              }
              return (
                <div className="notification" key={notification.id}>
                  <p> {notification.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
