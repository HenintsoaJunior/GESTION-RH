"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import * as FaIcons from "react-icons/fa"
import ReactCountryFlag from "react-country-flag"
import "styles/template.css"
import { BASE_URL } from "config/apiConfig"

export default function Template({ children }) {
  const location = useLocation()
  const [collapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState({})
  const [activeItem, setActiveItem] = useState("dashboard")
  const [headerTitle, setHeaderTitle] = useState("Dashboard")
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "default")
  const [menuData, setMenuData] = useState([])
  const [languages, setLanguages] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("selectedLanguage") || "fr"
  })
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [isLanguagesLoading, setIsLanguagesLoading] = useState(false)

  // Refs pour éviter les rechargements inutiles
  const menuDataRef = useRef(null)
  const languagesRef = useRef([])
  const isInitializedRef = useRef(false)
  const lastLocationRef = useRef("")
  const navigationUpdateRef = useRef(false)

  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {
    userId: "USER DEFAULT",
    firstName: "John",
    lastName: "Doe",
    role: "Administrateur",
  }

  // Generate initials for avatar
  const getInitials = useCallback((firstName, lastName) => {
    const firstInitial = firstName ? firstName[0] : "J"
    const lastInitial = lastName ? lastName[0] : "D"
    return `${firstInitial}${lastInitial}`.toUpperCase()
  }, [])

  // Theme configuration
  const themes = useMemo(
    () => [
      { id: "default", name: "Défaut (Vert)", color: "#69B42E" },
      { id: "gray", name: "Gris", color: "#9d9d9c" },
      { id: "warm", name: "Chaud", color: "#e30613" },
      { id: "light", name: "Clair", color: "#c6dc96" },
    ],
    [],
  )

  // Function to get FontAwesome icon component dynamically
  const getIconComponent = useCallback((iconName) => {
    const formattedIconName = `Fa${iconName
      .replace("fa-", "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("")}`
    return FaIcons[formattedIconName] || FaIcons.FaFile
  }, [])

  // Fonction pour obtenir le label d'un menu
  const getMenuLabel = useCallback((menuItem) => {
    // Si le label est null ou vide, utiliser le menuKey comme fallback
    if (!menuItem.label || menuItem.label === null) {
      // Convertir le menuKey en format lisible
      return menuItem.menuKey
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    }
    return menuItem.label
  }, [])

  // Recursive function to find menu item by path
  const findMenuItemByPath = useCallback(
    (items, targetPath) => {
      for (const item of items) {
        // Check current item
        if (item.menu.link === targetPath) {
          return {
            item: item.menu,
            parentKey: null,
            title: getMenuLabel(item.menu),
          }
        }
        // Recursively check children
        if (item.children && item.children.length > 0) {
          for (const child of item.children) {
            if (child.menu.link === targetPath) {
              return {
                item: child.menu,
                parentKey: item.menu.menuKey,
                title: getMenuLabel(child.menu),
              }
            }
            // Check deeper nested children if they exist
            if (child.children && child.children.length > 0) {
              const deepResult = findMenuItemByPath([child], targetPath)
              if (deepResult) {
                return {
                  ...deepResult,
                  parentKey: item.menu.menuKey, // Keep the top-level parent
                }
              }
            }
          }
        }
      }
      return null
    },
    [getMenuLabel],
  )

  // Initialize expanded menus for all menu items with children
  const initializeExpandedMenus = useCallback((menuItems) => {
    const expanded = {}

    const processItems = (items) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          expanded[item.menu.menuKey] = false
          // Recursively process children
          processItems(item.children)
        }
      })
    }

    processItems(menuItems)
    return expanded
  }, [])

  // Fetch languages from JSON file
  useEffect(() => {
    const fetchLanguages = async () => {
      if (languagesRef.current.length > 0 || isLanguagesLoading) return
      setIsLanguagesLoading(true)
      try {
        const response = await fetch("/languages.json")
        if (!response.ok) throw new Error("Erreur lors du chargement du fichier JSON")
        const data = await response.json()
        languagesRef.current = data
        setLanguages(data)
        if (!selectedLanguage && data.length > 0) {
          const defaultLang = data.find((lang) => lang.isActive)?.languageId || data[0].languageId
          setSelectedLanguage(defaultLang)
          localStorage.setItem("selectedLanguage", defaultLang)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des langues:", error)
      } finally {
        setIsLanguagesLoading(false)
      }
    }

    fetchLanguages()
  }, [selectedLanguage])

  // Fetch menu data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      if (isMenuLoading) return
      if (menuDataRef.current) {
        setMenuData(menuDataRef.current)
        return
      }

      setIsMenuLoading(true)
      try {
        const response = await fetch(`${BASE_URL}/api/Menu/hierarchy`)
        if (!response.ok) throw new Error("Erreur réseau")
        const data = await response.json()
        menuDataRef.current = data
        setMenuData(data)
        if (!isInitializedRef.current) {
          const initialExpanded = initializeExpandedMenus(data)
          setExpandedMenus(initialExpanded)
          isInitializedRef.current = true
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du menu:", error)
      } finally {
        setIsMenuLoading(false)
      }
    }

    fetchMenuData()
  }, [initializeExpandedMenus])

  // Update active item, header title, and expanded menus based on route
  useEffect(() => {
    if (menuData.length === 0) return
    const currentPath = location.pathname === "/" ? "/" : location.pathname + location.hash
    if (lastLocationRef.current === currentPath) return
    if (navigationUpdateRef.current) return

    lastLocationRef.current = currentPath
    navigationUpdateRef.current = true

    const matchedResult = findMenuItemByPath(menuData, currentPath)

    // Check for static routes (System and Entite)
    let staticRouteMatch = null
    if (currentPath === "/system") {
      staticRouteMatch = { key: "system", title: "System" }
    } else if (currentPath === "/entite") {
      staticRouteMatch = { key: "entite", title: "Entite" }
    }

    if (matchedResult) {
      const { item, parentKey, title } = matchedResult
      // Batch updates
      if (activeItem !== item.menuKey) {
        setActiveItem(item.menuKey)
      }
      if (headerTitle !== title) {
        setHeaderTitle(title)
      }

      // Update expanded menus - close all except the parent chain
      setExpandedMenus((prev) => {
        const newExpanded = { ...prev }
        Object.keys(newExpanded).forEach((key) => {
          newExpanded[key] = key === parentKey
        })
        return newExpanded
      })
    } else if (staticRouteMatch) {
      // Handle static routes
      if (activeItem !== staticRouteMatch.key) {
        setActiveItem(staticRouteMatch.key)
      }
      if (headerTitle !== staticRouteMatch.title) {
        setHeaderTitle(staticRouteMatch.title)
      }

      // Close all expanded menus for static routes
      setExpandedMenus((prev) => {
        const newExpanded = { ...prev }
        Object.keys(newExpanded).forEach((key) => {
          newExpanded[key] = false
        })
        return newExpanded
      })
    } else {
      // Default case: close all menus and set dashboard
      if (activeItem !== "dashboard") {
        setActiveItem("dashboard")
      }
      if (headerTitle !== "Dashboard") {
        setHeaderTitle("Dashboard")
      }
      setExpandedMenus((prev) => {
        const newExpanded = { ...prev }
        Object.keys(newExpanded).forEach((key) => {
          newExpanded[key] = false
        })
        return newExpanded
      })
    }

    setTimeout(() => {
      navigationUpdateRef.current = false
    }, 50)
  }, [location.pathname, location.hash, menuData, findMenuItemByPath, activeItem, headerTitle])

  // Fonction améliorée pour toggle le menu mobile
  const toggleMobileSidebar = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setMobileOpen((prev) => !prev)
  }, [])

  // Fonction pour fermer le menu mobile
  const closeMobileSidebar = useCallback(() => {
    setMobileOpen(false)
  }, [])

  // Fermer le menu mobile quand on clique sur l'overlay
  const handleOverlayClick = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      closeMobileSidebar()
    },
    [closeMobileSidebar],
  )

  // Fermer le menu mobile sur redimensionnement de l'écran
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileOpen) {
        setMobileOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [mobileOpen])

  const toggleMenu = useCallback((menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }))
  }, [])

  const setActive = useCallback(
    (itemId, title, parentMenuKey) => () => {
      navigationUpdateRef.current = true
      setActiveItem(itemId)
      setHeaderTitle(title)
      // Fermer le menu mobile quand on clique sur un lien
      setMobileOpen(false)
      // Close all menus except the parent of the clicked link
      setExpandedMenus((prev) => {
        const newExpanded = { ...prev }
        Object.keys(newExpanded).forEach((key) => {
          newExpanded[key] = key === parentMenuKey
        })
        return newExpanded
      })
      setTimeout(() => {
        navigationUpdateRef.current = false
      }, 100)
    },
    [],
  )

  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }, [])

  const handleLanguageChange = useCallback(
    (languageId) => {
      if (languageId !== selectedLanguage) {
        setSelectedLanguage(languageId)
        localStorage.setItem("selectedLanguage", languageId)
      }
    },
    [selectedLanguage],
  )

  // Recursive function to render menu items with support for deeper nesting
  const renderMenuItem = useCallback(
    (item, level = 0) => {
      const IconComponent = getIconComponent(item.menu.icon)
      const hasChildren = item.children && item.children.length > 0
      const isExpanded = expandedMenus[item.menu.menuKey]
      const isActive = activeItem === item.menu.menuKey
      const menuLabel = getMenuLabel(item.menu)

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
                level === 0 ? null : findParentKey(menuData, item.menu.menuKey),
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
      )
    },
    [expandedMenus, collapsed, activeItem, getIconComponent, toggleMenu, setActive, getMenuLabel, menuData],
  )

  // Helper function to find parent key
  const findParentKey = useCallback((items, targetKey) => {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          if (child.menu.menuKey === targetKey) {
            return item.menu.menuKey
          }
          // Check deeper levels
          if (child.children && child.children.length > 0) {
            const deepParent = findParentKey([child], targetKey)
            if (deepParent) return item.menu.menuKey // Return top-level parent
          }
        }
      }
    }
    return null
  }, [])

  return (
    <div className={`app theme-${theme}`}>
      {mobileOpen && <div className="sidebar-overlay" onClick={handleOverlayClick} />}

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
              {menuData.map((item) => renderMenuItem(item, 0))}
              <div className="sidebar-divider">
                <span>{!collapsed && "ADMINISTRATION"}</span>
              </div>
              <li className="nav-item">
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
                    <span className="user-name">{`${user.userId}`}</span>
                    <span className="user-role">{user.role}</span>
                  </div>
                  <FaIcons.FaChevronDown className="dropdown-arrow" />
                </div>
                <div className="user-dropdown-menu">
                  <Link to="#profile" className="dropdown-item" onClick={setActive("profile", "Mon profil", null)}>
                    <FaIcons.FaUser className="dropdown-icon" />
                    <span>Mon profil</span>
                  </Link>
                  <Link to="#settings" className="dropdown-item" onClick={setActive("settings", "Paramètres", null)}>
                    <FaIcons.FaCog className="dropdown-icon" />
                    <span>Paramètres</span>
                  </Link>
                  <Link to="#help" className="dropdown-item" onClick={setActive("help", "Aide", null)}>
                    <FaIcons.FaQuestionCircle className="dropdown-icon" />
                    <span>Aide</span>
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
  )
}