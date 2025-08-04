import "styles/generic-form-styles.css";
import "styles/popup-styles.css";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Alert from "components/alert";
import Modal from "components/modal";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "components/auto-complete-input";
import { fetchAllRegions } from "services/lieu/lieu";
import { createMission, fetchAllMissions, createMissionAssignation } from "services/mission/mission";
import { fetchAllTransports } from "services/transport/transport";
import { fetchEmployees } from "services/employee/employee";

const Popup = ({ isOpen, onClose, onSubmit, beneficiary, suggestions, isSubmitting, fieldErrors, handleInputChange, index, handleAddNewSuggestion }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Ajouter un Bénéficiaire</h3>
        <table className="form-table">
          <tbody>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Bénéficiaire</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={beneficiary.beneficiary}
                  onChange={(value) => handleInputChange({ target: { name: 'beneficiary', value } }, index)}
                  suggestions={suggestions.beneficiary.map((b) => b.displayName)}
                  placeholder={
                    suggestions.beneficiary.length === 0
                      ? "Aucun employé disponible"
                      : "Saisir ou sélectionner..."
                  }
                  disabled={isSubmitting}
                  showAddOption={false}
                  fieldType="beneficiary"
                  fieldLabel="bénéficiaire"
                  addNewRoute="/employee/employee-form"
                  className={`form-input ${fieldErrors[`beneficiaries[${index}].EmployeeId`] ? "error" : ""}`}
                />
                {fieldErrors[`beneficiaries[${index}].EmployeeId`] && (
                  <span className="error-message">{fieldErrors[`beneficiaries[${index}].EmployeeId`].join(", ")}</span>
                )}
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Matricule</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="text"
                  name="matricule"
                  value={beneficiary.matricule}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder="Saisir le matricule..."
                  className="form-input"
                  disabled={isSubmitting || beneficiary.beneficiary}
                  readOnly={beneficiary.beneficiary}
                />
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Fonction</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="text"
                  name="function"
                  value={beneficiary.function}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder="Saisir la fonction..."
                  className="form-input"
                  disabled={isSubmitting || beneficiary.beneficiary}
                  readOnly={beneficiary.beneficiary}
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
                  value={beneficiary.base}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder="Saisir la base..."
                  className="form-input"
                  disabled={isSubmitting || beneficiary.beneficiary}
                  readOnly={beneficiary.beneficiary}
                />
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Direction</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="text"
                  name="direction"
                  value={beneficiary.direction}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder="Saisir la direction..."
                  className="form-input"
                  disabled={isSubmitting || beneficiary.beneficiary}
                  readOnly={beneficiary.beneficiary}
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
                  value={beneficiary.department}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder="Saisir le département..."
                  className="form-input"
                  disabled={isSubmitting || beneficiary.beneficiary}
                  readOnly={beneficiary.beneficiary}
                />
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Service</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="text"
                  name="service"
                  value={beneficiary.service}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder="Saisir le service..."
                  className="form-input"
                  disabled={isSubmitting || beneficiary.beneficiary}
                  readOnly={beneficiary.beneficiary}
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
                  value={beneficiary.costCenter}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder="Saisir le centre de coût..."
                  className="form-input"
                  disabled={isSubmitting}
                />
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label">Moyen de transport</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={beneficiary.transport}
                  onChange={(value) => handleInputChange({ target: { name: 'transport', value } }, index)}
                  suggestions={suggestions.transport.map((t) => t.type)}
                  placeholder={
                    suggestions.transport.length === 0
                      ? "Aucun moyen de transport disponible"
                      : "Saisir ou sélectionner un moyen de transport..."
                  }
                  disabled={isSubmitting}
                  onAddNew={(value) => handleAddNewSuggestion("transport", value)}
                  fieldType="transport"
                  fieldLabel="moyen de transport"
                  addNewRoute="/transport/create"
                  className={`form-input ${fieldErrors[`beneficiaries[${index}].TransportId`] ? "error" : ""}`}
                />
                {fieldErrors[`beneficiaries[${index}].TransportId`] && (
                  <span className="error-message">{fieldErrors[`beneficiaries[${index}].TransportId`].join(", ")}</span>
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
                  value={beneficiary.departureDate}
                  onChange={(e) => handleInputChange(e, index)}
                  className={`form-input ${fieldErrors[`beneficiaries[${index}].departureDate`] ? "error" : ""}`}
                  disabled={isSubmitting}
                />
                {fieldErrors[`beneficiaries[${index}].departureDate`] && (
                  <span className="error-message">{fieldErrors[`beneficiaries[${index}].departureDate`].join(", ")}</span>
                )}
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Heure de départ</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="time"
                  name="departureTime"
                  value={beneficiary.departureTime}
                  onChange={(e) => handleInputChange(e, index)}
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
                  value={beneficiary.missionDuration}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder="Saisir la durée (jours)..."
                  className="form-input"
                  disabled={isSubmitting}
                  min="1"
                />
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Date de retour</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="date"
                  name="returnDate"
                  value={beneficiary.returnDate}
                  onChange={(e) => handleInputChange(e, index)}
                  className="form-input"
                  disabled={isSubmitting}
                  readOnly
                />
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Heure de retour</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="time"
                  name="returnTime"
                  value={beneficiary.returnTime}
                  onChange={(e) => handleInputChange(e, index)}
                  className="form-input"
                  disabled={isSubmitting}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="popup-actions">
          <button
            type="button"
            className="submit-btn"
            onClick={() => onSubmit(beneficiary)}
            disabled={isSubmitting}
          >
            Ajouter
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MissionForm() {
  const [formData, setFormData] = useState({
    missionTitle: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    beneficiaries: [],
    mission: "",
    missionId: "",
    missionStartDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [modal, setModal] = useState({ isOpen: false, type: "info", message: "" });
  const [regions, setRegions] = useState([]);
  const [regionNames, setRegionNames] = useState([]);
  const [regionDisplayNames, setRegionDisplayNames] = useState([]);
  const [suggestions, setSuggestions] = useState({
    beneficiary: [],
    mission: [],
    transport: [],
  });
  const [isLoading, setIsLoading] = useState({
    regions: false,
    employees: true,
    missions: true,
    transports: true,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState({
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
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Fonctions utilitaires pour éviter les boucles
  const updateBeneficiaryWithEmployee = useCallback((beneficiary, employeeDisplayName, employeesList) => {
    if (!employeeDisplayName) {
      return {
        ...beneficiary,
        employeeId: "",
        matricule: "",
        function: "",
        base: "",
        direction: "",
        department: "",
        service: "",
        costCenter: "",
      };
    }

    const selectedEmployee = employeesList.find(emp => emp.displayName === employeeDisplayName);
    if (selectedEmployee) {
      return {
        ...beneficiary,
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
    return beneficiary;
  }, []);

  const updateBeneficiaryWithTransport = useCallback((beneficiary, transportType, transportsList) => {
    if (!transportType) {
      return { ...beneficiary, transportId: "" };
    }
    const selectedTransport = transportsList.find(t => t.type === transportType);
    return {
      ...beneficiary,
      transportId: selectedTransport ? selectedTransport.id || "" : "",
    };
  }, []);

  const calculateReturnDate = useCallback((departureDate, duration, missionStartDate) => {
    if (!departureDate || !duration) return "";
    
    const departure = new Date(departureDate);
    const durationNum = parseInt(duration, 10);
    const missionStart = missionStartDate ? new Date(missionStartDate) : null;

    // Validation de la date de départ
    if (missionStart && departure < missionStart) {
      return { returnDate: "", error: "La date de départ doit être supérieure ou égale à la date de début de la mission" };
    }

    if (!isNaN(departure.getTime()) && durationNum > 0) {
      const returnDate = new Date(departure);
      returnDate.setDate(departure.getDate() + durationNum);
      return { returnDate: returnDate.toISOString().split("T")[0], error: null };
    }
    
    return { returnDate: "", error: null };
  }, []);

  // Fetch initial data
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const missionIdFromUrl = searchParams.get("missionId") || "";

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
  }, [location.search]);

  // Mise à jour des bénéficiaires avec les données employé (OPTIMISÉ)
  useEffect(() => {
    if (suggestions.beneficiary.length === 0) return;

    setFormData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map(beneficiary => 
        updateBeneficiaryWithEmployee(beneficiary, beneficiary.beneficiary, suggestions.beneficiary)
      )
    }));

    // Mise à jour du nouveau bénéficiaire
    setNewBeneficiary(prev => 
      updateBeneficiaryWithEmployee(prev, prev.beneficiary, suggestions.beneficiary)
    );
  }, [suggestions.beneficiary, updateBeneficiaryWithEmployee]);

  // Mise à jour des transports (OPTIMISÉ)
  useEffect(() => {
    if (suggestions.transport.length === 0) return;

    setFormData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map(beneficiary => 
        updateBeneficiaryWithTransport(beneficiary, beneficiary.transport, suggestions.transport)
      )
    }));

    // Mise à jour du transport pour newBeneficiary
    setNewBeneficiary(prev => 
      updateBeneficiaryWithTransport(prev, prev.transport, suggestions.transport)
    );
  }, [suggestions.transport, updateBeneficiaryWithTransport]);

  // Calcul des dates de retour (OPTIMISÉ)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map((beneficiary, index) => {
        const result = calculateReturnDate(beneficiary.departureDate, beneficiary.missionDuration, prev.startDate);
        
        if (result.error) {
          setFieldErrors(prevErrors => ({
            ...prevErrors,
            [`beneficiaries[${index}].departureDate`]: [result.error],
          }));
        } else {
          setFieldErrors(prevErrors => ({
            ...prevErrors,
            [`beneficiaries[${index}].departureDate`]: undefined,
          }));
        }
        
        return { ...beneficiary, returnDate: result.returnDate };
      })
    }));

    // Calcul pour newBeneficiary
    const newBenResult = calculateReturnDate(newBeneficiary.departureDate, newBeneficiary.missionDuration, formData.startDate);
    if (newBenResult.error) {
      setFieldErrors(prevErrors => ({
        ...prevErrors,
        [`beneficiaries[${formData.beneficiaries.length}].departureDate`]: [newBenResult.error],
      }));
    } else {
      setFieldErrors(prevErrors => ({
        ...prevErrors,
        [`beneficiaries[${formData.beneficiaries.length}].departureDate`]: undefined,
      }));
    }
    setNewBeneficiary(prev => ({ ...prev, returnDate: newBenResult.returnDate }));
  }, [
    formData.beneficiaries.map(b => `${b.departureDate}-${b.missionDuration}`).join(','),
    formData.startDate,
    newBeneficiary.departureDate,
    newBeneficiary.missionDuration,
    calculateReturnDate
  ]);

  // Mise à jour des informations de mission (OPTIMISÉ)
  useEffect(() => {
    if (!formData.mission || suggestions.mission.length === 0) return;

    const selectedMission = suggestions.mission.find((m) => m.name === formData.mission);
    if (selectedMission) {
      setFormData((prev) => ({
        ...prev,
        missionId: selectedMission.id || "",
        missionStartDate: selectedMission.startDate.split("T")[0] || "",
      }));
      setFieldErrors((prev) => ({ ...prev, MissionId: undefined }));
    }
  }, [formData.mission, suggestions.mission]);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const showModal = (type, message) => {
    setModal({ isOpen: true, type, message });
  };

  const handleAddNewSuggestion = (field, value) => {
    if (field === "location") {
      const newRegion = { nom: value };
      setRegions((prev) => [...prev, newRegion]);
      setRegionNames((prev) => [...prev, value]);
      setRegionDisplayNames((prev) => [...prev, value]);
      setFormData((prev) => ({ ...prev, location: value }));
      showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
      setFieldErrors((prev) => ({ ...prev, LieuId: undefined }));
    } else {
      setSuggestions((prev) => ({
        ...prev,
        [field]: [...prev[field], { id: value, name: value, type: value, startDate: field === "mission" ? new Date().toISOString() : undefined }],
      }));
      if (field === "transport") {
        setNewBeneficiary((prev) => ({ ...prev, transport: value }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
      showAlert("success", `"${value}" ajouté aux suggestions pour ${field}`);
      setFieldErrors((prev) => ({ ...prev, [field === "mission" ? "MissionId" : "TransportId"]: undefined }));
    }
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (index !== undefined) {
      setNewBeneficiary((prev) => ({
        ...prev,
        [name]: value
      }));
      setFieldErrors((prev) => ({
        ...prev,
        [`beneficiaries[${index}].${name}`]: undefined,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setFieldErrors((prev) => ({
        ...prev,
        [name === "missionTitle" ? "Name" : name === "location" ? "LieuId" : name]: undefined,
      }));
    }
  };

  const addBeneficiary = () => {
    setIsPopupOpen(true);
  };

  const handlePopupSubmit = (beneficiary) => {
    setFormData((prev) => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, beneficiary],
    }));
    setNewBeneficiary({
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
    });
    setIsPopupOpen(false);
  };

  const removeBeneficiary = (index) => {
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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    const selectedRegion = regions.find((region) => region.nom === formData.location);
    if (formData.location && !selectedRegion) {
      showModal("error", "Veuillez sélectionner un lieu valide parmi les régions de Madagascar.");
      setIsSubmitting(false);
      return;
    }

    const selectedEmployeeIds = new Set();
    for (let i = 0; i < formData.beneficiaries.length; i++) {
      const beneficiary = formData.beneficiaries[i];
      const selectedEmployee = suggestions.beneficiary.find((emp) => emp.displayName === beneficiary.beneficiary);
      if (!selectedEmployee && beneficiary.beneficiary) {
        showModal("error", `Veuillez sélectionner un employé valide pour le bénéficiaire ${i + 1}.`);
        setIsSubmitting(false);
        return;
      }
      if (selectedEmployee) {
        if (selectedEmployeeIds.has(selectedEmployee.id)) {
          showModal("error", `L'employé ${selectedEmployee.name} est sélectionné plusieurs fois.`);
          setIsSubmitting(false);
          return;
        }
        selectedEmployeeIds.add(selectedEmployee.id);
      }
    }

    for (let i = 0; i < formData.beneficiaries.length; i++) {
      const beneficiary = formData.beneficiaries[i];
      if (beneficiary.departureDate && formData.startDate) {
        const departure = new Date(beneficiary.departureDate);
        const missionStart = new Date(formData.startDate);
        if (departure < missionStart) {
          showModal("error", `La date de départ du bénéficiaire ${i + 1} doit être supérieure ou égale à la date de début de la mission.`);
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      const missionResponse = await createMission(
        {
          missionId: formData.missionId || "",
          name: formData.missionTitle,
          description: formData.description,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          lieuId: selectedRegion ? selectedRegion.lieuId : "",
        },
        (loading) => setIsSubmitting(loading.mission),
        (alert) => setAlert(alert),
        (error) => {
          console.log("Erreurs par champ (fieldErrors) :", error.fieldErrors);
          setModal(error);
          setFieldErrors(error.fieldErrors || {});
          throw error;
        }
      );

      const newMissionId = missionResponse?.missionId || formData.missionId;

      setFormData((prev) => ({
        ...prev,
        mission: formData.missionTitle,
        missionId: newMissionId,
        missionStartDate: formData.startDate,
      }));

      for (let i = 0; i < formData.beneficiaries.length; i++) {
        const beneficiary = formData.beneficiaries[i];
        if (beneficiary.beneficiary) {
          const selectedEmployee = suggestions.beneficiary.find((emp) => emp.displayName === beneficiary.beneficiary);
          const selectedTransport = beneficiary.transport
            ? suggestions.transport.find((t) => t.type === beneficiary.transport)
            : null;
          await createMissionAssignation(
            {
              employeeId: selectedEmployee?.id || "",
              missionId: newMissionId,
              transportId: selectedTransport ? selectedTransport.id : null,
              departureDate: beneficiary.departureDate ? `${beneficiary.departureDate}T${beneficiary.departureTime}:00Z` : null,
              departureTime: beneficiary.departureTime,
              returnDate: beneficiary.returnDate ? `${beneficiary.returnDate}T${beneficiary.returnTime}:00Z` : null,
              returnTime: beneficiary.returnTime,
              duration: beneficiary.missionDuration,
            },
            setIsLoading,
            (alert) => setAlert(alert),
            (error) => {
              console.log("Erreurs par champ (fieldErrors) :", error.fieldErrors);
              setModal({ isOpen: true, type: "error", message: `Erreur lors de l'assignation du bénéficiaire ${i + 1}: ${error.message}` });
              setFieldErrors(error.fieldErrors || {});
              throw error;
            }
          );
        }
      }

      showAlert("success", "Mission créée et assignée avec succès.");
      navigate("/mission/list");
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
      startDate: "",
      endDate: "",
      beneficiaries: [],
      mission: "",
      missionId: "",
      missionStartDate: "",
    });
    setFieldErrors({});
    showAlert("info", "Formulaire réinitialisé.");
  };

  return (
    <div className="form-container">
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
      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handlePopupSubmit}
        beneficiary={newBeneficiary}
        suggestions={suggestions}
        isSubmitting={isSubmitting}
        fieldErrors={fieldErrors}
        handleInputChange={handleInputChange}
        handleAddNewSuggestion={handleAddNewSuggestion}
        index={formData.beneficiaries.length}
      />
      <div className="table-header">
        <h2 className="table-title">Création et Assignation d'une Mission</h2>
      </div>

      <form id="combinedMissionForm" className="generic-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="form-section-title">Détails de la Mission</h3>
          <table className="form-table">
            <tbody>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="missionTitle" className="form-label form-label-required">
                    Intitulé de la Mission
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="missionTitle"
                    type="text"
                    name="missionTitle"
                    value={formData.missionTitle}
                    onChange={handleInputChange}
                    placeholder="Saisir le titre de la mission..."
                    className={`form-input ${fieldErrors.Name ? "error" : ""}`}
                    disabled={isSubmitting || isLoading.regions}
                  />
                  {fieldErrors.Name && (
                    <span className="error-message">{fieldErrors.Name.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                </th>
                <td className="form-input-cell">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Saisir une description..."
                    className="form-input"
                    rows="4"
                    disabled={isSubmitting || isLoading.regions}
                  />
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="location" className="form-label">
                    Lieu
                  </label>
                </th>
                <td className="form-input-cell">
                  <AutoCompleteInput
                    value={formData.location}
                    onChange={(value) => {
                      const realValue = value.includes('/') ? value.split('/')[0] : value;
                      setFormData((prev) => ({ ...prev, location: realValue }));
                      setFieldErrors((prev) => ({ ...prev, LieuId: undefined }));
                    }}
                    suggestions={regionDisplayNames}
                    maxVisibleItems={3}
                    placeholder="Saisir ou sélectionner un lieu..."
                    disabled={isSubmitting || isLoading.regions}
                    onAddNew={(value) => handleAddNewSuggestion("location", value)}
                    showAddOption={true}
                    fieldType="location"
                    fieldLabel="lieu"
                    addNewRoute="/lieu/create"
                    className={`form-input ${fieldErrors.LieuId ? "error" : ""}`}
                  />
                  {fieldErrors.LieuId && (
                    <span className="error-message">{fieldErrors.LieuId.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="startDate" className="form-label form-label-required">
                    Date de début
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`form-input ${fieldErrors.startDate ? "error" : ""}`}
                    disabled={isSubmitting || isLoading.regions}
                  />
                  {fieldErrors.StartDate && (
                    <span className="error-message">{fieldErrors.StartDate.join(", ")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="form-label-cell">
                  <label htmlFor="endDate" className="form-label form-label-required">
                    Date de fin
                  </label>
                </th>
                <td className="form-input-cell">
                  <input
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`form-input ${fieldErrors.endDate ? "error" : ""}`}
                    disabled={isSubmitting || isLoading.regions}
                  />
                  {fieldErrors.EndDate && (
                    <span className="error-message">{fieldErrors.EndDate.join(", ")}</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Détails des Assignations</h3>
          {formData.beneficiaries.map((beneficiary, index) => (
            <div key={index} className="beneficiary-section">
              <h4>Bénéficiaire {index + 1}</h4>
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeBeneficiary(index)}
                disabled={isSubmitting}
                title="Supprimer ce bénéficiaire"
              >
                <FaIcons.FaTrash className="w-4 h-4" />
              </button>
              <table className="form-table">
                <tbody>
                  <tr>
                    <th className="form-label-cell">
                      <label className="form-label form-label-required">Bénéficiaire</label>
                    </th>
                    <td className="form-input-cell">
                      <input
                        type="text"
                        value={beneficiary.beneficiary}
                        className="form-input"
                        disabled
                        readOnly
                      />
                    </td>
                    <th className="form-label-cell">
                      <label className="form-label form-label-required">Matricule</label>
                    </th>
                    <td className="form-input-cell">
                      <input
                        type="text"
                        value={beneficiary.matricule}
                        className="form-input"
                        disabled
                        readOnly
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
                        value={beneficiary.function}
                        className="form-input"
                        disabled
                        readOnly
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
                        value={beneficiary.base}
                        className="form-input"
                        disabled
                        readOnly
                      />
                    </td>
                    <th className="form-label-cell">
                      <label className="form-label form-label-required">Direction</label>
                    </th>
                    <td className="form-input-cell">
                      <input
                        type="text"
                        value={beneficiary.direction}
                        className="form-input"
                        disabled
                        readOnly
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
                        value={beneficiary.department}
                        className="form-input"
                        disabled
                        readOnly
                      />
                    </td>
                    <th className="form-label-cell">
                      <label className="form-label form-label-required">Service</label>
                    </th>
                    <td className="form-input-cell">
                      <input
                        type="text"
                        value={beneficiary.service}
                        className="form-input"
                        disabled
                        readOnly
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
                        value={beneficiary.costCenter}
                        className="form-input"
                        disabled
                        readOnly
                      />
                    </td>
                    <th className="form-label-cell">
                      <label className="form-label">Moyen de transport</label>
                    </th>
                    <td className="form-input-cell">
                      <input
                        type="text"
                        value={beneficiary.transport}
                        className="form-input"
                        disabled
                        readOnly
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
                        value={beneficiary.departureDate}
                        className="form-input"
                        disabled
                        readOnly
                      />
                    </td>
                    <th className="form-label-cell">
                      <label className="form-label form-label-required">Heure de départ</label>
                    </th>
                    <td className="form-input-cell">
                      <input
                        type="time"
                        value={beneficiary.departureTime}
                        className="form-input"
                        disabled
                        readOnly
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
                        value={beneficiary.missionDuration}
                        className="form-input"
                        disabled
                        readOnly
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
                        value={beneficiary.returnDate}
                        className="form-input"
                        disabled
                        readOnly
                      />
                    </td>
                    <th className="form-label-cell">
                      <label className="form-label form-label-required">Heure de retour</label>
                    </th>
                    <td className="form-input-cell">
                      <input
                        type="time"
                        value={beneficiary.returnTime}
                        className="form-input"
                        disabled
                        readOnly
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
          <button
            type="button"
            className="add-btn"
            onClick={addBeneficiary}
            disabled={isSubmitting}
            title="Ajouter un autre bénéficiaire"
          >
            <FaIcons.FaPlus className="w-4 h-4" />
            Ajouter un Bénéficiaire
          </button>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || isLoading.regions || isLoading.employees || isLoading.missions || isLoading.transports}
            title="Créer et assigner la mission"
          >
            {isSubmitting ? "Envoi en cours..." : "Créer et Assigner"}
            <FaIcons.FaArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
            disabled={isSubmitting || isLoading.regions || isLoading.employees || isLoading.missions || isLoading.transports}
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