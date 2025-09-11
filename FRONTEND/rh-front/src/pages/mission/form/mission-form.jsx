import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  ButtonSecondary,
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
import MissionInfoStep from "./mission-info-step";
import BeneficiaryStep from "./collaborator-step";
import CompensationStep from "./compensation-step";
import { fetchAllRegions } from "services/lieu/lieu";
import { createMission } from "services/mission/mission";
import { fetchAllTransports } from "services/transport/transport";
import { fetchEmployees } from "services/employee/employee";

const MissionForm = ({ isOpen, onClose, initialStartDate, onFormSuccess }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    missionTitle: "",
    description: "",
    location: "",
    startDate: initialStartDate || null,
    endDate: null,
    beneficiary: {
      beneficiary: "",
      employeeId: "",
      matricule: "",
      function: "",
      base: "",
      direction: "",
      department: "",
      service: "",
      costCenter: "",
      transport: "",
      transportId: null,
      departureDate: "",
      departureTime: "",
      missionDuration: "",
      returnDate: "",
      returnTime: "",
    },
    lieuId: "",
    type: "Indemnité",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasClickedSubmit, setHasClickedSubmit] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const [regions, setRegions] = useState([]);
  const [regionNames, setRegionNames] = useState([]);
  const [regionDisplayNames, setRegionDisplayNames] = useState([]);
  const [suggestions, setSuggestions] = useState({
    beneficiary: [],
    transport: [],
    mission: [],
  });
  const [isLoading, setIsLoading] = useState({
    regions: false,
    employees: true,
    transports: true,
    missions: true,
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const calculateMissionDuration = useCallback((departureDate, returnDate, missionStartDate) => {
    if (!departureDate || !returnDate) {
      return { missionDuration: "", error: "La date de départ et la date de retour doivent être fournies." };
    }

    const departure = new Date(departureDate);
    const returnD = new Date(returnDate);
    const missionStart = missionStartDate ? new Date(missionStartDate) : null;

    if (isNaN(departure.getTime()) || isNaN(returnD.getTime())) {
      return { missionDuration: "", error: "Les dates de départ ou de retour sont invalides." };
    }

    if (returnD < departure) {
      return { missionDuration: "", error: "La date de retour doit être postérieure ou égale à la date de départ." };
    }

    if (missionStart && departure < missionStart) {
      return {
        missionDuration: "",
        error: "La date de départ doit être supérieure ou égale à la date de début de la mission.",
      };
    }

    const durationMs = returnD - departure;
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    if (durationDays <= 0) {
      return { missionDuration: "", error: "La durée doit être un nombre positif." };
    }

    return { missionDuration: durationDays.toString(), error: null };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    fetchAllRegions(
      (data) => {
        setRegions(data);
        setRegionNames(data.map((lieu) => lieu.nom));
        setRegionDisplayNames(data.map((lieu) => `${lieu.nom}${lieu.pays ? `/${lieu.pays}` : ""}`));
        setIsLoading((prev) => ({ ...prev, regions: false }));
      },
      setIsLoading,
      () => {}
    );

    fetchAllTransports(
      (transports) => {
        setSuggestions((prev) => ({
          ...prev,
          transport: transports.map((transport) => ({
            id: transport.transportId,
            type: transport.type,
          })),
        }));
        setIsLoading((prev) => ({ ...prev, transports: false }));
      },
      setIsLoading,
      () => {},
      (error) => console.error("Erreur lors de la récupération des transports:", error.message)
    );

    fetchEmployees(
      null,
      (employees) => {
        const employeeArray = Array.isArray(employees) ? employees : [];
        setSuggestions((prev) => ({
          ...prev,
          beneficiary: employeeArray.map((emp) => ({
            id: emp.employeeId,
            name: `${emp.lastName} ${emp.firstName}`,
            displayName: `${emp.lastName} ${emp.firstName} (${emp.direction?.acronym || "N/A"})`,
            employeeCode: emp.employeeCode,
            jobTitle: emp.jobTitle,
            site: emp.site?.siteName,
            direction: emp.direction?.directionName,
            department: emp.department?.departmentName,
            service: emp.service?.serviceName,
            costCenter: emp.costCenter,
            acronym: emp.direction?.acronym || "N/A",
          })),
        }));
        setIsLoading((prev) => ({ ...prev, employees: false }));
      },
      setIsLoading,
      setSuggestions,
      (error) => console.error("Erreur lors de la récupération des employés:", error.message)
    );
  }, [isOpen]);

  useEffect(() => {
    if (suggestions.beneficiary.length === 0 || suggestions.transport.length === 0) return;

    setFormData((prev) => {
      let updatedBeneficiary = { ...prev.beneficiary };

      if (prev.beneficiary.employeeId) {
        const selectedEmployee = suggestions.beneficiary.find(
          (emp) => emp.id === prev.beneficiary.employeeId
        );
        if (selectedEmployee) {
          updatedBeneficiary = {
            ...updatedBeneficiary,
            beneficiary: selectedEmployee.displayName,
            employeeId: selectedEmployee.id || "",
            matricule: selectedEmployee.employeeCode || "",
            function: selectedEmployee.jobTitle || "",
            base: selectedEmployee.site || "",
            direction: selectedEmployee.direction || "",
            department: selectedEmployee.department || "",
            service: selectedEmployee.service || "",
            costCenter: selectedEmployee.costCenter || "",
          };
        }
      }

      if (prev.beneficiary.transport) {
        const selectedTransport = suggestions.transport.find((t) => t.type === prev.beneficiary.transport);
        updatedBeneficiary = {
          ...updatedBeneficiary,
          transportId: selectedTransport ? selectedTransport.id : null,
        };
      }

      return prev.beneficiary !== updatedBeneficiary ? { ...prev, beneficiary: updatedBeneficiary } : prev;
    });
  }, [suggestions.beneficiary, suggestions.transport]);

  useEffect(() => {
    if (alert.isOpen) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, isOpen: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.isOpen]);

  const showAlert = (type, message) => {
    if (type === "error") {
      setErrorModal({ isOpen: true, message });
    } else {
      setAlert({ isOpen: true, type, message });
    }
  };

  const handleAddNewSuggestion = (field, value) => {
    if (field === "location") {
      const newRegion = { nom: value, lieuId: `temp-${Date.now()}`, pays: "Madagascar" };
      setRegions((prev) => [...prev, newRegion]);
      setRegionNames((prev) => [...prev, value]);
      setRegionDisplayNames((prev) => [...prev, `${value}/Madagascar`]);
      setFormData((prev) => ({ ...prev, location: `${value}/Madagascar`, lieuId: newRegion.lieuId }));
      showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
      setFieldErrors((prev) => ({ ...prev, lieuId: undefined }));
    } else if (field === "transport") {
      const newTransport = { id: `temp-${Date.now()}`, type: value };
      setSuggestions((prev) => ({
        ...prev,
        transport: [...prev.transport, newTransport],
      }));
      setFormData((prev) => ({
        ...prev,
        beneficiary: { ...prev.beneficiary, transport: value, transportId: newTransport.id },
      }));
      showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
      setFieldErrors((prev) => ({ ...prev, transportId: undefined }));
    }
  };

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;

    if (section === "beneficiary") {
      setFormData((prev) => {
        const updatedBeneficiary = { ...prev.beneficiary, [name]: value || "" };

        if (name === "beneficiary") {
          const selectedEmployee = suggestions.beneficiary.find((emp) => emp.displayName === value);
          if (selectedEmployee) {
            updatedBeneficiary.employeeId = selectedEmployee.id || "";
            updatedBeneficiary.matricule = selectedEmployee.employeeCode || "";
            updatedBeneficiary.function = selectedEmployee.jobTitle || "";
            updatedBeneficiary.base = selectedEmployee.site || "";
            updatedBeneficiary.direction = selectedEmployee.direction || "";
            updatedBeneficiary.department = selectedEmployee.department || "";
            updatedBeneficiary.service = selectedEmployee.service || "";
            updatedBeneficiary.costCenter = selectedEmployee.costCenter || "";
          }
        }

        if (name === "departureDate" || name === "returnDate") {
          const { missionDuration, error } = calculateMissionDuration(
            updatedBeneficiary.departureDate,
            updatedBeneficiary.returnDate,
            prev.startDate
          );

          setFieldErrors((prevErrors) => ({
            ...prevErrors,
            "beneficiary.departureDate": error ? [error] : undefined,
            "beneficiary.returnDate": error ? [error] : undefined,
          }));

          return { ...prev, beneficiary: { ...updatedBeneficiary, missionDuration } };
        }

        return { ...prev, beneficiary: updatedBeneficiary };
      });

      setFieldErrors((prev) => ({
        ...prev,
        [`beneficiary.${name}`]: undefined,
      }));
    } else if (section === "compensation") {
      setFormData((prev) => ({
        ...prev,
        type: value,
      }));
      setFieldErrors((prev) => ({
        ...prev,
        type: undefined,
      }));
    } else {
      setFormData((prev) => {
        const updatedFormData = {
          ...prev,
          [name]: name === "startDate" || name === "endDate" ? (value || null) : value,
        };

        if (name === "location") {
          const selectedRegion = regions.find((region) => `${region.nom}${region.pays ? `/${region.pays}` : ""}` === value);
          updatedFormData.lieuId = selectedRegion ? selectedRegion.lieuId : prev.lieuId;
        }

        if (name === "startDate") {
          const { missionDuration, error } = calculateMissionDuration(
            prev.beneficiary.departureDate,
            prev.beneficiary.returnDate,
            value
          );
          setFieldErrors((prevErrors) => ({
            ...prevErrors,
            "beneficiary.departureDate": error ? [error] : undefined,
            "beneficiary.returnDate": error ? [error] : undefined,
          }));
          return {
            ...updatedFormData,
            beneficiary: { ...prev.beneficiary, missionDuration },
          };
        }

        return updatedFormData;
      });

      setFieldErrors((prev) => ({
        ...prev,
        [name === "missionTitle" ? "name" : name === "location" ? "lieuId" : name]: undefined,
      }));
    }
  };

  const validateStep1 = () => {
    let errors = {};
    if (!formData.missionTitle) errors.name = ["Le titre de la mission est requis."];
    if (!formData.location) errors.lieuId = ["Le lieu est requis."];
    if (!formData.startDate) errors.startDate = ["La date de début est requise."];
    if (formData.endDate && formData.startDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        errors.endDate = ["La date de fin doit être postérieure ou égale à la date de début."];
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    let errors = {};
    const beneficiary = formData.beneficiary;
    if (!beneficiary.beneficiary) errors["beneficiary.employeeId"] = ["Le bénéficiaire est requis."];
    if (!beneficiary.departureDate) errors["beneficiary.departureDate"] = ["La date de départ est requise."];
    if (!beneficiary.returnDate) errors["beneficiary.returnDate"] = ["La date de retour est requise."];
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    let errors = {};
    if (!formData.type) {
      errors.type = ["Le type de compensation est requis."];
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (hasClickedSubmit || isSubmitting) {
      console.warn("Submission already in progress. Ignoring additional submit.");
      return;
    }

    if (!validateStep3()) return;

    setHasClickedSubmit(true);
    setIsSubmitting(true);
    setFieldErrors({});

    const locationName = formData.location.split("/")[0];
    const selectedRegion = regions.find((region) => region.nom === locationName);

    if (formData.location && !selectedRegion) {
      setErrorModal({ isOpen: true, message: "Veuillez sélectionner un lieu valide parmi les régions." });
      setIsSubmitting(false);
      setHasClickedSubmit(false);
      return;
    }

    const beneficiary = formData.beneficiary;
    if (!beneficiary.beneficiary) {
      setErrorModal({ isOpen: true, message: "Veuillez ajouter un bénéficiaire pour la mission." });
      setIsSubmitting(false);
      setHasClickedSubmit(false);
      return;
    }

    const selectedEmployee = suggestions.beneficiary.find((emp) => emp.id === beneficiary.employeeId);
    if (!selectedEmployee && beneficiary.employeeId) {
      setErrorModal({ isOpen: true, message: "Veuillez sélectionner un employé valide pour le bénéficiaire." });
      setIsSubmitting(false);
      setHasClickedSubmit(false);
      return;
    }

    if (beneficiary.departureDate && formData.startDate) {
      const departure = new Date(beneficiary.departureDate);
      const returnD = new Date(beneficiary.returnDate);
      const missionStartDate = new Date(formData.startDate);
      if (departure < missionStartDate) {
        setErrorModal({ isOpen: true, message: "La date de départ du bénéficiaire doit être supérieure ou égale à la date de début de la mission." });
        setIsSubmitting(false);
        setHasClickedSubmit(false);
        return;
      }
      if (returnD < departure) {
        setErrorModal({ isOpen: true, message: "La date de retour du bénéficiaire doit être postérieure ou égale à la date de départ." });
        setIsSubmitting(false);
        setHasClickedSubmit(false);
        return;
      }
    }

    try {
      const missionData = {
        name: formData.missionTitle,
        description: formData.description,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        lieuId: selectedRegion ? selectedRegion.lieuId : formData.lieuId,
        type: formData.type,
        assignations: [
          {
            employeeId: selectedEmployee?.id || "",
            transportId: beneficiary.transport
              ? suggestions.transport.find((t) => t.type === beneficiary.transport)?.id
              : null,
            departureDate: beneficiary.departureDate ? new Date(beneficiary.departureDate).toISOString() : null,
            departureTime: beneficiary.departureTime || null,
            returnDate: beneficiary.returnDate ? new Date(beneficiary.returnDate).toISOString() : null,
            returnTime: beneficiary.returnTime || null,
            duration: parseInt(beneficiary.missionDuration, 10) || null,
            type: formData.type,
          },
        ],
      };

      await createMission(
        missionData,
        (loading) => setIsSubmitting(loading.mission),
        (alert) => showAlert(alert.type, alert.message),
        (error) => {
          setErrorModal({ isOpen: true, message: error.message });
          setFieldErrors(error.fieldErrors || {});
          throw error;
        }
      );
      onFormSuccess("success", "Mission créée et assignée avec succès.");
      showAlert("success", "Mission créée et assignée avec succès.");
      onClose();
    } catch (error) {
      console.error("Erreur dans handleSubmit :", error);
    } finally {
      setIsSubmitting(false);
      setHasClickedSubmit(false);
    }
  };

  const handleReset = () => {
    setFormData({
      missionTitle: "",
      description: "",
      location: "",
      startDate: initialStartDate || null,
      endDate: null,
      beneficiary: {
        beneficiary: "",
        employeeId: "",
        matricule: "",
        function: "",
        base: "",
        direction: "",
        department: "",
        service: "",
        costCenter: "",
        transport: "",
        transportId: null,
        departureDate: "",
        departureTime: "",
        missionDuration: "",
        returnDate: "",
        returnTime: "",
      },
      lieuId: "",
      type: "Indemnité",
    });
    setFieldErrors({});
    setCurrentStep(1);
    showAlert("info", "Formulaire réinitialisé.");
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <PopupOverlay>
      <PagePopup>
        <PopupHeader>
          <PopupTitle>Création et Assignation d'une Mission</PopupTitle>
          <PopupClose
            onClick={handleCancel}
            disabled={isSubmitting || isLoading.regions || isLoading.employees || isLoading.transports}
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
            type="error"
            message={errorModal.message}
            isOpen={errorModal.isOpen}
            onClose={() => setErrorModal({ isOpen: false, message: "" })}
            title="Erreur de validation"
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <ButtonPrimary onClick={() => setErrorModal({ isOpen: false, message: "" })}>
                OK
              </ButtonPrimary>
            </div>
          </Modal>
          <FormContainer>
            <StepperWrapper>
              <StepItem active={currentStep === 1}>
                <span>1</span> Informations de la Mission
              </StepItem>
              <StepItem active={currentStep === 2}>
                <span>2</span> Détails du Collaborateur
              </StepItem>
              <StepItem active={currentStep === 3}>
                <span>3</span> Type de Compensation
              </StepItem>
            </StepperWrapper>

            <GenericForm id="combinedMissionForm" onSubmit={handleSubmit}>
              <StepContent active={currentStep === 1}>
                <MissionInfoStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  isSubmitting={isSubmitting}
                  isLoading={isLoading}
                  regionDisplayNames={regionDisplayNames}
                  handleInputChange={handleInputChange}
                  handleAddNewSuggestion={handleAddNewSuggestion}
                />
                <StepNavigation>
                  <NextButton
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting || isLoading.regions || isLoading.employees || isLoading.transports}
                  >
                    Suivant <FaIcons.FaArrowRight className="w-4 h-4" />
                  </NextButton>
                </StepNavigation>
              </StepContent>

              <StepContent active={currentStep === 2}>
                <BeneficiaryStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  isSubmitting={isSubmitting}
                  suggestions={suggestions}
                  handleInputChange={handleInputChange}
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
                  <NextButton
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting || isLoading.regions || isLoading.employees || isLoading.transports}
                  >
                    Suivant <FaIcons.FaArrowRight className="w-4 h-4" />
                  </NextButton>
                </StepNavigation>
              </StepContent>

              <StepContent active={currentStep === 3}>
                <CompensationStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  isSubmitting={isSubmitting}
                  handleInputChange={handleInputChange}
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
                    disabled={isSubmitting || hasClickedSubmit || isLoading.regions || isLoading.employees || isLoading.transports}
                    title="Créer et assigner la mission"
                  >
                    <Save size={16} />
                    <span>{isSubmitting ? "Envoi en cours..." : "Créer et Assigner"}</span>
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

export default MissionForm;