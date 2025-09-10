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
import { fetchAllEmployees } from "services/employee/employee";
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
  });
  const [contractTypes, setContractTypes] = useState([]);
  const [directions, setDirections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [services, setServices] = useState([]);
  const [recruitmentReasons, setRecruitmentReasons] = useState([]);
  const [replacementReasons, setReplacementReasons] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
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

  useEffect(() => {
    if (!isOpen) {
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

    fetchContractTypes(setContractTypes, setIsLoading, setSuggestions, setAlert);
    fetchDirections(setDirections, setIsLoading, setSuggestions, setAlert);
    fetchDepartments(setDepartments, setIsLoading, setSuggestions, setAlert);
    fetchAllEmployees(setEmployees, setIsLoading, setSuggestions, setAlert);
    fetchSites(setSites, setIsLoading, setSuggestions, setAlert);
    fetchServices(setServices, setIsLoading, setSuggestions, setAlert);
    fetchRecruitmentReasons(setRecruitmentReasons, setIsLoading, setAlert);
    fetchReplacementReasons(setReplacementReasons, setIsLoading, setSuggestions, setAlert);
  }, [isOpen]);

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

  useEffect(() => {
    if (employees.length > 0) {
      setSuggestions((prev) => ({
        ...prev,
        superieurHierarchique: employees.map((employee) => `${employee.lastName} ${employee.firstName}`),
      }));
    }
  }, [employees]);

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

  const handleAddNewSuggestion = (field, value) => {
    setSuggestions((prev) => ({
      ...prev,
      [field]: [...new Set([...prev[field], value])],
    }));
    setAlert({ isOpen: true, type: "success", message: `"${value}" ajouté aux suggestions pour ${field}` });
  };

  const handleNext = () => {
    if (validateFirstStep(formData, setErrors, showValidationModal)) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

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

  const showValidationModal = (type, message) => {
    setErrorModal({ isOpen: true, type, message });
  };

  const getEmployeeId = (employeeName, employeesList) => {
    const employee = employeesList.find((emp) => `${emp.lastName} ${emp.firstName}` === employeeName);
    return employee ? employee.employeeId : "";
  };

  const handleSubmit = async (event) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userId;

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
        handleReset(false);
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

  const handleCancel = () => {
    handleReset(true);
    onClose();
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
              <StepItem active={currentStep === 1 ? "true" : "false"}>
                <span>1</span> Informations du Poste
              </StepItem>
              <StepItem active={currentStep === 2 ? "true" : "false"}>
                <span>2</span> Motif et Planification
              </StepItem>
            </StepperWrapper>

            <GenericForm id="recruitmentRequestForm" onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <StepContent active="true">
                  <FirstStepForm
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    suggestions={suggestions}
                    isLoading={isLoading}
                    isSubmitting={isSubmitting}
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
              )}

              {currentStep === 2 && (
                <StepContent active="true">
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
              )}
            </GenericForm>
          </FormContainer>
        </PopupContent>
      </PagePopup>
    </PopupOverlay>
  );
}