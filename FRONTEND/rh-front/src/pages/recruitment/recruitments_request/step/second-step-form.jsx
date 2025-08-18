import * as FaIcons from "react-icons/fa";
import RichTextEditor from "components/rich-text-editor";
import AutoCompleteInput from "components/auto-complete-input";

export default function SecondStepForm({
  formData,
  setFormData,
  errors,
  setErrors,
  recruitmentReasons,
  suggestions,
  setSuggestions,
  isLoading,
  isSubmitting,
  handleMotifChange,
  handleAddMotif,
  handleRemoveMotif,
  handlePrevious,
  handleSubmit,
  handleAddNewSuggestion,
}) {
  return (
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
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, recruitmentMotive: e.target.value }));
                      setErrors((prev) => ({ ...prev, recruitmentMotive: false }));
                    }}
                    disabled={isSubmitting || isLoading.recruitmentReasons}
                    className={errors.recruitmentMotive ? "input-error" : ""}
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
                        onAddNew={(value) => handleAddNewSuggestion(value)}
                        fieldType="motifRemplacement"
                        fieldLabel="motif"
                        className={errors.motifs[index]?.motifRemplacement ? "input-error" : ""}
                      />
                    </td>
                    <td className="form-input-cell">
                      <input
                        type="text"
                        value={motif.detail}
                        onChange={(e) => handleMotifChange(index, "detail", e.target.value)}
                        placeholder="Détail du motif..."
                        className={`form-input ${errors.motifs[index]?.detail ? "input-error" : ""}`}
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
                  <label className="form-label form-label-required">Nom atras prénoms de l'ancien(ne) titulaire</label>
                </th>
                <td className="form-input-cell">
                  <input
                    type="text"
                    value={formData.replacementDetails.nomPrenomsTitulaire}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        replacementDetails: { ...prev.replacementDetails, nomPrenomsTitulaire: e.target.value },
                      }));
                      setErrors((prev) => ({ ...prev, nomPrenomsTitulaire: false }));
                    }}
                    placeholder="Entrer le nom"
                    className={`form-input ${errors.nomPrenomsTitulaire ? "input-error" : ""}`}
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
                      onChange={(value) => {
                        setFormData((prev) => ({ ...prev, description: value }));
                        setErrors((prev) => ({ ...prev, description: false }));
                      }}
                      disabled={isSubmitting}
                      className={errors.description ? "input-error" : ""}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        replacementDetails: { ...prev.replacementDetails, datePriseService: e.target.value },
                      }));
                      setErrors((prev) => ({ ...prev, datePriseService: false }));
                    }}
                    className={`form-input ${errors.datePriseService ? "input-error" : ""}`}
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
}