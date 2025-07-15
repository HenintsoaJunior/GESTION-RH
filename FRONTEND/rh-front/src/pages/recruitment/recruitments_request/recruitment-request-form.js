import "../../../styles/generic-form-styles.css";
import { useState } from "react";
import { BASE_URL } from "../../../config/apiConfig";
import RichTextEditor from "../../../components/RichTextEditor";
import Alert from "../../../components/Alert";
import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "../../../components/AutoCompleteInput";

// Composant principal du formulaire
export default function RecruitmentRequestForm() {
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

  const [suggestions, setSuggestions] = useState({
    typeContrat: ["CDD", "CDI", "Intérimaire"],
    direction: ["Direction Générale", "Direction Technique", "Direction Administrative", "Direction Commerciale"],
    departement: ["Département IT", "Département RH", "Département Finance", "Département Marketing", "Département Production"],
    service: ["Service Développement", "Service Support", "Service Comptabilité", "Service Ventes"],
    superieurHierarchique: ["Jean Dupont", "Marie Martin", "Pierre Durant", "Sophie Moreau"],
    fonctionSuperieur: ["Directeur", "Manager", "Chef de Service", "Superviseur", "Responsable"],
  });

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleAddNewSuggestion = (field, value) => {
    setSuggestions((prev) => ({
      ...prev,
      [field]: [...prev[field], value],
    }));
    showAlert("success", `"${value}" ajouté aux suggestions"`);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
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
        event.target.reset();
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
        <h2 className="table-title">Demande de recrutement</h2>
      </div>

      <form id="recruitmentRequestForm" className="generic-form" onSubmit={handleSubmit}>
        {/* Section Informations du Poste */}
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
                      setPositionInfo((prev) => ({ ...prev, effectif: parseInt(e.target.value) }))
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

        {/* Section Nature de l'Engagement Contractuel */}
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

        {/* Section Rattachement du Poste */}
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

        {/* Section Site de Travail */}
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

        {/* Section Description */}
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
                  placeholder="Décrivez les besoins de recrutement en détail..."
                  onChange={setDescription}
                  disabled={isSubmitting}
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Section Pièces jointes */}
        <table className="form-table">
          <tbody>
            <tr>
              <th className="form-label-cell">
                <label className="form-label">Pièces jointes</label>
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

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
            title="Soumettre la demande"
          >
            {isSubmitting ? "Envoi en cours..." : "Suivant"}
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