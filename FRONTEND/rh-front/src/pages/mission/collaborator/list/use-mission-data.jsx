import { useState, useEffect } from "react";
import { formatDate } from "utils/dateConverter";
import { hasHabilitation } from "utils/authUtils";
import {
    fetchAssignMission,
    fetchAllMissions,
    cancelMission,
    fetchMissionStats,
} from "services/mission/mission";
import { fetchAllEmployees } from "services/employee/employee";
import { fetchAllRegions } from "services/lieu/lieu";
import { fetchCollaborators } from "services/users/users";

const useMissionData = () => {
    const [assignedPersons, setAssignedPersons] = useState([]);
    const [collaborators, setCollaborators] = useState([]);
    const [filters, setFilters] = useState({
        status: "",
        employeeId: "",
        employeeName: "",
        startDate: "",
        endDate: "",
        transportId: "",
        missionId: "",
        missionName: "",
        lieuId: "",
        location: "",
        matricule: [],
    });
    const [appliedFilters, setAppliedFilters] = useState({ ...filters });
    const [suggestions, setSuggestions] = useState({
        beneficiary: [],
        missions: [],
        regions: [],
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);
    const [isLoading, setIsLoading] = useState({
        assignMissions: false,
        employees: false,
        missions: false,
        regions: false,
        exportPDF: false,
        exportExcel: false,
        collaborators: false,
        stats: false,
    });
    const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
    const [isHidden, setIsHidden] = useState(false);
    const [viewMode, setViewMode] = useState("all");
    const [permissions, setPermissions] = useState({});
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [missionToCancel, setMissionToCancel] = useState(null);
    const [showDetailsMission, setShowDetailsMission] = useState(false);
    const [selectedMissionId, setSelectedMissionId] = useState(null);
    const [showMissionForm, setShowMissionForm] = useState(false);
    const [selectedMissionIdForEdit, setSelectedMissionIdForEdit] = useState(null);
    const [stats, setStats] = useState({ total: 0, enCours: 0, planifiee: 0, terminee: 0, annulee: 0 });
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.userId || "";
    const userMatricule = userData?.matricule || "";

    useEffect(() => {
        const defaultFilters = { ...filters, matricule: [], employeeId: "", employeeName: "" };
        setFilters(defaultFilters);
        setAppliedFilters(defaultFilters);
        setViewMode("all");
    }, []);

    useEffect(() => {
        fetchAllEmployees(
            (data) => {
                setSuggestions((prev) => ({
                    ...prev,
                    beneficiary: data.map((emp) => ({
                        id: emp.employeeId,
                        name: `${emp.lastName} ${emp.firstName}`,
                        displayName: `${emp.lastName} ${emp.firstName} (${emp.direction?.acronym || "N/A"})`,
                        acronym: emp.direction?.acronym || "N/A",
                    })),
                }));
            },
            setIsLoading,
            (error) => setAlert(error)
        );
        fetchAllMissions(
            (data) => {
                setSuggestions((prev) => ({
                    ...prev,
                    missions: data.map((mission) => ({
                        id: mission.missionId,
                        name: mission.name,
                        displayName: `${mission.name || "Non spécifié"} (${
                            formatDate(mission.startDate) || "Non spécifié"
                        } - ${formatDate(mission.endDate) || "Non spécifié"}, ${
                            mission.lieu?.nom || "Non spécifié"
                        })`,
                    })),
                }));
            },
            setIsLoading,
            () => {},
            (error) => setAlert(error)
        );
        fetchAllRegions(
            (data) => {
                setSuggestions((prev) => ({
                    ...prev,
                    regions: data.map((lieu) => ({
                        id: lieu.lieuId,
                        name: lieu.nom,
                        displayName: `${lieu.nom}${lieu.pays ? `/${lieu.pays}` : ""}`,
                    })),
                }));
            },
            setIsLoading,
            (error) => setAlert(error)
        );
        if (userId) {
            fetchCollaborators(userId, setCollaborators, setIsLoading, (error) => setAlert(error));
        }
        // Récupération des statistiques au chargement initial avec matricule vide
        fetchMissionStats(setStats, setIsLoading, (error) => setAlert(error), []);
    }, [userId]);

    useEffect(() => {
        console.log("assignedPersons:", assignedPersons); // Log pour débogage
        fetchAssignMission(
            setAssignedPersons,
            setIsLoading,
            setTotalEntries,
            {
                employeeId: appliedFilters.employeeId || "",
                transportId: appliedFilters.transportId || "",
                startDate: appliedFilters.startDate || "",
                endDate: appliedFilters.endDate || "",
                status: appliedFilters.status || "",
                missionId: appliedFilters.missionId || "",
                lieuId: appliedFilters.lieuId || "",
                matricule: appliedFilters.matricule || [],
            },
            currentPage,
            pageSize,
            (error) => setAlert(error)
        );
        // Récupérer les statistiques à chaque changement de filtres avec matricule
        fetchMissionStats(setStats, setIsLoading, (error) => setAlert(error), appliedFilters.matricule);
    }, [appliedFilters, currentPage, pageSize]);

    useEffect(() => {
        const fetchPermissions = async () => {
            const newPermissions = {};
            for (const assignment of assignedPersons) {
                const canModify = await hasHabilitation("mission_modification") && assignment.status !== "Annulé" && assignment.status !== "Terminé";
                const canCancel = await hasHabilitation("mission_suppression") && assignment.status !== "Annulé" && assignment.status !== "Terminé";
                newPermissions[assignment.missionId] = { canModify, canCancel };
            }
            setPermissions(newPermissions);
        };
        if (assignedPersons.length > 0) {
            fetchPermissions();
        }
    }, [assignedPersons]);

    const handleError = (error) => setAlert(error);

    const refetchData = () => {
        fetchAssignMission(
            setAssignedPersons,
            setIsLoading,
            setTotalEntries,
            {
                employeeId: appliedFilters.employeeId || "",
                transportId: appliedFilters.transportId || "",
                startDate: appliedFilters.startDate || "",
                endDate: appliedFilters.endDate || "",
                status: appliedFilters.status || "",
                missionId: appliedFilters.missionId || "",
                lieuId: appliedFilters.lieuId || "",
                matricule: appliedFilters.matricule || [],
            },
            currentPage,
            pageSize,
            (error) => setAlert(error)
        );
        // Rafraîchir les statistiques avec matricule
        fetchMissionStats(setStats, setIsLoading, (error) => setAlert(error), appliedFilters.matricule);
    };

    const handleFilterSubmit = (event) => {
        event.preventDefault();
        let updatedFilters = { ...filters };
        if (filters.employeeName && !filters.employeeId) {
            const selectedEmployee = suggestions.beneficiary.find(
                (emp) => emp.displayName === filters.employeeName
            );
            if (!selectedEmployee) {
                setAlert({
                    isOpen: true,
                    type: "error",
                    message: "Veuillez sélectionner un bénéficiaire valide dans la liste des suggestions.",
                });
                return;
            }
            updatedFilters.employeeId = selectedEmployee.id;
            updatedFilters.employeeName = selectedEmployee.displayName;
        }
        if (filters.missionName && !filters.missionId) {
            const selectedMission = suggestions.missions.find(
                (mission) => mission.displayName === filters.missionName
            );
            if (!selectedMission) {
                setAlert({
                    isOpen: true,
                    type: "error",
                    message: "Veuillez sélectionner une mission valide dans la liste des suggestions.",
                });
                return;
            }
            updatedFilters.missionId = selectedMission.id;
            updatedFilters.missionName = selectedMission.displayName;
        }
        if (filters.location && !filters.lieuId) {
            const selectedRegion = suggestions.regions.find(
                (region) => region.displayName === filters.location
            );
            if (!selectedRegion) {
                setAlert({
                    isOpen: true,
                    type: "error",
                    message: "Veuillez sélectionner un lieu valide dans la liste des suggestions.",
                });
                return;
            }
            updatedFilters.lieuId = selectedRegion.id;
            updatedFilters.location = selectedRegion.displayName;
        }
        setFilters(updatedFilters);
        setAppliedFilters(updatedFilters);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        const resetFilters = {
            status: "",
            employeeId: "",
            employeeName: "",
            startDate: "",
            endDate: "",
            transportId: "",
            missionId: "",
            missionName: "",
            lieuId: "",
            location: "",
            matricule: [],
        };
        setFilters(resetFilters);
        setAppliedFilters(resetFilters);
        setCurrentPage(1);
        setAlert({ isOpen: true, type: "info", message: "Filtres réinitialisés." });
        setViewMode("all");
    };

    const handleAllMissions = () => {
        const allMissionsFilters = { ...filters, matricule: [], employeeId: "", employeeName: "" };
        setFilters(allMissionsFilters);
        setAppliedFilters(allMissionsFilters);
        setCurrentPage(1);
        setViewMode("all");
    };

    const handleCollaboratorsMissions = () => {
        const collaboratorMatricules = collaborators
            .map((collab) => collab.employeeCode || collab.matricule || "")
            .filter((matricule) => matricule);
        const collaboratorsMissionsFilters = {
            ...filters,
            matricule: collaboratorMatricules,
            employeeId: "",
            employeeName: "",
        };
        setFilters(collaboratorsMissionsFilters);
        setAppliedFilters(collaboratorsMissionsFilters);
        setCurrentPage(1);
        setViewMode("collaborators");
    };

    const handleMyMissions = () => {
        const myMissionsFilters = {
            ...filters,
            matricule: [userMatricule],
            employeeId: "",
            employeeName: "",
        };
        setFilters(myMissionsFilters);
        setAppliedFilters(myMissionsFilters);
        setCurrentPage(1);
        setViewMode("my");
    };

    const handlePageChange = (page) => setCurrentPage(page);

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setCurrentPage(1);
    };

    const handleRowClick = (missionId) => {
        console.log("handleRowClick - missionId:", missionId);
        if (missionId && typeof missionId === "string" && missionId.trim() !== "") {
            setSelectedMissionId(missionId);
            setShowDetailsMission(true);
            console.log("After state update - selectedMissionId:", missionId, "showDetailsMission:", true);
        } else {
            console.warn("handleRowClick - Invalid missionId:", missionId);
            setAlert({
                isOpen: true,
                type: "error",
                message: "ID de mission invalide. Impossible d'afficher les détails.",
            });
        }
    };

    const handleEditMission = (missionId) => {
        setSelectedMissionIdForEdit(missionId);
        setShowMissionForm(true);
    };

    const handleShowCancelModal = (missionId) => {
        setMissionToCancel(missionId);
        setShowCancelModal(true);
    };

    const handleConfirmCancel = () => {
        if (missionToCancel) {
            cancelMission(missionToCancel, setIsLoading, (successAlert) => {
                setAlert(successAlert);
                refetchData();
            }, handleError);
        }
        setShowCancelModal(false);
        setMissionToCancel(null);
    };

    const handleFormSuccess = (type, message) => {
        setAlert({ isOpen: true, type, message });
        refetchData();
    };

    return {
        isHidden,
        setIsHidden,
        viewMode,
        setViewMode,
        filters,
        setFilters,
        appliedFilters,
        setAppliedFilters,
        suggestions,
        isLoading,
        alert,
        setAlert,
        assignedPersons,
        totalEntries,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        permissions,
        collaborators,
        userMatricule,
        stats,
        handleFilterSubmit,
        handleResetFilters,
        handleAllMissions,
        handleCollaboratorsMissions,
        handleMyMissions,
        handlePageChange,
        handlePageSizeChange,
        handleRowClick,
        handleEditMission,
        handleShowCancelModal,
        handleConfirmCancel,
        handleFormSuccess,
        showCancelModal,
        setShowCancelModal,
        missionToCancel,
        setMissionToCancel,
        showDetailsMission,
        setShowDetailsMission,
        selectedMissionId,
        setSelectedMissionId,
        showMissionForm,
        setShowMissionForm,
        selectedMissionIdForEdit,
        setSelectedMissionIdForEdit,
    };
};

export default useMissionData;