// Composant pour le formulaire de la troisième étape (exigences de l'offre d'emploi)
import * as FaIcons from "react-icons/fa";
import {
  FormSectionTitle,
  FormTable,
  FormRow,
  FormFieldCell,
  FormLabelRequired,
  FormInput,
  ErrorMessage,
  RemoveItem,
  AddButton,
  InputButtonContainer,
} from "styles/generaliser/form-container";

export default function ThirdStepForm({
  formData,
  setFormData,
  errors,
  isSubmitting,
  handleAddQuality,
  handleRemoveQuality,
  handleQualityChange,
  handleAddSkill,
  handleRemoveSkill,
  handleSkillChange,
  handleAddFormation,
  handleRemoveFormation,
  handleFormationChange,
  handleAddExperience,
  handleRemoveExperience,
  handleExperienceChange,
  handleAddLanguage, // Nouveau gestionnaire pour ajouter une langue
  handleRemoveLanguage, // Nouveau gestionnaire pour supprimer une langue
  handleLanguageChange, // Nouveau gestionnaire pour modifier une langue
}) {
  // Vérifications défensives pour éviter les erreurs si les données ne sont pas définies
  const formations = formData?.requirements?.formations || [""];
  const experiences = formData?.requirements?.experiences || [""];
  const personalQualities = formData?.requirements?.personalQualities || [""];
  const skills = formData?.requirements?.skills || [""];
  const languages = formData?.requirements?.requiredLanguages || [""]; // Ajout de la vérification pour les langues

  return (
    <>
      {/* Section pour les formations */}
      <FormSectionTitle>Exigences</FormSectionTitle>
      <FormTable>
        <tbody>
          {formations.map((formation, index) => (
            <FormRow key={index}>
              <FormFieldCell>
                <FormLabelRequired>Formation {index + 1}</FormLabelRequired>
                <InputButtonContainer>
                  <FormInput
                    type="text"
                    value={formation}
                    onChange={(e) => handleFormationChange(index, e.target.value)}
                    placeholder="Ex: Minimum Baccalauréat +2 en Gestion ou Logistique"
                    disabled={isSubmitting}
                    className={errors.requirements?.formations?.[index] ? "input-error" : ""}
                  />
                  {/* Bouton pour supprimer une formation */}
                  <RemoveItem
                    type="button"
                    onClick={() => handleRemoveFormation(index)}
                    disabled={isSubmitting || formations.length === 1}
                    title="Supprimer la formation"
                  >
                    <FaIcons.FaTrash />
                  </RemoveItem>
                </InputButtonContainer>
              </FormFieldCell>
            </FormRow>
          ))}
          {/* Affichage des erreurs pour les formations */}
          {errors.requirements?.formations && (
            <ErrorMessage>Toutes les formations doivent être remplies.</ErrorMessage>
          )}
        </tbody>
      </FormTable>
      {/* Bouton pour ajouter une nouvelle formation */}
      <AddButton
        type="button"
        onClick={handleAddFormation}
        disabled={isSubmitting}
        title="Ajouter une formation"
      >
        <FaIcons.FaPlus /> Ajouter une formation
      </AddButton>

      {/* Section pour les expériences */}
      <FormTable>
        <tbody>
          {experiences.map((experience, index) => (
            <FormRow key={index}>
              <FormFieldCell>
                <FormLabelRequired>Expérience {index + 1}</FormLabelRequired>
                <InputButtonContainer>
                  <FormInput
                    type="text"
                    value={experience}
                    onChange={(e) => handleExperienceChange(index, e.target.value)}
                    placeholder="Ex: Minimum 02 ans d’expériences professionnelles à un poste similaire"
                    disabled={isSubmitting}
                    className={errors.requirements?.experiences?.[index] ? "input-error" : ""}
                  />
                  {/* Bouton pour supprimer une expérience */}
                  <RemoveItem
                    type="button"
                    onClick={() => handleRemoveExperience(index)}
                    disabled={isSubmitting || experiences.length === 1}
                    title="Supprimer l'expérience"
                  >
                    <FaIcons.FaTrash />
                  </RemoveItem>
                </InputButtonContainer>
              </FormFieldCell>
            </FormRow>
          ))}
          {/* Affichage des erreurs pour les expériences */}
          {errors.requirements?.experiences && (
            <ErrorMessage>Toutes les expériences doivent être remplies.</ErrorMessage>
          )}
        </tbody>
      </FormTable>
      {/* Bouton pour ajouter une nouvelle expérience */}
      <AddButton
        type="button"
        onClick={handleAddExperience}
        disabled={isSubmitting}
        title="Ajouter une expérience"
      >
        <FaIcons.FaPlus /> Ajouter une expérience
      </AddButton>

      {/* Section pour les qualités personnelles */}
      <FormTable>
        <tbody>
          {personalQualities.map((quality, index) => (
            <FormRow key={index}>
              <FormFieldCell>
                <FormLabelRequired>Qualité Personnelle {index + 1}</FormLabelRequired>
                <InputButtonContainer>
                  <FormInput
                    type="text"
                    value={quality}
                    onChange={(e) => handleQualityChange(index, e.target.value)}
                    placeholder="Ex: Rigueur"
                    disabled={isSubmitting}
                    className={errors.requirements?.personalQualities?.[index] ? "input-error" : ""}
                  />
                  {/* Bouton pour supprimer une qualité */}
                  <RemoveItem
                    type="button"
                    onClick={() => handleRemoveQuality(index)}
                    disabled={isSubmitting || personalQualities.length === 1}
                    title="Supprimer la qualité"
                  >
                    <FaIcons.FaTrash />
                  </RemoveItem>
                </InputButtonContainer>
              </FormFieldCell>
            </FormRow>
          ))}
          {/* Affichage des erreurs pour les qualités */}
          {errors.requirements?.personalQualities && (
            <ErrorMessage>Toutes les qualités personnelles doivent être remplies.</ErrorMessage>
          )}
        </tbody>
      </FormTable>
      {/* Bouton pour ajouter une nouvelle qualité */}
      <AddButton
        type="button"
        onClick={handleAddQuality}
        disabled={isSubmitting}
        title="Ajouter une qualité personnelle"
      >
        <FaIcons.FaPlus /> Ajouter une qualité personnelle
      </AddButton>

      {/* Section pour les compétences */}
      <FormTable>
        <tbody>
          {skills.map((skill, index) => (
            <FormRow key={index}>
              <FormFieldCell>
                <FormLabelRequired>Compétence {index + 1}</FormLabelRequired>
                <InputButtonContainer>
                  <FormInput
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder="Ex: Maîtrise de MS Office"
                    disabled={isSubmitting}
                    className={errors.requirements?.skills?.[index] ? "input-error" : ""}
                  />
                  {/* Bouton pour supprimer une compétence */}
                  <RemoveItem
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    disabled={isSubmitting || skills.length === 1}
                    title="Supprimer la compétence"
                  >
                    <FaIcons.FaTrash />
                  </RemoveItem>
                </InputButtonContainer>
              </FormFieldCell>
            </FormRow>
          ))}
          {/* Affichage des erreurs pour les compétences */}
          {errors.requirements?.skills && (
            <ErrorMessage>Toutes les compétences doivent être remplies.</ErrorMessage>
          )}
        </tbody>
      </FormTable>
      {/* Bouton pour ajouter une nouvelle compétence */}
      <AddButton
        type="button"
        onClick={handleAddSkill}
        disabled={isSubmitting}
        title="Ajouter une compétence"
      >
        <FaIcons.FaPlus /> Ajouter une compétence
      </AddButton>

      {/* Section pour les langues requises */}
      <FormTable>
        <tbody>
          {languages.map((language, index) => (
            <FormRow key={index}>
              <FormFieldCell>
                <FormLabelRequired>Langue requise {index + 1}</FormLabelRequired>
                <InputButtonContainer>
                  <FormInput
                    type="text"
                    value={language}
                    onChange={(e) => handleLanguageChange(index, e.target.value)}
                    placeholder="Ex: Français courant"
                    disabled={isSubmitting}
                    className={errors.requirements?.requiredLanguages?.[index] ? "input-error" : ""}
                  />
                  {/* Bouton pour supprimer une langue */}
                  <RemoveItem
                    type="button"
                    onClick={() => handleRemoveLanguage(index)}
                    disabled={isSubmitting || languages.length === 1}
                    title="Supprimer la langue"
                  >
                    <FaIcons.FaTrash />
                  </RemoveItem>
                </InputButtonContainer>
              </FormFieldCell>
            </FormRow>
          ))}
          {/* Affichage des erreurs pour les langues */}
          {errors.requirements?.requiredLanguages && (
            <ErrorMessage>Toutes les langues requises doivent être remplies.</ErrorMessage>
          )}
        </tbody>
      </FormTable>
      {/* Bouton pour ajouter une nouvelle langue */}
      <AddButton
        type="button"
        onClick={handleAddLanguage}
        disabled={isSubmitting}
        title="Ajouter une langue requise"
      >
        <FaIcons.FaPlus /> Ajouter une langue requise
      </AddButton>
    </>
  );
}