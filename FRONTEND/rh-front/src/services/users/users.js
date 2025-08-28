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

// Search users with filters
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
    const requestBody = {
      matricule: filters.matricule?.trim() || "",
      name: filters.name?.trim() || "",
      department: filters.department?.trim() || "",
      status: filters.status?.trim() || "",
    };
    console.log("Request Body for user search:", requestBody);
    const data = await apiPost("/api/user/search", requestBody, { page, pageSize });
    console.log("API Response (User Search):", data);

    const usersData = Array.isArray(data.users) ? data.users : [];
    setUsers(usersData);
    setTotalEntries(data.totalCount || usersData.length || 0);
  } catch (error) {
    console.error("Erreur lors de la recherche des utilisateurs:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors de la recherche des utilisateurs: ${error.message}`,
    });
    setUsers([]);
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

export const fetchSuperior = async (setSuperior, setIsLoading, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, superior: true }));

    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || !userData.userId) {
      throw new Error("Aucun ID utilisateur trouvé dans le localStorage.");
    }
    const idToUse = userData.userId;

    const data = await apiGet(`/api/user/${idToUse}/superior`);
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

// Fetch the DRH
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