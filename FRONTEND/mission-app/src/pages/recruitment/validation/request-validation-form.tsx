import { Save, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
    PopupOverlay, PagePopup, PopupHeader, PopupTitle, PopupClose,
    PopupContent, ButtonPrimary
} from "@/styles/popup-styles";
import { FormContainer, GenericForm } from "@/styles/form-container";
import Alert from "@/components/alert";
import ValidationForm, { type RequestValidationFormDTO } from "./components/validation-form";
import useValidateRequest from "./hooks/use-validate-request";

interface RequestValidationFormProps {
    isOpen: boolean;
    requestId: string;
    onClose: () => void;
    onFormSuccess: (type: string, message: string) => void;
}

const RequestValidationForm: React.FC<RequestValidationFormProps> = ({
    isOpen,
    requestId,
    onClose,
    onFormSuccess
}) => {

    const {
        formData,
        fieldErrors,
        handleInputChange,
        validateForm,
        handleReset,
        submitValidation,
        setRequestId
    } = useValidateRequest();

    useEffect(() => {
        if (requestId) setRequestId(requestId);
    }, [requestId, setRequestId]);

    const [alert, setAlert] = useState({
        isOpen: false,
        type: "info" as "success" | "info" | "error",
        message: ""
    });

    const handleAlertClose = () => setAlert(a => ({ ...a, isOpen: false }));
    const showError = (msg: string) => setAlert({ isOpen: true, type: "error", message: msg });

    if (!isOpen) return null;

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!validateForm()) {
            showError("Veuillez corriger les erreurs.");
            return;
        }

        try {
            const dataToSubmit: RequestValidationFormDTO = { ...formData };
            await submitValidation(dataToSubmit);

            setAlert({ isOpen: true, type: "success", message: "Demande validée avec succès !" });
            onFormSuccess("success", "Demande validée avec succès !");
            handleReset();
            onClose();

        } catch (err) {
            console.error(err);
            showError("Erreur lors de la validation.");
        }
    };

    return (
        <PopupOverlay>
            <PagePopup>
                <PopupHeader>
                    <PopupTitle>Validation de la demande</PopupTitle>
                    <PopupClose
                        onClick={() => { handleReset(); onClose(); }}
                        aria-label="Fermer"
                    >
                        <X className="w-5 h-5" />
                    </PopupClose>
                </PopupHeader>

                <PopupContent>
                    {alert.isOpen && (
                        <Alert
                            type={alert.type}
                            message={alert.message}
                            isOpen={alert.isOpen}
                            onClose={handleAlertClose}
                        />
                    )}

                    <FormContainer>
                        <GenericForm onSubmit={onSubmit}>
                            <ValidationForm
                                formData={formData}
                                fieldErrors={fieldErrors}
                                isSubmitting={false}
                                handleInputChange={handleInputChange}
                            />

                            <div style={{ marginTop: 20 }}>
                                <ButtonPrimary type="submit">
                                    <Save size={16} /> <span>Valider</span>
                                </ButtonPrimary>
                            </div>
                        </GenericForm>
                    </FormContainer>
                </PopupContent>
            </PagePopup>
        </PopupOverlay>
    );
};

export default RequestValidationForm;
