"use client";

import React from "react";
import {
    FormSectionTitle,
    FormTable,
    FormRow,
    FormFieldCell,
    FormLabelRequired,
    FormInput,
    ErrorMessage
} from "@/styles/form-container";
import { Plus, Minus } from "lucide-react";

interface Props {
    requestId: string;
    formData: {
        mission: string;
        attributions: string[];
        skills: { label: string }[];
    };
    fieldErrors?: { [key: string]: string[] };
    handleInputChange: (
        e: { target: { name: string; value: string | number | string[] } }
    ) => void;
}

const AttributionStep: React.FC<Props> = ({
    requestId,
    formData,
    fieldErrors = {},
    handleInputChange
}) => {

    const addAttribution = () => {
        handleInputChange({
            target: {
                name: "attributions",
                value: [...formData.attributions, ""]
            }
        });
    };

    const removeAttribution = (index: number) => {
        const newAttributions = [...formData.attributions];
        newAttributions.splice(index, 1);
        handleInputChange({
            target: { name: "attributions", value: newAttributions }
        });
    };

    const updateAttribution = (value: string, index: number) => {
        const newAttributions = [...formData.attributions];
        newAttributions[index] = value;
        handleInputChange({
            target: { name: "attributions", value: newAttributions }
        });
    };

    return (
        <>
            <FormSectionTitle>Informations du poste</FormSectionTitle>

            <FormTable>
                <tbody>
                    {/* DEMANDE */}
                    <FormRow>
                        <FormFieldCell colSpan={2}>
                            <FormLabelRequired>Demande</FormLabelRequired>
                            <FormInput
                                name="requestId"
                                value={requestId}
                                readOnly
                                disabled
                            />
                        </FormFieldCell>
                    </FormRow>

                    {/* MISSION */}
                    <FormRow>
                        <FormFieldCell colSpan={2}>
                            <FormLabelRequired>Mission</FormLabelRequired>
                            <textarea
                                name="mission"
                                value={formData.mission}
                                onChange={(e) =>
                                    handleInputChange({
                                        target: { name: "mission", value: e.target.value }
                                    })
                                }
                                style={{
                                    width: "100%",
                                    minHeight: 120,
                                    borderColor: fieldErrors.mission ? "red" : undefined
                                }}
                            />
                            {fieldErrors.mission && (
                                <ErrorMessage>
                                    {fieldErrors.mission.join(", ")}
                                </ErrorMessage>
                            )}
                        </FormFieldCell>
                    </FormRow>

                    {/* LABEL ATTRIBUTIONS (ligne séparée) */}
                    <FormRow>
                        <FormFieldCell colSpan={2}>
                            <FormLabelRequired>Attributions</FormLabelRequired>
                        </FormFieldCell>
                    </FormRow>

                    {/* ATTRIBUTIONS */}
                    {formData.attributions.map((attr, index) => {
                        const hasError =
                            fieldErrors.attributions &&
                            fieldErrors.attributions.some(msg =>
                                msg.includes(`${index + 1}`)
                            );

                        return (
                            <FormRow key={index}>
                                <FormFieldCell colSpan={2}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8
                                        }}
                                    >
                                        {/* Index */}
                                        <span
                                            style={{
                                                width: 24,
                                                textAlign: "center",
                                                fontWeight: 500
                                            }}
                                        >
                                            {index + 1}
                                        </span>

                                        <FormInput
                                            type="text"
                                            value={attr}
                                            onChange={(e) =>
                                                updateAttribution(e.target.value, index)
                                            }
                                            placeholder="Entrée + Entrée"
                                            style={{
                                                flex: 1,
                                                borderColor: hasError ? "red" : undefined
                                            }}
                                        />

                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => removeAttribution(index)}
                                                style={{ padding: "0 8px" }}
                                            >
                                                <Minus size={16} />
                                            </button>
                                        )}
                                    </div>
                                </FormFieldCell>
                            </FormRow>
                        );
                    })}

                    {/* ERREURS ATTRIBUTIONS */}
                    {fieldErrors.attributions && (
                        <FormRow>
                            <FormFieldCell colSpan={2}>
                                <ErrorMessage>
                                    {fieldErrors.attributions.join(", ")}
                                </ErrorMessage>
                            </FormFieldCell>
                        </FormRow>
                    )}

                    {/* BOUTON AJOUT */}
                    <FormRow>
                        <FormFieldCell colSpan={2}>
                            <button
                                type="button"
                                onClick={addAttribution}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    padding: "4px"
                                }}
                            >
                                <Plus size={16} />
                                Ajouter une attribution
                            </button>
                        </FormFieldCell>
                    </FormRow>
                </tbody>
            </FormTable>
        </>
    );
};

export default AttributionStep;
