// Fichier : mission-modals.jsx (version modifiée : supprimer les états locaux et utiliser les props)

import { Component } from "react";
import Alert from "components/alert";
import Modal from "components/modal";
import DetailsMission from "../../details/mission-details";
import MissionForm from "../../../form/page";
import { ModalActions, ButtonCancel, ButtonConfirm } from "styles/generaliser/table-container";

// ErrorBoundary component to catch rendering errors
class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            console.error("Error in DetailsMission:", this.state.error);
            return <div>Error rendering mission details. Please try again.</div>;
        }
        return this.props.children;
    }
}

const MissionModals = ({
                           alert,
                           setAlert,
                           handleConfirmCancel,
                           handleEditMission,
                           handleFormSuccess,
                           showCancelModal,
                           setShowCancelModal,
                           missionToCancel,
                           setMissionToCancel,
                           showDetailsMission,
                           setShowDetailsMission,
                           selectedMissionId,
                           setSelectedMissionId,
                           showMissionForm,
                           setShowMissionForm,
                           selectedMissionIdForEdit,
                           setSelectedMissionIdForEdit,
                       }) => {

    // Debug log for modal rendering
    console.log("MissionModals - showDetailsMission:", showDetailsMission, "selectedMissionId:", selectedMissionId);

    console.log("Valeur de missionId pour l'édition (selectedMissionIdForEdit) :", selectedMissionIdForEdit); 
    
    return (
        <>
            <Alert
                type={alert.type}
                message={alert.message}
                isOpen={alert.isOpen}
                onClose={() => setAlert({ ...alert, isOpen: false })}
            />
            <Modal
                type="warning"
                message="Êtes-vous sûr de vouloir annuler cette mission ? Cette action est irréversible."
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title="Confirmer l'annulation"
            >
                <ModalActions>
                    <ButtonCancel onClick={() => setShowCancelModal(false)}>Annuler</ButtonCancel>
                    <ButtonConfirm onClick={handleConfirmCancel}>Confirmer</ButtonConfirm>
                </ModalActions>
            </Modal>
            {showDetailsMission && (
                <ErrorBoundary>
                    <DetailsMission
                        missionId={selectedMissionId}
                        isOpen={showDetailsMission}
                        onClose={() => {
                            console.log("Closing DetailsMission"); // Debug close action
                            setShowDetailsMission(false);
                        }}
                    />
                </ErrorBoundary>
            )}
            {showMissionForm && (
                <MissionForm
                    isOpen={showMissionForm}
                    onClose={() => {
                        setShowMissionForm(false);
                        setSelectedMissionIdForEdit(null);
                    }}
                    missionId={selectedMissionIdForEdit}
                    onFormSuccess={handleFormSuccess}
                />
            )}
        </>
    );
};

export default MissionModals;