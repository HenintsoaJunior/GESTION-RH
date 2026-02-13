"use client";

import React, { useMemo, useRef, useState } from "react";
import {
    FormSectionTitle,
    FormTable,
    FormRow,
    FormFieldCell,
    FormInput,
    ErrorMessage,
} from "@/styles/form-container";
import { Plus, Minus } from "lucide-react";
import { useGetAllLevelEducations } from "@/api/recruitment/service";
import { StyledSelect } from "@/styles/table-styles";

interface Props {
    formData: {
        formations: { formations: string; levelEducationId: string }[];
        experiences: { post: string; years: number | "" }[];
    };
    fieldErrors?: { [key: string]: string[] };
    handleInputChange: (
        e: { target: { name: string; value: string | number | string[] 
            | { formations: string; levelEducationId: string }[]
            | { post: string; years: number | "" }[] } }
    ) => void;
}


const FormationExperienceStep: React.FC<Props> = ({
    formData,
    fieldErrors = {},
    handleInputChange
}) => {
    const [selectSize, setSelectSize] = useState<number>(1);
    const selectRef = useRef<HTMLSelectElement>(null);

    const { data: levelsResponse } = useGetAllLevelEducations();
    const allLevels = useMemo(
        () => levelsResponse?.data || [], [levelsResponse]
    );

/* FORMATIONS */
    const addFormation = () => {
        handleInputChange({
            target: {
            name: "formations",
            value: [...formData.formations, { formations: "", levelEducationId: "" }]
            }
        });
    };

    const removeFormation = (index: number) => {
        const newFormations = [...formData.formations];
        newFormations.splice(index, 1);
        handleInputChange({ target: { name: "formations", value: newFormations } });
    };

    const updateFormation = (
        index: number,
        field: "formations" | "levelEducationId",
        value: string
    ) => {
        const newFormations = [...formData.formations];
        newFormations[index] = {
            ...newFormations[index],
            [field]: value
        };
        handleInputChange({
            target: { name: "formations", value: newFormations }
        });
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
            {formData.formations.map((formation, index) => (
            <FormRow key={index}>
                <FormFieldCell>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 24, textAlign: "center", fontWeight: 500 }}>
                    {index + 1}
                    </span>

                {/* CHAMP LIBRE FORMATION */}
                    <FormInput
                    type="text"
                    placeholder="Formation / Étude"
                    value={formation.formations}
                    onChange={(e) =>
                        updateFormation(index, "formations", e.target.value)
                    }
                    style={{ flex: 2 }}
                    />

                {/* NIVEAU D'ÉTUDE */}
                    <StyledSelect
                    ref={selectRef}
                    value={formation.levelEducationId}
                    size={selectSize ?? 5}
                    disabled={!allLevels.length}
                    onChange={(e) => {
                        updateFormation(index, "levelEducationId", e.target.value);
                        setSelectSize(1); selectRef.current?.blur();
                    }
                    }
                    onFocus={() => setSelectSize(5)}
                    onBlur={() => setSelectSize(1)}
                    style={{ flex: 1 }}
                    >
                        <option value="" disabled>
                            Niveau d'étude
                        </option>
                        {allLevels.map((l) => (
                            <option key={l.id} value={l.id}>
                            {l.name}
                            </option>
                        ))}
                    </StyledSelect>

                    {index > 0 && (
                    <button
                        type="button"
                        onClick={() => removeFormation(index)}
                        style={{ padding: "0 8px" }}
                    >
                        <Minus size={16} />
                    </button>
                    )}
                </div>
                </FormFieldCell>
            </FormRow>
            ))}

            {fieldErrors.formations && (
            <FormRow>
                <FormFieldCell>
                <ErrorMessage>{fieldErrors.formations.join(", ")}</ErrorMessage>
                </FormFieldCell>
            </FormRow>
            )}

            <FormRow>
            <FormFieldCell>
                <button
                type="button"
                onClick={addFormation}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px" }}
                >
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
                                style={{ flex: 2, borderColor: hasError ? "red" : undefined }}
                                />

                                <FormInput
                                className="no-spinner"
                                type="text"
                                placeholder="Années d'expérience"
                                value={exp.years}
                                onChange={(e) => updateExperience(index, "years", e.target.value)}
                                style={{ flex: 1, borderColor: hasError ? "red" : undefined }}
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
