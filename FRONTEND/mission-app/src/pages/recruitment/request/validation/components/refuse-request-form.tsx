import Alert from "@/components/alert";
import { 
    FormContainer,
    FormFieldCell, 
    FormLabelRequired, 
    FormTable,
    GenericForm
} from "@/styles/form-container";

import { ErrorMessage } from "@/styles/login-styles";
import { ButtonPrimary, PagePopup, PopupClose, PopupContent, PopupHeader, PopupOverlay, PopupTitle } from "@/styles/popup-styles";
import { FormRow } from "@/styles/table-styles";
import { Save, X } from "lucide-react";
import { useState } from "react";

export interface RequestValidationFormDTO {
    requestId: string;
    validatorId: string;
    status: string;
    comments: string | null;
}

interface RequestValidationFormProps {
    formData: RequestValidationFormDTO;
    fieldErrors: { [key: string]: string[] };
    isSubmitting: boolean;
    onClose : () => void;
    onSubmit : (status: "Approuver" | "Refuser" | undefined) => void;
    handleReset : () => void;
    handleInputChange: (
        e: { target: { name: string; value: string } }
    ) => void;
}

const RefuseValidationForm: React.FC<RequestValidationFormProps> = ({
    formData,
    fieldErrors,
    isSubmitting,
    handleInputChange,
    handleReset,
    onClose,
    onSubmit
}) => {
    const [alert, setAlert] = useState({
        isOpen: false,
        type: "info" as "success" | "info" | "error",
        message: ""
    });

    const handleAlertClose = () => setAlert(a => ({ ...a, isOpen: false }));

    return (<>
        <PopupOverlay>
            <PagePopup>
                <PopupHeader>
                    <PopupTitle>Motif de refus</PopupTitle>
                    <PopupClose aria-label="Fermer"
                        onClick={() => { handleReset(); onClose(); }}
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
                        <GenericForm>
                            <FormTable><tbody>
                                {/* {formData.status === "Refuser" && ( */}
                                    <FormRow>
                                        <FormFieldCell colSpan={2}>
                                            <FormLabelRequired>éxplications</FormLabelRequired>
                                            <textarea
                                                name="comments"
                                                value={formData.comments ?? ""}
                                                onChange={(e) =>
                                                    handleInputChange({
                                                        target: { name: "comments", value: e.target.value }
                                                    })
                                                }
                                                style={{ width: "100%", minHeight: 120, borderWidth: 0.1 }}
                                                disabled={isSubmitting}
                                            />

                                            {fieldErrors.comments && (
                                                <ErrorMessage>
                                                    {fieldErrors.comments.join(", ")}
                                                </ErrorMessage>
                                            )}
                                        </FormFieldCell>
                                    </FormRow>
                                {/* )} */}
                            </tbody></FormTable>

                            <div style={{ marginTop: 20 }}>
                                <ButtonPrimary type="button" onClick={() => onSubmit("Refuser")}>
                                    <Save size={16} /> <span>Confirmer</span>
                                </ButtonPrimary>
                            </div>
                        </GenericForm>
                    </FormContainer>
                </PopupContent>
            </PagePopup>
        </PopupOverlay>
    </> );
};

export default RefuseValidationForm;
