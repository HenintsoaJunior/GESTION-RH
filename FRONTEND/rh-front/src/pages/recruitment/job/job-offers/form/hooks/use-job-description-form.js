import { useState, useEffect, useCallback } from "react";
import { createJobOffer } from "services/recruitment/job/job-offers/services";
import { fetchRecruitmentRequestById } from "services/recruitment/recruitment-request/services";

// Hook personnalisé pour gérer le formulaire de description d'une offre d'emploi
export const useJobDescriptionForm = (isOpen, setJobOffers, setTotalEntries, recruitmentRequestId) => {
  // État pour suivre l'étape actuelle du formulaire
  const [currentStep, setCurrentStep] = useState(1);

  // État pour stocker les données du formulaire
  const [formData, setFormData] = useState({
    generalInfo: {
      title: "",
      hierarchicalAttachment: "",
      workplace: "",
      duration: "",
      contractType: "",
      publicationDate: new Date().toISOString().slice(0, 16),
      deadlineDate: new Date().toISOString().slice(0, 16),
    },
    jobDetails: {
      missions: "",
      attributions: [""],
    },
    requirements: {
      formations: [""],
      experiences: [""],
      personalQualities: [""],
      skills: [""],
      requiredLanguages: [""], // Ajout du champ pour les langues requises
    },
  });

  // État pour gérer les erreurs de validation
  const [errors, setErrors] = useState({
    generalInfo: {},
    jobDetails: {},
    requirements: {},
  });

  // État pour indiquer si le formulaire est en cours de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État pour gérer les alertes (succès, info, etc.)
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });

  // État pour gérer les modales d'erreur
  const [errorModal, setErrorModal] = useState({ isOpen: false, type: "error", message: "" });

  // État pour indiquer si une durée de contrat est requise
  const [hasContractDuration, setHasContractDuration] = useState(true);

  // Chargement des données initiales à partir de recruitmentRequestId
  useEffect(() => {
    if (isOpen && recruitmentRequestId) {
      fetchRecruitmentRequestById(
        recruitmentRequestId,
        (data) => {
          setFormData((prev) => ({
            ...prev,
            generalInfo: {
              ...prev.generalInfo,
              title: data.recruitmentRequest?.positionTitle || "",
              hierarchicalAttachment: data.supervisorPosition || "",
              workplace: data.recruitmentRequest?.site?.siteName || "",
              duration: data.recruitmentRequest?.contractDuration || "",
              contractType: data.recruitmentRequest?.contractType?.label || "",
              publicationDate: data.recruitmentRequest?.desiredStartDate
                ? new Date(data.recruitmentRequest.desiredStartDate).toISOString().slice(0, 16)
                : prev.generalInfo.publicationDate,
              deadlineDate: prev.generalInfo.deadlineDate,
            },
            requirements: {
              ...prev.requirements,
              formations: data.recruitmentRequest?.requiredEducation
                ? [data.recruitmentRequest.requiredEducation]
                : [""],
              experiences: data.recruitmentRequest?.requiredExperience
                ? [data.recruitmentRequest.requiredExperience]
                : [""],
              requiredLanguages: data.recruitmentRequest?.requiredLanguages
                ? [data.recruitmentRequest.requiredLanguages]
                : [""], // Ajout des langues requises
            },
          }));
          setHasContractDuration(!!data.recruitmentRequest?.contractDuration);
        },
        setIsSubmitting,
        setErrorModal
      );
    }
  }, [isOpen, recruitmentRequestId]);

  // Mise à jour d'un champ spécifique dans formData
  const updateFormField = useCallback((section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  }, []);

  // Validation des champs pour chaque étape du formulaire
  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;
    switch (step) {
      case 1:
        stepErrors = {
          title: !formData.generalInfo.title.trim(),
          hierarchicalAttachment: !formData.generalInfo.hierarchicalAttachment.trim(),
          workplace: !formData.generalInfo.workplace.trim(),
          duration: hasContractDuration && !formData.generalInfo.duration.trim(),
          contractType: !formData.generalInfo.contractType.trim(),
          publicationDate: !formData.generalInfo.publicationDate || isNaN(Date.parse(formData.generalInfo.publicationDate)),
          deadlineDate: !formData.generalInfo.deadlineDate || isNaN(Date.parse(formData.generalInfo.deadlineDate)),
        };
        isValid = !Object.values(stepErrors).some((error) => error);
        setErrors((prev) => ({ ...prev, generalInfo: stepErrors }));
        break;
      case 2:
        stepErrors = {
          missions: !formData.jobDetails.missions.trim(),
          attributions: formData.jobDetails.attributions.some((attr) => !attr.trim()),
        };
        isValid = !stepErrors.missions && !stepErrors.attributions;
        setErrors((prev) => ({ ...prev, jobDetails: stepErrors }));
        break;
      case 3:
        stepErrors = {
          formations: formData.requirements.formations.some((form) => !form.trim()),
          experiences: formData.requirements.experiences.some((exp) => !exp.trim()),
          personalQualities: formData.requirements.personalQualities.some((qual) => !qual.trim()),
          skills: formData.requirements.skills.some((skill) => !skill.trim()),
          requiredLanguages: formData.requirements.requiredLanguages.some((lang) => !lang.trim()), // Validation des langues
        };
        isValid = !Object.values(stepErrors).some((error) => error === true);
        setErrors((prev) => ({ ...prev, requirements: stepErrors }));
        break;
      default:
        break;
    }
    return isValid;
  };

  // Passe à l'étape suivante si la validation est réussie
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setErrorModal({
        isOpen: true,
        type: "error",
        message: "Veuillez corriger les erreurs avant de continuer.",
      });
    }
  };

  // Retourne à l'étape précédente
  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Gestion des attributions
  const handleAddAttribution = () => {
    setFormData((prev) => ({
      ...prev,
      jobDetails: {
        ...prev.jobDetails,
        attributions: [...prev.jobDetails.attributions, ""],
      },
    }));
  };

  const handleRemoveAttribution = (index) => {
    if (formData.jobDetails.attributions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        jobDetails: {
          ...prev.jobDetails,
          attributions: prev.jobDetails.attributions.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const handleAttributionChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      jobDetails: {
        ...prev.jobDetails,
        attributions: prev.jobDetails.attributions.map((attr, i) => (i === index ? value : attr)),
      },
    }));
  };

  // Gestion des qualités personnelles
  const handleAddQuality = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        personalQualities: [...prev.requirements.personalQualities, ""],
      },
    }));
  };

  const handleRemoveQuality = (index) => {
    if (formData.requirements.personalQualities.length > 1) {
      setFormData((prev) => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          personalQualities: prev.requirements.personalQualities.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const handleQualityChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        personalQualities: prev.requirements.personalQualities.map((qual, i) => (i === index ? value : qual)),
      },
    }));
  };

  // Gestion des compétences
  const handleAddSkill = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        skills: [...prev.requirements.skills, ""],
      },
    }));
  };

  const handleRemoveSkill = (index) => {
    if (formData.requirements.skills.length > 1) {
      setFormData((prev) => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          skills: prev.requirements.skills.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const handleSkillChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        skills: prev.requirements.skills.map((skill, i) => (i === index ? value : skill)),
      },
    }));
  };

  // Gestion des formations
  const handleAddFormation = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        formations: [...prev.requirements.formations, ""],
      },
    }));
  };

  const handleRemoveFormation = (index) => {
    if (formData.requirements.formations.length > 1) {
      setFormData((prev) => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          formations: prev.requirements.formations.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const handleFormationChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        formations: prev.requirements.formations.map((form, i) => (i === index ? value : form)),
      },
    }));
  };

  // Gestion des expériences
  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        experiences: [...prev.requirements.experiences, ""],
      },
    }));
  };

  const handleRemoveExperience = (index) => {
    if (formData.requirements.experiences.length > 1) {
      setFormData((prev) => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          experiences: prev.requirements.experiences.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const handleExperienceChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        experiences: prev.requirements.experiences.map((exp, i) => (i === index ? value : exp)),
      },
    }));
  };

  // Gestion des langues requises
  const handleAddLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        requiredLanguages: [...prev.requirements.requiredLanguages, ""],
      },
    }));
  };

  const handleRemoveLanguage = (index) => {
    if (formData.requirements.requiredLanguages.length > 1) {
      setFormData((prev) => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          requiredLanguages: prev.requirements.requiredLanguages.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const handleLanguageChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        requiredLanguages: prev.requirements.requiredLanguages.map((lang, i) => (i === index ? value : lang)),
      },
    }));
  };

  // Récupération de l'ID utilisateur depuis localStorage
  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.userId;

  // Soumission du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault();
    let allValid = true;
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        allValid = false;
      }
    }
    if (allValid) {
      setIsSubmitting(true);
      try {
        const jobOfferData = {
          status: "Publiée",
          publicationDate: formData.generalInfo.publicationDate,
          deadlineDate: formData.generalInfo.deadlineDate,
          duration: hasContractDuration ? formData.generalInfo.duration : undefined,
          contractType: formData.generalInfo.contractType,
          recruitmentRequestId,
          requesterId: userId,
          title: formData.generalInfo.title,
          description: formData.jobDetails.missions,
          attributions: formData.jobDetails.attributions.join(", "),
          requiredEducation: formData.requirements.formations.join(", "),
          requiredExperience: formData.requirements.experiences.join(", "),
          requiredPersonalQualities: formData.requirements.personalQualities.join(", "),
          requiredSkills: formData.requirements.skills.join(", "),
          requiredLanguages: formData.requirements.requiredLanguages.join(", "), // Ajout des langues
          createdAt: new Date().toISOString(),
          updatedAt: null,
        };
        await createJobOffer(
          jobOfferData,
          setJobOffers,
          () => {},
          setTotalEntries,
          (notification) => {
            setAlert(notification);
          },
          (notification) => {
            setErrorModal(notification);
          }
        );
        return { success: true };
      } catch (error) {
        setErrorModal({
          isOpen: true,
          type: "error",
          message: `Erreur lors de la création de l'offre d'emploi: ${error.message}`,
        });
        return { success: false };
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrorModal({
        isOpen: true,
        type: "error",
        message: "Veuillez corriger toutes les erreurs avant de soumettre.",
      });
      return { success: false };
    }
  };

  // Réinitialisation du formulaire
  const handleReset = (close = false) => {
    setFormData({
      generalInfo: {
        title: "",
        hierarchicalAttachment: "",
        workplace: "",
        duration: "",
        contractType: "",
        publicationDate: new Date().toISOString().slice(0, 16),
        deadlineDate: new Date().toISOString().slice(0, 16),
      },
      jobDetails: {
        missions: "",
        attributions: [""],
      },
      requirements: {
        formations: [""],
        experiences: [""],
        personalQualities: [""],
        skills: [""],
        requiredLanguages: [""], // Réinitialisation des langues
      },
    });
    setErrors({
      generalInfo: {},
      jobDetails: {},
      requirements: {},
    });
    setCurrentStep(1);
    if (close) {
      // Logique de fermeture supplémentaire si nécessaire
    }
  };

  // Ferme l'alerte
  const closeAlert = () => {
    setAlert({ ...alert, isOpen: false });
  };

  // Ferme la modale d'erreur
  const closeErrorModal = () => {
    setErrorModal({ ...errorModal, isOpen: false });
  };

  // Retourne toutes les données et fonctions nécessaires au composant
  return {
    currentStep,
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    alert,
    errorModal,
    hasContractDuration,
    handleNext,
    handlePrevious,
    handleAddAttribution,
    handleRemoveAttribution,
    handleAttributionChange,
    handleAddQuality,
    handleRemoveQuality,
    handleQualityChange,
    handleAddSkill,
    handleRemoveSkill,
    handleSkillChange,
    handleAddFormation,
    handleRemoveFormation,
    handleFormationChange,
    handleAddExperience,
    handleRemoveExperience,
    handleExperienceChange,
    handleAddLanguage, // Ajout du gestionnaire pour ajouter une langue
    handleRemoveLanguage, // Ajout du gestionnaire pour supprimer une langue
    handleLanguageChange, // Ajout du gestionnaire pour modifier une langue
    handleSubmit,
    handleReset,
    closeAlert,
    closeErrorModal,
  };
};