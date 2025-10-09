import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import ReactCountryFlag from "react-country-flag";
import { GetUnreadNotificationCount, GetLastThreeUnreadNotifications } from "services/notifications/services";

export default function Header({ 
  toggleMobileSidebar, 
  mobileOpen, 
  generateBreadcrumbs, 
  languages, 
  selectedLanguage, 
  handleLanguageChange, 
  isLanguagesLoading, 
  user, 
  getInitials, 
  setActive 
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState({ notifications: false, count: false });
  const [error, setError] = useState({ isOpen: false, message: "" });

  const getLastThreeUnreadNotifications = GetLastThreeUnreadNotifications();
  const getUnreadNotificationCount = GetUnreadNotificationCount();

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.userId) return;

      try {
        setIsLoading((prev) => ({ ...prev, notifications: true }));
        const notificationData = await getLastThreeUnreadNotifications(user.userId);
        setNotifications(notificationData);
      } catch (err) {
        setError({
          isOpen: true,
          message: `Erreur lors du chargement des notifications: ${err.message || "Une erreur inconnue s'est produite."}`,
        });
        setNotifications([]);
      } finally {
        setIsLoading((prev) => ({ ...prev, notifications: false }));
      }
    };

    const fetchUnreadCount = async () => {
      if (!user?.userId) return;

      try {
        setIsLoading((prev) => ({ ...prev, count: true }));
        const countData = await getUnreadNotificationCount(user.userId);
        setUnreadCount(countData.unreadCount);
      } catch (err) {
        setError({
          isOpen: true,
          message: `Erreur lors du chargement du nombre de notifications: ${err.message || "Une erreur inconnue s'est produite."}`,
        });
        setUnreadCount(0);
      } finally {
        setIsLoading((prev) => ({ ...prev, count: false }));
      }
    };

    fetchNotifications();
    fetchUnreadCount();
  }, [user?.userId, getLastThreeUnreadNotifications, getUnreadNotificationCount]);

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="menu-toggle"
          onClick={toggleMobileSidebar}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <FaIcons.FaBars />
        </button>
        <nav className="breadcrumb">
          {generateBreadcrumbs().map((crumb, index) => (
            <span key={index} className="breadcrumb-item-wrapper">
              {crumb.isActive ? (
                <span className="breadcrumb-item active">{crumb.title}</span>
              ) : (
                <Link to={crumb.path} className="breadcrumb-item">
                  {crumb.title}
                </Link>
              )}
              {index < generateBreadcrumbs().length - 1 && (
                <span className="breadcrumb-separator">
                  <FaIcons.FaChevronRight size={14} />
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="header-center">
        <div className="search-container">
          <FaIcons.FaSearch className="search-icon" />
          <input type="text" placeholder="Rechercher..." className="search-input" />
        </div>
      </div>

      <div className="header-right">
        <div className="header-icons">
          <div className="notification-container">
            <button
              className="notification-button"
              onClick={toggleNotifications}
              aria-label="Notifications"
            >
              <div className="notification-icon-wrapper">
                <FaIcons.FaBell className="notification-icon" />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </div>
            </button>
            {isNotificationsOpen && (
              <div className="notification-dropdown">
                <Link to="/notifications" className="dropdown-item" onClick={() => setIsNotificationsOpen(false)}>
                  <FaIcons.FaBell className="dropdown-icon" />
                  <span>Voir toutes les notifications</span>
                </Link>
                <div className="dropdown-divider" />
                {isLoading.notifications ? (
                  <div className="notification-item">
                    <span>Chargement des notifications...</span>
                  </div>
                ) : error.isOpen ? (
                  <div className="notification-item">
                    <span>{error.message}</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="notification-item">
                    <span>Aucune notification non lue</span>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.notificationId} className="notification-item">
                      <span>{notification.notification.title}</span>
                      <small>
                        {new Date(notification.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="language-selector">
            <ReactCountryFlag
              countryCode={languages.find((lang) => lang.languageId === selectedLanguage)?.countryCode || "US"}
              svg
              style={{
                width: "20px",
                height: "15px",
                marginRight: "8px",
              }}
            />
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="language-dropdown"
              disabled={isLanguagesLoading}
            >
              {languages.map((lang) => (
                <option key={lang.languageId} value={lang.languageId}>
                  {lang.abr} - {lang.languageName}
                </option>
              ))}
            </select>
          </div>

          <div className="user-profile-dropdown">
            <div className="user-profile">
              <div className="user-avatar">{getInitials(user.name)}</div>
              <FaIcons.FaChevronDown className="dropdown-arrow" />
            </div>
            <div className="user-dropdown-menu">
              <Link to="/profil-page" className="dropdown-item" onClick={() => setActive("profile", "Mon profil", null)}>
                <FaIcons.FaUser className="dropdown-icon" />
                <span>Mon profil</span>
              </Link>
              <div className="dropdown-divider" />
              <Link to="/" className="dropdown-item" onClick={() => setActive("logout", "Déconnexion", null)}>
                <FaIcons.FaSignOutAlt className="dropdown-icon" />
                <span>Déconnexion</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}