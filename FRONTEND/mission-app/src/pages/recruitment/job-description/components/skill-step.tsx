"use client";

import React, { useMemo } from "react";
import {
    FormSectionTitle,
    FormTable,
    FormRow,
    FormFieldCell,
    FormInput,
    ErrorMessage
} from "@/styles/form-container";
import { Plus, Minus } from "lucide-react";
import { useGetAllSoftSkills, type DocumentDTO } from "@/api/recruitment/service";

export interface SoftSkill {
    id: string;
}

export interface Skill {
    label: string;
}

interface FormData {
    softSkills: SoftSkill[];
    skills: Skill[];
}

interface FieldErrors {
    [key: string]: string[];
}

interface Props {
    formData: FormData;
    fieldErrors?: FieldErrors;
    handleInputChange: (e: { target: { name: keyof FormData; value: SoftSkill[] | Skill[] } }) => void;
}

const SkillStep: React.FC<Props> = ({ formData, fieldErrors = {}, handleInputChange }) => {
    const { data: softSkillsResponse } = useGetAllSoftSkills();
    const allSoftSkills = useMemo(() => softSkillsResponse?.data || [], [softSkillsResponse]);

    /* ========= SOFT SKILLS ========= */
    const toggleSoftSkill = (soft: DocumentDTO) => {
        const exists = formData.softSkills.some(s => s.id === soft.id);
        const newSoftSkills: SoftSkill[] = exists
            ? formData.softSkills.filter(s => s.id !== soft.id)
            : [...formData.softSkills, { id: soft.id }];
        handleInputChange({ target: { name: "softSkills", value: newSoftSkills } });
    };

    /* ========= COMPETENCES ========= */
    const addSkill = () => {
        const newSkills: Skill[] = [...formData.skills, { label: "" }];
        handleInputChange({ target: { name: "skills", value: newSkills } });
    };

    const removeSkill = (index: number) => {
        const newSkills = [...formData.skills];
        newSkills.splice(index, 1);
        handleInputChange({ target: { name: "skills", value: newSkills } });
    };

    const updateSkill = (index: number, value: string) => {
        const newSkills = [...formData.skills];
        newSkills[index] = { label: value };
        handleInputChange({ target: { name: "skills", value: newSkills } });
    };

    return ( <>
        <FormSectionTitle>Qualités personnelles</FormSectionTitle>
        <div style={{display: "flex",flexWrap: "wrap",gap: "12px"}}>
            {allSoftSkills.map((soft) => {
                const selected = formData.softSkills.some(s => s.id === soft.id);

                return (
                    <div key={soft.id} style={{
                        flex: "1 0 calc(33.33% - 12px)", // 3 colonnes par défaut
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: window.innerWidth <= 768 ? "0.8rem" : "1rem" // texte plus petit sur mobile
                    }} >
                        <input type="checkbox"
                            checked={selected}
                            onChange={() => toggleSoftSkill(soft)}
                        />
                        <label>{soft.name}</label>
                    </div>
                );
            })}

            {fieldErrors.softSkills?.length > 0 && (
                <div style={{ width: "100%", marginTop: "8px" }}>
                    <ErrorMessage>{fieldErrors.softSkills.join(", ")}</ErrorMessage>
                </div>
            )}
        </div>

        <FormSectionTitle>Compétences</FormSectionTitle>
        <FormTable>
            <tbody>
                {formData.skills.map((skill, index) => (
                    <FormRow key={index}>
                        <FormFieldCell>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ width: 24, textAlign: "center", fontWeight: 500 }}>{index + 1}</span>
                                <FormInput
                                    type="text"
                                    value={skill.label}
                                    placeholder="Compétence"
                                    onChange={(e) => updateSkill(index, e.target.value)}
                                    style={{ flex: 1, borderColor: fieldErrors.skills ? "red" : undefined }}
                                />
                                {index > 0 && (
                                    <button type="button" onClick={() => removeSkill(index)} style={{ padding: "0 8px" }}>
                                        <Minus size={16} />
                                    </button>
                                )}
                            </div>
                        </FormFieldCell>
                    </FormRow>
                ))}
                {fieldErrors.skills?.length > 0 && (
                    <FormRow>
                        <FormFieldCell>
                            <ErrorMessage>{fieldErrors.skills.join(", ")}</ErrorMessage>
                        </FormFieldCell>
                    </FormRow>
                )}

                <FormRow>
                    <FormFieldCell>
                        <button
                            type="button"
                            onClick={addSkill}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px" }}
                        >
                            <Plus size={16} /> Ajouter une compétence
                        </button>
                    </FormFieldCell>
                </FormRow>
            </tbody>
        </FormTable>
    </> );
};

export default SkillStep;
