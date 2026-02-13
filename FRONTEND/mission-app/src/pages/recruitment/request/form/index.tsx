import { Save, X } from "lucide-react";
import * as FaIcons from "react-icons/fa";
import React, { useCallback, useEffect, useState } from "react";
import {
    PopupOverlay,
    PagePopup,
    PopupHeader,
    PopupTitle,
    PopupClose,
    PopupContent,
    ButtonPrimary
} from "@/styles/popup-styles";
import {
    FormContainer,
    StepperWrapper,
    StepItem,
    StepContent,
    StepNavigation,
    NextButton,
    PreviousButton,
    GenericForm,
    FirstStepNavigation
} from "@/styles/form-container";
import Alert from "@/components/alert";
import PostInformationsStep from "./components/post-info-step";
import RecruitmentReasonStep from "./components/reasons-step";
import useRecruitmentForm from "./hooks/use-request-form";
import { useCreateRecruitmentRequest, useGetRecruitmentRequest, useGetUsersByDirection, useUpdateRecruitmentRequest } from "@/api/recruitment/service";
import axios from "axios";
import "../../style.css";
import { useNavigate } from "react-router-dom";

interface RecruitmentRequestFormProps {
    isOpen: boolean;
    onClose: () => void;
    isRegularisation: boolean;
    onFormSuccess: (type: string, message: string) => void;
    requestId?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const formatRequestId = (id: string | null) => {
  return id?.replace(/\//g, "_") ?? null;
};

const RecruitmentRequestForm: React.FC<RecruitmentRequestFormProps> = ({
    isOpen,
    onClose,
    isRegularisation,
    onFormSuccess,
    requestId,
}) => {
    const isUpdate = Boolean(requestId);
    const navigate = useNavigate();
    const { data: initialData, isLoading: isLoadingInitialData } = 
        useGetRecruitmentRequest(requestId);

    const {
        currentStep,
        formData,
        fieldErrors,
        handleInputChange,
        validateStep2,
        handleNext,
        handlePrevious,
        handleReset,
        currentUser,
    } = useRecruitmentForm({
        mode: isUpdate ? "edit" : "create",
        initialData
    });

// Mutations
    const createRequest = useCreateRecruitmentRequest();
    const updateRequest = useUpdateRecruitmentRequest(requestId);

    const [sharedDirection, setSharedDirection] = useState<string>("");
    useEffect(() => {
        if (currentUser?.direction) {
            setSharedDirection(currentUser.direction);
        }
    }, [currentUser]);

    const {
        data: usersByDirection
    } = useGetUsersByDirection(sharedDirection, true);

    const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "info" | "error"; message: string }>({
        isOpen: false, type: "info", message: ""
    });

    const handleAlertClose = useCallback(() => setAlert((a) => ({ ...a, isOpen: false })), []);
    const showError = useCallback((message: string) => setAlert({ isOpen: true, type: "error", message }), []);

    if(!isOpen) return null;
    if (isUpdate && isLoadingInitialData) return <div>Chargement des données...</div>;

// Construction payload propre
    const buildPayload = () => ({
        ...formData,
        effective: formData.effective ? Number(formData.effective) : null,
        monthDuration: formData.monthDuration ? Number(formData.monthDuration) : null,
        contractId: formData.contractId === "other" ? null : formData.contractId,
        replacementReasonId: formData.replacementReasonId === "other" ? null : formData.replacementReasonId,
        beginningDate: new Date(formData.beginningDate).toISOString().split("T")[0]
    });

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if(currentStep === 1) {
            handleNext(isRegularisation); return;
        }

        if(currentStep === 2) {
            const ok = validateStep2();
            if(!ok) {
                showError("Veuillez corriger les erreurs avant de valider.");
                return;
            }

            try {
                const payload = buildPayload();
                let resp = null;
                // console.log("PAYLOAD :", payload);

                if (isUpdate && requestId) {
                    resp = await updateRequest.mutateAsync(payload);
                    setAlert({ isOpen: true, type: "success", message: resp.message });
                    onFormSuccess("success", resp.message);
                } else {
                    resp = await createRequest.mutateAsync(payload);
                    setAlert({ isOpen: true, type: "success", message: resp.message });
                    onFormSuccess("success", resp.message);
                }

                handleReset();
                onClose();
                
                const createReqId = resp.data;
                navigate(`/recrutement/demandes/${formatRequestId(requestId??createReqId)}/details`);
            } 
            catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    const status = error.response?.status;
                    const backendMessage =
                        (error.response?.data)?.message ??
                        (error.response?.data)?.error ??
                        error.message;

                    showError(
                        `Erreur ${status ?? ""} : ${backendMessage}`
                    );
                }
                else if (error instanceof Error) {
                    showError(error.message);
                }
                else {
                    showError("Erreur inconnue lors de la création de la demande.");
                }
            }
        }
    };
    // console.log("Régularisation: ",isRegularisation);

    return (
        <PopupOverlay>
            <PagePopup>
                <PopupHeader>
                    {isUpdate ? 
                        <PopupTitle>Modification de la demande</PopupTitle> 
                        : <PopupTitle>Demande de recrutement</PopupTitle>
                    }

                    <PopupClose
                        onClick={() => { handleReset(); onClose(); }}
                        aria-label="Fermer le formulaire"
                        title="Fermer"
                    >
                        <X className="w-5 h-5" />
                    </PopupClose>
                </PopupHeader>

                <PopupContent>
                    {alert.isOpen && (
                        <Alert type={alert.type} message={alert.message} isOpen={alert.isOpen} onClose={handleAlertClose} />
                    )}

                    <StepperWrapper>
                        <StepItem active={currentStep === 1}>
                            <span>1</span> Informations du poste
                        </StepItem>
                        <StepItem active={currentStep === 2}>
                            <span>2</span> Motifs du recrutement
                        </StepItem>
                    </StepperWrapper>

                    <FormContainer>
                        <GenericForm id="recruitmentForm" onSubmit={onSubmit}>
                            <StepContent active={currentStep === 1}>
                                <PostInformationsStep
                                    formData={{
                                        post: formData.post,
                                        effective: formData.effective?.toString()??"",
                                        contractId: formData.contractId!="" ? formData.contractId:null,
                                        contractPrecision: formData.contractPrecision!="" ? formData.contractPrecision:null,
                                        monthDuration: formData.monthDuration?.toString()??"",
                                        sites: formData.sites,
                                        applicantUserId: formData.applicantUserId ?? "",
                                        creatorId: currentUser?.id ?? "",
                                        direction: formData.direction ?? "",
                                        functionalManagerId: formData.functionalManagerId ?? "",
                                        hierarchicalManagerId: formData.hierarchicalManagerId ?? "",
                                    }}
                                    isRegularisation={isRegularisation}
                                    user={currentUser}
                                    usersByDirection={usersByDirection?.data ?? []}
                                    fieldErrors={fieldErrors}
                                    isSubmitting={false}
                                    suggestions={{ applicant: [] }}
                                    handleInputChange={handleInputChange}
                                    onDirectionChange={setSharedDirection}
                                />
                                <FirstStepNavigation>
                                    <NextButton
                                        type="button"
                                        onClick={() => handleNext(isRegularisation)}
                                        aria-label="Passer à l'étape suivante"
                                        title="Suivant"
                                    >
                                        Suivant <FaIcons.FaArrowRight className="w-4 h-4" />
                                    </NextButton>
                                </FirstStepNavigation>
                            </StepContent>

                            <StepContent active={currentStep === 2}>
                                <RecruitmentReasonStep
                                    formData={{
                                        isReplacement: formData.isReplacement,
                                        replacementReasonId: formData.replacementReasonId!="" ? formData.replacementReasonId:null,
                                        replacementDate: formData.replacementDate!="" ? formData.replacementDate:null,
                                        reasonPrecision: formData.reasonPrecision,
                                        isPlanned: formData.isPlanned,
                                        notPlannedReason: formData.notPlannedReason,
                                        lastTitularId: formData.lastTitularId,
                                        beginningDate: formData.beginningDate,
                                    }}
                                    usersByDirection={usersByDirection?.data ?? []}
                                    fieldErrors={fieldErrors}
                                    isSubmitting={false}
                                    handleInputChange={handleInputChange}
                                    direction={sharedDirection}
                                />
                                <StepNavigation>
                                    <PreviousButton
                                        type="button"
                                        onClick={handlePrevious}
                                        aria-label="Revenir à l'étape précédente"
                                        title="Précédent"
                                    >
                                        <FaIcons.FaArrowLeft className="w-4 h-4" /> Précédent
                                    </PreviousButton>
                                    <ButtonPrimary
                                        type="submit"
                                        title="Valider la demande"
                                        aria-label="Valider la demande"
                                    >
                                        <Save size={16} aria-hidden="true" />
                                        {isUpdate ? 
                                            <span>Mettre à jour</span> : <span>Créer la demande</span>
                                        }
                                    </ButtonPrimary>
                                </StepNavigation>
                            </StepContent>
                        </GenericForm>
                    </FormContainer>
                </PopupContent>
            </PagePopup>
        </PopupOverlay>
    );
};

export default RecruitmentRequestForm;
