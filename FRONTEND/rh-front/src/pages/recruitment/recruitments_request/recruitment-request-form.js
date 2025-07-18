import { useState, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import RichTextEditor from "../../../components/RichTextEditor";
import Alert from "../../../components/Alert";
import AutoCompleteInput from "../../../components/AutoCompleteInput";
import "../../../styles/generic-form-styles.css";
import {
  fetchData,
  getContractTypeId,
  getSiteId,
  getRecruitmentReasonId,
  getReplacementReasonId,
  getDirectionId,
  getDepartmentId,
  getServiceId,
  getSupervisorId,
  showAlert,
  handleAddNewSuggestion,
} from "../../../utils/utils";
import { BASE_URL } from "../../../config/apiConfig";

export default function RecruitmentRequestForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
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
    fetchData(
      "/api/ContractType",
      setContractTypes,
      setIsLoading,
      setSuggestions,
      "contractTypes",
      "typeContrat",
      (ct) => ct.code,
      "les types de contrat",
      //(type, message) => showAlert(setAlert, type, message)
      () => {}
    );
    fetchData(
      "/api/Direction",
      setDirections,
      setIsLoading,
      setSuggestions,
      "directions",
      "direction",
      (dir) => dir.directionName,
      "les directions",
      () => {}
    );
    fetchData(
      "/api/Department",
      setDepartments,
      setIsLoading,
      setSuggestions,
      "departments",
      "departement",
      (dep) => dep.departmentName,
      "les départements",
      () => {}
    );
    fetchData(
      "/api/Employee",
      setEmployees,
      setIsLoading,
      setSuggestions,
      "employees",
      "superieurHierarchique",
      (emp) => `${emp.firstName} ${emp.lastName}`,
      "les employés",
      () => {}
    );
    fetchData(
      "/api/Site",
      setSites,
      setIsLoading,
      setSuggestions,
      "sites",
      "site",
      (site) => site.siteName,
      "les sites",
      () => {}
    );
    fetchData(
      "/api/Service",
      setServices,
      setIsLoading,
      setSuggestions,
      "services",
      "service",
      (service) => service.serviceName,
      "les services",
      () => {}
    );
    fetchData(
      "/api/RecruitmentReason",
      setRecruitmentReasons,
      setIsLoading,
      setSuggestions,
      "recruitmentReasons",
      null,
      null,
      "les motifs de recrutement",
      () => {}
    );
    fetchData(
      "/api/ReplacementReason",
      setReplacementReasons,
      setIsLoading,
      setSuggestions,
      "replacementReasons",
      "motifRemplacement",
      (reason) => reason.name,
      "les raisons de remplacement",
      () => {}
    );
  }, []);

  // Handle file change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, selectedFiles: files }));
  };

  // Handle navigation
  const handleNext = () => {
    if (currentStep === 1 && validateFirstStep()) {
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
  };

  const handleRemoveMotif = (index) => {
    setFormData((prev) => ({
      ...prev,
      replacementDetails: {
        ...prev.replacementDetails,
        motifs: prev.replacementDetails.motifs.filter((_, i) => i !== index),
      },
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
  };

  // Form validation
  const validateFirstStep = () => {
    const { positionInfo, attachment, workSite } = formData;
    if (!positionInfo.intitule) {
      showAlert(setAlert, "error", "L'intitulé du poste est requis.");
      return false;
    }
    if (positionInfo.effectif < 1) {
      showAlert(setAlert, "error", "L'effectif doit être supérieur ou égal à 1.");
      return false;
    }
    if (!attachment.typeContrat) {
      showAlert(setAlert, "error", "Le type de contrat est requis.");
      return false;
    }
    if (!workSite.selectedSite) {
      showAlert(setAlert, "error", "Le site de travail est requis.");
      return false;
    }
    return true;
  };

  const validateSecondStep = () => {
    const { recruitmentMotive, description, replacementDetails } = formData;
    if (!recruitmentMotive) {
      showAlert(setAlert, "error", "Le motif de recrutement est requis.");
      return false;
    }
    if (recruitmentMotive === "Création d'un nouveau poste" && !description) {
      showAlert(setAlert, "error", "La description du nouveau poste est requise.");
      return false;
    }
    if (recruitmentMotive === "Remplacement d'un employé") {
      if (
        replacementDetails.motifs.some((motif) => !motif.motifRemplacement || !motif.detail)
      ) {
        showAlert(setAlert, "error", "Tous les motifs de remplacement doivent être remplis.");
        return false;
      }
      if (!replacementDetails.nomPrenomsTitulaire) {
        showAlert(setAlert, "error", "Le nom de l'ancien titulaire est requis.");
        return false;
      }
    }
    if (!replacementDetails.datePriseService) {
      showAlert(setAlert, "error", "La date de prise de service est requise.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateSecondStep()) return;
    setIsSubmitting(true);

    try {
      const { positionInfo, contractType, attachment, workSite, recruitmentMotive, replacementDetails, description, selectedFiles } = formData;

      const filesString = selectedFiles.map(file => file.name).join(', ');

      const requestData = {
        positionTitle: positionInfo.intitule,
        positionCount: positionInfo.effectif,
        contractDuration: contractType.duree || "",
        formerEmployeeName: replacementDetails.nomPrenomsTitulaire || "",
        replacementDate: replacementDetails.dateSurvenance ? new Date(replacementDetails.dateSurvenance).toISOString() : new Date().toISOString(),
        newPositionExplanation: description || "",
        desiredStartDate: replacementDetails.datePriseService ? new Date(replacementDetails.datePriseService).toISOString() : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "En Cours",
        files: filesString,
        requesterId: "USR_0001", // TODO: Replace with authenticated user ID
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
          approverId: "USR_0001", // TODO: Replace with dynamic value
          approvalFlowId: "AF_0005", // TODO: Replace with dynamic value
          status: "Pending",
          approvalOrder: 0,
          approvalDate: new Date().toISOString(),
          comment: "",
          signature: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        replacementReasons: replacementDetails.motifs
          .filter(motif => motif.motifRemplacement && motif.detail)
          .map((motif) => ({
            recruitmentRequestId: "",
            replacementReasonId: getReplacementReasonId(motif.motifRemplacement, replacementReasons) || "",
            description: motif.detail,
          })),
        approvalFlows: [
          {
            approvalOrder: 1,
            approverRole: "Chef d'Équipe", // TODO: Replace with dynamic value
            approverId: "AF_0005", // TODO: Replace with dynamic value
          },
        ],
      };

      console.log("Données envoyées:", requestData);

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
        console.log("Réponse du serveur:", result);
        showAlert(setAlert, "success", "Demande de recrutement soumise avec succès !");
        handleReset();
      } else {
        const errorData = await response.text();
        console.error("Erreur serveur:", errorData);
        showAlert(setAlert, "error", `Erreur lors de la soumission : ${errorData || response.statusText}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      showAlert(setAlert, "error", `Erreur de connexion : ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
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
  };

  // Render first step form
  const renderFirstForm = () => (
    <form id="recruitmentRequestForm" className="generic-form">
      <div className="form-section">
        <h3>Informations du Poste</h3>
        <table className="form-table">
          <tbody>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Intitulé du poste</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="text"
                  value={formData.positionInfo.intitule}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      positionInfo: { ...prev.positionInfo, intitule: e.target.value },
                    }))
                  }
                  placeholder="Ex: Développeur Full Stack"
                  className="form-input"
                  required
                  disabled={isSubmitting}
                />
              </td>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Effectif</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="number"
                  value={formData.positionInfo.effectif}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      positionInfo: { ...prev.positionInfo, effectif: parseInt(e.target.value) || 1 },
                    }))
                  }
                  min="1"
                  className="form-input"
                  required
                  disabled={isSubmitting}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="form-section">
        <h3>Nature de l'Engagement Contractuel</h3>
        <table className="form-table">
          <tbody>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Type de contrat</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={formData.attachment.typeContrat}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      attachment: { ...prev.attachment, typeContrat: value },
                    }))
                  }
                  suggestions={suggestions.typeContrat}
                  placeholder={
                    isLoading.contractTypes
                      ? "Chargement..."
                      : suggestions.typeContrat.length === 0
                      ? "Aucune suggestion disponible"
                      : "Saisir ou sélectionner..."
                  }
                  disabled={isSubmitting || isLoading.contractTypes}
                  onAddNew={(value) => handleAddNewSuggestion(setSuggestions, () => {}, "typeContrat", value)}
                  fieldType="typeContrat"
                  fieldLabel="type de contrat"
                  addNewRoute="/recruitment/contract-type-form"
                />
              </td>
              <th className="form-label-cell">
                <label className="form-label">Durée (si CDD, CTT ou intérimaire)</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="text"
                  value={formData.contractType.duree}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contractType: { ...prev.contractType, duree: e.target.value },
                    }))
                  }
                  placeholder="Ex : 6 mois, 1 an"
                  className="form-input"
                  disabled={isSubmitting}
                />
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label">Autre (préciser)</label>
              </th>
              <td className="form-input-cell" colSpan="3">
                <input
                  type="text"
                  value={formData.contractType.autreDetail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contractType: { ...prev.contractType, autreDetail: e.target.value },
                    }))
                  }
                  placeholder="Préciser le type de contrat"
                  className="form-input"
                  disabled={isSubmitting}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="form-section">
        <h3>Rattachement du Poste</h3>
        <table className="form-table">
          <tbody>
            <tr>
              <th className="form-label-cell">
                <label className="form-label">Direction</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={formData.attachment.direction}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      attachment: { ...prev.attachment, direction: value },
                    }))
                  }
                  suggestions={suggestions.direction}
                  placeholder={
                    isLoading.directions
                      ? "Chargement..."
                      : suggestions.direction.length === 0
                      ? "Aucune suggestion disponible"
                      : "Saisir ou sélectionner..."
                  }
                  disabled={isSubmitting || isLoading.directions}
                  onAddNew={(value) => handleAddNewSuggestion(setSuggestions, () => {}, "direction", value)}
                  fieldType="direction"
                  fieldLabel="direction"
                  addNewRoute="/direction/direction-form"
                />
              </td>
              <th className="form-label-cell">
                <label className="form-label">Département</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={formData.attachment.departement}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      attachment: { ...prev.attachment, departement: value },
                    }))
                  }
                  suggestions={suggestions.departement}
                  placeholder={
                    isLoading.departments
                      ? "Chargement..."
                      : suggestions.departement.length === 0
                      ? "Aucune suggestion disponible"
                      : "Saisir ou sélectionner..."
                  }
                  disabled={isSubmitting || isLoading.departments}
                  onAddNew={(value) => handleAddNewSuggestion(setSuggestions, () => {}, "departement", value)}
                  fieldType="departement"
                  fieldLabel="département"
                  addNewRoute="/direction/department-form"
                />
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label">Service</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={formData.attachment.service}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      attachment: { ...prev.attachment, service: value },
                    }))
                  }
                  suggestions={suggestions.service}
                  placeholder={
                    isLoading.services
                      ? "Chargement..."
                      : suggestions.service.length === 0
                      ? "Aucune suggestion disponible"
                      : "Saisir ou sélectionner..."
                  }
                  disabled={isSubmitting || isLoading.services}
                  onAddNew={(value) => handleAddNewSuggestion(setSuggestions, () => {}, "service", value)}
                  fieldType="service"
                  fieldLabel="service"
                  addNewRoute="/direction/service-form"
                />
              </td>
              <th className="form-label-cell">
                <label className="form-label">Supérieur hiérarchique direct</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={formData.attachment.superieurHierarchique}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      attachment: { ...prev.attachment, superieurHierarchique: value },
                    }))
                  }
                  suggestions={suggestions.superieurHierarchique}
                  placeholder={
                    isLoading.employees
                      ? "Chargement..."
                      : suggestions.superieurHierarchique.length === 0
                      ? "Aucune suggestion disponible"
                      : "Saisir ou sélectionner..."
                  }
                  disabled={isSubmitting || isLoading.employees}
                  showAddOption={false}
                  fieldType="superieurHierarchique"
                  fieldLabel="supérieur hiérarchique"
                />
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label">Fonction du Supérieur hiérarchique</label>
              </th>
              <td className="form-input-cell" colSpan="3">
                <AutoCompleteInput
                  value={formData.attachment.fonctionSuperieur}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      attachment: { ...prev.attachment, fonctionSuperieur: value },
                    }))
                  }
                  suggestions={suggestions.fonctionSuperieur}
                  placeholder={
                    suggestions.fonctionSuperieur.length === 0
                      ? "Aucune suggestion disponible"
                      : "Saisir ou sélectionner..."
                  }
                  disabled={isSubmitting}
                  showAddOption={false}
                  fieldType="fonctionSuperieur"
                  fieldLabel="fonction"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="form-section">
        <h3>Site de Travail</h3>
        <table className="form-table">
          <tbody>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Site</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={formData.workSite.selectedSite}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      workSite: { ...prev.workSite, selectedSite: value },
                    }))
                  }
                  suggestions={suggestions.site}
                  placeholder={
                    isLoading.sites
                      ? "Chargement..."
                      : suggestions.site.length === 0
                      ? "Aucune suggestion disponible"
                      : "Saisir ou sélectionner..."
                  }
                  disabled={isSubmitting || isLoading.sites}
                  showAddOption={false}
                  fieldType="site"
                  fieldLabel="site"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="form-section">
        <h3>Pièces jointes</h3>
        <table className="form-table">
          <tbody>
            <tr>
              <th className="form-label-cell">
                <label className="form-label">Fichiers</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="form-input"
                  disabled={isSubmitting}
                  multiple
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="submit-btn"
          onClick={handleNext}
          disabled={isSubmitting}
          title="Suivant"
        >
          Suivant
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
  );

  // Render second step form
  // Render second step form
const renderSecondForm = () => (
  <form id="recruitmentRequestForm2" className="generic-form" onSubmit={handleSubmit}>
    <div className="form-section">
      <h3>Motif du Recrutement</h3>
      <table className="form-table">
        <thead>
          <tr>
            <th className="form-label-cell">Motif</th>
            <th className="form-input-cell">Sélection</th>
          </tr>
        </thead>
        <tbody>
          {recruitmentReasons.map((reason) => (
            <tr key={reason.recruitmentReasonId}>
              <td className="form-label-cell">{reason.name}</td>
              <td className="form-input-cell">
                <input
                  type="radio"
                  name="recruitmentMotive"
                  value={reason.name}
                  checked={formData.recruitmentMotive === reason.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, recruitmentMotive: e.target.value }))
                  }
                  disabled={isSubmitting || isLoading.recruitmentReasons}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {formData.recruitmentMotive === "Remplacement d'un employé" && (
      <div className="form-section">
        <h3>Détails du Motif du remplacement</h3>
        <div className="form-subsection">
          <table className="form-table">
            <thead>
              <tr>
                <th className="form-label-cell">Motif</th>
                <th className="form-input-cell">Détail</th>
                <th className="form-input-cell">Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.replacementDetails.motifs.map((motif, index) => (
                <tr key={index}>
                  <td className="form-input-cell">
                    <AutoCompleteInput
                      value={motif.motifRemplacement}
                      onChange={(value) => handleMotifChange(index, "motifRemplacement", value)}
                      suggestions={suggestions.motifRemplacement}
                      placeholder={
                        isLoading.replacementReasons
                          ? "Chargement..."
                          : suggestions.motifRemplacement.length === 0
                          ? "Aucune suggestion disponible"
                          : "Saisir ou sélectionner..."
                      }
                      disabled={isSubmitting || isLoading.replacementReasons}
                      onAddNew={(value) =>
                        handleAddNewSuggestion(
                          setSuggestions,
                          () => {},
                          "motifRemplacement",
                          value
                        )
                      }
                      fieldType="motifRemplacement"
                      fieldLabel="motif"
                    />
                  </td>
                  <td className="form-input-cell">
                    <input
                      type="text"
                      value={motif.detail}
                      onChange={(e) => handleMotifChange(index, "detail", e.target.value)}
                      placeholder="Détail du motif..."
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </td>
                  <td className="form-input-cell">
                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => handleRemoveMotif(index)}
                      disabled={isSubmitting || formData.replacementDetails.motifs.length === 1}
                      title="Supprimer la ligne"
                    >
                      <FaIcons.FaTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            className="add-btn"
            onClick={handleAddMotif}
            disabled={isSubmitting}
            title="Ajouter une ligne"
          >
            <FaIcons.FaPlus className="w-4 h-4" />
            Ajouter un motif
          </button>
        </div>

        <table className="form-table">
          <tbody>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Date de survenance</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="date"
                  value={formData.replacementDetails.dateSurvenance}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      replacementDetails: { ...prev.replacementDetails, dateSurvenance: e.target.value },
                    }))
                  }
                  className="form-input"
                  disabled={isSubmitting}
                />
              </td>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Nom et prénoms de l'ancien(ne) titulaire</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="text"
                  value={formData.replacementDetails.nomPrenomsTitulaire}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      replacementDetails: { ...prev.replacementDetails, nomPrenomsTitulaire: e.target.value },
                    }))
                  }
                  placeholder="Entrer le nom"
                  className="form-input"
                  disabled={isSubmitting}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )}

    {formData.recruitmentMotive === "Création d'un nouveau poste" && (
      <div className="form-section">
        <h3>Explications pour la création de poste</h3>
        <div className="form-subsection">
          <table className="form-table">
            <tbody>
              <tr>
                <th className="form-label-cell">
                  <label className="form-label form-label-required" htmlFor="description">
                    Description détaillée
                  </label>
                </th>
                <td className="form-input-cell">
                  <RichTextEditor
                    placeholder="Décrivez le poste en détail..."
                    onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Afficher la section Planification pour tous les motifs sélectionnés */}
    {formData.recruitmentMotive && (
      <div className="form-section">
        <h3>Planification</h3>
        <table className="form-table">
          <tbody>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Date de prise de service souhaitée</label>
              </th>
              <td className="form-input-cell">
                <input
                  type="date"
                  value={formData.replacementDetails.datePriseService}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      replacementDetails: { ...prev.replacementDetails, datePriseService: e.target.value },
                    }))
                  }
                  className="form-input"
                  disabled={isSubmitting}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <p className="form-note">Rappel : la durée d'un processus normal de sélection est de 8 semaines</p>
      </div>
    )}

    <div className="form-actions">
      <button
        type="button"
        className="reset-btn"
        onClick={handlePrevious}
        disabled={isSubmitting}
        title="Précédent"
      >
        <FaIcons.FaArrowLeft className="w-4 h-4" />
        Précédent
      </button>

      <button
        type="submit"
        className="submit-btn"
        disabled={isSubmitting}
        title="Valider la demande"
      >
        {isSubmitting ? "Envoi en cours..." : "Valider"}
        <FaIcons.FaCheck className="w-4 h-4" />
      </button>
    </div>
  </form>
);

  return (
    <div className="form-container">
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      <div className="table-header">
        <h2 className="table-title">Demande de recrutement</h2>
      </div>

      {currentStep === 1 ? renderFirstForm() : renderSecondForm()}
    </div>
  );
}