export const cleanString = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .trim() // Supprime les espaces au début et à la fin
    .replace(/\s+/g, ' ') // Remplace les espaces multiples par un seul espace
    .replace(/[\u00A0\u2000-\u200B\u2028-\u2029]/g, ' ') // Remplace les espaces insécables et autres espaces Unicode
    .trim(); // Trim final au cas où
};

// Fonction pour normaliser les chaînes pour la comparaison
export const normalizeForSearch = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return cleanString(str)
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, ''); // Supprime les diacritiques
};