"use client";
import { useState, useEffect } from "react";
import Alert from "components/alert";
import Modal from "components/modal";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "components/auto-complete-input";
import { fetchAllMissions } from "services/mission/mission";
import { fetchDirections } from "services/direction/direction";
import { fetchAllEmployees } from "services/employee/employee";
import { exportMissionAssignationExcel } from "services/mission/compensation";
import {
  FormContainer,
  TableHeader,
  TableTitle,
  GenericForm,
  FormTable,
  FormRow,
  FormFieldCell,
  FormLabel,
  FormInput,
  FormActions,
  SubmitButton,
  ResetButton,
  ErrorMessage,
  StyledAutoCompleteInput,
} from "styles/generaliser/form-container"; 

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

  // Fetch data for autocomplete fields
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch missions
        setIsLoading((prev) => ({ ...prev, missions: true }));
        await fetchAllMissions(
          (data) => {
            setMissions(data);
            setSuggestions((prev) => ({
              ...prev,
              mission: data.map((mission) => mission.name),
            }));
            setIsLoading((prev) => ({ ...prev, missions: false }));
          },
          (loadingState) =>
            setIsLoading((prev) => ({ ...prev, missions: loadingState.missions || false })),
          () => {},
          (alert) => {
            setAlert(alert);
            setIsLoading((prev) => ({ ...prev, missions: false }));
          }
        );

        // Fetch directions
        setIsLoading((prev) => ({ ...prev, directions: true }));
        await fetchDirections(
          (data) => {
            setDirections(data);
            setSuggestions((prev) => ({
              ...prev,
              direction: data.map((dir) => dir.directionName || dir.name),
            }));
            setIsLoading((prev) => ({ ...prev, directions: false }));
          },
          (loadingState) =>
            setIsLoading((prev) => ({ ...prev, directions: loadingState.directions || false })),
          () => {},
          (alert) => {
            setAlert(alert);
            setIsLoading((prev) => ({ ...prev, directions: false }));
          }
        );

        // Fetch ALL employees
        setIsLoading((prev) => ({ ...prev, employees: true }));
        await fetchAllEmployees(
          (data) => {
            setEmployees(data);
            setSuggestions((prev) => ({
              ...prev,
              employee: data.map((emp) => ({
                id: emp.employeeId,
                name: `${emp.lastName} ${emp.firstName}${
                  emp.direction?.acronym ? ` (${emp.direction.acronym})` : ""
                }`,
                employeeCode: emp.employeeCode,
                jobTitle: emp.jobTitle,
                site: emp.site?.siteName,
                direction: emp.direction?.directionName,
                department: emp.department?.departmentName,
                service: emp.service?.serviceName,
                costCenter: emp.costCenter,
              })),
            }));
            setIsLoading((prev) => ({ ...prev, employees: false }));
          },
          (loadingState) =>
            setIsLoading((prev) => ({ ...prev, employees: loadingState.employees || false })),
          () => {},
          (alert) => {
            setAlert(alert);
            setIsLoading((prev) => ({ ...prev, employees: false }));
          }
        );
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setAlert({ isOpen: true, type: "error", message: "Erreur lors du chargement des données" });
        setIsLoading({ missions: false, directions: false, employees: false });
      }
    };

    loadData();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
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
      // Find selected mission ID
      const selectedMission = formData.mission
        ? missions.find((m) => m.name === formData.mission)
        : null;

      // Find selected employee ID
      const selectedEmployee = formData.employee
        ? employees.find(
            (emp) =>
              `${emp.lastName} ${emp.firstName}${
                emp.direction?.acronym ? ` (${emp.direction.acronym})` : ""
              }` === formData.employee
          )
        : null;

      // Find selected direction ID
      const selectedDirection = formData.direction
        ? directions.find((dir) => dir.directionName === formData.direction)
        : null;

      const assignationData = {
        missionId: selectedMission ? selectedMission.id || selectedMission.missionId : null,
        employeeId: selectedEmployee ? selectedEmployee.employeeId : null,
        directionId: selectedDirection
          ? selectedDirection.id || selectedDirection.directionId
          : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      // Log applied filter values
      console.log("Valeurs du filtre appliquées :", {
        missionId: assignationData.missionId,
        directionId: assignationData.directionId,
        employeeId: assignationData.employeeId,
        startDate: assignationData.startDate,
        endDate: assignationData.endDate,
      });

      // Call exportMissionAssignationExcel
      await exportMissionAssignationExcel(
        assignationData,
        setIsLoading,
        (successData) => {
          const filterMessage = `Filtre appliqué et exporté avec succès ! 
            Mission: ${selectedMission ? selectedMission.name : "Toutes"}
            Direction: ${selectedDirection ? selectedDirection.directionName : "Toutes"}
            Employé: ${
              selectedEmployee
                ? `${selectedEmployee.lastName} ${selectedEmployee.firstName}`
                : "Tous"
            }
            Période: ${formData.startDate || "Toutes"} - ${formData.endDate || "Toutes"}`;
          showAlert("success", filterMessage);
        },
        (errorData) => {
          showAlert("error", errorData.message);
        }
      );
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      const hasAnyValue =
        formData.mission || formData.direction || formData.employee || formData.startDate || formData.endDate;
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
      <TableHeader>
        <TableTitle>Génération Excel Mission</TableTitle>
      </TableHeader>

      {(formData.mission || formData.direction || formData.employee || formData.startDate || formData.endDate) && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "5px",
            border: "1px solid #dee2e6",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#495057" }}>Filtre actuel :</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {formData.mission && (
              <span
                style={{
                  backgroundColor: "#e3f2fd",
                  padding: "4px 8px",
                  borderRadius: "15px",
                  fontSize: "12px",
                  color: "#1976d2",
                }}
              >
                Mission: {formData.mission}
              </span>
            )}
            {formData.direction && (
              <span
                style={{
                  backgroundColor: "#f3e5f5",
                  padding: "4px 8px",
                  borderRadius: "15px",
                  fontSize: "12px",
                  color: "#7b1fa2",
                }}
              >
                Direction: {formData.direction}
              </span>
            )}
            {formData.employee && (
              <span
                style={{
                  backgroundColor: "#e8f5e8",
                  padding: "4px 8px",
                  borderRadius: "15px",
                  fontSize: "12px",
                  color: "#2e7d32",
                }}
              >
                Employé: {formData.employee}
              </span>
            )}
            {formData.startDate && (
              <span
                style={{
                  backgroundColor: "#fff3e0",
                  padding: "4px 8px",
                  borderRadius: "15px",
                  fontSize: "12px",
                  color: "#ef6c00",
                }}
              >
                Début: {formData.startDate}
              </span>
            )}
            {formData.endDate && (
              <span
                style={{
                  backgroundColor: "#ffebee",
                  padding: "4px 8px",
                  borderRadius: "15px",
                  fontSize: "12px",
                  color: "#c62828",
                }}
              >
                Fin: {formData.endDate}
              </span>
            )}
          </div>
        </div>
      )}

      <div>
        <h3>Filtres d'Assignation de Mission</h3>
        <GenericForm onSubmit={handleSubmit}>
          <FormTable>
            <tbody>
              <FormRow>
                <FormFieldCell>
                  <FormLabel htmlFor="mission">Mission</FormLabel>
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
                    styledInput={StyledAutoCompleteInput}
                    className={fieldErrors.mission ? "input-error" : ""}
                  />
                  {fieldErrors.mission && (
                    <ErrorMessage>{fieldErrors.mission.join(", ")}</ErrorMessage>
                  )}
                </FormFieldCell>
              </FormRow>
              <FormRow>
                <FormFieldCell>
                  <FormLabel htmlFor="direction">Direction</FormLabel>
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
                    styledInput={StyledAutoCompleteInput}
                    className={fieldErrors.direction ? "input-error" : ""}
                  />
                  {fieldErrors.direction && (
                    <ErrorMessage>{fieldErrors.direction.join(", ")}</ErrorMessage>
                  )}
                </FormFieldCell>
              </FormRow>
              <FormRow>
                <FormFieldCell>
                  <FormLabel htmlFor="employee">Collaborateur</FormLabel>
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
                    styledInput={StyledAutoCompleteInput}
                    className={fieldErrors.employee ? "input-error" : ""}
                  />
                  {fieldErrors.employee && (
                    <ErrorMessage>{fieldErrors.employee.join(", ")}</ErrorMessage>
                  )}
                </FormFieldCell>
              </FormRow>
              <FormRow>
                <FormFieldCell>
                  <FormLabel htmlFor="startDate">Date de début</FormLabel>
                  <FormInput
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={fieldErrors.startDate ? "input-error" : ""}
                    disabled={isFormDisabled}
                  />
                  {fieldErrors.startDate && (
                    <ErrorMessage>{fieldErrors.startDate.join(", ")}</ErrorMessage>
                  )}
                </FormFieldCell>
              </FormRow>
              <FormRow>
                <FormFieldCell>
                  <FormLabel htmlFor="endDate">Date de fin</FormLabel>
                  <FormInput
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={fieldErrors.endDate ? "input-error" : ""}
                    disabled={isFormDisabled}
                  />
                  {fieldErrors.endDate && (
                    <ErrorMessage>{fieldErrors.endDate.join(", ")}</ErrorMessage>
                  )}
                </FormFieldCell>
              </FormRow>
            </tbody>
          </FormTable>
          <FormActions>
            <SubmitButton type="submit" disabled={isFormDisabled} title="Générer">
              {isSubmitting ? "Génération en cours..." : "Générer"}
              <FaIcons.FaArrowRight className="w-4 h-4" />
            </SubmitButton>
            <ResetButton type="button" onClick={handleReset} disabled={isFormDisabled} title="Réinitialiser le formulaire">
              <FaIcons.FaTrash className="w-4 h-4" />
              Réinitialiser
            </ResetButton>
          </FormActions>
        </GenericForm>
      </div>
    </FormContainer>
  );
}