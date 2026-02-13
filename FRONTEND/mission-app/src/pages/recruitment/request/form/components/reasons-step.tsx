"use client";

import React, { useMemo, useState } from "react";
import {
    FormSectionTitle,
    FormTable,
    FormRow,
    FormFieldCell,
    FormLabelRequired,
    FormInput,
    ErrorMessage,
    StyledAutoCompleteInput,
    FormLabel,
} from "@/styles/form-container";
import {
    useGetReplacementReasons,
    type DocumentDTO,
} from "@/api/recruitment/service";
import { StyledSelect } from "@/styles/table-styles";
import { addWeeks } from "date-fns";

export interface RecruitmentReasonForm {
    isReplacement: boolean;
    replacementReasonId: string | null;
    replacementDate: string | null;
    reasonPrecision: string | null;
    lastTitularId: string | null;
    isPlanned: boolean;
    notPlannedReason: string | null;
    beginningDate: string;
}

interface RecruitmentReasonStepProps {
    formData: RecruitmentReasonForm;
    direction: string;
    usersByDirection: DocumentDTO[];
    fieldErrors?: { [key: string]: string[] };
    isSubmitting?: boolean;
    handleInputChange: (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>
            | React.ChangeEvent<HTMLSelectElement>
            | { target: { name: string; value: string | number | boolean | null } },
        section?: string
    ) => void;
}

const RecruitmentReasonStep: React.FC<RecruitmentReasonStepProps> = ({
    formData,
    usersByDirection,
    fieldErrors = {},
    isSubmitting = false,
    handleInputChange,
}) => {
    const today = new Date();
    const weekAfter = addWeeks(today, 1).toISOString().split("T")[0]; // Format YYYY-MM-DD pour l'input date
    
    /** Motifs */
    const { data: reasonsResponse, isLoading: reasonsLoading } = useGetReplacementReasons();
    const reasons: DocumentDTO[] = useMemo(() => reasonsResponse?.data || [], [reasonsResponse]);
    const isOtherReason = formData.replacementReasonId === "other";

    const [lastTitularInput, setLastTitularInput] = useState<string>("");

    /** Employés */
    // const { data: usersResponse, isLoading: usersLoading } = useGetUsersByDirection(direction);
    const users: DocumentDTO[] = useMemo(() => usersByDirection || [], [usersByDirection]);

    /** Suggestions employees */
    const userSuggestions = useMemo(
		() => users.map(u => ({
			id: u.id,
			label: u.name
		})),
		[users]
	);

    React.useEffect(() => {
        const selected = userSuggestions.find(u => u.id === formData.lastTitularId);
        setLastTitularInput(selected?.label ?? "");
    }, [formData.lastTitularId, userSuggestions]);


	// Mapping des labels pour l’autocomplete
	const reasonSuggestions = useMemo(() => {
        const dbReasons = reasons.map(r => ({
            id: r.id,
            label: r.name
        }));

        // 🔥 Ajout manuel de l’option "Autre"
        return [
            ...dbReasons,
            { id: "other", label: "Autre" }
        ];
    }, [reasons]);

	// // Trouver le label correspondant à l’ID contenu dans le formulaire
	// const selectedReasonLabel =
	// 	reasonSuggestions.find(r => r.id === formData.replacementReasonId)?.label || "";

    return (<>
        {/* Section 1: Remplacement */}
        <FormSectionTitle>Remplacement</FormSectionTitle>

        <FormTable>
            <tbody>
                {/* Checkbox Remplacement */}
                <FormRow>
                    <FormFieldCell colSpan={2}>
                        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 8 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <FormInput
                                    type="checkbox"
                                    name="isReplacement"
                                    checked={formData.isReplacement || false}
                                    onChange={(e) =>
                                        handleInputChange({
                                        target: {
                                            name: "isReplacement",
                                            value: e.target.checked ? "true" : "false",
                                        },
                                        })
                                    }
                                    disabled={isSubmitting}
                                />
                                <FormLabel>Ceci est un remplacement</FormLabel>
                            </label>
                        </div>
                    </FormFieldCell>
                </FormRow>

                {formData.isReplacement && (<>
                    {/* Motif */}
                    <FormRow>
                        <FormFieldCell colSpan={2}>
                            <FormLabelRequired>Motif de remplacement</FormLabelRequired>

                            <StyledSelect
                            name="replacementReasonId"
                            value={formData.replacementReasonId || ""}
                            onChange={(e) =>
                                handleInputChange({ target: { name: "replacementReasonId", value: e.target.value } })
                            }
                            disabled={isSubmitting || reasonsLoading}
                            >
                                <option value="" disabled>Sélectioner un motif</option>
                                {reasonSuggestions.map((r) => (
                                    <option key={r.id} value={r.id}>
                                    {r.label}
                                    </option>
                                ))}
                            </StyledSelect>

                            {fieldErrors?.replacementReasonId && (
                                <ErrorMessage>
                                    {fieldErrors.replacementReasonId.join(", ")}
                                </ErrorMessage>
                            )}
                        </FormFieldCell>
                    </FormRow>

                    {isOtherReason && (
                        <FormRow>
                            <FormFieldCell colSpan={2}>
                                <FormLabelRequired>Précision du motif</FormLabelRequired>
                                <FormInput
                                    type="text"
                                    name="reasonPrecision"
                                    value={formData.reasonPrecision || ""}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={isSubmitting}
                                    placeholder="Préciser..."
                                    className={
                                        fieldErrors?.reasonPrecision ? "input-error" : ""
                                    }
                                />
                                {fieldErrors?.reasonPrecision && (
                                    <ErrorMessage>
                                        {fieldErrors.reasonPrecision.join(", ")}
                                    </ErrorMessage>
                                )}
                            </FormFieldCell>
                        </FormRow>
                    )}

                    {/* Date + dernier titulaire */}
                    <FormRow className="dual-field-row">
                        {/* Date */}
                        <FormFieldCell>
                            <FormLabelRequired>Date de survenance</FormLabelRequired>
                            <FormInput
                                type="date"
                                name="replacementDate"
                                value={formData.replacementDate || ""}
                                onChange={(e) => handleInputChange(e)}
                                disabled={isSubmitting}
                                className={
                                    fieldErrors?.replacementDate ? "input-error" : ""
                                }
                            />
                            {fieldErrors?.replacementDate && (
                                <ErrorMessage>
                                    {fieldErrors.replacementDate.join(", ")}
                                </ErrorMessage>
                            )}
                        </FormFieldCell>

                        {/* Dernier titulaire (AUTOCOMPLETE) */}
                        <FormFieldCell>
                            <FormLabelRequired>Ancien titulaire</FormLabelRequired>
                            <StyledAutoCompleteInput
                            value={lastTitularInput}
                            onChange={(label) => {
                                setLastTitularInput(label);

                                const selectedUser = userSuggestions.find(u => u.label === label);
                                if (selectedUser) {
                                handleInputChange({
                                    target: {
                                    name: "lastTitularId", value: selectedUser.id
                                    }
                                });
                                }
                            }}
                            suggestions={userSuggestions.map(u => u.label)}
                            placeholder="Rechercher employé..."
                            disabled={isSubmitting}
                            maxVisibleItems={5}
                            fieldType="lastTitularId"
                            fieldLabel="Ancien titulaire"
                            />

                            {fieldErrors?.lastTitularId && (
                                <ErrorMessage>{fieldErrors.lastTitularId.join(", ")}</ErrorMessage>
                            )}
                        </FormFieldCell>

                    </FormRow>
                </>)}
            </tbody>
        </FormTable>

        <FormSectionTitle>Dotation au budget</FormSectionTitle>
        <FormTable>
            <tbody>
                {/* Checkbox Prévue ou pas */}
                <FormRow>
                    <FormFieldCell colSpan={2}>
                        <div  style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginTop: 8 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <FormInput
                                    type="radio"
                                    name="isPlanned"
                                    checked={formData.isPlanned === true}
                                    onChange={() =>
                                        handleInputChange({
                                            target: { name: "isPlanned", value: true }
                                        })
                                    }
                                    disabled={isSubmitting}
                                />
                                <FormLabel>Prévu</FormLabel>
                            </label>

                            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <FormInput
                                    type="radio"
                                    name="isPlanned"
                                    checked={formData.isPlanned === false}
                                    onChange={() =>
                                        handleInputChange({
                                            target: { name: "isPlanned", value: false }
                                        })
                                    }
                                    disabled={isSubmitting}
                                />
                                <FormLabel>Non prévu</FormLabel>
                            </label>
                        </div>
                    </FormFieldCell>
                </FormRow>

                {!formData.isPlanned && ( <>
                    <FormRow>
                        <FormFieldCell colSpan={2}>
                            <FormLabelRequired>Explications</FormLabelRequired>
                            <textarea
                                name="notPlannedReason"
                                value={formData.notPlannedReason ?? ""}
                                onChange={(e) =>
                                    handleInputChange({
                                        target: { name: "notPlannedReason", value: e.target.value }
                                    })
                                }
                                style={{ width: "100%", minHeight: 120 }}
                                disabled={isSubmitting}
                            />

                            {fieldErrors.notPlannedReason && (
                                <ErrorMessage>{fieldErrors.notPlannedReason.join(", ")}</ErrorMessage>
                            )}
                        </FormFieldCell>
                    </FormRow>
                </> )}
            </tbody>
        </FormTable>

        {/* Section 2 */}
        <FormSectionTitle>Date souhaitée</FormSectionTitle>
        <FormTable>
            <tbody>
                <FormRow>
                    <FormFieldCell colSpan={2}>
                        <FormLabelRequired>Date de début souhaitée</FormLabelRequired>

                        <FormInput
                            type="date"
                            name="beginningDate"
                            value={formData.beginningDate || ""}
                            min={weekAfter}
                            onChange={(e) => handleInputChange(e)}
                            disabled={isSubmitting}
                            className={
                                fieldErrors?.beginningDate ? "input-error" : ""
                            }
                        />

                        {fieldErrors?.beginningDate && (
                            <ErrorMessage>
                                {fieldErrors.beginningDate.join(", ")}
                            </ErrorMessage>
                        )}
                    </FormFieldCell>
                </FormRow>
            </tbody>
        </FormTable>
    </>);
};

export default RecruitmentReasonStep;
