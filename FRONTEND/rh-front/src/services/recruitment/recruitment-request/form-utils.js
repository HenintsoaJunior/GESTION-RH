export const errorMessagesMap = {
  intitule: "L'intitulé du poste est requis.",
  effectif: "L'effectif doit être supérieur ou égal à 1.",
  typeContrat: "Le type de contrat est requis.",
  direction: "La direction est requise.",
  departement: "Le département est requis.",
  service: "Le service est requis.",
  superieurHierarchique: "Le supérieur hiérarchique direct est requis.",
  fonctionSuperieur: "La fonction du supérieur hiérarchique est requise.",
  selectedSite: "Le site de travail est requis.",
  recruitmentMotive: "Le motif de recrutement est requis.",
  description: "La description du nouveau poste est requise.",
  nomPrenomsTitulaire: "Le nom de l'ancien titulaire est requis.",
  datePriseService: "La date de prise de service est requise.",
  motifs: "Tous les motifs de remplacement doivent être remplis.",
};

export const validateFirstStep = (formData, setErrors, showValidationModal) => {
  const { positionInfo, attachment, workSite } = formData;

  const requiredFields = {
    intitule: !positionInfo.intitule,
    effectif: positionInfo.effectif < 1,
    typeContrat: !attachment.typeContrat,
    direction: !attachment.direction,
    departement: !attachment.departement,
    service: !attachment.service,
    superieurHierarchique: !attachment.superieurHierarchique,
    fonctionSuperieur: !attachment.fonctionSuperieur,
    selectedSite: !workSite.selectedSite,
  };

  const newErrors = {
    intitule: requiredFields.intitule,
    effectif: requiredFields.effectif,
    typeContrat: requiredFields.typeContrat,
    direction: requiredFields.direction,
    departement: requiredFields.departement,
    service: requiredFields.service,
    superieurHierarchique: requiredFields.superieurHierarchique,
    fonctionSuperieur: requiredFields.fonctionSuperieur,
    selectedSite: requiredFields.selectedSite,
    recruitmentMotive: false,
    description: false,
    nomPrenomsTitulaire: false,
    datePriseService: false,
    motifs: [],
  };

  setErrors(newErrors);

  const errorMessages = Object.keys(requiredFields)
    .filter((key) => requiredFields[key])
    .map((key) => errorMessagesMap[key]);

  if (errorMessages.length > 0) {
    showValidationModal("error", errorMessages.join("\n"));
    return false;
  }

  return true;
};

export const validateSecondStep = (formData, setErrors, showValidationModal) => {
  const { recruitmentMotive, description, replacementDetails } = formData;

  const requiredFields = {
    recruitmentMotive: !recruitmentMotive,
    description: recruitmentMotive === "Création d'un nouveau poste" && !description,
    nomPrenomsTitulaire:
      recruitmentMotive === "Remplacement d'un employé" && !replacementDetails.nomPrenomsTitulaire,
    datePriseService: !replacementDetails.datePriseService,
  };

  const motifErrors = replacementDetails.motifs.map((motif) => ({
    motifRemplacement: !motif.motifRemplacement,
    detail: !motif.detail,
  }));

  const newErrors = {
    intitule: false,
    effectif: false,
    typeContrat: false,
    direction: false,
    departement: false,
    service: false,
    superieurHierarchique: false,
    fonctionSuperieur: false,
    selectedSite: false,
    recruitmentMotive: requiredFields.recruitmentMotive,
    description: requiredFields.description,
    nomPrenomsTitulaire: requiredFields.nomPrenomsTitulaire,
    datePriseService: requiredFields.datePriseService,
    motifs: motifErrors,
  };

  setErrors(newErrors);

  const errorMessages = Object.keys(requiredFields)
    .filter((key) => requiredFields[key])
    .map((key) => errorMessagesMap[key]);

  if (
    recruitmentMotive === "Remplacement d'un employé" &&
    motifErrors.some((motif) => motif.motifRemplacement || motif.detail)
  ) {
    errorMessages.push(errorMessagesMap.motifs);
  }

  if (errorMessages.length > 0) {
    showValidationModal("error", `Veuillez corriger les erreurs suivantes :\n${errorMessages.join("\n")}`);
    return false;
  }

  return true;
};