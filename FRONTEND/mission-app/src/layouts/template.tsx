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
import { useCanValidateJobDescription, useHasValidationInRecruitment } from "@/api/recruitment/service";

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
  // const hasVoirValidationRecrutement = useHasHabilitation(user.userId, "Voir la validation des recrutements");
  const hasVoirMissions = useHasHabilitation(user.userId, "Voir la liste des missions");
  const hasVoirMissionsArchivees = useHasHabilitation(user.userId, "Voir les missions archivées");
  const hasVoirTresorier = useHasHabilitation(user.userId, "Voir la trésorerie");
  const hasVoirHabilitation = useHasHabilitation(user.userId, "Voir les habilitations");
  const hasVoirTableauBord = useHasHabilitation(user.userId, "Voir le tableau de bord");

  const { data: hasValidationLine = true } = useHasValidationLine(user.userId);
// Vérification de l'accès 
  const { data: requestValidation } = useHasValidationInRecruitment(user.userId);
  const { data: jobDescValidation } = useCanValidateJobDescription(user.userId);
  
  const canSeeValidationInRecruitment = (requestValidation?.hasValidation) ?? false;
  const canSeeJobDescriptionValidation = (jobDescValidation?.hasValidation) ?? false;

  const habilitationsMap = useMemo(() => ({
    utilisateurs: hasVoirUtilisateurs,
    "Droit & Accès": hasVoirDroitAcces,
    accès: hasVoirAcces,
    référentiel: hasVoirReferentiel,
    import: hasVoirImport,
    logs: hasVoirLogs,
    mission: hasVoirMission,
    validation: hasVoirValidation && hasValidationLine,
    "Validations": canSeeValidationInRecruitment || canSeeJobDescriptionValidation,
    "Statistiques": hasVoirTableauBord,
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
    canSeeValidationInRecruitment,
    canSeeJobDescriptionValidation,
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

      // NOUVEAU : Matching par préfixe pour routes enfants (ex. /mission/:id)
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
    const currentPath = location.pathname;
    const breadcrumbs: BreadcrumbItem[] = [];

    // Toujours ajouter Accueil
    breadcrumbs.push({
      title: "Accueil",
      path: "/dashboard",
      isActive: currentPath === "/dashboard",
      clickable: true,
    });

    // Gestion des breadcrumbs selon les routes
    if (currentPath === "/profil-page") {
      breadcrumbs.push({
        title: "Mon profil",
        path: "/profil-page",
        isActive: true,
      });
    }
    
    // IMPORT
    else if (currentPath === "/import") {
      breadcrumbs.push({
        title: "Import",
        path: "/import",
        isActive: true,
      });
    }
    
    // ADMIN - Utilisateurs
    else if (currentPath === "/utilisateur") {
      breadcrumbs.push({
        title: "Administration",
        path: "/utilisateur",
        isActive: false,
        clickable: false,
      });
      breadcrumbs.push({
        title: "Utilisateurs",
        path: "/utilisateur",
        isActive: true,
      });
    }
    
    // ADMIN - Logs
    else if (currentPath === "/logs") {
      breadcrumbs.push({
        title: "Administration",
        path: "/logs",
        isActive: false,
        clickable: false,
      });
      breadcrumbs.push({
        title: "Logs",
        path: "/logs",
        isActive: true,
      });
    }
    
    // ADMIN - Droits d'accès
    else if (currentPath === "/access/list") {
      breadcrumbs.push({
        title: "Administration",
        path: "/access/list",
        isActive: false,
        clickable: false,
      });
      breadcrumbs.push({
        title: "Droits d'accès",
        path: "/access/list",
        isActive: true,
      });
    }
    
    // ADMIN - Habilitations
    else if (currentPath === "/habilitation") {
      breadcrumbs.push({
        title: "Administration",
        path: "/habilitation",
        isActive: false,
        clickable: false,
      });
      breadcrumbs.push({
        title: "Habilitations",
        path: "/habilitation",
        isActive: true,
      });
    }
    
    // RÉFÉRENTIEL - Page principale
    else if (currentPath === "/referentiel") {
      breadcrumbs.push({
        title: "Référentiel",
        path: "/referentiel",
        isActive: true,
      });
    }
    
    // RÉFÉRENTIEL - Directions
    else if (currentPath === "/referentiel/direction") {
      breadcrumbs.push({
        title: "Référentiel",
        path: "/referentiel",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Directions",
        path: "/referentiel/direction",
        isActive: true,
      });
    }
    
    // RÉFÉRENTIEL - Départements
    else if (currentPath === "/referentiel/department") {
      breadcrumbs.push({
        title: "Référentiel",
        path: "/referentiel",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Départements",
        path: "/referentiel/department",
        isActive: true,
      });
    }
    
    // RÉFÉRENTIEL - Services
    else if (currentPath === "/referentiel/service") {
      breadcrumbs.push({
        title: "Référentiel",
        path: "/referentiel",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Services",
        path: "/referentiel/service",
        isActive: true,
      });
    }
    
    // RÉFÉRENTIEL - Sites
    else if (currentPath === "/referentiel/site") {
      breadcrumbs.push({
        title: "Référentiel",
        path: "/referentiel",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Sites",
        path: "/referentiel/site",
        isActive: true,
      });
    }
    
    // RÉFÉRENTIEL - Genres
    else if (currentPath === "/referentiel/genders") {
      breadcrumbs.push({
        title: "Référentiel",
        path: "/referentiel",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Genres",
        path: "/referentiel/genders",
        isActive: true,
      });
    }
    
    // RÉFÉRENTIEL - Types de contrat
    else if (currentPath === "/referentiel/contract") {
      breadcrumbs.push({
        title: "Référentiel",
        path: "/referentiel",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Types de contrat",
        path: "/referentiel/contract",
        isActive: true,
      });
    }
    
    // RÉFÉRENTIEL - Unités
    else if (currentPath === "/referentiel/unit") {
      breadcrumbs.push({
        title: "Référentiel",
        path: "/referentiel",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Unités",
        path: "/referentiel/unit",
        isActive: true,
      });
    }
    
    // RÉFÉRENTIEL - Collaborateurs
    else if (currentPath === "/referentiel/collaborator") {
      breadcrumbs.push({
        title: "Référentiel",
        path: "/referentiel",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Collaborateurs",
        path: "/referentiel/collaborator",
        isActive: true,
      });
    }
    
    // RÉFÉRENTIEL - Lieux
    else if (currentPath === "/referentiel/lieu") {
      breadcrumbs.push({
        title: "Référentiel",
        path: "/referentiel",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Lieux",
        path: "/referentiel/lieu",
        isActive: true,
      });
    }
    
    // RÉFÉRENTIEL - Transports
    else if (currentPath === "/referentiel/transport") {
      breadcrumbs.push({
        title: "Référentiel",
        path: "/referentiel",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Transports",
        path: "/referentiel/transport",
        isActive: true,
      });
    }
    
    // RÉFÉRENTIEL - Barèmes de compensation
    else if (currentPath === "/referentiel/compensation-scale") {
      breadcrumbs.push({
        title: "Référentiel",
        path: "/referentiel",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Barèmes de compensation",
        path: "/referentiel/compensation-scale",
        isActive: true,
      });
    }
    
    // RÉFÉRENTIEL - Zones géographiques
    else if (currentPath === "/referentiel/geo-zone") {
      breadcrumbs.push({
        title: "Référentiel",
        path: "/referentiel",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Zones géographiques",
        path: "/referentiel/geo-zone",
        isActive: true,
      });
    }
    
    // MISSION - Liste
    else if (currentPath === "/mission/list") {
      breadcrumbs.push({
        title: "Missions",
        path: "/mission/list",
        isActive: true,
      });
    }

    else if (currentPath === "/validators_flow") {
      breadcrumbs.push({
        title: "Validators",
        path: "/validators_flow",
        isActive: true,
      });
    }
    
    // MISSION - Carte
    else if (currentPath === "/mission/maps") {
      breadcrumbs.push({
        title: "Missions",
        path: "/mission/list",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Carte des missions",
        path: "/mission/maps",
        isActive: true,
      });
    }
    
    // MISSION - Détails avec ID dynamique (CORRIGÉ pour /mission/:missionId)
    else if (currentPath.match(/^\/mission\/\w+/)) {
      const pathParts = currentPath.split('/');
      
      // Vérifier si c'est une route de détail (ex: /mission/MIS-000001)
      if (pathParts.length === 3 && pathParts[1] === "mission") {
        const missionId = pathParts[2];
        
        breadcrumbs.push({
          title: "Missions",
          path: "/mission/list",
          isActive: false,
          clickable: true,
        });
        
        // Formater l'ID pour l'affichage
        const displayId = missionId.startsWith('MIS-') 
          ? missionId 
          : `#${missionId}`;
        
        breadcrumbs.push({
          title: `Mission ${displayId}`,
          path: currentPath,
          isActive: true,
        });
      }
    }
    
    // MISSION - Validation
    else if (currentPath === "/mission/to-validate") {
      breadcrumbs.push({
        title: "Missions",
        path: "/mission/list",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Validation",
        path: "/mission/to-validate",
        isActive: true,
      });
    }
    
    // TRÉSORERIE - Page principale
    else if (currentPath === "/treasury") {
      breadcrumbs.push({
        title: "Trésorerie",
        path: "/treasury",
        isActive: true,
      });
    }
    
    // TRÉSORERIE - Compensation
    else if (currentPath === "/treasury/compensation") {
      breadcrumbs.push({
        title: "Trésorerie",
        path: "/treasury",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Compensation",
        path: "/treasury/compensation",
        isActive: true,
      });
    }
    
    // TRÉSORERIE - Remboursement
    else if (currentPath === "/treasury/remboursement") {
      breadcrumbs.push({
        title: "Trésorerie",
        path: "/treasury",
        isActive: false,
        clickable: true,
      });
      breadcrumbs.push({
        title: "Remboursement",
        path: "/treasury/remboursement",
        isActive: true,
      });
    }
    
    // RECRUTEMENT - Demandes
    else if (currentPath === "/recrutement/demandes/liste") {
      breadcrumbs.push({
        title: "Recrutement",
        path: "/recrutement/demandes/liste",
        isActive: false,
        clickable: false,
      });
      breadcrumbs.push({
        title: "Demandes",
        path: "/recrutement/demandes/liste",
        isActive: true,
      });
    }
    
    // ERREUR - 403
    else if (currentPath === "/403") {
      breadcrumbs.push({
        title: "Erreur 403",
        path: "/403",
        isActive: true,
      });
    }
    
    // DASHBOARD (par défaut)
    else if (currentPath === "/dashboard") {
      // Ne rien ajouter de plus, juste "Accueil" qui est déjà actif
    }
    
    // Si aucune route ne correspond, utiliser la logique existante de recherche dans le menu
    else {
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
              clickable: true,
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
  }, [location.pathname, filteredMenuData, findMenuItemByPath, getMenuLabel]);

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

  useEffect(() => {
    if (filteredMenuData.length > 0 && !isInitializedRef.current) {
      const initialExpanded = initializeExpandedMenus(filteredMenuData);
      setExpandedMenus(initialExpanded);
      isInitializedRef.current = true;
    }
  }, [filteredMenuData, initializeExpandedMenus]);

  useEffect(() => {
    if (filteredMenuData.length === 0) return;
    const currentPath = location.pathname === "/" ? "/" : location.pathname;
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
  }, [location.pathname, filteredMenuData, findMenuItemByPath, activeItem, headerTitle]);

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