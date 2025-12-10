import { 
    FormFieldCell, 
    FormLabelRequired, 
    FormSectionTitle, 
    FormTable
} from "@/styles/form-container";

import { 
    ErrorMessage,
    FormInput
} from "@/styles/login-styles";

import { FormRow } from "@/styles/table-styles";
import SignaturePad from "@/components/signature-pad";

export interface RequestValidationFormDTO {
	requestId: string;
	validatorId: string;
    status: string;
	signature: string | null;
	comments: string | null;
}

interface RequestValidationFormProps {
    formData: RequestValidationFormDTO;
    fieldErrors: { [key: string]: string[] };
    isSubmitting: boolean;
    handleInputChange: (
        e: { target: { name: string; value: string } }
    ) => void;
}

const ValidationForm: React.FC<RequestValidationFormProps> = ({
    formData,
	fieldErrors,
	isSubmitting,
	handleInputChange
}) => {
    const decisions = ["Approuver", "Refuser"];

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userName = userData?.name || "";

    return ( <>
        <FormSectionTitle>Informations générales</FormSectionTitle>
        <FormTable>
            <tbody>
                {/* Num demande */}
                <FormRow>
                    <FormFieldCell colSpan={2}>
                        <FormLabelRequired>Demande N°</FormLabelRequired>
                        <FormInput
                            name="requestId"
                            value={formData.requestId}
                            readOnly
                            disabled
                        />
                    </FormFieldCell>
                </FormRow>

                {/* Validateur */}
                <FormRow>
                    <FormFieldCell>
                        <FormLabelRequired>Validateur</FormLabelRequired>
                        <FormInput
                            name="validatorDisplay"
                            value={userName || "Utilisateur"}
                            readOnly
                            disabled
                        />

                        {/* Champ caché contenant l'ID réel */}
                        <input
                            type="hidden"
                            name="validatorId"
                            value={formData.validatorId}
                        />
                    </FormFieldCell>
                </FormRow>
            </tbody>
        </FormTable>

        <FormSectionTitle>Décision du validateur</FormSectionTitle>
        <FormTable>
            <tbody>
                <FormRow>
                    <FormFieldCell colSpan={2}>
                        <FormLabelRequired>Décision</FormLabelRequired>

                        <div style={{ display: "flex", gap: 18, marginTop: 8 }}>
                            {decisions.map((decision) => (
                                <label key={decision} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value={decision}
                                        checked={formData.status === decision}
                                        onChange={(e) =>
                                            handleInputChange({
                                                target: {
                                                    name: "status",
                                                    value: e.target.value
                                                }
                                            })
                                        }
                                        disabled={isSubmitting}
                                    />
                                    <span>{decision}</span>
                                </label>
                            ))}
                        </div>

                        {fieldErrors.status && (
                            <ErrorMessage>{fieldErrors.status.join(", ")}</ErrorMessage>
                        )}
                    </FormFieldCell>
                </FormRow>

                {/* Si décision == Approuver -> signature */}
                {formData.status === "Approuver" && (
                    <FormRow>
                        <FormFieldCell colSpan={2}>
                            <FormLabelRequired>Signature numérique</FormLabelRequired>

                            <SignaturePad
                                value={formData.signature}
                                onChange={(dataUrl) =>
                                    handleInputChange({
                                        target: { name: "signature", value: dataUrl }
                                    })
                                }
                            />

                            {fieldErrors.signature && (
                                <ErrorMessage>{fieldErrors.signature.join(", ")}</ErrorMessage>
                            )}
                        </FormFieldCell>
                    </FormRow>
                )}


                {/* Si décision == Refuser -> motif du refus */}
                {formData.status === "Refuser" && (
                    <FormRow>
                        <FormFieldCell colSpan={2}>
                            <FormLabelRequired>Motif du refus</FormLabelRequired>

                            <textarea
                                name="comments"
                                value={formData.comments ?? ""}
                                onChange={(e) =>
                                    handleInputChange({
                                        target: { name: "comments", value: e.target.value }
                                    })
                                }
                                style={{ width: "100%", minHeight: 120 }}
                                disabled={isSubmitting}
                            />

                            {fieldErrors.comments && (
                                <ErrorMessage>{fieldErrors.comments.join(", ")}</ErrorMessage>
                            )}
                        </FormFieldCell>
                    </FormRow>
                )}


                {/* {formData.signature && (
                    <FormRow>
                        <FormFieldCell colSpan={2}>
                            <FormLabelRequired>Signature enregistrée</FormLabelRequired>
                            <SignatureDisplay signatureBase64={formData.signature} />
                        </FormFieldCell>
                    </FormRow>
                )} */}
            </tbody>
        </FormTable>
    </> );
};

export default ValidationForm;
