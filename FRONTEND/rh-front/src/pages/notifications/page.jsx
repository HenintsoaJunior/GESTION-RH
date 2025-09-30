import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import "styles/notifications.css";
import { GetNotificationsByUser } from "services/notifications/services";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getNotificationsByUser = GetNotificationsByUser();

  // Map notification types to icons
  const getIconForType = (type) => {
    switch (type) {
      case "application":
        return <FaIcons.FaUserPlus />;
      case "meeting":
        return <FaIcons.FaCalendarAlt />;
      case "system_update":
        return <FaIcons.FaSyncAlt />;
      case "message":
        return <FaIcons.FaEnvelope />;
      default:
        return <FaIcons.FaBell />;
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotificationsByUser();
        setNotifications(data);
      } catch (err) {
        setError(err.message || "Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [getNotificationsByUser]);

  // Format time for display (e.g., "Il y a 10 minutes")
  const formatTime = (dateString) => {
    if (!dateString) return "Unknown time";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours} heure${hours !== 1 ? "s" : ""}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days} jour${days !== 1 ? "s" : ""}`;
    }
  };

  return (
    <div className="notifications-page">
      <h1>Notifications</h1>
      {loading ? (
        <div className="loading">Chargement des notifications...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="no-notifications">
          <FaIcons.FaBellSlash className="no-notifications-icon" />
          <p>Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div key={notification.notificationId} className="notification-card">
              <div className="notification-icon">
                {getIconForType(notification.notification.type)}
              </div>
              <div className="notification-content">
                <h3>{notification.notification.title}</h3>
                <p>{notification.notification.message}</p>
                <small>{formatTime(notification.createdAt)}</small>
              </div>
              <Link
                to={`/notifications/${notification.notificationId}`}
                className="notification-action"
              >
                <FaIcons.FaArrowRight />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}