"use client";

import { apiGet, apiPost } from "utils/apiUtils";

export const fetchAllUsers = async (setUsers, setIsLoading, setTotalEntries, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, users: true }));
    const data = await apiGet("/api/user");
    console.log("API Response (All Users):", data);

    const usersData = Array.isArray(data) ? data : [];
    setUsers(usersData);
    setTotalEntries(usersData.length || 0);
  } catch (error) {
    console.error("Erreur lors du chargement des utilisateurs:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des utilisateurs: ${error.message}`,
    });
    setUsers([]);
  } finally {
    setIsLoading((prev) => ({ ...prev, users: false }));
  }
};

export const fetchUserRoles = async (userId, setIsLoading, onSuccess, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, userRoles: true }));
    const data = await apiGet(`/api/user/${userId}/roles`);
    console.log("API Response (User Roles):", data);

    const roleIds = Array.isArray(data) ? data : [];
    onSuccess(roleIds);
  } catch (error) {
    console.error("Erreur lors du chargement des rôles de l'utilisateur:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des rôles de l'utilisateur: ${error.message}`,
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, userRoles: false }));
  }
};

export const searchUsers = async (
  setUsers,
  setIsLoading,
  setTotalEntries,
  filters = {},
  page = 1,
  pageSize = 10,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, users: true }));
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (filters.matricule?.trim()) {
      queryParams.append('Matricule', filters.matricule.trim());
    }
    if (filters.name?.trim()) {
      queryParams.append('Name', filters.name.trim());
    }
    if (filters.department?.trim()) {
      queryParams.append('Department', filters.department.trim());
    }
    if (filters.status?.trim()) {
      queryParams.append('Status', filters.status.trim());
    }
    
    const queryString = queryParams.toString();
    
    const data = await apiPost(`/api/user/search?${queryString}`, {});
    
    const usersData = Array.isArray(data.users) ? data.users : [];
    setUsers(usersData);
    setTotalEntries(data.totalCount || usersData.length || 0);
    
  } catch (error) {
    
    onError({
      isOpen: true,
      type: "error",
      message: error.response?.data?.message || error.message || "Erreur lors de la recherche des utilisateurs",
      fieldErrors: error.response?.data?.errors || {},
    });
    setUsers([]);
    setTotalEntries(0);
  } finally {
    setIsLoading((prev) => ({ ...prev, users: false }));
  }
};

export const syncLdap = async (onSuccess, onError) => {
  try {
    await apiPost("/api/Ldap/sync", {});
    console.log("LDAP Sync Successful");
    onSuccess({
      isOpen: true,
      type: "success",
      message: "Synchronisation LDAP réussie.",
    });
  } catch (error) {
    console.error("Erreur lors de la synchronisation LDAP:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors de la synchronisation LDAP: ${error.message}`,
    });
  }
};

export const fetchSuperior = async (matricule, setSuperior, setIsLoading, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, superior: true }));
    
    if (!matricule) {
      throw new Error("Matricule requis pour charger le supérieur.");
    }
    
    const data = await apiGet(`/api/user/${matricule}/superior`);
    if (!data) {
      throw new Error("Aucune donnée de supérieur retournée par l'API.");
    }
    setSuperior(data);
  } catch (error) {
    console.error("Erreur lors du chargement du supérieur:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement du supérieur : ${error.message}`,
    });
    setSuperior(null);
  } finally {
    setIsLoading((prev) => ({ ...prev, superior: false }));
  }
};

export const fetchDrh = async (setDrh, setIsLoading, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, drh: true }));
    const data = await apiGet("/api/user/drh");
    setDrh(data || null);
  } catch (error) {
    console.error("Erreur lors du chargement du DRH:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement du DRH: ${error.message}`,
    });
    setDrh(null);
  } finally {
    setIsLoading((prev) => ({ ...prev, drh: false }));
  }
};

export const fetchCollaborators = async (userId, setCollaborators, setIsLoading, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, collaborators: true }));
    const data = await apiGet(`/api/User/${userId}/collaborators`);
    console.log("API Response (Collaborators):", data);

    const collaboratorsData = Array.isArray(data) ? data : [];
    setCollaborators(collaboratorsData);
  } catch (error) {
    console.error("Erreur lors du chargement des collaborateurs:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des collaborateurs: ${error.message}`,
    });
    setCollaborators([]);
  } finally {
    setIsLoading((prev) => ({ ...prev, collaborators: false }));
  }
};

export const getUserId = (userName, usersList) => {
  const user = usersList.find((u) => u.name === userName);
  return user ? user.id : "";
};