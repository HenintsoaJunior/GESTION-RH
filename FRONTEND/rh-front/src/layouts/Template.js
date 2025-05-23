/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiUsers,
  FiFileText,
  FiSettings,
  FiMenu,
  FiChevronDown,
  FiBell,
  FiUser,
  FiSearch,
  FiHelpCircle,
  FiCalendar,
  FiBarChart2,
  FiLayers,
  FiCheckSquare,
  FiTrendingUp,
  FiGrid,
  FiStar,
  FiShield,
  FiUserPlus,
  FiClipboard,
  FiBookmark,
  FiLogOut,
  FiActivity,
  FiAward,
  FiCpu,
  FiHome,
  FiInfo,
  FiMessageSquare,
} from "react-icons/fi";
import { MdPalette } from "react-icons/md";
import "./Template.css";

export default function Template({ children }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    dashboard: false,
    candidature: false,
    fiche: false,
    gestion: false,
  });
  const [activeItem, setActiveItem] = useState("dashboard-overview");
  const [headerTitle, setHeaderTitle] = useState("Dashboard");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "default");

  // Theme configuration with colors and names
  const themes = [
    { id: "default", name: "Défaut (Vert)", color: "#7ab55c" },
    { id: "gray", name: "Gris", color: "#9d9d9c" },
    { id: "warm", name: "Chaud", color: "#e30613" },
    { id: "light", name: "Clair", color: "#c6dc96" },
  ];

  // Menu configuration for mapping routes to active items, titles, and menus
  const menuConfig = {
    "/dashboard": { itemId: "dashboard-overview", title: "Dashboard", menu: "dashboard" },
    "/all-candidates": { itemId: "candidates-all", title: "Candidature", menu: "candidature" },
    "/new-candidates": { itemId: "candidates-new", title: "Nouvelles candidatures", menu: "candidature" },
    "#analytics": { itemId: "dashboard-analytics", title: "Analytiques", menu: "dashboard" },
    "#reports": { itemId: "dashboard-reports", title: "Rapports", menu: "dashboard" },
    "#performance": { itemId: "dashboard-performance", title: "Performance", menu: "dashboard" },
    "#interviews": { itemId: "candidates-interviews", title: "Entretiens", menu: "candidature" },
    "#shortlisted": { itemId: "candidates-shortlisted", title: "Présélectionnés", menu: "candidature" },
    "#create-job": { itemId: "jobs-create", title: "Créer une fiche", menu: "fiche" },
    "#active-jobs": { itemId: "jobs-active", title: "Postes actifs", menu: "fiche" },
    "#archived-jobs": { itemId: "jobs-archived", title: "Archives", menu: "fiche" },
    "#job-templates": { itemId: "jobs-templates", title: "Modèles", menu: "fiche" },
    "#users": { itemId: "admin-users", title: "Utilisateurs", menu: "gestion" },
    "#departments": { itemId: "admin-departments", title: "Départements", menu: "gestion" },
    "#roles": { itemId: "admin-roles", title: "Rôles & Permissions", menu: "gestion" },
    "#system": { itemId: "admin-system", title: "Paramètres système", menu: "gestion" },
    "#profile": { itemId: "profile", title: "Mon profil", menu: null },
    "#settings": { itemId: "settings", title: "Paramètres", menu: null },
    "#help": { itemId: "help", title: "Aide", menu: null },
    "/": { itemId: "logout", title: "Déconnexion", menu: null },
  };

  // Set initial state based on current route, preserving other menu states
  useEffect(() => {
    const path = location.pathname === "/" ? "/" : location.pathname + location.hash;
    const config = menuConfig[path] || menuConfig["/dashboard"];
    setActiveItem(config.itemId);
    setHeaderTitle(config.title);
    if (config.menu) {
      setExpandedMenus((prev) => ({
        ...prev,
        [config.menu]: true,
      }));
    }
  }, [location.pathname, location.hash]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const setActive = (itemId, title, menu) => () => {
    setActiveItem(itemId);
    setHeaderTitle(title);
    setMobileOpen(false);
    if (menu) {
      setExpandedMenus((prev) => ({
        ...prev,
        [menu]: true,
      }));
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className={`app theme-${theme}`}>
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)}></div>}

      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="Logo.png" alt="Logo" className="logo-image" />
          </div>
        </div>

        <div className="sidebar-divider">
          <span>{!collapsed && "NAVIGATION"}</span>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className="nav-item">
              <button
                className={`nav-button ${expandedMenus.dashboard ? "expanded" : ""}`}
                onClick={() => toggleMenu("dashboard")}
              >
                <div className="nav-icon-wrapper">
                  <FiHome className="nav-icon" />
                </div>
                <span className="nav-text">Dashboard</span>
                {!collapsed && (
                  <>
                    <span className="nav-badge new">Nouveau</span>
                    <FiChevronDown className={`nav-arrow ${expandedMenus.dashboard ? "rotated" : ""}`} />
                  </>
                )}
              </button>
              <ul className={`submenu ${expandedMenus.dashboard ? "expanded" : ""}`}>
                <li>
                  <Link
                    to="/dashboard"
                    className={activeItem === "dashboard-overview" ? "active" : ""}
                    onClick={setActive("dashboard-overview", "Dashboard", "dashboard")}
                  >
                    <FiBarChart2 className="submenu-icon" />
                    <span>Vue d'ensemble</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#analytics"
                    className={activeItem === "dashboard-analytics" ? "active" : ""}
                    onClick={setActive("dashboard-analytics", "Analytiques", "dashboard")}
                  >
                    <FiTrendingUp className="submenu-icon" />
                    <span>Analytiques</span>
                    <span className="submenu-badge">5</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#reports"
                    className={activeItem === "dashboard-reports" ? "active" : ""}
                    onClick={setActive("dashboard-reports", "Rapports", "dashboard")}
                  >
                    <FiFileText className="submenu-icon" />
                    <span>Rapports</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#performance"
                    className={activeItem === "dashboard-performance" ? "active" : ""}
                    onClick={setActive("dashboard-performance", "Performance", "dashboard")}
                  >
                    <FiActivity className="submenu-icon" />
                    <span>Performance</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <button
                className={`nav-button ${expandedMenus.candidature ? "expanded" : ""}`}
                onClick={() => toggleMenu("candidature")}
              >
                <div className="nav-icon-wrapper">
                  <FiUsers className="nav-icon" />
                </div>
                <span className="nav-text">Candidature</span>
                {!collapsed && (
                  <>
                    <span className="nav-badge count">12</span>
                    <FiChevronDown className={`nav-arrow ${expandedMenus.candidature ? "rotated" : ""}`} />
                  </>
                )}
              </button>
              <ul className={`submenu ${expandedMenus.candidature ? "expanded" : ""}`}>
                <li>
                  <Link
                    to="/all-candidates"
                    className={activeItem === "candidates-all" ? "active" : ""}
                    onClick={setActive("candidates-all", "Candidature", "candidature")}
                  >
                    <FiUsers className="submenu-icon" />
                    <span>Tous les candidats</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/new-candidates"
                    className={activeItem === "candidates-new" ? "active" : ""}
                    onClick={setActive("candidates-new", "Nouvelles candidatures", "candidature")}
                  >
                    <FiUserPlus className="submenu-icon" />
                    <span>Nouvelles candidatures</span>
                    <span className="submenu-badge hot">8</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#interviews"
                    className={activeItem === "candidates-interviews" ? "active" : ""}
                    onClick={setActive("candidates-interviews", "Entretiens", "candidature")}
                  >
                    <FiCalendar className="submenu-icon" />
                    <span>Entretiens</span>
                    <span className="submenu-badge">4</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#shortlisted"
                    className={activeItem === "candidates-shortlisted" ? "active" : ""}
                    onClick={setActive("candidates-shortlisted", "Présélectionnés", "candidature")}
                  >
                    <FiStar className="submenu-icon" />
                    <span>Présélectionnés</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <button
                className={`nav-button ${expandedMenus.fiche ? "expanded" : ""}`}
                onClick={() => toggleMenu("fiche")}
              >
                <div className="nav-icon-wrapper">
                  <FiClipboard className="nav-icon" />
                </div>
                <span className="nav-text">Fiche de poste</span>
                {!collapsed && <FiChevronDown className={`nav-arrow ${expandedMenus.fiche ? "rotated" : ""}`} />}
              </button>
              <ul className={`submenu ${expandedMenus.fiche ? "expanded" : ""}`}>
                <li>
                  <Link
                    to="#create-job"
                    className={activeItem === "jobs-create" ? "active" : ""}
                    onClick={setActive("jobs-create", "Créer une fiche", "fiche")}
                  >
                    <FiFileText className="submenu-icon" />
                    <span>Créer une fiche</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#active-jobs"
                    className={activeItem === "jobs-active" ? "active" : ""}
                    onClick={setActive("jobs-active", "Postes actifs", "fiche")}
                  >
                    <FiCheckSquare className="submenu-icon" />
                    <span>Postes actifs</span>
                    <span className="submenu-badge">7</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#archived-jobs"
                    className={activeItem === "jobs-archived" ? "active" : ""}
                    onClick={setActive("jobs-archived", "Archives", "fiche")}
                  >
                    <FiBookmark className="submenu-icon" />
                    <span>Archives</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#job-templates"
                    className={activeItem === "jobs-templates" ? "active" : ""}
                    onClick={setActive("jobs-templates", "Modèles", "fiche")}
                  >
                    <FiGrid className="submenu-icon" />
                    <span>Modèles</span>
                  </Link>
                </li>
              </ul>
            </li>

            <div className="sidebar-divider">
              <span>{!collapsed && "ADMINISTRATION"}</span>
            </div>

            <li className="nav-item">
              <button
                className={`nav-button ${expandedMenus.gestion ? "expanded" : ""}`}
                onClick={() => toggleMenu("gestion")}
              >
                <div className="nav-icon-wrapper">
                  <FiSettings className="nav-icon" />
                </div>
                <span className="nav-text">Gestion administrative</span>
                {!collapsed && <FiChevronDown className={`nav-arrow ${expandedMenus.gestion ? "rotated" : ""}`} />}
              </button>
              <ul className={`submenu ${expandedMenus.gestion ? "expanded" : ""}`}>
                <li>
                  <Link
                    to="#users"
                    className={activeItem === "admin-users" ? "active" : ""}
                    onClick={setActive("admin-users", "Utilisateurs", "gestion")}
                  >
                    <FiUser className="submenu-icon" />
                    <span>Utilisateurs</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#departments"
                    className={activeItem === "admin-departments" ? "active" : ""}
                    onClick={setActive("admin-departments", "Départements", "gestion")}
                  >
                    <FiLayers className="submenu-icon" />
                    <span>Départements</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#roles"
                    className={activeItem === "admin-roles" ? "active" : ""}
                    onClick={setActive("admin-roles", "Rôles & Permissions", "gestion")}
                  >
                    <FiShield className="submenu-icon" />
                    <span>Rôles & Permissions</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#system"
                    className={activeItem === "admin-system" ? "active" : ""}
                    onClick={setActive("admin-system", "Paramètres système", "gestion")}
                  >
                    <FiCpu className="submenu-icon" />
                    <span>Paramètres système</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item premium-feature">
              <button className="nav-button">
                <div className="nav-icon-wrapper premium">
                  <FiAward className="nav-icon" />
                </div>
                <span className="nav-text">Fonctionnalités Premium</span>
                {!collapsed && <span className="nav-badge premium">PRO</span>}
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          {!collapsed ? (
            <>
              <div className="sidebar-footer-info">
                <div className="sidebar-footer-title">Ravinala Airports</div>
                <div className="sidebar-footer-subtitle">Système de recrutement v2.1</div>
              </div>
              <div className="theme-selector">
                <MdPalette className="theme-icon" />
                <div className="theme-dots">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      className={`theme-dot ${theme === t.id ? "active" : ""}`}
                      style={{ backgroundColor: t.color }}
                      onClick={() => handleThemeChange(t.id)}
                      title={t.name}
                    ></button>
                  ))}
                </div>
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
              <FiMenu />
            </button>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <FiChevronDown className={collapsed ? "rotate" : ""} />
            </button>
            <h1>{headerTitle}</h1>
          </div>

          <div className="header-center">
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Rechercher..." className="search-input" />
            </div>
          </div>

          <div className="header-right">
            <div className="header-icons">
              <button className="header-icon-button">
                <FiMessageSquare />
                <span className="notification-badge">3</span>
              </button>
              <button className="header-icon-button">
                <FiBell />
                <span className="notification-badge">5</span>
              </button>
              <button className="header-icon-button">
                <FiInfo />
              </button>
              <div className="user-profile-dropdown">
                <div className="user-profile">
                  <div className="user-avatar">JD</div>
                  <div className="user-info">
                    <span className="user-name">John Doe</span>
                    <span className="user-role">Administrateur</span>
                  </div>
                  <FiChevronDown className="dropdown-arrow" />
                </div>
                <div className="user-dropdown-menu">
                  <Link to="#profile" className="dropdown-item" onClick={setActive("profile", "Mon profil")}>
                    <FiUser className="dropdown-icon" />
                    <span>Mon profil</span>
                  </Link>
                  <Link to="#settings" className="dropdown-item" onClick={setActive("settings", "Paramètres")}>
                    <FiSettings className="dropdown-icon" />
                    <span>Paramètres</span>
                  </Link>
                  <Link to="#help" className="dropdown-item" onClick={setActive("help", "Aide")}>
                    <FiHelpCircle className="dropdown-icon" />
                    <span>Aide</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <Link to="/" className="dropdown-item" onClick={setActive("logout", "Déconnexion")}>
                    <FiLogOut className="dropdown-icon" />
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