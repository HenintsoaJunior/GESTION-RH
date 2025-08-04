import "styles/generic-form-styles.css";
import AutoCompleteInput from "components/auto-complete-input";

const ExistingMissionForm = ({ formData, fieldErrors, isSubmitting, isLoading, suggestions, handleInputChange }) => {
  return (
    <div className="form-section">
      <h3 className="form-section-title text-lg font-semibold mb-4">Sélection de la Mission</h3>
      <table className="form-table w-full border-collapse">
        <tbody>
          {/* Mission and Mission Title in one row with two columns */}
          <tr className="form-row dual-field-row">
            <td className="form-field-cell p-2 align-top">
              <label className="form-label form-label-required block mb-2">Mission</label>
              <AutoCompleteInput
                value={formData.missionSearch || ""} // Use a separate search field in formData
                onChange={(value) => {
                  handleInputChange({ target: { name: 'missionSearch', value } });
                  const selectedMission = suggestions.mission.find((m) => m.displayName === value);
                  handleInputChange({
                    target: { name: 'missionId', value: selectedMission ? selectedMission.id : "" },
                  });
                }}
                suggestions={suggestions.mission.map((m) => m.displayName)}
                placeholder={
                  suggestions.mission.length === 0
                    ? "Aucune mission disponible"
                    : "Saisir ou sélectionner une mission..."
                }
                disabled={isSubmitting || isLoading.missions}
                showAddOption={false}
                fieldType="mission"
                fieldLabel="mission"
                className={`form-table autocomplete-input w-full ${fieldErrors.missionId ? "input-error" : ""}`}
              />
              {fieldErrors.missionId && (
                <span className="error-message block mt-1">{fieldErrors.missionId.join(", ")}</span>
              )}
            </td>
            <td className="form-field-cell p-2 align-top">
              <label className="form-label block mb-2">Intitulé de la Mission</label>
              <input
                type="text"
                value={formData.missionTitle}
                className="form-table w-full bg-gray-100"
                disabled
                readOnly
              />
            </td>
          </tr>

          {/* Other fields in separate rows, each spanning the full table width */}
          <tr className="form-row">
            <td className="form-field-cell p-2" colSpan="2">
              <label className="form-label block mb-2">Description</label>
              <textarea
                value={formData.description}
                className="form-table w-full bg-gray-100"
                rows="4"
                disabled
                readOnly
              />
            </td>
          </tr>

          <tr className="form-row">
            <td className="form-field-cell p-2" colSpan="2">
              <label className="form-label block mb-2">Lieu</label>
              <input
                type="text"
                value={formData.location}
                className="form-table w-full bg-gray-100"
                disabled
                readOnly
              />
            </td>
          </tr>

          <tr className="form-row">
            <td className="form-field-cell p-2" colSpan="2">
              <label className="form-label block mb-2">Date de début</label>
              <input
                type="date"
                value={formData.startDate || ""}
                className="form-table w-full bg-gray-100"
                disabled
                readOnly
              />
            </td>
          </tr>

          <tr className="form-row">
            <td className="form-field-cell p-2" colSpan="2">
              <label className="form-label block mb-2">Date de fin</label>
              <input
                type="date"
                value={formData.endDate || ""}
                className="form-table w-full bg-gray-100"
                disabled
                readOnly
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ExistingMissionForm;