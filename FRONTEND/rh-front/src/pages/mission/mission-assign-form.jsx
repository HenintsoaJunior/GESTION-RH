"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "components/modal";
import Alert from "components/alert";
import AutoCompleteInput from "components/auto-complete-input";
import * as FaIcons from "react-icons/fa";
import { fetchNotAssignedEmployees, fetchAllMissions, createMissionAssignation } from "services/mission/mission";
import { fetchAllTransports } from "services/transport/transport";

export default function AssignMissionForm({ missionId, onSuccess }) {
  const [formData, setFormData] = useState({
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
    transportId: "",
    departureDate: "",
    departureTime: "",
    missionDuration: "",
    returnDate: "",
    returnTime: "",
    mission: "",
    missionId: missionId || "",
    missionStartDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "info", message: "" });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [returnUrl, setReturnUrl] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [suggestions, setSuggestions] = useState({
    beneficiary: [],
    mission: [],
    transport: [],
  });
  const [isLoading, setIsLoading] = useState({
    employees: true,
    missions: true,
    transports: true,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Load suggestions and initialize URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialValue = searchParams.get("initialValue") || "";
    const url = searchParams.get("returnUrl") || "";
    const type = searchParams.get("fieldType") || "";
    const missionIdFromUrl = searchParams.get("missionId") || missionId;

    setFormData((prev) => ({ ...prev, beneficiary: initialValue, missionId: missionIdFromUrl }));
    setReturnUrl(url);
    setFieldType(type);

    // Fetch non-assigned employees for the specific mission
    if (missionIdFromUrl) {
      fetchNotAssignedEmployees(
        missionIdFromUrl,
        (employees) => {
          setSuggestions((prev) => ({
            ...prev,
            beneficiary: employees.map((emp) => ({
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
          if (initialValue) {
            const selectedEmployee = employees.find(
              (emp) => `${emp.lastName} ${emp.firstName} (${emp.direction?.acronym || "N/A"})` === initialValue
            );
            if (selectedEmployee) {
              setFormData((prev) => ({
                ...prev,
                beneficiary: `${selectedEmployee.lastName} ${selectedEmployee.firstName} (${selectedEmployee.direction?.acronym || "N/A"})`,
                employeeId: selectedEmployee.employeeId || "",
                matricule: selectedEmployee.employeeCode || "",
                function: selectedEmployee.jobTitle || "",
                base: selectedEmployee.site?.siteName || "",
                direction: selectedEmployee.direction?.directionName || "",
                department: selectedEmployee.department?.departmentName || "",
                service: selectedEmployee.service?.serviceName || "",
                costCenter: selectedEmployee.costCenter || "",
              }));
            }
          }
        },
        setIsLoading,
        setSuggestions,
        (error) => setModal({ isOpen: true, type: "error", message: error.message })
      );
    } else {
      setIsLoading((prev) => ({ ...prev, employees: false }));
      setSuggestions((prev) => ({ ...prev, beneficiary: [] }));
    }

    // Fetch missions
    fetchAllMissions(
      (missions) => {
        setSuggestions((prev) => ({
          ...prev,
          mission: missions.map((mission) => ({
            id: mission.missionId,
            name: mission.name,
            startDate: mission.startDate,
          })),
        }));
        setIsLoading((prev) => ({ ...prev, missions: false }));
        if (missionIdFromUrl) {
          const selectedMission = missions.find((m) => m.missionId === missionIdFromUrl);
          if (selectedMission) {
            setFormData((prev) => ({
              ...prev,
              mission: selectedMission.name,
              missionId: selectedMission.missionId,
              missionStartDate: selectedMission.startDate.split("T")[0],
            }));
          } else {
            setModal({ isOpen: true, type: "error", message: `Mission avec l'ID ${missionIdFromUrl} non trouvée.` });
          }
        }
      },
      setIsLoading,
      () => {},
      (error) => setModal({ isOpen: true, type: "error", message: error.message })
    );

    // Fetch transports
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
  }, [location.search, missionId]);

  // Update fields related to beneficiary
  useEffect(() => {
    if (formData.beneficiary) {
      const selectedEmployee = suggestions.beneficiary.find(
        (emp) => emp.displayName === formData.beneficiary
      );
      if (selectedEmployee) {
        setFormData((prev) => ({
          ...prev,
          employeeId: selectedEmployee.id || "",
          matricule: selectedEmployee.employeeCode || "",
          function: selectedEmployee.jobTitle || "",
          base: selectedEmployee.site || "",
          direction: selectedEmployee.direction || "",
          department: selectedEmployee.department || "",
          service: selectedEmployee.service || "",
          costCenter: selectedEmployee.costCenter || "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          employeeId: "",
          matricule: "",
          function: "",
          base: "",
          direction: "",
          department: "",
          service: "",
          costCenter: "",
        }));
      }
    }
  }, [formData.beneficiary, suggestions.beneficiary]);

  // Update missionId and missionStartDate
  useEffect(() => {
    if (formData.mission) {
      const selectedMission = suggestions.mission.find((m) => m.name === formData.mission);
      if (selectedMission) {
        setFormData((prev) => ({
          ...prev,
          missionId: selectedMission.id || "",
          missionStartDate: selectedMission.startDate.split("T")[0] || "",
        }));
        setFieldErrors((prev) => ({ ...prev, MissionId: undefined }));
      } else {
        setFormData((prev) => ({ ...prev, missionId: "", missionStartDate: "" }));
      }
    }
  }, [formData.mission, suggestions.mission]);

  // Update transportId
  useEffect(() => {
    if (formData.transport) {
      const selectedTransport = suggestions.transport.find((t) => t.type === formData.transport);
      if (selectedTransport) {
        setFormData((prev) => ({
          ...prev,
          transportId: selectedTransport.id || "",
        }));
        setFieldErrors((prev) => ({ ...prev, TransportId: undefined }));
      } else {
        setFormData((prev) => ({ ...prev, transportId: "" }));
      }
    }
  }, [formData.transport, suggestions.transport]);

  // Calculate return date and validate departure date
  useEffect(() => {
    if (formData.departureDate && formData.missionDuration) {
      const departure = new Date(formData.departureDate);
      const duration = parseInt(formData.missionDuration, 10);
      const missionStart = formData.missionStartDate ? new Date(formData.missionStartDate) : null;

      // Validate departure date against mission start date
      if (missionStart && departure < missionStart) {
        setFieldErrors((prev) => ({
          ...prev,
          departureDate: ["La date de départ doit être supérieure ou égale à la date de début de la mission"],
        }));
        setFormData((prev) => ({ ...prev, returnDate: "" }));
        return;
      } else {
        setFieldErrors((prev) => ({ ...prev, departureDate: undefined }));
      }

      if (!isNaN(departure.getTime()) && duration > 0) {
        const returnDate = new Date(departure);
        returnDate.setDate(departure.getDate() + duration);
        const formattedReturnDate = returnDate.toISOString().split("T")[0];
        setFormData((prev) => ({
          ...prev,
          returnDate: formattedReturnDate,
        }));
      } else {
        setFormData((prev) => ({ ...prev, returnDate: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, returnDate: "" }));
    }
  }, [formData.departureDate, formData.missionDuration, formData.missionStartDate]);

  const showModal = (type, message) => {
    setModal({ isOpen: true, type, message });
  };

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleAddNewSuggestion = (field, value) => {
    setSuggestions((prev) => ({
      ...prev,
      [field]: [...prev[field], { id: value, name: value, type: value, startDate: field === "mission" ? new Date().toISOString() : undefined }],
    }));
    setFormData((prev) => ({ ...prev, [field]: value }));
    showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
    setFieldErrors((prev) => ({ ...prev, [field === "mission" ? "MissionId" : "TransportId"]: undefined }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name === "mission" ? "MissionId" : name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    const selectedEmployee = suggestions.beneficiary.find((emp) => emp.displayName === formData.beneficiary);
    const selectedMission = suggestions.mission.find((m) => m.name === formData.mission);
    const selectedTransport = formData.transport ? suggestions.transport.find((t) => t.type === formData.transport) : null;

    if (!selectedEmployee) {
      setModal({
        isOpen: true,
        type: "error",
        message: "Veuillez sélectionner un employé valide.",
      });
      setIsSubmitting(false);
      return;
    }

    if (!selectedMission) {
      setModal({
        isOpen: true,
        type: "error",
        message: "Veuillez sélectionner une mission valide.",
      });
      setIsSubmitting(false);
      return;
    }

    // Additional validation for departure date
    if (formData.departureDate && formData.missionStartDate) {
      const departure = new Date(formData.departureDate);
      const missionStart = new Date(formData.missionStartDate);
      if (departure < missionStart) {
        setModal({
          isOpen: true,
          type: "error",
          message: "La date de départ doit être supérieure ou égale à la date de début de la mission.",
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await createMissionAssignation(
        {
          employeeId: formData.employeeId,
          missionId: formData.missionId,
          transportId: selectedTransport ? selectedTransport.id : null,
          departureDate: `${formData.departureDate}T${formData.departureTime}:00Z`,
          departureTime: formData.departureTime,
          returnDate: `${formData.returnDate}T${formData.returnTime}:00Z`,
          returnTime: formData.returnTime,
          duration: formData.missionDuration,
        },
        setIsLoading,
        (alert) => setAlert(alert),
        (error) => {
          console.log("Erreurs par champ (fieldErrors) :", error.fieldErrors);
          setModal(error);
          setFieldErrors(error.fieldErrors || {});
        }
      );

      showAlert("success", "Mission assignée avec succès.");
      onSuccess(); // Call the onSuccess callback to notify parent
      handleReset(); // Reset the form for another assignment

    } catch (error) {
      console.error("Erreur dans handleSubmit :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
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
      transportId: "",
      departureDate: "",
      departureTime: "",
      missionDuration: "",
      returnDate: "",
      returnTime: "",
      mission: "",
      missionId: missionId || "",
      missionStartDate: "",
    });
    setFieldErrors({});
    showAlert("info", "Formulaire réinitialisé.");
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
        <h2 className="table-title">Assignation d'une Mission</h2>
      </div>

      <form id="assignMissionForm" className="generic-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <table className="form-table">
            <tbody>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Mission</label>
                </th>
                <td className="form-input-cell" colSpan="3">
                  <AutoCompleteInput
                    value={formData.mission}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, mission: value }));
                      setFieldErrors((prev) => ({ ...prev, MissionId: undefined }));
                    }}
                    suggestions={suggestions.mission.map((m) => m.name)}
                    placeholder={
                      isLoading.missions
                        ? "Chargement..."
                        : suggestions.mission.length === 0
                        ? "Aucune mission disponible"
                        : "Saisir ou sélectionner une mission..."
                    }
                    disabled={isSubmitting || isLoading.missions || missionId}
                    onAddNew={(value) => handleAddNewSuggestion("mission", value)}
                    fieldType="mission"
                    fieldLabel="mission"
                    addNewRoute="/mission/create"
                    className={`form-input ${fieldErrors.MissionId ? "error" : ""}`}
                  />
                  {fieldErrors.MissionId && (
                    <span className="error-message">{fieldErrors.MissionId.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Date de début de la mission</label>
                </th>
                <td className="form-input-cell" colSpan="3">
                  <input
                    type="date"
                    name="missionStartDate"
                    value={formData.missionStartDate}
                    className="form-input"
                    disabled={true}
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Bénéficiaire</label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.beneficiary}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, beneficiary: value }));
                      setFieldErrors((prev) => ({ ...prev, EmployeeId: undefined }));
                    }}
                    suggestions={suggestions.beneficiary.map((b) => b.displayName)}
                    placeholder={
                      isLoading.employees
                        ? "Chargement..."
                        : suggestions.beneficiary.length === 0
                        ? "Aucun bénéficiaire disponible pour cette mission"
                        : "Saisir ou sélectionner..."
                    }
                    disabled={isSubmitting || isLoading.employees || !formData.missionId}
                    showAddOption={false}
                    fieldType="beneficiary"
                    fieldLabel="bénéficiaire"
                    addNewRoute="/employee/employee-form"
                    className={`form-input ${fieldErrors.EmployeeId ? "error" : ""}`}
                  />
                  {fieldErrors.EmployeeId && (
                    <span className="error-message">{fieldErrors.EmployeeId.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Matricule</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    name="matricule"
                    value={formData.matricule}
                    onChange={handleChange}
                    placeholder="Saisir le matricule..."
                    className="form-input"
                    disabled={isSubmitting || formData.beneficiary}
                    readOnly={formData.beneficiary}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Fonction</label>
                </th>
                <td className="form-input-cell" colSpan="3">
                  <input
                    type="text"
                    name="function"
                    value={formData.function}
                    onChange={handleChange}
                    placeholder="Saisir la fonction..."
                    className="form-input"
                    disabled={isSubmitting || formData.beneficiary}
                    readOnly={formData.beneficiary}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Base à</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    name="base"
                    value={formData.base}
                    onChange={handleChange}
                    placeholder="Saisir la base..."
                    className="form-input"
                    disabled={isSubmitting || formData.beneficiary}
                    readOnly={formData.beneficiary}
                  />
                </td>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Direction</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    name="direction"
                    value={formData.direction}
                    onChange={handleChange}
                    placeholder="Saisir la direction..."
                    className="form-input"
                    disabled={isSubmitting || formData.beneficiary}
                    readOnly={formData.beneficiary}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Département</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Saisir le département..."
                    className="form-input"
                    disabled={isSubmitting || formData.beneficiary}
                    readOnly={formData.beneficiary}
                  />
                </td>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Service</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    placeholder="Saisir le service..."
                    className="form-input"
                    disabled={isSubmitting || formData.beneficiary}
                    readOnly={formData.beneficiary}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label">Centre de coût</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    name="costCenter"
                    value={formData.costCenter}
                    onChange={handleChange}
                    placeholder="Saisir le centre de coût..."
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </td>
                <th className="form-label-cell">
                  <label className="form-label">Moyen de transport</label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.transport}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, transport: value }));
                      setFieldErrors((prev) => ({ ...prev, TransportId: undefined }));
                    }}
                    suggestions={suggestions.transport.map((t) => t.type)}
                    placeholder={
                      isLoading.transports
                        ? "Chargement..."
                        : suggestions.transport.length === 0
                        ? "Aucun moyen de transport disponible"
                        : "Saisir ou sélectionner un moyen de transport..."
                    }
                    disabled={isSubmitting || isLoading.transports}
                    onAddNew={(value) => handleAddNewSuggestion("transport", value)}
                    fieldType="transport"
                    fieldLabel="moyen de transport"
                    addNewRoute="/transport/create"
                    className={`form-input ${fieldErrors.TransportId ? "error" : ""}`}
                  />
                  {fieldErrors.TransportId && (
                    <span className="error-message">{fieldErrors.TransportId.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Date de départ</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleChange}
                    className={`form-input ${fieldErrors.departureDate ? "error" : ""}`}
                    disabled={isSubmitting}
                  />
                  {fieldErrors.departureDate && (
                    <span className="error-message">{fieldErrors.departureDate.join(", ")}</span>
                  )}
                </td>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Heure de départ</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="time"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleChange}
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Durée prévue de la mission</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="number"
                    name="missionDuration"
                    value={formData.missionDuration}
                    onChange={handleChange}
                    placeholder="Saisir la durée (jours)..."
                    className="form-input"
                    disabled={isSubmitting}
                    min="1"
                  />
                </td>
                <th className="form-label-cell"></th>
                <td className="form-input-cell"></td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Date de retour</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleChange}
                    className="form-input"
                    disabled={isSubmitting}
                    readOnly
                  />
                </td>
                <th className="form-label-cell">
                  <label className="form-label form-label-required">Heure de retour</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="time"
                    name="returnTime"
                    value={formData.returnTime}
                    onChange={handleChange}
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || isLoading.employees || isLoading.missions || isLoading.transports}
            title="Assigner la mission"
          >
            {isSubmitting ? "Envoi en cours..." : "Assigner"}
            <FaIcons.FaArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
            disabled={isSubmitting || isLoading.employees || isLoading.missions || isLoading.transports}
            title="Réinitialiser le formulaire"
          >
            <FaIcons.FaTrash className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  );
}