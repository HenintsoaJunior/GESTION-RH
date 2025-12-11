"use client";

import React, { useMemo } from "react";
import {
    FormSectionTitle,
    FormTable,
    FormRow,
    FormFieldCell,
    FormLabel,
    FormLabelRequired,
    FormInput,
    ErrorMessage,
    StyledAutoCompleteInput,
} from "@/styles/form-container";
import {
    useGetReplacementReasons,
    useGetUsersByDirection,
    type DocumentDTO,
} from "@/api/recruitment/service";

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
    direction,
    fieldErrors = {},
    isSubmitting = false,
    handleInputChange,
}) => {
    /** Motifs */
    const { data: reasonsResponse, isLoading: reasonsLoading } = useGetReplacementReasons();
    const reasons: DocumentDTO[] = useMemo(() => reasonsResponse?.data || [], [reasonsResponse]);
    const isOtherReason = formData.replacementReasonId === "other";

    /** Employés */
    const { data: usersResponse, isLoading: usersLoading } = useGetUsersByDirection(direction);
    const users: DocumentDTO[] = useMemo(() => usersResponse?.data || [], [usersResponse]);

    /** Suggestions employees */
    const userSuggestions = useMemo(
		() => users.map(u => ({
			id: u.id,
			label: u.name
		})),
		[users]
	);

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

	// Trouver le label correspondant à l’ID contenu dans le formulaire
	const selectedReasonLabel =
		reasonSuggestions.find(r => r.id === formData.replacementReasonId)?.label || "";

    return (
        <>
            {/* Section 1: Remplacement */}
            <FormSectionTitle>Détails du remplacement</FormSectionTitle>

            <FormTable>
                <tbody>
                    {/* Checkbox Remplacement */}
                    <FormRow>
                        <FormFieldCell colSpan={2}>
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
                                <span style={{ fontWeight: 500 }}>Ceci est un remplacement</span>
                            </label>
                        </FormFieldCell>
                    </FormRow>

                    {formData.isReplacement && (
                        <>
                            {/* Motif */}
                            <FormRow>
                                <FormFieldCell colSpan={2}>
									<FormLabelRequired>Motif de remplacement</FormLabelRequired>

									<StyledAutoCompleteInput
										value={selectedReasonLabel}   // <-- Affiche le label
										onChange={(label) => {
											const selected = reasonSuggestions.find(r => r.label === label);

											handleInputChange({
												target: {
													name: "replacementReasonId",
													value: selected ? selected.id : null   // <-- Envoie l’ID
												}
											});
										}}
										suggestions={reasonSuggestions.map(r => r.label)} // <-- Liste des labels
										placeholder="Chercher un motif..."
										disabled={isSubmitting || reasonsLoading}
										maxVisibleItems={5}
										fieldType="reason"
										fieldLabel="Motif de remplacement"
									/>

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
									<FormLabel>Ancien titulaire</FormLabel>
									<StyledAutoCompleteInput
										value={
											userSuggestions.find(u => u.id === formData.lastTitularId)?.label || ""
										}
										onChange={(label) => {
											const selectedUser = userSuggestions.find(u => u.label === label);
											handleInputChange({
												target: {
													name: "lastTitularId",
													value: selectedUser ? selectedUser.id : null
												}
											});
										}}
										suggestions={userSuggestions.map(u => u.label)}
										placeholder="Rechercher employé..."
										disabled={isSubmitting || usersLoading}
										maxVisibleItems={5}
										fieldType="employee"
										fieldLabel="Dernier titulaire"
									/>

									{fieldErrors?.lastTitularId && (
										<ErrorMessage>{fieldErrors.lastTitularId.join(", ")}</ErrorMessage>
									)}
								</FormFieldCell>

                            </FormRow>
                        </>
                    )}
                </tbody>
            </FormTable>

            <FormSectionTitle>Budget concerné</FormSectionTitle>
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
                                    <span>Prévu</span>
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
                                    <span>Non prévu</span>
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
        </>
    );
};

export default RecruitmentReasonStep;
