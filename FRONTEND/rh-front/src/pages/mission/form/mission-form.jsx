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
import MissionInfoStep from "./mission-info-step";
import BeneficiaryStep from "./collaborator-step";
import { fetchAllRegions } from "services/lieu/lieu";
import { createMission, fetchMissionById, createMissionAssignation, fetchAssignMission, updateMission, updateMissionAssignation } from "services/mission/mission";
import { fetchAllTransports } from "services/transport/transport";
import { fetchEmployees } from "services/employee/employee";

const MissionForm = ({ isOpen, onClose, missionId, initialStartDate, onFormSuccess }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    missionTitle: "",
    description: "",
    location: "",
    startDate: initialStartDate || null,
    endDate: null,
    missionId: missionId || "",
    beneficiary: {
      assignationId: "",
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
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
    mission: false,
    assignMissions: false,
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

    if (missionId) {
      fetchMissionById(
        missionId,
        (mission) => {
          setFormData((prev) => ({
            ...prev,
            missionId,
            missionTitle: mission.name || "",
            description: mission.description || "",
            location: mission.lieu?.nom ? `${mission.lieu.nom}${mission.lieu.pays ? `/${mission.lieu.pays}` : ""}` : "",
            startDate: mission.startDate ? new Date(mission.startDate).toISOString().split("T")[0] : null,
            endDate: mission.endDate ? new Date(mission.endDate).toISOString().split("T")[0] : null,
            lieuId: mission.lieuId || "",
          }));
          setIsLoading((prev) => ({ ...prev, mission: false }));
        },
        setIsLoading,
        (error) => console.error("Erreur lors de la récupération de la mission:", error.message)
      );

      fetchAssignMission(
        (assignMissions) => {
          const beneficiary = assignMissions[0]
            ? {
                assignationId: assignMissions[0].assignationId || `temp-${Date.now()}`,
                beneficiary: assignMissions[0].beneficiary || `${assignMissions[0].employee?.lastName} ${assignMissions[0].employee?.firstName} (${assignMissions[0].directionAcronym || "N/A"})`,
                employeeId: assignMissions[0].employeeId || "",
                matricule: assignMissions[0].matricule || "",
                function: assignMissions[0].function || "",
                base: assignMissions[0].base || "",
                direction: assignMissions[0].directionAcronym || "",
                department: assignMissions[0].employee?.department?.departmentName || "",
                service: assignMissions[0].employee?.service?.serviceName || "",
                costCenter: assignMissions[0].employee?.costCenter || "",
                transport: assignMissions[0].transport?.type || "",
                transportId: assignMissions[0].transportId || null,
                departureDate: assignMissions[0].departureDate ? new Date(assignMissions[0].departureDate).toISOString().split("T")[0] : "",
                departureTime: assignMissions[0].departureTime || "",
                missionDuration: assignMissions[0].duration ? assignMissions[0].duration.toString() : "",
                returnDate: assignMissions[0].returnDate ? new Date(assignMissions[0].returnDate).toISOString().split("T")[0] : "",
                returnTime: assignMissions[0].returnTime || "",
              }
            : { ...formData.beneficiary };
          setFormData((prev) => ({ ...prev, beneficiary }));
          setIsLoading((prev) => ({ ...prev, assignMissions: false }));
        },
        setIsLoading,
        () => {},
        { missionId },
        1,
        100,
        (error) => console.error("Erreur lors de la récupération des assignations:", error.message)
      );
    }
  }, [missionId, isOpen]);

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
      }, 5000); // Alert auto-closes after 5 seconds
      return () => clearTimeout(timer); // Cleanup timer on unmount or alert change
    }
  }, [alert.isOpen]);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
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

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setFieldErrors({});

    const locationName = formData.location.split("/")[0];
    const selectedRegion = regions.find((region) => region.nom === locationName);

    if (formData.location && !selectedRegion) {
      showAlert("error", "Veuillez sélectionner un lieu valide parmi les régions de Madagascar.");
      setIsSubmitting(false);
      return;
    }

    const beneficiary = formData.beneficiary;
    if (!beneficiary.beneficiary) {
      showAlert("error", "Veuillez ajouter un bénéficiaire pour la mission.");
      setIsSubmitting(false);
      return;
    }

    const selectedEmployee = suggestions.beneficiary.find((emp) => emp.id === beneficiary.employeeId);
    if (!selectedEmployee && beneficiary.employeeId) {
      showAlert("error", "Veuillez sélectionner un employé valide pour le bénéficiaire.");
      setIsSubmitting(false);
      return;
    }

    if (beneficiary.departureDate && formData.startDate) {
      const departure = new Date(beneficiary.departureDate);
      const returnD = new Date(beneficiary.returnDate);
      const missionStartDate = new Date(formData.startDate);
      if (departure < missionStartDate) {
        showAlert("error", "La date de départ du bénéficiaire doit être supérieure ou égale à la date de début de la mission.");
        setIsSubmitting(false);
        return;
      }
      if (returnD < departure) {
        showAlert("error", "La date de retour du bénéficiaire doit être postérieure ou égale à la date de départ.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (missionId) {
        const missionData = {
          name: formData.missionTitle,
          description: formData.description,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          lieuId: selectedRegion ? selectedRegion.lieuId : formData.lieuId,
        };

        await updateMission(
          missionId,
          missionData,
          (loading) => setIsSubmitting(loading.mission),
          (alert) => showAlert(alert.type, alert.message),
          (error) => {
            showAlert("error", error.message);
            setFieldErrors(error.fieldErrors || {});
            throw error;
          }
        );

        const selectedTransport = beneficiary.transport
          ? suggestions.transport.find((t) => t.type === beneficiary.transport)
          : null;

        const assignationData = {
          employeeId: selectedEmployee?.id || "",
          missionId: missionId,
          transportId: selectedTransport ? selectedTransport.id : null,
          departureDate: beneficiary.departureDate ? new Date(beneficiary.departureDate).toISOString() : null,
          departureTime: beneficiary.departureTime || null,
          returnDate: beneficiary.returnDate ? new Date(beneficiary.returnDate).toISOString() : null,
          returnTime: beneficiary.returnTime || null,
          duration: parseInt(beneficiary.missionDuration, 10) || null,
        };

        if (selectedEmployee) {
          const isNewBeneficiary = !beneficiary.assignationId || beneficiary.assignationId.startsWith("temp-");

          if (!isNewBeneficiary) {
            const updatedAssignation = await updateMissionAssignation(
              beneficiary.assignationId,
              assignationData,
              (loading) => setIsSubmitting(loading.missionAssignation),
              (alert) => showAlert(alert.type, alert.message),
              (error) => {
                showAlert("error", error.message);
                setFieldErrors(error.fieldErrors || {});
                throw error;
              }
            );

            setFormData((prev) => ({
              ...prev,
              beneficiary: {
                ...prev.beneficiary,
                assignationId: updatedAssignation.assignationId,
                employeeId: updatedAssignation.employeeId || "",
                departureDate: updatedAssignation.departureDate ? new Date(updatedAssignation.departureDate).toISOString().split("T")[0] : "",
                departureTime: updatedAssignation.departureTime || "",
                returnDate: updatedAssignation.returnDate ? new Date(updatedAssignation.returnDate).toISOString().split("T")[0] : "",
                returnTime: updatedAssignation.returnTime || "",
                missionDuration: updatedAssignation.duration ? updatedAssignation.duration.toString() : "",
                transport: updatedAssignation.transport?.type || prev.beneficiary.transport,
                transportId: updatedAssignation.transportId || prev.beneficiary.transportId,
              },
            }));
          } else {
            const newAssignation = await createMissionAssignation(
              assignationData,
              (loading) => setIsSubmitting(loading.missionAssignation),
              (alert) => showAlert(alert.type, alert.message),
              (error) => {
                showAlert("error", error.message);
                setFieldErrors(error.fieldErrors || {});
                throw error;
              }
            );

            setFormData((prev) => ({
              ...prev,
              beneficiary: {
                ...prev.beneficiary,
                assignationId: newAssignation.assignationId,
                employeeId: newAssignation.employeeId || "",
                departureDate: newAssignation.departureDate ? new Date(newAssignation.departureDate).toISOString().split("T")[0] : "",
                departureTime: newAssignation.departureTime || "",
                returnDate: newAssignation.returnDate ? new Date(newAssignation.returnDate).toISOString().split("T")[0] : "",
                returnTime: newAssignation.returnTime || "",
                missionDuration: newAssignation.duration ? newAssignation.duration.toString() : "",
                transport: newAssignation.transport?.type || prev.beneficiary.transport,
                transportId: newAssignation.transportId || prev.beneficiary.transportId,
              },
            }));
          }
        }

        onFormSuccess("success", "Mission mise à jour et bénéficiaire assigné avec succès.");
        showAlert("success", "Mission mise à jour et bénéficiaire assigné avec succès.");
        onClose();

        
      } else {
        const missionData = {
          name: formData.missionTitle,
          description: formData.description,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          lieuId: selectedRegion ? selectedRegion.lieuId : formData.lieuId,
          assignations: [
            {
              employeeId: selectedEmployee?.id || "",
              missionId: formData.missionId,
              transportId: beneficiary.transport
                ? suggestions.transport.find((t) => t.type === beneficiary.transport)?.id
                : null,
              departureDate: beneficiary.departureDate ? new Date(beneficiary.departureDate).toISOString() : null,
              departureTime: beneficiary.departureTime || null,
              returnDate: beneficiary.returnDate ? new Date(beneficiary.returnDate).toISOString() : null,
              returnTime: beneficiary.returnTime || null,
              duration: parseInt(beneficiary.missionDuration, 10) || null,
            },
          ],
        };

        await createMission(
          missionData,
          (loading) => setIsSubmitting(loading.mission),
          (alert) => showAlert(alert.type, alert.message),
          (error) => {
            showAlert("error", error.message);
            setFieldErrors(error.fieldErrors || {});
            throw error;
          }
        );
        onFormSuccess("success", "Mission créée et assignée avec succès.");
        showAlert("success", "Mission créée et assignée avec succès.");
        onClose();
      }
    } catch (error) {
      console.error("Erreur dans handleSubmit :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      missionTitle: "",
      description: "",
      location: "",
      startDate: initialStartDate || null,
      endDate: null,
      missionId: missionId || "",
      beneficiary: {
        assignationId: "",
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
          <PopupTitle>{missionId ? "Modifier la Mission" : "Création et Assignation d'une Mission"}</PopupTitle>
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
          <FormContainer>
            <StepperWrapper>
              <StepItem active={currentStep === 1}>
                <span>1</span> Informations de la Mission
              </StepItem>
              <StepItem active={currentStep === 2}>
                <span>2</span> Détails du Collaborateur
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
                  <ButtonPrimary
                    type="submit"
                    disabled={isSubmitting || isLoading.regions || isLoading.employees || isLoading.transports}
                    title={missionId ? "Mettre à jour la mission" : "Créer et assigner la mission"}
                  >
                    <Save size={16} />
                    <span>{isSubmitting ? "Envoi en cours..." : missionId ? "Mettre à jour" : "Créer et Assigner"}</span>
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