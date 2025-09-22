import {
  FormSectionTitle,
  FormTable,
  FormRow,
  FormFieldCell,
  FormLabelRequired,
  FormInput,
  ErrorMessage,
} from "styles/generaliser/form-container";

export default function FirstStepForm({
  formData,
  setFormData,
  errors,
  isSubmitting,
  hasContractDuration, // Receive hasContractDuration from hook
}) {
  const updateGeneralInfo = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      generalInfo: { ...prev.generalInfo, [field]: value },
    }));
  };

  return (
    <>
      <FormSectionTitle>Informations Générales</FormSectionTitle>
      <FormTable>
        <tbody>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Titre du Poste</FormLabelRequired>
              <FormInput
                type="text"
                value={formData.generalInfo.title}
                onChange={(e) => updateGeneralInfo('title', e.target.value)}
                placeholder="Ex: Acheteur(se)"
                disabled={isSubmitting}
                className={errors.generalInfo?.title ? "input-error" : ""}
              />
              {errors.generalInfo?.title && <ErrorMessage>Veuillez saisir le titre du poste.</ErrorMessage>}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Rattachement Hiérarchique</FormLabelRequired>
              <FormInput
                type="text"
                value={formData.generalInfo.hierarchicalAttachment}
                onChange={(e) => updateGeneralInfo('hierarchicalAttachment', e.target.value)}
                placeholder="Ex: Chef(fe) de Service Achats"
                disabled={isSubmitting}
                className={errors.generalInfo?.hierarchicalAttachment ? "input-error" : ""}
              />
              {errors.generalInfo?.hierarchicalAttachment && <ErrorMessage>Veuillez saisir le rattachement hiérarchique.</ErrorMessage>}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Lieu de Travail</FormLabelRequired>
              <FormInput
                type="text"
                value={formData.generalInfo.workplace}
                onChange={(e) => updateGeneralInfo('workplace', e.target.value)}
                placeholder="Ex: Ivato - Antananarivo"
                disabled={isSubmitting}
                className={errors.generalInfo?.workplace ? "input-error" : ""}
              />
              {errors.generalInfo?.workplace && <ErrorMessage>Veuillez saisir le lieu de travail.</ErrorMessage>}
            </FormFieldCell>
          </FormRow>
          {hasContractDuration && (
            <FormRow>
              <FormFieldCell colSpan="2">
                <FormLabelRequired>Durée du Poste</FormLabelRequired>
                <FormInput
                  type="text"
                  value={formData.generalInfo.duration}
                  onChange={(e) => updateGeneralInfo('duration', e.target.value)}
                  placeholder="Ex: 6 mois"
                  disabled={isSubmitting}
                  className={errors.generalInfo?.duration ? "input-error" : ""}
                />
                {errors.generalInfo?.duration && <ErrorMessage>Veuillez saisir la durée du poste.</ErrorMessage>}
              </FormFieldCell>
            </FormRow>
          )}
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Type de Contrat</FormLabelRequired>
              <FormInput
                type="text"
                value={formData.generalInfo.contractType}
                onChange={(e) => updateGeneralInfo('contractType', e.target.value)}
                placeholder="Ex: Contrat à Durée Déterminée"
                disabled={isSubmitting}
                className={errors.generalInfo?.contractType ? "input-error" : ""}
              />
              {errors.generalInfo?.contractType && <ErrorMessage>Veuillez saisir le type de contrat.</ErrorMessage>}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Date de Publication</FormLabelRequired>
              <FormInput
                type="datetime-local"
                value={formData.generalInfo.publicationDate}
                onChange={(e) => updateGeneralInfo('publicationDate', e.target.value)}
                disabled={isSubmitting}
                className={errors.generalInfo?.publicationDate ? "input-error" : ""}
              />
              {errors.generalInfo?.publicationDate && <ErrorMessage>Veuillez saisir une date de publication valide.</ErrorMessage>}
            </FormFieldCell>
          </FormRow>
          <FormRow>
            <FormFieldCell colSpan="2">
              <FormLabelRequired>Date Limite</FormLabelRequired>
              <FormInput
                type="datetime-local"
                value={formData.generalInfo.deadlineDate}
                onChange={(e) => updateGeneralInfo('deadlineDate', e.target.value)}
                disabled={isSubmitting}
                className={errors.generalInfo?.deadlineDate ? "input-error" : ""}
              />
              {errors.generalInfo?.deadlineDate && <ErrorMessage>Veuillez saisir une date limite valide.</ErrorMessage>}
            </FormFieldCell>
          </FormRow>
        </tbody>
      </FormTable>
    </>
  );
}