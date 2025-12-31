"use client";

import React, { useMemo } from "react";
import {
    FormSectionTitle,
    FormTable,
    FormRow,
    FormFieldCell,
    FormInput,
    ErrorMessage,
    StyledAutoCompleteInput,
} from "@/styles/form-container";
import { Plus, Minus } from "lucide-react";
import { useGetAllEducations, useGetAllLevelEducations, type DocumentDTO } from "@/api/recruitment/service";


interface Props {
    formData: {
        formations: { educationId: string; levelEducationId: string }[];
        experiences: { post: string; years: number | "" }[];
    };
    fieldErrors?: { [key: string]: string[] };
    handleInputChange: (
        e: { target: { name: string; value: string | number | string[] 
            | { educationId: string; levelEducationId: string }[]
            | { post: string; years: number | "" }[] } }
    ) => void;
}


const FormationExperienceStep: React.FC<Props> = ({
    formData,
    fieldErrors = {},
    handleInputChange
}) => {
    const getLabelById = (
        list: DocumentDTO[], id: string
    ) => list.find(i => i.id === id)?.name || "";

    const getSuggestions = (
        list: { name: string }[], value: string
    ) =>
        list.map(i => i.name).filter(l => l.toLowerCase().includes(value.toLowerCase()));


    const { data: educationsResponse } = useGetAllEducations();
    const { data: levelsResponse } = useGetAllLevelEducations();

    const allEducations = useMemo(
        () => educationsResponse?.data || [], [educationsResponse]
    );
    const allLevels = useMemo(
        () => levelsResponse?.data || [], [levelsResponse]
    );

/* FORMATIONS */
    const addFormation = () => {
        handleInputChange({
        target: {
            name: "formations",
            value: [...formData.formations, { educationId: "", levelEducationId: "" }]
        }
        });
    };

    const removeFormation = (index: number) => {
        const newFormations = [...formData.formations];
        newFormations.splice(index, 1);
        handleInputChange({ target: { name: "formations", value: newFormations } });
    };

    const updateFormation = (index: number, field: "educationId" | "levelEducationId", value: string) => {
        const newFormations = [...formData.formations];
        newFormations[index][field] = value;
        handleInputChange({ target: { name: "formations", value: newFormations } });
    };

/* EXPERIENCES */
    const addExperience = () => {
        handleInputChange({
            target: {
                name: "experiences",
                value: [...formData.experiences, { post: "", years: "" }]
            }
        });
    };

    const removeExperience = (index: number) => {
        const newExperiences = [...formData.experiences];
        newExperiences.splice(index, 1);
        handleInputChange({ target: { name: "experiences", value: newExperiences } });
    };

    const updateExperience = (
        index: number,
        field: "post" | "years",
        value: string
    ) => {
        const newExperiences = [...formData.experiences];

        if (field === "years") {
            newExperiences[index] = {
                ...newExperiences[index],
                years: value === "" ? "" : Number(value),
            };
        } else {
            newExperiences[index] = {
                ...newExperiences[index],
                post: value,
            };
        }

        handleInputChange({
            target: { name: "experiences", value: newExperiences }
        });
    };

    return ( <>
        <FormSectionTitle>Formations</FormSectionTitle>

        <FormTable>
            <tbody>
            {formData.formations.map((formation, index) => {
                return (
                <FormRow key={index}>
                    <FormFieldCell>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 24, textAlign: "center", fontWeight: 500 }}>{index + 1}</span>
                        <StyledAutoCompleteInput
                            fieldLabel="Nom de l'étude"
                            value={getLabelById(allEducations, formation.educationId)}
                            suggestions={getSuggestions(
                                allEducations,
                                getLabelById(allEducations, formation.educationId)
                            )}
                            placeholder="Formation"
                            fieldType={`education-${index}`}
                            disabled={!allEducations.length}
                            onChange={(label:string) => {
                                const selected = allEducations.find(e => e.name === label);
                                updateFormation(index, "educationId", selected?.id || "");
                            }}
                        />

                        <StyledAutoCompleteInput
                            fieldLabel="Niveau de l'étude"
                            value={getLabelById(allLevels, formation.levelEducationId)}
                            suggestions={getSuggestions(
                                allLevels,
                                getLabelById(allLevels, formation.levelEducationId)
                            )}
                            placeholder="Niveau"
                            fieldType={`level-${index}`}
                            disabled={!allLevels.length}
                            onChange={(label:string) => {
                                const selected = allLevels.find(l => l.name === label);
                                updateFormation(index, "levelEducationId", selected?.id || "");
                            }}
                        />

                        {index > 0 && (
                        <button type="button" onClick={() => removeFormation(index)} style={{ padding: "0 8px" }}>
                            <Minus size={16} />
                        </button>
                        )}
                    </div>
                    </FormFieldCell>
                </FormRow>
                );
            })}

            {fieldErrors.formations && fieldErrors.formations.length > 0 && (
            <FormRow>
                <FormFieldCell>
                <ErrorMessage>{fieldErrors.formations.join(", ")}</ErrorMessage>
                </FormFieldCell>
            </FormRow>
            )}

            <FormRow>
                <FormFieldCell>
                <button type="button" onClick={addFormation} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px" }}>
                    <Plus size={16} /> Ajouter une formation
                </button>
                </FormFieldCell>
            </FormRow>
            </tbody>
        </FormTable>

        <FormSectionTitle>Expériences</FormSectionTitle>

        <FormTable>
            <tbody>
                {formData.experiences.map((exp, index) => {
                    const hasError = fieldErrors.experiences && fieldErrors.experiences.some(msg => msg.includes(`Expérience ${index + 1}`));
                    return (
                    <FormRow key={index}>
                        <FormFieldCell>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ width: 24, textAlign: "center", fontWeight: 500 }}>{index + 1}</span>

                                <FormInput
                                type="text"
                                placeholder="Poste"
                                value={exp.post}
                                onChange={(e) => updateExperience(index, "post", e.target.value)}
                                style={{ flex: 1, borderColor: hasError ? "red" : undefined }}
                                />

                                <FormInput
                                type="number"
                                placeholder="Années d'expérience"
                                value={exp.years}
                                onChange={(e) => updateExperience(index, "years", e.target.value)}
                                style={{ width: 80, borderColor: hasError ? "red" : undefined }}
                                />

                                {index > 0 && (
                                    <button type="button" onClick={() => removeExperience(index)} style={{ padding: "0 8px" }}>
                                        <Minus size={16} />
                                    </button>
                                )}
                            </div>
                        </FormFieldCell>
                    </FormRow>
                    );
                })}

                {fieldErrors.experiences && fieldErrors.experiences.length > 0 && (
                <FormRow>
                    <FormFieldCell>
                    <ErrorMessage>{fieldErrors.experiences.join(", ")}</ErrorMessage>
                    </FormFieldCell>
                </FormRow>
                )}

                <FormRow>
                    <FormFieldCell>
                        <button type="button" onClick={addExperience} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px" }}>
                            <Plus size={16} /> Ajouter une expérience
                        </button>
                    </FormFieldCell>
                </FormRow>
            </tbody>
        </FormTable>
  </> );
};

export default FormationExperienceStep;
