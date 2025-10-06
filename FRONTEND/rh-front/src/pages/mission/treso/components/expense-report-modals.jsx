"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FileText, Download, Eye, ChevronDown, X, CheckCircle } from "lucide-react";
import styled from "styled-components";
import isPropValid from "@emotion/is-prop-valid";
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  CloseButton,
  PopupContent,
  DetailSection,
  SectionTitle,
  IndemnityTable,
  TableHeader,
  TableCell,
  TotalRow,
  PopupActions,
  ButtonPrimary,
  ButtonSecondary,
} from "styles/generaliser/details-mission-container";
import { NoDataMessage } from "styles/generaliser/table-container";
import { formatNumber } from "utils/format";
import { GetExpenseReportsByAssignationId, ReimburseByAssignationId, GetStatusByAssignationId } from "services/mission/expense";
import { fetchMissionAssignationById } from "services/mission/mission";
import { handleFileView, handleFileDownload } from "utils/fileUtils";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Alert from "components/alert";
import Modal from "components/modal";

ChartJS.register(ArcElement, Tooltip, Legend);

// === COULEURS ET STYLES ===
const COLORS = {
  primary: "#4F46E5",
  primaryHover: "#4338CA",
  secondary: "#10B981",
  accent: "#F59E0B",
  danger: "#EF4444",
  background: "#F9FAFB",
  cardBg: "#FFFFFF",
  border: "#E5E7EB",
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    light: "#9CA3AF",
  },
  folder: {
    bg: "#FEF3C7",
    border: "#F59E0B",
    hover: "#FDE68A",
  },
};

// === STYLED COMPONENTS ===
const FolderContainer = styled.div`
  background: ${COLORS.cardBg};
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid ${COLORS.border};
`;

const FolderHeader = styled.button.withConfig({
  shouldForwardProp: (prop) => isPropValid(prop) && !prop.startsWith('$'),
})`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${(props) => (props.$isOpen ? COLORS.folder.bg : "transparent")};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.text.primary};

  &:hover {
    background: ${COLORS.folder.hover};
  }

  .folder-icon {
    font-size: 1.5rem;
  }

  .chevron {
    margin-left: auto;
    transition: transform 0.3s ease;
    transform: ${(props) => (props.$isOpen ? "rotate(0deg)" : "rotate(-90deg)")};
  }
`;

const AttachmentsList = styled.div`
  padding: 8px;
  background: ${COLORS.background};
  border-top: 1px solid ${COLORS.border};
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${COLORS.cardBg};
  margin-bottom: 8px;
  border: 1px solid ${COLORS.border};

  &:hover {
    transform: translateX(4px);
  }

  .file-info {
    flex: 1;
    min-width: 0;

    .file-name {
      font-weight: 500;
      color: ${COLORS.text.primary};
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-size {
      font-size: 0.75rem;
      color: ${COLORS.text.secondary};
    }
  }

  .actions {
    display: flex;
    gap: 8px;
  }
`;

const IconButton = styled.button.withConfig({
  shouldForwardProp: (prop) => isPropValid(prop) && !prop.startsWith('$'),
})`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: ${(props) => (props.$variant === "primary" ? COLORS.primary : COLORS.background)};
  color: ${(props) =>
    props.$variant === "primary" ? "white" : props.$download ? COLORS.primary : COLORS.text.primary};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$variant === "primary" ? COLORS.primaryHover : COLORS.border)};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ChartCard = styled.div`
  padding: 20px;
  background: ${COLORS.cardBg};
  border: 1px solid ${COLORS.border};
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;

  h4 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.1rem;
    color: ${COLORS.text.primary};
    text-align: center;
  }

  .chart-content {
    width: 100%;
    max-width: 300px;
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const FilePreview = styled.iframe`
  width: 100%;
  height: 500px;
  border: none;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
`;

const ErrorMessage = styled.p`
  color: ${COLORS.danger};
  text-align: center;
  font-size: 1rem;
  padding: 20px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => {
    const colors = {
      Transport: "#DBEAFE",
      Hébergement: "#FEF3C7",
      Restauration: "#D1FAE5",
      Autres: "#F3E8FF",
    };
    return colors[props.$type] || "#F3F4F6";
  }};
  color: ${COLORS.text.primary};
`;

const ResponsiveTableWrapper = styled.div`
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

// === PLUGIN CENTER TEXT ===
const centerTextPlugin = {
  id: "centerText",
  beforeDraw(chart) {
    if (!chart.config.options?.plugins?.centerText?.display) return;
    const { ctx, chartArea } = chart;
    const text = chart.config.options?.plugins?.centerText?.text;
    if (!ctx || !chartArea || !text) return;
    ctx.save();
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = COLORS.text.primary;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    ctx.fillText(text, centerX, centerY);
    ctx.restore();
  },
};

// === COMPOSANTS ===
const FilePreviewModal = ({ isOpen, onClose, content }) => {
  useEffect(() => {
    return () => {
      if (content?.isBlobUrl && content?.fileUrl) {
        try {
          window.URL.revokeObjectURL(content.fileUrl);
        } catch (e) {
          console.error("Error revoking blob URL:", e);
        }
      }
    };
  }, [content]);

  if (!isOpen) return null;

  return (
    <PopupOverlay onClick={onClose}>
      <PagePopup onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px" }}>
        <PopupHeader>
          <PopupTitle>{content?.fileName || "Prévisualisation"}</PopupTitle>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </PopupHeader>
        <PopupContent>
          {content?.error ? (
            <ErrorMessage>{content.error}</ErrorMessage>
          ) : content?.extension === "pdf" ? (
            <FilePreview src={content.fileUrl} title={content.fileName} />
          ) : (
            <ImagePreview src={content.fileUrl} alt={content.fileName} />
          )}
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
};

const EmployeeAttachments = ({ userName, attachments, isOpen, onToggle }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});

  const uniqueAttachments = useMemo(() => {
    if (!Array.isArray(attachments)) return [];
    const fileNames = new Set();
    const unique = [];
    attachments.forEach((att) => {
      if (att && att.fileName && !fileNames.has(att.fileName)) {
        fileNames.add(att.fileName);
        unique.push(att);
      }
    });
    return unique;
  }, [attachments]);

  return (
    <>
      <FolderContainer>
        <FolderHeader onClick={onToggle} $isOpen={isOpen}>
          <span className="folder-icon">📁</span>
          <span>
            {userName || "Employé"} · {uniqueAttachments.length} fichier{uniqueAttachments.length !== 1 ? "s" : ""}
          </span>
          <ChevronDown className="chevron" size={20} />
        </FolderHeader>
        {isOpen && (
          <AttachmentsList>
            {uniqueAttachments.length > 0 ? (
              uniqueAttachments.map((att, index) => (
                <AttachmentItem key={att.fileName || index}>
                  <FileText size={24} color={COLORS.primary} />
                  <div className="file-info">
                    <div className="file-name">{att.fileName || "Fichier sans nom"}</div>
                    <div className="file-size">{att.fileSize || 0} Ko</div>
                  </div>
                  <div className="actions">
                    <IconButton
                      onClick={() =>
                        handleFileView(
                          att.fileContent,
                          att.fileName,
                          att.fileType,
                          setModalContent,
                          setModalOpen
                        )
                      }
                      title="Prévisualiser"
                    >
                      <Eye size={16} />
                    </IconButton>
                    <IconButton
                      $download
                      onClick={() => handleFileDownload(att.fileContent, att.fileName)}
                      title="Télécharger"
                    >
                      <Download size={16} />
                    </IconButton>
                  </div>
                </AttachmentItem>
              ))
            ) : (
              <p style={{ padding: "16px", textAlign: "center", color: COLORS.text.secondary }}>
                Aucune pièce jointe disponible
              </p>
            )}
          </AttachmentsList>
        )}
      </FolderContainer>
      <FilePreviewModal isOpen={modalOpen} onClose={() => setModalOpen(false)} content={modalContent} />
    </>
  );
};

const ExpenseTypeDoughnutChart = ({ expenseReports }) => {
  const typeTotals = useMemo(() => {
    if (!Array.isArray(expenseReports)) return {};
    const totals = {};
    expenseReports.forEach((report) => {
      if (!report) return;
      const type = report.type || "Autres";
      totals[type] = (totals[type] || 0) + (Number(report.amount) || 0);
    });
    return totals;
  }, [expenseReports]);

  const totalAmount = useMemo(() => {
    if (!Array.isArray(expenseReports)) return 0;
    return expenseReports.reduce((sum, report) => sum + (Number(report?.amount) || 0), 0);
  }, [expenseReports]);

  useEffect(() => {
    if (!ChartJS.registry.plugins.get('centerText')) {
      ChartJS.register(centerTextPlugin);
    }
    return () => {
      try {
        ChartJS.unregister(centerTextPlugin);
      } catch (e) {}
    };
  }, []);

  const data = Object.values(typeTotals);
  const hasData = data.length > 0 && data.some((val) => val > 0);

  if (!hasData) {
    return (
      <ChartCard>
        <h4>Répartition par Type</h4>
        <div className="chart-content">
          <p style={{ color: COLORS.text.secondary }}>Aucune donnée à afficher</p>
        </div>
      </ChartCard>
    );
  }

  const chartData = {
    labels: Object.keys(typeTotals),
    datasets: [
      {
        data: data,
        backgroundColor: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
        hoverBackgroundColor: ["#4338CA", "#059669", "#D97706", "#DC2626", "#7C3AED"],
        borderColor: "#FFFFFF",
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: { boxWidth: 10, padding: 10 },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw || 0;
            const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${formatNumber(value)},00 MGA (${percentage}%)`;
          },
        },
      },
      centerText: {
        display: true,
        text: `${formatNumber(totalAmount)},00`,
      },
    },
    cutout: "70%",
  };

  return (
    <ChartCard>
      <h4>Répartition par Type</h4>
      <div className="chart-content">
        <Doughnut data={chartData} options={options} />
      </div>
    </ChartCard>
  );
};

const ExpenseReportModals = ({
  alert,
  setAlert,
  showDetailsExpenseReport,
  setShowDetailsExpenseReport,
  selectedAssignationId,
  formatDate,
  onUpdateSuccess,
}) => {
  const [expenseReports, setExpenseReports] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [error, setError] = useState(null);
  const [openFolderId, setOpenFolderId] = useState(null);
  const [missionAssignation, setMissionAssignation] = useState(null);
  const [isLoadingAssignation, setIsLoadingAssignation] = useState({ missionAssignation: false });
  const [actionCompleted, setActionCompleted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);

  const getExpenseReports = GetExpenseReportsByAssignationId();
  const reimburseByAssignationId = ReimburseByAssignationId();
  const getStatusByAssignationId = GetStatusByAssignationId();

  // Charger les données de la mission
  useEffect(() => {
    if (!selectedAssignationId || !showDetailsExpenseReport) return;

    const loadMissionAssignation = async () => {
      try {
        await fetchMissionAssignationById(
          selectedAssignationId,
          setMissionAssignation,
          setIsLoadingAssignation,
          (err) => {
            console.error("Error fetching mission assignation:", err);
            setAlert?.({
              isOpen: true,
              type: "error",
              message: err?.message || "Erreur lors de la récupération des données de mission.",
            });
          }
        );
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    loadMissionAssignation();
  }, [selectedAssignationId, showDetailsExpenseReport, setAlert]);

  // Charger les statuts
  const fetchStatuses = useCallback(async () => {
    if (!selectedAssignationId) {
      setStatuses([]);
      return;
    }

    setIsLoadingStatuses(true);
    try {
      const response = await getStatusByAssignationId(selectedAssignationId);
      setStatuses(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error fetching statuses:", err);
      const errorMessage = err?.message || "Erreur lors de la récupération des statuts.";
      setAlert?.({ isOpen: true, type: "error", message: errorMessage });
      setStatuses([]);
    } finally {
      setIsLoadingStatuses(false);
    }
  }, [selectedAssignationId, getStatusByAssignationId, setAlert]);

  // Informations de l'employé
  const employeeInfo = useMemo(() => {
    if (!missionAssignation?.employee) {
      return { id: missionAssignation?.employeeId || null, fullName: "Employé non identifié" };
    }
    const { employeeId, firstName, lastName } = missionAssignation.employee;
    const fullName = `${firstName || ""} ${lastName || ""}`.trim();
    return { id: employeeId, fullName: fullName || "Employé non identifié" };
  }, [missionAssignation]);

  // Vérifier si tous les statuts sont "reimbursed"
  const isReimbursed = useMemo(() => {
    return statuses.length > 0 && statuses.every((status) => status.toLowerCase() === "reimbursed");
  }, [statuses]);

  // Charger les notes de frais
  const fetchExpenseReports = useCallback(async () => {
    if (!selectedAssignationId) {
      setExpenseReports([]);
      setAttachments([]);
      return;
    }

    setIsLoadingReports(true);
    setError(null);

    try {
      const response = await getExpenseReports(selectedAssignationId);
      if (response && typeof response === "object") {
        setExpenseReports(Array.isArray(response.reports) ? response.reports : []);
        setAttachments(Array.isArray(response.attachments) ? response.attachments : []);
      } else {
        setExpenseReports([]);
        setAttachments([]);
      }
    } catch (err) {
      console.error("Error fetching expense reports:", err);
      const errorMessage = err?.message || "Erreur lors de la récupération des notes de frais.";
      setError(errorMessage);
      setAlert?.({ isOpen: true, type: "error", message: errorMessage });
      setExpenseReports([]);
      setAttachments([]);
    } finally {
      setIsLoadingReports(false);
    }
  }, [selectedAssignationId, getExpenseReports, setAlert]);

  useEffect(() => {
    if (showDetailsExpenseReport && selectedAssignationId) {
      fetchExpenseReports();
      fetchStatuses();
    }
  }, [showDetailsExpenseReport, selectedAssignationId, fetchExpenseReports, fetchStatuses]);

  // Grouper les données par employé
  const groupedData = useMemo(() => {
    const groups = {};
    if (!employeeInfo.id) return groups;
    groups[employeeInfo.id] = {
      userName: employeeInfo.fullName,
      reports: Array.isArray(expenseReports) ? expenseReports : [],
      attachments: Array.isArray(attachments) ? attachments : [],
    };
    return groups;
  }, [expenseReports, attachments, employeeInfo]);

  // Calculer le montant total
  const totalAmount = useMemo(() => {
    if (!Array.isArray(expenseReports)) return 0;
    return expenseReports.reduce((sum, report) => {
      const amount = Number(report?.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  }, [expenseReports]);

  const handleToggleFolder = useCallback((userId) => {
    setOpenFolderId((prevId) => (prevId === userId ? null : userId));
  }, []);

  const handleClose = useCallback(() => {
    setShowDetailsExpenseReport(false);
    setAlert?.({ isOpen: false, type: "info", message: "" });
    setTimeout(() => {
      setExpenseReports([]);
      setAttachments([]);
      setMissionAssignation(null);
      setError(null);
      setOpenFolderId(null);
      setActionCompleted(false);
      setShowConfirmModal(false);
      setStatuses([]);
    }, 300);
  }, [setShowDetailsExpenseReport, setAlert]);

  const handleValidateClick = () => {
    setShowConfirmModal(true);
  };

  const confirmValidate = async () => {
    try {
      if (!selectedAssignationId || !employeeInfo.id) {
        throw new Error("Assignation ID ou User ID manquant.");
      }
      await reimburseByAssignationId(selectedAssignationId, employeeInfo.id);
      const message = "Les notes de frais ont été validées avec succès.";
      setAlert({ type: "success", message, isOpen: true });
      setShowConfirmModal(false);
      setActionCompleted(true);
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
      // Recharger les données pour mettre à jour le statut
      await Promise.all([fetchExpenseReports(), fetchStatuses()]);
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      setAlert({
        type: "error",
        message: error.message || "Erreur lors de la validation des notes de frais",
        isOpen: true,
      });
      setShowConfirmModal(false);
    }
  };

  const isTotalLoading = isLoadingReports || isLoadingAssignation.missionAssignation || isLoadingStatuses;
  const hasData = expenseReports.length > 0 || attachments.length > 0;

  if (!showDetailsExpenseReport) return null;

  return (
    <PopupOverlay role="dialog" aria-labelledby="expense-details-title" aria-modal="true">
      <PagePopup onClick={(e) => e.stopPropagation()} style={{ maxWidth: "1100px", padding: "0" }}>
        <PopupHeader style={{ padding: "20px 30px", borderBottom: `1px solid ${COLORS.border}` }}>
          <PopupTitle id="expense-details-title" style={{ fontSize: "1.6rem" }}>
            <FileText size={24} style={{ marginRight: "10px", verticalAlign: "middle" }} />
            {actionCompleted && !alert.isOpen ? "Validation effectuée" : `Détails des Notes de Frais N° ${selectedAssignationId}`}
          </PopupTitle>
          <CloseButton onClick={handleClose} aria-label="Fermer la fenêtre" title="Fermer la fenêtre">
            <X size={24} />
          </CloseButton>
        </PopupHeader>

        <PopupContent style={{ padding: "30px", background: COLORS.background }}>
          <Alert
            type={alert.type}
            message={alert.message}
            isOpen={alert.isOpen}
            onClose={() => setAlert({ ...alert, isOpen: false })}
          />

          {isTotalLoading ? (
            <NoDataMessage>⏳ Chargement des données...</NoDataMessage>
          ) : error ? (
            <NoDataMessage style={{ color: COLORS.danger }}>⚠️ {error}</NoDataMessage>
          ) : actionCompleted && !alert.isOpen ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <CheckCircle size={48} color={COLORS.secondary} style={{ marginBottom: "20px" }} />
              <h3>Validation effectuée avec succès !</h3>
              <p>Les notes de frais ont été validées. Veuillez fermer cette fenêtre.</p>
              <button
                onClick={handleClose}
                className="btn-primary"
                style={{
                  padding: "10px 20px",
                  background: COLORS.secondary,
                  color: "white",
                  border: "none",
                  marginTop: "20px",
                }}
              >
                Fermer
              </button>
            </div>
          ) : hasData ? (
            <>
              <DetailSection>
                <SectionTitle>Analyse Visuelle</SectionTitle>
                <ChartGrid>
                  <ExpenseTypeDoughnutChart expenseReports={expenseReports} />
                </ChartGrid>
              </DetailSection>

              {attachments.length > 0 && (
                <DetailSection>
                  <SectionTitle>Pièces Jointes</SectionTitle>
                  {Object.keys(groupedData).map((userId) => {
                    const employeeData = groupedData[userId];
                    return (
                      <EmployeeAttachments
                        key={userId}
                        userName={employeeData.userName}
                        attachments={employeeData.attachments}
                        isOpen={openFolderId === userId}
                        onToggle={() => handleToggleFolder(userId)}
                      />
                    );
                  })}
                </DetailSection>
              )}

              {expenseReports.length > 0 && (
                <DetailSection>
                  <SectionTitle>Détail des Frais</SectionTitle>
                  <ResponsiveTableWrapper>
                    <IndemnityTable>
                      <thead>
                        <tr>
                          <TableHeader>Titre</TableHeader>
                          <TableHeader>Description</TableHeader>
                          <TableHeader>Type</TableHeader>
                          <TableHeader>Devise</TableHeader>
                          <TableHeader>Montant</TableHeader>
                          <TableHeader>Taux</TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        {expenseReports.map((report, index) => (
                          <tr key={report?.id || index}>
                            <TableCell>{report?.titled || "-"}</TableCell>
                            <TableCell>{report?.description || "-"}</TableCell>
                            <TableCell>
                              <Badge $type={report?.type}>{report?.type || "Non spécifié"}</Badge>
                            </TableCell>
                            <TableCell>{report?.currencyUnit || "MGA"}</TableCell>
                            <TableCell>
                              {report?.amount ? `${formatNumber(Number(report.amount))},00` : "0,00"}
                            </TableCell>
                            <TableCell>
                              {report?.rate ? formatNumber(Number(report.rate)) : "-"}
                            </TableCell>
                          </tr>
                        ))}
                        <TotalRow>
                          <TableCell colSpan={4}>
                            <strong>Total</strong>
                          </TableCell>
                          <TableCell>
                            <strong>{formatNumber(totalAmount)},00</strong>
                          </TableCell>
                          <TableCell></TableCell>
                        </TotalRow>
                      </tbody>
                    </IndemnityTable>
                  </ResponsiveTableWrapper>
                </DetailSection>
              )}
            </>
          ) : (
            <NoDataMessage>
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
                <p style={{ margin: 0, color: COLORS.text.secondary }}>
                  Aucune note de frais disponible pour cette mission
                </p>
              </div>
            </NoDataMessage>
          )}
        </PopupContent>

        {!actionCompleted && hasData && (
          <div style={{ padding: "20px 30px", display: "flex", gap: "10px" }}>
            <button
              onClick={handleValidateClick}
              className="btn-primary"
              disabled={isReimbursed}
              style={{
                padding: "10px 20px",
                background: isReimbursed ? COLORS.text.light : COLORS.secondary,
                color: "white",
                border: "none",
                opacity: isReimbursed ? 0.6 : 1,
                cursor: isReimbursed ? "not-allowed" : "pointer",
              }}
            >
              Valider
            </button>
            <button
              onClick={handleClose}
              style={{
                padding: "10px 20px",
                background: COLORS.text.secondary,
                color: "white",
                border: "none",
              }}
            >
              Fermer
            </button>
          </div>
        )}

        <Modal
          type="success"
          message="Êtes-vous sûr de vouloir valider ces notes de frais ? Cette action est irréversible."
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirmer la validation"
        >
          <PopupActions>
            <ButtonSecondary onClick={() => setShowConfirmModal(false)}>Annuler</ButtonSecondary>
            <ButtonPrimary onClick={confirmValidate}>Confirmer</ButtonPrimary>
          </PopupActions>
        </Modal>
      </PagePopup>
    </PopupOverlay>
  );
};

export default ExpenseReportModals;