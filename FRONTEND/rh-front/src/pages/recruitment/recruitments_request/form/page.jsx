"use client";

import { Save } from "lucide-react";
import * as FaIcons from "react-icons/fa";
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
  ButtonPrimary,
} from "styles/generaliser/popup-container";
import {
  FormContainer,
  StepperWrapper,
  StepItem,
  StepContent,
  StepNavigation,
  NextButton,
  PreviousButton,
  GenericForm,
} from "styles/generaliser/form-container";
import Alert from "components/alert";
import Modal from "components/modal";
import FirstStepForm from "./step/first-step-form";
import SecondStepForm from "./step/second-step-form";
import { useRecruitmentRequestForm } from "./hooks/use-recruitment-request-form";

export default function RecruitmentRequestForm({ isOpen, onClose }) {
  const {
    // Form state
    currentStep,
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    
    // Reference data
    recruitmentReasons,
    suggestions,
    
    // Loading states
    isLoading,
    
    // Alert and modal states
    alert,
    errorModal,
    
    // Form handlers
    handleNext,
    handlePrevious,
    handleAddMotif,
    handleRemoveMotif,
    handleMotifChange,
    handleAddNewSuggestion,
    handleSubmit,
    handleReset,
    
    // Alert handlers
    closeAlert,
    closeErrorModal,
  } = useRecruitmentRequestForm(isOpen);

  const handleCancel = () => {
    handleReset(true);
    onClose();
  };

  const handleFormSubmit = async (event) => {
    const result = await handleSubmit(event);
    if (result?.success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>Demande de Recrutement</PopupTitle>
          <PopupClose
            onClick={handleCancel}
            disabled={isSubmitting}
            title={isSubmitting ? "Impossible de fermer pendant la soumission" : "Fermer"}
          >
            ×
          </PopupClose>
        </PopupHeader>

        <PopupContent>
          {alert.isOpen && (
            <Alert
              type={alert.type}
              message={alert.message}
              isOpen={alert.isOpen}
              onClose={closeAlert}
            />
          )}
          <Modal
            type={errorModal.type}
            message={errorModal.message}
            isOpen={errorModal.isOpen}
            onClose={closeErrorModal}
            title="Erreur de validation"
          >
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <ButtonPrimary onClick={closeErrorModal}>
                OK
              </ButtonPrimary>
            </div>
          </Modal>
          <FormContainer>
            <StepperWrapper>
              <StepItem active={currentStep === 1 ? "true" : "false"}>
                <span>1</span> Informations du Poste
              </StepItem>
              <StepItem active={currentStep === 2 ? "true" : "false"}>
                <span>2</span> Motif et Planification
              </StepItem>
            </StepperWrapper>

            <GenericForm id="recruitmentRequestForm" onSubmit={handleFormSubmit}>
              {currentStep === 1 && (
                <StepContent active="true">
                  <FirstStepForm
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    suggestions={suggestions}
                    isLoading={isLoading}
                    isSubmitting={isSubmitting}
                    handleAddNewSuggestion={handleAddNewSuggestion}
                  />
                  <StepNavigation>
                    <NextButton
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting || Object.values(isLoading).some((loading) => loading)}
                    >
                      Suivant <FaIcons.FaArrowRight className="w-4 h-4" />
                    </NextButton>
                  </StepNavigation>
                </StepContent>
              )}

              {currentStep === 2 && (
                <StepContent active="true">
                  <SecondStepForm
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    recruitmentReasons={recruitmentReasons}
                    suggestions={suggestions}
                    isLoading={isLoading}
                    isSubmitting={isSubmitting}
                    handleMotifChange={handleMotifChange}
                    handleAddMotif={handleAddMotif}
                    handleRemoveMotif={handleRemoveMotif}
                    handleAddNewSuggestion={handleAddNewSuggestion}
                  />
                  <StepNavigation>
                    <PreviousButton
                      type="button"
                      onClick={handlePrevious}
                      disabled={isSubmitting}
                    >
                      <FaIcons.FaArrowLeft className="w-4 h-4" /> Précédent
                    </PreviousButton>
                    <ButtonPrimary
                      type="submit"
                      disabled={isSubmitting}
                      title="Valider la demande"
                    >
                      <Save size={16} />
                      <span>{isSubmitting ? "Envoi en cours..." : "Valider"}</span>
                    </ButtonPrimary>
                  </StepNavigation>
                </StepContent>
              )}
            </GenericForm>
          </FormContainer>
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
}