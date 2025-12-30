"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import { 
  useUnreadNotifications, 
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead 
} from "@/api/notifications/services";
import {
  Header as HeaderStyled,
  HeaderLeft,
  Breadcrumb,
  MenuToggle,
  HeaderRight,
  NotificationContainer,
  NotificationButton,
  NotificationIconWrapper,
  NotificationIcon,
  NotificationBadge,
  NotificationDropdown,
  NotificationItem,
  DropdownDivider,
  UserInfo,
  UserProfileDropdown,
  UserProfile,
  UserAvatar,
  DropdownArrow,
  UserDropdownMenu,
  DropdownItem,
} from "@/styles/template-styles";
import { useLogoutUser } from "@/api/auth/services";  

interface Notification {
  notificationId: string;
  notification: {
    title: string;
  };
  createdAt: string | null;
}

interface User {
  userId: string;
  name: string;
  email: string;
}

interface BreadcrumbItem {
  title: string;
  path: string;
  isActive: boolean;
  clickable?: boolean;
}

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  generateBreadcrumbs: () => BreadcrumbItem[];
  user: User;
  getInitials: (name: string) => string;
  setActive: (itemId: string, title: string, parentMenuKey: string | null) => () => void;
}

const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  isSidebarOpen,
  generateBreadcrumbs,
  user,
  getInitials,
  setActive,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [markedAsRead, setMarkedAsRead] = useState<Set<string>>(new Set());

  const { data: notificationsData = [], isLoading: notifLoading, error: notifError } = useUnreadNotifications(user?.userId);
  const { data: unreadCountData = { unreadCount: 0 }, isLoading: countLoading } = useUnreadNotificationCount(user?.userId);
  
  const { mutate: markAsRead } = useMarkNotificationAsRead(user?.userId);
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead(user?.userId);

  const notifications: Notification[] = notificationsData.filter(
    (notification) => !markedAsRead.has(notification.notificationId)
  );
  const unreadCount: number = unreadCountData?.unreadCount - markedAsRead.size;
  const errorMessage = notifError ? `Erreur lors du chargement des notifications: ${notifError.message || "Une erreur inconnue s'est produite."}` : null;

  const { logout: handleLogout, isLoading: logoutLoading } = useLogoutUser(
    () => {
      console.log('Déconnexion réussie');
    },
    (error) => {
      console.error('Erreur lors de la déconnexion:', error);
    }
  );

  const toggleNotifications = (): void => {
    setIsNotificationsOpen((prev) => !prev);
  };

  const handleMarkAsRead = (notificationId: string): void => {
    markAsRead({ notificationId });
    setMarkedAsRead(prev => new Set([...prev, notificationId]));
  };

  const handleMarkAllAsRead = (): void => {
    if (notifications.length > 0) {
      markAllAsRead();
      const allIds = notifications.map(n => n.notificationId);
      setMarkedAsRead(prev => new Set([...prev, ...allIds]));
    }
  };

  const onLogoutClick = () => {
    setActive("logout", "Déconnexion", null)();  
    handleLogout(); 
  };

  return (
    <HeaderStyled $isOpen={isSidebarOpen}>
      <HeaderLeft>
        <MenuToggle 
          onClick={toggleSidebar} 
          aria-label={isSidebarOpen ? "Fermer le menu latéral" : "Ouvrir le menu latéral"}
        >
          {isSidebarOpen ? <FaIcons.FaBars /> : <FaIcons.FaBars />}
        </MenuToggle>
        <Breadcrumb>
          {generateBreadcrumbs().map((crumb, index) => (
            <span key={index} className="breadcrumb-item-wrapper">
              {crumb.isActive ? (
                <span className="breadcrumb-item active">{crumb.title}</span>
              ) : crumb.clickable !== false ? (
                <Link to={crumb.path} className="breadcrumb-item">
                  {crumb.title}
                </Link>
              ) : (
                <span className="breadcrumb-item">{crumb.title}</span>
              )}
              {index < generateBreadcrumbs().length - 1 && (
                <span className="breadcrumb-separator">
                  <FaIcons.FaChevronRight size={14} />
                </span>
              )}
            </span>
          ))}
        </Breadcrumb>
      </HeaderLeft>

      <HeaderRight>
        <NotificationContainer>
          <NotificationButton onClick={toggleNotifications} aria-label="Notifications">
            <NotificationIconWrapper>
              <NotificationIcon className="notification-icon">
                <FaIcons.FaBell />
              </NotificationIcon>
              {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
            </NotificationIconWrapper>
          </NotificationButton>
          {isNotificationsOpen && (
            <NotificationDropdown>
              
              {notifications.length > 0 && (
                <>
                  <DropdownItem to="#" onClick={handleMarkAllAsRead}>
                    <FaIcons.FaCheckCircle className="dropdown-icon" />
                    <span>Tout marquer comme lu</span>
                  </DropdownItem>
                </>
              )}
              
              <DropdownDivider />
              
              {notifLoading || countLoading ? (
                <NotificationItem>
                  <span>Chargement des notifications...</span>
                </NotificationItem>
              ) : errorMessage ? (
                <NotificationItem>
                  <span>{errorMessage}</span>
                </NotificationItem>
              ) : notifications.length === 0 ? (
                <NotificationItem>
                  <span>Aucune notification non lue</span>
                </NotificationItem>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem 
                    key={notification.notificationId}
                    onClick={() => handleMarkAsRead(notification.notificationId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{notification.notification.title}</span>
                      <FaIcons.FaCheck 
                        size={12} 
                        style={{ color: '#5a9625', marginLeft: '8px' }}
                        title="Marquer comme lu"
                      />
                    </div>
                    <small>
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Pas de date"
                      }
                    </small>
                  </NotificationItem>
                ))
              )}
            </NotificationDropdown>
          )}
        </NotificationContainer>

        <UserInfo className="large bold">
          <div className="user-name">{user.name}</div>
          <div className="user-email small discreet">{user.email}</div>
        </UserInfo>

        <UserProfileDropdown>
          <UserProfile>
            <UserAvatar className="--primary-color">{getInitials(user.name)}</UserAvatar>
            <DropdownArrow className="dropdown-arrow" />
          </UserProfile>
          <UserDropdownMenu>
            <DropdownItem to="/profil-page" onClick={setActive("profile", "Mon profil", null)}>
              <FaIcons.FaUser className="dropdown-icon" />
              <span>Mon profil</span>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem to="#" onClick={onLogoutClick}>
              <FaIcons.FaSignOutAlt className="dropdown-icon" />
              <span>Déconnexion</span>
              {logoutLoading && <span className="loading"> (Déconnexion...)</span>}
            </DropdownItem>
          </UserDropdownMenu>
        </UserProfileDropdown>
      </HeaderRight>
    </HeaderStyled>
  );
};

export default Header;