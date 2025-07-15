/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import ReactCountryFlag from "react-country-flag";
import "./Template.css";
import { BASE_URL } from "../config/apiConfig";

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

  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {
    firstName: "John",
    lastName: "Doe",
    role: "Administrateur",
  };

  // Generate initials for avatar
  const getInitials = useCallback((firstName, lastName) => {
    const firstInitial = firstName ? firstName[0] : "J";
    const lastInitial = lastName ? lastName[0] : "D";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }, []);

  // Theme configuration
  const themes = useMemo(() => [
    { id: "default", name: "Défaut (Vert)", color: "#69B42E" },
    { id: "gray", name: "Gris", color: "#9d9d9c" },
    { id: "warm", name: "Chaud", color: "#e30613" },
    { id: "light", name: "Clair", color: "#c6dc96" },
  ], []);

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
    // Si le label est null ou vide, utiliser le menuKey comme fallback
    if (!menuItem.label || menuItem.label === null) {
      // Convertir le menuKey en format lisible
      return menuItem.menuKey
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return menuItem.label;
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
  }, []);

  // Fetch menu data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      if (isMenuLoading) return;

      if (menuDataRef.current) {
        setMenuData(menuDataRef.current);
        return;
      }

      setIsMenuLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/Menu/hierarchy`);
        if (!response.ok) throw new Error("Erreur réseau");

        const data = await response.json();
        menuDataRef.current = data;
        setMenuData(data);

        if (!isInitializedRef.current) {
          const initialExpanded = {};
          data.forEach((item) => {
            if (item.children.length > 0) {
              initialExpanded[item.menu.menuKey] = false;
            }
          });
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
  }, []);

  // Update active item, header title, and expanded menus based on route
  useEffect(() => {
    if (menuData.length === 0) return;

    const currentPath = location.pathname === "/" ? "/" : location.pathname + location.hash;

    if (lastLocationRef.current === currentPath) return;

    if (navigationUpdateRef.current) return;

    lastLocationRef.current = currentPath;
    navigationUpdateRef.current = true;

    let matchedItem = null;
    let matchedParentMenu = null;
    let matchedTitle = "";

    const findMenuItem = (items) => {
      for (const item of items) {
        if (item.menu.link === currentPath) {
          matchedItem = item.menu.menuKey;
          matchedTitle = getMenuLabel(item.menu);
          return true;
        }
        if (item.children.length > 0) {
          for (const child of item.children) {
            if (child.menu.link === currentPath) {
              matchedItem = child.menu.menuKey;
              matchedParentMenu = item.menu.menuKey;
              matchedTitle = getMenuLabel(child.menu);
              return true;
            }
          }
        }
      }
      return false;
    };

    if (findMenuItem(menuData)) {
      // Batch updates
      const updates = {};
      let needsUpdate = false;

      if (activeItem !== matchedItem) {
        updates.activeItem = matchedItem;
        needsUpdate = true;
      }
      if (headerTitle !== matchedTitle) {
        updates.headerTitle = matchedTitle;
        needsUpdate = true;
      }

      if (needsUpdate) {
        if (updates.activeItem) setActiveItem(updates.activeItem);
        if (updates.headerTitle) setHeaderTitle(updates.headerTitle);
      }

      // Close all menus except the matched parent
      setExpandedMenus((prev) => {
        const newExpanded = { ...prev };
        Object.keys(newExpanded).forEach((key) => {
          newExpanded[key] = key === matchedParentMenu;
        });
        return newExpanded;
      });
    } else {
      // Default case: close all menus and set dashboard
      if (activeItem !== "dashboard") {
        setActiveItem("dashboard");
      }
      if (headerTitle !== "Dashboard") {
        setHeaderTitle("Dashboard");
      }
      setExpandedMenus((prev) => {
        const newExpanded = { ...prev };
        Object.keys(newExpanded).forEach( key => {
          newExpanded[key] = false;
        });
        return newExpanded;
      });
    }

    setTimeout(() => {
      navigationUpdateRef.current = false;
    }, 50);
  }, [location.pathname, location.hash, menuData, getMenuLabel]);

  const toggleMobileSidebar = useCallback(() => {
    setMobileOpen(!mobileOpen);
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

      // Close all menus except the parent of the clicked link
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

  const renderMenuItem = useCallback(
    (item) => {
      const IconComponent = getIconComponent(item.menu.icon);
      const hasChildren = item.children.length > 0;
      const isExpanded = expandedMenus[item.menu.menuKey];
      const isActive = activeItem === item.menu.menuKey;
      const menuLabel = getMenuLabel(item.menu);

      return (
        <li className="nav-item" key={item.hierarchyId}>
          {hasChildren ? (
            <button
              className={`nav-button ${isExpanded ? "expanded" : ""}`}
              onClick={() => toggleMenu(item.menu.menuKey)}
            >
              <div className="nav-icon-wrapper">
                <IconComponent className="nav-icon" />
              </div>
              <span className="nav-text">{menuLabel}</span>
              {!collapsed && (
                <FaIcons.FaChevronDown
                  className={`nav-arrow ${isExpanded ? "rotated" : ""}`}
                />
              )}
            </button>
          ) : (
            <Link
              to={item.menu.link}
              className={`nav-button ${isActive ? "active" : ""}`}
              onClick={setActive(item.menu.menuKey, menuLabel, null)}
            >
              <div className="nav-icon-wrapper">
                <IconComponent className="nav-icon" />
              </div>
              <span className="nav-text">{menuLabel}</span>
            </Link>
          )}
          {hasChildren && (
            <ul className={`submenu ${isExpanded ? "expanded" : ""}`}>
              {item.children.map((child) => {
                const ChildIcon = getIconComponent(child.menu.icon);
                const isChildActive = activeItem === child.menu.menuKey;
                const childLabel = getMenuLabel(child.menu);

                return (
                  <li key={child.hierarchyId}>
                    <Link
                      to={child.menu.link}
                      className={isChildActive ? "active" : ""}
                      onClick={setActive(child.menu.menuKey, childLabel, item.menu.menuKey)}
                    >
                      <ChildIcon className="submenu-icon" />
                      <span>{childLabel}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    },
    [expandedMenus, collapsed, activeItem, getIconComponent, toggleMenu, setActive, getMenuLabel]
  );

  return (
    <div className={`app theme-${theme}`}>
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)}></div>}

      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/Logo.png" alt="Logo" className="logo-image" />
          </div>
        </div>

        <div className="sidebar-divider">
          <span>{!collapsed && "NAVIGATION"}</span>
        </div>

        <nav className="sidebar-nav">
          {isMenuLoading ? (
            <div className="menu-loading-dots">Chargement du menu ...</div>
          ) : (
            <ul>
              {menuData.map((item) => renderMenuItem(item))}

              <div className="sidebar-divider">
                <span>{!collapsed && "ADMINISTRATION"}</span>
              </div>

              <li className="nav-item premium-feature">
                <button className="nav-button">
                  <div className="nav-icon-wrapper premium">
                    <FaIcons.FaAward className="nav-icon" />
                  </div>
                  <span className="nav-text">Fonctionnalités Premium</span>
                  {!collapsed && <span className="nav-badge premium">PRO</span>}
                </button>
              </li>
            </ul>
          )}
        </nav>

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
                  ></button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="menu-toggle" onClick={toggleMobileSidebar}>
              <FaIcons.FaBars />
            </button>
            <h1>{headerTitle}</h1>
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
                  <div className="user-avatar">{getInitials(user.firstName, user.lastName)}</div>
                  <div className="user-info">
                    <span className="user-name">{`${user.firstName} ${user.lastName}`}</span>
                    <span className="user-role">{user.role}</span>
                  </div>
                  <FaIcons.FaChevronDown className="dropdown-arrow" />
                </div>
                <div className="user-dropdown-menu">
                  <Link
                    to="#profile"
                    className="dropdown-item"
                    onClick={setActive("profile", "Mon profil", null)}
                  >
                    <FaIcons.FaUser className="dropdown-icon" />
                    <span>Mon profil</span>
                  </Link>
                  <Link
                    to="#settings"
                    className="dropdown-item"
                    onClick={setActive("settings", "Paramètres", null)}
                  >
                    <FaIcons.FaCog className="dropdown-icon" />
                    <span>Paramètres</span>
                  </Link>
                  <Link
                    to="#help"
                    className="dropdown-item"
                    onClick={setActive("help", "Aide", null)}
                  >
                    <FaIcons.FaQuestionCircle className="dropdown-icon" />
                    <span>Aide</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <Link
                    to="/"
                    className="dropdown-item"
                    onClick={setActive("logout", "Déconnexion", null)}
                  >
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