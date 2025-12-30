"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { ExpenseReportType, ExpenseLine, Attachment } from "@/api/mission/expense_report/services";
import { useAllExpenseReportTypes, useCreateExpenseReport } from "@/api/mission/expense_report/services";
import { useGetMissionById } from "@/api/mission/services";
import { useCompensationsByEmployeeAndMission, type Compensation } from "@/api/mission/compensation(indemnité)/services";
import ExpenseReportStep from "./step/expense-report-step";
import ExpenseReportList from "./step/expense-report-list";
import OMPayment from "../payment/om-payment";
import { ClipboardList, Plus, Wallet, AlertCircle } from "lucide-react";
import {
  PageHeader,
  HeaderLeft,
  SectionTitle,
  LoadingContainer,
  HeaderActions,
  ToggleButton,
  Separator,
  ActionButton,
} from "@/styles/detailsmission-styles";
import { NoDataMessage } from "@/styles/table-styles";
import Alert from "@/components/alert";
import { Button } from "@/styles/form-container";
import { MissionStatusEnum, MissionTypeEnum, normalizeMissionStatus } from "@/api/mission/services";

interface FormData {
    missionId: string;
    userId: string;
    expenseLinesByType: Record<string, ExpenseLine[]>;
    attachments: Attachment[];
}

interface ApiResponse<T = unknown> {
    status: number;
    data?: T;
    message?: string;
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
  dailyPaiements: Array<{
    date: string;
    totalAmount: number;
    compensationScales: Array<{
      amount: number;
      expenseType?: { type: string };
      transportId?: string;
    }>;
  }>;
  assignmentDetails: AssignmentDetails;
  totalAmount: number;
}

interface OMNoteDeFraisProps {
    selectedMissionId?: string;
    onBack?: () => void;
    missionPayment?: MissionPayment;
    onExportExcel?: () => void;
    formatDate?: (date: string) => string;
}

const OMNoteDeFrais: React.FC<OMNoteDeFraisProps> = ({ 
    selectedMissionId: propMissionId,
    onBack,
    missionPayment 
}) => {
    const params = useParams<{ missionId?: string }>();
    const urlMissionId = params.missionId;
    const selectedMissionId = urlMissionId || propMissionId;
    
    const [formData, setFormData] = useState<FormData>({
        missionId: selectedMissionId || "",
        userId: "",
        expenseLinesByType: {},
        attachments: [],
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [localMissionPayment, setLocalMissionPayment] = useState<MissionPayment | null>(null);
    const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "error" | "warning" | "info"; message: string }>({
        isOpen: false, type: "info", message: ""
    });

    const [expenseReportTypes, setExpenseReportTypes] = useState<ExpenseReportType[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);
    const [hasErrorLoadingTypes, setHasErrorLoadingTypes] = useState(false);

    const [viewMode, setViewMode] = useState<"avance" | "list" | "form">("list");

    const { data: expenseReportTypesData, isLoading: loadingTypes, error: typesError } = useAllExpenseReportTypes();

    const missionQuery = useGetMissionById(selectedMissionId || "");
    const createMutation = useCreateExpenseReport();

    const employeeId = missionQuery.data?.data?.employeeId;
    const missionId = selectedMissionId;

    const isInternational = useMemo(() => {
        return missionQuery.data?.data?.missionType === MissionTypeEnum.International;
    }, [missionQuery.data]);

    const missionStatus = useMemo(() => {
        if (!missionQuery.data?.data) return MissionStatusEnum.Unknown;
        return normalizeMissionStatus(missionQuery.data.data.status);
    }, [missionQuery.data]);

    const isMissionCompleted = useMemo(() => {
        return missionStatus === MissionStatusEnum.Completed || 
               missionStatus === MissionStatusEnum.Closed;
    }, [missionStatus]);

    const isMissionClosed = useMemo(() => {
        return missionStatus === MissionStatusEnum.Closed || 
               missionStatus === MissionStatusEnum.Canceled;
    }, [missionStatus]);

    // RÈGLE CORRIGÉE : NI missions nationales NI missions internationales ne peuvent créer
    // de notes de frais si la mission n'est pas terminée
    const canCreateNewExpenseReport = useMemo(() => {
        if (isMissionClosed) return false;
        return isMissionCompleted; // Toutes les missions (nationales ET internationales) doivent être terminées
    }, [isMissionCompleted, isMissionClosed]);

    // CORRECTION : Déclarer compensationsResponse AVANT de l'utiliser dans useEffect
    const { data: compensationsResponse, isLoading: compensationsLoading } = useCompensationsByEmployeeAndMission(
        employeeId ?? undefined,
        missionId ?? undefined
    );

    useEffect(() => {
        if (selectedMissionId && formData.missionId !== selectedMissionId) {
            setFormData(prev => ({
                ...prev,
                missionId: selectedMissionId
            }));
        }
    }, [formData.missionId, selectedMissionId]);

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

    useEffect(() => {
        if (missionPayment) {
            setLocalMissionPayment(missionPayment);
        } else if (compensationsResponse?.data && missionQuery.data?.data) {
            const responseData = compensationsResponse.data;
            const { compensations } = responseData;
            const missionData = missionQuery.data.data;
            
            const totalAmount = compensations.reduce((sum, comp) => {
                const communicationAmount = comp.communicationAmount ?? 0;
                const visaAmount = comp.visaAmount ?? 0;
                const medicalExpensesAmount = comp.medicalExpensesAmount ?? 0;
                const taxesAmount = comp.taxesAmount ?? 0;
                return sum + (comp.totalAmount || (
                    (comp.transportAmount ?? 0) +
                    (comp.breakfastAmount ?? 0) +
                    (comp.lunchAmount ?? 0) +
                    (comp.dinnerAmount ?? 0) +
                    (comp.accommodationAmount ?? 0) +
                    communicationAmount +
                    visaAmount +
                    medicalExpensesAmount +
                    taxesAmount   
                ));
            }, 0);
            
            const dailyPaiements = compensations
                .map((comp: Compensation) => {
                    const communicationAmount = comp.communicationAmount ?? 0;
                    const visaAmount = comp.visaAmount ?? 0;
                    const medicalExpensesAmount = comp.medicalExpensesAmount ?? 0;
                    const taxesAmount = comp.taxesAmount ?? 0;
                    const totalForDay = comp.totalAmount || (
                        (comp.transportAmount ?? 0) +
                        (comp.breakfastAmount ?? 0) +
                        (comp.lunchAmount ?? 0) +
                        (comp.dinnerAmount ?? 0) +
                        (comp.accommodationAmount ?? 0) +
                        communicationAmount +
                        visaAmount +
                        medicalExpensesAmount +
                        taxesAmount
                    );
                    const compensationScales: Array<{
                        amount: number;
                        expenseType?: { type: string };
                        transportId?: string;
                    }> = [];
                    if ((comp.transportAmount ?? 0) > 0) {
                        compensationScales.push({ 
                            amount: comp.transportAmount!, 
                            expenseType: { type: "Transport" },
                            transportId: missionData.transportId ?? undefined 
                        });
                    }
                    if ((comp.breakfastAmount ?? 0) > 0) {
                        compensationScales.push({ 
                            amount: comp.breakfastAmount!, 
                            expenseType: { type: "Petit Déjeuner" } 
                        });
                    }
                    if ((comp.lunchAmount ?? 0) > 0) {
                        compensationScales.push({ 
                            amount: comp.lunchAmount!, 
                            expenseType: { type: "Déjeuner" } 
                        });
                    }
                    if ((comp.dinnerAmount ?? 0) > 0) {
                        compensationScales.push({ 
                            amount: comp.dinnerAmount!, 
                            expenseType: { type: "Dinner" } 
                        });
                    }
                    if ((comp.accommodationAmount ?? 0) > 0) {
                        compensationScales.push({ 
                            amount: comp.accommodationAmount!, 
                            expenseType: { type: "Hébergement" } 
                        });
                    }
                    if (communicationAmount > 0) {
                        compensationScales.push({ 
                            amount: communicationAmount, 
                            expenseType: { type: "Communication" } 
                        });
                    }
                    if (visaAmount > 0) {
                        compensationScales.push({ 
                            amount: visaAmount, 
                            expenseType: { type: "Visa sur place" } 
                        });
                    }
                    if (medicalExpensesAmount > 0) {
                        compensationScales.push({ 
                            amount: medicalExpensesAmount, 
                            expenseType: { type: "Frais médicaux" } 
                        });
                    }
                    if (taxesAmount > 0) {
                        compensationScales.push({ 
                            amount: taxesAmount, 
                            expenseType: { type: "Taxes" } 
                        });
                    }
                    return {
                        date: comp.paymentDate,
                        totalAmount: totalForDay,
                        compensationScales,
                    };
                })
                .filter((payment) => payment.compensationScales.length > 0);

            const assignmentDetails: AssignmentDetails = {
                beneficiary: `${missionData.employee.firstName} ${missionData.employee.lastName}`,
                matricule: missionData.employee.employeeCode ?? '',
                missionTitle: missionData.name ?? '',
                function: missionData.employee.jobTitle ?? '',
                base: missionData.employee.site.siteName ?? '',
                meansOfTransport: missionData.transport?.type ?? "Non spécifié",
                direction: missionData.employee.direction?.directionName ?? '',
                departmentService: `${missionData.employee.department?.departmentName ?? ''} / ${missionData.employee.service?.serviceName ?? ''}`,
                costCenter: missionData.allocatedFund,
                departureDate: missionData.departureDate ?? '',
                departureTime: missionData.departureTime ?? '',
                missionDuration: missionData.duration,
                returnDate: missionData.returnDate ?? '',
                returnTime: missionData.returnTime ?? '',
                startDate: missionData.startDate ?? '',
            };

            setLocalMissionPayment({
                dailyPaiements,
                assignmentDetails,
                totalAmount,
            });
        }
    }, [compensationsResponse, missionQuery.data, missionPayment]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === "missionId" && selectedMissionId) {
            return;
        }
        
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (value) {
            setFieldErrors((prev) => ({ ...prev, [name]: [] }));
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const { missionId, userId, expenseLinesByType, attachments } = formData;
        
        if (!canCreateNewExpenseReport) {
            if (isMissionClosed) {
                setAlert({
                    isOpen: true,
                    type: "error",
                    message: "Impossible de soumettre : la mission est clôturée."
                });
            } else {
                setAlert({
                    isOpen: true,
                    type: "error",
                    message: "Impossible de soumettre : la mission n'est pas encore terminée."
                });
            }
            return;
        }
        
        if (!missionId) {
            setFieldErrors({ missionId: ["La mission est requise."] });
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
                missionId,
                expenseLinesByType,
                attachments,
            },
            {
                onSuccess: (response: unknown) => {
                    const resp = response as ApiResponse;
                    if (resp.status === 201) {
                        setFormData({
                            missionId: selectedMissionId || "",
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

    const toggleNotesDeFraisView = () => {
        if (viewMode === "form") {
            setViewMode("list");
        } else if (viewMode === "list") {
            if (!canCreateNewExpenseReport) {
                if (isMissionClosed) {
                    setAlert({
                        isOpen: true,
                        type: "warning",
                        message: "Mission clôturée. Vous ne pouvez pas créer de nouveaux rapports."
                    });
                } else {
                    setAlert({
                        isOpen: true,
                        type: "warning",
                        message: "La mission n'est pas encore terminée. Vous ne pouvez créer des notes de frais que lorsque la mission est terminée."
                    });
                }
                return;
            }
            
            setViewMode("form");
        } else if (viewMode === "avance") {
            setViewMode("list");
        }
    };

    const openAvanceView = () => {
        if (!isInternational) {
            return;
        }
        setViewMode("avance");
    };

    const getToggleButtonContent = () => {
        if (viewMode === "form") {
            return {
                icon: <ClipboardList size={16} />,
                label: "Liste des Notes",
                title: "Voir la liste des notes de frais",
                disabled: false
            };
        } else {
            let title = "Ajouter une nouvelle note de frais";
            const disabled = !canCreateNewExpenseReport; // CORRECTION : const au lieu de let
            
            if (isMissionClosed) {
                title = "Mission clôturée - Action désactivée";
            } else if (!isMissionCompleted) {
                title = "Mission non terminée - Action désactivée";
            }
            
            return {
                icon: <Plus size={16} />,
                label: viewMode === "avance" ? "Nouvelle Note de Frais" : "Nouvelle Note",
                title,
                disabled
            };
        }
    };

    const toggleContent = getToggleButtonContent();

    const defaultOnExportExcel = () => {};
    const defaultOnBack = () => {};
    const defaultFormatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const renderMissionStatusBadge = () => {
        if (isMissionClosed) {
            return (
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--warning-bg)',
                    color: 'var(--warning-color)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    marginLeft: '12px',
                    fontWeight: '500'
                }}>
                    <AlertCircle size={12} style={{ marginRight: '4px' }} />
                    Mission Clôturée
                </div>
            );
        }
        
        if (!isMissionCompleted) {
            return (
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--warning-bg)',
                    color: 'var(--warning-color)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    marginLeft: '12px',
                    fontWeight: '500'
                }}>
                    <AlertCircle size={12} style={{ marginRight: '4px' }} />
                    Mission en Cours
                </div>
            );
        }
        
        return null;
    };

    if (isLoadingTypes) {
        return (
            <>
                <PageHeader>
                    <HeaderLeft>
                        {/* Contenu du HeaderLeft */}
                    </HeaderLeft>
                    
                    <HeaderActions>
                        <ToggleButton
                            onClick={toggleNotesDeFraisView}
                            title={toggleContent.title}
                            disabled={toggleContent.disabled}
                            style={toggleContent.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                            {toggleContent.icon}
                            {toggleContent.label}
                        </ToggleButton>
                        {isInternational && localMissionPayment && (
                            <ActionButton onClick={openAvanceView} title="Voir les indemnités avancées">
                                <Wallet size={16} /> Indemnités Avancées
                            </ActionButton>
                        )}
                    </HeaderActions>
                </PageHeader>
                <Separator />
                <SectionTitle>Chargement...</SectionTitle>
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
                        {/* Contenu du HeaderLeft */}
                    </HeaderLeft>
                    
                    <HeaderActions>
                        <ToggleButton
                            onClick={toggleNotesDeFraisView}
                            title={toggleContent.title}
                            disabled={toggleContent.disabled}
                            style={toggleContent.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                            {toggleContent.icon}
                            {toggleContent.label}
                        </ToggleButton>
                        {isInternational && localMissionPayment && (
                            <ActionButton onClick={openAvanceView} title="Voir les indemnités avancées">
                                <Wallet size={16} /> Indemnités Avancées
                            </ActionButton>
                        )}
                    </HeaderActions>
                </PageHeader>
                <Separator />
                <SectionTitle>{viewMode === "avance" ? "Indemnités Avancées" : "Notes de Frais"}</SectionTitle>
                <p style={{ color: "var(--danger-color, #dc3545)", textAlign: "center", padding: "var(--spacing-md)" }}>
                    ⚠️ Une erreur est survenue lors du chargement des types de notes de frais ou aucune donnée n'est disponible.
                </p>
            </>
        );
    }

    return (
        <>
            <Alert 
                type={alert.type} 
                message={alert.message} 
                isOpen={alert.isOpen} 
                onClose={() => setAlert({ ...alert, isOpen: false })} 
            />
            <PageHeader>
                <HeaderLeft>
                    {/* Contenu du HeaderLeft */}
                    {renderMissionStatusBadge()}
                </HeaderLeft>
                
                <HeaderActions>
                    <ToggleButton
                        onClick={toggleNotesDeFraisView}
                        title={toggleContent.title}
                        disabled={toggleContent.disabled}
                        style={toggleContent.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                        {toggleContent.icon}
                        {toggleContent.label}
                        {toggleContent.disabled && <AlertCircle size={14} style={{ marginLeft: '8px', color: 'var(--warning-color)' }} />}
                    </ToggleButton>
                    
                    {/* Bouton pour les indemnités avancées - visible si mission internationale ET il y a des données de paiement */}
                    {isInternational && localMissionPayment && (
                        <ActionButton 
                            onClick={openAvanceView} 
                            title="Voir les indemnités avancées"
                            style={{ 
                                background: viewMode === "avance" ? 'var(--primary-dark)' : 'var(--primary-color)',
                                color: 'var(--text-white)'
                            }}
                        >
                            <Wallet size={16} /> Indemnités Avancées
                        </ActionButton>
                    )}
                    
                    {/* Bouton de retour depuis la vue avance */}
                    {viewMode === "avance" && (
                        <ActionButton 
                            onClick={() => setViewMode("list")} 
                            title="Retour aux notes de frais"
                            style={{ background: 'var(--secondary-color)', color: 'var(--text-white)' }}
                        >
                            <ClipboardList size={16} /> Retour aux Notes
                        </ActionButton>
                    )}
                </HeaderActions>
            </PageHeader>
            <Separator />
            
            {viewMode === "avance" ? (
                missionQuery.isLoading || compensationsLoading ? (
                    <LoadingContainer>
                        <p style={{ marginLeft: "10px" }}>Chargement des indemnités avancées...</p>
                    </LoadingContainer>
                ) : isInternational && localMissionPayment ? (
                    <OMPayment
                        missionPayment={localMissionPayment}
                        selectedMissionId={selectedMissionId || ""}
                        onExportExcel={defaultOnExportExcel}
                        formatDate={defaultFormatDate}
                        onBack={onBack || defaultOnBack}
                        missionId={missionId || ""}
                        employeeId={employeeId || ""}
                    />
                ) : (
                    <NoDataMessage>Aucune indemnité trouvée pour cette mission.</NoDataMessage>
                )
            ) : viewMode === "form" ? (
                <>
                    {isMissionClosed ? (
                        <div style={{
                            padding: "2rem",
                            textAlign: "center",
                            backgroundColor: "var(--warning-bg)",
                            borderRadius: "8px",
                            border: "1px solid var(--warning-color)",
                            marginBottom: "2rem"
                        }}>
                            <AlertCircle size={48} color="var(--warning-color)" style={{ marginBottom: "1rem" }} />
                            <h3 style={{ color: "var(--warning-color)", marginBottom: "0.5rem" }}>
                                Mission Clôturée
                            </h3>
                            <p style={{ color: "var(--text-color)", marginBottom: "1.5rem" }}>
                                Cette mission est clôturée. Vous ne pouvez plus soumettre de nouveaux rapports de frais.
                            </p>
                            <Button 
                                type="button"
                                onClick={() => setViewMode("list")}
                                style={{
                                    background: "var(--primary-color)",
                                    color: "var(--text-white)",
                                    padding: "10px 20px",
                                    borderRadius: "4px",
                                    fontSize: "0.875rem"
                                }}
                            >
                                Voir les rapports existants
                            </Button>
                        </div>
                    ) : !isMissionCompleted ? (
                        <div style={{
                            padding: "2rem",
                            textAlign: "center",
                            backgroundColor: "var(--warning-bg)",
                            borderRadius: "8px",
                            border: "1px solid var(--warning-color)",
                            marginBottom: "2rem"
                        }}>
                            <AlertCircle size={48} color="var(--warning-color)" style={{ marginBottom: "1rem" }} />
                            <h3 style={{ color: "var(--warning-color)", marginBottom: "0.5rem" }}>
                                Mission Non Terminée
                            </h3>
                            <p style={{ color: "var(--text-color)", marginBottom: "1.5rem" }}>
                                Cette mission n'est pas encore terminée. Vous ne pouvez créer des notes de frais que lorsque la mission est terminée.
                            </p>
                            <p style={{ color: "var(--text-color)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
                                <strong>Statut actuel :</strong> {missionQuery.data?.data?.status || "En cours"}
                                <br />
                                <strong>Type de mission :</strong> {isInternational ? "Internationale" : "Nationale"}
                            </p>
                            <Button 
                                type="button"
                                onClick={() => setViewMode("list")}
                                style={{
                                    background: "var(--primary-color)",
                                    color: "var(--text-white)",
                                    padding: "10px 20px",
                                    borderRadius: "4px",
                                    fontSize: "0.875rem"
                                }}
                            >
                                Retour à la liste
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleFormSubmit}>
                            <ExpenseReportStep
                                formData={formData}
                                fieldErrors={fieldErrors}
                                isSubmitting={createMutation.isPending}
                                handleInputChange={handleInputChange}
                                expenseReportTypes={expenseReportTypes}
                                onSubmitSuccess={handleSubmitSuccess}
                                isMissionClosed={isMissionClosed}
                            />
                        </form>
                    )}
                </>
            ) : (
                // Vue LIST - Toujours affichée
                <>
                    {!isMissionCompleted && (
                        <div style={{
                            backgroundColor: "#fff3cd",
                            border: "1px solid #ffeaa7",
                            borderRadius: "var(--radius-sm)",
                            padding: "var(--spacing-md)",
                            marginBottom: "var(--spacing-md)",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "var(--spacing-sm)",
                        }}>
                            <AlertCircle size={20} color="#856404" />
                            <div>
                                <div style={{ fontWeight: "bold", color: "#856404", marginBottom: "4px" }}>
                                    Note de frais non disponible pour création
                                </div>
                                <div style={{ color: "#856404", fontSize: "14px" }}>
                                    La note de frais ne peut être créée que lorsque la mission est terminée.
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {isMissionClosed && (
                        <div style={{
                            backgroundColor: "#f8d7da",
                            border: "1px solid #f5c6cb",
                            borderRadius: "var(--radius-sm)",
                            padding: "var(--spacing-md)",
                            marginBottom: "var(--spacing-md)",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "var(--spacing-sm)",
                        }}>
                            <AlertCircle size={20} color="#721c24" />
                            <div>
                                <div style={{ fontWeight: "bold", color: "#721c24", marginBottom: "4px" }}>
                                    Mission Clôturée
                                </div>
                                <div style={{ color: "#721c24", fontSize: "14px" }}>
                                    Cette mission est clôturée. Vous ne pouvez plus créer de nouvelles notes de frais.
                                    <br />
                                    <br />
                                    <strong>Note :</strong> Vous pouvez toujours consulter les notes de frais existantes ci-dessous.
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <ExpenseReportList
                        selectedMissionId={selectedMissionId}
                        isLoading={missionQuery.isLoading}
                        onError={handleError}
                    />
                </>
            )}
        </>
    );
};

export default OMNoteDeFrais;