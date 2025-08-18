"use client";

import { BASE_URL } from "config/apiConfig";

export const fetchRecruitmentRequests = async (
  setRequests,
  setIsLoading,
  setTotalEntries,
  filters = {},
  page = 1,
  pageSize = 5,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, requests: true }));

    // Construire les paramètres de requête pour les filtres
    const queryParams = new URLSearchParams({
      page,
      pageSize,
      ...(filters.status && { status: filters.status }),
      ...(filters.jobTitleKeyword && { positionTitle: filters.jobTitleKeyword }),
      ...(filters.requestDateMin && { requestDateMin: filters.requestDateMin }),
      ...(filters.requestDateMax && { requestDateMax: filters.requestDateMax }),
      ...(filters.siteId && { siteId: filters.siteId }),
      ...(filters.contractTypeId && { contractTypeId: filters.contractTypeId }),
      ...(filters.directionId && { directionId: filters.directionId }),
      ...(filters.departmentId && { departmentId: filters.departmentId }),
      ...(filters.serviceId && { serviceId: filters.serviceId }),
    }).toString();

    const response = await fetch(`${BASE_URL}/api/RecruitmentRequest/search?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des demandes de recrutement: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data); // Debug: Log the API response
    // Ensure requests is always an array
    const requestsData = Array.isArray(data.results) ? data.results : [];
    setRequests(requestsData);
    setTotalEntries(data.totalCount || requestsData.length || 0); // Use totalCount from API
  } catch (error) {
    console.error("Erreur lors du chargement des demandes de recrutement:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des demandes de recrutement: ${error.message}`,
    });
    setRequests([]); // Fallback to empty array on error
  } finally {
    setIsLoading((prev) => ({ ...prev, requests: false }));
  }
};

export const fetchRecruitmentRequestById = async (
  recruitmentRequestId,
  setRequest,
  setIsLoading,
  onError
) => {
  try {
    if (typeof setIsLoading === "function") {
      setIsLoading(true);
    }

    const response = await fetch(`${BASE_URL}/api/RecruitmentRequest/detail/${recruitmentRequestId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement de la demande de recrutement: ${response.statusText}`);
    }

    const data = await response.json();
    setRequest(data);
  } catch (error) {
    console.error("Erreur lors du chargement de la demande de recrutement:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement de la demande de recrutement: ${error.message}`,
    });
  } finally {
    if (typeof setIsLoading === "function") {
      setIsLoading(false);
    }
  }
};

export const fetchRecruitmentRequestStats = async (setStats, setIsLoading, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, stats: true }));

    const response = await fetch(`${BASE_URL}/api/RecruitmentRequest/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des statistiques: ${response.statusText}`);
    }

    const data = await response.json();
    setStats(data);
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des statistiques: ${error.message}`,
    });
    setStats({ total: 0, enAttente: 0, enCours: 0, approuvees: 0, rejetees: 0 });
  } finally {
    setIsLoading((prev) => ({ ...prev, stats: false }));
  }
};

export const getRecruitmentRequestId = (positionTitle, requests) =>
  requests.find((req) => req.recruitmentRequest?.positionTitle === positionTitle)?.recruitmentRequest
    ?.recruitmentRequestId || "";