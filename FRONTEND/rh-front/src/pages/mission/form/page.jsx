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
import MissionInfoStep from "./components/mission-info-step";
import BeneficiaryStep from "./components/collaborator-step";
import CompensationStep from "./components/compensation-step";
import useMissionForm from "./hooks/use-mission-form";

const MissionForm = ({ isOpen, onClose, missionId, initialStartDate, onFormSuccess }) => {
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
    } = useMissionForm({ isOpen, onClose, missionId, initialStartDate, onFormSuccess });


    if (!isOpen) return null;

    // Détermine si on est en mode mise à jour
    const isUpdateMode = !!missionId;

    // Détermine l'état de traitement ou de chargement initial
    const isProcessing = isSubmitting || hasClickedSubmit;

    // Déterminer si les données initiales sont en cours de chargement (pour bloquer le formulaire)
    const isDataLoading = isLoading.regions || isLoading.employees || isLoading.transports || (isUpdateMode && isLoading.missionDetail);

    // Déterminer les textes dynamiques
    const popupTitle = isUpdateMode ? "Mise à Jour de la Mission" : "Création et Assignation d'une Mission";
    const submitText = isUpdateMode ? "Mettre à Jour la Mission" : "Créer et Assigner";
    const submittingText = isUpdateMode ? "Mise à jour en cours..." : "Création en cours...";

    return (
        <PopupOverlay>
            <PagePopup>
                <PopupHeader>
                    <PopupTitle>{popupTitle}</PopupTitle> 
                    <PopupClose
                        onClick={handleCancel}
                        disabled={isProcessing || isDataLoading}
                    >
                        <FaIcons.FaTimes className="w-5 h-5" />
                    </PopupClose>
                </PopupHeader>

                <PopupContent>
                    {alert.isOpen && (
                        <Alert
                            type={alert.type}
                            message={alert.message}
                            isOpen={alert.isOpen}
                            onClose={() => setAlert({ ...alert, isOpen: false })}
                        />
                    )}
                    
                    <Modal
                        type="error"
                        message={errorModal.message}
                        isOpen={errorModal.isOpen}
                        onClose={() => setErrorModal({ isOpen: false, message: "" })}
                        title="Erreur de validation"
                    >
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <ButtonPrimary onClick={() => setErrorModal({ isOpen: false, message: "" })}>
                                OK
                            </ButtonPrimary>
                        </div>
                    </Modal>

                    <FormContainer>
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

                        <GenericForm id="combinedMissionForm" onSubmit={handleSubmit}>
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
                                    >
                                        Suivant <FaIcons.FaArrowRight className="w-4 h-4" />
                                    </NextButton>
                                </StepNavigation>
                            </StepContent>

                            <StepContent active={currentStep === 2}>
                                <BeneficiaryStep
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
                                    >
                                        <FaIcons.FaArrowLeft className="w-4 h-4" /> Précédent
                                    </PreviousButton>
                                    <NextButton
                                        type="button"
                                        onClick={handleNext}
                                        disabled={isProcessing || isDataLoading}
                                    >
                                        Suivant <FaIcons.FaArrowRight className="w-4 h-4" />
                                    </NextButton>
                                </StepNavigation>
                            </StepContent>

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
                                    >
                                        <FaIcons.FaArrowLeft className="w-4 h-4" /> Précédent
                                    </PreviousButton>
                                    <ButtonPrimary
                                        type="submit"
                                        disabled={isProcessing || isDataLoading}
                                        title={isProcessing ? submittingText : submitText} 
                                        style={{
                                            opacity: isProcessing || isDataLoading ? 0.6 : 1,
                                            cursor: isProcessing || isDataLoading ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <Save size={16} />
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