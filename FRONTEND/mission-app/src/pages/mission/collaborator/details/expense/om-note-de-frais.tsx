"use client";

import { useState, useEffect, useMemo } from "react";
import type { ExpenseReportType, ExpenseLine, Attachment } from "@/api/mission/expense/services";
import { useAllExpenseReportTypes, useCreateExpenseReport } from "@/api/mission/expense/services";
import { useGetMissionAssignationByAssignationId } from "@/api/mission/services";
import ExpenseReportStep from "./step/expense-report-step";
import ExpenseReportList from "./step/expense-report-list";
import { ClipboardList, Plus, ArrowLeft } from "lucide-react";
import {
  PageHeader,
  HeaderLeft,
  BtnBack,
  SectionTitle,
  LoadingContainer,
  HeaderActions,
  ToggleButton,
  Separator,
} from "@/styles/detailsmission-styles";


interface FormData {
    assignationId: string;
    userId: string;
    expenseLinesByType: Record<string, ExpenseLine[]>;
    attachments: Attachment[];
}

interface ApiResponse<T = unknown> {
    status: number;
    data?: T;
    message?: string;
}

interface OMNoteDeFraisProps {
    selectedAssignmentId?: string;
    onBack?: () => void;
}

const OMNoteDeFrais: React.FC<OMNoteDeFraisProps> = ({ selectedAssignmentId, onBack }) => {
    const [formData, setFormData] = useState<FormData>({
        assignationId: selectedAssignmentId || "",
        userId: "",
        expenseLinesByType: {},
        attachments: [],
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const [expenseReportTypes, setExpenseReportTypes] = useState<ExpenseReportType[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);
    const [hasErrorLoadingTypes, setHasErrorLoadingTypes] = useState(false);

    const [viewMode, setViewMode] = useState<"list" | "form">("list");

    const { data: expenseReportTypesData, isLoading: loadingTypes, error: typesError } = useAllExpenseReportTypes();

    const assignationQuery = useGetMissionAssignationByAssignationId(selectedAssignmentId || "");

    const employeeInfo = useMemo(() => {
        if (!assignationQuery.data?.data || !assignationQuery.data.data.employee) {
            return { fullName: "N/A" };
        }
        const { firstName, lastName } = assignationQuery.data.data.employee;
        return {
            fullName: `${firstName || ""} ${lastName || ""}`.trim() || "N/A",
        };
    }, [assignationQuery.data]);

    const subtitleText = useMemo(() => {
        if (assignationQuery.isLoading) return "Chargement...";
        return employeeInfo.fullName;
    }, [assignationQuery.isLoading, employeeInfo.fullName]);

    // Mutation pour créer une note de frais
    const createMutation = useCreateExpenseReport();

    useEffect(() => {
        setIsLoadingTypes(loadingTypes);
        if (typesError) {
            setHasErrorLoadingTypes(true);
            return;
        }
        if (expenseReportTypesData?.status === 200) {
            setHasErrorLoadingTypes(false);
            setExpenseReportTypes(expenseReportTypesData.data || []);
        } else {
            setHasErrorLoadingTypes(true);
        }
    }, [loadingTypes, typesError, expenseReportTypesData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (value) {
            setFieldErrors((prev) => ({ ...prev, [name]: [] }));
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { assignationId, userId, expenseLinesByType, attachments } = formData;
        if (!assignationId) {
            setFieldErrors({ assignationId: ["L'assignation est requise."] });
            return;
        }
        if (!userId) {
            setFieldErrors({ userId: ["L'utilisateur est requis."] });
            return;
        }
        if (Object.keys(expenseLinesByType).length === 0) {
            setFieldErrors({ general: ["Au moins une ligne de dépense est requise."] });
            return;
        }
        createMutation.mutate(
            {
                userId,
                assignationId,
                expenseLinesByType,
                attachments,
            },
            {
                onSuccess: (response: unknown) => {
                    const resp = response as ApiResponse;
                    if (resp.status === 201) {
                        setFormData({
                            assignationId: selectedAssignmentId || "",
                            userId: "",
                            expenseLinesByType: {},
                            attachments: [],
                        });
                        setFieldErrors({});
                        setViewMode("list");
                    } else if (resp.status === 400) {
                        const errorData = response as ApiResponse<{ fieldErrors: Record<string, string[]> }>;
                        if (errorData.data && "fieldErrors" in errorData.data) {
                            setFieldErrors(errorData.data.fieldErrors);
                        } else {
                            setFieldErrors({ general: [errorData.message || "Erreur de validation."] });
                        }
                    } else {
                        setFieldErrors({ general: [resp.message || "Erreur lors de la création."] });
                    }
                },
                onError: (error: unknown) => {
                    console.error("Erreur inattendue:", error);
                    setFieldErrors({ general: ["Une erreur inattendue est survenue."] });
                },
            }
        );
    };

    const handleSubmitSuccess = () => {
      setViewMode("list");
    };

    const handleError = (error: Error) => {
        console.error(error);
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            window.location.href = "/missions";
        }
    };

    const toggleView = () => {
        setViewMode((prev) => (prev === "form" ? "list" : "form"));
    };

    if (isLoadingTypes) {
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
                            <h1 className="page-title">Notes de Frais</h1>
                            <p className="page-subtitle">Mission #{selectedAssignmentId} · {subtitleText}</p>
                        </div>
                    </div>
                    <HeaderActions>
                        <ToggleButton
                            onClick={toggleView}
                            title={viewMode === "form" ? "Voir la liste des paiements" : "Ajouter une note de frais"}
                        >
                            {viewMode === "form" ? <ClipboardList size={16} /> : <Plus size={16} />}
                            {viewMode === "form" ? "Paiements" : "Note de Frais"}
                        </ToggleButton>
                    </HeaderActions>
                </PageHeader>
                <Separator />
                <SectionTitle>{viewMode === "form" ? "Ajouter une Note de Frais" : "Liste des Paiements"}</SectionTitle>
                <LoadingContainer>
                    <p style={{ marginLeft: "10px" }}>Chargement des types de notes de frais...</p>
                </LoadingContainer>
            </>
        );
    }

    if (hasErrorLoadingTypes || expenseReportTypes.length === 0) {
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
                            <h1 className="page-title">Notes de Frais</h1>
                            <p className="page-subtitle">Mission #{selectedAssignmentId} · {subtitleText}</p>
                        </div>
                    </div>
                    <HeaderActions>
                        <ToggleButton
                            onClick={toggleView}
                            title={viewMode === "form" ? "Voir la liste des paiements" : "Ajouter une note de frais"}
                        >
                            {viewMode === "form" ? <ClipboardList size={16} /> : <Plus size={16} />}
                            {viewMode === "form" ? "Paiements" : "Note de Frais"}
                        </ToggleButton>
                    </HeaderActions>
                </PageHeader>
                <Separator />
                <SectionTitle>{viewMode === "form" ? "Ajouter une Note de Frais" : "Liste des Paiements"}</SectionTitle>
                <p style={{ color: "var(--danger-color, #dc3545)", textAlign: "center", padding: "var(--spacing-md)" }}>
                    ⚠️ Une erreur est survenue lors du chargement des types de notes de frais ou aucune donnée n'est disponible.
                </p>
            </>
        );
    }

    // Rendu principal
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
                        <h1 className="page-title">Notes de Frais</h1>
                        <p className="page-subtitle">Mission #{selectedAssignmentId} · {subtitleText}</p>
                    </div>
                </div>
                <HeaderActions>
                    <ToggleButton
                        onClick={toggleView}
                        title={viewMode === "form" ? "Voir la liste des paiements" : "Ajouter une note de frais"}
                    >
                        {viewMode === "form" ? <ClipboardList size={16} /> : <Plus size={16} />}
                        {viewMode === "form" ? "Paiements" : "Note de Frais"}
                    </ToggleButton>
                </HeaderActions>
            </PageHeader>
            <Separator />
            {viewMode === "form" ? (
                <>
                    <form onSubmit={handleFormSubmit}>
                        <ExpenseReportStep
                            formData={formData}
                            fieldErrors={fieldErrors}
                            isSubmitting={createMutation.isPending}
                            handleInputChange={handleInputChange}
                            expenseReportTypes={expenseReportTypes}
                            onSubmitSuccess={handleSubmitSuccess}
                        />
                    </form>
                </>
            ) : (
                <>
                    <ExpenseReportList
                        selectedAssignmentId={selectedAssignmentId}
                        isLoading={assignationQuery.isLoading}
                        onError={handleError}
                    />
                </>
            )}
        </>
    );
};

export default OMNoteDeFrais;