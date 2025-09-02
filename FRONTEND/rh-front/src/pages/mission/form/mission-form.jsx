import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "components/alert";
import Modal from "components/modal";
import * as FaIcons from "react-icons/fa";
import NewMissionForm from "./new-mission";
import ExistingMissionForm from "./existing-mission";
import BeneficiaryPopup from "../benificiary/benificiary-mission-popup";
import { fetchAllRegions } from "services/lieu/lieu";
import { createMission, fetchAllMissions, createMissionAssignation, fetchMissionById, fetchAssignMission, updateMission, updateMissionAssignation, deleteMissionAssignation } from "services/mission/mission";
import { fetchAllTransports } from "services/transport/transport";
import { fetchEmployees } from "services/employee/employee";
import {
  FormContainer,
  FormTable,
  FormRow,
  FormFieldCell,
  FormLabelRequired,
  FormSelect,
  TableHeader,
  TableTitle,
  GenericForm,
  FormSectionTitle,
  BeneficiariesTableContainer,
  BeneficiariesTable,
  TableActionButton,
  NoBeneficiaries,
  FormActions,
  SubmitButton,
  ResetButton,
  AddButton,
  DateInfo,
  DurationBadge,
} from "styles/generaliser/form-container";

const MissionForm = () => {
  const { missionId } = useParams();
  const [formData, setFormData] = useState({
    missionTitle: "",
    description: "",
    location: "",
    startDate: null,
    endDate: null,
    missionId: missionId || "",
    beneficiaries: [],
    lieuId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [modal, setModal] = useState({ isOpen: false, type: "info", message: "" });
  const [regions, setRegions] = useState([]);
  const [regionNames, setRegionNames] = useState([]);
  const [regionDisplayNames, setRegionDisplayNames] = useState([]);
  const [missions, setMissions] = useState([]);
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
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [missionMode, setMissionMode] = useState(missionId ? "existing" : "new");
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newBeneficiary, setNewBeneficiary] = useState({
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
  });
  const navigate = useNavigate();

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
    if (missionId) {
      fetchMissionById(
        missionId,
        (mission) => {
          setFormData((prev) => ({
            ...prev,
            missionId,
            missionTitle: mission.name || "",
            description: mission.description || "",
            location: mission.lieu?.nom || "",
            startDate: mission.startDate ? new Date(mission.startDate).toISOString().split('T')[0] : null,
            endDate: mission.endDate ? new Date(mission.endDate).toISOString().split('T')[0] : null,
            lieuId: mission.lieuId || "",
          }));
          setSuggestions((prev) => {
            const missionExists = prev.mission.some((m) => m.id === missionId);
            if (!missionExists) {
              return {
                ...prev,
                mission: [
                  ...prev.mission,
                  {
                    id: mission.missionId,
                    name: mission.name,
                    displayName: `${mission.name} (${mission.lieu.nom}, ${new Date(mission.startDate).toLocaleDateString('fr-FR')} - ${mission.endDate ? new Date(mission.endDate).toLocaleDateString('fr-FR') : 'N/A'})`,
                    startDate: mission.startDate,
                    endDate: mission.endDate,
                    lieuId: mission.lieuId,
                    location: mission.lieu.nom,
                    description: mission.description,
                  },
                ],
              };
            }
            return prev;
          });
          setIsLoading((prev) => ({ ...prev, mission: false }));
        },
        setIsLoading,
        (error) => setModal(error)
      );

      fetchAssignMission(
        (assignMissions) => {
          const beneficiaries = assignMissions.map((assign) => ({
            assignationId: assign.assignationId || `temp-${Date.now()}`,
            beneficiary: assign.beneficiary || `${assign.employee?.lastName} ${assign.employee?.firstName} (${assign.directionAcronym || "N/A"})`,
            employeeId: assign.employeeId || "",
            matricule: assign.matricule || "",
            function: assign.function || "",
            base: assign.base || "",
            direction: assign.directionAcronym || "",
            department: assign.employee?.department?.departmentName || "",
            service: assign.employee?.service?.serviceName || "",
            costCenter: assign.employee?.costCenter || "",
            transport: assign.transport?.type || "",
            transportId: assign.transportId || null,
            departureDate: assign.departureDate ? new Date(assign.departureDate).toISOString().split('T')[0] : "",
            departureTime: assign.departureTime || "",
            missionDuration: assign.duration ? assign.duration.toString() : "",
            returnDate: assign.returnDate ? new Date(assign.returnDate).toISOString().split('T')[0] : "",
            returnTime: assign.returnTime || "",
          }));
          setFormData((prev) => ({ ...prev, beneficiaries }));
          setIsLoading((prev) => ({ ...prev, assignMissions: false }));
        },
        setIsLoading,
        () => {},
        { missionId },
        1,
        100,
        (error) => setModal(error)
      );
    }
  }, [missionId]);

  useEffect(() => {
    fetchAllRegions(
      (data) => {
        setRegions(data);
        setRegionNames(data.map((lieu) => lieu.nom));
        setRegionDisplayNames(data.map((lieu) => `${lieu.nom}${lieu.pays ? `/${lieu.pays}` : ''}`));
        setIsLoading((prev) => ({ ...prev, regions: false }));
      },
      setIsLoading,
      (alert) => setAlert(alert)
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
      (error) => setModal({ isOpen: true, type: "error", message: error.message })
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
      (error) => setModal({ isOpen: true, type: "error", message: error.message })
    );

    fetchAllMissions(
      (missions) => {
        setMissions(missions);
        setSuggestions((prev) => {
          const missionSuggestions = missions.map((mission) => ({
            id: mission.missionId,
            name: mission.name,
            displayName: `${mission.name} (${mission.lieu.nom}, ${new Date(mission.startDate).toLocaleDateString('fr-FR')} - ${mission.endDate ? new Date(mission.endDate).toLocaleDateString('fr-FR') : 'N/A'})`,
            startDate: mission.startDate,
            endDate: mission.endDate,
            lieuId: mission.lieuId,
            location: mission.lieu.nom,
            description: mission.description,
          }));
          if (missionId) {
            const currentMission = prev.mission.find((m) => m.id === missionId);
            if (currentMission && !missionSuggestions.some((m) => m.id === missionId)) {
              missionSuggestions.push(currentMission);
            }
          }
          return { ...prev, mission: missionSuggestions };
        });
        setIsLoading((prev) => ({ ...prev, missions: false }));
      },
      setIsLoading,
      () => {},
      (error) => setModal({ isOpen: true, type: "error", message: error.message })
    );
  }, [missionId]);

  useEffect(() => {
    if (suggestions.beneficiary.length === 0 || suggestions.transport.length === 0) return;

    setFormData((prev) => {
      const newBeneficiaries = prev.beneficiaries.map((beneficiary) => {
        let updatedBeneficiary = { ...beneficiary };

        if (beneficiary.employeeId) {
          const selectedEmployee = suggestions.beneficiary.find(
            (emp) => emp.id === beneficiary.employeeId
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

        if (beneficiary.transport) {
          const selectedTransport = suggestions.transport.find((t) => t.type === beneficiary.transport);
          updatedBeneficiary = {
            ...updatedBeneficiary,
            transportId: selectedTransport ? selectedTransport.id : null,
          };
        }

        return updatedBeneficiary;
      });

      return prev.beneficiaries !== newBeneficiaries ? { ...prev, beneficiaries: newBeneficiaries } : prev;
    });

  }, [suggestions.beneficiary, suggestions.transport, formData.beneficiaries.length]);

  useEffect(() => {
    if (!missionId && missionMode === "existing" && formData.missionId) {
      const selectedMission = suggestions.mission.find((m) => m.id === formData.missionId);
      if (selectedMission) {
        setFormData((prev) => ({
          ...prev,
          missionTitle: selectedMission.name || "",
          description: selectedMission.description || "",
          location: selectedMission.location || "",
          startDate: selectedMission.startDate ? new Date(selectedMission.startDate).toISOString().split('T')[0] : null,
          endDate: selectedMission.endDate ? new Date(selectedMission.endDate).toISOString().split('T')[0] : null,
          lieuId: selectedMission.lieuId || "",
        }));
      }
    } else if (!missionId && missionMode === "new") {
      setFormData((prev) => ({
        ...prev,
        missionTitle: "",
        description: "",
        location: "",
        startDate: null,
        endDate: null,
        missionId: "",
        lieuId: "",
      }));
    }
  }, [formData.missionId, missionMode, suggestions.mission, missionId]);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const showModal = (type, message) => {
    setModal({ isOpen: true, type, message });
  };

  const handleAddNewSuggestion = (field, value) => {
    if (field === "location") {
      const newRegion = { nom: value, lieuId: `temp-${Date.now()}` };
      setRegions((prev) => [...prev, newRegion]);
      setRegionNames((prev) => [...prev, value]);
      setRegionDisplayNames((prev) => [...prev, value]);
      setFormData((prev) => ({ ...prev, location: value, lieuId: newRegion.lieuId }));
      showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
      setFieldErrors((prev) => ({ ...prev, lieuId: undefined }));
    } else if (field === "transport") {
      setSuggestions((prev) => ({
        ...prev,
        transport: [...prev.transport, { id: `temp-${Date.now()}`, type: value }],
      }));
      setNewBeneficiary((prev) => ({ ...prev, transport: value }));
      showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
      setFieldErrors((prev) => ({ ...prev, transportId: undefined }));
    }
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    if (index !== undefined) {
      setNewBeneficiary((prev) => {
        const updatedBeneficiary = { ...prev, [name]: value || "" };

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
          const missionStart =
            missionMode === "existing" && formData.missionId && !missionId
              ? suggestions.mission.find((m) => m.id === formData.missionId)?.startDate
              : formData.startDate;
          const { missionDuration, error } = calculateMissionDuration(
            updatedBeneficiary.departureDate,
            updatedBeneficiary.returnDate,
            missionStart
          );

          setFieldErrors((prevErrors) => ({
            ...prevErrors,
            [`beneficiaries[${formData.beneficiaries.length}].departureDate`]: error ? [error] : undefined,
            [`beneficiaries[${formData.beneficiaries.length}].returnDate`]: error ? [error] : undefined,
          }));

          return { ...updatedBeneficiary, missionDuration };
        }

        return updatedBeneficiary;
      });

      setFieldErrors((prev) => ({
        ...prev,
        [`beneficiaries[${index}].${name}`]: undefined,
      }));
    } else {
      setFormData((prev) => {
        const updatedFormData = {
          ...prev,
          [name]: name === "startDate" || name === "endDate" || name === "missionId" ? (value || null) : value,
        };

        if (name === "startDate") {
          const newBeneficiaries = prev.beneficiaries.map((beneficiary, idx) => {
            const { missionDuration, error } = calculateMissionDuration(
              beneficiary.departureDate,
              beneficiary.returnDate,
              value
            );
            setFieldErrors((prevErrors) => ({
              ...prevErrors,
              [`beneficiaries[${idx}].departureDate`]: error ? [error] : undefined,
              [`beneficiaries[${idx}].returnDate`]: error ? [error] : undefined,
            }));
            return { ...beneficiary, missionDuration };
          });
          return { ...updatedFormData, beneficiaries: newBeneficiaries };
        }

        return updatedFormData;
      });

      setFieldErrors((prev) => ({
        ...prev,
        [name === "missionTitle" ? "name" : name === "location" ? "lieuId" : name]: undefined,
      }));
    }
  };

  const addBeneficiary = () => {
    setEditingBeneficiary(null);
    setEditingIndex(null);
    setNewBeneficiary({
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
    });
    setIsPopupOpen(true);
  };

  const editBeneficiary = (index) => {
    const beneficiary = formData.beneficiaries[index];
    setEditingBeneficiary(beneficiary);
    setEditingIndex(index);
    setNewBeneficiary(beneficiary);
    setIsPopupOpen(true);
  };

  const handlePopupSubmit = (beneficiary) => {
    if (editingIndex !== null) {
      setFormData((prev) => ({
        ...prev,
        beneficiaries: prev.beneficiaries.map((item, index) =>
          index === editingIndex ? beneficiary : item
        ),
      }));
      showAlert("success", "Bénéficiaire modifié avec succès.");
    } else {
      setFormData((prev) => ({
        ...prev,
        beneficiaries: [
          ...prev.beneficiaries,
          {
            ...beneficiary,
            assignationId: beneficiary.assignationId || `temp-${Date.now()}`,
          },
        ],
      }));
      showAlert("success", "Bénéficiaire ajouté avec succès.");
    }

    setNewBeneficiary({
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
    });
    setEditingBeneficiary(null);
    setEditingIndex(null);
    setIsPopupOpen(false);
  };

  const removeBeneficiary = async (index) => {
    const beneficiary = formData.beneficiaries[index];
    if (beneficiary.assignationId && !beneficiary.assignationId.startsWith("temp-") && missionId) {
      try {
        await deleteMissionAssignation(
          beneficiary.assignationId,
          setIsLoading,
          (alert) => setAlert(alert),
          (error) => {
            setModal(error);
            setFieldErrors(error.fieldErrors || {});
            throw error;
          }
        );
      } catch (error) {
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter((_, i) => i !== index),
    }));
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(prev).forEach((key) => {
        if (key.startsWith(`beneficiaries[${index}]`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
    showAlert("success", "Bénéficiaire supprimé avec succès.");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    return timeStr;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    const selectedRegion = regions.find((region) => region.nom === formData.location);
    const selectedMission = missionMode === "existing" && !missionId ? suggestions.mission.find((m) => m.id === formData.missionId) : null;

    if (!missionId && missionMode === "new") {
      if (formData.location && !selectedRegion) {
        showModal("error", "Veuillez sélectionner un lieu valide parmi les régions de Madagascar.");
        setIsSubmitting(false);
        return;
      }
    }

    const selectedEmployeeIds = new Set();
    for (let i = 0; i < formData.beneficiaries.length; i++) {
      const beneficiary = formData.beneficiaries[i];
      const selectedEmployee = suggestions.beneficiary.find((emp) => emp.id === beneficiary.employeeId);

      if (!selectedEmployee && beneficiary.employeeId) {
        showModal("error", `Veuillez sélectionner un employé valide pour le bénéficiaire ${i + 1}.`);
        setIsSubmitting(false);
        return;
      }
      if (selectedEmployee) {
        if (selectedEmployeeIds.has(selectedEmployee.id)) {
          showModal("error", `L'employé ${selectedEmployee.displayName} est sélectionné plusieurs fois.`);
          setIsSubmitting(false);
          return;
        }
        selectedEmployeeIds.add(selectedEmployee.id);
      }

      if (!beneficiary.departureDate) {
        setFieldErrors((prev) => ({
          ...prev,
          [`beneficiaries[${i}].departureDate`]: ["La date de départ est requise."],
        }));
        setIsSubmitting(false);
        return;
      }
      if (!beneficiary.returnDate) {
        setFieldErrors((prev) => ({
          ...prev,
          [`beneficiaries[${i}].returnDate`]: ["La date de retour est requise."],
        }));
        setIsSubmitting(false);
        return;
      }

      const missionStart = missionMode === "existing" && !missionId && selectedMission ? selectedMission.startDate : formData.startDate;
      if (beneficiary.departureDate && missionStart) {
        const departure = new Date(beneficiary.departureDate);
        const returnD = new Date(beneficiary.returnDate);
        const missionStartDate = new Date(missionStart);
        if (departure < missionStartDate) {
          showModal("error", `La date de départ du bénéficiaire ${i + 1} doit être supérieure ou égale à la date de début de la mission.`);
          setIsSubmitting(false);
          return;
        }
        if (returnD < departure) {
          showModal("error", `La date de retour du bénéficiaire ${i + 1} doit être postérieure ou égale à la date de départ.`);
          setIsSubmitting(false);
          return;
        }
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
          (alert) => setAlert(alert),
          (error) => {
            setModal(error);
            setFieldErrors(error.fieldErrors || {});
            throw error;
          }
        );

        for (const beneficiary of formData.beneficiaries) {
          const selectedEmployee = suggestions.beneficiary.find((emp) => emp.id === beneficiary.employeeId);
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
                (alert) => setAlert(alert),
                (error) => {
                  setModal({ ...error, details: { assignationId: beneficiary.assignationId, missionId } });
                  setFieldErrors(error.fieldErrors || {});
                  throw error;
                }
              );

              setFormData((prev) => ({
                ...prev,
                beneficiaries: prev.beneficiaries.map((b) =>
                  b.assignationId === updatedAssignation.assignationId
                    ? {
                        ...b,
                        assignationId: updatedAssignation.assignationId,
                        beneficiary: selectedEmployee.displayName,
                        employeeId: updatedAssignation.employeeId || "",
                        departureDate: updatedAssignation.departureDate ? new Date(updatedAssignation.departureDate).toISOString().split('T')[0] : "",
                        departureTime: updatedAssignation.departureTime || "",
                        returnDate: updatedAssignation.returnDate ? new Date(updatedAssignation.returnDate).toISOString().split('T')[0] : "",
                        returnTime: updatedAssignation.returnTime || "",
                        missionDuration: updatedAssignation.duration ? updatedAssignation.duration.toString() : "",
                        transport: updatedAssignation.transport?.type || b.transport,
                        transportId: updatedAssignation.transportId || b.transportId,
                      }
                    : b
                ),
              }));
            } else {
              const newAssignation = await createMissionAssignation(
                assignationData,
                (loading) => setIsSubmitting(loading.missionAssignation),
                (alert) => setAlert(alert),
                (error) => {
                  setModal({ ...error, details: { assignationId: beneficiary.assignationId, missionId } });
                  setFieldErrors(error.fieldErrors || {});
                  throw error;
                }
              );

              setFormData((prev) => ({
                ...prev,
                beneficiaries: prev.beneficiaries.map((b) =>
                  b.assignationId === beneficiary.assignationId
                    ? {
                        ...b,
                        assignationId: newAssignation.assignationId,
                        beneficiary: selectedEmployee.displayName,
                        employeeId: newAssignation.employeeId || "",
                        departureDate: newAssignation.departureDate ? new Date(newAssignation.departureDate).toISOString().split('T')[0] : "",
                        departureTime: newAssignation.departureTime || "",
                        returnDate: newAssignation.returnDate ? new Date(newAssignation.returnDate).toISOString().split('T')[0] : "",
                        returnTime: newAssignation.returnTime || "",
                        missionDuration: newAssignation.duration ? newAssignation.duration.toString() : "",
                        transport: newAssignation.transport?.type || b.transport,
                        transportId: newAssignation.transportId || b.transportId,
                      }
                    : b
                ),
              }));
            }
          }
        }

        showAlert("success", "Mission mise à jour et bénéficiaires assignés avec succès.");
        navigate("/mission/list");
      } else if (missionMode === "existing") {
        for (const beneficiary of formData.beneficiaries) {
          const selectedEmployee = suggestions.beneficiary.find((emp) => emp.id === beneficiary.employeeId);
          const selectedTransport = beneficiary.transport
            ? suggestions.transport.find((t) => t.type === beneficiary.transport)
            : null;

          const assignationData = {
            employeeId: selectedEmployee?.id || "",
            missionId: formData.missionId,
            transportId: selectedTransport ? selectedTransport.id : null,
            departureDate: beneficiary.departureDate ? new Date(beneficiary.departureDate).toISOString() : null,
            departureTime: beneficiary.departureTime || null,
            returnDate: beneficiary.returnDate ? new Date(beneficiary.returnDate).toISOString() : null,
            returnTime: beneficiary.returnTime || null,
            duration: parseInt(beneficiary.missionDuration, 10) || null,
          };

          await createMissionAssignation(
            assignationData,
            (loading) => setIsSubmitting(loading.missionAssignation),
            (alert) => setAlert(alert),
            (error) => {
              setModal({ ...error, details: { missionId: formData.missionId } });
              setFieldErrors(error.fieldErrors || {});
              throw error;
            }
          );
        }
        showAlert("success", "Bénéficiaires assignés à la mission avec succès.");
        navigate("/mission/list");
      } else {
        const missionData = {
          name: formData.missionTitle,
          description: formData.description,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          lieuId: selectedRegion ? selectedRegion.lieuId : formData.lieuId,
          assignations: formData.beneficiaries.map((beneficiary) => {
            const selectedEmployee = suggestions.beneficiary.find((emp) => emp.id === beneficiary.employeeId);
            const selectedTransport = beneficiary.transport
              ? suggestions.transport.find((t) => t.type === beneficiary.transport)
              : null;
            return {
              employeeId: selectedEmployee?.id || "",
              missionId: formData.missionId,
              transportId: selectedTransport ? selectedTransport.id : null,
              departureDate: beneficiary.departureDate ? new Date(beneficiary.departureDate).toISOString() : null,
              departureTime: beneficiary.departureTime || null,
              returnDate: beneficiary.returnDate ? new Date(beneficiary.returnDate).toISOString() : null,
              returnTime: beneficiary.returnTime || null,
              duration: parseInt(beneficiary.missionDuration, 10) || null,
            };
          }),
        };

        await createMission(
          missionData,
          (loading) => setIsSubmitting(loading.mission),
          (alert) => setAlert(alert),
          (error) => {
            setModal(error);
            setFieldErrors(error.fieldErrors || {});
            throw error;
          }
        );
        showAlert("success", "Mission créée et assignée avec succès.");
        navigate("/mission/list");
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
      startDate: null,
      endDate: null,
      missionId: "",
      beneficiaries: [],
      lieuId: "",
    });
    setMissionMode("new");
    setFieldErrors({});
    showAlert("info", "Formulaire réinitialisé.");
  };

  return (
    <FormContainer>
      <Modal
        type={modal.type}
        message={modal.message}
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      <BeneficiaryPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setEditingBeneficiary(null);
          setEditingIndex(null);
          setNewBeneficiary({
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
          });
        }}
        onSubmit={handlePopupSubmit}
        beneficiary={newBeneficiary}
        suggestions={suggestions}
        isSubmitting={isSubmitting}
        fieldErrors={fieldErrors}
        handleInputChange={handleInputChange}
        handleAddNewSuggestion={handleAddNewSuggestion}
        index={editingIndex !== null ? editingIndex : formData.beneficiaries.length}
        isEditing={editingIndex !== null}
      />
      <TableHeader>
        <TableTitle>{missionId ? "Modifier la Mission" : "Création et Assignation d'une Mission"}</TableTitle>
      </TableHeader>

      <GenericForm id="combinedMissionForm" onSubmit={handleSubmit}>
        {!missionId && (
          <div>
            <FormSectionTitle>Type de Mission</FormSectionTitle>
            <FormTable>
              <tbody>
                <FormRow>
                  <FormFieldCell>
                    <FormLabelRequired>Mode</FormLabelRequired>
                  </FormFieldCell>
                  <FormFieldCell>
                    <FormSelect
                      name="missionMode"
                      value={missionMode}
                      onChange={(e) => setMissionMode(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="new">Nouvelle Mission</option>
                      <option value="existing">Mission Existante</option>
                    </FormSelect>
                  </FormFieldCell>
                </FormRow>
              </tbody>
            </FormTable>
          </div>
        )}

        {missionId ? (
          <NewMissionForm
            formData={formData}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
            regionDisplayNames={regionDisplayNames}
            handleInputChange={handleInputChange}
            handleAddNewSuggestion={handleAddNewSuggestion}
          />
        ) : missionMode === "existing" ? (
          <ExistingMissionForm
            formData={formData}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
            suggestions={suggestions}
            handleInputChange={handleInputChange}
          />
        ) : (
          <NewMissionForm
            formData={formData}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
            regionDisplayNames={regionDisplayNames}
            handleInputChange={handleInputChange}
            handleAddNewSuggestion={handleAddNewSuggestion}
          />
        )}

        <div>
          <FormSectionTitle>Détails des Assignations</FormSectionTitle>

          {formData.beneficiaries.length > 0 ? (
            <BeneficiariesTableContainer>
              <BeneficiariesTable>
                <thead>
                  <tr>
                    <th className="col-id">ID</th>
                    <th className="col-beneficiary">Bénéficiaire</th>
                    <th className="col-matricule">Matricule</th>
                    <th className="col-fonction">Fonction</th>
                    <th className="col-direction">Direction</th>
                    <th className="col-transport">Transport</th>
                    <th className="col-dates">Départ</th>
                    <th className="col-dates">Retour</th>
                    <th className="col-duree">Durée</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.beneficiaries.map((beneficiary, index) => (
                    <tr key={index}>
                      <td className="col-id">{index + 1}</td>
                      <td className="col-beneficiary" title={beneficiary.beneficiary}>
                        {beneficiary.beneficiary}
                      </td>
                      <td className="col-matricule" title={beneficiary.matricule}>
                        {beneficiary.matricule || "-"}
                      </td>
                      <td className="col-fonction" title={beneficiary.function}>
                        {beneficiary.function || "-"}
                      </td>
                      <td className="col-direction" title={beneficiary.direction}>
                        {beneficiary.direction || "-"}
                      </td>
                      <td className="col-transport" title={beneficiary.transport}>
                        {beneficiary.transport || "-"}
                      </td>
                      <td className="col-dates">
                        <DateInfo>{formatDate(beneficiary.departureDate)}</DateInfo>
                        <DateInfo>{formatTime(beneficiary.departureTime)}</DateInfo>
                      </td>
                      <td className="col-dates">
                        <DateInfo>{formatDate(beneficiary.returnDate)}</DateInfo>
                        <DateInfo>{formatTime(beneficiary.returnTime)}</DateInfo>
                      </td>
                      <td className="col-duree">
                        {beneficiary.missionDuration ? (
                          <DurationBadge>{beneficiary.missionDuration}j</DurationBadge>
                        ) : "-"}
                      </td>
                      <td className="col-actions">
                        <TableActionButton
                          type="button"
                          className="edit-btn"
                          onClick={() => editBeneficiary(index)}
                          disabled={isSubmitting}
                          title="Modifier ce bénéficiaire"
                        >
                          <FaIcons.FaEdit />
                        </TableActionButton>
                        <TableActionButton
                          type="button"
                          className="delete-btn"
                          onClick={() => removeBeneficiary(index)}
                          disabled={isSubmitting}
                          title="Supprimer ce bénéficiaire"
                        >
                          <FaIcons.FaTrash />
                        </TableActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </BeneficiariesTable>
            </BeneficiariesTableContainer>
          ) : (
            <NoBeneficiaries>
              <p>Aucun bénéficiaire ajouté. Cliquez sur "Ajouter un Bénéficiaire" pour commencer.</p>
            </NoBeneficiaries>
          )}

          {!missionId && (
            <AddButton
              type="button"
              onClick={addBeneficiary}
              disabled={isSubmitting}
              title="Ajouter un nouveau bénéficiaire"
            >
              <FaIcons.FaPlus className="w-4 h-4" />
              <span>Ajouter un Bénéficiaire</span>
            </AddButton>
          )}

        </div>

        <FormActions>
          <SubmitButton
            type="submit"
            disabled={isSubmitting || isLoading.regions || isLoading.employees || isLoading.transports}
            title={missionId ? "Mettre à jour la mission" : missionMode === "existing" ? "Assigner à la mission" : "Créer et assigner la mission"}
          >
            <span>{isSubmitting ? "Envoi en cours..." : missionId ? "Mettre à jour" : missionMode === "existing" ? "Assigner" : "Créer et Assigner"}</span>
            <FaIcons.FaArrowRight className="w-4 h-4" />
          </SubmitButton>
          <ResetButton
            type="button"
            onClick={handleReset}
            disabled={isSubmitting || isLoading.regions || isLoading.employees || isLoading.transports}
            title="Réinitialiser le formulaire"
          >
            <FaIcons.FaTrash className="w-4 h-4" />
            <span>Réinitialiser</span>
          </ResetButton>
        </FormActions>
      </GenericForm>
    </FormContainer>
  );
};

export default MissionForm;