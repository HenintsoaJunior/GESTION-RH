"use client";

import { FileText, Download, Eye, ChevronDown, X } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
    SectionTitle,
    IndemnityTable,
    TableHeader,
    TableCell,
    TotalRow,
    Separator,
    ModernCard,
    TwoColumnLayout,
    ResponsiveTableWrapper,
    FolderContainer,
    FolderHeader,
    AttachmentsList,
    AttachmentItem,
    IconButton,
    ChartCard,
    ModalOverlay,
    ModalContentStyled,
    ModalHeader,
    ModalTitle,
    ModalCloseButton,
    ModalBody,
    FilePreview,
    ImagePreview,
    ErrorMessage,
    centerTextPlugin,
    Badge,
} from "@/styles/detailsmission-styles";
import { NoDataMessage } from "@/styles/table-styles";
import { formatNumber } from "@/utils/format";
import { useExpenseReportsByAssignationId, useStatusByAssignationId } from "@/api/mission/expense/services";
import { useGetMissionAssignationByAssignationId } from "@/api/mission/services";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { TooltipItem, ChartOptions } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { handleFileView, handleFileDownload } from "@/utils/file-utils";
import type { MissionAssignation } from "@/api/mission/services"; 

ChartJS.register(ArcElement, Tooltip, Legend);

interface ApiResponse<T> {
    status: number;
    data?: T;
    message?: string;
}

interface Props {
    selectedAssignmentId?: string;
    isLoading: boolean;
    onError: (error: Error) => void;
}

interface ExpenseLine {
    expenseReportId?: string;
    titled?: string;
    description?: string;
    type?: string;
    currencyUnit?: string;
    amount?: number;
    amountMGA?: number;
    rate?: number;
}

interface Attachment {
    fileName?: string;
    fileSize?: number;
    fileContent?: string;
    fileType?: string;
}

interface FullExpenseResponse {
    reports: ExpenseLine[];
    totalAmount?: number;
    attachments: Attachment[];
}

interface ModalContent {
    fileName?: string;
    fileUrl?: string;
    isBlobUrl?: boolean;
    extension?: string;
    error?: string;
}

// === COMPOSANTS ===

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: ModalContent;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, content }) => {
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
        <ModalOverlay onClick={onClose}>
            <ModalContentStyled onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>{content.fileName || "Prévisualisation"}</ModalTitle>
                    <ModalCloseButton onClick={onClose} $variant="primary">
                        <X size={20} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    {content.error ? (
                        <ErrorMessage>{content.error}</ErrorMessage>
                    ) : content.extension === "pdf" ? (
                        <FilePreview src={content.fileUrl} title={content.fileName} />
                    ) : (
                        <ImagePreview src={content.fileUrl} alt={content.fileName || ""} />
                    )}
                </ModalBody>
            </ModalContentStyled>
        </ModalOverlay>
    );
};

interface EmployeeAttachmentsProps {
    userName: string;
    attachments: Attachment[];
    isOpen: boolean;
    onToggle: () => void;
}

const EmployeeAttachments: React.FC<EmployeeAttachmentsProps> = ({ userName, attachments, isOpen, onToggle }) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<ModalContent>({});

    const uniqueAttachments = useMemo((): Attachment[] => {
        const fileNames = new Set<string>();
        const unique: Attachment[] = [];
        (attachments || []).forEach((att) => {
            if (att && att.fileName && !fileNames.has(att.fileName)) {
                fileNames.add(att.fileName);
                unique.push(att);
            }
        });
        return unique;
    }, [attachments]);

    const handlePreview = useCallback((att: Attachment) => {
        handleFileView(
            att.fileContent || "",
            att.fileName || "",
            (content: ModalContent | null) => setModalContent(content || {}),
            setModalOpen,
            att.fileType
        );
    }, [setModalContent, setModalOpen]);

    return (
        <>
            <FolderContainer>
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
                                    <FileText size={24} color="var(--primary-color)" />
                                    <div className="file-info">
                                        <div className="file-name">{att.fileName || "Fichier sans nom"}</div>
                                        <div className="file-size">{(att.fileSize || 0).toLocaleString()} Ko</div>
                                    </div>
                                    <div className="actions">
                                        <IconButton
                                            onClick={() => handlePreview(att)}
                                            title="Prévisualiser"
                                            $variant="primary"
                                        >
                                            <Eye size={16} />
                                        </IconButton>
                                        <IconButton
                                            $download
                                            onClick={() => handleFileDownload(att.fileContent || "", att.fileName || "")}
                                            title="Télécharger"
                                        >
                                            <Download size={16} />
                                        </IconButton>
                                    </div>
                                </AttachmentItem>
                            ))
                        ) : (
                            <p style={{ padding: "var(--spacing-xl)", textAlign: "center", color: "var(--text-muted)" }}>
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

interface ExpenseTypeDoughnutChartProps {
    expenseReports: ExpenseLine[];
}

const ExpenseTypeDoughnutChart: React.FC<ExpenseTypeDoughnutChartProps> = ({ expenseReports }) => {
    const typeTotals = useMemo((): Record<string, number> => {
        const totals: Record<string, number> = {};
        (expenseReports || []).forEach((report) => {
            const type = report.type || "Autres";
            totals[type] = (totals[type] || 0) + (report.amountMGA || 0);
        });
        return totals;
    }, [expenseReports]);

    const totalAmount = useMemo(
        () => (expenseReports || []).reduce((sum: number, report) => sum + (report.amountMGA || 0), 0),
        [expenseReports]
    );

    // Enregistrer et désenregistrer le plugin avec le cycle de vie du composant
    useEffect(() => {
        if (!ChartJS.registry.plugins.get('centerText')) {
            ChartJS.register(centerTextPlugin);
        }
        
        return () => {
            // ChartJS.unregister(centerTextPlugin);
        };
    }, []);

    const data = Object.values(typeTotals);
    const hasData = data.some((val) => val > 0);

    if (!hasData) return <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Données insuffisantes</p>;

    const chartData = {
        labels: Object.keys(typeTotals),
        datasets: [
            {
                data: data,
                backgroundColor: ["#2563eb", "#16a34a", "#f59e0b", "#e4002b", "#7c3aed"],
                hoverBackgroundColor: ["#1d4ed8", "#15803d", "#d97706", "#b60022", "#6d28d9"],
                borderColor: "#ffffff",
                borderWidth: 3,
            },
        ],
    };

    const options: ChartOptions<'doughnut'> & { plugins: { centerText: { display: boolean; text: string } } } = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    boxWidth: 12,
                    padding: 15,
                    font: { size: 12 },
                    color: "#333",
                },
            },
            tooltip: {
                backgroundColor: "#ffffff",
                titleColor: "#333",
                bodyColor: "#333",
                borderColor: "#e0e0e0",
                borderWidth: 1,
                callbacks: {
                    label: function (tooltipItem: TooltipItem<'doughnut'>) {
                        const label = tooltipItem.label || "";
                        const value = tooltipItem.raw as number;
                        const total = (tooltipItem.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
                        const percentage = total ? ((value / total) * 100).toFixed(1) : "0";
                        return `${label}: ${formatNumber(value)},00 MGA (${percentage}%)`;
                    },
                },
            },
            centerText: {
                display: true,
                text: `${formatNumber(totalAmount)},00`,
            },
        },
        cutout: "65%",
        elements: {
            arc: {
                borderRadius: 4,
            },
        },
    };

    return (
        <ChartCard>
            <h4>Répartition par Type (en MGA)</h4>
            <div className="chart-content">
                <Doughnut data={chartData} options={options} />
            </div>
        </ChartCard>
    );
};

// === COMPOSANT PRINCIPAL ===

const ExpenseReportList: React.FC<Props> = ({ selectedAssignmentId, isLoading, onError }) => {
    const [openFolderId, setOpenFolderId] = useState<string | null>(null);
    const [missionAssignation, setMissionAssignation] = useState<MissionAssignation | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const expenseQuery = useExpenseReportsByAssignationId(selectedAssignmentId);
    const statusQuery = useStatusByAssignationId(selectedAssignmentId);
    const assignationQuery = useGetMissionAssignationByAssignationId(selectedAssignmentId || "");

    useEffect(() => {
        setMissionAssignation(assignationQuery.data?.data || null);
    }, [assignationQuery.data]);

    useEffect(() => {
        if (assignationQuery.error) {
            const err = assignationQuery.error as Error;
            setError(err.message || "Erreur lors de la récupération de l'assignation de mission.");
            onError(err);
        }
    }, [assignationQuery.error, onError]);

    const expenseResponse = expenseQuery.data as ApiResponse<FullExpenseResponse> | undefined;
    const fullExpenseData = expenseResponse?.data || { reports: [], attachments: [] };
    const { reports: expenseReports = [], attachments = [] } = fullExpenseData as FullExpenseResponse;

    useEffect(() => {
        if (expenseQuery.error) {
            const err = expenseQuery.error as Error;
            setError(err.message || "Erreur lors de la récupération des notes de frais.");
            onError(err);
        }
        if (statusQuery.error) {
            const err = statusQuery.error as Error;
            setError(err.message || "Erreur lors de la récupération des statuts.");
            onError(err);
        }
    }, [expenseQuery.error, statusQuery.error, onError]);

    const employeeInfo = useMemo(() => {
        if (!missionAssignation || !missionAssignation.employee) {
            return { id: missionAssignation?.employeeId || null, fullName: "N/A", employeeCode: "N/A" };
        }
        const { employeeId, lastName, firstName, employeeCode } = missionAssignation.employee;
        return {
            id: employeeId,
            fullName: `${lastName || ""} ${firstName || ""}`.trim() || "N/A",
            employeeCode: employeeCode || "N/A",
        };
    }, [missionAssignation]);

    const groupedData = useMemo(() => {
        const groups: Record<string, { userName: string; attachments: Attachment[] }> = {};
        if (!employeeInfo.id) return groups;
        groups[employeeInfo.id] = {
            userName: employeeInfo.fullName,
            attachments: attachments,
        };
        return groups;
    }, [attachments, employeeInfo.id, employeeInfo.fullName]);

    const totalAmountMGA = useMemo(
        () => (expenseReports || []).reduce((sum: number, report) => sum + (report.amountMGA || 0), 0),
        [expenseReports]
    );

    const handleToggleFolder = useCallback((userId: string) => {
        setOpenFolderId((prevId) => (prevId === userId ? null : userId));
    }, []);

    const isTotalLoading = isLoading || expenseQuery.isLoading || statusQuery.isLoading || assignationQuery.isLoading;
    const hasData = expenseReports.length > 0 || attachments.length > 0;
    const overallError = error;
    const hasAttachments = attachments.length > 0;

    return (
        <>
            {isTotalLoading ? (
                <NoDataMessage>⏳ Chargement des données...</NoDataMessage>
            ) : overallError ? (
                <NoDataMessage style={{ color: "var(--error-color)" }}>⚠️ {overallError}</NoDataMessage>
            ) : hasData ? (
                <>
                    <TwoColumnLayout $hasLeft={hasAttachments}>
                        {hasAttachments && (
                            <div style={{ overflow: 'hidden' }}>
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
                                                onToggle={() => handleToggleFolder(userId as string)}
                                            />
                                        );
                                    })}
                                </ModernCard>
                            </div>
                        )}
                        <div>
                            <SectionTitle>Analyse Visuelle</SectionTitle>
                            <ExpenseTypeDoughnutChart expenseReports={expenseReports} />
                        </div>
                    </TwoColumnLayout>

                    {expenseReports.length > 0 && (
                        <>
                            <Separator />
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
                                            <TableHeader>Montant MGA</TableHeader>
                                            <TableHeader>Taux</TableHeader>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenseReports.map((report, index) => (
                                            <tr key={report.expenseReportId || index}>
                                                <TableCell>{report.titled || "-"}</TableCell>
                                                <TableCell>{report.description || "-"}</TableCell>
                                                <TableCell>
                                                    <Badge $type={report.type || ""}>{report.type || "-"}</Badge>
                                                </TableCell>
                                                <TableCell>{report.currencyUnit || "MGA"}</TableCell>
                                                <TableCell>{report.amount ? `${formatNumber(report.amount)},00` : "-"}</TableCell>
                                                <TableCell>{report.amountMGA ? `${formatNumber(report.amountMGA)},00` : "-"}</TableCell>
                                                <TableCell>{report.rate ? `${report.rate}` : "-"}</TableCell>
                                            </tr>
                                        ))}
                                        <TotalRow>
                                            <TableCell colSpan={5}>
                                                <strong>Total (en MGA)</strong>
                                            </TableCell>
                                            <TableCell>
                                                <strong>{totalAmountMGA ? `${formatNumber(totalAmountMGA)},00` : "0,00"}</strong>
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
                        <p style={{ margin: 0, color: "var(--text-muted)" }}>
                            Aucune note de frais disponible pour cette mission
                        </p>
                    </div>
                </NoDataMessage>
            )}
        </>
    );
};

export default ExpenseReportList;