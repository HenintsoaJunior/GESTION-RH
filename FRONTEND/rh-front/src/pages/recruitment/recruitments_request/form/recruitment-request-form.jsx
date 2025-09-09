"use client";

import { useState, useEffect } from "react";
import { Check, X, Save } from "lucide-react";
import * as FaIcons from "react-icons/fa";
import {
  PopupOverlay,
  PagePopup,
  PopupHeader,
  PopupTitle,
  PopupClose,
  PopupContent,
  ButtonPrimary,
} from "styles/generaliser/popup-container";
import {
  FormContainer,
  StepperWrapper,
  StepItem,
  StepContent,
  StepNavigation,
  NextButton,
  PreviousButton,
  GenericForm,
} from "styles/generaliser/form-container";
import Alert from "components/alert";
import Modal from "components/modal";
import FirstStepForm from "./step/first-step-form";
import SecondStepForm from "./step/second-step-form";
import { fetchContractTypes, getContractTypeId } from "services/contract/contract-type";
import { fetchDirections, getDirectionId } from "services/direction/direction";
import { fetchDepartments, getDepartmentId } from "services/direction/department";
import { fetchServices, getServiceId } from "services/direction/service";
import { fetchSites, getSiteId } from "services/site/site";
import { fetchEmployees, getSupervisorId } from "services/employee/employee";
import { fetchRecruitmentReasons, getRecruitmentReasonId } from "services/recruitment/recruitment-reason/recruitment-reason";
import { fetchReplacementReasons, getReplacementReasonId } from "services/recruitment/recruitment-reason/replacement-reason";
import { validateFirstStep, validateSecondStep } from "services/recruitment/recruitment-request-service/form-utils";
import { BASE_URL } from "config/apiConfig";

export default function RecruitmentRequestForm({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasClickedSubmit, setHasClickedSubmit] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const [errors, setErrors] = useState({
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
  });
  const [formData, setFormData] = useState({
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
    selectedFiles: [],
  });
  const [contractTypes, setContractTypes] = useState([]);
  const [directions, setDirections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [services, setServices] = useState([]);
  const [recruitmentReasons, setRecruitmentReasons] = useState([]);
  const [replacementReasons, setReplacementReasons] = useState([]);
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
  const [suggestions, setSuggestions] = useState({
    typeContrat: [],
    direction: [],
    departement: [],
    service: [],
    superieurHierarchique: [],
    fonctionSuperieur: [],
    motifRemplacement: [],
    site: [],
  });

  // Load all data when popup opens
  useEffect(() => {
    if (!isOpen) {
      // Clear form data and errors when popup closes, but don't show alert
      setFormData({
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
        selectedFiles: [],
      });
      setErrors({
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
      });
      setCurrentStep(1);
      return;
    }

    // Fetch data when popup opens
    fetchContractTypes(setContractTypes, setIsLoading, setSuggestions, setAlert);
    fetchDirections(setDirections, setIsLoading, setSuggestions, setAlert);
    fetchDepartments(setDepartments, setIsLoading, setSuggestions, setAlert);
    fetchEmployees(setEmployees, setIsLoading, setSuggestions, setAlert);
    fetchSites(setSites, setIsLoading, setSuggestions, setAlert);
    fetchServices(setServices, setIsLoading, setSuggestions, setAlert);
    fetchRecruitmentReasons(setRecruitmentReasons, setIsLoading, setAlert);
    fetchReplacementReasons(setReplacementReasons, setIsLoading, setSuggestions, setAlert);
  }, [isOpen]);

  // Effet pour filtrer les départements quand la direction change
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
          superieurHierarchique: [],
          fonctionSuperieur: [],
        }));
      }
    } else {
      setSuggestions((prev) => ({
        ...prev,
        departement: [],
        service: [],
        superieurHierarchique: [],
        fonctionSuperieur: [],
      }));
    }

    if (formData.attachment.departement || formData.attachment.service || formData.attachment.superieurHierarchique) {
      setFormData((prev) => ({
        ...prev,
        attachment: {
          ...prev.attachment,
          departement: "",
          service: "",
          superieurHierarchique: "",
          fonctionSuperieur: "",
        },
      }));
      setErrors((prev) => ({
        ...prev,
        departement: false,
        service: false,
        superieurHierarchique: false,
        fonctionSuperieur: false,
      }));
    }
  }, [formData.attachment.direction, departments, directions]);

  // Effet pour filtrer les services quand le département change
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
          superieurHierarchique: [],
          fonctionSuperieur: [],
        }));
      }
    } else {
      setSuggestions((prev) => ({
        ...prev,
        service: [],
        superieurHierarchique: [],
        fonctionSuperieur: [],
      }));
    }

    if (formData.attachment.service || formData.attachment.superieurHierarchique) {
      setFormData((prev) => ({
        ...prev,
        attachment: {
          ...prev.attachment,
          service: "",
          superieurHierarchique: "",
          fonctionSuperieur: "",
        },
      }));
      setErrors((prev) => ({
        ...prev,
        service: false,
        superieurHierarchique: false,
        fonctionSuperieur: false,
      }));
    }
  }, [formData.attachment.departement, departments, services]);

  // Effet pour filtrer les employés quand le service change
  useEffect(() => {
    if (
      formData.attachment.service &&
      services.length > 0 &&
      employees.length > 0 &&
      departments.length > 0 &&
      directions.length > 0
    ) {
      const selectedService = services.find(
        (service) => service.serviceName === formData.attachment.service
      );
      const selectedDepartment = departments.find(
        (dept) => dept.departmentName === formData.attachment.departement
      );
      const selectedDirection = directions.find(
        (dir) => dir.directionName === formData.attachment.direction
      );

      if (selectedService && selectedDepartment && selectedDirection) {
        const filteredEmployees = employees.filter(
          (employee) =>
            employee.serviceId === selectedService.serviceId &&
            employee.departmentId === selectedDepartment.departmentId &&
            employee.directionId === selectedDirection.directionId
        );

        setSuggestions((prev) => ({
          ...prev,
          superieurHierarchique: filteredEmployees.map(
            (employee) => `${employee.lastName} ${employee.firstName}`
          ),
          fonctionSuperieur: [],
        }));
      }
    } else {
      setSuggestions((prev) => ({
        ...prev,
        superieurHierarchique: [],
        fonctionSuperieur: [],
      }));
    }

    if (formData.attachment.superieurHierarchique) {
      setFormData((prev) => ({
        ...prev,
        attachment: {
          ...prev.attachment,
          superieurHierarchique: "",
          fonctionSuperieur: "",
        },
      }));
      setErrors((prev) => ({ ...prev, superieurHierarchique: false, fonctionSuperieur: false }));
    }
  }, [formData.attachment.service, services, employees, departments, directions]);

  // Effet pour mettre à jour la fonction du supérieur
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
            fonctionSuperieur: selectedEmployee.jobTitle,
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

  // Handle file change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, selectedFiles: files }));
  };

  // Handle new suggestion
  const handleAddNewSuggestion = (field, value) => {
    setSuggestions((prev) => ({
      ...prev,
      [field]: [...new Set([...prev[field], value])],
    }));
    setAlert({ isOpen: true, type: "success", message: `"${value}" ajouté aux suggestions pour ${field}` });
  };

  // Handle navigation
  const handleNext = () => {
    if (validateFirstStep(formData, setErrors, showValidationModal)) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  // Handle adding/removing motifs
  const handleAddMotif = () => {
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
  };

  const handleRemoveMotif = (index) => {
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
  };

  const handleMotifChange = (index, field, value) => {
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
  };

  // Form validation
  const showValidationModal = (type, message) => {
    setErrorModal({ isOpen: true, type, message });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (hasClickedSubmit || isSubmitting) {
      console.warn("Submission already in progress. Ignoring additional submit.");
      return;
    }

    if (!validateSecondStep(formData, setErrors, showValidationModal)) {
      return;
    }

    setHasClickedSubmit(true);
    setIsSubmitting(true);

    try {
      const { positionInfo, contractType, attachment, workSite, recruitmentMotive, replacementDetails, description, selectedFiles } = formData;

      const filesString = selectedFiles.map((file) => file.name).join(", ");

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
        files: filesString,
        requesterId: "USR_0001",
        contractTypeId: getContractTypeId(attachment.typeContrat, contractTypes) || "",
        siteId: getSiteId(workSite.selectedSite, sites) || "",
        recruitmentReasonId: getRecruitmentReasonId(recruitmentMotive, recruitmentReasons) || "",
        recruitmentRequestDetail: {
          supervisorPosition: attachment.fonctionSuperieur || "",
          recruitmentRequestId: "",
          directionId: getDirectionId(attachment.direction, directions) || "",
          departmentId: getDepartmentId(attachment.departement, departments) || "",
          serviceId: getServiceId(attachment.service, services) || "",
          directSupervisorId: getSupervisorId(attachment.superieurHierarchique, employees) || "",
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
        handleReset(false); // Reset without showing alert
        onClose();
      } else {
        const errorData = await response.text();
        setErrorModal({ isOpen: true, type: "error", message: `Erreur lors de la soumission: ${errorData || response.statusText}` });
      }
    } catch (error) {
      setErrorModal({ isOpen: true, type: "error", message: `Erreur de connexion: ${error.message}` });
    } finally {
      setIsSubmitting(false);
      setHasClickedSubmit(false);
    }
  };

  // Reset form, with option to suppress alert
  const handleReset = (showAlert = true) => {
    setCurrentStep(1);
    setFormData({
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
      selectedFiles: [],
    });
    setErrors({
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
    });
    if (showAlert) {
      setAlert({ isOpen: true, type: "info", message: "Formulaire réinitialisé." });
    }
  };

  // Handle cancel (close popup without saving)
  const handleCancel = () => {
    handleReset(true); // Reset with alert
    onClose(); // Close the popup
  };

  if (!isOpen) return null;

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>Demande de Recrutement</PopupTitle>
          <PopupClose
            onClick={handleCancel}
            disabled={isSubmitting}
            title={isSubmitting ? "Impossible de fermer pendant la soumission" : "Fermer"}
          >
            ×
          </PopupClose>
        </PopupHeader>

        <PopupContent>
          {alert.isOpen && (
            <Alert
              type={alert.type}
              message={alert.message}
              isOpen={alert.isOpen}
              onClose={() => setAlert({ ...alert, isOpen: false })}
            />
          )}
          <Modal
            type={errorModal.type}
            message={errorModal.message}
            isOpen={errorModal.isOpen}
            onClose={() => setErrorModal({ isOpen: false, message: "" })}
            title="Erreur de validation"
          >
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <ButtonPrimary onClick={() => setErrorModal({ isOpen: false, message: "" })}>
                OK
              </ButtonPrimary>
            </div>
          </Modal>
          <FormContainer>
            <StepperWrapper>
              <StepItem active={currentStep === 1}>
                <span>1</span> Informations du Poste
              </StepItem>
              <StepItem active={currentStep === 2}>
                <span>2</span> Motif et Planification
              </StepItem>
            </StepperWrapper>

            <GenericForm id="recruitmentRequestForm" onSubmit={handleSubmit}>
              <StepContent active={currentStep === 1}>
                <FirstStepForm
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  setErrors={setErrors}
                  suggestions={suggestions}
                  isLoading={isLoading}
                  isSubmitting={isSubmitting}
                  handleFileChange={handleFileChange}
                  handleAddNewSuggestion={handleAddNewSuggestion}
                />
                <StepNavigation>
                  <NextButton
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting || Object.values(isLoading).some((loading) => loading)}
                  >
                    Suivant <FaIcons.FaArrowRight className="w-4 h-4" />
                  </NextButton>
                </StepNavigation>
              </StepContent>

              <StepContent active={currentStep === 2}>
                <SecondStepForm
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  setErrors={setErrors}
                  recruitmentReasons={recruitmentReasons}
                  suggestions={suggestions}
                  isLoading={isLoading}
                  isSubmitting={isSubmitting}
                  handleMotifChange={handleMotifChange}
                  handleAddMotif={handleAddMotif}
                  handleRemoveMotif={handleRemoveMotif}
                  handleAddNewSuggestion={handleAddNewSuggestion}
                />
                <StepNavigation>
                  <PreviousButton
                    type="button"
                    onClick={handlePrevious}
                    disabled={isSubmitting}
                  >
                    <FaIcons.FaArrowLeft className="w-4 h-4" /> Précédent
                  </PreviousButton>
                  <ButtonPrimary
                    type="submit"
                    disabled={isSubmitting || hasClickedSubmit}
                    title="Valider la demande"
                  >
                    <Save size={16} />
                    <span>{isSubmitting ? "Envoi en cours..." : "Valider"}</span>
                  </ButtonPrimary>
                </StepNavigation>
              </StepContent>
            </GenericForm>
          </FormContainer>
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
}