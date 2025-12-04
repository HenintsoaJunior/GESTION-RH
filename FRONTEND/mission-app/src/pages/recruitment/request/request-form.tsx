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

interface RecruitmentRequestFormProps {
    isOpen: boolean;
    onClose: () => void;
    onFormSuccess: (type: string, message: string) => void;
}

const RecruitmentRequestForm: React.FC<RecruitmentRequestFormProps> = ({
  isOpen,
  onClose,
  onFormSuccess
}) => {
    const {
      currentStep,
      formData,
      fieldErrors,
      handleInputChange,
      validateStep2,
      handleNext,
      handlePrevious,
      handleReset,
    } = useRecruitmentForm();

    const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "info" | "error"; message: string }>({
      isOpen: false, type: "info", message: ""
    });

    const handleAlertClose = useCallback(() => setAlert((a) => ({ ...a, isOpen: false })), []);
    const showError = useCallback((message: string) => setAlert({ isOpen: true, type: "error", message }), []);

    if (!isOpen) return null;

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      if (currentStep === 1) {
        // Step 1: handleNext already validates internally
        console.log("RequestForm - step 1 proceeding to next:", { formData });
        handleNext();
      } else if (currentStep === 2) {
        // Step 2: validate and submit
        const ok = validateStep2();
        console.log("RequestForm - final payload:", { formData });
        if (!ok) {
          showError("Veuillez corriger les erreurs avant de valider.");
          return;
        }
        onFormSuccess("success", "Demande validée — payload loggé en console.");
        handleReset();
        onClose();
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
                                      contractId: formData.contractId,
                                      contractPrecision: formData.contractPrecision,
                                      monthDuration: formData.monthDuration,
                                      sites: formData.sites,
                                      applicantUserId: formData.applicantUserId || "",
                                    }}
                                    fieldErrors={fieldErrors}
                                    isSubmitting={false}
                                    suggestions={{ applicant: [] }}
                                    handleInputChange={handleInputChange}
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
                                      replacementReasonId: formData.replacementReasonId,
                                      replacementDate: formData.replacementDate,
                                      reasonPrecision: formData.reasonPrecision,
                                      lastTitularId: formData.lastTitularId,
                                      beginningDate: formData.beginningDate,
                                    }}
                                    fieldErrors={fieldErrors}
                                    isSubmitting={false}
                                    handleInputChange={handleInputChange}
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
