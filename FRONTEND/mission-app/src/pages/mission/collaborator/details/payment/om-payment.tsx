"use client";

import { Download } from "lucide-react";
import {
    DetailSection,
    SectionTitle,
    IndemnityTable,
    TableHeader,
    TableCell,
    TotalRow,
    Separator,
    FolderContainer, 
    FolderHeader, 
    AttachmentsList, 
    AttachmentItem, 
    IconButton,
    ModalOverlay, 
    ModalContentStyled, 
    ModalHeader, 
    ModalTitle,
    ModalCloseButton, 
    ModalBody, 
    FilePreview, 
    ImagePreview, 
    ErrorMessage,
    LoadingContainer,
    LoadingSpinner
} from "@/styles/detailsmission-styles";
import { NoDataMessage } from "@/styles/table-styles";
import { formatNumber } from "@/utils/format";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import type {
    ChartData,
    ChartOptions,
    TooltipItem,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import styled from "styled-components";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Eye, ChevronDown, Folder, FileText, X } from "lucide-react";
import {
  useGenerateIM,
  usePreviewIM,
  useGetMissionById,
  MissionTypeEnum,
} from "@/api/mission/services";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ChartGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
`;

const ChartCard = styled.div`
    padding: 20px;
    background: var(--bg-primary, #ffffff);
    border: 1px solid var(--border-light, #dee2e6);
    min-height: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;

    h4 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 1.1rem;
        color: var(--text-color-primary, #333);
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

interface CompensationScale {
    amount: number;
    expenseType?: {
        type: string;
    };
    transportId?: string;
}

interface DailyPaiement {
    date: string;
    totalAmount: number;
    compensationScales: CompensationScale[];
}

interface AssignmentDetails {
    beneficiary: string;
    matricule: string;
    missionTitle: string;
    function: string;
    base: string;
    meansOfTransport: string;
    direction: string;
    departmentService: string;
    costCenter: number;
    departureDate: string;
    departureTime: string;
    missionDuration: number;
    returnDate: string;
    returnTime: string;
    startDate: string;
}

interface MissionPayment {
    dailyPaiements: DailyPaiement[];
    assignmentDetails: AssignmentDetails;
    totalAmount: number;
}

interface IndemnityDetail {
    date: string;
    breakfast: number;
    lunch: number;
    dinner: number;
    accommodation: number;
    transport: number;
    communication?: number;
    visa?: number;
    medical?: number;
    taxes?: number;
    total: number;
}

// Types locaux pour remplacer les types manquants
interface GenerateIMData {
  missionId?: string;
  employeeId?: string;
}

interface PreviewPdfResult {
  blobUrl: string;
  fileName: string;
  status: string;
}

interface OMPaymentProps {
    missionPayment: MissionPayment;
    selectedMissionId: string;
    onBack: () => void;
    onExportExcel: () => void;
    formatDate: (date: string) => string;
    missionId: string;
    employeeId: string;
}

// Types for attachments
interface DocumentAttachment {
  id: string;
  name: string;
  fileContent?: string;
  fileName: string;
  fileSize?: number;
  fileType: string;
  extension?: string;
}

interface ModalContent {
  fileName?: string;
  fileUrl?: string;
  isBlobUrl?: boolean;
  extension?: string;
  error?: string;
}

const PREDEFINED_DOCUMENTS_PAYMENT: Omit<DocumentAttachment, 'fileContent'>[] = [
  {
    id: "im-pdf",
    name: "Indemnité de Mission",
    fileName: "Indemnite_Mission.pdf",
    fileType: "application/pdf",
    extension: "pdf",
    fileSize: 1024,
  },
];

// FilePreviewModal Component
interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ModalContent;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, content }) => {
  useEffect(() => {
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
          <ModalCloseButton onClick={onClose} $variant="primary" style={{ color: 'black' }}>
            <X size={20} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          {content.error ? (
            <ErrorMessage>{content.error}</ErrorMessage>
          ) : content.extension === "pdf" ? (
            <FilePreview src={content.fileUrl} title={content.fileName} style={{ borderRadius: 0 }} />
          ) : (
            <ImagePreview src={content.fileUrl} alt={content.fileName || ""} />
          )}
        </ModalBody>
      </ModalContentStyled>
    </ModalOverlay>
  );
};

// MissionAttachments Component
interface MissionAttachmentsProps {
  documents: DocumentAttachment[];
  onExportExcel: () => void;
  onGenerateIM: () => Promise<void>;
  onPreviewIM: (data: GenerateIMData) => Promise<PreviewPdfResult>;
  employeeId: string;
  missionId: string;
}

const MissionAttachments: React.FC<MissionAttachmentsProps> = ({ 
  documents, 
  onGenerateIM,
  onPreviewIM,
  employeeId,
  missionId 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({});

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handlePreview = useCallback(async (doc: DocumentAttachment) => {
    const content = doc.fileContent;
    if (content) {
      // handleFileView not needed here
    } else {
      let previewResult: PreviewPdfResult | undefined;
      try {
        switch (doc.id) {
          case "im-pdf":
            previewResult = await onPreviewIM({ missionId, employeeId });
            break;
        }
        if (previewResult) {
          setModalContent({ 
            fileUrl: previewResult.blobUrl, 
            fileName: previewResult.fileName, 
            isBlobUrl: true, 
            extension: doc.extension || "pdf" 
          });
          setModalOpen(true);
        }
      } catch (error) {
        setModalContent({ 
          error: error instanceof Error ? error.message : "Erreur lors de la génération du fichier.", 
          fileName: doc.fileName 
        });
        setModalOpen(true);
      }
    }
  }, [onPreviewIM, employeeId, missionId]);

  const handleDownload = useCallback(async (doc: DocumentAttachment) => {
    try {
      switch (doc.id) {
        case "im-pdf":
          await onGenerateIM();
          break;
      }
    } catch {
      // Error handled elsewhere
    }
  }, [onGenerateIM]);

  const filteredDocuments = useMemo(() => documents, [documents]);

  return (
    <>
      <FolderContainer style={{ marginTop: "var(--spacing-md)", width: "100%" }}>
        <FolderHeader onClick={toggleOpen} $isOpen={isOpen}>
          <Folder className="folder-icon" size={20} />
          <span style={{ fontSize: "12px" }}>
            Pièces Jointes · {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}
          </span>
          <ChevronDown className="chevron" size={20} />
        </FolderHeader>
        {isOpen && (
          <AttachmentsList style={{ width: "100%" }}>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <AttachmentItem key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: "var(--spacing-sm)" }}>
                  <FileText size={24} style={{ color: "var(--primary-color)", minWidth: "24px" }} />
                  <div className="file-info" style={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}>
                    <div className="file-name" style={{ fontWeight: "bold", fontSize: "12px" }}>{doc.name}</div>
                    <div className="file-size" style={{ fontSize: "12px" }}>{(doc.fileSize || 0).toLocaleString()} Ko</div>
                  </div>
                  <div className="actions" style={{ display: "flex", gap: "var(--spacing-xs)" }}>
                    <IconButton
                      onClick={() => handlePreview(doc)}
                      title={`Prévisualiser ${doc.name}`}
                      $variant="primary"
                    >
                      <Eye size={16} />
                    </IconButton>
                    <IconButton
                      $download
                      onClick={() => handleDownload(doc)}
                      title={`Télécharger ${doc.name}`}
                    >
                      <Download size={16} />
                    </IconButton>
                  </div>
                </AttachmentItem>
              ))
            ) : (
              <p style={{ padding: "var(--spacing-xl)", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                Aucune pièce jointe disponible
              </p>
            )}
          </AttachmentsList>
        )}
      </FolderContainer>
      <FilePreviewModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        content={modalContent} 
      />
    </>
  );
};

const IndemnityDoughnutChart: React.FC<{ indemnityDetails: IndemnityDetail[] }> = ({ indemnityDetails }) => {
    const totals = {
        transport: indemnityDetails.reduce((sum, item) => sum + (item.transport || 0), 0),
        repas: indemnityDetails.reduce(
            (sum, item) => sum + (item.breakfast || 0) + (item.lunch || 0) + (item.dinner || 0),
            0
        ),
        hebergement: indemnityDetails.reduce((sum, item) => sum + (item.accommodation || 0), 0),
        communication: indemnityDetails.reduce((sum, item) => sum + (item.communication || 0), 0),
        visa: indemnityDetails.reduce((sum, item) => sum + (item.visa || 0), 0),
        medical: indemnityDetails.reduce((sum, item) => sum + (item.medical || 0), 0),
        taxes: indemnityDetails.reduce((sum, item) => sum + (item.taxes || 0), 0),
    };

    const labelMap: Record<string, string> = {
        transport: "Transport",
        repas: "Repas",
        hebergement: "Hébergement",
        communication: "Communication",
        visa: "Visa sur place",
        medical: "Frais médicaux",
        taxes: "Taxes",
    };

    const entries = Object.entries(totals).filter(([, v]) => v > 0);
    const labels = entries.map(([k]) => labelMap[k]);
    const data = entries.map(([, v]) => v);

    const hasData = data.length > 0;

    if (!hasData) return <p>Données insuffisantes.</p>;

    const chartData: ChartData<'doughnut'> = {
        labels,
        datasets: [
            {
                data,
                backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1", "#fd7e14", "#20c997"],
                hoverBackgroundColor: ["#0056b3", "#1e7e34", "#d39e00", "#c82333", "#5a2d91", "#e86209", "#1aa179"],
                borderColor: ["#ffffff"],
                borderWidth: 2,
            },
        ],
    };

    const options: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right" as const,
                labels: { boxWidth: 10, padding: 10 },
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem: TooltipItem<'doughnut'>) {
                        const label = tooltipItem.label || "";
                        const value = tooltipItem.raw as number;
                        const total = tooltipItem.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1) + "%";
                        return `${label}: ${formatNumber(value)},00 MGA (${percentage})`;
                    },
                },
            },
        },
        cutout: "70%",
    };

    return (
        <ChartCard>
            <h4>Répartition Globale des Coûts</h4>
            <div className="chart-content">
                <Doughnut data={chartData} options={options} />
            </div>
        </ChartCard>
    );
};

const OMPayment: React.FC<OMPaymentProps> = ({ 
    missionPayment, 
    selectedMissionId,
    onExportExcel, 
    formatDate, 
    missionId, 
    employeeId 
}) => {

    const missionQuery = useGetMissionById(selectedMissionId);

    const isInternationalMemo = useMemo(() => {
        const missionType = missionQuery.data?.data?.missionType;
        return missionType === MissionTypeEnum.International;
    }, [missionQuery.data]);

    const originalIndemnityDetails: IndemnityDetail[] = missionPayment.dailyPaiements.map((item: DailyPaiement) => {
        const amounts = {
            breakfast: 0,
            lunch: 0,
            dinner: 0,
            accommodation: 0,
            transport: 0,
            communication: 0,
            visa: 0,
            medical: 0,
            taxes: 0,
        };

        item.compensationScales.forEach((scale: CompensationScale) => {
            const amount = scale.amount || 0;
            if (scale.transportId) {
                amounts.transport += amount;
            } else if (scale.expenseType?.type === "Transport") {
                amounts.transport += amount;
            } else if (scale.expenseType?.type === "Petit Déjeuner") {
                amounts.breakfast += amount;
            } else if (scale.expenseType?.type === "Déjeuner") {
                amounts.lunch += amount;
            } else if (scale.expenseType?.type === "Dinner") {
                amounts.dinner += amount;
            } else if (scale.expenseType?.type === "Hébergement") {
                amounts.accommodation += amount;
            } else if (scale.expenseType?.type === "Communication") {
                amounts.communication += amount;
            } else if (scale.expenseType?.type === "Visa sur place") {
                amounts.visa += amount;
            } else if (scale.expenseType?.type === "Frais médicaux") {
                amounts.medical += amount;
            } else if (scale.expenseType?.type === "Taxes") {
                amounts.taxes += amount;
            }
        });

        const total = amounts.breakfast + amounts.lunch + amounts.dinner + amounts.accommodation + amounts.transport +
                      (amounts.communication || 0) + (amounts.visa || 0) + (amounts.medical || 0) + (amounts.taxes || 0);

        return {
            date: item.date,
            breakfast: amounts.breakfast,
            lunch: amounts.lunch,
            dinner: amounts.dinner,
            accommodation: amounts.accommodation,
            transport: amounts.transport,
            communication: amounts.communication,
            visa: amounts.visa,
            medical: amounts.medical,
            taxes: amounts.taxes,
            total,
        };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const displayIndemnityDetails = useMemo(() => {
        if (!isInternationalMemo) {
            return originalIndemnityDetails;
        }

        const totalCommunication = originalIndemnityDetails.reduce((sum, item) => sum + (item.communication || 0), 0);
        const totalVisa = originalIndemnityDetails.reduce((sum, item) => sum + (item.visa || 0), 0);
        const totalMedical = originalIndemnityDetails.reduce((sum, item) => sum + (item.medical || 0), 0);
        const oneTimeTotal = totalCommunication + totalVisa + totalMedical;

        const adjustedDetails = originalIndemnityDetails.map((detail) => ({
            ...detail,
            communication: 0,
            visa: 0,
            medical: 0,
            total: detail.total - (detail.communication || 0) - (detail.visa || 0) - (detail.medical || 0),
        }));

        return [
            ...adjustedDetails,
            {
                date: "",
                breakfast: 0,
                lunch: 0,
                dinner: 0,
                accommodation: 0,
                transport: 0,
                communication: totalCommunication,
                visa: totalVisa,
                medical: totalMedical,
                taxes: 0,
                total: oneTimeTotal,
            } as IndemnityDetail,
        ];
    }, [originalIndemnityDetails, isInternationalMemo]);

    const grandTotal = originalIndemnityDetails.reduce((sum, item) => sum + item.total, 0);

    const generateIMMutation = useGenerateIM();
    const previewIMMutation = usePreviewIM();

    const handleExportIM = useCallback(async (): Promise<void> => {
      if (!missionId || !employeeId) {
        throw new Error("Mission ID et Employee ID sont requis pour générer l'indemnité de mission.");
      }
      await generateIMMutation.mutateAsync({ missionId, employeeId });
    }, [missionId, employeeId, generateIMMutation]);

    const handlePreviewIM = useCallback(async (data: GenerateIMData): Promise<PreviewPdfResult> => {
      if (!data.missionId || !data.employeeId) {
        throw new Error("Mission ID et Employee ID sont requis pour prévisualiser l'indemnité de mission.");
      }
      
      const result = await previewIMMutation.mutateAsync(data);
      return result;
    }, [previewIMMutation]);

    // Attachments setup
    const documents = PREDEFINED_DOCUMENTS_PAYMENT.map(doc => ({ ...doc, fileContent: undefined } as DocumentAttachment));

    if (missionQuery.isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                Chargement des détails de la mission...
            </LoadingContainer>
        );
    }

    return (
        <>
            {missionPayment.assignmentDetails ? (
                <>
                    <SectionTitle>Analyse Visuelle des Montants</SectionTitle>
                    <DetailSection>
                        <ChartGrid>
                            <IndemnityDoughnutChart indemnityDetails={originalIndemnityDetails} />
                            <ChartCard>
                                <h4>Pièces Jointes</h4>
                                <div className="chart-content">
                                    <MissionAttachments
                                        documents={documents}
                                        onExportExcel={onExportExcel} 
                                        onGenerateIM={handleExportIM}
                                        onPreviewIM={handlePreviewIM}
                                        employeeId={employeeId}
                                        missionId={missionId}
                                    />
                                </div>
                            </ChartCard>
                        </ChartGrid>
                    </DetailSection>
                    <Separator />
                    <SectionTitle>Régularisation des Indemnités de Mission</SectionTitle>
                    <IndemnityTable>
                        <thead>
                            <tr>
                                <TableHeader>Date</TableHeader>
                                <TableHeader>Transport</TableHeader>
                                <TableHeader>Petit Déjeuner</TableHeader>
                                <TableHeader>Déjeuner</TableHeader>
                                <TableHeader>Dîner</TableHeader>
                                <TableHeader>Hébergement</TableHeader>
                                {isInternationalMemo && (
                                    <>
                                        <TableHeader>Communication</TableHeader>
                                        <TableHeader>Visa sur place</TableHeader>
                                        <TableHeader>Frais médicaux</TableHeader>
                                        <TableHeader>Taxes</TableHeader>
                                    </>
                                )}
                                <TableHeader>Montant Total</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                          {displayIndemnityDetails.map((item, index) => {
                            const isOneTimeRow = !item.date;
                            return (
                              <tr key={index} style={isOneTimeRow ? { fontWeight: 'bold' } : {}}>
                                <TableCell style={{ textAlign: 'left' }}>
                                  {isOneTimeRow ? '' : formatDate(item.date)}
                                </TableCell>
                                <TableCell style={{ textAlign: 'right' }}>
                                  {formatNumber(item.transport || 0)},00
                                </TableCell>
                                <TableCell style={{ textAlign: 'right' }}>
                                  {formatNumber(item.breakfast || 0)},00
                                </TableCell>
                                <TableCell style={{ textAlign: 'right' }}>
                                  {formatNumber(item.lunch || 0)},00
                                </TableCell>
                                <TableCell style={{ textAlign: 'right' }}>
                                  {formatNumber(item.dinner || 0)},00
                                </TableCell>
                                <TableCell style={{ textAlign: 'right' }}>
                                  {formatNumber(item.accommodation || 0)},00
                                </TableCell>

                                {isInternationalMemo && (
                                  <>
                                    <TableCell style={{ textAlign: 'right' }}>
                                      {formatNumber(item.communication || 0)},00
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'right' }}>
                                      {formatNumber(item.visa || 0)},00
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'right' }}>
                                      {formatNumber(item.medical || 0)},00
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'right' }}>
                                      {formatNumber(item.taxes || 0)},00
                                    </TableCell>
                                  </>
                                )}

                                <TableCell style={{ textAlign: 'right', fontWeight: '600' }}>
                                  {formatNumber(item.total || 0)},00
                                </TableCell>
                              </tr>
                            );
                          })}

                          <TotalRow>
                            <TableCell 
                              colSpan={isInternationalMemo ? 10 : 6} 
                              style={{ textAlign: 'left', fontWeight: 'bold' }}
                            >
                              Total
                            </TableCell>
                            <TableCell style={{ textAlign: 'right', fontWeight: 'bold' }}>
                              <strong>{formatNumber(grandTotal)},00</strong>
                            </TableCell>
                          </TotalRow>
                        </tbody>
                    </IndemnityTable>
                </>
            ) : (
                <NoDataMessage>Aucune donnée trouvée pour cette mission.</NoDataMessage>
            )}
        </>
    );
};

export default OMPayment;