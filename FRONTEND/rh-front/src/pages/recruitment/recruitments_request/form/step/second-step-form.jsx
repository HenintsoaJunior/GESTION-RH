import * as FaIcons from "react-icons/fa";
import {
  FormSectionTitle,
  FormTable,
  FormRow,
  FormFieldCell,
  FormLabel,
  FormLabelRequired,
  FormInput,
  StyledAutoCompleteInput,
  ErrorMessage,
} from "styles/generaliser/form-container";
import RichTextEditor from "components/rich-text-editor";

export default function SecondStepForm({
  formData,
  setFormData,
  errors,
  setErrors,
  recruitmentReasons,
  suggestions,
  isLoading,
  isSubmitting,
  handleMotifChange,
  handleAddMotif,
  handleRemoveMotif,
  handleAddNewSuggestion,
}) {
  return (
    <>
      <FormSectionTitle>Motif du Recrutement</FormSectionTitle>
      <FormTable>
        <tbody>
          {recruitmentReasons.map((reason) => (
            <FormRow key={reason.recruitmentReasonId}>
              <FormFieldCell>
                <FormLabel>{reason.name}</FormLabel>
              </FormFieldCell>
              <FormFieldCell>
                <FormInput
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
                {errors.recruitmentMotive && <ErrorMessage>Veuillez sélectionner un motif de recrutement.</ErrorMessage>}
              </FormFieldCell>
            </FormRow>
          ))}
        </tbody>
      </FormTable>

      {formData.recruitmentMotive === "Remplacement d'un employé" && (
        <>
          <FormSectionTitle>Détails du Motif du remplacement</FormSectionTitle>
          <FormTable>
            <tbody>
              {formData.replacementDetails.motifs.map((motif, index) => (
                <FormRow key={index}>
                  <FormFieldCell>
                    <FormLabelRequired>Motif</FormLabelRequired>
                    <StyledAutoCompleteInput
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
                      onAddNew={(value) => handleAddNewSuggestion("motifRemplacement", value)}
                      fieldType="motifRemplacement"
                      fieldLabel="motif"
                      className={errors.motifs[index]?.motifRemplacement ? "error" : ""}
                    />
                    {errors.motifs[index]?.motifRemplacement && (
                      <ErrorMessage>Veuillez sélectionner un motif de remplacement.</ErrorMessage>
                    )}
                  </FormFieldCell>
                  <FormFieldCell>
                    <FormLabelRequired>Détail</FormLabelRequired>
                    <FormInput
                      type="text"
                      value={motif.detail}
                      onChange={(e) => handleMotifChange(index, "detail", e.target.value)}
                      placeholder="Détail du motif..."
                      disabled={isSubmitting}
                      className={errors.motifs[index]?.detail ? "input-error" : ""}
                    />
                    {errors.motifs[index]?.detail && <ErrorMessage>Veuillez fournir un détail pour le motif.</ErrorMessage>}
                  </FormFieldCell>
                  <FormFieldCell>
                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => handleRemoveMotif(index)}
                      disabled={isSubmitting || formData.replacementDetails.motifs.length === 1}
                      title="Supprimer la ligne"
                    >
                      <FaIcons.FaTrash className="w-4 h-4" />
                    </button>
                  </FormFieldCell>
                </FormRow>
              ))}
            </tbody>
          </FormTable>
          <button
            type="button"
            className="add-btn"
            onClick={handleAddMotif}
            disabled={isSubmitting}
            title="Ajouter une ligne"
          >
            <FaIcons.FaPlus className="w-4 h-4" /> Ajouter un motif
          </button>

          <FormTable>
            <tbody>
              <FormRow className="dual-field-row">
                <FormFieldCell>
                  <FormLabelRequired>Date de survenance</FormLabelRequired>
                  <FormInput
                    type="date"
                    value={formData.replacementDetails.dateSurvenance}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        replacementDetails: { ...prev.replacementDetails, dateSurvenance: e.target.value },
                      }))
                    }
                    disabled={isSubmitting}
                    className={errors.dateSurvenance ? "input-error" : ""}
                  />
                  {errors.dateSurvenance && <ErrorMessage>Veuillez sélectionner une date de survenance.</ErrorMessage>}
                </FormFieldCell>
                <FormFieldCell>
                  <FormLabelRequired>Nom et prénoms de l'ancien(ne) titulaire</FormLabelRequired>
                  <FormInput
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
                    disabled={isSubmitting}
                    className={errors.nomPrenomsTitulaire ? "input-error" : ""}
                  />
                  {errors.nomPrenomsTitulaire && (
                    <ErrorMessage>Veuillez saisir le nom et prénoms de l'ancien titulaire.</ErrorMessage>
                  )}
                </FormFieldCell>
              </FormRow>
            </tbody>
          </FormTable>
        </>
      )}

      {formData.recruitmentMotive === "Création d'un nouveau poste" && (
        <>
          <FormSectionTitle>Explications pour la création de poste</FormSectionTitle>
          <FormTable>
            <tbody>
              <FormRow>
                <FormFieldCell colSpan="2">
                  <FormLabelRequired>Description détaillée</FormLabelRequired>
                  <RichTextEditor
                    placeholder="Décrivez le poste en détail..."
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, description: value }));
                      setErrors((prev) => ({ ...prev, description: false }));
                    }}
                    disabled={isSubmitting}
                    className={errors.description ? "input-error" : ""}
                  />
                  {errors.description && <ErrorMessage>Veuillez fournir une description détaillée.</ErrorMessage>}
                </FormFieldCell>
              </FormRow>
            </tbody>
          </FormTable>
        </>
      )}

      {formData.recruitmentMotive && (
        <>
          <FormSectionTitle>Planification</FormSectionTitle>
          <FormTable>
            <tbody>
              <FormRow>
                <FormFieldCell colSpan="2">
                  <FormLabelRequired>Date de prise de service souhaitée</FormLabelRequired>
                  <FormInput
                    type="date"
                    value={formData.replacementDetails.datePriseService}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        replacementDetails: { ...prev.replacementDetails, datePriseService: e.target.value },
                      }));
                      setErrors((prev) => ({ ...prev, datePriseService: false }));
                    }}
                    disabled={isSubmitting}
                    className={errors.datePriseService ? "input-error" : ""}
                  />
                  {errors.datePriseService && (
                    <ErrorMessage>Veuillez sélectionner une date de prise de service.</ErrorMessage>
                  )}
                </FormFieldCell>
              </FormRow>
            </tbody>
          </FormTable>
          <p className="form-note">Rappel : la durée d'un processus normal de sélection est de 8 semaines</p>
        </>
      )}
    </>
  );
}