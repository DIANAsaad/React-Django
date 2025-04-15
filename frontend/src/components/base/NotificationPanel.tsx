import React from 'react';
import { useNotificationContext } from '../../context/NotificafionsContext';
import '../../styles/Notifications.css';


const NotificationPanel : React.FC =()=>{
    const {notifications}=useNotificationContext();

    return <>
      <div className="notification-container">
      {/* Bell Icon */}
      <div className="notification-bell">
        <i className="bell-icon">🔔</i>
        {notifications.length > 0 && (
          <span className="notification-count">{notifications.length}</span>
        )}
      </div>
    <div className="notification-panel">
        <h2> Your Notifications</h2>
        <div className="notifications-list">
            {notifications.map((notification)=>{
                return (
                    <div className="notification" key={notification.id}>
                        <div className="icon">N</div> 
                        <p> {notification.message}
                        </p>
                        </div>
                )
            })}
        </div>
    </div>
    </div>
    </>

}

export default NotificationPanel;