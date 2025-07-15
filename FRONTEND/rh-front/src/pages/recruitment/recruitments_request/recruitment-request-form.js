import "../../../styles/generic-form-styles.css";
import { useState } from "react";
import { BASE_URL } from "../../../config/apiConfig";
import RichTextEditor from "../../../components/RichTextEditor";
import Alert from "../../../components/Alert";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "../../../components/AutoCompleteInput";

// Composant principal du formulaire
export default function RecruitmentRequestForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });

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

  // État pour le motif de recrutement
  const [recruitmentMotive, setRecruitmentMotive] = useState("");

  // État pour les détails du remplacement
  const [replacementDetails, setReplacementDetails] = useState({
    motifs: [
      { motifRemplacement: "Décès", detail: "Mort lors d'un accident" },
      { motifRemplacement: "Démission", detail: "Salaire insuffisant" },
      { motifRemplacement: "Licenciement", detail: "Toujours en Retard" },
    ],
    dateSurvenance: "",
    nomPrenomsTitulaire: "",
    datePriseService: "",
  });

  const [suggestions, setSuggestions] = useState({
    typeContrat: ["CDD", "CDI", "Intérimaire"],
    direction: ["Direction Générale", "Direction Technique", "Direction Administrative", "Direction Commerciale"],
    departement: ["Département IT", "Département RH", "Département Finance", "Département Marketing", "Département Production"],
    service: ["Service Développement", "Service Support", "Service Comptabilité", "Service Ventes"],
    superieurHierarchique: ["Jean Dupont", "Marie Martin", "Pierre Durant", "Sophie Moreau"],
    fonctionSuperieur: ["Directeur", "Manager", "Chef de Service", "Superviseur", "Responsable"],
    motifRemplacement: ["Décès", "Démission", "Licenciement", "Retraite", "Mutation", "Promotion"],
  });

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

  // Fonction pour ajouter une nouvelle ligne de motif
  const handleAddMotif = () => {
    setReplacementDetails((prev) => ({
      ...prev,
      motifs: [...prev.motifs, { motifRemplacement: "", detail: "" }],
    }));
  };

  // Fonction pour supprimer une ligne de motif
  const handleRemoveMotif = (index) => {
    setReplacementDetails((prev) => ({
      ...prev,
      motifs: prev.motifs.filter((_, i) => i !== index),
    }));
  };

  // Fonction pour mettre à jour un motif ou un détail
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

      formData.append("RecruitmentRequestId", "");
      formData.append("Description", description);
      formData.append("Status", "En Cours");
      formData.append("RequesterId", "USR001");
      formData.append("RequestDate", new Date().toISOString());
      formData.append("ApprovalDate", new Date().toISOString());

      formData.append("PositionInfo", JSON.stringify(positionInfo));
      formData.append("ContractType", JSON.stringify(contractType));
      formData.append("Attachment", JSON.stringify(attachment));
      formData.append("WorkSite", JSON.stringify(workSite));
      formData.append("RecruitmentMotive", recruitmentMotive);
      formData.append("ReplacementDetails", JSON.stringify(replacementDetails));
      formData.append("PostCreation", JSON.stringify({ justification: description, datePriseService: replacementDetails.datePriseService }));

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
      motifs: [
        { motifRemplacement: "Décès", detail: "Mort lors d'un accident" },
        { motifRemplacement: "Démission", detail: "Salaire insuffisant" },
        { motifRemplacement: "Licenciement", detail: "Toujours en Retard" },
      ],
      dateSurvenance: "",
      nomPrenomsTitulaire: "",
      datePriseService: "",
    });
  };

  // Rendu du premier formulaire
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
                  placeholder="Saisir ou sélectionner..."
                  disabled={isSubmitting}
                  onAddNew={(value) => handleAddNewSuggestion("typeContrat", value)}
                  fieldType="typeContrat"
                  fieldLabel="typeContrat"
                  addNewRoute="/recruitment/contract-type-form"
                />
              </td>
              <th className="form-label-cell">
                <label className="form-label">Durée (si CDD, VIE ou intérimaire)</label>
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
                  placeholder="Saisir ou sélectionner..."
                  disabled={isSubmitting}
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
                  placeholder="Saisir ou sélectionner..."
                  disabled={isSubmitting}
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
                  placeholder="Saisir ou sélectionner..."
                  disabled={isSubmitting}
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
                  showAddOption={false}
                  placeholder="Saisir ou sélectionner..."
                  disabled={isSubmitting}
                  onAddNew={(value) => handleAddNewSuggestion("superieurHierarchique", value)}
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
                  showAddOption={false}
                  placeholder="Saisir ou sélectionner..."
                  disabled={isSubmitting}
                  onAddNew={(value) => handleAddNewSuggestion("fonctionSuperieur", value)}
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
                <select
                  value={workSite.selectedSite}
                  onChange={(e) => setWorkSite((prev) => ({ ...prev, selectedSite: e.target.value }))}
                  className="form-input"
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionner...</option>
                  <option value="ivato">Ivato - Antananarivo</option>
                  <option value="fascene">Fascène - Nosy Be</option>
                </select>
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

  // Rendu du second formulaire
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
            <tr>
              <td className="form-label-cell">Remplacement d'un employé</td>
              <td className="form-input-cell">
                <input
                  type="radio"
                  name="recruitmentMotive"
                  value="replacement"
                  checked={recruitmentMotive === "replacement"}
                  onChange={(e) => setRecruitmentMotive(e.target.value)}
                  disabled={isSubmitting}
                />
              </td>
            </tr>
            <tr>
              <td className="form-label-cell">Dotation prévue au budget</td>
              <td className="form-input-cell">
                <input
                  type="radio"
                  name="recruitmentMotive"
                  value="budget"
                  checked={recruitmentMotive === "budget"}
                  onChange={(e) => setRecruitmentMotive(e.target.value)}
                  disabled={isSubmitting}
                />
              </td>
            </tr>
            <tr>
              <td className="form-label-cell">Création de poste</td>
              <td className="form-input-cell">
                <input
                  type="radio"
                  name="recruitmentMotive"
                  value="creation"
                  checked={recruitmentMotive === "creation"}
                  onChange={(e) => setRecruitmentMotive(e.target.value)}
                  disabled={isSubmitting}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {recruitmentMotive === "replacement" && (
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
                        placeholder="Saisir ou sélectionner..."
                        disabled={isSubmitting}
                        onAddNew={(value) => handleAddNewSuggestion("motifRemplacement", value)}
                        fieldType="motifRemplacement"
                        fieldLabel="motif"
                      />
                    </td>
                    <

td className="form-input-cell">
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
                        disabled={isSubmitting}
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

      {recruitmentMotive === "creation" && (
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