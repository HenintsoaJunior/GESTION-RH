"use client";

import { ArrowLeft, FileText, Download, Eye, ChevronDown, X } from "lucide-react";
import styled from "styled-components";
import isPropValid from "@emotion/is-prop-valid";
import {
    SectionTitle,
    DetailSection,
    InfoGrid,
    InfoItem,
    InfoLabel,
    InfoValue,
    StatusBadge,
    IndemnityTable,
    TableHeader,
    TableCell,
    TotalRow,
} from "styles/generaliser/details-mission-container";
import { NoDataMessage } from "styles/generaliser/table-container";
import { formatNumber } from "utils/format";
import { useState, useEffect, useCallback, useMemo } from "react";
import { GetExpenseReportsByAssignationId, GetStatusByAssignationId } from "services/mission/expense";
import { fetchMissionAssignationById } from "services/mission/mission";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { handleFileView, handleFileDownload } from "utils/fileUtils";

ChartJS.register(ArcElement, Tooltip, Legend);

// === DESIGN MODERNE ===
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

// === STYLED COMPONENTS AMÉLIORÉS ===
const ModernCard = styled.div`
    background: ${COLORS.cardBg};
    padding: 24px;
    margin-bottom: 24px;
`;

const ResponsiveTableWrapper = styled.div`
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;

    @media (max-width: 768px) {
        font-size: 0.875rem;
    }
`;

const FolderContainer = styled.div`
    background: ${COLORS.cardBg};
    margin-bottom: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
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
    transition: all 0.2s ease;

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
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
`;

const ChartCard = styled(ModernCard)`
    display: flex;
    flex-direction: column;
    min-height: 300px;

    h4 {
        margin: 0 0 20px 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: ${COLORS.text.primary};
    }

    .chart-content {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 250px;
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: ${COLORS.cardBg};
    padding: 24px;
    border-radius: 8px;
    max-width: 90vw;
    max-height: 90vh;
    width: 800px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: ${COLORS.text.primary};
`;

const ModalCloseButton = styled(IconButton)`
    background: ${COLORS.background};
    &:hover {
        background: ${COLORS.border};
    }
`;

const ModalBody = styled.div`
    flex: 1;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
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
`;

const Badge = styled.span`
    display: inline-block;
    padding: 4px 12px;
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

// === PLUGIN CENTER TEXT (avec protection) ===
const centerTextPlugin = {
    id: "centerText",
    beforeDraw(chart) {
        // Vérification critique : ne s'exécute que si explicitement activé
        if (!chart.config.options?.plugins?.centerText?.display) {
            return;
        }
        
        const { ctx, chartArea } = chart;
        const text = chart.config.options?.plugins?.centerText?.text;
        
        // Vérifier que toutes les données nécessaires existent
        if (!ctx || !chartArea || !text) {
            return;
        }
        
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
        // Cleanup Blob URL when modal closes
        return () => {
            if (content.isBlobUrl && content.fileUrl) {
                window.URL.revokeObjectURL(content.fileUrl);
            }
        };
    }, [content.fileUrl, content.isBlobUrl]);

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>{content.fileName || "Prévisualisation"}</ModalTitle>
                    <ModalCloseButton onClick={onClose}>
                        <X size={20} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    {content.error ? (
                        <ErrorMessage>{content.error}</ErrorMessage>
                    ) : content.extension === "pdf" ? (
                        <FilePreview src={content.fileUrl} title={content.fileName} />
                    ) : (
                        <ImagePreview src={content.fileUrl} alt={content.fileName} />
                    )}
                </ModalBody>
            </ModalContent>
        </ModalOverlay>
    );
};

const EmployeeAttachments = ({ userName, attachments, isOpen, onToggle }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({});

    const uniqueAttachments = useMemo(() => {
        const fileNames = new Set();
        const unique = [];
        (attachments || []).forEach((att) => {
            if (att && att.fileName && !fileNames.has(att.fileName)) {
                fileNames.add(att.fileName);
                unique.push(att);
            }
        });
        return unique;
    }, [attachments]);

    return (
        <>
            <FolderContainer $isOpen={isOpen}>
                <FolderHeader onClick={onToggle} $isOpen={isOpen}>
                    <span className="folder-icon">📁</span>
                    <span>
                        {userName} · {uniqueAttachments.length} fichier{uniqueAttachments.length !== 1 ? "s" : ""}
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
                                Aucune pièce jointe
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
        const totals = {};
        (expenseReports || []).forEach((report) => {
            const type = report.type || "Autres";
            totals[type] = (totals[type] || 0) + (report.amount || 0);
        });
        return totals;
    }, [expenseReports]);

    const totalAmount = useMemo(
        () => (expenseReports || []).reduce((sum, report) => sum + (report.amount || 0), 0),
        [expenseReports]
    );

    // Enregistrer et désenregistrer le plugin avec le cycle de vie du composant
    useEffect(() => {
        if (!ChartJS.registry.plugins.get('centerText')) {
            ChartJS.register(centerTextPlugin);
        }
        
        return () => {
            ChartJS.unregister(centerTextPlugin);
        };
    }, []);

    const data = Object.values(typeTotals);
    const hasData = data.some((val) => val > 0);

    if (!hasData) return <p>Données insuffisantes</p>;

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
                position: "bottom",
                labels: {
                    boxWidth: 12,
                    padding: 15,
                    font: { size: 12 },
                },
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
                text: `${formatNumber(totalAmount)},00 MGA`,
            },
        },
        cutout: "65%",
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

// === COMPOSANT PRINCIPAL ===

const ExpenseReportList = ({ selectedAssignmentId, onBack, isLoading, formatDate, onError }) => {
    const [expenseReports, setExpenseReports] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [isLoadingReports, setIsLoadingReports] = useState(true);
    const [error, setError] = useState(null);
    const [openFolderId, setOpenFolderId] = useState(null);
    const [missionAssignation, setMissionAssignation] = useState(null);
    const [isLoadingAssignation, setIsLoadingAssignation] = useState({ missionAssignation: false });
    const [statuses, setStatuses] = useState([]);
    const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);

    const getExpenseReports = GetExpenseReportsByAssignationId();
    const getStatusByAssignationId = GetStatusByAssignationId();

    useEffect(() => {
        if (selectedAssignmentId) {
            fetchMissionAssignationById(selectedAssignmentId, setMissionAssignation, setIsLoadingAssignation, onError);
        }
    }, [selectedAssignmentId, onError]);

    const employeeInfo = useMemo(() => {
        if (!missionAssignation || !missionAssignation.employee) {
            return { id: missionAssignation?.employeeId || null, fullName: "N/A" };
        }
        const { employeeId, firstName, lastName } = missionAssignation.employee;
        return {
            id: employeeId,
            fullName: `${firstName || ""} ${lastName || ""}`.trim() || "N/A",
        };
    }, [missionAssignation]);

    const fetchStatuses = useCallback(async () => {
        if (!selectedAssignmentId) {
            setStatuses([]);
            return;
        }

        setIsLoadingStatuses(true);
        try {
            const response = await getStatusByAssignationId(selectedAssignmentId);
            setStatuses(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error("Error fetching statuses:", err);
            setStatuses([]);
        } finally {
            setIsLoadingStatuses(false);
        }
    }, [selectedAssignmentId, getStatusByAssignationId]);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);

    const isReimbursed = useMemo(() => {
        return statuses.length > 0 && statuses.every((status) => status.toLowerCase() === "reimbursed");
    }, [statuses]);

    const translateStatus = (isReimbursed) => {
        return isReimbursed ? "Remboursé" : "En attente";
    };

    const fetchExpenseReports = useCallback(async () => {
        if (!selectedAssignmentId) return;
        setIsLoadingReports(true);
        setError(null);
        try {
            const response = await getExpenseReports(selectedAssignmentId);
            console.log("API Response:", response);
            console.log(
                "Attachments:",
                response?.attachments?.map((att) => ({
                    fileName: att.fileName,
                    fileType: att.fileType,
                    fileContentType: Object.prototype.toString.call(att.fileContent),
                    fileContentSize: att.fileContent?.byteLength || att.fileContent?.length || 0,
                }))
            );
            if (response) {
                setExpenseReports(response.reports || []);
                setAttachments(response.attachments || []);
            } else {
                setExpenseReports([]);
                setAttachments([]);
            }
        } catch (err) {
            setError(err.message || "Erreur lors de la récupération des notes de frais.");
        } finally {
            setIsLoadingReports(false);
        }
    }, [selectedAssignmentId, getExpenseReports]);

    useEffect(() => {
        fetchExpenseReports();
    }, [fetchExpenseReports]);

    const groupedData = useMemo(() => {
        const groups = {};
        if (!expenseReports || !employeeInfo.id) return groups;
        groups[employeeInfo.id] = {
            userName: employeeInfo.fullName,
            reports: expenseReports,
            attachments: attachments,
        };
        return groups;
    }, [expenseReports, attachments, employeeInfo.id, employeeInfo.fullName]);

    const totalAmount = useMemo(
        () => (expenseReports || []).reduce((sum, report) => sum + (report.amount || 0), 0),
        [expenseReports]
    );

    const handleToggleFolder = (userId) => {
        setOpenFolderId((prevId) => (prevId === userId ? null : userId));
    };

    const isTotalLoading = isLoadingReports || isLoadingAssignation.missionAssignation || isLoadingStatuses;
    const hasData = expenseReports.length > 0 || attachments.length > 0;

    return (
        <>
            <div className="page-header">
                <div className="header-left">
                    <button onClick={onBack} className="btn-back">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-title-section">
                        <h1 className="page-title">Notes de Frais</h1>
                        <p className="page-subtitle">
                            Mission #{selectedAssignmentId} ·{" "}
                            {isLoadingAssignation.missionAssignation ? "Chargement..." : employeeInfo.fullName}
                        </p>
                    </div>
                </div>
            </div>

            {isTotalLoading ? (
                <NoDataMessage>⏳ Chargement des données...</NoDataMessage>
            ) : error ? (
                <NoDataMessage style={{ color: COLORS.danger }}>⚠️ {error}</NoDataMessage>
            ) : (
                <>
                    <DetailSection>
                        <SectionTitle>Informations Générales</SectionTitle>
                        <InfoGrid>
                            <InfoItem><InfoLabel>ID Assignation</InfoLabel><InfoValue>{selectedAssignmentId}</InfoValue></InfoItem>
                            <InfoItem>
                                <InfoLabel>Statut</InfoLabel>
                                <StatusBadge className={isReimbursed ? "success" : "pending"}>
                                    {translateStatus(isReimbursed).toUpperCase()}
                                </StatusBadge>
                            </InfoItem>
                            <InfoItem><InfoLabel>Employé</InfoLabel><InfoValue>{employeeInfo.fullName}</InfoValue></InfoItem>
                            <InfoItem><InfoLabel>Matricule</InfoLabel><InfoValue>{missionAssignation?.employee?.employeeCode || ""}</InfoValue></InfoItem>
                            <InfoItem><InfoLabel>Mission</InfoLabel><InfoValue>{missionAssignation?.mission?.name || ""}</InfoValue></InfoItem>
                            <InfoItem><InfoLabel>Lieu</InfoLabel><InfoValue>{missionAssignation?.mission?.lieu?.nom || ""}</InfoValue></InfoItem>
                            <InfoItem><InfoLabel>Date Départ</InfoLabel><InfoValue>{formatDate(missionAssignation?.departureDate)}</InfoValue></InfoItem>
                            <InfoItem><InfoLabel>Date Retour</InfoLabel><InfoValue>{formatDate(missionAssignation?.returnDate)}</InfoValue></InfoItem>
                            <InfoItem><InfoLabel>Durée</InfoLabel><InfoValue>{missionAssignation?.duration || 0} jours</InfoValue></InfoItem>
                            <InfoItem><InfoLabel>Total Montant</InfoLabel><InfoValue><strong>{totalAmount ? `${formatNumber(totalAmount)},00 ` : "0,00 "} MGA</strong></InfoValue></InfoItem>
                            <InfoItem><InfoLabel>Créée le</InfoLabel><InfoValue>{formatDate(missionAssignation?.createdAt)}</InfoValue></InfoItem>
                        </InfoGrid>
                    </DetailSection>

                    {hasData ? (
                        <>
                            <SectionTitle>Analyse Visuelle</SectionTitle>
                            <ChartGrid>
                                <ExpenseTypeDoughnutChart expenseReports={expenseReports} />
                            </ChartGrid>

                            {attachments.length > 0 && (
                                <>
                                    <SectionTitle>Pièces Jointes</SectionTitle>
                                    <ModernCard>
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
                                    </ModernCard>
                                </>
                            )}

                            {expenseReports.length > 0 && (
                                <>
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
                                                    <tr key={report.id || index}>
                                                        <TableCell>{report.titled || "-"}</TableCell>
                                                        <TableCell>{report.description || "-"}</TableCell>
                                                        <TableCell>
                                                            <Badge $type={report.type}>{report.type || "-"}</Badge>
                                                        </TableCell>
                                                        <TableCell>{report.currencyUnit || "MGA"}</TableCell>
                                                        <TableCell>{report.amount ? `${formatNumber(report.amount)},00 MGA` : "-"}</TableCell>
                                                        <TableCell>{report.rate ? `${formatNumber(report.rate)}` : "-"}</TableCell>
                                                    </tr>
                                                ))}
                                                <TotalRow>
                                                    <TableCell colSpan={4}>
                                                        <strong>Total</strong>
                                                    </TableCell>
                                                    <TableCell>
                                                        <strong>{totalAmount ? `${formatNumber(totalAmount)},00 MGA` : "0,00 MGA"}</strong>
                                                    </TableCell>
                                                    <TableCell></TableCell>
                                                </TotalRow>
                                            </tbody>
                                        </IndemnityTable>
                                    </ResponsiveTableWrapper>
                                </>
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
                </>
            )}
        </>
    );
};

export default ExpenseReportList;