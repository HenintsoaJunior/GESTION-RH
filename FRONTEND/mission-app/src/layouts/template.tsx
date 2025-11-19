// template.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import type { IconType } from "react-icons";
import { useMenuHierarchy } from "@/api/menu/services";
import { useHasHabilitation } from "@/api/users/services";
import { useHasValidationLine } from "@/api/mission/validation/services";
import Header from "./header";
import Footer from "./footer";
import {
  App,
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
import { getInitials } from "@/utils/initials";
import { ToastContainer } from "@/components/notification-toast";

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
  clickable?: boolean;
}

interface User {
  userId: string;
  name: string;
  email: string;
  roles: { roleName: string }[];
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
  
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [activeItem, setActiveItem] = useState<string>("tableau_de_bord");
  const [headerTitle, setHeaderTitle] = useState<string>("Tableau de bord");
  const [theme,] = useState<string>(localStorage.getItem("theme") || "default");
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

  // Habilitations pour les menus (seulement si userId existe)
  const hasVoirUtilisateurs = useHasHabilitation(user.userId, "Voir les utilisateurs");
  const hasVoirDroitAcces = useHasHabilitation(user.userId, "Voir les droits et accès");
  const hasVoirAcces = useHasHabilitation(user.userId, "Voir les accès");
  const hasVoirReferentiel = useHasHabilitation(user.userId, "Voir le référentiel");
  const hasVoirImport = useHasHabilitation(user.userId, "Voir l’import");
  const hasVoirLogs = useHasHabilitation(user.userId, "Voir les logs");
  const hasVoirMission = useHasHabilitation(user.userId, "Voir les missions");
  const hasVoirValidation = useHasHabilitation(user.userId, "Voir la validation des missions");
  const hasVoirMissions = useHasHabilitation(user.userId, "Voir la liste des missions");
  const hasVoirMissionsArchivees = useHasHabilitation(user.userId, "Voir les missions archivées");
  const hasVoirTresorier = useHasHabilitation(user.userId, "Voir la trésorerie");
  const hasVoirHabilitation = useHasHabilitation(user.userId, "Voir les habilitations");
  const hasVoirTableauBord = useHasHabilitation(user.userId, "Voir le tableau de bord");

  const { data: hasValidationLine = true } = useHasValidationLine(user.userId);

  const habilitationsMap = useMemo(() => ({
    utilisateurs: hasVoirUtilisateurs,
    "Droit & Accès": hasVoirDroitAcces,
    accès: hasVoirAcces,
    référentiel: hasVoirReferentiel,
    import: hasVoirImport,
    logs: hasVoirLogs,
    mission: hasVoirMission,
    validation: hasVoirValidation && hasValidationLine,
    Missions: hasVoirMissions,
    "Missions archivées": hasVoirMissionsArchivees,
    trésorerie: hasVoirTresorier,
    Habilitation: hasVoirHabilitation,
    tableau_de_bord: hasVoirTableauBord,
  }), [
    hasVoirUtilisateurs,
    hasVoirDroitAcces,
    hasVoirAcces,
    hasVoirReferentiel,
    hasVoirImport,
    hasVoirLogs,
    hasVoirMission,
    hasVoirValidation,
    hasVoirMissions,
    hasVoirMissionsArchivees,
    hasVoirTresorier,
    hasVoirHabilitation,
    hasVoirTableauBord,
    hasValidationLine,
  ]);

  const getHasAccess = useCallback((menuKey: string): boolean => {
    return habilitationsMap[menuKey as keyof typeof habilitationsMap] ?? true;
  }, [habilitationsMap]);

  // Fonction récursive pour filtrer les menus basés sur les habilitations
  const filterMenuItems = useCallback((items: MenuItem[]): MenuItem[] => {
    return items.reduce<MenuItem[]>((acc, item) => {
      const hasAccess = getHasAccess(item.menu.menuKey);
      let filteredChildren: MenuItem[] = [];
      if (item.children && item.children.length > 0) {
        filteredChildren = filterMenuItems(item.children);
      }
      const hasVisibleChildren = filteredChildren.length > 0;
      if (hasAccess || hasVisibleChildren) {
        acc.push({
          ...item,
          children: filteredChildren,
        });
      }
      return acc;
    }, []);
  }, [getHasAccess]);

  // Seulement récupérer les menus si authentifié
  const { data: menuData = [], isLoading: isMenuLoading } = useMenuHierarchy(
    isAuthenticated && user.userId ? user.userId : ""
  );

  const filteredMenuData = useMemo(() => filterMenuItems(menuData), [menuData, filterMenuItems]);

  // Get icon component
  const getIconComponent = useCallback((iconName: string): IconType => {
    const formattedIconName = `Fa${iconName
      .replace("fa-", "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("")}`;
    return (FaIcons as Record<string, IconType>)[formattedIconName] || FaIcons.FaFile;
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

  // Find menu item by path (modifié pour inclure le matching par préfixe)
  const findMenuItemByPath = useCallback(
    (items: MenuItem[], targetPath: string): MenuPathResult | null => {
      // Logique existante pour match exact
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

      // NOUVEAU : Matching par préfixe pour routes enfants (ex. /mission/collaborateur/:id)
      // On cherche le menu dont le lien est un préfixe du chemin actuel
      for (const item of items) {
        if (targetPath.startsWith(item.menu.link)) {
          return {
            item: item.menu,
            parentKey: null, // C'est le parent direct
            title: getMenuLabel(item.menu),
          };
        }
        if (item.children && item.children.length > 0) {
          for (const child of item.children) {
            if (targetPath.startsWith(child.menu.link)) {
              return {
                item: child.menu,
                parentKey: item.menu.menuKey,
                title: getMenuLabel(child.menu),
              };
            }
            if (child.children && child.children.length > 0) {
              const deepResult: MenuPathResult | null = (() => {
                for (const deepChild of child.children) {
                  if (targetPath.startsWith(deepChild.menu.link)) {
                    return {
                      item: deepChild.menu,
                      parentKey: child.menu.menuKey,
                      title: getMenuLabel(deepChild.menu),
                    };
                  }
                }
                return null;
              })();
              if (deepResult) {
                return {
                  ...deepResult,
                  parentKey: `${item.menu.menuKey}|${child.menu.menuKey}`, // Chaîne pour multi-niveaux si besoin
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
      path: "/tableau-bord",
      isActive: currentPath === "/tableau-bord",
      clickable: true,
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
      const matchedResult = findMenuItemByPath(filteredMenuData, currentPath);
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

          const parentMenu = findParent(filteredMenuData, parentKey);
          if (parentMenu) {
            breadcrumbs.push({
              title: getMenuLabel(parentMenu),
              path: parentMenu.link,
              isActive: false,
              clickable: false,
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
  }, [location.pathname, location.hash, filteredMenuData, findMenuItemByPath, getMenuLabel]);

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
    if (filteredMenuData.length > 0 && !isInitializedRef.current) {
      const initialExpanded = initializeExpandedMenus(filteredMenuData);
      setExpandedMenus(initialExpanded);
      isInitializedRef.current = true;
    }
  }, [filteredMenuData, initializeExpandedMenus]);

  // Update active item etc. (modifié pour gérer le parentKey avec préfixe)
  useEffect(() => {
    if (filteredMenuData.length === 0) return;
    const currentPath = location.pathname === "/" ? "/" : location.pathname + location.hash;
    if (lastLocationRef.current === currentPath) return;
    if (navigationUpdateRef.current) return;

    lastLocationRef.current = currentPath;
    navigationUpdateRef.current = true;

    const matchedResult = findMenuItemByPath(filteredMenuData, currentPath);

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
        // Active le parent si parentKey existe (ex. "mission" pour "collaborateur")
        if (parentKey) {
          newExpanded[parentKey.split('|')[0]] = true; // Prend le premier niveau parent si multi-niveaux
        }
        Object.keys(newExpanded).forEach((key) => {
          if (key !== item.menuKey && key !== (parentKey ? parentKey.split('|')[0] : null)) {
            newExpanded[key] = false;
          }
        });
        return newExpanded;
      });
    } else {
      if (activeItem !== "tableau_de_bord") {
        setActiveItem("tableau_de_bord");
      }
      if (headerTitle !== "Tableau de bord") {
        setHeaderTitle("Tableau de bord");
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
  }, [location.pathname, location.hash, filteredMenuData, findMenuItemByPath, activeItem, headerTitle]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

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
              <FaIcons.FaChevronDown className={`nav-arrow ${isExpanded ? "rotated" : ""}`} />
            </NavButton>
          ) : (
            <NavLink
              to={item.menu.link}
              className={isActive ? "active --primary-color" : ""}
              onClick={setActive(
                item.menu.menuKey,
                menuLabel,
                level === 0 ? null : findParentKey(filteredMenuData, item.menu.menuKey)
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
    [expandedMenus, activeItem, getIconComponent, toggleMenu, setActive, getMenuLabel, filteredMenuData, findParentKey]
  );

  const renderSection = useCallback((sectionName: string, items: MenuItem[]) => {
    return (
      <>
        <SidebarDivider>
          <span>{sectionName}</span>
        </SidebarDivider>
        {isMenuLoading ? (
          <MenuLoadingDots>Chargement...</MenuLoadingDots>
        ) : (
          items.length > 0 &&
          items.map((item) => renderMenuItem(item, 0))
        )}
      </>
    );
  }, [isMenuLoading, renderMenuItem]);

  const renderMenu = useCallback(() => {
    const groupedMenu = groupMenuBySection(filteredMenuData);

    return (
      <SidebarNav>
        <NavUl>
          {groupedMenu.navigation.length > 0 && renderSection("NAVIGATION", groupedMenu.navigation)}
          {groupedMenu.administration.length > 0 && renderSection("ADMINISTRATION", groupedMenu.administration)}
        </NavUl>
      </SidebarNav>
    );
  }, [groupMenuBySection, filteredMenuData, renderSection]);

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
      <Sidebar $isOpen={isSidebarOpen}>
        <SidebarHeader>
          <LogoContainer>
            <LogoImage src="/Logo.JPG" alt="Logo" />
          </LogoContainer>
        </SidebarHeader>
        {renderMenu()}
        <Footer collapsed={!isSidebarOpen} />
      </Sidebar>
      <MainContent $isOpen={isSidebarOpen}>
        <Header
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          generateBreadcrumbs={generateBreadcrumbs}
          user={user}
          getInitials={getInitials}
          setActive={setActive}
        />
        <Content>{children}</Content>

        <TemplateFooter />
        <ToastContainer userId={user.userId} />
      </MainContent>
    </App>
  );
};

export default Template;