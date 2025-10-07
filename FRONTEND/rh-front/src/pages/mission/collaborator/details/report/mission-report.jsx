"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Save, List, FileText, Edit2, Trash2, X } from "lucide-react";
import {
    DetailSection,
    SectionTitle,
    ActionButton,
} from "styles/generaliser/details-mission-container";
import {
    FormTable,
    FormRow,
    FormFieldCell,
    FormLabelRequired,
    ErrorMessage,
} from "styles/generaliser/form-container";
import { NoDataMessage } from "styles/generaliser/table-container";
import RichTextEditor from "components/rich-text-editor";
import styled from "styled-components";
import { 
    CreateMissionReport, 
    FetchMissionReports,
    UpdateMissionReport,
    DeleteMissionReport 
} from "services/mission/report";

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

const MissionReport = ({ userId: propUserId, assignationId, onBack }) => {
    const userId = propUserId || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.userId || null : null);
    const [formData, setFormData] = useState({ reportContent: "" });
    const [errors, setErrors] = useState({ reportContent: false });
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState("form");
    const [missionReports, setMissionReports] = useState([]);
    const [hasExistingReport, setHasExistingReport] = useState(false);
    const [editingReportId, setEditingReportId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const createMissionReport = CreateMissionReport();
    const fetchMissionReports = FetchMissionReports();
    const updateMissionReport = UpdateMissionReport();
    const deleteMissionReport = DeleteMissionReport();

    const clearError = useCallback((field) => {
        setErrors((prev) => ({ ...prev, [field]: false }));
    }, []);

    const updateReportContent = useCallback((value) => {
        setFormData((prev) => ({ ...prev, reportContent: value }));
        clearError("reportContent");
    }, [clearError]);

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const reports = await fetchMissionReports(assignationId);
            setMissionReports(reports);
            setHasExistingReport(reports.some(report => report.assignationId === assignationId));
        } catch (error) {
            console.error("Error fetching reports:", error);
            setMissionReports([]);
            setHasExistingReport(false);
        } finally {
            setIsLoading(false);
        }
    }, [fetchMissionReports, assignationId]);

    const handleSaveReport = useCallback(async () => {
        if (!isEditMode && hasExistingReport) {
            setErrors((prev) => ({ ...prev, reportContent: true }));
            console.error("A report already exists for this assignation.");
            return;
        }

        if (!formData.reportContent.trim()) {
            setErrors((prev) => ({ ...prev, reportContent: true }));
            return;
        }

        if (!userId || !assignationId) {
            setErrors((prev) => ({ ...prev, reportContent: true }));
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                text: formData.reportContent,
                userId,
                assignationId,
            };

            if (isEditMode && editingReportId) {
                await updateMissionReport(editingReportId, payload);
            } else {
                await createMissionReport(payload);
            }
            
            setErrors((prev) => ({ ...prev, reportContent: false }));
            setFormData({ reportContent: "" });
            setIsEditMode(false);
            setEditingReportId(null);
            setViewMode("list");
            fetchReports();
        } catch (error) {
            setErrors((prev) => ({ ...prev, reportContent: true }));
            console.error("Error saving report:", error);
        } finally {
            setIsLoading(false);
        }
    }, [assignationId, userId, formData.reportContent, createMissionReport, updateMissionReport, fetchReports, hasExistingReport, isEditMode, editingReportId]);

    const handleEditReport = useCallback((report) => {
        setFormData({ reportContent: report.text });
        setEditingReportId(report.missionReportId);
        setIsEditMode(true);
        setViewMode("form");
    }, []);

    const handleDeleteReport = useCallback(async (reportId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?")) {
            return;
        }

        if (!userId) {
            console.error("User ID is required for deletion");
            alert("Erreur: ID utilisateur manquant.");
            return;
        }

        setIsLoading(true);
        try {
            await deleteMissionReport(reportId, userId);
            fetchReports();
        } catch (error) {
            console.error("Error deleting report:", error);
            alert("Erreur lors de la suppression du rapport.");
        } finally {
            setIsLoading(false);
        }
    }, [deleteMissionReport, fetchReports, userId]);

    const handleCancelEdit = useCallback(() => {
        setFormData({ reportContent: "" });
        setIsEditMode(false);
        setEditingReportId(null);
        setErrors({ reportContent: false });
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

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
                                    <FormFieldCell colSpan="2">
                                        <FormLabelRequired>Contenu du rapport</FormLabelRequired>
                                        <RichTextEditor
                                            placeholder="Rédigez votre rapport ici..."
                                            initialValue={formData.reportContent}
                                            onChange={(value) => updateReportContent(value)}
                                            disabled={isLoading}
                                            className={errors.reportContent ? "input-error" : ""}
                                            key={editingReportId || 'new'}
                                        />
                                        {errors.reportContent && (
                                            <ErrorMessage>
                                                {hasExistingReport && !isEditMode
                                                    ? "Un rapport existe déjà pour cette assignation."
                                                    : "Veuillez fournir un rapport détaillé ou vérifier les données requises."}
                                            </ErrorMessage>
                                        )}
                                    </FormFieldCell>
                                </FormRow>
                                <FormRow>
                                    <FormFieldCell colSpan="2" style={{ textAlign: 'right', paddingTop: '20px' }}>
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
                                            onClick={handleSaveReport}
                                            disabled={isLoading || !formData.reportContent.trim() || (!isEditMode && hasExistingReport)}
                                            title={
                                                !isEditMode && hasExistingReport
                                                    ? "Un rapport existe déjà"
                                                    : formData.reportContent.trim()
                                                    ? isEditMode ? "Mettre à jour le rapport" : "Enregistrer le rapport"
                                                    : "Le rapport est vide"
                                            }
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
                    {missionReports.length === 0 ? (
                        <NoDataMessage>Aucun rapport disponible.</NoDataMessage>
                    ) : (
                        <div>
                            {missionReports.map((report) => (
                                <ReportTextContainer key={report.missionReportId}>
                                    <ReportHeader>
                                        <div>
                                            <strong>Rapport #{report.missionReportId}</strong>
                                        </div>
                                        <ReportActions>
                                            <EditButton
                                                onClick={() => handleEditReport(report)}
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