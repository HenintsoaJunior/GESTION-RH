import { useState, useEffect, useCallback } from "react";
import { fetchContractTypes, getContractTypeId } from "services/contract/contract-type";
import { fetchDirections, getDirectionId } from "services/direction/direction";
import { fetchDepartments, getDepartmentId } from "services/direction/department";
import { fetchServices, getServiceId } from "services/direction/service";
import { fetchSites, getSiteId } from "services/site/site";
import { fetchAllEmployees } from "services/employee/employee";
import { fetchRecruitmentReasons, getRecruitmentReasonId } from "services/recruitment/recruitment-reason/recruitment-reason";
import { fetchReplacementReasons, getReplacementReasonId } from "services/recruitment/recruitment-reason/replacement-reason";
import { validateFirstStep, validateSecondStep } from "services/recruitment/recruitment-request/form-utils";
import { BASE_URL } from "config/apiConfig";

const initialFormData = {
  positionInfo: { intitule: "", effectif: 1 },
  contractType: { selectedType: "", duree: "", autreDetail: "" },
  attachment: {
    typeContrat: "",
    direction: "",
    departement: "",
    service: "",
    superieurHierarchique: "",
    fonctionSuperieur: "",
  },
  workSite: { selectedSite: "" },
  recruitmentMotive: "",
  replacementDetails: {
    motifs: [{ motifRemplacement: "", detail: "" }],
    dateSurvenance: "",
    nomPrenomsTitulaire: "",
    datePriseService: "",
  },
  description: "",
};

const initialErrors = {
  intitule: false,
  effectif: false,
  typeContrat: false,
  direction: false,
  departement: false,
  service: false,
  superieurHierarchique: false,
  fonctionSuperieur: false,
  selectedSite: false,
  recruitmentMotive: false,
  description: false,
  nomPrenomsTitulaire: false,
  datePriseService: false,
  motifs: [],
};

const initialSuggestions = {
  typeContrat: [],
  direction: [],
  departement: [],
  service: [],
  superieurHierarchique: [],
  fonctionSuperieur: [],
  motifRemplacement: [],
  site: [],
};

export const useRecruitmentRequestForm = (isOpen) => {
  // Form state management
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasClickedSubmit, setHasClickedSubmit] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);

  // Reference data
  const [contractTypes, setContractTypes] = useState([]);
  const [directions, setDirections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [services, setServices] = useState([]);
  const [recruitmentReasons, setRecruitmentReasons] = useState([]);
  const [replacementReasons, setReplacementReasons] = useState([]);
  const [suggestions, setSuggestions] = useState(initialSuggestions);

  // Loading states
  const [isLoading, setIsLoading] = useState({
    contractTypes: true,
    directions: true,
    departments: true,
    employees: true,
    sites: true,
    services: true,
    recruitmentReasons: true,
    replacementReasons: true,
  });

  // Alert and modal states
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  // Helper function to get employee ID
  const getEmployeeId = useCallback((employeeName, employeesList) => {
    const employee = employeesList.find((emp) => `${emp.lastName} ${emp.firstName}` === employeeName);
    return employee ? employee.employeeId : "";
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({ ...initialFormData });
    setErrors({ ...initialErrors });
    setSuggestions({ ...initialSuggestions });
    setCurrentStep(1);
    setHasClickedSubmit(false);
    setIsSubmitting(false);
  }, []);

  // Initialize data when popup opens
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }
    // Fetch all reference data
    fetchContractTypes(setContractTypes, setIsLoading, setSuggestions, setAlert);
    fetchDirections(setDirections, setIsLoading, setSuggestions, setAlert);
    fetchDepartments(setDepartments, setIsLoading, setSuggestions, setAlert);
    fetchAllEmployees(setEmployees, setIsLoading, setSuggestions, setAlert);
    fetchSites(setSites, setIsLoading, setSuggestions, setAlert);
    fetchServices(setServices, setIsLoading, setSuggestions, setAlert);
    fetchRecruitmentReasons(setRecruitmentReasons, setIsLoading, setAlert);
    fetchReplacementReasons(setReplacementReasons, setIsLoading, setSuggestions, setAlert);
  }, [isOpen, resetForm]);

  // Filter departments based on selected direction
  useEffect(() => {
    if (formData.attachment.direction && departments.length > 0 && directions.length > 0) {
      const selectedDirection = directions.find((dir) => dir.directionName === formData.attachment.direction);
      if (selectedDirection) {
        const filteredDepartments = departments.filter(
          (dept) => dept.directionId === selectedDirection.directionId
        );
        setSuggestions((prev) => ({
          ...prev,
          departement: filteredDepartments.map((dept) => dept.departmentName),
          service: [],
        }));
      }
    } else {
      setSuggestions((prev) => ({
        ...prev,
        departement: [],
        service: [],
      }));
    }
    // Reset department and service when direction changes
    if (formData.attachment.departement || formData.attachment.service) {
      setFormData((prev) => ({
        ...prev,
        attachment: {
          ...prev.attachment,
          departement: "",
          service: "",
        },
      }));
      setErrors((prev) => ({
        ...prev,
        departement: false,
        service: false,
      }));
    }
  }, [formData.attachment.direction, departments, directions]);

  // Filter services based on selected department
  useEffect(() => {
    if (formData.attachment.departement && departments.length > 0 && services.length > 0) {
      const selectedDepartment = departments.find(
        (dept) => dept.departmentName === formData.attachment.departement
      );
      if (selectedDepartment) {
        const filteredServices = services.filter(
          (service) => service.departmentId === selectedDepartment.departmentId
        );
        setSuggestions((prev) => ({
          ...prev,
          service: filteredServices.map((service) => service.serviceName),
        }));
      }
    } else {
      setSuggestions((prev) => ({
        ...prev,
        service: [],
      }));
    }
    // Reset service when department changes
    if (formData.attachment.service) {
      setFormData((prev) => ({
        ...prev,
        attachment: {
          ...prev.attachment,
          service: "",
        },
      }));
      setErrors((prev) => ({
        ...prev,
        service: false,
      }));
    }
  }, [formData.attachment.departement, departments, services]);

  // Update employee suggestions
  useEffect(() => {
    if (employees.length > 0) {
      setSuggestions((prev) => ({
        ...prev,
        superieurHierarchique: employees.map((employee) => `${employee.lastName} ${employee.firstName}`),
      }));
    }
  }, [employees]);

  // Auto-fill supervisor function based on selected employee
  useEffect(() => {
    if (formData.attachment.superieurHierarchique && employees.length > 0) {
      const selectedEmployee = employees.find(
        (employee) => `${employee.lastName} ${employee.firstName}` === formData.attachment.superieurHierarchique
      );
      if (selectedEmployee) {
        setFormData((prev) => ({
          ...prev,
          attachment: {
            ...prev.attachment,
            fonctionSuperieur: selectedEmployee.jobTitle || "",
          },
        }));
        setErrors((prev) => ({ ...prev, fonctionSuperieur: false }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        attachment: {
          ...prev.attachment,
          fonctionSuperieur: "",
        },
      }));
      setErrors((prev) => ({ ...prev, fonctionSuperieur: false }));
    }
  }, [formData.attachment.superieurHierarchique, employees]);

  // Form handlers
  const handleAddNewSuggestion = useCallback((field, value) => {
    setSuggestions((prev) => ({
      ...prev,
      [field]: [...new Set([...prev[field], value])],
    }));
    setAlert({ isOpen: true, type: "success", message: `"${value}" ajouté aux suggestions pour ${field}` });
  }, []);

  const handleNext = useCallback(() => {
    const showValidationModal = (type, message) => {
      setErrorModal({ isOpen: true, type, message });
    };

    if (validateFirstStep(formData, setErrors, showValidationModal)) {
      setCurrentStep(2);
    }
  }, [formData]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const handleAddMotif = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      replacementDetails: {
        ...prev.replacementDetails,
        motifs: [...prev.replacementDetails.motifs, { motifRemplacement: "", detail: "" }],
      },
    }));
    setErrors((prev) => ({
      ...prev,
      motifs: [...prev.motifs, { motifRemplacement: false, detail: false }],
    }));
  }, []);

  const handleRemoveMotif = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      replacementDetails: {
        ...prev.replacementDetails,
        motifs: prev.replacementDetails.motifs.filter((_, i) => i !== index),
      },
    }));
    setErrors((prev) => ({
      ...prev,
      motifs: prev.motifs.filter((_, i) => i !== index),
    }));
  }, []);

  const handleMotifChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const updatedMotifs = [...prev.replacementDetails.motifs];
      updatedMotifs[index] = { ...updatedMotifs[index], [field]: value };
      return {
        ...prev,
        replacementDetails: { ...prev.replacementDetails, motifs: updatedMotifs },
      };
    });
    setErrors((prev) => {
      const updatedMotifs = [...prev.motifs];
      updatedMotifs[index] = { ...updatedMotifs[index], [field]: false };
      return { ...prev, motifs: updatedMotifs };
    });
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    if (hasClickedSubmit || isSubmitting) {
      console.warn("Submission already in progress. Ignoring additional submit.");
      return;
    }

    const showValidationModal = (type, message) => {
      setErrorModal({ isOpen: true, type, message });
    };

    if (!validateSecondStep(formData, setErrors, showValidationModal)) {
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userId;
    setHasClickedSubmit(true);
    setIsSubmitting(true);

    try {
      const { positionInfo, contractType, attachment, workSite, recruitmentMotive, replacementDetails, description } = formData;
      const requestData = {
        positionTitle: positionInfo.intitule,
        positionCount: positionInfo.effectif,
        contractDuration: contractType.duree || "",
        formerEmployeeName: replacementDetails.nomPrenomsTitulaire || "",
        replacementDate: replacementDetails.dateSurvenance
          ? new Date(replacementDetails.dateSurvenance).toISOString()
          : new Date().toISOString(),
        newPositionExplanation: description || "",
        desiredStartDate: replacementDetails.datePriseService
          ? new Date(replacementDetails.datePriseService).toISOString()
          : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "En Cours",
        files: "",
        requesterId: userId,
        contractTypeId: getContractTypeId(attachment.typeContrat, contractTypes) || "",
        siteId: getSiteId(workSite.selectedSite, sites) || "",
        recruitmentReasonId: getRecruitmentReasonId(recruitmentMotive, recruitmentReasons) || "",
        recruitmentRequestDetail: {
          supervisorPosition: attachment.fonctionSuperieur || "",
          recruitmentRequestId: "",
          directionId: getDirectionId(attachment.direction, directions) || "",
          departmentId: getDepartmentId(attachment.departement, departments) || "",
          serviceId: getServiceId(attachment.service, services) || "",
          directSupervisorId: getEmployeeId(attachment.superieurHierarchique, employees) || "",
        },
        replacementReasons: replacementDetails.motifs
          .filter((motif) => motif.motifRemplacement && motif.detail)
          .map((motif) => ({
            recruitmentRequestId: "",
            replacementReasonId: getReplacementReasonId(motif.motifRemplacement, replacementReasons) || "",
            description: motif.detail,
          })),
      };

      const response = await fetch(`${BASE_URL}/api/RecruitmentRequest/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setAlert({ isOpen: true, type: "success", message: "Demande de recrutement soumise avec succès !" });
        // Auto-dismiss the alert after 1.5 seconds
        setTimeout(() => {
          closeAlert();
        }, 1500);
        resetForm();
        return { success: true };
      } else {
        const errorData = await response.text();
        setErrorModal({
          isOpen: true,
          type: "error",
          message: `Erreur lors de la soumission: ${errorData || response.statusText}`,
        });
        return { success: false, error: errorData || response.statusText };
      }
    } catch (error) {
      setErrorModal({
        isOpen: true,
        type: "error",
        message: `Erreur de connexion: ${error.message}`,
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
      setHasClickedSubmit(false);
    }
  }, [
    formData,
    hasClickedSubmit,
    isSubmitting,
    contractTypes,
    sites,
    recruitmentReasons,
    directions,
    departments,
    services,
    employees,
    replacementReasons,
    getEmployeeId,
    resetForm,
  ]);

  const handleReset = useCallback((showAlert = true) => {
    resetForm();
    if (showAlert) {
      setAlert({ isOpen: true, type: "info", message: "Formulaire réinitialisé." });
    }
  }, [resetForm]);

  // Alert handlers
  const closeAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const closeErrorModal = useCallback(() => {
    setErrorModal({ isOpen: false, message: "" });
  }, []);

  return {
    // Form state
    currentStep,
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    hasClickedSubmit,

    // Reference data
    contractTypes,
    directions,
    departments,
    employees,
    sites,
    services,
    recruitmentReasons,
    replacementReasons,
    suggestions,

    // Loading states
    isLoading,

    // Alert and modal states
    alert,
    errorModal,

    // Form handlers
    handleNext,
    handlePrevious,
    handleAddMotif,
    handleRemoveMotif,
    handleMotifChange,
    handleAddNewSuggestion,
    handleSubmit,
    handleReset,

    // Alert handlers
    closeAlert,
    closeErrorModal,

    // Utility functions
    resetForm,
  };
};