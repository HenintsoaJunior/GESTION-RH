import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';

export const App = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-secondary);
`;

export const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--overlay-bg);
  z-index: 999;
  opacity: 1;
  visibility: visible;
`;

export const Sidebar = styled.aside<{ $collapsed: boolean; $mobileOpen: boolean }>`
  width: var(--sidebar-width);
  background-color: var(--bg-primary);
  color: var(--text-sidebar);
  transition: width var(--transition-speed) ease;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      width: var(--sidebar-collapsed-width);
    `}

  @media (max-width: 768px) {
    transform: translateX(-100%);
    width: var(--sidebar-width);
    transition: transform var(--transition-speed) ease;

    ${({ $mobileOpen }) =>
      $mobileOpen &&
      css`
        transform: translateX(0);
      `}
  }
`;

export const SidebarHeader = styled.div`
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--white);
`;

export const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const LogoImage = styled.img`
  width: 200px;
  height: 80px;
  object-fit: contain;
`;

export const SidebarDivider = styled.div<{ $collapsed?: boolean }>`
  padding: 15px 20px 5px;
  display: flex;
  align-items: center;
  color: var(--text-sidebar);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 1px;
  text-transform: uppercase;

  span {
    padding-right: 10px;
  }

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: var(--border-color);
  }

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      display: none;
    `}
`;

export const SidebarNav = styled.nav`
  flex: 1;
  padding: 5px 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 20px;
  }
`;

export const NavUl = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const NavItem = styled.li<{ $level: number }>`
  list-style: none;
  margin-bottom: 2px;
  position: relative;
`;

const NavButtonBase = css`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 20px;
  color: var(--text-sidebar);
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  font-size: var(--font-size-sm);
  position: relative;
  border-radius: 0;
  font-weight: var(--font-weight-medium);
  text-decoration: none !important;

  &:hover {
    background-color: var(--bg-sidebar-hover);
    color: var(--text-sidebar);
  }

  &.expanded {
    background-color: var(--primary-light);
    color: var(--text-sidebar);
  }

  &.active {
    background-color: var(--bg-sidebar-active);
    color: var(--text-white);
  }

  .nav-icon-wrapper {
    width: 23px;
    height: 23px;
    background-color: var(--bg-icon-default);
    border-radius: var(--border-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--spacing-sm);
    transition: all var(--transition-speed) ease;

    &:hover {
      background-color: var(--bg-icon-hover);
    }

    &.expanded,
    &.active {
      background-color: var(--primary-color);
      color: var(--text-white);
    }

    &.premium {
      background: var(--badge-premium);
      color: var(--text-white);
      text-decoration: none;
    }
  }

  .nav-icon {
    font-size: var(--font-size-sm);
  }

  .nav-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-badge {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    padding: 3px 8px;
    border-radius: 10px;
    margin-right: var(--spacing-sm);
    text-transform: uppercase;

    &.new {
      background-color: var(--badge-new);
      color: var(--text-white);
    }

    &.count {
      background-color: var(--badge-count);
      color: var(--text-white);
    }

    &.hot {
      background-color: var(--badge-hot);
      color: var(--text-white);
    }

    &.premium {
      background: var(--badge-premium);
      color: var(--text-white);
    }
  }

  .unread-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 15px;
    height: 15px;
    padding: 0 3.5px;
    margin-left: 8px;
    background-color: var(--badge-count);
    color: var(--text-white);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    border-radius: 7.5px;
    line-height: 15px;
  }

  .nav-arrow {
    font-size: var(--font-size-md);
    transition: transform var(--transition-speed) ease;
    margin-left: var(--spacing-xs);

    &.rotated {
      transform: rotate(180deg);
    }
  }
`;

export const NavButton = styled.button`
  ${NavButtonBase}
`;

export const NavLink = styled(Link)`
  ${NavButtonBase}
`;

export const Submenu = styled.ul<{ $level: number; $expanded: boolean }>`
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-speed) ease;
  margin-left: 30px;
  margin-right: var(--spacing-sm);
  padding-left: var(--spacing-md);
  border-left: 1px dashed var(--border-dashed);

  li {
    list-style: none;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: -20px;
      top: 15px;
      width: 10px;
      height: 1px;
      background-color: var(--border-dashed);
    }

    a {
      display: flex;
      align-items: center;
      padding: var(--spacing-sm) var(--spacing-md);
      color: var(--text-sidebar);
      text-decoration: none;
      font-size: var(--font-size-xs);
      border-radius: var(--border-radius-sm);
      transition: all var(--transition-speed) ease;
      position: relative;

      &:hover {
        background-color: var(--primary-light);
        color: var(--text-sidebar);
      }

      &.active {
        background-color: var(--primary-color);
        color: var(--text-white);

        &::before {
          content: '';
          position: absolute;
          left: -2px;
          top: 0;
          height: 100%;
          width: 4px;
          background-color: var(--primary-light);
          border-radius: 0 4px 4px 0;
        }
      }
    }

    .submenu-icon {
      font-size: var(--font-size-sm);
      margin-right: var(--spacing-sm);
      opacity: var(--opacity-low);
    }

    .submenu-badge {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: auto;
      background-color: var(--bg-badge-default);
      color: var(--text-sidebar);

      &.hot {
        background-color: var(--badge-hot);
        color: var(--text-white);
      }
    }
  }

  ${({ $expanded }) =>
    $expanded &&
    css`
      max-height: 500px;
      padding-top: var(--spacing-xs);
      padding-bottom: var(--spacing-xs);
    `}

  @media (max-width: 768px) {
    display: none;
  }
`;

export const PremiumFeature = styled.div`
  .nav-button {
    margin-top: var(--spacing-sm);
    border-top: 1px solid var(--border-color);
    padding-top: var(--spacing-md);
  }
`;

export const SidebarFooter = styled.div`
  padding: var(--spacing-md) 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

export const SidebarFooterInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .sidebar-footer-title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-sidebar);
  }

  .sidebar-footer-subtitle {
    font-size: var(--font-size-xs);
    color: var(--text-sidebar);
    opacity: 0.6;
  }

  .sidebar-footer-copyright {
    font-size: var(--font-size-xs);
    color: var(--text-sidebar);
    opacity: 0.5;
    text-align: center;
    padding-top: var(--spacing-xs);
    border-top: 1px solid var(--border-color);
  }
`;

export const ThemeSelector = styled.div`
  &.theme-selector-small {
    .theme-dots {
      display: flex;
      gap: var(--spacing-xs);

      button {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        transition: all var(--transition-speed) ease;

        &.active {
          transform: scale(1.2);
          box-shadow: 0 0 0 2px var(--primary-color);
        }
      }
    }
  }
`;

export const MainContent = styled.main<{ $collapsed: boolean }>`
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-speed) ease;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
  @media (max-width: 768px) {
    margin-left: 0;

    ${({ $collapsed }) =>
      !$collapsed &&
      css`
        margin-left: 0;
      `}
  }
`;

export const Header = styled.header<{ $collapsed?: boolean }>`
  height: var(--header-height);
  background-color: var(--white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-2xl);
  box-shadow: var(--shadow-sm);
  flex-wrap: nowrap;
  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  right: 0;
  z-index: 999;
  transition: left var(--transition-speed) ease;

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      left: var(--sidebar-collapsed-width);
    `}

  @media (max-width: 768px) {
    left: 0;

    ${({ $collapsed }) =>
      $collapsed &&
      css`
        left: 0;
      `}
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;

  h1 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
`;

export const HeaderCenter = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  padding: 0 var(--spacing-lg);
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
`;

export const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-sm) 36px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  outline: none;
  transition: all var(--transition-speed) ease;
  background-color: var(--white);
  color: var(--text-color);

  &:focus {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-focus);
  }
`;

export const SearchIcon = styled(FaIcons.FaSearch)`
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-placeholder);
  font-size: var(--font-size-sm);
`;

export const HeaderIcons = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

export const HeaderIconButton = styled.button`
  background: none;
  border: none;
  color: var(--text-light);
  font-size: var(--font-size-lg);
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-speed) ease;

  &:hover {
    background-color: var(--bg-light);
    color: var(--primary-color);
  }
`;

// Extrait des styles à mettre à jour dans template-styles.ts

export const NotificationIconWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: 40px;
  height: 24px;
`;

export const NotificationIcon = styled.div`
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  position: absolute;
  left: 0;
  z-index: 1;
`;

export const NotificationBadge = styled.span`
  position: absolute;
  top: -6px;
  left: 16px;
  background-color: var(--badge-count);
  color: var(--text-white);
  font-size: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  border: 2px solid var(--white);
  padding: 0;
  z-index: 2;
  line-height: 1;
`;

export const NotificationButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  padding: var(--spacing-sm);
  color: var(--text-light);
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-speed) ease;

  &:hover {
    background-color: var(--bg-light);
    color: var(--primary-color);
  }
`;

export const NotificationContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const NotificationDropdown = styled.div`
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  right: 0;
  background: var(--white);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 300px;
  max-width: 350px;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all var(--transition-speed) ease;

  ${NotificationContainer}:hover & {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

export const NotificationItem = styled.div`
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  transition: background-color var(--transition-speed) ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--bg-light);
  }

  span {
    display: block;
    font-size: var(--font-size-sm);
    color: var(--text-color);
    margin-bottom: 4px;
    font-weight: var(--font-weight-medium);
  }

  small {
    font-size: var(--font-size-xs);
    color: var(--text-placeholder);
  }
`;

export const DropdownDivider = styled.div`
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-xs) 0;
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-right: 1rem;
  text-align: left;

  &.large {
    .user-name {
      font-size: 1rem;
      font-weight: 700;
      color: #222;
      line-height: 1.2;
    }

    .user-email {
      font-size: 0.85rem;
      color: #666;
      margin-top: 2px;
    }
  }

  &.small {
    .user-name {
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-xs);
    }

    .user-role {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }
  }
`;

export const UserProfileDropdown = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

export const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: 6px var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-speed) ease;

  &:hover {
    background-color: var(--bg-light);
  }
`;

export const UserAvatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  background-color: var(--primary-color, #007bff);
`;

export const DropdownArrow = styled(FaIcons.FaChevronDown)`
  font-size: var(--font-size-sm);
  margin-left: var(--spacing-xs);
  transition: transform var(--transition-speed) ease;

  ${UserProfileDropdown}:hover & {
    transform: rotate(180deg);
  }
`;

export const UserDropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  right: 0;
  width: 200px;
  background-color: var(--white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-sm) 0;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all var(--transition-speed) ease;

  ${UserProfileDropdown}:hover & {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

export const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-color);
  text-decoration: none;
  font-size: var(--font-size-xs);
  transition: all var(--transition-speed) ease;

  &:hover {
    background-color: var(--bg-light);
  }

  .dropdown-icon {
    font-size: var(--font-size-sm);
    margin-right: var(--spacing-sm);
    color: var(--text-muted);
  }
`;

export const MenuToggle = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text-light);
  font-size: var(--font-size-xl);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-sm);
  align-items: center;
  justify-content: center;
  transition: all var(--transition-speed) ease;

  &:hover {
    background-color: var(--bg-light);
    color: var(--primary-color);
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

export const Content = styled.div`
  padding: var(--spacing-xl);
  margin-top: var(--header-height);
  margin-bottom: var(--header-height);
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const FooterCopyright = styled.div`
  background-color: var(--white);
  width: 100%;
  text-align: center;
  font-size: var(--font-size-sm);
  color: black;
  font-weight: var(--font-weight-medium);
`;

export const TemplateFooter = styled.footer<{ $collapsed?: boolean }>`
  height: var(--header-height);
  background-color: var(--white);
  padding: 0 var(--spacing-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
  position: fixed;
  bottom: 0;
  left: var(--sidebar-width);
  right: 0;
  z-index: 998;
  transition: left var(--transition-speed) ease;

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      left: var(--sidebar-collapsed-width);
    `}

  @media (max-width: 768px) {
    left: 0;

    ${({ $collapsed }) =>
      $collapsed &&
      css`
        left: 0;
      `}
  }
`;

export const DashboardContent = styled.div`
  background-color: var(--white);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  h2 {
    margin-bottom: var(--spacing-xl);
    color: var(--primary-color);
  }
`;

export const LanguageDropdown = styled.select`
  appearance: none;
  padding: 6px 28px 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background-color: var(--white);
  font-size: var(--font-size-xs);
  font-family: var(--font-family);
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  min-width: 100px;
  max-width: 140px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: var(--shadow-focus);
  }

  &:hover {
    border-color: var(--primary-hover);
  }

  option {
    color: var(--text-color);
    background-color: var(--white);
  }

  @media (max-width: 1024px) {
    min-width: 90px;
    max-width: 120px;
  }

  @media (max-width: 768px) {
    min-width: 80px;
    max-width: 100px;
    padding: 5px 24px 5px 8px;
    font-size: var(--font-size-xs);

    + .language-icon {
      font-size: var(--font-size-md);
      margin-right: var(--spacing-xs);
    }
  }
`;

export const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  color: var(--text-muted);
  padding: var(--spacing-xs) 0;
  line-height: 1.5;

  .breadcrumb-item-wrapper {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
    color: var(--text-muted);
    text-decoration: none;
    transition: color var(--transition-speed) ease;
    font-size: var(--font-size-sm);
    padding: 0 6px;
    line-height: 1.5;

    &:hover {
      color: var(--primary-color);
    }

    &.active {
      color: var(--text-color);
      font-weight: var(--font-weight-medium);
    }
  }

  .breadcrumb-separator {
    color: var(--text-muted);
    font-size: var(--font-size-sm);
    margin: 0 var(--spacing-xs);
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    font-size: var(--font-size-xs);
    gap: 3px;

    .breadcrumb-item-wrapper {
      gap: 1px;
    }

    .breadcrumb-item {
      padding: 0 3px;
    }

    .breadcrumb-separator {
      margin: 0 2px;
    }
  }
`;

export const MenuLoadingDots = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-sidebar);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  position: relative;

  &::after {
    content: '.';
    margin-left: var(--spacing-xs);
    animation: menu-loading-dots 1.4s ease-in-out infinite;
    color: var(--primary-color);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-md);
  }

  @keyframes menu-loading-dots {
    0%, 20% { content: '.'; opacity: 1; }
    40% { content: '..'; opacity: 1; }
    60% { content: '...'; opacity: 1; }
    80% { content: '....'; opacity: 0.7; }
    100% { content: '.'; opacity: 1; }
  }

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      padding: var(--spacing-md) var(--spacing-sm);
      font-size: var(--font-size-xs);

      &::after {
        margin-left: 2px;
        font-size: var(--font-size-sm);
      }
    `}
`;

export const MenuLoadingSpinner = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-sidebar);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);

  &::after {
    content: '';
    width: 16px;
    height: 16px;
    margin-left: var(--spacing-sm);
    border: 2px solid var(--border-spinner);
    border-top: 2px solid var(--primary-color);
    border-radius: 50%;
    animation: menu-loading-spin 1s linear infinite;
  }

  @keyframes menu-loading-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      padding: var(--spacing-md) var(--spacing-sm);
      font-size: var(--font-size-xs);

      &::after {
        width: 12px;
        height: 12px;
        margin-left: var(--spacing-xs);
      }
    `}
`;

export const FontTooltip = styled.div`
  position: absolute;
  z-index: 1070;
  display: block;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 12px;
  font-weight: normal;
  line-height: 1.4;
  filter: alpha(opacity=0);
  opacity: 0;
`;