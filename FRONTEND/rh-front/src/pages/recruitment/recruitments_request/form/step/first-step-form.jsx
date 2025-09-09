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

export default function FirstStepForm({
  formData,
  setFormData,
  errors,
  setErrors,
  suggestions,
  isLoading,
  isSubmitting,
  handleAddNewSuggestion,
}) {
  return (
    <>
      <FormSectionTitle>Informations du Poste</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Intitulé du poste</FormLabelRequired>
              <FormInput
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
                disabled={isSubmitting}
                className={errors.intitule ? "input-error" : ""}
              />
              {errors.intitule && <ErrorMessage>Veuillez saisir un intitulé de poste.</ErrorMessage>}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Effectif</FormLabelRequired>
              <FormInput
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
                disabled={isSubmitting}
                className={errors.effectif ? "input-error" : ""}
              />
              {errors.effectif && <ErrorMessage>Veuillez saisir un effectif valide.</ErrorMessage>}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>

      <FormSectionTitle>Nature de l'Engagement Contractuel</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Type de contrat</FormLabelRequired>
              <StyledAutoCompleteInput
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
                onAddNew={(value) => handleAddNewSuggestion("typeContrat", value)}
                fieldType="typeContrat"
                fieldLabel="type de contrat"
                addNewRoute="/recruitment/contract-type-form"
                className={errors.typeContrat ? "error" : ""}
              />
              {errors.typeContrat && <ErrorMessage>Veuillez sélectionner un type de contrat.</ErrorMessage>}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabel>Durée (si CDD, CTT ou intérimaire)</FormLabel>
              <FormInput
                type="text"
                value={formData.contractType.duree}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contractType: { ...prev.contractType, duree: e.target.value },
                  }))
                }
                placeholder="Ex : 6 mois, 1 an"
                disabled={isSubmitting}
              />
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>

      <FormSectionTitle>Rattachement du Poste</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Direction</FormLabelRequired>
              <StyledAutoCompleteInput
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
                onAddNew={(value) => handleAddNewSuggestion("direction", value)}
                fieldType="direction"
                fieldLabel="direction"
                addNewRoute="/direction/direction-form"
                className={errors.direction ? "error" : ""}
              />
              {errors.direction && <ErrorMessage>Veuillez sélectionner une direction.</ErrorMessage>}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Département</FormLabelRequired>
              <StyledAutoCompleteInput
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
                disabled={isSubmitting || isLoading.departments || !formData.attachment.direction}
                onAddNew={(value) => handleAddNewSuggestion("departement", value)}
                fieldType="departement"
                fieldLabel="département"
                addNewRoute="/direction/department-form"
                className={errors.departement ? "error" : ""}
              />
              {errors.departement && <ErrorMessage>Veuillez sélectionner un département.</ErrorMessage>}
            </FormFieldCell>
          </FormRow>
          <FormRow className="dual-field-row">
            <FormFieldCell>
              <FormLabelRequired>Service</FormLabelRequired>
              <StyledAutoCompleteInput
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
                disabled={isSubmitting || isLoading.services || !formData.attachment.departement}
                onAddNew={(value) => handleAddNewSuggestion("service", value)}
                fieldType="service"
                fieldLabel="service"
                addNewRoute="/direction/service-form"
                className={errors.service ? "error" : ""}
              />
              {errors.service && <ErrorMessage>Veuillez sélectionner un service.</ErrorMessage>}
            </FormFieldCell>
            <FormFieldCell>
              <FormLabelRequired>Supérieur hiérarchique direct</FormLabelRequired>
              <StyledAutoCompleteInput
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
                  isLoading.users
                    ? "Chargement..."
                    : suggestions.superieurHierarchique.length === 0
                    ? "Aucun supérieur disponible"
                    : "Saisir ou sélectionner..."
                }
                disabled={isSubmitting || isLoading.users || !formData.attachment.service}
                showAddOption={false}
                fieldType="superieurHierarchique"
                fieldLabel="supérieur hiérarchique"
                className={errors.superieurHierarchique ? "error" : ""}
              />
              {errors.superieurHierarchique && <ErrorMessage>Veuillez sélectionner un supérieur hiérarchique.</ErrorMessage>}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Fonction du Supérieur hiérarchique</FormLabelRequired>
              <FormInput
                type="text"
                value={formData.attachment.fonctionSuperieur}
                disabled={true}
                readOnly
                placeholder="Sélectionnez un supérieur hiérarchique"
                className={errors.fonctionSuperieur ? "input-error" : ""}
              />
              {errors.fonctionSuperieur && <ErrorMessage>Veuillez sélectionner un supérieur hiérarchique valide.</ErrorMessage>}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>

      <FormSectionTitle>Site de Travail</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Site</FormLabelRequired>
              <StyledAutoCompleteInput
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
                className={errors.selectedSite ? "error" : ""}
              />
              {errors.selectedSite && <ErrorMessage>Veuillez sélectionner un site.</ErrorMessage>}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>
    </>
  );
}