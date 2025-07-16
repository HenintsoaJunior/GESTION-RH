import "../../../styles/generic-form-styles.css";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../../config/apiConfig";
import RichTextEditor from "../../../components/RichTextEditor";
import Alert from "../../../components/Alert";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "../../../components/AutoCompleteInput";

export default function RecruitmentRequestForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [contractTypes, setContractTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [directions, setDirections] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [services, setServices] = useState([]);
  const [recruitmentReasons, setRecruitmentReasons] = useState([]);
  const [replacementReasons, setReplacementReasons] = useState([]);
  const [isLoadingContractTypes, setIsLoadingContractTypes] = useState(true);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingDirections, setIsLoadingDirections] = useState(true);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isLoadingSites, setIsLoadingSites] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingRecruitmentReasons, setIsLoadingRecruitmentReasons] = useState(true);
  const [isLoadingReplacementReasons, setIsLoadingReplacementReasons] = useState(true);

  const [positionInfo, setPositionInfo] = useState({
    intitule: "",
    effectif: 1,
  });

  const [contractType, setContractType] = useState({
    selectedType: "",
    duree: "",
    autreDetail: "",
  });

  const [attachment, setAttachment] = useState({
    typeContrat: "",
    direction: "",
    departement: "",
    service: "",
    superieurHierarchique: "",
    fonctionSuperieur: "",
  });

  const [workSite, setWorkSite] = useState({
    selectedSite: "",
  });

  const [recruitmentMotive, setRecruitmentMotive] = useState("");

  const [replacementDetails, setReplacementDetails] = useState({
    motifs: [{ motifRemplacement: "", detail: "" }],
    dateSurvenance: "",
    nomPrenomsTitulaire: "",
    datePriseService: "",
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

  // Fetch Contract Types
  const fetchContractTypes = async () => {
    try {
      setIsLoadingContractTypes(true);
      const response = await fetch(`${BASE_URL}/api/ContractType`, {
        method: "GET",
        headers: { accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setContractTypes(data);
        setSuggestions((prev) => ({
          ...prev,
          typeContrat: data.map((ct) => ct.label),
        }));
      } else {
        showAlert("warning", "Impossible de charger les types de contrat.");
        setSuggestions((prev) => ({
          ...prev,
          typeContrat: ["CDD", "CDI", "CTT"],
        }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des types de contrat:", error);
      showAlert("warning", "Erreur de connexion pour les types de contrat.");
      setSuggestions((prev) => ({
        ...prev,
        typeContrat: ["CDD", "CDI", "CTT"],
      }));
    } finally {
      setIsLoadingContractTypes(false);
    }
  };

  // Fetch Directions
  const fetchDirections = async () => {
    try {
      setIsLoadingDirections(true);
      const response = await fetch(`${BASE_URL}/api/Direction`, {
        method: "GET",
        headers: { accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setDirections(data);
        setSuggestions((prev) => ({
          ...prev,
          direction: data.map((dir) => dir.directionName),
        }));
      } else {
        showAlert("warning", "Impossible de charger les directions.");
        setSuggestions((prev) => ({
          ...prev,
          direction: ["Direction Technique", "Direction Commerciale et Marketing", "Ressources Humaines"],
        }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des directions:", error);
      showAlert("warning", "Erreur de connexion pour les directions.");
      setSuggestions((prev) => ({
        ...prev,
        direction: ["Direction Technique", "Direction Commerciale et Marketing", "Ressources Humaines"],
      }));
    } finally {
      setIsLoadingDirections(false);
    }
  };

  // Fetch Departments
  const fetchDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      const response = await fetch(`${BASE_URL}/api/Department`, {
        method: "GET",
        headers: { accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
        setSuggestions((prev) => ({
          ...prev,
          departement: data.map((dep) => dep.departmentName),
        }));
      } else {
        showAlert("warning", "Impossible de charger les départements.");
        setSuggestions((prev) => ({
          ...prev,
          departement: ["Bureau d'Études", "Marketing Digital", "Recrutement"],
        }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des départements:", error);
      showAlert("warning", "Erreur de connexion pour les départements.");
      setSuggestions((prev) => ({
        ...prev,
        departement: ["Bureau d'Études", "Marketing Digital", "Recrutement"],
      }));
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  // Fetch Employees
  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await fetch(`${BASE_URL}/api/Employee`, {
        method: "GET",
        headers: { accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
        setSuggestions((prev) => ({
          ...prev,
          superieurHierarchique: data.map((emp) => `${emp.firstName} ${emp.lastName}`),
        }));
      } else {
        showAlert("warning", "Impossible de charger les employés.");
        setSuggestions((prev) => ({
          ...prev,
          superieurHierarchique: ["Jean Dupont", "Marie Rakoto", "Sophie Lefèvre"],
        }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      showAlert("warning", "Erreur de connexion pour les employés.");
      setSuggestions((prev) => ({
        ...prev,
        superieurHierarchique: ["Jean Dupont", "Marie Rakoto", "Sophie Lefèvre"],
      }));
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // Fetch Sites
  const fetchSites = async () => {
    try {
      setIsLoadingSites(true);
      const response = await fetch(`${BASE_URL}/api/Site`, {
        method: "GET",
        headers: { accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setSites(data);
        setSuggestions((prev) => ({
          ...prev,
          site: data.map((site) => site.siteName),
        }));
      } else {
        showAlert("warning", "Impossible de charger les sites.");
        setSuggestions((prev) => ({
          ...prev,
          site: ["Antananarivo", "Nosy Be"],
        }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des sites:", error);
      showAlert("warning", "Erreur de connexion pour les sites.");
      setSuggestions((prev) => ({
        ...prev,
        site: ["Antananarivo", "Nosy Be"],
      }));
    } finally {
      setIsLoadingSites(false);
    }
  };

  // Fetch Services
  const fetchServices = async () => {
    try {
      setIsLoadingServices(true);
      const response = await fetch(`${BASE_URL}/api/Service`, {
        method: "GET",
        headers: { accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data);
        setSuggestions((prev) => ({
          ...prev,
          service: data.map((service) => service.serviceName),
        }));
      } else {
        showAlert("warning", "Impossible de charger les services.");
        setSuggestions((prev) => ({
          ...prev,
          service: [
            "Conception Technique",
            "Campagnes Publicitaires",
            "Contrôle Qualité",
            "Formation Interne",
            "Maintenance Réseau",
            "Gestion des Stocks",
            "Audit Financier",
          ],
        }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des services:", error);
      showAlert("warning", "Erreur de connexion pour les services.");
      setSuggestions((prev) => ({
        ...prev,
        service: [
          "Conception Technique",
          "Campagnes Publicitaires",
          "Contrôle Qualité",
          "Formation Interne",
          "Maintenance Réseau",
          "Gestion des Stocks",
          "Audit Financier",
        ],
      }));
    } finally {
      setIsLoadingServices(false);
    }
  };

  // Fetch Recruitment Reasons
  const fetchRecruitmentReasons = async () => {
    try {
      setIsLoadingRecruitmentReasons(true);
      const response = await fetch(`${BASE_URL}/api/RecruitmentReason`, {
        method: "GET",
        headers: { accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setRecruitmentReasons(data);
      } else {
        showAlert("warning", "Impossible de charger les motifs de recrutement.");
        setRecruitmentReasons([
          { recruitmentReasonId: "RR_0001", name: "Remplacement d'un employé" },
          { recruitmentReasonId: "RR_0002", name: "Création d'un nouveau poste" },
          { recruitmentReasonId: "RR_0003", name: "Dotation prévue au budget" },
        ]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des motifs de recrutement:", error);
      showAlert("warning", "Erreur de connexion pour les motifs de recrutement.");
      setRecruitmentReasons([
        { recruitmentReasonId: "RR_0001", name: "Remplacement d'un employé" },
        { recruitmentReasonId: "RR_0002", name: "Création d'un nouveau poste" },
        { recruitmentReasonId: "RR_0003", name: "Dotation prévue au budget" },
      ]);
    } finally {
      setIsLoadingRecruitmentReasons(false);
    }
  };

  // Fetch Replacement Reasons
  const fetchReplacementReasons = async () => {
    try {
      setIsLoadingReplacementReasons(true);
      const response = await fetch(`${BASE_URL}/api/ReplacementReason`, {
        method: "GET",
        headers: { accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setReplacementReasons(data);
        setSuggestions((prev) => ({
          ...prev,
          motifRemplacement: data.map((reason) => reason.name),
        }));
      } else {
        showAlert("warning", "Impossible de charger les raisons de remplacement.");
        setSuggestions((prev) => ({
          ...prev,
          motifRemplacement: [
            "Décès",
            "Démission",
            "Essai non-concluant",
            "Licenciement",
            "Mobilité interne",
            "Retraite",
            "Rupture de contrat à l’amiable",
          ],
        }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des raisons de remplacement:", error);
      showAlert("warning", "Erreur de connexion pour les raisons de remplacement.");
      setSuggestions((prev) => ({
        ...prev,
        motifRemplacement: [
          "Décès",
          "Démission",
          "Essai non-concluant",
          "Licenciement",
          "Mobilité interne",
          "Retraite",
          "Rupture de contrat à l’amiable",
        ],
      }));
    } finally {
      setIsLoadingReplacementReasons(false);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    fetchContractTypes();
    fetchDirections();
    fetchDepartments();
    fetchEmployees();
    fetchSites();
    fetchServices();
    fetchRecruitmentReasons();
    fetchReplacementReasons();
  }, []);

  const getContractTypeId = (label) => {
    const contractType = contractTypes.find((ct) => ct.label === label);
    return contractType ? contractType.contractTypeId : null;
  };

  const getContractTypeCode = (label) => {
    const contractType = contractTypes.find((ct) => ct.label === label);
    return contractType ? contractType.code : null;
  };

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleAddNewSuggestion = (field, value) => {
    setSuggestions((prev) => ({
      ...prev,
      [field]: [...prev[field], value],
    }));
    showAlert("success", `"${value}" ajouté aux suggestions`);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleAddMotif = () => {
    setReplacementDetails((prev) => ({
      ...prev,
      motifs: [...prev.motifs, { motifRemplacement: "", detail: "" }],
    }));
  };

  const handleRemoveMotif = (index) => {
    setReplacementDetails((prev) => ({
      ...prev,
      motifs: prev.motifs.filter((_, i) => i !== index),
    }));
  };

  const handleMotifChange = (index, field, value) => {
    setReplacementDetails((prev) => {
      const updatedMotifs = [...prev.motifs];
      updatedMotifs[index] = { ...updatedMotifs[index], [field]: value };
      return { ...prev, motifs: updatedMotifs };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      const contractTypeId = getContractTypeId(attachment.typeContrat);
      const contractTypeCode = getContractTypeCode(attachment.typeContrat);

      formData.append("RecruitmentRequestId", "");
      formData.append("Description", description);
      formData.append("Status", "En Cours");
      formData.append("RequesterId", "USR001");
      formData.append("RequestDate", new Date().toISOString());
      formData.append("ApprovalDate", new Date().toISOString());

      formData.append("PositionInfo", JSON.stringify(positionInfo));
      formData.append(
        "ContractType",
        JSON.stringify({
          ...contractType,
          contractTypeId: contractTypeId,
          contractTypeCode: contractTypeCode,
          contractTypeLabel: attachment.typeContrat,
        })
      );
      formData.append("Attachment", JSON.stringify(attachment));
      formData.append("WorkSite", JSON.stringify(workSite));
      formData.append("RecruitmentMotive", recruitmentMotive);
      formData.append("ReplacementDetails", JSON.stringify(replacementDetails));
      formData.append(
        "PostCreation",
        JSON.stringify({ justification: description, datePriseService: replacementDetails.datePriseService })
      );

      selectedFiles.forEach((file) => {
        formData.append("Files", file);
      });

      const response = await fetch(`${BASE_URL}/api/RecruitmentRequest`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await response.json();
        showAlert("success", "Demande de recrutement soumise avec succès !");
        handleReset();
      } else {
        await response.json();
        showAlert("error", "Erreur lors de la soumission de la demande. Veuillez réessayer.");
      }
    } catch (error) {
      showAlert("error", "Erreur de connexion. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedFiles([]);
    setDescription("");
    setPositionInfo({ intitule: "", effectif: 1 });
    setContractType({ selectedType: "", duree: "", autreDetail: "" });
    setAttachment({
      typeContrat: "",
      direction: "",
      departement: "",
      service: "",
      superieurHierarchique: "",
      fonctionSuperieur: "",
    });
    setWorkSite({ selectedSite: "" });
    setRecruitmentMotive("");
    setReplacementDetails({
      motifs: [{ motifRemplacement: "", detail: "" }],
      dateSurvenance: "",
      nomPrenomsTitulaire: "",
      datePriseService: "",
    });
  };

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
                  value={positionInfo.intitule}
                  onChange={(e) => setPositionInfo((prev) => ({ ...prev, intitule: e.target.value }))}
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
                  value={positionInfo.effectif}
                  onChange={(e) =>
                    setPositionInfo((prev) => ({ ...prev, effectif: parseInt(e.target.value) || 1 }))
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
                <label className="form-label">Type de contrat</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={attachment.typeContrat}
                  onChange={(value) => setAttachment((prev) => ({ ...prev, typeContrat: value }))}
                  suggestions={suggestions.typeContrat}
                  placeholder={isLoadingContractTypes ? "Chargement..." : "Saisir ou sélectionner..."}
                  disabled={isSubmitting || isLoadingContractTypes}
                  onAddNew={(value) => handleAddNewSuggestion("typeContrat", value)}
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
                  value={contractType.duree}
                  onChange={(e) => setContractType((prev) => ({ ...prev, duree: e.target.value }))}
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
                  value={contractType.autreDetail}
                  onChange={(e) => setContractType((prev) => ({ ...prev, autreDetail: e.target.value }))}
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
                  value={attachment.direction}
                  onChange={(value) => setAttachment((prev) => ({ ...prev, direction: value }))}
                  suggestions={suggestions.direction}
                  placeholder={isLoadingDirections ? "Chargement..." : "Saisir ou sélectionner..."}
                  disabled={isSubmitting || isLoadingDirections}
                  onAddNew={(value) => handleAddNewSuggestion("direction", value)}
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
                  value={attachment.departement}
                  onChange={(value) => setAttachment((prev) => ({ ...prev, departement: value }))}
                  suggestions={suggestions.departement}
                  placeholder={isLoadingDepartments ? "Chargement..." : "Saisir ou sélectionner..."}
                  disabled={isSubmitting || isLoadingDepartments}
                  onAddNew={(value) => handleAddNewSuggestion("departement", value)}
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
                  value={attachment.service}
                  onChange={(value) => setAttachment((prev) => ({ ...prev, service: value }))}
                  suggestions={suggestions.service}
                  placeholder={isLoadingServices ? "Chargement..." : "Saisir ou sélectionner..."}
                  disabled={isSubmitting || isLoadingServices}
                  onAddNew={(value) => handleAddNewSuggestion("service", value)}
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
                  value={attachment.superieurHierarchique}
                  onChange={(value) =>
                    setAttachment((prev) => ({ ...prev, superieurHierarchique: value }))
                  }
                  suggestions={suggestions.superieurHierarchique}
                  placeholder={isLoadingEmployees ? "Chargement..." : "Saisir ou sélectionner..."}
                  disabled={isSubmitting || isLoadingEmployees}
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
                  value={attachment.fonctionSuperieur}
                  onChange={(value) => setAttachment((prev) => ({ ...prev, fonctionSuperieur: value }))}
                  suggestions={suggestions.fonctionSuperieur}
                  placeholder="Saisir ou sélectionner..."
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
                <label className="form-label">Site</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={workSite.selectedSite}
                  onChange={(value) => setWorkSite((prev) => ({ ...prev, selectedSite: value }))}
                  suggestions={suggestions.site}
                  placeholder={isLoadingSites ? "Chargement..." : "Saisir ou sélectionner..."}
                  disabled={isSubmitting || isLoadingSites}
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
                    checked={recruitmentMotive === reason.name}
                    onChange={(e) => setRecruitmentMotive(e.target.value)}
                    disabled={isSubmitting || isLoadingRecruitmentReasons}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {recruitmentMotive === "Remplacement d'un employé" && (
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
                {replacementDetails.motifs.map((motif, index) => (
                  <tr key={index}>
                    <td className="form-input-cell">
                      <AutoCompleteInput
                        value={motif.motifRemplacement}
                        onChange={(value) => handleMotifChange(index, "motifRemplacement", value)}
                        suggestions={suggestions.motifRemplacement}
                        placeholder={isLoadingReplacementReasons ? "Chargement..." : "Saisir ou sélectionner..."}
                        disabled={isSubmitting || isLoadingReplacementReasons}
                        onAddNew={(value) => handleAddNewSuggestion("motifRemplacement", value)}
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
                        disabled={isSubmitting || replacementDetails.motifs.length === 1}
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
                  <label className="form-label">Date de survenance</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="date"
                    value={replacementDetails.dateSurvenance}
                    onChange={(e) => setReplacementDetails((prev) => ({ ...prev, dateSurvenance: e.target.value }))}
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </td>
                <th className="form-label-cell">
                  <label className="form-label">Nom et prénoms de l'ancien(ne) titulaire</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    value={replacementDetails.nomPrenomsTitulaire}
                    onChange={(e) => setReplacementDetails((prev) => ({ ...prev, nomPrenomsTitulaire: e.target.value }))}
                    placeholder="Entrer le nom"
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="form-section">
            <h3>Planification</h3>
            <table className="form-table">
              <tbody>
                <tr>
                  <th className="form-label-cell">
                    <label className="form-label">Date de prise de service souhaitée</label>
                  </th>
                  <td className="form-input-cell">
                    <input
                      type="date"
                      value={replacementDetails.datePriseService}
                      onChange={(e) => setReplacementDetails((prev) => ({ ...prev, datePriseService: e.target.value }))}
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="form-note">Rappel : la durée d'un processus normal de sélection est de 8 semaines</p>
          </div>
        </div>
      )}

      {recruitmentMotive === "Création d'un nouveau poste" && (
        <>
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
                        onChange={setDescription}
                        disabled={isSubmitting}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="form-section">
            <h3>Planification</h3>
            <table className="form-table">
              <tbody>
                <tr>
                  <th className="form-label-cell">
                    <label className="form-label">Date de prise de service souhaitée</label>
                  </th>
                  <td className="form-input-cell">
                    <input
                      type="date"
                      value={replacementDetails.datePriseService}
                      onChange={(e) => setReplacementDetails((prev) => ({ ...prev, datePriseService: e.target.value }))}
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="form-note">Rappel : la durée d'un processus normal de sélection est de 8 semaines</p>
          </div>
        </>
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