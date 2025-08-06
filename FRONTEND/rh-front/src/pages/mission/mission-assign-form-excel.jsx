"use client";
import "styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "components/alert";
import Modal from "components/modal";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "components/auto-complete-input";
import { fetchAllMissions } from "services/mission/mission";
import { fetchDirections } from "services/direction/direction";
import { fetchAllEmployees } from "services/employee/employee";
import { exportMissionAssignationExcel } from "services/mission/mission";

export default function MissionAssignationFormExcel() {
  const [formData, setFormData] = useState({
    mission: "",
    direction: "",
    employee: "",
    startDate: "",
    endDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [modal, setModal] = useState({ isOpen: false, type: "info", message: "" });
  const [missions, setMissions] = useState([]);
  const [directions, setDirections] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [suggestions, setSuggestions] = useState({
    mission: [],
    direction: [],
    employee: [],
  });
  const [isLoading, setIsLoading] = useState({
    missions: false,
    directions: false,
    employees: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  // Fetch data for autocomplete fields
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch missions
        setIsLoading(prev => ({ ...prev, missions: true }));
        fetchAllMissions(
          (data) => {
            setMissions(data);
            setSuggestions((prev) => ({
              ...prev,
              mission: data.map((mission) => mission.name),
            }));
            setIsLoading(prev => ({ ...prev, missions: false }));
          },
          (loadingState) => setIsLoading(prev => ({ ...prev, missions: loadingState.missions || false })),
          () => {},
          (alert) => {
            setAlert(alert);
            setIsLoading(prev => ({ ...prev, missions: false }));
          }
        );

        // Fetch directions
        setIsLoading(prev => ({ ...prev, directions: true }));
        fetchDirections(
          (data) => {
            setDirections(data);
            setSuggestions((prev) => ({
              ...prev,
              direction: data.map((dir) => dir.directionName || dir.name),
            }));
            setIsLoading(prev => ({ ...prev, directions: false }));
          },
          (loadingState) => setIsLoading(prev => ({ ...prev, directions: loadingState.directions || false })),
          () => {},
          (alert) => {
            setAlert(alert);
            setIsLoading(prev => ({ ...prev, directions: false }));
          }
        );

        // Fetch ALL employees
        setIsLoading(prev => ({ ...prev, employees: true }));
        fetchAllEmployees(
          (data) => {
            setEmployees(data);
            setSuggestions((prev) => ({
              ...prev,
              employee: data.map((emp) => ({
                id: emp.employeeId,
                name: `${emp.lastName} ${emp.firstName}${emp.direction?.acronym ? ` (${emp.direction.acronym})` : ''}`,
                employeeCode: emp.employeeCode,
                jobTitle: emp.jobTitle,
                site: emp.site?.siteName,
                direction: emp.direction?.directionName,
                department: emp.department?.departmentName,
                service: emp.service?.serviceName,
                costCenter: emp.costCenter,
              })),
            }));
            setIsLoading(prev => ({ ...prev, employees: false }));
          },
          (loadingState) => setIsLoading(prev => ({ ...prev, employees: loadingState.employees || false })),
          () => {},
          (alert) => {
            setAlert(alert);
            setIsLoading(prev => ({ ...prev, employees: false }));
          }
        );
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        showAlert("error", "Erreur lors du chargement des données");
        setIsLoading({ missions: false, directions: false, employees: false });
      }
    };

    loadData();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const showModal = (type, message) => {
    setModal({ isOpen: true, type, message });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setFieldErrors({});
    setAlert({ isOpen: false, type: "info", message: "" });

    try {
      // Trouver l'ID de la mission sélectionnée (si sélectionnée)
      const selectedMission = formData.mission ? missions.find(m => m.name === formData.mission) : null;
      
      // Trouver l'ID de l'employé sélectionné (si sélectionné)
      const selectedEmployee = formData.employee ? employees.find(emp => 
        `${emp.lastName} ${emp.firstName}${emp.direction?.acronym ? ` (${emp.direction.acronym})` : ''}` === formData.employee
      ) : null;

      // Trouver l'ID de la direction sélectionnée (si sélectionnée)
      const selectedDirection = formData.direction ? directions.find(dir => dir.directionName === formData.direction) : null;

      const assignationData = {
        missionId: selectedMission ? (selectedMission.id || selectedMission.missionId) : null,
        employeeId: selectedEmployee ? selectedEmployee.employeeId : null,
        directionId: selectedDirection ? (selectedDirection.id || selectedDirection.directionId) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      // Afficher les valeurs choisies dans le filtre (nouveau format)
      console.log("Valeurs du filtre appliquées :", {
        missionId: assignationData.missionId,
        directionId: assignationData.directionId,
        employeeId: assignationData.employeeId,
        startDate: assignationData.startDate,
        endDate: assignationData.endDate,
      });

      // Appeler exportMissionAssignationExcel
      await exportMissionAssignationExcel(
        assignationData,
        setIsLoading,
        (successData) => {
          const filterMessage = `Filtre appliqué et exporté avec succès ! 
  Mission: ${selectedMission ? selectedMission.name : "Toutes"}
  Direction: ${selectedDirection ? selectedDirection.directionName : "Toutes"}
  Employé: ${selectedEmployee ? `${selectedEmployee.lastName} ${selectedEmployee.firstName}` : "Tous"}
  Période: ${formData.startDate || "Toutes"} - ${formData.endDate || "Toutes"}`;
          showAlert("success", filterMessage);
        },
        (errorData) => {
          showAlert("error", errorData.message);
        }
      );
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      const hasAnyValue = formData.mission || formData.direction || formData.employee || formData.startDate || formData.endDate;
      if (hasAnyValue) {
        showAlert("error", error.message || "Une erreur est survenue lors de la soumission");
      } else {
        showAlert("info", "Aucun filtre appliqué - affichage de toutes les données");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      mission: "",
      direction: "",
      employee: "",
      startDate: "",
      endDate: "",
    });
    setFieldErrors({});
    showAlert("info", "Formulaire réinitialisé.");
  };

  const isFormDisabled = isSubmitting || isLoading.missions || isLoading.directions || isLoading.employees;

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
      <div className="table-header">
        <h2 className="table-title">Generation Excel Mission</h2>
      </div>

      {(formData.mission || formData.direction || formData.employee || formData.startDate || formData.endDate) && (
        <div className="filter-summary" style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          margin: '10px 0', 
          borderRadius: '5px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Filtre actuel :</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {formData.mission && (
              <span style={{ 
                backgroundColor: '#e3f2fd', 
                padding: '4px 8px', 
                borderRadius: '15px', 
                fontSize: '12px',
                color: '#1976d2'
              }}>
                Mission: {formData.mission}
              </span>
            )}
            {formData.direction && (
              <span style={{ 
                backgroundColor: '#f3e5f5', 
                padding: '4px 8px', 
                borderRadius: '15px', 
                fontSize: '12px',
                color: '#7b1fa2'
              }}>
                Direction: {formData.direction}
              </span>
            )}
            {formData.employee && (
              <span style={{ 
                backgroundColor: '#e8f5e8', 
                padding: '4px 8px', 
                borderRadius: '15px', 
                fontSize: '12px',
                color: '#2e7d32'
              }}>
                Employé: {formData.employee}
              </span>
            )}
            {formData.startDate && (
              <span style={{ 
                backgroundColor: '#fff3e0', 
                padding: '4px 8px', 
                borderRadius: '15px', 
                fontSize: '12px',
                color: '#ef6c00'
              }}>
                Début: {formData.startDate}
              </span>
            )}
            {formData.endDate && (
              <span style={{ 
                backgroundColor: '#ffebee', 
                padding: '4px 8px', 
                borderRadius: '15px', 
                fontSize: '12px',
                color: '#c62828'
              }}>
                Fin: {formData.endDate}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="form-section">
        <h3 className="form-section-title text-lg font-semibold mb-4">Filtres d'Assignation de Mission</h3>
        <table className="form-table w-full border-collapse">
          <tbody>
            <tr className="form-row">
              <td className="form-field-cell p-2 align-top">
                <label htmlFor="mission" className="form-label block mb-2">
                  Mission
                </label>
                <AutoCompleteInput
                  id="mission"
                  value={formData.mission}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, mission: value }));
                    setFieldErrors((prev) => ({ ...prev, mission: undefined }));
                  }}
                  suggestions={suggestions.mission}
                  maxVisibleItems={3}
                  placeholder="Saisir ou sélectionner une mission..."
                  disabled={isFormDisabled}
                  fieldType="mission"
                  fieldLabel="mission"
                  showAddOption={false}
                  className={`form-table w-full ${fieldErrors.mission ? "input-error" : ""}`}
                />
                {fieldErrors.mission && (
                  <span className="error-message block mt-1">{fieldErrors.mission.join(", ")}</span>
                )}
              </td>
            </tr>
            <tr className="form-row">
              <td className="form-field-cell p-2 align-top">
                <label htmlFor="direction" className="form-label block mb-2">
                  Direction
                </label>
                <AutoCompleteInput
                  id="direction"
                  value={formData.direction}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, direction: value }));
                    setFieldErrors((prev) => ({ ...prev, direction: undefined }));
                  }}
                  suggestions={suggestions.direction}
                  maxVisibleItems={3}
                  placeholder="Saisir ou sélectionner une direction..."
                  disabled={isFormDisabled}
                  fieldType="direction"
                  fieldLabel="direction"
                  showAddOption={false}
                  className={`form-table w-full ${fieldErrors.direction ? "input-error" : ""}`}
                />
                {fieldErrors.direction && (
                  <span className="error-message block mt-1">{fieldErrors.direction.join(", ")}</span>
                )}
              </td>
            </tr>
            <tr className="form-row">
              <td className="form-field-cell p-2 align-top">
                <label htmlFor="employee" className="form-label block mb-2">
                  Collaborateur
                </label>
                <AutoCompleteInput
                  id="employee"
                  value={formData.employee}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, employee: value }));
                    setFieldErrors((prev) => ({ ...prev, employee: undefined }));
                  }}
                  suggestions={suggestions.employee.map((emp) => emp.name)}
                  maxVisibleItems={3}
                  placeholder="Saisir ou sélectionner un Collaborateur..."
                  disabled={isFormDisabled}
                  fieldType="employee"
                  fieldLabel="Collaborateur"
                  className={`form-table w-full ${fieldErrors.employee ? "input-error" : ""}`}
                />
                {fieldErrors.employee && (
                  <span className="error-message block mt-1">{fieldErrors.employee.join(", ")}</span>
                )}
              </td>
            </tr>
            <tr className="form-row">
              <td className="form-field-cell p-2 align-top">
                <label htmlFor="startDate" className="form-label block mb-2">
                  Date de début
                </label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`form-table w-full ${fieldErrors.startDate ? "input-error" : ""}`}
                  disabled={isFormDisabled}
                />
                {fieldErrors.startDate && (
                  <span className="error-message block mt-1">{fieldErrors.startDate.join(", ")}</span>
                )}
              </td>
            </tr>
            <tr className="form-row">
              <td className="form-field-cell p-2 align-top">
                <label htmlFor="endDate" className="form-label block mb-2">
                  Date de fin
                </label>
                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`form-table w-full ${fieldErrors.endDate ? "input-error" : ""}`}
                  disabled={isFormDisabled}
                />
                {fieldErrors.endDate && (
                  <span className="error-message block mt-1">{fieldErrors.endDate.join(", ")}</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="form-actions">
        <button
          type="submit"
          className="submit-btn"
          disabled={isFormDisabled}
          title="Générer"
          onClick={handleSubmit}
        >
          {isSubmitting ? "Génération en cours..." : "Générer"}
          <FaIcons.FaArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="reset-btn"
          onClick={handleReset}
          disabled={isFormDisabled}
          title="Réinitialiser le formulaire"
        >
          <FaIcons.FaTrash className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>
    </div>
  );
}