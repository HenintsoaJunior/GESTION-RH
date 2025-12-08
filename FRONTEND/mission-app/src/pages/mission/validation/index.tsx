"use client";

import { useNavigate } from 'react-router-dom';
import useMissionValidationData from "./hooks/use-mission-validation-data";
import MissionCards from "./components/mission-cards";
import MissionFilters from "./components/mission-filters";
import AlertComponent from "@/components/alert";

const MissionValidationPage = () => {
  const navigate = useNavigate();
  const {
    missions,
    isLoading,
    formatDate,
    getDaysUntilDue,
    currentPage,
    pageSize,
    totalEntries,
    handlePageChange,
    handlePageSizeChange,
    appliedFilters,
    isHidden,
    setIsHidden,
    filters,
    setFilters,
    suggestions,
    handleFilterSubmit,
    handleResetFilters,
    handleAction,
    alert,
    setAlert, // Ajout pour gérer l'alert
  } = useMissionValidationData();

  // Fonction pour fermer l'alert
  const handleAlertClose = () => {
    setAlert({ isOpen: false, type: "info", message: "" });
  };

  return (
    <>
      <MissionFilters
        isHidden={isHidden}
        setIsHidden={setIsHidden}
        filters={filters}
        setFilters={setFilters}
        suggestions={suggestions}
        isLoading={isLoading}
        handleFilterSubmit={handleFilterSubmit}
        handleResetFilters={handleResetFilters}
      />
      <MissionCards
        missions={missions}
        isLoading={isLoading}
        handleRowClick={(missionId) => {
          const mission = missions.find((m) => m.id === missionId);
          if (mission?.missionId) {
            navigate(`/mission/collaborateur/${mission.missionId}`);
          } else {
            console.warn("Mission or missionId not found for details navigation:", missionId);
          }
        }}
        handleAction={handleAction}
        formatDate={formatDate}
        getDaysUntilDue={getDaysUntilDue}
        currentPage={currentPage}
        pageSize={pageSize}
        totalEntries={totalEntries}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        appliedFilters={appliedFilters}
      />
      {/* Toast Alert Component */}
      <AlertComponent
        type={alert.type as "success" | "error" | "warning" | "info"}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={handleAlertClose}
      />
    </>
  );
};

export default MissionValidationPage;