"use client";

import { useState, useEffect, useMemo } from "react";
import type { ExpenseReportType, ExpenseLine, Attachment } from "@/api/mission/expense_report/services";
import { useAllExpenseReportTypes, useCreateExpenseReport } from "@/api/mission/expense_report/services";
import { useGetMissionById } from "@/api/mission/services";
import { useCompensationsByEmployeeAndMission, type Compensation } from "@/api/mission/compensation(indemnité)/services";
import ExpenseReportStep from "./step/expense-report-step";
import ExpenseReportList from "./step/expense-report-list";
import OMPayment from "../payment/om-payment";
import { ClipboardList, Plus, Wallet } from "lucide-react";
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

interface FormData {
    assignationId: string; // Garder assignationId pour la compatibilité avec l'API
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
    selectedMissionId,
    onBack 
}) => {
    const [formData, setFormData] = useState<FormData>({
        assignationId: selectedMissionId || "",
        userId: "",
        expenseLinesByType: {},
        attachments: [],
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [localMissionPayment, setLocalMissionPayment] = useState<MissionPayment | null>(null);

    const [expenseReportTypes, setExpenseReportTypes] = useState<ExpenseReportType[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);
    const [hasErrorLoadingTypes, setHasErrorLoadingTypes] = useState(false);

    const [viewMode, setViewMode] = useState<"avance" | "list" | "form">("avance");

    const { data: expenseReportTypesData, isLoading: loadingTypes, error: typesError } = useAllExpenseReportTypes();

    // Utilisation du nouveau hook basé sur les missions
    const missionQuery = useGetMissionById(selectedMissionId || "");

    const createMutation = useCreateExpenseReport();

    // Adaptation pour utiliser les données de mission directement
    const employeeId = missionQuery.data?.data?.employeeId;
    const missionId = selectedMissionId;

    const isInternational = useMemo(() => {
        return missionQuery.data?.data?.missionType === 2; // 2 = MissionTypeEnum.International
    }, [missionQuery.data]);

    const { data: compensationsResponse, isLoading: compensationsLoading } = useCompensationsByEmployeeAndMission(
        employeeId ?? undefined,
        missionId ?? undefined
    );

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
        if (compensationsResponse?.data && missionQuery.data?.data) {
          const responseData = compensationsResponse.data;
          const {compensations } = responseData;
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

          // Construction des détails d'assignation à partir des données de mission
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
    }, [compensationsResponse, missionQuery.data]);

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
        
        // Utiliser missionId pour l'assignationId
        if (!assignationId) {
            setFieldErrors({ assignationId: ["La mission est requise."] });
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
                assignationId: assignationId, // Utiliser assignationId qui contient missionId
                expenseLinesByType,
                attachments,
            },
            {
                onSuccess: (response: unknown) => {
                    const resp = response as ApiResponse;
                    if (resp.status === 201) {
                        setFormData({
                            assignationId: selectedMissionId || "",
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
        if (viewMode === "avance") {
            setViewMode("form");
        } else {
            setViewMode((prev) => (prev === "form" ? "list" : "form"));
        }
    };

    const openAvanceView = () => {
        if (!isInternational) {
            return;
        }
        setViewMode("avance");
    };

    const getToggleButtonContent = () => {
        if (viewMode === "avance") {
            return {
                icon: <Plus size={16} />,
                label: "Nouvelle Note de Frais",
                title: "Ajouter une note de frais post-mission"
            };
        } else if (viewMode === "form") {
            return {
                icon: <ClipboardList size={16} />,
                label: "Liste des Notes",
                title: "Voir la liste des notes de frais"
            };
        } else {
            return {
                icon: <Plus size={16} />,
                label: "Nouvelle Note",
                title: "Ajouter une nouvelle note de frais"
            };
        }
    };

    const defaultOnExportExcel = () => {};
    const defaultOnBack = () => {};
    const defaultFormatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    if (isLoadingTypes) {
        return (
            <>
                <PageHeader>
                    <HeaderLeft>
                        
                    </HeaderLeft>
                    
                    <HeaderActions>
                        <ToggleButton
                            onClick={toggleNotesDeFraisView}
                            title={getToggleButtonContent().title}
                        >
                            {getToggleButtonContent().icon}
                            {getToggleButtonContent().label}
                        </ToggleButton>
                        <ActionButton onClick={openAvanceView} title="Voir les indemnités avancées">
                            <Wallet size={16} /> Indemnités Avancées
                        </ActionButton>
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
                        
                    </HeaderLeft>
                    
                    <HeaderActions>
                        <ToggleButton
                            onClick={toggleNotesDeFraisView}
                            title={getToggleButtonContent().title}
                        >
                            {getToggleButtonContent().icon}
                            {getToggleButtonContent().label}
                        </ToggleButton>
                        {missionQuery.data && isInternational && <ActionButton onClick={openAvanceView} title="Voir les indemnités avancées">
                            <Wallet size={16} /> Indemnités Avancées
                        </ActionButton>}
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
            <PageHeader>
                <HeaderLeft>
                    
                </HeaderLeft>
                
                <HeaderActions>
                    <ToggleButton
                        onClick={toggleNotesDeFraisView}
                        title={getToggleButtonContent().title}
                    >
                        {getToggleButtonContent().icon}
                        {getToggleButtonContent().label}
                    </ToggleButton>
                    {missionQuery.data && isInternational && <ActionButton onClick={openAvanceView} title="Voir les indemnités avancées">
                        <Wallet size={16} /> Indemnités Avancées
                    </ActionButton>}
                </HeaderActions>
            </PageHeader>
            <Separator />
            {viewMode === "avance" ? (
                missionQuery.isLoading || compensationsLoading ? (
                    <LoadingContainer>
                        <p style={{ marginLeft: "10px" }}>Chargement des indemnités avancées...</p>
                    </LoadingContainer>
                ) : isInternational ? (
                    localMissionPayment ? (
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
                ) : (
                    <NoDataMessage>Les indemnités avancées ne sont disponibles que pour les missions internationales.</NoDataMessage>
                )
            ) : viewMode === "form" ? (
                <>
                    {/* <SectionTitle>Ajouter une Note de Frais</SectionTitle> */}
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
                    {/* <SectionTitle>Liste des Notes de Frais</SectionTitle> */}
                    <ExpenseReportList
                        selectedAssignmentId={selectedMissionId} // Garder selectedAssignmentId pour la compatibilité
                        isLoading={missionQuery.isLoading}
                        onError={handleError}
                    />
                </>
            )}
        </>
    );
};

export default OMNoteDeFrais;