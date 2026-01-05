import { Save, X } from "lucide-react";
import * as FaIcons from "react-icons/fa";
import React, { useCallback, useState } from "react";
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
    GenericForm
} from "@/styles/form-container";
import Alert from "@/components/alert";
import PostInformationsStep from "./components/post-info-step";
import RecruitmentReasonStep from "./components/reasons-step";
import useRecruitmentForm from "./hooks/use-request-form";
import { useCreateRecruitmentRequest, useGetRecruitmentRequest, useUpdateRecruitmentRequest } from "@/api/recruitment/service";
import axios from "axios";

interface RecruitmentRequestFormProps {
    isOpen: boolean;
    onClose: () => void;
    onFormSuccess: (type: string, message: string) => void;
    requestId?: string;
}

const RecruitmentRequestForm: React.FC<RecruitmentRequestFormProps> = ({
    isOpen,
    onClose,
    onFormSuccess,
    requestId
}) => {
    const isUpdate = Boolean(requestId);
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
    } = useRecruitmentForm({
        mode: isUpdate ? "edit" : "create",
        initialData
    });

// Mutations
    const createRequest = useCreateRecruitmentRequest();
    const updateRequest = useUpdateRecruitmentRequest(requestId);

    const [sharedDirection, setSharedDirection] = useState<string>("");

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
        contractId: formData.contractId === "other" ? null : formData.contractId,
        replacementReasonId: formData.replacementReasonId === "other" ? null : formData.replacementReasonId,
        beginningDate: new Date(formData.beginningDate).toISOString().split("T")[0]
    });

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
      
        if(currentStep === 1) {
            handleNext();
            return;
        }

        if(currentStep === 2) {
            const ok = validateStep2();
            if(!ok) {
                showError("Veuillez corriger les erreurs avant de valider.");
                return;
            }

            try {
                const payload = buildPayload();

                if (isUpdate && requestId) {
                    await updateRequest.mutateAsync(payload);
                    setAlert({ isOpen: true, type: "success", message: "Demande mise à jour avec succès !" });
                    onFormSuccess("success", "Demande mise à jour avec succès !");
                } else {
                    await createRequest.mutateAsync(payload);
                    setAlert({ isOpen: true, type: "success", message: "Demande créée avec succès !" });
                    onFormSuccess("success", "Demande créée avec succès !");
                }

                handleReset();
                onClose();
            } 
            catch (error: unknown) {
                console.error("Erreur lors de la création :", error);

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
                    // Erreur JS classique
                    showError(error.message);
                }
                else {
                    showError("Erreur inconnue lors de la création de la demande.");
                }
            }
        }
    };

    return (
        <PopupOverlay>
            <PagePopup>
                <PopupHeader>
                    <PopupTitle>Demande de recrutement</PopupTitle>
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
                                      effective: formData.effective,
                                      contractId: formData.contractId!="" ? formData.contractId:null,
                                      contractPrecision: formData.contractPrecision!="" ? formData.contractPrecision:null,
                                      monthDuration: formData.monthDuration,
                                      sites: formData.sites,
                                      applicantUserId: formData.applicantUserId ?? ""
                                    }}
                                    fieldErrors={fieldErrors}
                                    isSubmitting={false}
                                    suggestions={{ applicant: [] }}
                                    handleInputChange={handleInputChange}
                                    onDirectionChange={setSharedDirection}
                                />
                                <StepNavigation>
                                    <NextButton
                                        type="button"
                                        onClick={handleNext}
                                        aria-label="Passer à l'étape suivante"
                                        title="Suivant"
                                    >
                                        Suivant <FaIcons.FaArrowRight className="w-4 h-4" />
                                    </NextButton>
                                </StepNavigation>
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
                                        <span>Valider</span>
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
