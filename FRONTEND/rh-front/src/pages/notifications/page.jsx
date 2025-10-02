import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import "styles/notifications.css";
import { GetNotificationsByUser } from "services/notifications/services";

const useAuthUserId = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    return userData?.userId;
};
// -----------------------------------------------------------------------------

// Map notification types to icons (defined outside to avoid re-creation on render)
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

// Format time for display (e.g., "Il y a 10 minutes") (defined outside for stability)
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


export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Get the userId from the appropriate source (e.g., context)
    const userId = useAuthUserId();
    
    // 2. Get the memoized service function
    const getNotificationsByUser = GetNotificationsByUser();

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!userId) {
                // Handle case where user is not logged in or ID is missing
                setLoading(false);
                setError("User not authenticated. Cannot fetch notifications.");
                return;
            }

            try {
                setLoading(true);
                // 3. PASS THE userId AS ARGUMENT to the service function
                const data = await getNotificationsByUser(userId); 
                setNotifications(data);
                setError(null);
            } catch (err) {
                setError(err.message || "Failed to fetch notifications");
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [getNotificationsByUser, userId]); // 4. 'userId' is now a required dependency

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