import { useState, useCallback } from "react";
import type { Skill, SoftSkill } from "../components/skill-step";

type FieldErrors = { [key: string]: string[] };

export interface Formation {
  educationId: string;
  levelEducationId: string;
}

export interface Experience {
  post: string;
  years: number;
}

export interface JobDescriptionForm {
  requestId: string;
  mission: string;
  attributions: string[];
  skills: { label: string }[];
  formations: Formation[];
  experiences: Experience[];
  softSkills: { id: string }[];
}

const useCreateJobDescriptionForm = (requestId: string) => {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<JobDescriptionForm>({
    requestId,
    mission: "",
    attributions: [],
    skills: [],
    formations: [],
    experiences: [],
    softSkills: [],
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /* =======================
     UTILITAIRES
  ======================= */

  const clearError = (name: string) =>
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });

  const handleInputChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { name: string; value: string | number | string[]
            | { educationId: string; levelEducationId: string }[]
            | { post: string; years: number | "" }[]
            | SoftSkill[] | Skill[]
         } }
    ) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      clearError(name);
    },
    []
  );

  const handleReset = useCallback(() => {
    setFormData({
      requestId,
      mission: "",
      attributions: [],
      skills: [],
      formations: [],
      experiences: [],
      softSkills: [],
    });
    setFieldErrors({});
    setCurrentStep(1);
  }, [requestId]);

/* =======================
    VALIDATIONS
======================= */
/* ===== STEP 1 ===== */
  const validateStep1 = useCallback(() => {
    const errors: FieldErrors = {};

    if (!formData.mission.trim()) {
        errors.mission = ["La mission est obligatoire"];
    }

  // Vérification des attributions
    const emptyAttributions = formData.attributions
        .map((a, i) => a.trim() === "" ? i + 1 : null)
        .filter(i => i !== null);
    if (formData.attributions.length === 0) {
      errors.attributions = ["Ajoutez au moins une attribution"];
    } else if (emptyAttributions.length > 0) {
      errors.attributions = emptyAttributions.map(i => `L'attribution N°${i} est vide`);
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);


/* ===== STEP 2 ===== */
  const validateStep2 = useCallback(() => {
    const errors: FieldErrors = {};

    /* FORMATIONS */
    if(!formData.formations || formData.formations.length === 0) {
      errors.formations = [
        "Ajoutez au moins une étude"
      ];
    }
    if(formData.formations.some(f => 
      !f.educationId || !f.levelEducationId)) {
      errors.formations = [
        "Toutes les formations doivent être complétées"
      ];
    }

    /* EXPERIENCES */
    if(!formData.experiences || formData.experiences.length===0) {
      errors.experiences = [
        "Ajoutez au moins une expérience"
      ];
    }
    if(formData.experiences.some(e => 
      !e.post || e.years <= 0)) {
      errors.experiences = [
        "Toutes les expériences doivent être complétées"
      ];
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);


/* ===== STEP 3 ===== */
  const validateStep3 = useCallback(() => {
    const errors: FieldErrors = {};

    if(formData.softSkills.length===0) {
      errors.softSkills = ["Sélectionnez au moins une qualité personnelle"];
    }

    if(formData.skills.length===0) {
      errors.skills = ["Ajoutez au moins une compétence"];
    }
    if(formData.skills.some(s => !s.label)) {
      errors.skills = ["Toutes les compétences doivent être complétées"];
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  /* NAVIGATION */

  const handleNext = useCallback(() => {
    const validators = [validateStep1, validateStep2, validateStep3];

    if (validators[currentStep - 1]()) {
      setCurrentStep((s) => Math.min(3, s + 1));
    }
  }, [currentStep, validateStep1, validateStep2, validateStep3]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((s) => Math.max(1, s - 1));
  }, []);

  return {
    /* state */
    currentStep,
    formData,
    fieldErrors,

    /* form */
    handleInputChange,
    handleReset,
    clearError,

    /* navigation */
    handleNext,
    handlePrevious,

    /* validations */
    validateStep1,
    validateStep2,
    validateStep3,
  };
};

export default useCreateJobDescriptionForm;
