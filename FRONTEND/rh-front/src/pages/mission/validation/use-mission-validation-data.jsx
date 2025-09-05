import { useState, useEffect } from "react";
import { useValidateMissionRequest, useValidateMission } from "services/mission/validator-utils";

const useMissionValidationData = () => {
  const [missions, setMissions] = useState([]);
  const [filteredMissions, setFilteredMissions] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    department: "",
    priority: "",
    dateRange: { start: "", end: "" },
  });
  const [appliedFilters, setAppliedFilters] = useState({});
  const [isLoading, setIsLoading] = useState({ missions: true });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [showDetailsMission, setShowDetailsMission] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  const validateMissionRequest = useValidateMissionRequest();
  const validateMission = useValidateMission();

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setIsLoading((prev) => ({ ...prev, missions: true }));
        
        // Appel du service pour récupérer les données
        const response = await validateMissionRequest();
        
        // Vérification si la réponse est un tableau
        if (!Array.isArray(response)) {
          console.warn("La réponse n'est pas un tableau:", response);
          setMissions([]);
          setFilteredMissions([]);
          return;
        }

        // Transformation des données JSON en format attendu par l'interface
        const formattedMissions = response.map((validation) => {
          const mission = validation.mission || {};
          const user = validation.user || {};
          const missionAssignation = validation.missionAssignation || {};
          
          return {
            id: validation.missionValidationId,
            title: mission.name || "Mission sans titre",
            description: mission.description || "Aucune description",
            requestedBy: user.name || "Demandeur inconnu",
            department: user.department || "Département non spécifié",
            priority: "medium",
            status: validation.status || "En attente",
            requestDate: mission.startDate || new Date().toISOString(),
            dueDate: mission.endDate || new Date().toISOString(),
            estimatedDuration: `${missionAssignation.duration || 0} jours`,
            location: mission.lieuId ? `Lieu ID: ${mission.lieuId}` : "Lieu non spécifié",
            comments: validation.comments || "",
            signature: validation.signature || "",
            matricule: user.matricule || "N/A",
            function: user.position || "Fonction non spécifiée",
            transport: missionAssignation.transport || "Non spécifié",
            departureTime: missionAssignation.departureTime || "Non spécifié",
            departureDate: missionAssignation.departureDate || mission.startDate,
            returnDate: missionAssignation.returnDate || mission.endDate,
            returnTime: missionAssignation.returnTime || "Non spécifié",
            reference: validation.missionValidationId,
            toWhom: validation.toWhom || "Non spécifié",
            validationDate: validation.validationDate,
            missionCreator: validation.missionCreator,
            superiorName: user.superiorName || "Supérieur non spécifié",
            email: user.email || "",
            createdAt: validation.createdAt,
            updatedAt: validation.updatedAt,
            missionAssignationId: validation.missionAssignationId,
          };
        });

        setMissions(formattedMissions);
        setFilteredMissions(formattedMissions);
        
      } catch (error) {
        console.error("Erreur lors du chargement des missions:", error);
        setAlert({
          isOpen: true,
          type: "error",
          message: `Erreur lors du chargement des missions: ${error.message}`,
        });
        setMissions([]);
        setFilteredMissions([]);
      } finally {
        setIsLoading((prev) => ({ ...prev, missions: false }));
      }
    };

    fetchMissions();
  }, [validateMissionRequest]);

  useEffect(() => {
    setStats({
      total: missions.length,
      pending: missions.filter((m) => m.status === "En attente").length,
      approved: missions.filter((m) => m.status === "Approuvée").length,
      rejected: missions.filter((m) => m.status === "Rejetée").length,
    });
  }, [missions]);

  useEffect(() => {
    let filtered = [...missions];

    if (appliedFilters.search) {
      filtered = filtered.filter(
        (mission) =>
          mission.title.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
          mission.requestedBy.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
          mission.matricule.toLowerCase().includes(appliedFilters.search.toLowerCase())
      );
    }

    if (appliedFilters.status) {
      filtered = filtered.filter((mission) => mission.status === appliedFilters.status);
    }

    if (appliedFilters.department) {
      filtered = filtered.filter((mission) => mission.department === appliedFilters.department);
    }

    if (appliedFilters.priority) {
      filtered = filtered.filter((mission) => mission.priority === appliedFilters.priority);
    }

    if (appliedFilters.dateRange?.start) {
      filtered = filtered.filter(
        (mission) => new Date(mission.requestDate) >= new Date(appliedFilters.dateRange.start)
      );
    }

    if (appliedFilters.dateRange?.end) {
      filtered = filtered.filter(
        (mission) => new Date(mission.requestDate) <= new Date(appliedFilters.dateRange.end)
      );
    }

    setFilteredMissions(filtered);
  }, [missions, appliedFilters]);

  const handleRowClick = (missionId) => {
    if (missionId) {
      setSelectedMissionId(missionId);
      setShowDetailsMission(true);
    } else {
      setAlert({
        isOpen: true,
        type: "error",
        message: "ID de mission invalide.",
      });
    }
  };

  const handleFilterSubmit = () => {
    setAppliedFilters({ ...filters });
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: "",
      status: "",
      department: "",
      priority: "",
      dateRange: { start: "", end: "" },
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const handleValidate = async (missionId, action, comment = "", signature = "") => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || !mission.missionAssignationId) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Mission ou ID d'assignation introuvable.",
      });
      return;
    }

    try {
      await validateMission(missionId, mission.missionAssignationId, action, comment, signature);

      setMissions((prevMissions) =>
        prevMissions.map((m) => {
          if (m.id === missionId) {
            return {
              ...m,
              status: action === "validate" ? "Approuvée" : action === "reject" ? "Rejetée" : m.status,
              comments: comment,
              signature: signature,
              validationDate: new Date().toISOString(),
            };
          }
          return m;
        })
      );

      setAlert({
        isOpen: true,
        type: "success",
        message: `Mission ${action === "validate" ? "approuvée" : action === "reject" ? "rejetée" : "sauvegardée"} avec succès.`,
      });
    } catch (error) {
      setAlert({
        isOpen: true,
        type: "error",
        message: `Erreur lors de la validation de la mission: ${error.message}`,
      });
    }
  };

  const handleUpdateComments = (missionId, comments) => {
    setMissions((prevMissions) =>
      prevMissions.map((mission) =>
        mission.id === missionId ? { ...mission, comments } : mission
      )
    );
  };

  const handleUpdateSignature = (missionId, signature) => {
    setMissions((prevMissions) =>
      prevMissions.map((mission) =>
        mission.id === missionId ? { ...mission, signature } : mission
      )
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date non spécifiée";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return {
    missions,
    filteredMissions,
    setMissions,
    isLoading,
    alert,
    setAlert,
    stats,
    selectedMissionId,
    setSelectedMissionId,
    showDetailsMission,
    setShowDetailsMission,
    isHidden,
    setIsHidden,
    handleRowClick,
    handleValidate,
    handleUpdateComments,
    handleUpdateSignature,
    formatDate,
    getDaysUntilDue,
  };
};

export default useMissionValidationData;