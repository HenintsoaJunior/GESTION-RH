"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import { useLastThreeUnreadNotifications, useUnreadNotificationCount } from "@/api/notifications/services";
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
}

interface HeaderProps {
  toggleMobileSidebar: () => void;
  mobileOpen: boolean;
  generateBreadcrumbs: () => BreadcrumbItem[];
  user: User;
  getInitials: (name: string) => string;
  setActive: (itemId: string, title: string, parentMenuKey: string | null) => () => void;
}

const Header: React.FC<HeaderProps> = ({
  toggleMobileSidebar,
  mobileOpen,
  generateBreadcrumbs,
  user,
  getInitials,
  setActive,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const { data: notificationsData = [], isLoading: notifLoading, error: notifError } = useLastThreeUnreadNotifications(user?.userId);
  const { data: unreadCountData = { unreadCount: 0 }, isLoading: countLoading } = useUnreadNotificationCount(user?.userId);

  const notifications: Notification[] = notificationsData || [];
  const unreadCount: number = unreadCountData?.unreadCount || 0;
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

  const onLogoutClick = () => {
    setActive("logout", "Déconnexion", null)();  
    handleLogout(); 
  };

  return (
    <HeaderStyled>
      <HeaderLeft>
        <MenuToggle onClick={toggleMobileSidebar} aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}>
          <FaIcons.FaBars />
        </MenuToggle>
        <Breadcrumb>
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
              <DropdownItem to="/notifications" onClick={() => setIsNotificationsOpen(false)}>
                <FaIcons.FaBell className="dropdown-icon" />
                <span>Voir toutes les notifications</span>
              </DropdownItem>
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
                  <NotificationItem key={notification.notificationId}>
                    <span>{notification.notification.title}</span>
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
            <DropdownItem to="#" onClick={onLogoutClick}>  {/* Ajout de to="#" pour satisfaire le type Link sans navigation effective */}
              <FaIcons.FaSignOutAlt className="dropdown-icon" />
              <span>Déconnexion</span>
              {logoutLoading && <span className="loading"> (Déconnexion...)</span>}  {/* Optionnel : Indicateur de chargement */}
            </DropdownItem>
          </UserDropdownMenu>
        </UserProfileDropdown>
      </HeaderRight>
    </HeaderStyled>
  );
};

export default Header;