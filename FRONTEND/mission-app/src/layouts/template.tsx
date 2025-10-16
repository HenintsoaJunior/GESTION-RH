"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import { useMenuHierarchy } from "@/api/menu/services";
import Header from "./header";
import Footer from "./footer";
import {
  App,
  SidebarOverlay,
  Sidebar,
  SidebarHeader,
  LogoContainer,
  LogoImage,
  SidebarDivider,
  SidebarNav,
  NavUl,
  NavItem,
  NavButton,
  NavLink,
  Submenu,
  MainContent,
  Content,
  MenuLoadingDots,
} from "@/styles/template-styles";

import TemplateFooter from "./template-footer";

interface Menu {
  menuKey: string;
  label?: string | null;
  link: string;
  icon: string;
  section?: string;
  position: number;
}

interface MenuItem {
  hierarchyId: number;
  menu: Menu;
  children?: MenuItem[];
}

interface BreadcrumbItem {
  title: string;
  path: string;
  isActive: boolean;
}

interface User {
  userId: string;
  name: string;
  email: string;
  roles: { roleName: string }[];
}

interface Theme {
  id: string;
  name: string;
  color: string;
}

interface TemplateProps {
  children: React.ReactNode;
}

interface MenuPathResult {
  item: Menu;
  parentKey: string | null;
  title: string;
}

const Template: React.FC<TemplateProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [collapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [activeItem, setActiveItem] = useState<string>("dashboard");
  const [headerTitle, setHeaderTitle] = useState<string>("Dashboard");
  const [theme, setTheme] = useState<string>(localStorage.getItem("theme") || "default");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Refs
  const isInitializedRef = useRef<boolean>(false);
  const lastLocationRef = useRef<string>("");
  const navigationUpdateRef = useRef<boolean>(false);

  // Vérifier l'authentification au montage
  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!userStr || !token) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        navigate("/login", { replace: true });
        return;
      }

      try {
        JSON.parse(userStr);
        JSON.parse(token);
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        navigate("/login", { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  // Récupérer les données utilisateur de manière sécurisée
  const user: User = (() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return {
        userId: "",
        name: "John Doe",
        email: "john.doe@example.com",
        roles: [{ roleName: "Administrateur" }],
      };
    }
    try {
      return JSON.parse(userStr);
    } catch {
      return {
        userId: "",
        name: "John Doe",
        email: "john.doe@example.com",
        roles: [{ roleName: "Administrateur" }],
      };
    }
  })();

  // Seulement récupérer les menus si authentifié
  const { data: menuData = [], isLoading: isMenuLoading } = useMenuHierarchy(
    isAuthenticated && user.userId ? user.userId : ""
  );

  // Generate initials
  const getInitials = useCallback((name: string): string => {
    const cleanName = name.replace(/\s*\([^)]+\)\s*/g, "").trim();
    const nameParts = cleanName.split(/\s+/);
    const firstInitial = nameParts[0] ? nameParts[0][0] : "J";
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "D";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }, []);

  // Theme configuration
  const themes = useMemo<Theme[]>(
    () => [
      { id: "default", name: "Défaut (Vert)", color: "#69B42E" },
      { id: "gray", name: "Gris", color: "#9d9d9c" },
      { id: "warm", name: "Chaud", color: "#e30613" },
      { id: "light", name: "Clair", color: "#c6dc96" },
    ],
    []
  );

  // Get icon component
  const getIconComponent = useCallback((iconName: string) => {
    const formattedIconName = `Fa${iconName
      .replace("fa-", "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("")}`;
    return (FaIcons as any)[formattedIconName] || FaIcons.FaFile;
  }, []);

  // Get menu label
  const getMenuLabel = useCallback((menuItem: Menu): string => {
    if (!menuItem.label || menuItem.label === null) {
      return menuItem.menuKey
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return menuItem.label;
  }, []);

  // Find menu item by path
  const findMenuItemByPath = useCallback(
    (items: MenuItem[], targetPath: string): MenuPathResult | null => {
      for (const item of items) {
        if (item.menu.link === targetPath) {
          return {
            item: item.menu,
            parentKey: null,
            title: getMenuLabel(item.menu),
          };
        }
        if (item.children && item.children.length > 0) {
          for (const child of item.children) {
            if (child.menu.link === targetPath) {
              return {
                item: child.menu,
                parentKey: item.menu.menuKey,
                title: getMenuLabel(child.menu),
              };
            }
            if (child.children && child.children.length > 0) {
              const deepResult: MenuPathResult | null = findMenuItemByPath([child], targetPath);
              if (deepResult) {
                return {
                  ...deepResult,
                  parentKey: item.menu.menuKey,
                };
              }
            }
          }
        }
      }
      return null;
    },
    [getMenuLabel]
  );

  // Generate breadcrumbs
  const generateBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    const currentPath = location.pathname === "/" ? "/" : location.pathname + location.hash;
    const breadcrumbs: BreadcrumbItem[] = [];

    breadcrumbs.push({
      title: "Accueil",
      path: "/",
      isActive: currentPath === "/",
    });

    if (currentPath === "/system") {
      breadcrumbs.push({
        title: "System",
        path: "/system",
        isActive: true,
      });
    } else if (currentPath === "/entite") {
      breadcrumbs.push({
        title: "Entite",
        path: "/entite",
        isActive: true,
      });
    } else if (currentPath === "/profil-page") {
      breadcrumbs.push({
        title: "Mon profil",
        path: "/profil-page",
        isActive: true,
      });
    } else {
      const matchedResult = findMenuItemByPath(menuData, currentPath);
      if (matchedResult) {
        const { item, parentKey, title } = matchedResult;

        if (parentKey) {
          const findParent = (items: MenuItem[], key: string): Menu | null => {
            for (const menuItem of items) {
              if (menuItem.menu.menuKey === key) {
                return menuItem.menu;
              }
              if (menuItem.children && menuItem.children.length > 0) {
                const parent = findParent(menuItem.children, key);
                if (parent) return parent;
              }
            }
            return null;
          };

          const parentMenu = findParent(menuData, parentKey);
          if (parentMenu) {
            breadcrumbs.push({
              title: getMenuLabel(parentMenu),
              path: parentMenu.link,
              isActive: false,
            });
          }
        }

        breadcrumbs.push({
          title,
          path: item.link,
          isActive: true,
        });
      }
    }

    return breadcrumbs;
  }, [location.pathname, location.hash, menuData, findMenuItemByPath, getMenuLabel]);

  // Initialize expanded menus
  const initializeExpandedMenus = useCallback((menuItems: MenuItem[]): Record<string, boolean> => {
    const expanded: Record<string, boolean> = {};
    const processItems = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          expanded[item.menu.menuKey] = false;
          processItems(item.children);
        }
      });
    };
    processItems(menuItems);
    return expanded;
  }, []);

  // Initialize expanded on menu load
  useEffect(() => {
    if (menuData.length > 0 && !isInitializedRef.current) {
      const initialExpanded = initializeExpandedMenus(menuData);
      setExpandedMenus(initialExpanded);
      isInitializedRef.current = true;
    }
  }, [menuData, initializeExpandedMenus]);

  // Update active item etc.
  useEffect(() => {
    if (menuData.length === 0) return;
    const currentPath = location.pathname === "/" ? "/" : location.pathname + location.hash;
    if (lastLocationRef.current === currentPath) return;
    if (navigationUpdateRef.current) return;

    lastLocationRef.current = currentPath;
    navigationUpdateRef.current = true;

    const matchedResult = findMenuItemByPath(menuData, currentPath);

    if (matchedResult) {
      const { item, parentKey, title } = matchedResult;
      if (activeItem !== item.menuKey) {
        setActiveItem(item.menuKey);
      }
      if (headerTitle !== title) {
        setHeaderTitle(title);
      }
      setExpandedMenus((prev) => {
        const newExpanded = { ...prev };
        Object.keys(newExpanded).forEach((key) => {
          newExpanded[key] = key === parentKey;
        });
        return newExpanded;
      });
    } else {
      if (activeItem !== "dashboard") {
        setActiveItem("dashboard");
      }
      if (headerTitle !== "Dashboard") {
        setHeaderTitle("Dashboard");
      }
      setExpandedMenus((prev) => {
        const newExpanded = { ...prev };
        Object.keys(newExpanded).forEach((key) => {
          newExpanded[key] = false;
        });
        return newExpanded;
      });
    }

    setTimeout(() => {
      navigationUpdateRef.current = false;
    }, 50);
  }, [location.pathname, location.hash, menuData, findMenuItemByPath, activeItem, headerTitle]);

  const toggleMobileSidebar = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      closeMobileSidebar();
    },
    [closeMobileSidebar]
  );

  useEffect(() => {
    const handleResize = (): void => {
      if (window.innerWidth > 768 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen]);

  const toggleMenu = useCallback((menuKey: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  }, []);

  const findParentKey = useCallback((items: MenuItem[], targetKey: string): string | null => {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          if (child.menu.menuKey === targetKey) {
            return item.menu.menuKey;
          }
          if (child.children && child.children.length > 0) {
            const deepParent = findParentKey([child], targetKey);
            if (deepParent) return item.menu.menuKey;
          }
        }
      }
    }
    return null;
  }, []);

  const setActive = useCallback(
    (itemId: string, title: string, parentMenuKey: string | null) => () => {
      navigationUpdateRef.current = true;
      setActiveItem(itemId);
      setHeaderTitle(title);
      setMobileOpen(false);
      setExpandedMenus((prev) => {
        const newExpanded = { ...prev };
        Object.keys(newExpanded).forEach((key) => {
          newExpanded[key] = key === parentMenuKey;
        });
        return newExpanded;
      });
      setTimeout(() => {
        navigationUpdateRef.current = false;
      }, 100);
    },
    []
  );

  const handleThemeChange = useCallback((newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }, []);

  // Group menu by section
  const groupMenuBySection = useCallback((menuItems: MenuItem[]) => {
    const grouped = {
      navigation: [] as MenuItem[],
      administration: [] as MenuItem[],
    };

    menuItems.forEach((item) => {
      const section = item.menu.section || "navigation";
      if (section === "navigation") {
        grouped.navigation.push(item);
      } else if (section === "administration") {
        grouped.administration.push(item);
      } else {
        grouped.navigation.push(item);
      }
    });

    grouped.navigation.sort((a, b) => a.menu.position - b.menu.position);
    grouped.administration.sort((a, b) => a.menu.position - b.menu.position);

    return grouped;
  }, []);

  const renderMenuItem = useCallback(
    (item: MenuItem, level: number = 0): React.ReactNode => {
      const IconComponent = getIconComponent(item.menu.icon);
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedMenus[item.menu.menuKey];
      const isActive = activeItem === item.menu.menuKey;
      const menuLabel = getMenuLabel(item.menu);

      return (
        <NavItem key={item.hierarchyId} $level={level}>
          {hasChildren ? (
            <NavButton
              className={isExpanded ? "expanded" : ""}
              onClick={() => toggleMenu(item.menu.menuKey)}
            >
              <div className="nav-icon-wrapper">
                <IconComponent className="nav-icon" />
              </div>
              <span className="nav-text">{menuLabel}</span>
              {!collapsed && <FaIcons.FaChevronDown className={`nav-arrow ${isExpanded ? "rotated" : ""}`} />}
            </NavButton>
          ) : (
            <NavLink
              to={item.menu.link}
              className={isActive ? "active --primary-color" : ""}
              onClick={setActive(
                item.menu.menuKey,
                menuLabel,
                level === 0 ? null : findParentKey(menuData, item.menu.menuKey)
              )}
            >
              <div className="nav-icon-wrapper">
                <IconComponent className="nav-icon" />
              </div>
              <span className="nav-text">{menuLabel}</span>
            </NavLink>
          )}
          {hasChildren && (
            <Submenu $level={level + 1} $expanded={isExpanded}>
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </Submenu>
          )}
        </NavItem>
      );
    },
    [expandedMenus, collapsed, activeItem, getIconComponent, toggleMenu, setActive, getMenuLabel, menuData, findParentKey]
  );

  const renderSection = useCallback((sectionName: string, items: MenuItem[]) => {
    return (
      <>
        <SidebarDivider $collapsed={collapsed}>
          <span>{!collapsed && sectionName}</span>
        </SidebarDivider>
        {isMenuLoading ? (
          <MenuLoadingDots $collapsed={collapsed}>Chargement...</MenuLoadingDots>
        ) : (
          items.length > 0 &&
          items.map((item) => renderMenuItem(item, 0))
        )}
      </>
    );
  }, [isMenuLoading, collapsed, renderMenuItem]);

  const renderMenu = useCallback(() => {
    const groupedMenu = groupMenuBySection(menuData);

    return (
      <SidebarNav>
        <NavUl>
          {renderSection("NAVIGATION", groupedMenu.navigation)}
          {renderSection("ADMINISTRATION", groupedMenu.administration)}
        </NavUl>
      </SidebarNav>
    );
  }, [groupMenuBySection, menuData, renderSection]);

  // Si en train de vérifier l'authentification, afficher un écran vide
  if (isCheckingAuth) {
    return (
      <App className={`theme-${theme}`}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw"
        }}>
          <div>Vérification de l'authentification...</div>
        </div>
      </App>
    );
  }

  // Si pas authentifié, afficher un message et laisser React Router effectuer la redirection
  if (!isAuthenticated) {
    return (
      <App className={`theme-${theme}`}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw"
        }}>
          <div>Redirection vers la page de connexion...</div>
        </div>
      </App>
    );
  }

  return (
    <App className={`theme-${theme}`}>
      {mobileOpen && <SidebarOverlay onClick={handleOverlayClick} />}
      <Sidebar $collapsed={collapsed} $mobileOpen={mobileOpen}>
        <SidebarHeader>
          <LogoContainer>
            <LogoImage src="/Logo.JPG" alt="Logo" />
          </LogoContainer>
        </SidebarHeader>
        {renderMenu()}
        <Footer collapsed={collapsed} themes={themes} theme={theme} handleThemeChange={handleThemeChange} />
      </Sidebar>
      <MainContent $collapsed={collapsed}>
        <Header
          toggleMobileSidebar={toggleMobileSidebar}
          mobileOpen={mobileOpen}
          generateBreadcrumbs={generateBreadcrumbs}
          user={user}
          getInitials={getInitials}
          setActive={setActive}
        />
        <Content>{children}</Content>

        <TemplateFooter collapsed={collapsed} />
      </MainContent>
    </App>
  );
};

export default Template;