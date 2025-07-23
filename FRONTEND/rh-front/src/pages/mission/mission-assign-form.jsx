"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Alert from "components/alert";
import AutoCompleteInput from "components/auto-complete-input";
import * as FaIcons from "react-icons/fa";
import { fetchEmployees } from "services/employee/employee";
import { fetchAllMissions } from "services/mission/mission";
import { fetchAllTransports } from "services/mission/transport";

// Messages d'erreur pour la validation
export const errorMessagesMap = {
  beneficiary: "Le bénéficiaire est requis.",
  employeeId: "Veuillez sélectionner un bénéficiaire valide dans la liste.",
  mission: "La mission est requise.",
  missionId: "Veuillez sélectionner une mission valide dans la liste.",
  transport: "Le moyen de transport est requis.",
  transportId: "Veuillez sélectionner un moyen de transport valide dans la liste.",
  matricule: "Le matricule est requis.",
  function: "La fonction est requise.",
  base: "La base est requise.",
  direction: "La direction est requise.",
  department: "Le département est requis.",
  service: "Le service est requis.",
  departureDate: "La date de départ est requise.",
  departureTime: "L'heure de départ est requise.",
  missionDuration: "La durée de la mission est requise.",
  returnDate: "La date de retour est requise.",
  returnTime: "L'heure de retour est requise.",
};

export default function AssignMissionForm() {
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
    whoWillGo: "",
    departureDate: "",
    departureTime: "",
    missionDuration: "",
    returnDate: "",
    returnTime: "",
    mission: "",
    missionId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [returnUrl, setReturnUrl] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [suggestions, setSuggestions] = useState({
    beneficiary: [], // Array of { id, name }
    mission: [], // Array of { id, name }
    transport: [], // Array of { id, type }
  });
  const [isLoading, setIsLoading] = useState({
    employees: true,
    missions: true,
    transports: true,
  });
  const [errors, setErrors] = useState({
    beneficiary: false,
    employeeId: false,
    matricule: false,
    function: false,
    base: false,
    direction: false,
    department: false,
    service: false,
    departureDate: false,
    departureTime: false,
    missionDuration: false,
    returnDate: false,
    returnTime: false,
    mission: false,
    missionId: false,
    transport: false,
    transportId: false,
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Charger les suggestions et initialiser les paramètres d'URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialValue = searchParams.get("initialValue") || "";
    const url = searchParams.get("returnUrl") || "";
    const type = searchParams.get("fieldType") || "";

    setFormData((prev) => ({ ...prev, beneficiary: initialValue }));
    setReturnUrl(url);
    setFieldType(type);

    // Charger les employés pour les suggestions de bénéficiaires
    fetchEmployees(
      (employees) => {
        setSuggestions((prev) => ({
          ...prev,
          beneficiary: employees.map((emp) => ({
            id: emp.employeeId,
            name: `${emp.lastName} ${emp.firstName}`,
          })),
        }));
        setIsLoading((prev) => ({ ...prev, employees: false }));
      },
      setIsLoading,
      setSuggestions,
      (type, message) => setAlert({ isOpen: true, type, message })
    );

    // Charger les missions pour les suggestions
    fetchAllMissions(
      (missions) => {
        setSuggestions((prev) => ({
          ...prev,
          mission: missions.map((mission) => ({
            id: mission.missionId,
            name: mission.name,
          })),
        }));
        setIsLoading((prev) => ({ ...prev, missions: false }));
      },
      setIsLoading,
      () => {},
      (error) => setAlert({ isOpen: true, type: "error", message: error.message })
    );

    // Charger les transports pour les suggestions
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
      (error) => setAlert({ isOpen: true, type: "error", message: error.message })
    );
  }, [location.search]);

  // Mettre à jour les champs liés au bénéficiaire
  useEffect(() => {
    if (formData.beneficiary) {
      fetchEmployees(
        (employees) => {
          const selectedEmployee = employees.find(
            (emp) => `${emp.lastName} ${emp.firstName}` === formData.beneficiary
          );
          if (selectedEmployee) {
            setFormData((prev) => ({
              ...prev,
              employeeId: selectedEmployee.employeeId || "",
              matricule: selectedEmployee.employeeCode || "",
              function: selectedEmployee.jobTitle || "",
              base: selectedEmployee.site?.siteName || "",
              direction: selectedEmployee.direction?.directionName || "",
              department: selectedEmployee.department?.departmentName || "",
              service: selectedEmployee.service?.serviceName || "",
            }));
            setErrors((prev) => ({
              ...prev,
              employeeId: false,
              matricule: false,
              function: false,
              base: false,
              direction: false,
              department: false,
              service: false,
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
            }));
            setErrors((prev) => ({
              ...prev,
              employeeId: true,
              matricule: true,
              function: true,
              base: true,
              direction: true,
              department: true,
              service: true,
            }));
          }
        },
        setIsLoading,
        setSuggestions,
        (type, message) => setAlert({ isOpen: true, type, message })
      );
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
      }));
      setErrors((prev) => ({
        ...prev,
        employeeId: false,
        matricule: false,
        function: false,
        base: false,
        direction: false,
        department: false,
        service: false,
      }));
    }
  }, [formData.beneficiary]);

  // Mettre à jour missionId lorsque la mission change
  useEffect(() => {
    if (formData.mission) {
      fetchAllMissions(
        (missions) => {
          const selectedMission = missions.find((m) => m.name === formData.mission);
          if (selectedMission) {
            setFormData((prev) => ({
              ...prev,
              missionId: selectedMission.missionId || "",
            }));
            setErrors((prev) => ({ ...prev, missionId: false }));
          } else {
            setFormData((prev) => ({
              ...prev,
              missionId: "",
            }));
            setErrors((prev) => ({ ...prev, missionId: true }));
          }
        },
        setIsLoading,
        () => {},
        (error) => setAlert({ isOpen: true, type: "error", message: error.message })
      );
    } else {
      setFormData((prev) => ({
        ...prev,
        missionId: "",
      }));
      setErrors((prev) => ({ ...prev, missionId: false }));
    }
  }, [formData.mission]);

  // Mettre à jour transportId lorsque le moyen de transport change
  useEffect(() => {
    if (formData.transport) {
      fetchAllTransports(
        (transports) => {
          const selectedTransport = transports.find((t) => t.type === formData.transport);
          if (selectedTransport) {
            setFormData((prev) => ({
              ...prev,
              transportId: selectedTransport.transportId || "",
            }));
            setErrors((prev) => ({ ...prev, transportId: false }));
          } else {
            setFormData((prev) => ({
              ...prev,
              transportId: "",
            }));
            setErrors((prev) => ({ ...prev, transportId: true }));
          }
        },
        setIsLoading,
        () => {},
        (error) => setAlert({ isOpen: true, type: "error", message: error.message })
      );
    } else {
      setFormData((prev) => ({
        ...prev,
        transportId: "",
      }));
      setErrors((prev) => ({ ...prev, transportId: false }));
    }
  }, [formData.transport]);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleAddNewSuggestion = (value, field) => {
    setSuggestions((prev) => ({
      ...prev,
      [field]: [...new Set([...prev[field], { id: value, name: value, type: value }])],
    }));
  };

  const validateForm = () => {
    const newErrors = {
      beneficiary: !formData.beneficiary,
      employeeId: !formData.employeeId,
      matricule: !formData.matricule,
      function: !formData.function,
      base: !formData.base,
      direction: !formData.direction,
      department: !formData.department,
      service: !formData.service,
      mission: !formData.mission,
      missionId: !formData.missionId,
      transport: !formData.transport,
      transportId: !formData.transportId,
      departureDate: !formData.departureDate,
      departureTime: !formData.departureTime,
      missionDuration: !formData.missionDuration || formData.missionDuration <= 0,
      returnDate: !formData.returnDate,
      returnTime: !formData.returnTime,
    };

    setErrors(newErrors);

    const errorMessages = Object.keys(newErrors)
      .filter((key) => newErrors[key])
      .map((key) => errorMessagesMap[key]);

    if (errorMessages.length > 0) {
      showAlert("error", `Veuillez corriger les erreurs suivantes :\n${errorMessages.join("\n")}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const departureDateTime = new Date(`${formData.departureDate}T${formData.departureTime}:00Z`).toISOString();
    const returnDateTime = new Date(`${formData.returnDate}T${formData.returnTime}:00Z`).toISOString();

    const payload = {
      employeeId: formData.employeeId,
      missionId: formData.missionId,
      transportId: formData.transportId,
      departureDate: departureDateTime,
      departureTime: formData.departureTime,
      returnDate: returnDateTime,
      returnTime: formData.returnTime,
      duration: parseInt(formData.missionDuration, 10),
    };

    try {
      const response = await fetch("http://localhost:5183/api/MissionAssignation", {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        showAlert("success", "Mission assignée avec succès !");

        if (returnUrl && fieldType) {
          setTimeout(() => {
            const returnParams = new URLSearchParams();
            returnParams.set("newValue", formData.beneficiary);
            returnParams.set("fieldType", fieldType);

            const [basePath, existingParams] = returnUrl.split("?");
            const finalParams = new URLSearchParams(existingParams || "");

            returnParams.forEach((value, key) => {
              finalParams.set(key, value);
            });

            const finalUrl = `${basePath}?${finalParams.toString()}`;
            navigate(finalUrl);
          }, 1500);
        } else {
          navigate("/mission/list");
        }
      } else {
        const errorData = await response.json();
        const message = errorData.message || `Erreur ${response.status}: Échec de l'assignation de la mission.`;
        showAlert("error", message);
      }
    } catch (error) {
      showAlert("error", "Erreur de connexion. Veuillez vérifier votre connexion et réessayer.");
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
      whoWillGo: "",
      departureDate: "",
      departureTime: "",
      missionDuration: "",
      returnDate: "",
      returnTime: "",
      mission: "",
      missionId: "",
    });
    setErrors({
      beneficiary: false,
      employeeId: false,
      matricule: false,
      function: false,
      base: false,
      direction: false,
      department: false,
      service: false,
      departureDate: false,
      departureTime: false,
      missionDuration: false,
      returnDate: false,
      returnTime: false,
      mission: false,
      missionId: false,
      transport: false,
      transportId: false,
    });
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
                      setErrors((prev) => ({ ...prev, mission: false, missionId: false }));
                    }}
                    suggestions={suggestions.mission.map((m) => m.name)}
                    placeholder={
                      isLoading.missions
                        ? "Chargement..."
                        : suggestions.mission.length === 0
                        ? "Aucune mission disponible"
                        : "Saisir ou sélectionner une mission..."
                    }
                    disabled={isSubmitting || isLoading.missions}
                    onAddNew={(value) => handleAddNewSuggestion(value, "mission")}
                    fieldType="mission"
                    fieldLabel="mission"
                    addNewRoute="/mission/create"
                    className={errors.mission || errors.missionId ? "input-error" : ""}
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
                      setErrors((prev) => ({ ...prev, beneficiary: false, employeeId: false }));
                    }}
                    suggestions={suggestions.beneficiary.map((b) => b.name)}
                    placeholder={
                      isLoading.employees
                        ? "Chargement..."
                        : suggestions.beneficiary.length === 0
                        ? "Aucun bénéficiaire disponible"
                        : "Saisir ou sélectionner..."
                    }
                    disabled={isSubmitting || isLoading.employees}
                    showAddOption={false}
                    fieldType="beneficiary"
                    fieldLabel="bénéficiaire"
                    addNewRoute="/employee/employee-form"
                    className={errors.beneficiary || errors.employeeId ? "input-error" : ""}
                  />
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
                    className={`form-input ${errors.matricule ? "input-error" : ""}`}
                    required
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
                    className={`form-input ${errors.function ? "input-error" : ""}`}
                    required
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
                    className={`form-input ${errors.base ? "input-error" : ""}`}
                    required
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
                    className={`form-input ${errors.direction ? "input-error" : ""}`}
                    required
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
                    className={`form-input ${errors.department ? "input-error" : ""}`}
                    required
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
                    className={`form-input ${errors.service ? "input-error" : ""}`}
                    required
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
                  <label className="form-label form-label-required">Moyen de transport</label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.transport}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, transport: value }));
                      setErrors((prev) => ({ ...prev, transport: false, transportId: false }));
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
                    onAddNew={(value) => handleAddNewSuggestion(value, "transport")}
                    fieldType="transport"
                    fieldLabel="moyen de transport"
                    addNewRoute="/transport/create"
                    className={errors.transport || errors.transportId ? "input-error" : ""}
                  />
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
                    className={`form-input ${errors.departureDate ? "input-error" : ""}`}
                    required
                    disabled={isSubmitting}
                  />
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
                    className={`form-input ${errors.departureTime ? "input-error" : ""}`}
                    required
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
                    className={`form-input ${errors.missionDuration ? "input-error" : ""}`}
                    required
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
                    className={`form-input ${errors.returnDate ? "input-error" : ""}`}
                    required
                    disabled={isSubmitting}
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
                    className={`form-input ${errors.returnTime ? "input-error" : ""}`}
                    required
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
            disabled={isSubmitting}
            title="Assigner la mission"
          >
            {isSubmitting ? "Envoi en cours..." : "Assigner"}
            <FaIcons.FaArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
            disabled={isSubmitting}
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