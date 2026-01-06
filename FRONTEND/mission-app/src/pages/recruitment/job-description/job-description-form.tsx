import { Save, X } from "lucide-react";
import * as FaIcons from "react-icons/fa";
import React, { useCallback, useEffect, useState } from "react";

import {
    PopupOverlay,
    PagePopup,
    PopupHeader,
    PopupTitle,
    PopupClose,
    PopupContent,
    ButtonPrimary,
} from "@/styles/popup-styles";

import {
    FormContainer,
    StepperWrapper,
    StepItem,
    StepContent,
    StepNavigation,
    NextButton,
    PreviousButton,
    GenericForm
} from "@/styles/form-container";

import Alert from "@/components/alert";
import AttributionStep from "./components/attribution-step";
import axios from "axios";
import useCreateJobDescriptionForm from "./hooks/use-job-form";
import FormationExperienceStep from "./components/experience-step";
import SkillStep from "./components/skill-step";
import { useAddJobDescription, useGetJobDescription, useUpdateJobDescription } from "@/api/recruitment/service";

interface JobDescriptionFormProps {
    isOpen: boolean;
    requestId: string;
    jobId: string | null;
    mode: "create" | "edit";
    onClose: () => void;
    onFormSuccess: (type: "error" | "success" | "info", message: string) => void;
}

const JobDescriptionForm: React.FC<JobDescriptionFormProps> = ({
    isOpen,
    requestId,
    jobId,
    onClose,
    onFormSuccess,
    mode
}) => {
    const {
        currentStep,
        formData,
        setFormData,
        fieldErrors,
        handleInputChange,
        validateStep3,
        handleNext,
        handlePrevious,
        handleReset
    } = useCreateJobDescriptionForm(requestId);

    const { data: jobToEdit } = useGetJobDescription(
        mode === "edit" ? jobId : null
    );
    useEffect(() => {
        if (mode === "edit" && jobToEdit) {
            setFormData({
                requestId: jobToEdit.requestId,
                mission: jobToEdit.mission,
                attributions: jobToEdit.attributions,
                formations: jobToEdit.formations,
                experiences: jobToEdit.experiences,
                softSkills: jobToEdit.softSkills,
                skills: jobToEdit.skills,
            });
        }
    }, [mode, jobToEdit, setFormData]);

    const createJobDescription = useAddJobDescription();
    const updateJobDescription = useUpdateJobDescription(requestId);

    const [alert, setAlert] = useState<{
        isOpen: boolean;
        type: "success" | "info" | "error";
        message: string;
    }>({ isOpen: false, type: "info", message: "" });

    const closeAlert = useCallback(
        () => setAlert(a => ({ ...a, isOpen: false })), []
    );

    if (!isOpen) return null;

    const showError = (message: string) => setAlert({ isOpen: true, type: "error", message });

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(currentStep < 3) {
            handleNext(); return;
        }

        if(!validateStep3()) {
            showError("Veuillez corriger les erreurs avant validation.");
            return;
        }

        try {
            if (mode === "edit") {
                await updateJobDescription.mutateAsync(formData);

                onFormSuccess("success", "Fiche de poste mise à jour avec succès !");
                setAlert({
                    isOpen: true,
                    type: "success",
                    message: "Fiche de poste modifiée avec succès !"
                });
            } else {
                await createJobDescription.mutateAsync(formData);
                
                onFormSuccess("success", "Fiche de poste créée avec succès !");
                setAlert({
                    isOpen: true,
                    type: "success",
                    message: "Fiche de poste créée avec succès !"
                });
            }

            handleReset();
            onClose();
        } 
        catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                showError(error.response?.data?.message || error.message);
            } else if (error instanceof Error) {
                showError(error.message);
            } else {
                showError("Erreur inconnue");
            }
        }
    };

    return (
        <PopupOverlay>
            <PagePopup>
                <PopupHeader>
                    {jobId ? 
                        (<PopupTitle>Modification du TDR</PopupTitle>) 
                        : (<PopupTitle>Création de TDR</PopupTitle>)
                    }
                    <PopupClose onClick={() => { handleReset(); onClose(); }}>
                        <X size={20} />
                    </PopupClose>
                </PopupHeader>

                <PopupContent>
                    {alert.isOpen && (
                        <Alert {...alert} onClose={closeAlert} />
                    )}

                    <StepperWrapper>
                        <StepItem active={currentStep === 1}><span>1</span> Poste</StepItem>
                        <StepItem active={currentStep === 2}><span>2</span> Formations</StepItem>
                        <StepItem active={currentStep === 3}><span>3</span> Compétences</StepItem>
                    </StepperWrapper>

                    <FormContainer>
                        <GenericForm onSubmit={onSubmit}>
                            <StepContent active={currentStep === 1}>
                                <AttributionStep requestId={requestId}
                                formData={formData}
                                fieldErrors={fieldErrors}
                                handleInputChange={handleInputChange}
                                />

                                <StepNavigation>
                                    <NextButton type="button" onClick={handleNext}>
                                        Suivant <FaIcons.FaArrowRight />
                                    </NextButton>
                                </StepNavigation>
                            </StepContent>

                            <StepContent active={currentStep === 2}>
                                <FormationExperienceStep
                                formData={formData}
                                fieldErrors={fieldErrors}
                                handleInputChange={handleInputChange}
                                />

                                <StepNavigation>
                                    <PreviousButton type="button" onClick={handlePrevious}>
                                        <FaIcons.FaArrowLeft /> Précédent
                                    </PreviousButton>
                                    <NextButton type="button" onClick={handleNext}>
                                        Suivant <FaIcons.FaArrowRight />
                                    </NextButton>
                                </StepNavigation>
                            </StepContent>

                            <StepContent active={currentStep === 3}>
                                <SkillStep
                                formData={formData}
                                fieldErrors={fieldErrors}
                                handleInputChange={handleInputChange}
                                />

                                <StepNavigation>
                                    <PreviousButton type="button" onClick={handlePrevious}>
                                        <FaIcons.FaArrowLeft /> Précédent
                                    </PreviousButton>
                                    <ButtonPrimary type="submit">
                                        <Save size={16} />
                                        {jobId ? " Mettre à jour" : " Créer le TDR"}
                                    </ButtonPrimary>
                                </StepNavigation>
                            </StepContent>
                        </GenericForm>
                    </FormContainer>
                </PopupContent>
            </PagePopup>
        </PopupOverlay>
    );
};

export default JobDescriptionForm;
