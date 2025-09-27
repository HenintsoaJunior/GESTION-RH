"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import ReactCountryFlag from "react-country-flag";
import "styles/template.css";
import { BASE_URL } from "config/apiConfig";

export default function Template({ children }) {
  const location = useLocation();
  const [collapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [activeItem, setActiveItem] = useState("dashboard");
  const [headerTitle, setHeaderTitle] = useState("Dashboard");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "default");
  const [menuData, setMenuData] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("selectedLanguage") || "fr";
  });
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [isLanguagesLoading, setIsLanguagesLoading] = useState(false);

  // Refs pour éviter les rechargements inutiles
  const menuDataRef = useRef(null);
  const languagesRef = useRef([]);
  const isInitializedRef = useRef(false);
  const lastLocationRef = useRef("");
  const navigationUpdateRef = useRef(false);

  // Retrieve user data from localStorage based on new login response format
  const user = JSON.parse(localStorage.getItem("user")) || {
    userId: "USER DEFAULT",
    name: "John Doe",
    roles: [{ roleName: "Administrateur" }],
  };

  // Derive role for display by joining roleNames
  const userRole = user.roles?.map((role) => role.roleName).join(", ") || "Administrateur";

  // Generate initials for avatar
  const getInitials = useCallback((name) => {
    const cleanName = name.replace(/\s*\([^)]+\)\s*/g, "").trim();
    const nameParts = cleanName.split(/\s+/);
    const firstInitial = nameParts[0] ? nameParts[0][0] : "J";
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "D";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }, []);

  // Theme configuration
  const themes = useMemo(
    () => [
      { id: "default", name: "Défaut (Vert)", color: "#69B42E" },
      { id: "gray", name: "Gris", color: "#9d9d9c" },
      { id: "warm", name: "Chaud", color: "#e30613" },
      { id: "light", name: "Clair", color: "#c6dc96" },
    ],
    []
  );

  // Function to get FontAwesome icon component dynamically
  const getIconComponent = useCallback((iconName) => {
    const formattedIconName = `Fa${iconName
      .replace("fa-", "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("")}`;
    return FaIcons[formattedIconName] || FaIcons.FaFile;
  }, []);

  // Fonction pour obtenir le label d'un menu
  const getMenuLabel = useCallback((menuItem) => {
    if (!menuItem.label || menuItem.label === null) {
      return menuItem.menuKey
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return menuItem.label;
  }, []);

  // Recursive function to find menu item by path
  const findMenuItemByPath = useCallback(
    (items, targetPath) => {
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
              const deepResult = findMenuItemByPath([child], targetPath);
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

  // Function to generate breadcrumb trail
  const generateBreadcrumbs = useCallback(() => {
    const currentPath = location.pathname === "/" ? "/" : location.pathname + location.hash;
    const breadcrumbs = [];

    // Static breadcrumb for home
    breadcrumbs.push({
      title: "Accueil",
      path: "/",
      isActive: currentPath === "/",
    });

    // Handle static routes
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
      // Dynamic menu-based breadcrumbs
      const matchedResult = findMenuItemByPath(menuData, currentPath);
      if (matchedResult) {
        const { item, parentKey, title } = matchedResult;

        // Find parent item if exists
        if (parentKey) {
          const findParent = (items, key) => {
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

        // Add current item
        breadcrumbs.push({
          title,
          path: item.link,
          isActive: true,
        });
      }
    }

    return breadcrumbs;
  }, [location.pathname, location.hash, menuData, findMenuItemByPath, getMenuLabel]);

  // Initialize expanded menus for all menu items with children
  const initializeExpandedMenus = useCallback((menuItems) => {
    const expanded = {};
    const processItems = (items) => {
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

  // Fetch languages from JSON file
  useEffect(() => {
    const fetchLanguages = async () => {
      if (languagesRef.current.length > 0 || isLanguagesLoading) return;
      setIsLanguagesLoading(true);
      try {
        const response = await fetch("/languages.json");
        if (!response.ok) throw new Error("Erreur lors du chargement du fichier JSON");
        const data = await response.json();
        languagesRef.current = data;
        setLanguages(data);
        if (!selectedLanguage && data.length > 0) {
          const defaultLang = data.find((lang) => lang.isActive)?.languageId || data[0].languageId;
          setSelectedLanguage(defaultLang);
          localStorage.setItem("selectedLanguage", defaultLang);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des langues:", error);
      } finally {
        setIsLanguagesLoading(false);
      }
    };
    fetchLanguages();
  }, [selectedLanguage]);

  // Fetch menu data from API with roleNames
  useEffect(() => {
    const fetchMenuData = async () => {
      if (isMenuLoading) return;
      if (menuDataRef.current) {
        setMenuData(menuDataRef.current);
        return;
      }
      setIsMenuLoading(true);
      try {
        const userId = user.userId;
        const queryString = userId ? `?UserId=${encodeURIComponent(userId)}` : "";
        const response = await fetch(`${BASE_URL}/api/Menu/hierarchy${queryString}`);
        if (!response.ok) throw new Error("Erreur réseau");
        const data = await response.json();
        menuDataRef.current = data;
        setMenuData(data);
        if (!isInitializedRef.current) {
          const initialExpanded = initializeExpandedMenus(data);
          setExpandedMenus(initialExpanded);
          isInitializedRef.current = true;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du menu:", error);
      } finally {
        setIsMenuLoading(false);
      }
    };
    fetchMenuData();
  }, [initializeExpandedMenus, user.roles]);

  // Update active item, header title, and expanded menus based on route
  useEffect(() => {
    if (menuData.length === 0) return;
    const currentPath = location.pathname === "/" ? "/" : location.pathname + location.hash;
    if (lastLocationRef.current === currentPath) return;
    if (navigationUpdateRef.current) return;

    lastLocationRef.current = currentPath;
    navigationUpdateRef.current = true;

    const matchedResult = findMenuItemByPath(menuData, currentPath);

    let staticRouteMatch = null;
    // if (currentPath === "/system") {
    //   staticRouteMatch = { key: "system", title: "System" };
    // } else if (currentPath === "/entite") {
    //   staticRouteMatch = { key: "entite", title: "Entite" };
    // } else if (currentPath === "/profil-page") {
    //   staticRouteMatch = { key: "profile", title: "Mon profil" };
    // }

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
    } else if (staticRouteMatch) {
      if (activeItem !== staticRouteMatch.key) {
        setActiveItem(staticRouteMatch.key);
      }
      if (headerTitle !== staticRouteMatch.title) {
        setHeaderTitle(staticRouteMatch.title);
      }
      setExpandedMenus((prev) => {
        const newExpanded = { ...prev };
        Object.keys(newExpanded).forEach((key) => {
          newExpanded[key] = false;
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

  const toggleMobileSidebar = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleOverlayClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMobileSidebar();
    },
    [closeMobileSidebar]
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen]);

  const toggleMenu = useCallback((menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  }, []);

  const setActive = useCallback(
    (itemId, title, parentMenuKey) => () => {
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

  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }, []);

  const handleLanguageChange = useCallback(
    (languageId) => {
      if (languageId !== selectedLanguage) {
        setSelectedLanguage(languageId);
        localStorage.setItem("selectedLanguage", languageId);
      }
    },
    [selectedLanguage]
  );

  // Grouper les éléments du menu par section
  const groupMenuBySection = useCallback((menuItems) => {
    const grouped = {
      navigation: [],
      administration: [],
    };

    menuItems.forEach((item) => {
      const section = item.menu.section || "navigation"; // Par défaut, navigation si non spécifié
      grouped[section].push(item);
    });

    // Trier les éléments par position
    grouped.navigation.sort((a, b) => a.menu.position - b.menu.position);
    grouped.administration.sort((a, b) => a.menu.position - b.menu.position);

    return grouped;
  }, []);

  const renderMenuItem = useCallback(
    (item, level = 0) => {
      const IconComponent = getIconComponent(item.menu.icon);
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedMenus[item.menu.menuKey];
      const isActive = activeItem === item.menu.menuKey;
      const menuLabel = getMenuLabel(item.menu);

      return (
        <li className={`nav-item level-${level}`} key={item.hierarchyId}>
          {hasChildren ? (
            <button
              className={`nav-button ${isExpanded ? "expanded" : ""}`}
              onClick={() => toggleMenu(item.menu.menuKey)}
            >
              <div className="nav-icon-wrapper">
                <IconComponent className="nav-icon" />
              </div>
              <span className="nav-text">{menuLabel}</span>
              {!collapsed && <FaIcons.FaChevronDown className={`nav-arrow ${isExpanded ? "rotated" : ""}`} />}
            </button>
          ) : (
            <Link
              to={item.menu.link}
              className={`nav-button ${isActive ? "active" : ""}`}
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
            </Link>
          )}
          {hasChildren && (
            <ul className={`submenu level-${level + 1} ${isExpanded ? "expanded" : ""}`}>
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </ul>
          )}
        </li>
      );
    },
    [expandedMenus, collapsed, activeItem, getIconComponent, toggleMenu, setActive, getMenuLabel, menuData]
  );

  const findParentKey = useCallback((items, targetKey) => {
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

  // Rendu du menu avec sections
  const renderMenu = useCallback(() => {
    const groupedMenu = groupMenuBySection(menuData);

    return (
      <nav className="sidebar-nav">
        {isMenuLoading ? (
          <div className="menu-loading-dots">Chargement du menu ...</div>
        ) : (
          <ul>
            {/* Section Navigation */}
            {groupedMenu.navigation.length > 0 && (
              <>
                <div className="sidebar-divider">
                  <span>{!collapsed && "NAVIGATION"}</span>
                </div>
                {groupedMenu.navigation.map((item) => renderMenuItem(item, 0))}
              </>
            )}

            {/* Section Administration */}
            {groupedMenu.administration.length > 0 && (
              <>
                <div className="sidebar-divider">
                  <span>{!collapsed && "ADMINISTRATION"}</span>
                </div>
                {groupedMenu.administration.map((item) => renderMenuItem(item, 0))}
              </>
            )}

            {/* Éléments statiques dans la section Administration */}
            {/* <li className="nav-item">
              <Link
                to="/system"
                className={`nav-button ${activeItem === "system" ? "active" : ""}`}
                onClick={setActive("system", "System", null)}
              >
                <div className="nav-icon-wrapper">
                  <FaIcons.FaCogs className="nav-icon" />
                </div>
                <span className="nav-text">System</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/entite"
                className={`nav-button ${activeItem === "entite" ? "active" : ""}`}
                onClick={setActive("entite", "Entite", null)}
              >
                <div className="nav-icon-wrapper">
                  <FaIcons.FaBuilding className="nav-icon" />
                </div>
                <span className="nav-text">Entite</span>
              </Link>
            </li> */}
          </ul>
        )}
      </nav>
    );
  }, [
    menuData,
    isMenuLoading,
    collapsed,
    activeItem,
    renderMenuItem,
    setActive,
    groupMenuBySection,
  ]);

  return (
    <div className={`app theme-${theme}`}>
      {mobileOpen && <div className="sidebar-overlay" onClick={handleOverlayClick} />}

      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/Logo.JPG" alt="Logo" className="logo-image" />
          </div>
        </div>

        {renderMenu()}

        <div className="sidebar-footer">
          {!collapsed ? (
            <>
              <div className="sidebar-footer-info">
                <div className="sidebar-footer-title">Ravinala Airports</div>
                <div className="sidebar-footer-subtitle">Système de recrutement v2.1</div>
              </div>
            </>
          ) : (
            <div className="theme-selector theme-selector-small">
              <div className="theme-dots">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    className={`theme-dot ${theme === t.id ? "active" : ""}`}
                    style={{ backgroundColor: t.color }}
                    onClick={() => handleThemeChange(t.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
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
                    <span className="breadcrumb-separator"><FaIcons.FaChevronRight size={14} /></span>
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
                  <Link to="/profil-page" className="dropdown-item" onClick={setActive("profile", "Mon profil", null)}>
                    <FaIcons.FaUser className="dropdown-icon" />
                    <span>Mon profil</span>
                  </Link>
                  <div className="dropdown-divider" />
                  <Link to="/" className="dropdown-item" onClick={setActive("logout", "Déconnexion", null)}>
                    <FaIcons.FaSignOutAlt className="dropdown-icon" />
                    <span>Déconnexion</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="content">{children}</div>
      </main>
    </div>
  );
}