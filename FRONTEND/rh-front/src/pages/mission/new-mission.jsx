import "styles/generic-form-styles.css";
import AutoCompleteInput from "components/auto-complete-input";

const NewMissionForm = ({ formData, fieldErrors, isSubmitting, isLoading, regionDisplayNames, handleInputChange, handleAddNewSuggestion }) => {
  return (
    <div className="form-section">
      <h3 className="form-section-title text-lg font-semibold mb-4">Détails de la Mission</h3>
      <table className="form-table w-full border-collapse">
        <tbody>
          <tr className="form-row">
            <td className="form-field-cell p-2 align-top">
              <label htmlFor="missionTitle" className="form-label form-label-required block mb-2">
                Intitulé de la Mission
              </label>
              <input
                id="missionTitle"
                type="text"
                name="missionTitle"
                value={formData.missionTitle}
                onChange={handleInputChange}
                placeholder="Saisir le titre de la mission..."
                className={`form-table w-full ${fieldErrors.Name ? "input-error" : ""}`}
                disabled={isSubmitting || isLoading.regions}
              />
              {fieldErrors.Name && (
                <span className="error-message block mt-1">{fieldErrors.Name.join(", ")}</span>
              )}
            </td>
          </tr>
          <tr className="form-row">
            <td className="form-field-cell p-2 align-top">
              <label htmlFor="description" className="form-label block mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Saisir une description..."
                className="form-table w-full"
                rows="4"
                disabled={isSubmitting || isLoading.regions}
              />
            </td>
          </tr>
          <tr className="form-row">
            <td className="form-field-cell p-2 align-top">
              <label htmlFor="location" className="form-label block mb-2">
                Lieu
              </label>
              <AutoCompleteInput
                value={formData.location}
                onChange={(value) => {
                  const realValue = value.includes('/') ? value.split('/')[0] : value;
                  handleInputChange({ target: { name: 'location', value: realValue } });
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
                className={`form-table autocomplete-input w-full ${fieldErrors.LieuId ? "input-error" : ""}`}
              />
              {fieldErrors.LieuId && (
                <span className="error-message block mt-1">{fieldErrors.LieuId.join(", ")}</span>
              )}
            </td>
          </tr>
          <tr className="form-row">
            <td className="form-field-cell p-2 align-top">
              <label htmlFor="startDate" className="form-label form-label-required block mb-2">
                Date de début
              </label>
              <input
                id="startDate"
                type="date"
                name="startDate"
                value={formData.startDate || ""}
                onChange={handleInputChange}
                className={`form-table w-full ${fieldErrors.StartDate ? "input-error" : ""}`}
                disabled={isSubmitting || isLoading.regions}
              />
              {fieldErrors.StartDate && (
                <span className="error-message block mt-1">{fieldErrors.StartDate.join(", ")}</span>
              )}
            </td>
          </tr>
          <tr className="form-row">
            <td className="form-field-cell p-2 align-top">
              <label htmlFor="endDate" className="form-label form-label-required block mb-2">
                Date de fin
              </label>
              <input
                id="endDate"
                type="date"
                name="endDate"
                value={formData.endDate || ""}
                onChange={handleInputChange}
                className={`form-table w-full ${fieldErrors.EndDate ? "input-error" : ""}`}
                disabled={isSubmitting || isLoading.regions}
              />
              {fieldErrors.EndDate && (
                <span className="error-message block mt-1">{fieldErrors.EndDate.join(", ")}</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default NewMissionForm;