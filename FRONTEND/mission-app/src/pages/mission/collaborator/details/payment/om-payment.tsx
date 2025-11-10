"use client";

import { Download } from "lucide-react";
import {
    DetailSection,
    SectionTitle,
    IndemnityTable,
    TableHeader,
    TableCell,
    TotalRow,
    PageHeader,
    HeaderLeft,
    HeaderActions,
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
    ErrorMessage 
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
  type GenerateIMData,
  type PreviewPdfResult,
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
    total: number;
}

interface OMPaymentProps {
    missionPayment: MissionPayment;
    selectedAssignmentId: string;
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
  fileContent?: string; // Optional base64
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
    id: "im-excel",
    name: "IM Excel",
    fileName: "Indemnites_Mission.xlsx",
    fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: "xlsx",
    fileSize: 2048,
  },
  {
    id: "im-pdf",
    name: "IM PDF",
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

  const parseTimestamp = useCallback((ts: string): string => {
    const datePart = ts.split('T')[0]; // e.g., "2025-11-09"
    const timePart = ts.split('T')[1]; // e.g., "08-56-25-976Z"
    if (!datePart || !timePart) return ts;

    const cleanTime = timePart.replace(/-/g, ':').replace(/\d{3}Z$/, ''); // e.g., "08:56:25"
    return `${datePart} ${cleanTime}`;
  }, []);

  const formatFileNameWithDate = useCallback((fileName?: string): string => {
    if (!fileName) return "Prévisualisation";

    const match = fileName.match(/(.*)-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)\.pdf$/);
    if (match) {
      const [, base, ts] = match;
      const formattedTs = parseTimestamp(ts);
      return `${base} (${formattedTs})`;
    }
    return fileName;
  }, [parseTimestamp]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContentStyled 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: '70vw', 
          height: '80vh', 
          maxWidth: '70vw', 
          maxHeight: '80vh',
        }}
      >
        <ModalHeader>
          <ModalTitle>{formatFileNameWithDate(content.fileName)}</ModalTitle>
          <ModalCloseButton onClick={onClose} $variant="primary" style={{ color: 'black' }}>
            <X size={20} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody style={{ width: '100%', height: 'calc(100% - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {content.error ? (
            <ErrorMessage>{content.error}</ErrorMessage>
          ) : content.extension === "pdf" ? (
            <FilePreview 
              src={content.fileUrl} 
              title={content.fileName} 
              style={{ 
                borderRadius: 0, 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain' 
              }} 
            />
          ) : (
            <ImagePreview 
              src={content.fileUrl} 
              alt={content.fileName || ""} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                objectFit: 'contain' 
              }} 
            />
          )}
        </ModalBody>
      </ModalContentStyled>
    </ModalOverlay>
  );
};

// MissionAttachments Component (adapted for IM Excel and PDF)
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
  onExportExcel,
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
          case "im-excel":
            setModalContent({ 
              error: "Prévisualisation non disponible pour les fichiers Excel. Utilisez le bouton de téléchargement.",
              fileName: doc.fileName 
            });
            setModalOpen(true);
            return;
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
        case "im-excel":
          onExportExcel();
          break;
        case "im-pdf":
          await onGenerateIM();
          break;
      }
    } catch {
      // Error handled elsewhere
    }
  }, [onExportExcel, onGenerateIM]);

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
    const totalTransport = indemnityDetails.reduce((sum, item) => sum + (item.transport || 0), 0);
    const totalRepas = indemnityDetails.reduce(
        (sum, item) => sum + (item.breakfast || 0) + (item.lunch || 0) + (item.dinner || 0),
        0
    );
    const totalHebergement = indemnityDetails.reduce((sum, item) => sum + (item.accommodation || 0), 0);

    const data: number[] = [totalTransport, totalRepas, totalHebergement];
    const hasData = data.some(val => val > 0);

    if (!hasData) return <p>Données insuffisantes.</p>;

    const chartData: ChartData<'doughnut'> = {
        labels: ["Transport", "Repas", "Hébergement"],
        datasets: [
            {
                data: data,
                backgroundColor: ["#007bff", "#28a745", "#ffc107"],
                hoverBackgroundColor: ["#0056b3", "#1e7e34", "#d39e00"],
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

const OMPayment: React.FC<OMPaymentProps> = ({ missionPayment, selectedAssignmentId, onExportExcel, formatDate, missionId, employeeId }) => {
    console.log(selectedAssignmentId);
    const indemnityDetails: IndemnityDetail[] = missionPayment.dailyPaiements.map((item: DailyPaiement) => {
        const amounts = {
            breakfast: 0,
            lunch: 0,
            dinner: 0,
            accommodation: 0,
            transport: 0,
        };

        item.compensationScales.forEach((scale: CompensationScale) => {
            const amount = scale.amount || 0;
            if (scale.expenseType?.type === "Petit Déjeuner") amounts.breakfast += amount;
            else if (scale.expenseType?.type === "Déjeuner") amounts.lunch += amount;
            else if (scale.expenseType?.type === "Dîner") amounts.dinner += amount;
            else if (scale.expenseType?.type === "Hébergement") amounts.accommodation += amount;
            else if (scale.transportId) amounts.transport += amount;
        });

        const total = amounts.breakfast + amounts.lunch + amounts.dinner + amounts.accommodation + amounts.transport;

        return {
            date: item.date,
            breakfast: amounts.breakfast,
            lunch: amounts.lunch,
            dinner: amounts.dinner,
            accommodation: amounts.accommodation,
            transport: amounts.transport,
            total,
        };
    });

    const grandTotal = indemnityDetails.reduce((sum, item) => sum + item.total, 0);

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

    return (
        <>
            <PageHeader>
                <HeaderLeft>
                    
                </HeaderLeft>
                <HeaderActions>
                    {/* No standalone button, handled in attachments */}
                </HeaderActions>
            </PageHeader>
            <Separator />
            {missionPayment.assignmentDetails ? (
                <>
                    <SectionTitle>Analyse Visuelle des Montants</SectionTitle>
                    <DetailSection>
                        <ChartGrid>
                            <IndemnityDoughnutChart indemnityDetails={indemnityDetails} />
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
                                <TableHeader>Montant Total</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {indemnityDetails.map((item, index) => (
                                <tr key={index}>
                                    <TableCell>{formatDate(item.date)}</TableCell>
                                    <TableCell>{item.transport ? `${formatNumber(item.transport)},00` : ""}</TableCell>
                                    <TableCell>{item.breakfast ? `${formatNumber(item.breakfast)},00` : ""}</TableCell>
                                    <TableCell>{item.lunch ? `${formatNumber(item.lunch)},00` : ""}</TableCell>
                                    <TableCell>{item.dinner ? `${formatNumber(item.dinner)},00` : ""}</TableCell>
                                    <TableCell>{item.accommodation ? `${formatNumber(item.accommodation)},00` : ""}</TableCell>
                                    <TableCell>{item.total ? `${formatNumber(item.total)},00` : ""}</TableCell>
                                </tr>
                            ))}
                            <TotalRow>
                                <TableCell colSpan={6}>Total</TableCell>
                                <TableCell><strong>{formatNumber(grandTotal)},00</strong></TableCell>
                            </TotalRow>
                        </tbody>
                    </IndemnityTable>
                </>
            ) : (
                <NoDataMessage>Aucune donnée trouvée pour cette assignation.</NoDataMessage>
            )}
        </>
    );
};

export default OMPayment;