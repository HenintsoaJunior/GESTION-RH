"use client";

import useMissionValidationData from "./hooks/use-mission-validation-data";
import MissionCards from "./components/mission-cards";
import MissionFilters from "./components/mission-filters";
import MissionModals from "./components/mission-modals";

const MissionValidationPage = () => {
  const {
    missions,
    isLoading,
    handleRowClick,
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
    alert,
    setAlert,
    selectedMissionId,
    showDetailsMission,
    setShowDetailsMission,
    handleValidate,
    handleUpdateComments,
    handleUpdateSignature,
    comments,
    handleCreateComment,
    handleUpdateComment,
    handleDeleteComment,
  } = useMissionValidationData();

  const handleCreateCommentVoid = async (missionId: string, commentText: string): Promise<void> => {
    await handleCreateComment(missionId, commentText);
  };

  const handleUpdateCommentVoid = async (commentId: string, missionId: string, commentText: string): Promise<void> => {
    await handleUpdateComment(commentId, missionId, commentText);
  };

  const handleDeleteCommentVoid = async (commentId: string, missionId: string): Promise<void> => {
    await handleDeleteComment(commentId, missionId);
  };

  const castedAlert = {
    ...alert,
    type: (alert.type as "success" | "error" | "warning" | "info" | undefined),
  };

  const castedSetAlert = (newAlert: { isOpen: boolean; type: "success" | "error" | "warning" | "info" | undefined; message: string; }): void => {
    setAlert({
      ...newAlert,
      type: newAlert.type || "info",
    });
  };

  if (showDetailsMission) {
    return (
      <MissionModals
        alert={castedAlert}
        setAlert={castedSetAlert}
        showDetailsMission={showDetailsMission}
        setShowDetailsMission={setShowDetailsMission}
        selectedMissionId={selectedMissionId}
        missions={missions}
        formatDate={formatDate}
        handleValidate={handleValidate}
        handleUpdateComments={handleUpdateComments}
        handleUpdateSignature={handleUpdateSignature}
        comments={comments}
        handleCreateComment={handleCreateCommentVoid}
        handleUpdateComment={handleUpdateCommentVoid}
        handleDeleteComment={handleDeleteCommentVoid}
      />
    );
  }

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
        handleRowClick={handleRowClick}
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
  );
};

export default MissionValidationPage;