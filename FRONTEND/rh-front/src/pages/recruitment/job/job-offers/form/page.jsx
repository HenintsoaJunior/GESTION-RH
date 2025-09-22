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
import FirstStepForm from "./components/first-step-form";
import SecondStepForm from "./components/second-step-form";
import ThirdStepForm from "./components/third-step-form";
import { useJobDescriptionForm } from "./hooks/use-job-description-form";

// Composant principal pour le formulaire de description de poste
export default function JobDescriptionForm({ isOpen, onClose, setJobOffers, setTotalEntries, recruitmentRequestId, onSuccess }) {
  // Utilisation du hook personnalisé pour gérer les données et la logique du formulaire
  const {
    currentStep,
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    alert,
    errorModal,
    hasContractDuration,
    handleNext,
    handlePrevious,
    handleAddAttribution,
    handleRemoveAttribution,
    handleAttributionChange,
    handleAddQuality,
    handleRemoveQuality,
    handleQualityChange,
    handleAddSkill,
    handleRemoveSkill,
    handleSkillChange,
    handleAddFormation,
    handleRemoveFormation,
    handleFormationChange,
    handleAddExperience,
    handleRemoveExperience,
    handleExperienceChange,
    handleAddLanguage, // Gestionnaire pour ajouter une langue
    handleRemoveLanguage, // Gestionnaire pour supprimer une langue
    handleLanguageChange, // Gestionnaire pour modifier une langue
    handleSubmit,
    handleReset,
    closeAlert,
    closeErrorModal,
  } = useJobDescriptionForm(isOpen, setJobOffers, setTotalEntries, recruitmentRequestId);

  // Gestion de l'annulation du formulaire (réinitialisation et fermeture)
  const handleCancel = () => {
    handleReset(true);
    onClose();
  };

  // Gestion de la soumission du formulaire avec gestion du succès
  const handleFormSubmit = async (event) => {
    const result = await handleSubmit(event);
    if (result?.success) {
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    }
  };

  // Si le formulaire n'est pas ouvert, ne rien rendre
  if (!isOpen) return null;

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>Fiche de Description de Poste</PopupTitle>
          <PopupClose
            onClick={handleCancel}
            disabled={isSubmitting}
            title={isSubmitting ? "Impossible de fermer pendant la soumission" : "Fermer"}
          >
            ×
          </PopupClose>
        </PopupHeader>
        <PopupContent>
          {/* Affichage de l'alerte si nécessaire */}
          {alert.isOpen && (
            <Alert
              type={alert.type}
              message={alert.message}
              isOpen={alert.isOpen}
              onClose={closeAlert}
            />
          )}
          {/* Affichage de la modale d'erreur si nécessaire */}
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
            {/* Étapes du formulaire */}
            <StepperWrapper>
              <StepItem active={currentStep === 1 ? "true" : "false"}>
                <span>1</span> Informations générales
              </StepItem>
              <StepItem active={currentStep === 2 ? "true" : "false"}>
                <span>2</span> Détails du poste
              </StepItem>
              <StepItem active={currentStep === 3 ? "true" : "false"}>
                <span>3</span> Exigences
              </StepItem>
            </StepperWrapper>
            <GenericForm id="jobDescriptionForm" onSubmit={handleFormSubmit}>
              {/* Étape 1 : Informations générales */}
              {currentStep === 1 && (
                <StepContent active="true">
                  <FirstStepForm
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    hasContractDuration={hasContractDuration}
                  />
                  <StepNavigation>
                    <NextButton
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                    >
                      Suivant <FaIcons.FaArrowRight className="w-4 h-4" />
                    </NextButton>
                  </StepNavigation>
                </StepContent>
              )}
              {/* Étape 2 : Détails du poste */}
              {currentStep === 2 && (
                <StepContent active="true">
                  <SecondStepForm
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    handleAddAttribution={handleAddAttribution}
                    handleRemoveAttribution={handleRemoveAttribution}
                    handleAttributionChange={handleAttributionChange}
                  />
                  <StepNavigation>
                    <PreviousButton
                      type="button"
                      onClick={handlePrevious}
                      disabled={isSubmitting}
                    >
                      <FaIcons.FaArrowLeft className="w-4 h-4" /> Précédent
                    </PreviousButton>
                    <NextButton
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                    >
                      Suivant <FaIcons.FaArrowRight className="w-4 h-4" />
                    </NextButton>
                  </StepNavigation>
                </StepContent>
              )}
              {/* Étape 3 : Exigences */}
              {currentStep === 3 && (
                <StepContent active="true">
                  <ThirdStepForm
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    handleAddQuality={handleAddQuality}
                    handleRemoveQuality={handleRemoveQuality}
                    handleQualityChange={handleQualityChange}
                    handleAddSkill={handleAddSkill}
                    handleRemoveSkill={handleRemoveSkill}
                    handleSkillChange={handleSkillChange}
                    handleAddFormation={handleAddFormation}
                    handleRemoveFormation={handleRemoveFormation}
                    handleFormationChange={handleFormationChange}
                    handleAddExperience={handleAddExperience}
                    handleRemoveExperience={handleRemoveExperience}
                    handleExperienceChange={handleExperienceChange}
                    handleAddLanguage={handleAddLanguage} // Ajout du gestionnaire pour ajouter une langue
                    handleRemoveLanguage={handleRemoveLanguage} // Ajout du gestionnaire pour supprimer une langue
                    handleLanguageChange={handleLanguageChange} // Ajout du gestionnaire pour modifier une langue
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
                      title="Valider la fiche"
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