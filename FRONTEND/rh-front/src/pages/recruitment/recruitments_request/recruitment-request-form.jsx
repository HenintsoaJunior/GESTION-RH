"use client";

import { useState, useEffect } from "react";
import Alert from "components/alert";
import "styles/generic-form-styles.css";
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
import Modal from "components/modal";
import FirstStepForm from "./step/first-step-form";
import SecondStepForm from "./step/second-step-form";

export default function RecruitmentRequestForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [modal, setModal] = useState({ isOpen: false, type: "error", message: "" });
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
    fonctionSuperieur: ["Directeur", "Manager", "Chef de Service", "Superviseur", "Responsable"],
    motifRemplacement: [],
    site: [],
  });

  // Load all data on component mount
  useEffect(() => {
    fetchContractTypes(setContractTypes, setIsLoading, setSuggestions, setAlert);
    fetchDirections(setDirections, setIsLoading, setSuggestions, setAlert);
    fetchDepartments(setDepartments, setIsLoading, setSuggestions, setAlert);
    fetchEmployees(setEmployees, setIsLoading, setSuggestions, setAlert);
    fetchSites(setSites, setIsLoading, setSuggestions, setAlert);
    fetchServices(setServices, setIsLoading, setSuggestions, setAlert);
    fetchRecruitmentReasons(setRecruitmentReasons, setIsLoading, setAlert);
    fetchReplacementReasons(setReplacementReasons, setIsLoading, setSuggestions, setAlert);
  }, []);

  // Handle file change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, selectedFiles: files }));
  };

  // Handle navigation
  const handleNext = () => {
    if (currentStep === 1 && validateFirstStep(formData, setErrors, showValidationModal)) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
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

  // Handle new suggestion
  const handleAddNewSuggestion = (value, fieldType) => {
    setSuggestions((prev) => ({
      ...prev,
      [fieldType]: [...new Set([...prev[fieldType], value])],
    }));
  };

  // Form validation
  const showValidationModal = (type, message) => {
    setModal({ isOpen: true, type, message });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("handleSubmit called with formData:", formData);
    if (!validateSecondStep(formData, setErrors, showValidationModal)) {
      console.log("Validation failed, stopping submission");
      return;
    }
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
        recruitmentApproval: {
          approverId: "USR_0001",
          approvalFlowId: "AF_0005",
          status: "Pending",
          approvalOrder: 0,
          approvalDate: new Date().toISOString(),
          comment: "",
          signature: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        replacementReasons: replacementDetails.motifs
          .filter((motif) => motif.motifRemplacement && motif.detail)
          .map((motif) => ({
            recruitmentRequestId: "",
            replacementReasonId: getReplacementReasonId(motif.motifRemplacement, replacementReasons) || "",
            description: motif.detail,
          })),
        approvalFlows: [
          {
            approvalOrder: 1,
            approverRole: "Chef d'Équipe",
            approverId: "AF_0005",
          },
        ],
      };

      console.log("Sending request with data:", requestData);

      const response = await fetch(`${BASE_URL}/api/RecruitmentRequest/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Server response:", result);
        setAlert({ isOpen: true, type: "success", message: "Demande de recrutement soumise avec succès !" });
        handleReset();
      } else {
        const errorData = await response.text();
        console.error("Server error:", errorData);
        setAlert({ isOpen: true, type: "error", message: `Erreur lors de la soumission: ${errorData || response.statusText}` });
      }
    } catch (error) {
      console.error("Error:", error);
      setAlert({ isOpen: true, type: "error", message: `Erreur de connexion: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    console.log("handleReset called");
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
  };

  return (
    <div className="form-container">
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      <Modal
        type={modal.type}
        message={modal.message}
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
      <div className="table-header">
        {/* <h2 className="table-title">Demande de recrutement</h2> */}
      </div>

      {currentStep === 1 ? (
        <FirstStepForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
          suggestions={suggestions}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          handleFileChange={handleFileChange}
          handleNext={handleNext}
          handleReset={handleReset}
          handleAddNewSuggestion={(value) => handleAddNewSuggestion(value, "typeContrat")}
        />
      ) : (
        <SecondStepForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
          recruitmentReasons={recruitmentReasons}
          suggestions={suggestions}
          setSuggestions={setSuggestions}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          handleMotifChange={handleMotifChange}
          handleAddMotif={handleAddMotif}
          handleRemoveMotif={handleRemoveMotif}
          handlePrevious={handlePrevious}
          handleSubmit={handleSubmit}
          handleAddNewSuggestion={(value) => handleAddNewSuggestion(value, "motifRemplacement")}
        />
      )}
    </div>
  );
}