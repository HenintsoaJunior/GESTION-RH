import * as FaIcons from "react-icons/fa";
import AutoCompleteInput from "components/auto-complete-input";

export default function FirstStepForm({
  formData,
  setFormData,
  errors,
  setErrors,
  suggestions,
  isLoading,
  isSubmitting,
  handleFileChange,
  handleNext,
  handleReset,
  handleAddNewSuggestion,
}) {
  return (
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
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      positionInfo: { ...prev.positionInfo, intitule: e.target.value },
                    }));
                    setErrors((prev) => ({ ...prev, intitule: false }));
                  }}
                  placeholder="Ex: Développeur Full Stack"
                  className={`form-input ${errors.intitule ? "input-error" : ""}`}
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
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      positionInfo: { ...prev.positionInfo, effectif: parseInt(e.target.value) || 1 },
                    }));
                    setErrors((prev) => ({ ...prev, effectif: false }));
                  }}
                  min="1"
                  className={`form-input ${errors.effectif ? "input-error" : ""}`}
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
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      attachment: { ...prev.attachment, typeContrat: value },
                    }));
                    setErrors((prev) => ({ ...prev, typeContrat: false }));
                  }}
                  suggestions={suggestions.typeContrat}
                  placeholder={
                    isLoading.contractTypes
                      ? "Chargement..."
                      : suggestions.typeContrat.length === 0
                      ? "Aucune suggestion disponible"
                      : "Saisir ou sélectionner..."
                  }
                  disabled={isSubmitting || isLoading.contractTypes}
                  onAddNew={(value) => handleAddNewSuggestion(value)}
                  fieldType="typeContrat"
                  fieldLabel="type de contrat"
                  addNewRoute="/recruitment/contract-type-form"
                  className={errors.typeContrat ? "input-error" : ""}
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
          </tbody>
        </table>
      </div>

      <div className="form-section">
        <h3>Rattachement du Poste</h3>
        <table className="form-table">
          <tbody>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Direction</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={formData.attachment.direction}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      attachment: { ...prev.attachment, direction: value },
                    }));
                    setErrors((prev) => ({ ...prev, direction: false }));
                  }}
                  suggestions={suggestions.direction}
                  placeholder={
                    isLoading.directions
                      ? "Chargement..."
                      : suggestions.direction.length === 0
                      ? "Aucune suggestion disponible"
                      : "Saisir ou sélectionner..."
                  }
                  disabled={isSubmitting || isLoading.directions}
                  onAddNew={(value) => handleAddNewSuggestion(value)}
                  fieldType="direction"
                  fieldLabel="direction"
                  addNewRoute="/direction/direction-form"
                  className={errors.direction ? "input-error" : ""}
                />
              </td>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Département</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={formData.attachment.departement}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      attachment: { ...prev.attachment, departement: value },
                    }));
                    setErrors((prev) => ({ ...prev, departement: false }));
                  }}
                  suggestions={suggestions.departement}
                  placeholder={
                    isLoading.departments
                      ? "Chargement..."
                      : suggestions.departement.length === 0
                      ? "Aucune suggestion disponible"
                      : "Saisir ou sélectionner..."
                  }
                  disabled={isSubmitting || isLoading.departments}
                  onAddNew={(value) => handleAddNewSuggestion(value)}
                  fieldType="departement"
                  fieldLabel="département"
                  addNewRoute="/direction/department-form"
                  className={errors.departement ? "input-error" : ""}
                />
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Service</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={formData.attachment.service}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      attachment: { ...prev.attachment, service: value },
                    }));
                    setErrors((prev) => ({ ...prev, service: false }));
                  }}
                  suggestions={suggestions.service}
                  placeholder={
                    isLoading.services
                      ? "Chargement..."
                      : suggestions.service.length === 0
                      ? "Aucune suggestion disponible"
                      : "Saisir ou sélectionner..."
                  }
                  disabled={isSubmitting || isLoading.services}
                  onAddNew={(value) => handleAddNewSuggestion(value)}
                  fieldType="service"
                  fieldLabel="service"
                  addNewRoute="/direction/service-form"
                  className={errors.service ? "input-error" : ""}
                />
              </td>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Supérieur hiérarchique direct</label>
              </th>
              <td className="form-input-cell">
                <AutoCompleteInput
                  value={formData.attachment.superieurHierarchique}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      attachment: { ...prev.attachment, superieurHierarchique: value },
                    }));
                    setErrors((prev) => ({ ...prev, superieurHierarchique: false }));
                  }}
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
                  className={errors.superieurHierarchique ? "input-error" : ""}
                />
              </td>
            </tr>
            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">Fonction du Supérieur hiérarchique</label>
              </th>
              <td className="form-input-cell" colSpan="3">
                <AutoCompleteInput
                  value={formData.attachment.fonctionSuperieur}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      attachment: { ...prev.attachment, fonctionSuperieur: value },
                    }));
                    setErrors((prev) => ({ ...prev, fonctionSuperieur: false }));
                  }}
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
                  className={errors.fonctionSuperieur ? "input-error" : ""}
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
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      workSite: { ...prev.workSite, selectedSite: value },
                    }));
                    setErrors((prev) => ({ ...prev, selectedSite: false }));
                  }}
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
                  className={errors.selectedSite ? "input-error" : ""}
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
}