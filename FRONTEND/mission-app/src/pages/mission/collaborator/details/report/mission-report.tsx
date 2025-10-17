"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { ArrowLeft, Save, List, FileText, Edit2, Trash2, X } from "lucide-react";
import Alert from "@/components/alert";
import {
    DetailSection,
    SectionTitle,
    ActionButton,
} from "@/styles/detailsmission-styles";
import {
    FormTable,
    FormRow,
    FormFieldCell,
    FormLabelRequired,
} from "@/styles/form-container";
import { NoDataMessage } from "@/styles/table-styles";
import RichTextEditor from "@/components/rich-text-editor";
import styled from "styled-components";
import { 
    useMissionReports,
    useCreateMissionReport, 
    useUpdateMissionReport,
    useDeleteMissionReport,
    type MissionReport as MissionReportType
} from "@/api/mission/report/services";
import { useQueryClient } from '@tanstack/react-query';

const SaveButton = styled(ActionButton)`
    background-color: var(--success-color, #28a745);
    border-color: var(--success-color, #28a745);

    &:hover {
        background-color: #ffffff;
        color: var(--success-color, #28a745);
        border-color: var(--success-color, #28a745);
    }
`;

const ToggleButton = styled(ActionButton)`
    background-color: var(--primary-color, #007bff);
    border-color: var(--primary-color, #007bff);
    margin-right: 10px;

    &:hover {
        background-color: #ffffff;
        color: var(--primary-color, #007bff);
        border-color: var(--primary-color, #007bff);
    }
`;

const EditButton = styled(ActionButton)`
    background-color: var(--warning-color, #ffc107);
    border-color: var(--warning-color, #ffc107);
    color: #000;
    margin-right: 10px;

    &:hover {
        background-color: #ffffff;
        color: var(--warning-color, #ffc107);
        border-color: var(--warning-color, #ffc107);
    }
`;

const DeleteButton = styled(ActionButton)`
    background-color: var(--danger-color, #dc3545);
    border-color: var(--danger-color, #dc3545);

    &:hover {
        background-color: #ffffff;
        color: var(--danger-color, #dc3545);
        border-color: var(--danger-color, #dc3545);
    }
`;

const CancelButton = styled(ActionButton)`
    background-color: var(--secondary-color, #6c757d);
    border-color: var(--secondary-color, #6c757d);
    margin-right: 10px;

    &:hover {
        background-color: #ffffff;
        color: var(--secondary-color, #6c757d);
        border-color: var(--secondary-color, #6c757d);
    }
`;

const ReportTextContainer = styled.div`
    background-color: #ffffff;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-bottom: 20px;
    font-family: 'Times New Roman', Times, serif;
    font-size: 16px;
    line-height: 1.6;
    color: #333;

    & p {
        margin: 0 0 10px 0;
    }

    & + & {
        border-top: 1px solid #e0e0e0;
    }
`;

const ReportHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #e0e0e0;
`;

const ReportActions = styled.div`
    display: flex;
    gap: 10px;
`;

type AlertType = "error" | "success" | "info" | "warning";

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  message: string;
}

interface MissionReportProps {
  userId?: string | null;
  assignationId: string;
  onBack?: () => void;
}

const useAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: "info",
    message: "",
  });

  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }
  }, []);

  const showAlert = useCallback((type: AlertType, message: string) => {
    clearTimers();
    setAlert({ isOpen: true, type, message });
  }, [clearTimers]);

  const handleClose = useCallback(() => {
    setAlert({ isOpen: false, type: "info", message: "" });
  }, []);

  const resetAlert = useCallback(() => {
    clearTimers();
    setAlert({ isOpen: false, type: "info", message: "" });
  }, [clearTimers]);

  useEffect(() => {
    if (alert.isOpen && alert.type === "success") {
      alertTimerRef.current = setTimeout(() => {
        handleClose();
      }, 3000);
    }

    return () => {
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
    };
  }, [alert.isOpen, alert.type, handleClose]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return { alert, showAlert, handleClose, resetAlert };
};

const useMissionReport = (
  assignationId: string,
  userId: string | null,
  showAlert: (type: AlertType, message: string) => void
) => {
  const [formData, setFormData] = useState({ reportContent: "" });
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: allReportsResponse, isLoading: allReportsLoading } = useMissionReports();
  const missionReports = useMemo(() => allReportsResponse?.data?.data || [], [allReportsResponse]);
  const filteredReports = useMemo(() => {
    const filtered = missionReports.filter((report: MissionReportType) => 
      report.assignationId.trim() === assignationId.trim() && 
      (!userId || report.userId === userId)
    );
    // Debug logs (remove in production)
    console.log('Debug - assignationId:', assignationId);
    console.log('Debug - userId:', userId);
    console.log('Debug - missionReports:', missionReports);
    console.log('Debug - filteredReports:', filtered);
    return filtered;
  }, [missionReports, assignationId, userId]) as MissionReportType[];
  const hasExistingReport = filteredReports.length > 0;

  const createMutation = useCreateMissionReport();
  const updateMutation = useUpdateMissionReport();
  const deleteMutation = useDeleteMissionReport();

  const isLoading = allReportsLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const updateReportContent = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, reportContent: value }));
  }, []);

  const handleSaveReport = useCallback(async (): Promise<boolean> => {
    if (!isEditMode && hasExistingReport) {
      showAlert("error", "Un rapport existe déjà pour cette assignation.");
      return false;
    }

    if (!formData.reportContent.trim()) {
      showAlert("error", "Veuillez fournir un rapport détaillé.");
      return false;
    }

    if (!userId || !assignationId) {
      showAlert("error", "Données manquantes : ID utilisateur ou ID d'assignation requis.");
      return false;
    }

    try {
      const payload = {
        text: formData.reportContent,
        userId,
        assignationId,
      };

      if (isEditMode && editingReportId) {
        await updateMutation.mutateAsync({ id: editingReportId, data: payload });
        showAlert("success", "Rapport mis à jour avec succès.");
      } else {
        await createMutation.mutateAsync(payload);
        showAlert("success", "Rapport enregistré avec succès.");
      }
      
      setFormData({ reportContent: "" });
      setIsEditMode(false);
      setEditingReportId(null);
      return true;
    } catch (error) {
      showAlert("error", "Erreur lors de la sauvegarde du rapport.");
      console.error("Error saving report:", error);
      return false;
    }
  }, [assignationId, userId, formData.reportContent, createMutation, updateMutation, hasExistingReport, isEditMode, editingReportId, showAlert]);

  const handleEditReport = useCallback((report: MissionReportType) => {
    setFormData({ reportContent: report.text });
    setEditingReportId(report.missionReportId);
    setIsEditMode(true);
  }, []);

  const handleDeleteReport = useCallback(async (reportId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?")) {
      return;
    }

    if (!userId) {
      showAlert("error", "Erreur: ID utilisateur manquant.");
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: reportId, userId });
      showAlert("success", "Rapport supprimé avec succès.");
    } catch (error) {
      showAlert("error", "Erreur lors de la suppression du rapport.");
      console.error("Error deleting report:", error);
    }
  }, [deleteMutation, userId, showAlert]);

  const handleCancelEdit = useCallback(() => {
    setFormData({ reportContent: "" });
    setIsEditMode(false);
    setEditingReportId(null);
  }, []);

  return {
    formData,
    filteredReports,
    hasExistingReport,
    isLoading,
    isEditMode,
    editingReportId,
    updateReportContent,
    handleSaveReport,
    handleEditReport,
    handleDeleteReport,
    handleCancelEdit,
    allReportsLoading, // Exposer pour le loading spécifique si besoin
  };
};

const MissionReport: React.FC<MissionReportProps> = ({ userId: propUserId, assignationId, onBack }) => {
    const userId = propUserId || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.userId || null : null);
    const [viewMode, setViewMode] = useState<"form" | "list">("form");
    const queryClient = useQueryClient();

    const { alert, showAlert, handleClose } = useAlert();
    const {
        formData,
        filteredReports,
        hasExistingReport,
        isLoading,
        isEditMode,
        editingReportId,
        updateReportContent,
        handleSaveReport,
        handleEditReport,
        handleDeleteReport,
        handleCancelEdit,
    } = useMissionReport(assignationId, userId, showAlert);

    const handleBack = useCallback(() => {
        if (onBack) {
            onBack();
        } else {
            window.location.href = "/missions";
        }
    }, [onBack]);

    const toggleView = useCallback(() => {
        if (viewMode === "list") {
            handleCancelEdit();
        }
        setViewMode((prev) => (prev === "form" ? "list" : "form"));
    }, [viewMode, handleCancelEdit]);

    const handleSaveClick = useCallback(async () => {
        const success = await handleSaveReport();
        if (success) {
            // Force refetch après sauvegarde
            await queryClient.refetchQueries({ queryKey: ['missionReports'] });
            setViewMode("list");
        }
    }, [handleSaveReport, queryClient]);

    const handleEditClick = useCallback((report: MissionReportType) => {
        handleEditReport(report);
        setViewMode("form");
    }, [handleEditReport]);

    if (!userId || !assignationId) {
        return (
            <NoDataMessage>
                Données manquantes :{' '}
                {!userId && 'ID utilisateur, '}
                {!assignationId && 'ID d\'assignation'}
                requis.
            </NoDataMessage>
        );
    }

    const saveButtonDisabled = isLoading || !formData.reportContent.trim() || (!isEditMode && hasExistingReport);
    const saveButtonTitle = (!isEditMode && hasExistingReport)
        ? "Un rapport existe déjà"
        : !formData.reportContent.trim()
        ? "Le rapport est vide"
        : isEditMode ? "Mettre à jour le rapport" : "Enregistrer le rapport";

    return (
        <>
            <div className="page-header">
                <div className="header-left">
                    <button 
                        onClick={handleBack} 
                        className="btn-back" 
                        title="Retour aux missions"
                        disabled={isLoading}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="header-title-section">
                        <h1 className="page-title">Rapport de Mission</h1>
                        <p className="page-subtitle">Assignation #{assignationId}</p>
                    </div>
                </div>
                <div className="header-right">
                    <ToggleButton
                        onClick={toggleView}
                        disabled={isLoading}
                        title={viewMode === "form" ? "Voir la liste des rapports" : "Créer un nouveau rapport"}
                    >
                        {viewMode === "form" ? <List size={16} /> : <FileText size={16} />}
                        {viewMode === "form" ? "Liste" : "Nouveau Rapport"}
                    </ToggleButton>
                </div>
            </div>

            {alert.isOpen && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    isOpen={alert.isOpen}
                    onClose={handleClose}
                />
            )}

            {viewMode === "form" ? (
                <DetailSection>
                    <SectionTitle>
                        {isEditMode ? "Modification de Rapport" : "Création de Rapport"}
                    </SectionTitle>
                    {!isEditMode && hasExistingReport ? (
                        <NoDataMessage>
                            Un rapport existe déjà pour cette assignation. Consultez la liste des rapports.
                        </NoDataMessage>
                    ) : (
                        <FormTable>
                            <tbody>
                                <FormRow>
                                    <FormFieldCell colSpan={2}>
                                        <FormLabelRequired>Contenu du rapport</FormLabelRequired>
                                        <RichTextEditor
                                            placeholder="Rédigez votre rapport ici..."
                                            initialValue={formData.reportContent}
                                            onChange={(value) => updateReportContent(value)}
                                            disabled={isLoading}
                                            key={editingReportId || 'new'}
                                        />
                                    </FormFieldCell>
                                </FormRow>
                                <FormRow>
                                    <FormFieldCell colSpan={2} style={{ textAlign: 'right', paddingTop: '20px' }}>
                                        {isEditMode && (
                                            <CancelButton
                                                onClick={handleCancelEdit}
                                                disabled={isLoading}
                                                title="Annuler la modification"
                                            >
                                                <X size={16} /> Annuler
                                            </CancelButton>
                                        )}
                                        <SaveButton
                                            onClick={handleSaveClick}
                                            disabled={saveButtonDisabled}
                                            title={saveButtonTitle}
                                        >
                                            <Save size={16} /> {isEditMode ? "Mettre à jour" : "Enregistrer"}
                                        </SaveButton>
                                    </FormFieldCell>
                                </FormRow>
                            </tbody>
                        </FormTable>
                    )}
                </DetailSection>
            ) : (
                <DetailSection>
                    <SectionTitle>Liste des Rapports</SectionTitle>
                    {isLoading ? (
                        <NoDataMessage>Chargement des rapports...</NoDataMessage>
                    ) : filteredReports.length === 0 ? (
                        <NoDataMessage>Aucun rapport disponible.</NoDataMessage>
                    ) : (
                        <div>
                            {filteredReports.map((report: MissionReportType) => (
                                <ReportTextContainer key={report.missionReportId}>
                                    <ReportHeader>
                                        <div>
                                            <strong>Rapport #{report.missionReportId}</strong>
                                        </div>
                                        <ReportActions>
                                            <EditButton
                                                onClick={() => handleEditClick(report)}
                                                disabled={isLoading}
                                                title="Modifier ce rapport"
                                            >
                                                <Edit2 size={16} /> Modifier
                                            </EditButton>
                                            <DeleteButton
                                                onClick={() => handleDeleteReport(report.missionReportId)}
                                                disabled={isLoading}
                                                title="Supprimer ce rapport"
                                            >
                                                <Trash2 size={16} /> Supprimer
                                            </DeleteButton>
                                        </ReportActions>
                                    </ReportHeader>
                                    <div dangerouslySetInnerHTML={{ __html: report.text }} />
                                </ReportTextContainer>
                            ))}
                        </div>
                    )}
                </DetailSection>
            )}
        </>
    );
};

export default MissionReport;