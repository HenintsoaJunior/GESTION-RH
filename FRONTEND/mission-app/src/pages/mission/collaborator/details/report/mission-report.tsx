"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { ArrowLeft, Save, List, FileText, Edit2, Trash2, X } from "lucide-react";
import { PageHeader, HeaderLeft, BtnBack, HeaderActions, SaveButton, ToggleButton, EditButton, DeleteButton, CancelButton, ReportTextContainer, ReportHeader, ReportActions } from "@/styles/detailsmission-styles";
import Alert from "@/components/alert";
import {
    DetailSection,
    SectionTitle,
    Separator,
} from "@/styles/detailsmission-styles";
import {
    FormTable,
    FormRow,
    FormFieldCell,
    FormLabelRequired,
} from "@/styles/form-container";
import { NoDataMessage } from "@/styles/table-styles";
import RichTextEditor from "@/components/rich-text-editor";
import { 
    useMissionReports,
    useCreateMissionReport, 
    useUpdateMissionReport,
    useDeleteMissionReport,
    type MissionReport as MissionReportType
} from "@/api/mission/report/services";
import { useQueryClient } from '@tanstack/react-query';

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
  // Access the data directly as array
  const allMissionReports = useMemo(() => allReportsResponse?.data || [], [allReportsResponse]);
  // Debug log (remove after testing)
  console.log('allMissionReports:', allMissionReports);
  console.log('assignationId prop:', assignationId);
  
  // Since only one report per person, get the first (or only) matching report
  const filteredReports = useMemo(() => {
    const matching = allMissionReports.filter((report: MissionReportType) => 
      report.assignationId.trim() === assignationId.trim()
    );
    // Return the first one if exists, or empty
    return matching.length > 0 ? [matching[0]] : [];
  }, [allMissionReports, assignationId]) as MissionReportType[];
  const hasExistingReport = filteredReports.length > 0;
  const existingReport = hasExistingReport ? filteredReports[0] : null;

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
    existingReport,
    isLoading,
    isEditMode,
    editingReportId,
    updateReportContent,
    handleSaveReport,
    handleEditReport,
    handleDeleteReport,
    handleCancelEdit,
    allReportsLoading,
  };
};

const MissionReport: React.FC<MissionReportProps> = ({ userId: propUserId, assignationId, onBack }) => {
    const userId = propUserId || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.userId || null : null);
    const [viewMode, setViewMode] = useState<"form" | "list">("list");
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
        if (viewMode === "list" && hasExistingReport) {
            return;
        }
        if (viewMode === "form") {
            handleCancelEdit();
        }
        setViewMode((prev) => (prev === "form" ? "list" : "form"));
    }, [viewMode, handleCancelEdit, hasExistingReport]);

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

    const shouldShowToggleButton = viewMode === "form" || !hasExistingReport;

    return (
        <>
            <PageHeader>
                <HeaderLeft>
                    <BtnBack onClick={handleBack} title="Retour aux missions">
                        <ArrowLeft className="w-5 h-5" />
                    </BtnBack>
                </HeaderLeft>
                <div className="header-center">
                    <div className="header-title-section">
                        <h1 className="page-title">Rapport de Mission</h1>
                        <p className="page-subtitle">Assignation #{assignationId}</p>
                    </div>
                </div>
                <HeaderActions>
                    {shouldShowToggleButton && (
                        <ToggleButton
                            onClick={toggleView}
                            disabled={isLoading}
                            title={viewMode === "form" ? "Voir la liste des rapports" : "Créer un nouveau rapport"}
                        >
                            {viewMode === "form" ? <List size={16} /> : <FileText size={16} />}
                            {viewMode === "form" ? "Liste" : "Nouveau Rapport"}
                        </ToggleButton>
                    )}
                </HeaderActions>
            </PageHeader>
            <Separator />
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
                    <SectionTitle>Liste</SectionTitle>
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