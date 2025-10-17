/* eslint-disable @typescript-eslint/no-explicit-any */
import { Save } from "lucide-react";
import * as FaIcons from "react-icons/fa";
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
import MissionInfoStep from "./components/mission-info-step";
import CollaboratorStep from "./components/collaborator-step";
import CompensationStep from "./components/compensation-step";
import useMissionForm from "./hooks/use-mission-form";
import Modal from 'react-modal';
import React, { useEffect, useMemo, useCallback } from "react";

interface MissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  missionId?: string | number | null;
  initialStartDate?: string;
  onFormSuccess: (type: string, message: string) => void;
}

interface UseMissionFormReturn {
  currentStep: number;
  formData: any;
  isSubmitting: boolean;
  hasClickedSubmit: boolean;
  alert: {
    isOpen: boolean;
    type: "success" | "info" | "error" | "warning";
    message: string;
  };
  setAlert: (alert: UseMissionFormReturn["alert"]) => void;
  errorModal: {
    isOpen: boolean;
    message: string;
  };
  setErrorModal: (errorModal: UseMissionFormReturn["errorModal"]) => void;
  regionDisplayNames: string[];
  suggestions: {
    beneficiary: { displayName: string }[];
    transport: { type: string }[];
  };
  isLoading: {
    regions: boolean;
    employees: boolean;
    transports: boolean;
    missionDetail?: boolean;
  };
  fieldErrors: { [key: string]: string[] };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } },
    section?: string
  ) => void;
  handleAddNewSuggestion: (type: string, value: string) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleCancel: () => void;
}

const MissionForm: React.FC<MissionFormProps> = ({ 
  isOpen, 
  onClose, 
  missionId, 
  initialStartDate, 
  onFormSuccess 
}) => {
    const {
        currentStep,
        formData,
        isSubmitting,
        hasClickedSubmit,
        alert,
        setAlert,
        errorModal,
        setErrorModal,
        regionDisplayNames,
        suggestions,
        isLoading,
        fieldErrors,
        handleInputChange,
        handleAddNewSuggestion,
        handleNext,
        handlePrevious,
        handleSubmit,
        handleCancel,
    } = useMissionForm({ 
      isOpen, 
      onClose, 
      missionId: missionId?.toString(), 
      initialStartDate, 
      onFormSuccess 
    }) as UseMissionFormReturn;

    // Configuration de Modal au montage du composant
    useEffect(() => {
      Modal.setAppElement("#root");
    }, []);

    // Mémorisation des états calculés pour éviter les recalculs
    const isUpdateMode = useMemo(() => !!missionId, [missionId]);
    const isProcessing = useMemo(() => isSubmitting || hasClickedSubmit, [isSubmitting, hasClickedSubmit]);
    const isDataLoading = useMemo(() => 
      isLoading.regions || 
      isLoading.employees || 
      isLoading.transports || 
      (isUpdateMode && isLoading.missionDetail),
      [isLoading.regions, isLoading.employees, isLoading.transports, isUpdateMode, isLoading.missionDetail]
    );

    // Mémorisation des textes dynamiques
    const popupTitle = useMemo(() => 
      isUpdateMode ? "Mise à Jour de la Mission" : "Création et Assignation d'une Mission",
      [isUpdateMode]
    );
    const submitText = useMemo(() => 
      isUpdateMode ? "Mettre à Jour la Mission" : "Créer et Assigner",
      [isUpdateMode]
    );
    const submittingText = useMemo(() => 
      isUpdateMode ? "Mise à jour en cours..." : "Création en cours...",
      [isUpdateMode]
    );

    // Callbacks mémorisés pour les actions de fermeture
    const handleAlertClose = useCallback(() => {
      setAlert({ ...alert, isOpen: false });
    }, [alert, setAlert]);

    const handleErrorModalClose = useCallback(() => {
      setErrorModal({ isOpen: false, message: "" });
    }, [setErrorModal]);

    // Ne pas afficher le popup si non ouvert
    if (!isOpen) return null;

    return (
        <PopupOverlay>
            <PagePopup>
                <PopupHeader>
                    <PopupTitle>{popupTitle}</PopupTitle> 
                    <PopupClose
                        onClick={handleCancel}
                        disabled={isProcessing || isDataLoading}
                        aria-label="Fermer le formulaire"
                        title="Fermer"
                    >
                        <FaIcons.FaTimes className="w-5 h-5" />
                    </PopupClose>
                </PopupHeader>

                <PopupContent>
                    {/* Alerte de notification */}
                    {alert.isOpen && (
                        <Alert
                            type={alert.type}
                            message={alert.message}
                            isOpen={alert.isOpen}
                            onClose={handleAlertClose}
                        />
                    )}
                    
                    {/* Modal d'erreur de validation */}
                    <Modal
                        isOpen={errorModal.isOpen}
                        onRequestClose={handleErrorModalClose}
                        contentLabel="Erreur de validation"
                        className="error-modal"
                        overlayClassName="error-modal-overlay"
                        ariaHideApp={false}
                        shouldCloseOnOverlayClick={true}
                        shouldCloseOnEsc={true}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">Erreur de validation</h2>
                            <button 
                                className="modal-close-button"
                                onClick={handleErrorModalClose}
                                aria-label="Fermer la modale"
                                type="button"
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>{errorModal.message}</p>
                        </div>
                        <div className="modal-footer">
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <ButtonPrimary 
                                    onClick={handleErrorModalClose}
                                    type="button"
                                >
                                    OK
                                </ButtonPrimary>
                            </div>
                        </div>
                    </Modal>

                    <FormContainer>
                        {/* Stepper de navigation */}
                        <StepperWrapper>
                            <StepItem active={currentStep === 1}>
                                <span>1</span> Informations
                            </StepItem>
                            <StepItem active={currentStep === 2}>
                                <span>2</span> Détails
                            </StepItem>
                            <StepItem active={currentStep === 3}>
                                <span>3</span> Type de Compensation
                            </StepItem>
                        </StepperWrapper>

                        {/* Formulaire multi-étapes */}
                        <GenericForm id="combinedMissionForm" onSubmit={handleSubmit}>
                            {/* Étape 1: Informations de base */}
                            <StepContent active={currentStep === 1}>
                                <MissionInfoStep
                                    formData={formData}
                                    fieldErrors={fieldErrors}
                                    isSubmitting={isProcessing}
                                    isLoading={isLoading}
                                    regionDisplayNames={regionDisplayNames}
                                    handleInputChange={handleInputChange}
                                    handleAddNewSuggestion={handleAddNewSuggestion}
                                />
                                <StepNavigation>
                                    <NextButton
                                        type="button"
                                        onClick={handleNext}
                                        disabled={isProcessing || isDataLoading}
                                        aria-label="Passer à l'étape suivante"
                                        title="Étape suivante"
                                    >
                                        Suivant <FaIcons.FaArrowRight className="w-4 h-4" />
                                    </NextButton>
                                </StepNavigation>
                            </StepContent>

                            {/* Étape 2: Collaborateurs et détails */}
                            <StepContent active={currentStep === 2}>
                                <CollaboratorStep
                                    formData={formData}
                                    fieldErrors={fieldErrors}
                                    isSubmitting={isProcessing}
                                    suggestions={suggestions}
                                    handleInputChange={handleInputChange}
                                    handleAddNewSuggestion={handleAddNewSuggestion}
                                />
                                <StepNavigation>
                                    <PreviousButton
                                        type="button"
                                        onClick={handlePrevious}
                                        disabled={isProcessing}
                                        aria-label="Revenir à l'étape précédente"
                                        title="Étape précédente"
                                    >
                                        <FaIcons.FaArrowLeft className="w-4 h-4" /> Précédent
                                    </PreviousButton>
                                    <NextButton
                                        type="button"
                                        onClick={handleNext}
                                        disabled={isProcessing || isDataLoading}
                                        aria-label="Passer à l'étape suivante"
                                        title="Étape suivante"
                                    >
                                        Suivant <FaIcons.FaArrowRight className="w-4 h-4" />
                                    </NextButton>
                                </StepNavigation>
                            </StepContent>

                            {/* Étape 3: Type de compensation et soumission */}
                            <StepContent active={currentStep === 3}>
                                <CompensationStep
                                    formData={formData}
                                    fieldErrors={fieldErrors}
                                    isSubmitting={isProcessing}
                                    handleInputChange={handleInputChange}
                                />
                                <StepNavigation>
                                    <PreviousButton
                                        type="button"
                                        onClick={handlePrevious}
                                        disabled={isProcessing}
                                        aria-label="Revenir à l'étape précédente"
                                        title="Étape précédente"
                                    >
                                        <FaIcons.FaArrowLeft className="w-4 h-4" /> Précédent
                                    </PreviousButton>
                                    <ButtonPrimary
                                        type="submit"
                                        disabled={isProcessing || isDataLoading}
                                        title={isProcessing ? submittingText : submitText}
                                        aria-label={isProcessing ? submittingText : submitText}
                                        style={{
                                            opacity: isProcessing || isDataLoading ? 0.6 : 1,
                                            cursor: isProcessing || isDataLoading ? 'not-allowed' : 'pointer',
                                            transition: 'opacity 0.3s ease'
                                        }}
                                    >
                                        <Save size={16} aria-hidden="true" />
                                        <span>
                                            {isProcessing ? submittingText : submitText} 
                                        </span>
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

export default MissionForm;