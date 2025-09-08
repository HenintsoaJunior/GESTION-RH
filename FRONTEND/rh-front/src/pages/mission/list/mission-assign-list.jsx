"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileText, Download, ArrowLeft } from "lucide-react";
import { formatDate } from "utils/dateConverter";
import Alert from "components/alert";
import Pagination from "components/pagination";
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
  PopupActions,
  ButtonPrimary,
  ButtonSecondary,
} from "styles/generaliser/popup-container";
import {
  CardsContainer,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardField,
  CardLabel,
  EmptyCardsState,
} from "styles/generaliser/card-container";
import { NoDataMessage } from "styles/generaliser/table-container";
import "styles/generic-table-styles.css";
import {
  fetchAssignMission,
  fetchMissionById,
  exportMissionAssignationPDF,
  exportMissionAssignationExcel,
} from "services/mission/mission";

const AssignedPersonsList = ({ missionId, onClose }) => {
  const navigate = useNavigate();
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [missionDetails, setMissionDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState({
    assignMissions: false,
    mission: false,
    exportPDF: false,
    exportExcel: false,
  });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });

  useEffect(() => {
    if (!missionId) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Aucun ID de mission fourni.",
      });
      return;
    }

    fetchMissionById(missionId, setMissionDetails, setIsLoading, (error) =>
      setAlert(error)
    );

    fetchAssignMission(
      setAssignedPersons,
      setIsLoading,
      setTotalEntries,
      { missionId },
      currentPage,
      pageSize,
      (error) => setAlert(error)
    );
  }, [missionId, currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleCardClick = (employeeId) => {
    if (missionId && employeeId) {
      navigate(`/assignments/details?missionId=${missionId}&employeeId=${employeeId}`);
    } else {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Informations manquantes pour accéder aux détails.",
      });
    }
  };

  const handleGoBack = () => {
    onClose();
  };

  const handleExportPDF = () => {
    const exportFilters = { missionId };

    exportMissionAssignationPDF(
      exportFilters,
      setIsLoading,
      (success) => setAlert(success),
      (error) => setAlert(error)
    );
  };

  const handleExportExcel = () => {
    const exportFilters = { missionId };

    exportMissionAssignationExcel(
      exportFilters,
      setIsLoading,
      (success) => setAlert(success),
      (error) => setAlert(error)
    );
  };

  const getStatusBadge = (status) => {
    const statusClass =
      status === "En Cours"
        ? "status-progress"
        : status === "Planifié"
        ? "status-pending"
        : status === "Terminé"
        ? "status-approved"
        : status === "Annulé"
        ? "status-cancelled"
        : "status-pending";
    return <span className={`status-badge ${statusClass}`}>{status || "Inconnu"}</span>;
  };

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>
            Personnes Assignées à la Mission {missionId}
            {assignedPersons.length > 0 && (
              <span className="assignments-count">
                ({assignedPersons.length} assignation
                {assignedPersons.length > 1 ? "s" : ""})
              </span>
            )}
          </PopupTitle>
          <PopupClose onClick={onClose} title="Fermer">
            <X />
          </PopupClose>
        </PopupHeader>

        <PopupContent>
          <Alert
            type={alert.type}
            message={alert.message}
            isOpen={alert.isOpen}
            onClose={() => setAlert({ ...alert, isOpen: false })}
          />

          {/* Cards Section */}
          <CardsContainer>
            {isLoading.assignMissions ? (
              <EmptyCardsState>
                <NoDataMessage>Chargement des assignations...</NoDataMessage>
              </EmptyCardsState>
            ) : assignedPersons.length > 0 ? (
              assignedPersons.map((assignment, index) => (
                <Card
                  key={`${assignment.employeeId}-${missionId}-${index}`}
                  onClick={() => handleCardClick(assignment.employeeId)}
                  style={{
                    border: "1px solid var(--border-light)",
                    cursor: "pointer",
                    opacity: 1,
                  }}
                >
                  <CardHeader
                    style={{
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <CardTitle>
                      {assignment.beneficiary && assignment.directionAcronym
                        ? `${assignment.beneficiary} (${assignment.directionAcronym})`
                        : assignment.beneficiary || "Non spécifié"}
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "var(--spacing-md)",
                      }}
                    >
                      <CardField>
                        <CardLabel>N° Assignation</CardLabel>
                        <div>{assignment.assignationId || "Non spécifié"}</div>
                      </CardField>
                      <CardField>
                        <CardLabel>Matricule</CardLabel>
                        <div>{assignment.matricule || "Non spécifié"}</div>
                      </CardField>
                      <CardField>
                        <CardLabel>Fonction</CardLabel>
                        <div>{assignment.function || "Non spécifié"}</div>
                      </CardField>
                      <CardField>
                        <CardLabel>Base</CardLabel>
                        <div>{assignment.base || "Non spécifié"}</div>
                      </CardField>
                      <CardField>
                        <CardLabel>Lieu</CardLabel>
                        <div>{assignment.lieu || "Non spécifié"}</div>
                      </CardField>
                      <CardField>
                        <CardLabel>Statut</CardLabel>
                        <div>{getStatusBadge(assignment.status)}</div>
                      </CardField>
                      <CardField>
                        <CardLabel>Date début</CardLabel>
                        <div>{formatDate(assignment.startDate) || "Non spécifié"}</div>
                      </CardField>
                      <CardField>
                        <CardLabel>Date fin</CardLabel>
                        <div>{formatDate(assignment.endDate) || "Non spécifié"}</div>
                      </CardField>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <EmptyCardsState>
                <NoDataMessage>
                  Aucune personne assignée à la mission {missionId || "inconnue"}.
                </NoDataMessage>
              </EmptyCardsState>
            )}
          </CardsContainer>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalEntries={totalEntries}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            disabled={isLoading.assignMissions}
          />
        </PopupContent>

        <PopupActions>
          <ButtonSecondary onClick={onClose}>Fermer</ButtonSecondary>
        </PopupActions>
      </PagePopup>
    </PopupOverlay>
  );
};

export default AssignedPersonsList;