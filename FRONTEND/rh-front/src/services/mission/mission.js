"use client";

import { BASE_URL } from "config/apiConfig";

export const fetchMissionPayment = async (
  missionId,
  employeeId,
  setMissionPayment,
  setIsLoading,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missionPayment: true }));

    // Validation des paramètres requis
    if (!missionId || !employeeId) {
      throw new Error('Mission ID et Employee ID sont requis');
    }

    console.log('Sending request with:', { missionId, employeeId });

    // Appel API pour récupérer les données de paiement
    const response = await fetch(`${BASE_URL}/api/MissionPaiement/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        missionId,
        employeeId,
      }),
    });

    // Gestion des erreurs HTTP
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorText;
          } catch {
            errorMessage = errorText;
          }
        }
      } catch (e) {
        console.warn('Could not read error response body:', e);
      }
      throw new Error(`Erreur lors du chargement des données de paiement: ${errorMessage}`);
    }

    const data = await response.json();
    console.log("API Response (Mission Payment):", data);

    // Validation des données de réponse
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('API returned empty or invalid data:', data);
      setMissionPayment({ indemnityDetails: [], assignmentDetails: null });
      return;
    }

    // Récupérer le transportId utilisé dans la mission
    const assignedTransportId = data[0]?.missionAssignation?.transportId;
    if (!assignedTransportId) {
      console.warn('Aucun transport assigné trouvé pour cette mission.');
    }

    // Transformation des données
    const transformedData = data.map((item) => {
      const compensationScales = item.compensationScales || [];

      // Calcul consolidé des montants par type de dépense
      const amounts = {
        lunch: 0,
        dinner: 0,
        breakfast: 0,
        accommodation: 0,
        transport: 0,
      };

      compensationScales.forEach((scale) => {
        const amount = scale.amount || 0;
        if (scale.expenseType?.type === "Déjeuner") amounts.lunch += amount;
        else if (scale.expenseType?.type === "Diner") amounts.dinner += amount;
        else if (scale.expenseType?.type === "Petit Déjeuner") amounts.breakfast += amount;
        else if (scale.expenseType?.type === "Hébergement") amounts.accommodation += amount;
        else if (scale.transportId === assignedTransportId && scale.transportId !== null) amounts.transport += amount;
      });

      // Calcul du total strict (somme des catégories filtrées)
      const totalAmount = amounts.lunch + amounts.dinner + amounts.breakfast + amounts.accommodation + amounts.transport;

      return {
        date: item.date,
        transport: amounts.transport,
        breakfast: amounts.breakfast,
        lunch: amounts.lunch,
        dinner: amounts.dinner,
        accommodation: amounts.accommodation,
        total: totalAmount,
      };
    });

    // Vérification des informations de missionAssignation
    if (!data[0]?.missionAssignation) {
      console.warn('Aucune information de missionAssignation trouvée dans la réponse API.');
    }

    // Extraction des détails de missionAssignation
    const missionAssignation = data[0]?.missionAssignation || {};
    const employee = missionAssignation.employee || {};
    const mission = missionAssignation.mission || {};
    const transport = missionAssignation.transport || {};

    const assignmentDetails = {
      assignmentId: `${missionAssignation.employeeId || ''}-${missionAssignation.missionId || ''}-${missionAssignation.transportId || ''}`,
      employeeId: missionAssignation.employeeId || '',
      missionId: missionAssignation.missionId || '',
      transportId: missionAssignation.transportId || '',
      departureDate: missionAssignation.departureDate,
      departureTime: missionAssignation.departureTime,
      returnDate: missionAssignation.returnDate,
      returnTime: missionAssignation.returnTime,
      missionDuration: missionAssignation.duration,
      createdAt: missionAssignation.createdAt,
      beneficiary: `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Non spécifié",
      matricule: employee.employeeCode || "Non spécifié",
      missionTitle: mission.name || "Non spécifié",
      function: employee.jobTitle || "Non spécifié",
      base: mission.site || "Non spécifié",
      status: mission.status || "Non spécifié",
      meansOfTransport: transport.type || "Non spécifié",
      direction: employee.direction?.directionName || "Non spécifié",
      departmentService: employee.service?.serviceName || employee.department?.departmentName || "Non spécifié",
      costCenter: employee.costCenter || "Non spécifié",
    };

    // Mise à jour de l'état avec les données transformées
    setMissionPayment({ indemnityDetails: transformedData, assignmentDetails });
  } catch (error) {
    console.error("Erreur lors du chargement des données de paiement:", error);
    onError({
      isOpen: true,
      type: "error",
      message: error.message || "Erreur inconnue lors du chargement des données de paiement",
    });
    setMissionPayment({ indemnityDetails: [], assignmentDetails: null });
  } finally {
    setIsLoading((prev) => ({ ...prev, missionPayment: false }));
  }
};

export const fetchAssignMission = async (
  setAssignMissions,
  setIsLoading,
  setTotalEntries,
  filters = {},
  page = 1,
  pageSize = 10,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, assignMissions: true }));
    const queryParams = new URLSearchParams({
      page,
      pageSize,
    }).toString();
    const requestBody = {
      ...filters,
      departureDateMin: filters.departureDateMin && !isNaN(new Date(filters.departureDateMin).getTime())
        ? new Date(filters.departureDateMin).toISOString()
        : null,
      departureDateMax: filters.departureDateMax && !isNaN(new Date(filters.departureDateMax).getTime())
        ? new Date(filters.departureDateMax).toISOString()
        : null,
      employeeId: filters.employeeId || null,
      missionId: filters.missionId || null,
      transportId: filters.transportId || null,
      status: filters.status || null,
    };
    console.log("Request Body:", requestBody);
    const response = await fetch(`${BASE_URL}/api/MissionAssignation/search?${queryParams}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error response:", errorData);
      throw new Error(`Erreur lors du chargement des assignations de mission: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("API Response (Mission Assignations):", data);
    // Transform the response data to match the UI's expected structure
    const assignMissionsData = Array.isArray(data.data)
      ? data.data.map((item) => ({
          // Ajout de l'assignmentId généré ou récupéré depuis l'API
          assignmentId: item.id || item.assignmentId || `${item.employeeId}-${item.missionId}-${item.transportId}`,
          employeeId: item.employeeId,
          missionId: item.missionId,
          transportId: item.transportId,
          departureDate: item.departureDate,
          beneficiary: `${item.employee?.firstName || ""} ${item.employee?.lastName || ""}`.trim() || "Non spécifié",
          matricule: item.employee?.employeeCode || "Non spécifié",
          missionTitle: item.mission?.name || "Non spécifié",
          function: item.employee?.jobTitle || "Non spécifié",
          base: item.mission?.site || "Non spécifié",
          status: item.mission?.status || "Non spécifié",
        }))
      : [];
    setAssignMissions(assignMissionsData);
    setTotalEntries(data.totalCount || assignMissionsData.length || 0);
  } catch (error) {
    console.error("Erreur lors du chargement des assignations de mission:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des assignations de mission: ${error.message}`,
    });
    setAssignMissions([]);
  } finally {
    setIsLoading((prev) => ({ ...prev, assignMissions: false }));
  }
};

export const fetchAllMissions = async (
  setMissions,
  setIsLoading,
  setTotalEntries,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missions: true }));

    const response = await fetch(`${BASE_URL}/api/Mission`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des missions: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response (All Missions):", data); // Debug: Log the API response
    // Ensure missions is always an array
    const missionsData = Array.isArray(data) ? data : [];
    setMissions(missionsData);
    setTotalEntries(missionsData.length || 0); // Use array length since no totalCount in GET all
  } catch (error) {
    console.error("Erreur lors du chargement des missions:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des missions: ${error.message}`,
    });
    setMissions([]); // Fallback to empty array on error
  } finally {
    setIsLoading((prev) => ({ ...prev, missions: false }));
  }
};

export const fetchMissions = async (
  setMissions,
  setIsLoading,
  setTotalEntries,
  filters = {},
  page = 1,
  pageSize = 5,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missions: true }));

    // Prepare the request body
    const requestBody = {
      name: filters.name || "",
      startDateMin: filters.startDateMin || null,
      startDateMax: filters.startDateMax || null,
      site: filters.site || "",
      status: filters.status || "",
    };

    // Add page and pageSize as query parameters
    const queryParams = new URLSearchParams({
      page,
      pageSize,
    }).toString();

    const response = await fetch(`${BASE_URL}/api/Mission/search?${queryParams}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des missions: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data); // Debug: Log the API response
    // Ensure missions is always an array
    const missionsData = Array.isArray(data.data) ? data.data : [];
    setMissions(missionsData);
    setTotalEntries(data.totalCount || missionsData.length || 0); // Use totalCount from API
  } catch (error) {
    console.error("Erreur lors du chargement des missions:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des missions: ${error.message}`,
    });
    setMissions([]); // Fallback to empty array on error
  } finally {
    setIsLoading((prev) => ({ ...prev, missions: false }));
  }
};

export const fetchMissionById = async (
  missionId,
  setMission,
  setIsLoading,
  onError
) => {
  try {
    if (typeof setIsLoading === "function") {
      setIsLoading(true);
    }

    const response = await fetch(`${BASE_URL}/api/Mission/${missionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement de la mission: ${response.statusText}`);
    }

    const data = await response.json();
    setMission(data);
  } catch (error) {
    console.error("Erreur lors du chargement de la mission:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement de la mission: ${error.message}`,
    });
  } finally {
    if (typeof setIsLoading === "function") {
      setIsLoading(false);
    }
  }
};

export const fetchMissionStats = async (setStats, setIsLoading, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, stats: true }));

    const response = await fetch(`${BASE_URL}/api/Mission/stats`, {
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
    setStats({ total: 0, enCours: 0, terminee: 0, annulee: 0 });
  } finally {
    setIsLoading((prev) => ({ ...prev, stats: false }));
  }
};

export const getMissionId = (name, missions) =>
  missions.find((mission) => mission.name === name)?.missionId || "";