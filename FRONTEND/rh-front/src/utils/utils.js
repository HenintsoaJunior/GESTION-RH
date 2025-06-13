/**
 * Parse les données en gérant les valeurs vides ou absentes selon le type.
 * @param {any} data - Les données à parser (objet, tableau, ou primitif).
 * @param {Object} [typeHints] - Indices sur les types attendus pour les champs (ex: { salary: 'double', vacancyCount: 'int' }).
 * @returns {any} - Les données parsées avec des valeurs par défaut appropriées.
 */
function parseData(data, typeHints = {}) {
  // Si les données sont null ou undefined, retourner null
  if (data === null || data === undefined) {
    return null;
  }

  // Gestion des tableaux
  if (Array.isArray(data)) {
    return data.map(item => parseData(item, typeHints));
  }

  // Gestion des objets
  if (typeof data === 'object') {
    const parsed = {};
    for (const [key, value] of Object.entries(data)) {
      // Vérifier si un type spécifique est défini dans typeHints
      const expectedType = typeHints[key];

      if (value === null || value === undefined) {
        parsed[key] = getDefaultValue(expectedType);
      } else if (expectedType === 'string') {
        parsed[key] = typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
      } else if (expectedType === 'int') {
        parsed[key] = Number.isInteger(Number(value)) ? Number(value) : 0;
      } else if (expectedType === 'double') {
        parsed[key] = isNaN(Number(value)) ? 0.0 : Number(value);
      } else if (expectedType === 'date') {
        parsed[key] = value && !isNaN(new Date(value).getTime()) ? new Date(value).toISOString() : null;
      } else if (expectedType === 'boolean') {
        parsed[key] = typeof value === 'boolean' ? value : null;
      } else if (typeof value === 'object') {
        // Parser récursivement les objets imbriqués
        parsed[key] = parseData(value, typeHints[key] || {});
      } else {
        // Type non spécifié : conserver la valeur si non vide, sinon null
        parsed[key] = typeof value === 'string' && value.trim() === '' ? null : value;
      }
    }
    return parsed;
  }

  // Gestion des valeurs primitives (non objets, non tableaux)
  if (typeof data === 'string') {
    return data.trim() === '' ? null : data.trim();
  }

  return data;
}

/**
 * Retourne une valeur par défaut basée sur le type spécifié.
 * @param {string} type - Le type attendu ('string', 'int', 'double', 'date', 'boolean').
 * @returns {any} - La valeur par défaut pour le type.
 */
function getDefaultValue(type) {
  switch (type) {
    case 'string':
      return null;
    case 'int':
      return 0;
    case 'double':
      return 0.0;
    case 'date':
      return null;
    case 'boolean':
      return null;
    default:
      return null;
  }
}

/**
 * Formate une date en format local (fr-FR par défaut).
 * @param {string|Date} date - La date à formater.
 * @param {Object} [options] - Options de formatage (ex: { dateStyle: 'medium' }).
 * @returns {string|null} - La date formatée ou null si invalide.
 */
function formatDate(date, options = { dateStyle: 'medium' }) {
  if (!date || isNaN(new Date(date).getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat('fr-FR', options).format(new Date(date));
}

/**
 * Nettoie un objet de filtres en supprimant les clés avec des valeurs vides.
 * @param {Object} filters - L'objet de filtres à nettoyer.
 * @returns {Object} - L'objet de filtres nettoyé.
 */
function cleanFilters(filters) {
  const cleaned = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Valide si un objet de filtres contient au moins une valeur non vide.
 * @param {Object} filters - L'objet de filtres à valider.
 * @returns {boolean} - True si au moins un filtre est non vide.
 */
function hasActiveFilters(filters) {
  return Object.values(filters).some(value => value !== '' && value !== null && value !== undefined);
}

export { parseData, getDefaultValue, formatDate, cleanFilters, hasActiveFilters };