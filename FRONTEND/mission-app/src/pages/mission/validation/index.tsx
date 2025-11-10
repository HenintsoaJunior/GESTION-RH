"use client";

import { Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import useMissionValidationData from "./hooks/use-mission-validation-data";
import MissionCards from "./components/mission-cards";
import MissionFilters from "./components/mission-filters";

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
  } = useMissionValidationData();

  return (
    <Routes>
      <Route
        path="/"
        element={
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
                navigate(`/mission/collaborateur/${missionId}`);
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
          </>
        }
      />
    </Routes>
  );
};

export default MissionValidationPage;