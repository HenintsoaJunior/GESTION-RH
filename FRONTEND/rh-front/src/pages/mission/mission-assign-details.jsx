"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Download, ArrowLeft, Calendar, MapPin, Clock, User, Building, CreditCard } from "lucide-react";
import { formatDate } from "utils/generalisation";
import Alert from "components/alert";
import { fetchMissionPayment } from "services/mission/mission";
import "styles/mission/assignment-details-styles.css";

const AssignmentDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [indemnityDetails, setIndemnityDetails] = useState([]);
  const [isLoading, setIsLoading] = useState({
    missionPayment: true,
  });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });

  // Extract missionId and employeeId from query parameters
  const missionId = searchParams.get("missionId");
  const employeeId = searchParams.get("employeeId");
  const assignmentId = `${employeeId}-${missionId}`; // Construct assignmentId for display

  // Charger les détails de l'assignation et les indemnités
  useEffect(() => {
    const loadAssignmentDetails = async () => {
      if (!missionId || !employeeId) {
        setAlert({
          isOpen: true,
          type: "error",
          message: "Paramètres missionId ou employeeId manquants dans l'URL.",
        });
        setIsLoading((prev) => ({ ...prev, missionPayment: false }));
        return;
      }

      try {
        setIsLoading((prev) => ({ ...prev, missionPayment: true }));
        await fetchMissionPayment(
          missionId,
          employeeId,
          (data) => {
            setAssignment(data.assignmentDetails);
            setIndemnityDetails(data.indemnityDetails);
          },
          setIsLoading,
          setAlert
        );
      } catch (error) {
        setAlert({
          isOpen: true,
          type: "error",
          message: `Erreur lors du chargement des détails: ${error.message}`,
        });
      }
    };

    loadAssignmentDetails();
  }, [missionId, employeeId]);

  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "0";
  };

  const handleExportPDF = () => {
    setAlert({ isOpen: true, type: "info", message: "Exportation PDF en cours de développement." });
  };

  const getStatusBadge = (status) => {
    const statusClass =
      status === "En Cours"
        ? "status-progress"
        : status === "Planifié"
          ? "status-pending"
          : status === "Terminé"
            ? "status-approved"
            : "status-pending";
    return <span className={`status-badge ${statusClass}`}>{status || "Inconnu"}</span>;
  };

  const getDetailIcon = (label) => {
    switch (label) {
      case "Bénéficiaire":
      case "Matricule":
      case "Fonction":
        return <User className="detail-icon" />;
      case "Date de départ":
      case "Date de retour":
      case "Date de création":
        return <Calendar className="detail-icon" />;
      case "Heure de départ":
      case "Heure de retour":
      case "Durée de la mission":
        return <Clock className="detail-icon" />;
      case "Base":
      case "Destination":
        return <MapPin className="detail-icon" />;
      case "Direction":
      case "Département/Service":
        return <Building className="detail-icon" />;
      case "Centre de coût":
        return <CreditCard className="detail-icon" />;
      default:
        return null;
    }
  };

  return (
    <div className="assignment-details-container">
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      {/* Header avec bouton retour à gauche */}
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate("/mission/list")} className="btn-back" title="Retour à la liste">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="header-title-section">
            <h1 className="page-title">Détails de l'Assignation</h1>
            <p className="page-subtitle">Mission #{assignmentId}</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handleExportPDF} className="btn-export-pdf" title="Exporter en PDF">
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={() => setAlert({ isOpen: true, type: "info", message: "Exportation Excel en cours de développement." })}
            className="btn-export-excel"
            title="Exporter en Excel"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {isLoading.missionPayment ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Chargement des détails...</p>
        </div>
      ) : assignment ? (
        <>
          {/* Informations générales */}
          <div className="info-section">
            <div className="section-header">
              <h2 className="section-title">Informations Générales</h2>
              <div className="status-container">{getStatusBadge(assignment.status)}</div>
            </div>

            <div className="details-grid">
              {[
                { label: "Bénéficiaire", value: assignment.beneficiary },
                { label: "Matricule", value: assignment.matricule },
                { label: "Mission", value: assignment.missionTitle },
                { label: "Fonction", value: assignment.function },
                { label: "Base", value: assignment.base },
                { label: "Moyen de transport", value: assignment.meansOfTransport },
                { label: "Direction", value: assignment.direction },
                { label: "Département/Service", value: assignment.departmentService },
                { label: "Centre de coût", value: assignment.costCenter },
                { label: "Date de départ", value: formatDate(assignment.departureDate) },
                { label: "Heure de départ", value: assignment.departureTime || "Non spécifié" },
                { label: "Durée de la mission", value: `${assignment.missionDuration || "N/A"} jours` },
                { label: "Date de retour", value: formatDate(assignment.returnDate) || "Non spécifié" },
                { label: "Heure de retour", value: assignment.returnTime || "Non spécifié" },
                { label: "Date de création", value: formatDate(assignment.createdAt) || "Non spécifié" },
              ].map((item, index) => (
                <div key={index} className="detail-card">
                  <div className="detail-header">
                    {getDetailIcon(item.label)}
                    <span className="detail-label">{item.label}</span>
                  </div>
                  <span className="detail-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tableau des indemnités */}
          <div className="indemnity-section">
            <div className="section-header">
              <h2 className="section-title">Régularisation des Indemnités de Mission</h2>
            </div>

            <div className="table-wrapper">
              <div className="table-container">
                <table className="indemnity-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Transport</th>
                      <th>Petit Déjeuner</th>
                      <th>Déjeuner</th>
                      <th>Dîner</th>
                      <th>Hébergement</th>
                      <th>Montant Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indemnityDetails.map((item, index) => (
                      <tr key={index} className={index === indemnityDetails.length - 1 ? "total-row" : ""}>
                        <td className="date-cell">
                          {item.date
                            ? new Date(item.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "2-digit",
                              })
                            : ""}
                        </td>
                        <td className="amount-cell">{item.transport ? `${formatNumber(item.transport)},00` : ""}</td>
                        <td className="amount-cell">{item.breakfast ? `${formatNumber(item.breakfast)},00` : ""}</td>
                        <td className="amount-cell">{item.lunch ? `${formatNumber(item.lunch)},00` : ""}</td>
                        <td className="amount-cell">{item.dinner ? `${formatNumber(item.dinner)},00` : ""}</td>
                        <td className="amount-cell">
                          {item.accommodation ? `${formatNumber(item.accommodation)},00` : ""}
                        </td>
                        <td className="total-cell">{item.total ? `${formatNumber(item.total)},00` : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="no-data-container">
          <div className="no-data-content">
            <p className="no-data-text">Aucune donnée trouvée pour cette assignation.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetails;